import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@omc/db/client";

import { env } from "../env";

const redirectURI = env.BETTER_AUTH_URL + "/api/auth/callback";

export const config = {
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  secret: env.AUTH_SECRET,
  plugins: [oAuthProxy(), expo()],
  socialProviders: {
    discord: {
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
      redirectURI: redirectURI + "/discord",
    },
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      redirectURI: redirectURI + "/google",
    },
  },
  trustedOrigins: [
    "snatched-ai://",
    "snatched-ai-preview://",
    "snatched-ai-dev://",
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(config);
export type Session = typeof auth.$Infer.Session;
