// Applies database migrations during the build when DATABASE_URL is set.
// Skips silently when no database is configured (browser-only mode).
import { existsSync } from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("[migrate] DATABASE_URL not set – skipping migrations (browser-only mode).");
  process.exit(0);
}
if (!existsSync("./drizzle/meta/_journal.json")) {
  console.log("[migrate] No migrations folder found – skipping.");
  process.exit(0);
}
const { neon } = await import("@neondatabase/serverless");
const { drizzle } = await import("drizzle-orm/neon-http");
const { migrate } = await import("drizzle-orm/neon-http/migrator");
const db = drizzle(neon(url));
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("[migrate] Database is up to date.");
