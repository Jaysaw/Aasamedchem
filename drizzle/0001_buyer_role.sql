-- Run if upgrading an existing database (skip if using db:push on fresh DB)
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'buyer';
ALTER TABLE "orders" RENAME COLUMN "seller_id" TO "buyer_id";
