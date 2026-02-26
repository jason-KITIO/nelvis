import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, orgId, context } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "models/gemini-2.5-flash",
      systemInstruction: `Tu es un assistant juridique intelligent spécialisé dans la création d'entreprise en France.

TON RÔLE :
- Discuter naturellement avec l'utilisateur pour comprendre son projet d'entreprise
- Extraire automatiquement les informations nécessaires de la conversation
- Générer les documents juridiques (annonces légales, statuts, etc.) dès que tu as assez d'informations
- Ne jamais forcer un questionnaire rigide, mais adapter la conversation au contexte

INFORMATIONS À COLLECTER (si pertinent pour le document demandé) :
- Forme juridique (SAS, SARL, SASU, etc.)
- Dénomination sociale
- Capital social
- Adresse du siège social
- Objet social (activité)
- Durée de la société
- Identité et adresse du/des dirigeant(s)
- RCS et date de signature

COMPORTEMENT :
1. Engage une conversation naturelle et fluide
2. Pose des questions de clarification uniquement si nécessaire
3. Déduis les informations du contexte quand c'est possible
4. Propose de générer le document dès que tu as les infos essentielles
5. Réponds en JSON avec cette structure :
{
  "message": "<ton message conversationnel>",
  "extractedData": { /* données extraites */ },
  "canGenerateDocument": true/false,
  "missingInfo": ["liste des infos manquantes si besoin"],
  "documentContent": "<contenu du document si canGenerateDocument=true>"
}

Quand tu as toutes les infos nécessaires, génère le document complet (annonce légale, statuts, etc.) dans documentContent et mets canGenerateDocument à true.

RÉPONDS UNIQUEMENT EN JSON VALIDE.`
    });

    // Construire l'historique complet de la conversation
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const result = await model.generateContent({
      contents: conversationHistory,
    });

    const response = await result.response;
    const aiResponse = response.text();

    return NextResponse.json({ message: aiResponse });

  } catch (error: unknown) {
    console.error('--- DIAGNOSTIC GEMINI ---');
    console.error('Error:', error);
    
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }

    return NextResponse.json(
      { error: 'Incapacité de joindre Gemini', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}