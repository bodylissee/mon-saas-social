import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { theme, reseau, langue } = await req.json()

    const textResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Tu es un expert en marketing sur les réseaux sociaux avec 10 ans d'expérience.
        Crée un post ${reseau} viral sur le thème : "${theme}".
        Langue : ${langue || 'français'}.
        
        RÈGLES IMPORTANTES :
        - Commence par un hook accrocheur qui capte l'attention en 2 secondes
        - Donne des conseils CONCRETS, des chiffres précis, des exemples réels
        - Évite les généralités — sois spécifique et actionnable
        - Utilise un ton authentique et personnel, pas corporatif
        - Ajoute une question engageante à la fin pour provoquer des commentaires
        - Maximum 5 hashtags très ciblés (pas génériques)
        - Adapte le format au réseau : ${reseau === 'TikTok' ? 'court et punchy, max 150 mots' : reseau === 'LinkedIn' ? 'professionnel et storytelling, 200-300 mots' : 'engageant et visuel, 100-200 mots'}
        
        Réponds uniquement avec le texte du post, rien d'autre.`
      }]
    })

    const texte = textResponse.content[0].type === 'text'
      ? textResponse.content[0].text
      : ''

    const imageResponse = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: `Photographie réaliste et naturelle pour un post ${reseau} sur le thème : ${theme}. Style photo authentique, lumière naturelle, couleurs douces et réalistes, comme une vraie photo prise par un photographe professionnel. Pas de texte dans l'image, pas de style illustration ou cartoon.`,
      n: 1,
      size: '1024x1024',
    })

    const imageBase64 = imageResponse.data[0].b64_json
    const imageUrl = `data:image/png;base64,${imageBase64}`

    return NextResponse.json({ texte, imageUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}