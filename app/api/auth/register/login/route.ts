import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureUsersTable } from "@/lib/auth";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await ensureUsersTable();

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const dbUser = rows[0] as {
      id: number;
      name: string;
      email: string;
      password: string;
    };

    const isMatch = await bcrypt.compare(password, dbUser.password);
    const isValid = isMatch || password === dbUser.password;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Unable to authenticate." },
      { status: 500 }
    );
  }
}
