import baseConfig, { restrictEnvAccess } from "@omc/eslint-config/base";
import nextjsConfig from "@omc/eslint-config/nextjs";
import reactConfig from "@omc/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
