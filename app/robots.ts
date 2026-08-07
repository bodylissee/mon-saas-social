import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Espaces privés / techniques : inutile de les faire indexer par Google
      disallow: ['/api/', '/dashboard/', '/paiement-succes'],
    },
    sitemap: 'https://postia.cloud/sitemap.xml',
  }
}
