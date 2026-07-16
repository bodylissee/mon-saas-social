export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0F172A' }}>
      <div className="max-w-3xl mx-auto px-6 py-16 text-gray-300">
        <h1 className="text-3xl font-bold text-white mb-2">Mentions légales</h1>
        <p className="text-sm mb-10" style={{ color: '#64748B' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="space-y-6 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Éditeur du site</h2>
            <p>
              Le site <strong>PostIA</strong> (accessible à l'adresse postia.cloud) est édité par :
            </p>
            <ul className="mt-2 space-y-1">
              <li><strong>[NOM / DÉNOMINATION]</strong>, entrepreneur individuel (micro-entreprise)</li>
              <li>Adresse : [ADRESSE]</li>
              <li>SIRET : 332 612 720 00026</li>
              <li>TVA : non applicable, article 293 B du CGI</li>
              <li>Email : contact@postia.cloud</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Directeur de la publication</h2>
            <p>[NOM / DÉNOMINATION]</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Hébergement</h2>
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong><br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
              Site web : vercel.com
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur le site PostIA (textes, logos, éléments
              graphiques, interface) sont protégés par le droit de la propriété intellectuelle
              et demeurent la propriété exclusive de l'éditeur, sauf mention contraire. Toute
              reproduction ou représentation, totale ou partielle, sans autorisation est
              interdite.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
            <p>
              Pour toute question, vous pouvez nous écrire à : contact@postia.cloud
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