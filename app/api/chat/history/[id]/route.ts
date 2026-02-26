import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: params.id }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ messages: conversation.messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
