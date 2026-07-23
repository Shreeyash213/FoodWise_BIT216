import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureHouseholdTable } from "@/lib/dbInit";
import { RowDataPacket } from "mysql2";
import { HouseholdMember, seedHouseholdMembers } from "@/lib/data";

let memoryMembers: HouseholdMember[] = [...seedHouseholdMembers];

export async function GET() {
  try {
    try {
      await ensureHouseholdTable();
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id, name, role, privacy FROM household_members"
      );
      if (Array.isArray(rows) && rows.length > 0) {
        memoryMembers = rows.map((r) => ({
          id: String(r.id),
          name: String(r.name),
          role: String(r.role),
          privacy: String(r.privacy),
        }));
        return NextResponse.json(memoryMembers);
      }
    } catch (dbErr) {
      console.warn("DB query failed in GET /api/household, falling back to memory:", dbErr);
    }
    return NextResponse.json(memoryMembers);
  } catch (err) {
    console.error("GET /api/household error:", err);
    return NextResponse.json({ error: "Failed to load household members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, privacy } = body ?? {};

    if (!name || !role) {
      return NextResponse.json({ error: "Missing required fields: name, role" }, { status: 400 });
    }

    const id = `h_${Math.random().toString(36).substring(2, 9)}`;
    const memberPrivacy = privacy || "Shares full inventory";
    const newMember: HouseholdMember = { id, name, role, privacy: memberPrivacy };

    try {
      await ensureHouseholdTable();
      await pool.query(
        "INSERT INTO household_members (id, name, role, privacy) VALUES (?, ?, ?, ?)",
        [id, name, role, memberPrivacy]
      );
    } catch (dbErr) {
      console.warn("DB insert failed in POST /api/household, updated in memory only:", dbErr);
    }

    memoryMembers.push(newMember);
    return NextResponse.json({ ok: true, member: newMember }, { status: 201 });
  } catch (err) {
    console.error("POST /api/household error:", err);
    return NextResponse.json({ error: "Failed to add household member" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, role, privacy } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    try {
      await ensureHouseholdTable();
      await pool.query(
        "UPDATE household_members SET name = ?, role = ?, privacy = ? WHERE id = ?",
        [name, role, privacy, id]
      );
    } catch (dbErr) {
      console.warn("DB update failed in PUT /api/household, updated in memory only:", dbErr);
    }

    let updatedMember: HouseholdMember | null = null;
    memoryMembers = memoryMembers.map((m) => {
      if (m.id === id || m.name === name) {
        updatedMember = {
          ...m,
          id: id || m.id,
          name: name ?? m.name,
          role: role ?? m.role,
          privacy: privacy ?? m.privacy,
        };
        return updatedMember;
      }
      return m;
    });

    return NextResponse.json({ ok: true, member: updatedMember });
  } catch (err) {
    console.error("PUT /api/household error:", err);
    return NextResponse.json({ error: "Failed to update household member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // body optional if searchParams provided
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Missing member id" }, { status: 400 });
    }

    try {
      await ensureHouseholdTable();
      await pool.query("DELETE FROM household_members WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("DB delete failed in DELETE /api/household, updated in memory only:", dbErr);
    }

    memoryMembers = memoryMembers.filter((m) => m.id !== id);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /api/household error:", err);
    return NextResponse.json({ error: "Failed to delete household member" }, { status: 500 });
  }
}
