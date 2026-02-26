import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { signToken, setAuthCookies } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "OK" : "MISSING");
    console.log("NODE_ENV:", process.env.NODE_ENV);

    const { email, password, firstName, lastName, phone } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone: phone || null },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const accessToken = await signToken({ userId: user.id }, "30d");
    const refreshToken = await signToken({ userId: user.id }, "30d");

    const response = NextResponse.json({ user }, { status: 201 });
    const cookies = setAuthCookies(accessToken, refreshToken);
    cookies.forEach(cookie => response.headers.append('Set-Cookie', cookie));

    return response;
  } catch (error) {
    console.error("Erreur register:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}
