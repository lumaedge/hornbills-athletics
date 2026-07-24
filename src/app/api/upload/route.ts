import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import * as XLSX from "xlsx";
import { computeAgeGroup } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1 });

    let dataStartIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row && row[0] === "Number") {
        dataStartIndex = i + 1;
        break;
      }
    }
    if (dataStartIndex === -1) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row && typeof row[0] === "number" && row[0] === 1) {
          dataStartIndex = i;
          break;
        }
      }
    }
    if (dataStartIndex === -1) {
      return NextResponse.json({ error: "Could not find data rows in Excel file" }, { status: 400 });
    }

    await query(`DELETE FROM race_entries`);
    await query(`DELETE FROM attendance`);
    await query(`DELETE FROM learners`);

    let imported = 0;
    const batchSize = 50;
    for (let i = dataStartIndex; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize).filter(
        (row) => row && row[0] && String(row[0]).trim() !== "" && String(row[2]).trim() !== ""
      );
      if (batch.length === 0) continue;

      const values: (string | null)[][] = [];
      for (const row of batch) {
        const learnerNumber = String(row[0] ?? "").trim();
        const accessionNumber = String(row[1] ?? "").trim();
        const surname = String(row[2] ?? "").trim();
        const firstName = String(row[3] ?? "").trim();
        const gender = String(row[4] ?? "").trim();
        const rawDob = String(row[5] ?? "").trim();
        const dobMatch = rawDob.match(/^(\d{4}\/\d{2}\/\d{2})/);
        const birthDate = dobMatch ? dobMatch[1] : rawDob;
        const house = String(row[6] ?? "").trim();
        const ageGroup = computeAgeGroup(birthDate);

        values.push([learnerNumber, accessionNumber, surname, firstName, gender, birthDate, house, ageGroup]);
        imported++;
      }

      const placeholders = values
        .map((_, idx) => {
          const base = idx * 8;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
        })
        .join(", ");

      const flatValues = values.flat();

      await query(
        `INSERT INTO learners (learner_number, accession_number, surname, first_name, gender, birth_date, house, age_group) VALUES ${placeholders}`,
        flatValues
      );
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
