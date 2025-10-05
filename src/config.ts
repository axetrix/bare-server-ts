import { loadEnvFile } from "node:process";
import type { MigrationConfig } from "drizzle-orm/migrator";

loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

type PLATFORM_DEV = 'DEV';

export function isPlatformDev(value: string): value is PLATFORM_DEV {
  return value === 'DEV';
}

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig,
}

type APIConfig = {
  fileserverHits: number;
  port: number;
};

type AppConfig = {
  platform: string;
};

type Config = {
  db: DBConfig;
  api: APIConfig;
  app: AppConfig;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: envOrThrow('DB_MIGRATIONS_FOLDER'),
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: parseInt(envOrThrow('API_PORT'), 10),
  },
  db: {
    url: envOrThrow('DB_URL'),
    migrationConfig: migrationConfig,
  },
  app: {
    platform: envOrThrow('APP_PLATFORM'),
  }
};
