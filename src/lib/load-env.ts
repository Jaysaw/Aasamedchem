import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

/** Load .env.local then .env for scripts and drizzle-kit (Next.js loads these automatically). */
export function loadEnv() {
  const root = process.cwd();
  const local = resolve(root, ".env.local");
  const env = resolve(root, ".env");
  if (existsSync(local)) config({ path: local });
  if (existsSync(env)) config({ path: env, override: false });
}
