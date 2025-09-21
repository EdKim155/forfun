import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1).default('file:./dev.db'),
  SHADOW_DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().min(1).default('dev-secret'),
  NEXTAUTH_URL: z.string().url().optional(),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  OPENAI_API_KEY: z.string().min(1).default('sk-placeholder'),
  OPENAI_ORG_ID: z.string().optional(),
  DEFAULT_LOCALE: z.enum(['ru', 'en']).default('ru'),
  SUPPORTED_LOCALES: z.string().default('ru,en'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60)
});

type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv(): Env {
  if (!env) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
      throw new Error('Invalid environment variables');
    }
    env = parsed.data;
  }

  return env;
}

export const env = getEnv();
