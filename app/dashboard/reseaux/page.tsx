"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X (Twitter)" },
];

type Account = {
  id: string;
  platform: string;
  username: string | null;
};

export default function ReseauxPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setErrorMessage(error);
    }

    fetch("/api/zernio/sync")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "#0F172A" }}>
      <header
        className="px-6 py-4 flex justify-between items-center"
        style={{ borderBottom: "1px solid #1E293B" }}
      >
        <div className="text-xl font-bold">
          <span style={{ color: "#2563EB" }}>Post</span>
          <span style={{ color: "#EC4899" }}>IA</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm"
          style={{ color: "#94A3B8" }}
        >
          ← Retour au dashboard
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Mes réseaux sociaux</h1>
        <p className="text-gray-400 mb-8">
          Connecte tes comptes pour publier automatiquement.
        </p>

        {errorMessage && (
          <p className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-8">
            {errorMessage}
          </p>
        )}

        <h2 className="text-xl font-semibold text-white mb-4">Comptes connectés</h2>
        {loading ? (
          <p className="text-gray-400 mb-8">Chargement...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-400 mb-8">
            Aucun compte connecté pour le moment.
          </p>
        ) : (
          <div className="space-y-3 mb-8">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-medium capitalize text-white">{a.platform}</p>
                  {a.username && (
                    <p className="text-sm text-gray-400">@{a.username}</p>
                  )}
                </div>
                <span className="text-green-400 text-sm">Connecté</span>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-xl font-semibold text-white mb-4">Ajouter un réseau</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <a
              key={p.id}
              href={"/api/zernio/connect?platform=" + p.id}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #2563EB, #DB2777)",
              }}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}