import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from "./schema";

const url = String(process.env.POSTGRES_URL);
const sql = neon(url)

export const db = drizzle({
  client: sql,
  schema,
  casing: "snake_case",
});
