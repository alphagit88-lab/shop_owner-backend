import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entity/User";
import { Item } from "./entity/Item";
import { Customer } from "./entity/Customer";
import { QuotationHeader } from "./entity/QuotationHeader";
import { QuotationDetail } from "./entity/QuotationDetail";
import { ReceiptHeader } from "./entity/ReceiptHeader";
import { ReceiptDetail } from "./entity/ReceiptDetail";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon
  synchronize: false,                  // ← ALWAYS false; use migrations
  logging: process.env.NODE_ENV === "development",
  entities: [User, Item, Customer, QuotationHeader, QuotationDetail, ReceiptHeader, ReceiptDetail],
  migrations: ["dist/migration/*.js"],  // compiled migration files
  migrationsTableName: "typeorm_migrations",
});
