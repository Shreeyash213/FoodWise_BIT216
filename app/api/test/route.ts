import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 AS test");

    return NextResponse.json({
      success: true,
      result: rows,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}