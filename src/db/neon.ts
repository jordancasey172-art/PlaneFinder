// Cloudflare-compatible DB driver using Neon HTTP (works on Workers)
// To use on Cloudflare Pages, set CLOUDFLARE_DB=neon and DATABASE_URL to Neon HTTP URL
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("[db:neon] DATABASE_URL not set");
}

const sql = neon(databaseUrl || "postgresql://user:pass@localhost/db");

export const db = drizzle(sql, { schema });
export const pool = null as unknown as never; // not used in neon-http mode
