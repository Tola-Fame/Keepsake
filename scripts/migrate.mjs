// Applies database migrations during the build when a database is connected.
// Skips when no database is configured (browser-only mode).
import { existsSync } from "node:fs";

// Same lookup as src/lib/config.ts: DATABASE_URL, POSTGRES_URL, or a prefixed name.
function findDatabaseUrl() {
  const env = process.env;
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (env.POSTGRES_URL) return env.POSTGRES_URL;
  for (const [name, value] of Object.entries(env)) {
    if (value && /(_DATABASE_URL|_POSTGRES_URL)$/.test(name) && /^postgres(ql)?:\/\//.test(value)) return value;
  }
  return undefined;
}

const url = findDatabaseUrl();
if (!url) {
  console.log("[migrate] No database connected: skipping migrations (browser-only mode).");
  process.exit(0);
}
if (!existsSync("./drizzle/meta/_journal.json")) {
  console.log("[migrate] No migrations folder found: skipping.");
  process.exit(0);
}

if (/\.neon\.tech|neon\.build/i.test(url)) {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { migrate } = await import("drizzle-orm/neon-http/migrator");
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
} else {
  const { default: pg } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  const ssl = /sslmode=require|supabase|amazonaws|prisma/i.test(url) ? { rejectUnauthorized: false } : undefined;
  const pool = new pg.Pool({ connectionString: url, ssl });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.end();
}
console.log("[migrate] Database is up to date.");
