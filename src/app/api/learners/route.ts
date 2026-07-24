import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const ageGroup = searchParams.get("ageGroup") || "";
    const gender = searchParams.get("gender") || "";

    let sql = `SELECT * FROM learners WHERE 1=1`;
    const params: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (surname ILIKE $${params.length} OR first_name ILIKE $${params.length})`;
    }
    if (ageGroup) {
      params.push(ageGroup);
      sql += ` AND age_group = $${params.length}`;
    }
    if (gender) {
      params.push(gender);
      sql += ` AND gender = $${params.length}`;
    }

    sql += ` ORDER BY surname, first_name`;

    const result = await query(sql, params);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
