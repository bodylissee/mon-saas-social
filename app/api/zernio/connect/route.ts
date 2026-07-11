import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { limitesDuPlan } from "@/lib/limits";

const ZERNIO = "https://zernio.com/api/v1";

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform");
  if (!platform) {
    return NextResponse.json({ error: "platform manquant" }, { status: 400 });
  }

  // Vérifier que l'utilisateur est connecté
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

  // Récupérer le profil (plan + profil Zernio)
  const { data: profile } = await supabase
    .from("profiles")
    .select("zernio_profile_id, plan")
    .eq("id", user.id)
    .single();

  // VERIFICATION DE LA LIMITE DE RESEAUX
  const limites = limitesDuPlan(profile?.plan);

  const { count } = await supabase
    .from("social_accounts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= limites.reseaux) {
    const message =
      limites.reseaux === 0
        ? "Abonne-toi pour connecter tes réseaux sociaux."
        : `Ton plan permet ${limites.reseaux} réseau(x) connecté(s) maximum. Passe au plan supérieur pour en ajouter.`;
    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard/reseaux?error=${encodeURIComponent(message)}`
    );
  }

  let zernioProfileId = profile?.zernio_profile_id;

  if (!zernioProfileId) {
    const res = await fetch(`${ZERNIO}/profiles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZERNIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: `PostIA - ${user.email}` }),
    });
    const json = await res.json();
    zernioProfileId = json._id ?? json.profile?._id;

    if (!zernioProfileId) {
      return NextResponse.json({ error: "Création profil Zernio échouée", details: json }, { status: 500 });
    }

    await supabase
      .from("profiles")
      .update({ zernio_profile_id: zernioProfileId })
      .eq("id", user.id);
  }

  // Demander l'URL OAuth à Zernio
  const redirectUrl = `${req.nextUrl.origin}/dashboard/reseaux?connected=1`;
  const res = await fetch(
    `${ZERNIO}/connect/${platform}?profileId=${zernioProfileId}&redirect_url=${encodeURIComponent(redirectUrl)}`,
    { headers: { Authorization: `Bearer ${process.env.ZERNIO_API_KEY}` } }
  );
  const json = await res.json();
  const authUrl = json.authUrl ?? json.url;

  if (!authUrl) {
    return NextResponse.json({ error: "Erreur Zernio", details: json }, { status: 500 });
  }

  return NextResponse.redirect(authUrl);
}