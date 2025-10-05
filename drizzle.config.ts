import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
  schema: "src/libs/db/schema.ts",
  out: config.db.migrationConfig.migrationsFolder,
  dialect: "postgresql",
  dbCredentials: {
    url: config.db.url,
  },
});
