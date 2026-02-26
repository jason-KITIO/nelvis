import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId requis' }, { status: 400 });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { organisationId: orgId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, titre: true, updatedAt: true }
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orgId, conversationId, messages, titre } = await req.json();

    if (conversationId) {
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { messages, updatedAt: new Date() }
      });
      return NextResponse.json({ conversationId });
    } else {
      const conversation = await prisma.chatConversation.create({
        data: {
          organisationId: orgId,
          titre,
          messages
        }
      });
      return NextResponse.json({ conversationId: conversation.id });
    }
  } catch (error) {
    console.error('Save conversation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
