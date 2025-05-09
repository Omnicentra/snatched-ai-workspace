import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://255eae722d27d164a8584b7972656ae7@o4504963099262976.ingest.us.sentry.io/4509253973901312",

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
