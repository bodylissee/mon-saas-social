export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen" style={{ background: '#0F172A' }}>
      <div className="max-w-3xl mx-auto px-6 py-16 text-gray-300">
        <h1 className="text-3xl font-bold text-white mb-2">Politique de confidentialité</h1>
        <p className="text-sm mb-10" style={{ color: '#64748B' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="space-y-8 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données est BELAHCEL SAMIA, micro-entreprise
              (SIRET 332 612 720 00026), éditeur du service PostIA. Pour toute question relative à
              vos données, vous pouvez nous contacter à : contact@postia.cloud.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">2. Données collectées</h2>
            <p>Dans le cadre de l'utilisation de PostIA, nous collectons :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Votre adresse email et vos identifiants de connexion</li>
              <li>Vos informations d'abonnement et de paiement (traitées par Stripe)</li>
              <li>Les contenus que vous générez et publiez via le service</li>
              <li>Les identifiants des comptes de réseaux sociaux que vous connectez</li>
              <li>Des données techniques d'usage (logs, statistiques de publication)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Créer et gérer votre compte</li>
              <li>Fournir et améliorer le service PostIA</li>
              <li>Gérer les abonnements et les paiements</li>
              <li>Publier vos contenus sur les réseaux sociaux connectés</li>
              <li>Vous envoyer des emails liés au service (bienvenue, confirmations)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">4. Base légale</h2>
            <p>
              Le traitement de vos données repose sur l'exécution du contrat (fourniture du
              service), votre consentement (connexion de vos réseaux sociaux), et le respect
              d'obligations légales (facturation).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">5. Sous-traitants et partenaires</h2>
            <p>
              Pour fournir le service, nous faisons appel à des prestataires tiers qui traitent
              certaines données pour notre compte :
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><strong>Supabase</strong> — hébergement de la base de données et authentification</li>
              <li><strong>Vercel</strong> — hébergement du site</li>
              <li><strong>Stripe</strong> — traitement des paiements</li>
              <li><strong>Resend</strong> — envoi des emails</li>
              <li><strong>Zernio</strong> — connexion et publication sur les réseaux sociaux</li>
              <li><strong>Anthropic</strong> et <strong>OpenAI</strong> — génération de contenus par IA</li>
            </ul>
            <p className="mt-2">
              Certains de ces prestataires peuvent être situés hors de l'Union européenne ; dans
              ce cas, des garanties appropriées encadrent les transferts de données.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">6. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant toute la durée de votre abonnement, puis
              supprimées ou anonymisées dans un délai raisonnable après la clôture de votre
              compte, sous réserve des obligations légales de conservation (notamment comptables).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">7. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
              d'effacement, de limitation, d'opposition et de portabilité de vos données. Vous
              pouvez exercer ces droits en nous écrivant à contact@postia.cloud. Vous avez
              également le droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">8. Cookies</h2>
            <p>
              PostIA utilise des cookies strictement nécessaires au fonctionnement du service
              (authentification, session). Aucun cookie publicitaire n'est utilisé sans votre
              consentement.
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