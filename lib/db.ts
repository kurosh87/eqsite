import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/app/schema/schema";

// Allow db to be created with a dummy connection during build time
const connectionString = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
