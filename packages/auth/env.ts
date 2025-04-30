import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_DISCORD_ID: z.string().min(1),
    BETTER_AUTH_URL: z.string().min(1),
    AUTH_DISCORD_SECRET: z.string().min(1),
    GOOGLE_API_KEY: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_APPLE_ID: z.string().min(1),
    // AUTH_APPLE_SECRET: z.string().min(1).optional(),
    AUTH_APPLE_PRIVATE_KEY: z.string().min(1),
    AUTH_APPLE_TEAM_ID: z.string().min(1).default('U665535C27'),
    AUTH_APPLE_KEY_ID: z.string().min(1).default('3F3824Q47C'),
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
