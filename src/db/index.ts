import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig, type QueryResult } from "pg";
import * as schema from "./schema";

function isNeonUrl(url: string) {
  return url.includes("neon.tech") || url.includes("neon.build");
}

export function normalizeDatabaseUrl(url: string) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (isNeonUrl(url) && !parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function requireDatabaseUrl() {
  const raw = process.env.DATABASE_URL || "";
  if (!raw) {
    throw new Error("DATABASE_URL is required");
  }
  return normalizeDatabaseUrl(raw);
}

// Neon (and other managed poolers) silently close idle TCP connections.
// Without these settings, node-postgres hands out a dead socket and the next
// query hangs for the OS TCP timeout (~20-30s) before returning a 500.
function poolConfig(connectionString: string): PoolConfig {
  return {
    connectionString,
    ssl: isNeonUrl(connectionString) ? { rejectUnauthorized: false } : undefined,
    max: 5,
    // Close our idle connections before Neon closes them on its side.
    idleTimeoutMillis: 20_000,
    // Fail fast if a new connection cannot be established (cold start, DNS).
    connectionTimeoutMillis: 10_000,
    // Client-side cap so a query can never hang for half a minute.
    query_timeout: 15_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
    maxUses: 500,
    allowExitOnIdle: false,
  };
}

function isTransientConnectionError(error: unknown) {
  const err = error as { code?: string; message?: string } | undefined;
  const code = err?.code ?? "";
  const message = err?.message ?? "";
  return (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EPIPE" ||
    code === "ETIMEDOUT" ||
    code === "57P01" || // admin shutdown (Neon scale-to-zero)
    code === "57P02" ||
    code === "57P03" ||
    /Connection terminated/i.test(message) ||
    /Query read timeout/i.test(message) ||
    /timeout exceeded when trying to connect/i.test(message) ||
    /Client has encountered a connection error/i.test(message)
  );
}

function queryTextOf(input: unknown) {
  if (typeof input === "string") return input;
  if (input && typeof input === "object" && "text" in input) {
    return String((input as { text?: unknown }).text ?? "");
  }
  return "";
}

function isRetriableStatement(input: unknown) {
  return /^\s*select/i.test(queryTextOf(input));
}

class ResilientPool extends Pool {
  // Drizzle's node-postgres driver funnels every query through pool.query.
  // Retry once on stale-socket errors, but only for SELECTs so writes are
  // never accidentally duplicated.
  override query(...args: unknown[]): never {
    const run = () => (Pool.prototype.query as (...a: unknown[]) => Promise<QueryResult>).apply(this, args);

    const first = run();
    if (!first || typeof first.catch !== "function") {
      // Callback-style invocation: pg handles it internally, nothing to retry.
      return first as never;
    }

    const attempt = first.catch(async (error: unknown) => {
      if (isTransientConnectionError(error) && isRetriableStatement(args[0])) {
        console.warn("[db] transient connection error, retrying SELECT:", (error as Error)?.message);
        return run();
      }
      throw error;
    });

    return attempt as never;
  }
}

const globalForDb = globalThis as typeof globalThis & {
  __planeFinderPool?: Pool;
  __planeFinderDb?: NodePgDatabase<typeof schema>;
};

export function getPool() {
  if (!globalForDb.__planeFinderPool) {
    const connectionString = requireDatabaseUrl();
    const pool = new ResilientPool(poolConfig(connectionString));
    // Idle clients whose sockets die must not crash the process; pg removes
    // them from the pool after this handler runs.
    pool.on("error", (error) => {
      console.warn("[db] idle client error (connection recycled):", error.message);
    });
    globalForDb.__planeFinderPool = pool;
  }
  return globalForDb.__planeFinderPool;
}

function getDrizzle() {
  if (!globalForDb.__planeFinderDb) {
    globalForDb.__planeFinderDb = drizzle(getPool(), { schema });
  }
  return globalForDb.__planeFinderDb;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, property, receiver) {
    return Reflect.get(getDrizzle(), property, receiver);
  },
});

export const pool = {
  query: (...args: Parameters<Pool["query"]>) => getPool().query(...args),
  connect: () => getPool().connect(),
  end: () => getPool().end(),
} as Pick<Pool, "query" | "connect" | "end">;
