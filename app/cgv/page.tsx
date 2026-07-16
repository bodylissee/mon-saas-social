export default function CGVPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0F172A' }}>
      <div className="max-w-3xl mx-auto px-6 py-16 text-gray-300">
        <h1 className="text-3xl font-bold text-white mb-2">Conditions Générales de Vente</h1>
        <p className="text-sm mb-10" style={{ color: '#64748B' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="space-y-8 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 1 — Objet</h2>
            <p>
              Les présentes conditions générales de vente (CGV) régissent l'utilisation du
              service PostIA, plateforme de génération et de publication automatisée de contenus
              sur les réseaux sociaux, éditée par [NOM / DÉNOMINATION], micro-entreprise
              immatriculée sous le SIRET 332 612 720 00026. Toute souscription à un abonnement
              PostIA implique l'acceptation pleine et entière des présentes CGV.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 2 — Description du service</h2>
            <p>
              PostIA permet à ses utilisateurs de générer des contenus (textes et images) à
              l'aide d'outils d'intelligence artificielle, de connecter leurs comptes de réseaux
              sociaux, et de publier ou programmer des publications de manière automatisée. Le
              service est fourni « en l'état » et peut évoluer dans le temps.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 3 — Abonnements et tarifs</h2>
            <p>
              PostIA propose plusieurs formules d'abonnement mensuel, dont les caractéristiques
              et tarifs sont indiqués sur la page de tarification du site. Les prix sont indiqués
              en euros. En tant que micro-entreprise bénéficiant de la franchise en base de TVA,
              la TVA n'est pas applicable (article 293 B du CGI). L'éditeur se réserve le droit de
              modifier ses tarifs à tout moment ; les nouveaux tarifs s'appliqueront à compter du
              renouvellement suivant de l'abonnement.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 4 — Paiement</h2>
            <p>
              Le paiement des abonnements s'effectue en ligne par carte bancaire via notre
              prestataire de paiement sécurisé Stripe. L'abonnement est reconduit
              automatiquement chaque mois, par prélèvement sur le moyen de paiement enregistré,
              jusqu'à résiliation par l'utilisateur. Aucune donnée bancaire n'est stockée par
              PostIA.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 5 — Durée et résiliation</h2>
            <p>
              L'abonnement est souscrit pour une durée d'un mois, renouvelable par tacite
              reconduction. L'utilisateur peut résilier son abonnement à tout moment depuis son
              espace client ou en contactant contact@postia.cloud. La résiliation prend effet à
              la fin de la période d'abonnement en cours ; aucun remboursement au prorata n'est
              effectué pour la période entamée, sauf disposition légale contraire.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 6 — Droit de rétractation</h2>
            <p>
              Conformément à l'article L221-28 du Code de la consommation, pour les contenus
              numériques fournis immédiatement, l'utilisateur reconnaît qu'en commençant à
              utiliser le service dès la souscription, il renonce à son droit de rétractation de
              14 jours. À défaut d'utilisation, le droit de rétractation de 14 jours s'applique
              pour les consommateurs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 7 — Obligations de l'utilisateur</h2>
            <p>
              L'utilisateur s'engage à utiliser PostIA dans le respect des lois en vigueur et des
              conditions d'utilisation des réseaux sociaux tiers qu'il connecte. Il est seul
              responsable des contenus qu'il génère, programme et publie. Est notamment interdite
              toute utilisation du service à des fins illégales, trompeuses, diffamatoires,
              haineuses ou portant atteinte aux droits de tiers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 8 — Responsabilité</h2>
            <p>
              PostIA est un outil d'assistance ; l'utilisateur conserve le contrôle et la
              responsabilité des publications réalisées. L'éditeur ne saurait être tenu
              responsable des contenus générés par l'intelligence artificielle, d'éventuelles
              interruptions de service liées aux plateformes tierces (réseaux sociaux,
              prestataires techniques), ni des conséquences des publications effectuées par
              l'utilisateur. La responsabilité de l'éditeur est limitée au montant de l'abonnement
              payé par l'utilisateur au cours du mois concerné.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 9 — Données personnelles</h2>
            <p>
              Le traitement des données personnelles est décrit dans notre{' '}
              <a href="/confidentialite" style={{ color: '#2563EB' }}>Politique de confidentialité</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Article 10 — Droit applicable et litiges</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution
              amiable sera recherchée en priorité. À défaut, le consommateur peut recourir
              gratuitement à un médiateur de la consommation. Les tribunaux français seront seuls
              compétents.
            </p>
          </div>
        </section>

        <div className="mt-12">
          <a href="/" style={{ color: '#2563EB' }}>← Retour à l'accueil</a>
        </div>
      </div>
    </main>
  )
}