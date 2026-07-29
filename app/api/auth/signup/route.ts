import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword, commissionRate } = body;

    // 1. Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // 2. Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    // 3. Handle commission rate logic
    // Default to 15% (0.15) if not provided.
    // If provided, assume it's a percentage (e.g. 20) and convert to decimal (0.20).
    let finalCommissionRate = 0.15;
    if (commissionRate !== undefined && commissionRate !== "") {
      const parsedRate = parseFloat(commissionRate);
      if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
        return NextResponse.json(
          { error: "Invalid commission rate" },
          { status: 400 }
        );
      }
      finalCommissionRate = parsedRate / 100;
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Create user
    // Role is hardcoded to AGENT. We do not trust the client.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "AGENT",
        commissionRate: finalCommissionRate,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
