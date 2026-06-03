import { loadEnv } from "../lib/load-env";

loadEnv();

import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required");

  const sql = neon(url);

  await sql`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'buyer'`;

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name IN ('seller_id', 'buyer_id')
  `;

  const names = (cols as { column_name: string }[]).map((c) => c.column_name);
  if (names.includes("seller_id") && !names.includes("buyer_id")) {
    await sql`ALTER TABLE orders RENAME COLUMN seller_id TO buyer_id`;
    console.log("Renamed orders.seller_id → buyer_id");
  } else {
    console.log("Column buyer_id already present — skip rename");
  }

  console.log("Migration complete. Run: npm run db:seed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
