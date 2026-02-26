import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/create-password?token=${resetToken}`;

  console.log("📧 Configuration email:");
  console.log("  - From:", process.env.EMAIL_FROM);
  console.log("  - To:", email);
  console.log("  - Reset URL:", resetUrl);

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
    
    <div style="padding: 32px 32px 0 32px; text-align: center;">
      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Réinitialisation du mot de passe</h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Bonjour, <br><br>
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #002147; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
          Réinitialiser mon mot de passe
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 20px;">
        <strong>Note :</strong> Ce lien est valable pendant 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;">

      <p style="color: #9ca3af; font-size: 12px; line-height: 18px;">
        Si le bouton ne fonctionne pas, copiez et collez l'URL suivante dans votre navigateur :<br>
        <span style="color: #3b82f6; word-break: break-all;">${resetUrl}</span>
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © 2026 Votre Application. Tous droits réservés.
      </p>
    </div>
  </div>
</div>`,
  });

  console.log("✅ Résultat Resend:", result);
  return result;
}
