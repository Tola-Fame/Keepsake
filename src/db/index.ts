import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { databaseUrl } from "@/lib/config";

type Db = NeonHttpDatabase<typeof schema>;
let _db: Db | null = null;

/** True for Neon databases, which use Neon's faster HTTP driver. */
export const isNeonUrl = (url: string) => /\.neon\.tech|neon\.build/i.test(url);

/** Database client. Works with Neon (HTTP) and any standard Postgres (TCP). */
export function getDb(): Db {
  if (!_db) {
    const url = databaseUrl();
    if (!url) throw new Error("No database is connected");
    if (isNeonUrl(url)) {
      _db = drizzleNeon(neon(url), { schema });
    } else {
      const ssl = /sslmode=require|supabase|amazonaws|prisma/i.test(url) ? { rejectUnauthorized: false } : undefined;
      // Both drivers expose the same query API used by this app.
      _db = drizzlePg(new Pool({ connectionString: url, max: 5, ssl }), { schema }) as unknown as Db;
    }
  }
  return _db;
}

export { schema };
