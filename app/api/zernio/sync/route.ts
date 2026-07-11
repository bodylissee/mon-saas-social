import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const ZERNIO = "https://zernio.com/api/v1";

export async function GET() {
  // Utilisateur connecté ?
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  // Son profil Zernio
  const { data: profile } = await supabase
    .from("profiles")
    .select("zernio_profile_id")
    .eq("id", user.id)
    .single();

  const profileId = profile?.zernio_profile_id;
  if (!profileId) {
    return NextResponse.json({ accounts: [] });
  }

  // Récupérer les comptes chez Zernio
  const res = await fetch(`${ZERNIO}/accounts?profileId=${profileId}`, {
    headers: { Authorization: `Bearer ${process.env.ZERNIO_API_KEY}` },
  });
  const json = await res.json();
  const all = json.accounts ?? [];
  const accounts = all.filter((a: any) => {
    const pid = a.profileId?._id ?? a.profileId;
    return !pid || pid === profileId;
  });

  // Sauvegarder dans Supabase (client admin pour passer le RLS)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  for (const a of accounts) {
    await admin.from("social_accounts").upsert(
      {
        user_id: user.id,
        platform: a.platform,
        zernio_account_id: a._id,
        username: a.username ?? a.displayName ?? null,
      },
      { onConflict: "user_id,zernio_account_id" }
    );
  }

  // Renvoyer la liste depuis Supabase
  const { data: saved } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  return NextResponse.json({ accounts: saved ?? [] });
}