import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS learners (
        id SERIAL PRIMARY KEY,
        learner_number TEXT,
        accession_number TEXT,
        surname TEXT NOT NULL,
        first_name TEXT NOT NULL,
        gender TEXT,
        birth_date TEXT,
        house TEXT,
        age_group TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'present',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(learner_id, date)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS race_entries (
        id SERIAL PRIMARY KEY,
        learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
        event TEXT NOT NULL,
        age_group TEXT NOT NULL,
        gender TEXT NOT NULL,
        date DATE NOT NULL,
        position TEXT,
        time TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
