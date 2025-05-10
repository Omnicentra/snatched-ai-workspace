import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";
import JWT from "jsonwebtoken";

import { db } from "@omc/db/client";

import { env } from "../env";

const redirectURI = env.BETTER_AUTH_URL + "/api/auth/callback";

const makeAppleClientSecret = () => {
  const teamId = env.APPLE_AUTH_TEAM_ID;
  const keyId = env.APPLE_AUTH_KEY_ID;
  const clientId = env.APPLE_AUTH_CLIENT_ID;
  const privateKey = env.APPLE_AUTH_PRIVATE_KEY;


  const headers = {
    alg: "ES256",
    typ: "JWT",
    kid: keyId,
  };

  const payload = {
    iss: teamId,
    aud: "https://appleid.apple.com",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180, // 6 months
    sub: clientId,
  };

  const token = JWT.sign(payload, privateKey, { header: headers });
  return token;
};

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
    apple: {
      prompt: 'select_account',
      clientId: env.APPLE_AUTH_CLIENT_ID,
      clientSecret: makeAppleClientSecret(),
      redirectURI: redirectURI + "/apple",
    },
    google: {
      prompt: "select_account",
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      redirectURI: redirectURI + "/google",
    },
  },
  trustedOrigins: [
    "snatched-ai://",
    "snatched-ai-preview://",
    "snatched-ai-dev://",
    "https://appleid.apple.com",
    "https://snatchedai.com",
    "https://snatched-ai-dev-oh2uj.ondigitalocean.app",
    "https://painfully-classic-egret.ngrok-free.app",
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(config);
export type Session = typeof auth.$Infer.Session;
