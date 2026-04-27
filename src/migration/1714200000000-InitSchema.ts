import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1714200000000 implements MigrationInterface {
  name = "InitSchema1714200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── users ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"            SERIAL PRIMARY KEY,
        "username"      VARCHAR(100) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "created_at"    TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── items ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "items" (
        "id"               SERIAL PRIMARY KEY,
        "item_code"        VARCHAR(50),
        "item_description" TEXT NOT NULL,
        "unit_price_usd"   NUMERIC(12,2) NOT NULL DEFAULT 0,
        "unit_price_lkr"   NUMERIC(12,2) NOT NULL DEFAULT 0,
        "is_available"     BOOLEAN NOT NULL DEFAULT TRUE,
        "created_at"       TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── customers ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id"            SERIAL PRIMARY KEY,
        "customer_name" VARCHAR(200) NOT NULL,
        "phone_number"  VARCHAR(30),
        "email"         VARCHAR(200),
        "created_at"    TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── quotation_header ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quotation_header" (
        "quotation_no"   SERIAL PRIMARY KEY,
        "customer_id"    INTEGER REFERENCES "customers"("id"),
        "customer_name"  VARCHAR(200),
        "quotation_date" TIMESTAMP NOT NULL DEFAULT NOW(),
        "status"         VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        "total_usd"      NUMERIC(12,2),
        "total_lkr"      NUMERIC(12,2),
        "notes"          TEXT
      )
    `);

    // ── quotation_detail ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quotation_detail" (
        "id"                   SERIAL PRIMARY KEY,
        "quotation_no"         INTEGER NOT NULL REFERENCES "quotation_header"("quotation_no") ON DELETE CASCADE,
        "item_id"              INTEGER REFERENCES "items"("id"),
        "item_code"            VARCHAR(50),
        "item_description"     TEXT,
        "unit_price_usd"       NUMERIC(12,2) NOT NULL DEFAULT 0,
        "unit_price_lkr"       NUMERIC(12,2) NOT NULL DEFAULT 0,
        "discount_pct"         NUMERIC(5,2)  NOT NULL DEFAULT 0,
        "discount_amount_usd"  NUMERIC(12,2) NOT NULL DEFAULT 0,
        "discount_amount_lkr"  NUMERIC(12,2) NOT NULL DEFAULT 0,
        "quantity"             INTEGER NOT NULL DEFAULT 1,
        "line_total_usd"       NUMERIC(12,2) NOT NULL DEFAULT 0,
        "line_total_lkr"       NUMERIC(12,2) NOT NULL DEFAULT 0
      )
    `);

    // ── receipt_header ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "receipt_header" (
        "receipt_no"      SERIAL PRIMARY KEY,
        "quotation_no"    INTEGER REFERENCES "quotation_header"("quotation_no"),
        "customer_id"     INTEGER REFERENCES "customers"("id"),
        "customer_name"   VARCHAR(200),
        "receipt_date"    TIMESTAMP NOT NULL DEFAULT NOW(),
        "payment_method"  VARCHAR(50),
        "total_paid_usd"  NUMERIC(12,2),
        "total_paid_lkr"  NUMERIC(12,2),
        "status"          VARCHAR(20) NOT NULL DEFAULT 'PAID'
      )
    `);

    // ── receipt_detail ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "receipt_detail" (
        "id"                    SERIAL PRIMARY KEY,
        "receipt_no"            INTEGER NOT NULL REFERENCES "receipt_header"("receipt_no") ON DELETE CASCADE,
        "quotation_detail_id"   INTEGER REFERENCES "quotation_detail"("id"),
        "item_id"               INTEGER REFERENCES "items"("id"),
        "item_code"             VARCHAR(50),
        "item_description"      TEXT,
        "unit_price_usd"        NUMERIC(12,2) NOT NULL DEFAULT 0,
        "unit_price_lkr"        NUMERIC(12,2) NOT NULL DEFAULT 0,
        "discount_pct"          NUMERIC(5,2)  NOT NULL DEFAULT 0,
        "discount_amount_usd"   NUMERIC(12,2) NOT NULL DEFAULT 0,
        "discount_amount_lkr"   NUMERIC(12,2) NOT NULL DEFAULT 0,
        "quantity"              INTEGER NOT NULL DEFAULT 1,
        "line_total_usd"        NUMERIC(12,2) NOT NULL DEFAULT 0,
        "line_total_lkr"        NUMERIC(12,2) NOT NULL DEFAULT 0
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "receipt_detail"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "receipt_header"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quotation_detail"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quotation_header"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
