import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const event = searchParams.get("event");
    const ageGroup = searchParams.get("ageGroup");
    const gender = searchParams.get("gender");

    let sql = `SELECT r.*, l.surname, l.first_name, l.learner_number, l.gender, l.house
       FROM race_entries r
       JOIN learners l ON r.learner_id = l.id
       WHERE 1=1`;
    const params: string[] = [];

    if (date) {
      params.push(date);
      sql += ` AND r.date = $${params.length}`;
    }
    if (event) {
      params.push(event);
      sql += ` AND r.event = $${params.length}`;
    }
    if (ageGroup) {
      params.push(ageGroup);
      sql += ` AND r.age_group = $${params.length}`;
    }
    if (gender) {
      params.push(gender);
      sql += ` AND r.gender = $${params.length}`;
    }

    sql += ` ORDER BY r.age_group, l.surname, l.first_name`;

    const result = await query(sql, params);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { learner_id, event, age_group, gender, date } = body;

    if (!learner_id || !event || !age_group || !gender || !date) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await query(
      `SELECT id FROM race_entries WHERE learner_id = $1 AND event = $2 AND age_group = $3 AND gender = $4 AND date = $5`,
      [learner_id, event, age_group, gender, date]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Learner already entered in this event" }, { status: 409 });
    }

    const result = await query(
      `INSERT INTO race_entries (learner_id, event, age_group, gender, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [learner_id, event, age_group, gender, date]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await query(`DELETE FROM race_entries WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
