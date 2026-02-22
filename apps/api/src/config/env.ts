import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),

  // Database
  DATABASE_URL: z
    .string()
    .default("postgresql://edusync:edusync_dev_2026@localhost:5432/edusync_dev"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // JWT
  JWT_ACCESS_SECRET: z.string().default("edusync-access-secret-change-in-production-2026"),
  JWT_REFRESH_SECRET: z.string().default("edusync-refresh-secret-change-in-production-2026"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:3001"),

  // S3/MinIO
  S3_ENDPOINT: z.string().default("http://localhost:9000"),
  S3_ACCESS_KEY: z.string().default("edusync_minio"),
  S3_SECRET_KEY: z.string().default("edusync_minio_2026"),
  S3_BUCKET: z.string().default("edusync"),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
