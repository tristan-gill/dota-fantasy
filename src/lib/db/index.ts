import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle({
  connection: process.env.NETLIFY_DATABASE_URL!,
  casing: "snake_case"
});
