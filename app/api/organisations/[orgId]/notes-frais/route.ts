import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, checkOrgAccess } from "@/lib/middleware";
import { ocrService } from "@/services/ocr.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId);
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const notesDeFrais = await prisma.noteDeFrais.findMany({
    where: { organisationId: orgId },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { dateOcr: "desc" },
  });

  return NextResponse.json({ notesDeFrais });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId);
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "Fichier requis" },
      { status: 400 }
    );
  }

  // Vérifier le type de fichier
  const isExcel = file.name.match(/\.(xlsx|xls|csv)$/i);
  
  // Upload vers Cloudinary
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const timestamp = Math.round(Date.now() / 1000);
  const signature = await generateSignature(timestamp, orgId);

  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append("file", file);
  cloudinaryFormData.append("timestamp", timestamp.toString());
  cloudinaryFormData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
  cloudinaryFormData.append("signature", signature);
  cloudinaryFormData.append("folder", `nelvis/${orgId}/notes-frais`);
  cloudinaryFormData.append("resource_type", isExcel ? "raw" : "auto");

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${isExcel ? "raw" : "image"}/upload`,
    {
      method: "POST",
      body: cloudinaryFormData,
    }
  );

  if (!cloudinaryResponse.ok) {
    return NextResponse.json(
      { error: "Erreur upload Cloudinary" },
      { status: 500 }
    );
  }

  const uploadResult = await cloudinaryResponse.json();

  // OCR avec AWS Textract (seulement pour images et PDF)
  let ocrData;
  if (isExcel) {
    ocrData = { montant: null, date: null, categorie: "AUTRE", marchand: null, tva: null };
  } else {
    ocrData = await ocrService.extractReceiptData(buffer);
  }

  const noteDeFrais = await prisma.noteDeFrais.create({
    data: {
      organisationId: orgId,
      userId: auth.userId!,
      photoUrl: uploadResult.secure_url,
      montantOcr: ocrData.montant,
      dateOcr: ocrData.date,
      categorieOcr: ocrData.categorie,
      marchandOcr: ocrData.marchand,
      tvaOcr: ocrData.tva,
      statut: "EN_ATTENTE",
    },
  });

  return NextResponse.json({ noteDeFrais, ocrData });
}

async function generateSignature(timestamp: number, orgId: string): Promise<string> {
  const crypto = await import("crypto");
  const stringToSign = `folder=nelvis/${orgId}/notes-frais&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  return crypto.createHash("sha1").update(stringToSign).digest("hex");
}
