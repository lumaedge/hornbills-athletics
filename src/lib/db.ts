import { neon } from "@neondatabase/serverless";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

let _sql: ReturnType<typeof neon> | null = null;

function getSql(): ReturnType<typeof neon> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Create a Neon database at https://neon.tech and add the connection string to your Vercel environment variables."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

export async function query(queryStr: string, params?: unknown[]): Promise<Row[]> {
  const sql = getSql();
  const result = await sql.query(queryStr, params);
  return result as Row[];
}

export default getSql;
