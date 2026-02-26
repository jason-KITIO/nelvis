import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log('📧 Demande de reset pour:', email);

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('❌ User non trouvé:', email);
      return NextResponse.json({
        message: "Si l'email existe, un lien a été envoyé",
      });
    }

    console.log('✅ User trouvé:', user.id);
    const resetToken = await signToken(
      { userId: user.id, type: "reset" },
      "1h",
    );
    console.log('🔑 Token généré:', resetToken.substring(0, 20) + '...');

    console.log('📤 Envoi email à:', email);
    console.log('🔧 EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('🔧 RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Définie' : '❌ Manquante');
    
    await sendPasswordResetEmail(email, resetToken);
    console.log('✅ Email envoyé avec succès');

    return NextResponse.json({
      message: "Si l'email existe, un lien a été envoyé",
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
