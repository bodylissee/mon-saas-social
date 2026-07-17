// Utilitaires partagés pour le redimensionnement et l'upload d'images vers Zernio.
// Utilisés par /api/generate (upload immédiat après génération) et /api/publish
// (compat avec d'anciennes images encore en base64).

export const plateformeMap: { [key: string]: string } = {
  'TikTok': 'tiktok',
  'Instagram': 'instagram',
  'Facebook': 'facebook',
  'YouTube': 'youtube',
  'LinkedIn': 'linkedin',
  'X (Twitter)': 'twitter',
}

export const dimensionsParPlateforme: { [key: string]: { width: number; height: number } } = {
  instagram: { width: 1080, height: 1080 },
  tiktok: { width: 1080, height: 1920 },
  facebook: { width: 1200, height: 630 },
  linkedin: { width: 1200, height: 627 },
  youtube: { width: 1280, height: 720 },
  twitter: { width: 1200, height: 675 },
}

export function dimensionsPour(reseauOuPlateforme: string | null | undefined) {
  if (!reseauOuPlateforme) return { width: 1080, height: 1080 }
  const cle = plateformeMap[reseauOuPlateforme] || reseauOuPlateforme.toLowerCase()
  return dimensionsParPlateforme[cle] || { width: 1080, height: 1080 }
}

export async function resizeImageToBase64(
  base64: string,
  width: number,
  height: number
): Promise<string> {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const sharp = (await import('sharp')).default
  const resized = await sharp(buffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer()

  return `data:image/png;base64,${resized.toString('base64')}`
}

// Upload une image base64 vers Zernio, renvoie l'URL publique
export async function uploadImageToZernio(imageBase64: string): Promise<string> {
  const presignRes = await fetch('https://zernio.com/api/v1/media/presign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ZERNIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: 'post-image.png',
      contentType: 'image/png',
    }),
  })

  const presignData = await presignRes.json()
  const { uploadUrl, publicUrl } = presignData

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: buffer,
  })

  return publicUrl
}

// Redimensionne au format de la plateforme puis upload vers Zernio en une étape.
export async function redimensionnerEtUpload(
  imageBase64: string,
  reseauOuPlateforme: string | null | undefined
): Promise<string> {
  const dims = dimensionsPour(reseauOuPlateforme)
  const resized = await resizeImageToBase64(imageBase64, dims.width, dims.height)
  return uploadImageToZernio(resized)
}
