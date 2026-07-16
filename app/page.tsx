'use client'
import { useState } from 'react'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('E-commerce')

  const plans = [
    {
      name: "Starter", price: "9", desc: "Parfait pour débuter",
      reseaux: "1 réseau social", posts: "15 posts par mois",
      extras: ["Texte généré par IA", "Image générée par IA"],
      popular: false, priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    },
    {
      name: "Solo", price: "19", desc: "Pour les créateurs actifs",
      reseaux: "2 réseaux sociaux", posts: "60 posts par mois",
      extras: ["Texte généré par IA", "Image générée par IA"],
      popular: false, priceId: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID,
    },
    {
      name: "Pro", price: "29", desc: "Le plus populaire",
      reseaux: "3 réseaux sociaux", posts: "150 posts par mois",
      extras: ["Texte généré par IA", "Image générée par IA", "Statistiques"],
      popular: true, priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    },
    {
      name: "Business", price: "59", desc: "Pour les PME et agences",
      reseaux: "5 réseaux sociaux", posts: "400 posts par mois",
      extras: ["Texte généré par IA", "Image générée par IA", "Statistiques", "Support prioritaire"],
      popular: false, priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
    },
    {
      name: "Agency", price: "99", desc: "Multi-clients à grande échelle",
      reseaux: "10 réseaux sociaux", posts: "Posts illimités",
      extras: ["Texte généré par IA", "Image générée par IA", "Statistiques", "Support prioritaire", "Tableau de bord agence"],
      popular: false, priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID,
    },
  ]

  const exemples = {
    'E-commerce': [
      {
        reseau: 'Instagram',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop',
        texte: '🛍️ Notre nouvelle collection est là !\n\nDes pièces uniques, pensées pour toi. Qualité premium, prix accessible.\n\n✅ Livraison gratuite dès 50€\n✅ Retours 30 jours\n✅ Paiement sécurisé\n\nLien en bio 👆\n\n#Nouveauté #Mode #Shopping #Style #Collection',
        like: '2.4k', comment: '128',
      },
      {
        reseau: 'TikTok',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
        texte: '⚡ PROMO FLASH 24H !\n\n-30% sur TOUT le site 🔥\n\nCode : FLASH30\n\nDépêche-toi, les stocks sont limités !\n\n#Promo #Soldes #BonPlan #Shopping',
        like: '8.1k', comment: '342',
      },
      {
        reseau: 'Facebook',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        texte: '⭐ Ce que nos clients disent de nous :\n\n"Qualité exceptionnelle, livraison ultra rapide. Je recommande à 100% !" — Marie L.\n\nRejoins nos 50 000 clients satisfaits 🎯\n\n#AvisClients #Confiance #Qualité',
        like: '956', comment: '67',
      },
    ],
    'Fitness': [
      {
        reseau: 'Instagram',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
        texte: '💪 Il est 6h du matin.\n\nPendant que tout le monde dort, tu construis la meilleure version de toi-même.\n\nC\'est ça la différence entre ceux qui rêvent et ceux qui réalisent. 🔥\n\n#Motivation #Fitness #Sport #Mindset #Champion',
        like: '5.7k', comment: '234',
      },
      {
        reseau: 'TikTok',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop',
        texte: '🥗 Mes 3 règles nutrition qui ont tout changé :\n\n1️⃣ 2L d\'eau minimum par jour\n2️⃣ Protéines à chaque repas\n3️⃣ Légumes = 50% de l\'assiette\n\nSimple. Efficace. Durable. ✅\n\n#Nutrition #HealthyLife #Fitness',
        like: '12.3k', comment: '567',
      },
      {
        reseau: 'Facebook',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop',
        texte: '🏆 Exercice du jour : Squat challenge !\n\nSemaine 1 : 20 squats/jour\nSemaine 2 : 40 squats/jour\nSemaine 3 : 60 squats/jour\nSemaine 4 : 80 squats/jour\n\nTu relèves le défi ? 👇\n\n#Challenge #Sport #Squat',
        like: '1.2k', comment: '189',
      },
    ],
    'Food': [
      {
        reseau: 'Instagram',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
        texte: '🍕 Notre pizza du jour !\n\nPâte fraîche maison, ingrédients locaux, cuisson au feu de bois 🔥\n\nDéjeuner ou dîner, on vous attend !\n\nRéservation en bio 👆\n\n#Pizza #RestaurantFrançais #FoodPorn #Local',
        like: '3.8k', comment: '201',
      },
      {
        reseau: 'TikTok',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
        texte: '🥑 Recette healthy en 5 min !\n\nBol avocat-saumon :\n• 1 avocat\n• 100g saumon fumé\n• Riz complet\n• Sauce soja + citron\n\nProtéines, bons lipides, fibres = repas parfait ! 🎯\n\n#RecetteRapide #HealthyFood #Nutrition',
        like: '18.9k', comment: '892',
      },
      {
        reseau: 'Facebook',
        image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=400&fit=crop',
        texte: '☕ Notre petit-déjeuner du dimanche ✨\n\nCroissants frais, jus d\'orange pressé, café de spécialité...\n\nParce que le dimanche mérite le meilleur 🥐\n\nOuvert de 8h à 13h !\n\n#Brunch #CaféParis #WeekEnd',
        like: '2.1k', comment: '143',
      },
    ],
    'Mode': [
      {
        reseau: 'Instagram',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
        texte: '✨ La tenue parfaite pour ce printemps !\n\nLe combo blazer beige + jean taille haute = élégance décontractée au quotidien 🌸\n\nQuel est votre style préféré ?\n\n#OOTD #Mode #SpringFashion #Style #Outfit',
        like: '7.2k', comment: '445',
      },
      {
        reseau: 'TikTok',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
        texte: '💄 Skincare routine du matin en 5 étapes :\n\n1. Nettoyant doux\n2. Sérum vitamine C\n3. Crème hydratante\n4. SPF 50+\n5. Primer\n\n10 min pour une peau parfaite toute la journée ✨\n\n#Skincare #BeautyRoutine #Glow',
        like: '24.6k', comment: '1.2k',
      },
      {
        reseau: 'Facebook',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
        texte: '🌸 Nouvelle collection printemps-été 2026 !\n\nDes couleurs fraîches, des matières légères, des coupes flatteuses...\n\nDisponible en boutique et en ligne dès maintenant 🛍️\n\n#NouvelleCollection #Mode #Printemps2026',
        like: '1.8k', comment: '97',
      },
    ],
  }

  const categories = Object.keys(exemples)
  const activeExemples = exemples[activeCategory as keyof typeof exemples]

  const handleSubscribe = async (priceId: string | undefined, planName: string) => {
    if (!priceId) return
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userEmail: '' }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <main className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="text-xl font-bold">
          <span style={{ color: '#2563EB' }}>Post</span><span style={{ color: '#EC4899' }}>IA</span>
        </div>
        <div className="flex gap-4 items-center">
          <a href="/login" className="text-sm" style={{ color: '#94A3B8' }}>Connexion</a>
          <a href="#pricing" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }}>
            Voir les offres
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-6" style={{ background: '#1E293B', color: '#EC4899', border: '1px solid #EC489940' }}>
          ✦ Propulsé par l'intelligence artificielle
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
          Publie sur tous tes réseaux<br />
          <span style={{ color: '#2563EB' }}>automatiquement</span>
          <span style={{ color: 'white' }}>, </span>
          <span style={{ color: '#EC4899' }}>chaque jour</span>
        </h1>
        <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
          L'IA crée et publie tes posts sur TikTok, Instagram, Facebook et plus — sans que tu lèves le petit doigt.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="#pricing" className="px-8 py-4 rounded-xl text-lg font-medium" style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }}>
            Voir les tarifs
          </a>
          <a href="#pricing" className="px-8 py-4 rounded-xl text-lg font-medium" style={{ background: '#1E293B', color: 'white', border: '1px solid #334155' }}>
            Découvrir les offres
          </a>
        </div>
        <div className="flex gap-12 justify-center mt-16 flex-wrap">
          {[["500+", "Clients actifs", "#2563EB"], ["15", "Réseaux sociaux", "#EC4899"], ["50k+", "Posts publiés", "#2563EB"]].map(([num, label, color]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold" style={{ color }}>{num}</div>
              <div className="text-sm mt-1" style={{ color: '#64748B' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Galerie d'exemples */}
      <section className="py-16 px-6" style={{ background: '#0B1120' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'white' }}>
              Des posts qui <span style={{ color: '#EC4899' }}>convertissent vraiment</span>
            </h2>
            <p style={{ color: '#64748B' }}>Exemples réels de contenu généré par PostIA pour différents secteurs</p>
          </div>

          {/* Filtres catégories */}
          <div className="flex gap-3 justify-center mb-10 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-xl text-sm font-medium"
                style={activeCategory === cat
                  ? { background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }
                  : { background: '#1E293B', color: '#64748B', border: '1px solid #334155' }
                }
              >
                {cat === 'E-commerce' ? '🛍️ E-commerce' : cat === 'Fitness' ? '💪 Fitness' : cat === 'Food' ? '🍔 Food' : '👗 Mode'}
              </button>
            ))}
          </div>

          {/* Grille de posts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeExemples.map((ex, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid #334155' }}>
                {/* Header post */}
                <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #334155' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }}>
                    P
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">PostIA Demo</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>@postia_demo • {ex.reseau}</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-1 rounded-lg" style={{ background: '#0F172A', color: '#EC4899', border: '1px solid #EC489940' }}>
                    {ex.reseau}
                  </span>
                </div>

                {/* Image */}
                <img src={ex.image} alt="Post généré" className="w-full" style={{ height: '220px', objectFit: 'cover' }} />

                {/* Texte */}
                <div className="px-4 py-3">
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#94A3B8' }}>
                    {ex.texte.length > 150 ? ex.texte.substring(0, 150) + '...' : ex.texte}
                  </p>
                </div>

                {/* Engagement */}
                <div className="px-4 py-3 flex gap-4" style={{ borderTop: '1px solid #1E293B' }}>
                  <span className="text-xs" style={{ color: '#64748B' }}>❤️ {ex.like} j'aime</span>
                  <span className="text-xs" style={{ color: '#64748B' }}>💬 {ex.comment} commentaires</span>
                  <span className="text-xs ml-auto" style={{ color: '#2563EB' }}>✨ Généré par IA</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="#pricing" className="px-8 py-4 rounded-xl font-medium inline-block" style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }}>
              Choisir mon offre →
            </a>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'white' }}>
            Comment ça <span style={{ color: '#2563EB' }}>marche</span> ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choisis ton thème', desc: 'Sélectionne ta catégorie et ton thème du jour dans notre catalogue', icon: '🎯' },
              { step: '2', title: "L'IA crée ton contenu", desc: 'Claude génère un texte percutant et une image professionnelle', icon: '✨' },
              { step: '3', title: 'Publication automatique', desc: 'Ton post est publié sur tous tes réseaux à l\'heure que tu choisis', icon: '🚀' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-6" style={{ background: '#0B1120' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'white' }}>
            Des tarifs simples et transparents
          </h2>
          <p className="text-center mb-12" style={{ color: '#64748B' }}>
            Commencez petit, grandissez à votre rythme. Changez de plan à tout moment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-6 flex flex-col relative"
                style={{ background: '#1E293B', border: plan.popular ? '2px solid #EC4899' : '1px solid #334155' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }}>
                    ✦ Le plus populaire
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold" style={{ color: plan.popular ? '#EC4899' : 'white' }}>{plan.name}</h3>
                  <p className="text-sm" style={{ color: '#64748B' }}>{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: 'white' }}>{plan.price}€</span>
                  <span className="text-sm" style={{ color: '#64748B' }}>/mois</span>
                </div>
                <div className="mb-6 space-y-2 flex-1">
                  {[plan.reseaux, plan.posts, ...plan.extras].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <span style={{ color: '#2563EB' }}>✓</span> {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  className="text-center py-3 rounded-xl text-sm font-medium w-full"
                  style={plan.popular
                    ? { background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }
                    : { background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }
                  }
                >
                  Choisir {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div className="flex gap-6 flex-wrap justify-center text-sm">
            <a href="/mentions-legales" style={{ color: '#94A3B8' }}>Mentions légales</a>
            <a href="/cgv" style={{ color: '#94A3B8' }}>CGV</a>
            <a href="/confidentialite" style={{ color: '#94A3B8' }}>Politique de confidentialité</a>
            <a href="mailto:contact@postia.cloud" style={{ color: '#94A3B8' }}>Contact</a>
          </div>
          <div className="text-sm" style={{ color: '#334155' }}>
            © 2026 <span style={{ color: '#2563EB' }}>Post</span><span style={{ color: '#EC4899' }}>IA</span> — Tous droits réservés
          </div>
        </div>
      </footer>
    </main>
  )
}