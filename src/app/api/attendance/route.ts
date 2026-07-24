import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    const result = await query(
      `SELECT a.*, l.surname, l.first_name, l.learner_number, l.gender, l.age_group, l.house
       FROM attendance a
       JOIN learners l ON a.learner_id = l.id
       WHERE a.date = $1
       ORDER BY l.surname, l.first_name`,
      [date]
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, records } = body as {
      date: string;
      records: { learner_id: number; status: "present" | "absent" }[];
    };

    if (!date || !records) {
      return NextResponse.json({ error: "Date and records required" }, { status: 400 });
    }

    for (const record of records) {
      await query(
        `INSERT INTO attendance (learner_id, date, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (learner_id, date) DO UPDATE SET status = $3`,
        [record.learner_id, date, record.status]
      );
    }

    return NextResponse.json({ success: true, saved: records.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
