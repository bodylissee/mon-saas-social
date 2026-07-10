export default function Home() {
  const plans = [
    {
      name: "Starter",
      price: "9",
      desc: "Parfait pour débuter",
      reseaux: "1 réseau social",
      posts: "1 post par jour",
      extras: ["Texte généré par IA", "Image générée par IA"],
      popular: false,
    },
    {
      name: "Solo",
      price: "19",
      desc: "Pour les créateurs actifs",
      reseaux: "2 réseaux sociaux",
      posts: "2 posts par jour",
      extras: ["Texte généré par IA", "Image générée par IA", "Vidéo générée par IA"],
      popular: false,
    },
    {
      name: "Pro",
      price: "29",
      desc: "Le plus populaire",
      reseaux: "3 réseaux sociaux",
      posts: "3 posts par jour",
      extras: ["Texte généré par IA", "Image générée par IA", "Vidéo générée par IA", "Statistiques"],
      popular: true,
    },
    {
      name: "Business",
      price: "59",
      desc: "Pour les PME et agences",
      reseaux: "6 réseaux sociaux",
      posts: "4 posts par jour",
      extras: ["Texte généré par IA", "Image générée par IA", "Vidéo générée par IA", "Statistiques", "Support prioritaire"],
      popular: false,
    },
    {
      name: "Agency",
      price: "99",
      desc: "Multi-clients à grande échelle",
      reseaux: "15 réseaux sociaux",
      posts: "5 posts par jour",
      extras: ["Texte généré par IA", "Image générée par IA", "Vidéo générée par IA", "Statistiques", "Support prioritaire", "Tableau de bord agence"],
      popular: false,
    },
  ];

  return (
    <main className="min-h-screen" style={{ background: "#0F172A" }}>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #1E293B" }}>
        <div className="text-xl font-bold">
          <span style={{ color: "#2563EB" }}>Post</span><span style={{ color: "#EC4899" }}>IA</span>
        </div>
        <div className="flex gap-4 items-center">
          <a href="/signup" className="text-sm" style={{ color: "#94A3B8" }}>Connexion</a>
          <a
            href="/signup"
            className="text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #DB2777)", color: "white" }}
          >
            Commencer gratuitement
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-6"
          style={{ background: "#1E293B", color: "#EC4899", border: "1px solid #EC489940" }}
        >
          ✦ Propulsé par l'intelligence artificielle
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: "white" }}>
          Publie sur tous tes réseaux<br />
          <span style={{ color: "#2563EB" }}>automatiquement</span>
          <span style={{ color: "white" }}>, </span>
          <span style={{ color: "#EC4899" }}>chaque jour</span>
        </h1>
        <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "#94A3B8" }}>
          L'IA crée et publie tes posts sur TikTok, Instagram, Facebook et plus — sans que tu lèves le petit doigt.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="/signup"
            className="px-8 py-4 rounded-xl text-lg font-medium"
            style={{ background: "linear-gradient(135deg, #2563EB, #DB2777)", color: "white" }}
          >
            Essayer gratuitement →
          </a>
          <a
            href="#pricing"
            className="px-8 py-4 rounded-xl text-lg font-medium"
            style={{ background: "#1E293B", color: "white", border: "1px solid #334155" }}
          >
            Voir les tarifs
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-12 justify-center mt-16 flex-wrap">
          {[
            ["500+", "Clients actifs", "#2563EB"],
            ["15", "Réseaux sociaux", "#EC4899"],
            ["50k+", "Posts publiés", "#2563EB"],
          ].map(([num, label, color]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold" style={{ color }}>{num}</div>
              <div className="text-sm mt-1" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: "white" }}>
            Des tarifs simples et transparents
          </h2>
          <p className="text-center mb-12" style={{ color: "#64748B" }}>
            Commencez petit, grandissez à votre rythme. Changez de plan à tout moment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-6 flex flex-col relative"
                style={{
                  background: plan.popular ? "#1E293B" : "#1E293B",
                  border: plan.popular ? "2px solid #EC4899" : "1px solid #334155",
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #2563EB, #DB2777)", color: "white" }}
                  >
                    ✦ Le plus populaire
                  </div>
                )}
                <div className="mb-4">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: plan.popular ? "#EC4899" : "white" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: "white" }}>{plan.price}€</span>
                  <span className="text-sm" style={{ color: "#64748B" }}>/mois</span>
                </div>
                <div className="mb-6 space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
                    <span style={{ color: "#2563EB" }}>✓</span> {plan.reseaux}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
                    <span style={{ color: "#2563EB" }}>✓</span> {plan.posts}
                  </div>
                  {plan.extras.map((extra) => (
                    <div key={extra} className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
                      <span style={{ color: "#EC4899" }}>✓</span> {extra}
                    </div>
                  ))}
                </div>
                <a
                  href="/signup"
                  className="text-center py-3 rounded-xl text-sm font-medium"
                  style={
                    plan.popular
                      ? { background: "linear-gradient(135deg, #2563EB, #DB2777)", color: "white" }
                      : { background: "#0F172A", color: "#94A3B8", border: "1px solid #334155" }
                  }
                >
                  Choisir {plan.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm" style={{ color: "#334155", borderTop: "1px solid #1E293B" }}>
        © 2026 <span style={{ color: "#2563EB" }}>Post</span><span style={{ color: "#EC4899" }}>IA</span> — Tous droits réservés
      </footer>
    </main>
  );
}