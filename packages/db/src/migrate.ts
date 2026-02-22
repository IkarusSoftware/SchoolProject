import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createMigrationClient } from "./index.js";

async function main() {
  console.log("🔄 Running migrations...");
  const db = createMigrationClient();

  await migrate(db, { migrationsFolder: "./src/migrations" });

  console.log("✅ Migrations completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
