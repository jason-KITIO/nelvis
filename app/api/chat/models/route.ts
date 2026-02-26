import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    
    console.log('=== MODÈLES GEMINI DISPONIBLES ===');
    data.models?.forEach((model: { name: string; supportedGenerationMethods?: string[] }) => {
      console.log(`- ${model.name}`);
      console.log(`  Méthodes: ${model.supportedGenerationMethods?.join(', ')}`);
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
