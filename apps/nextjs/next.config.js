import { fileURLToPath } from "url";
import createJiti from "jiti";
import { withSentryConfig } from "@sentry/nextjs";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@omc/api",
    "@omc/auth",
    "@omc/db",
    "@omc/ui",
    "@omc/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withSentryConfig(config, {
  silent: true,
  org: "omnicentra",
  project: "snatched-ai",
  tunnelRoute: "/monitoring",
});
