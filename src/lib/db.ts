import "server-only";
import { Pool, type PoolClient } from "pg";

/**
 * Server-only Postgres access (Supabase session pooler).
 *
 * Used for: public content reads + website form inserts, where the query shape
 * is fully server-controlled. User-scoped reads/writes in the member portal go
 * through @supabase/ssr clients so RLS applies. This connection is postgres —
 * it BYPASSES RLS — so never interpolate untrusted SQL and always parameterise.
 */

declare global {
  var __pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global.__pgPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    global.__pgPool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return global.__pgPool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

/**
 * Run a set of statements on a single pooled connection inside a transaction.
 * Commits on success, rolls back on any thrown error, and always releases.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (e) {
    try {
      await client.query("rollback");
    } catch {
      /* ignore rollback error */
    }
    throw e;
  } finally {
    client.release();
  }
}

/** True when the database is reachable/configured — pages fall back to static content otherwise. */
export async function dbAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await query("select 1");
    return true;
  } catch {
    return false;
  }
}
