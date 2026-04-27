import "reflect-metadata";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Item } from "../entity/Item";
import { Customer } from "../entity/Customer";

dotenv.config();

async function seed() {
  console.log("🌱  Connecting to database...");
  await AppDataSource.initialize();
  console.log("✅  Connected");

  const userRepo     = AppDataSource.getRepository(User);
  const itemRepo     = AppDataSource.getRepository(Item);
  const customerRepo = AppDataSource.getRepository(Customer);

  // ── Admin user ────────────────────────────────────────────────
  const existingAdmin = await userRepo.findOne({ where: { username: "admin" } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash("admin123", 10);
    await userRepo.save({ username: "admin", passwordHash: hash });
    console.log("👤  Admin user created  (username: admin / password: admin123)");
  } else {
    console.log("👤  Admin user already exists — skipped");
  }

  // ── Sample items ──────────────────────────────────────────────
  const itemCount = await itemRepo.count();
  if (itemCount === 0) {
    const items = [
      {
        itemCode: "DM-001",
        itemDescription: "1.0ct Round Brilliant Diamond — D/VS1 GIA Certified",
        unitPriceUsd: 8500.00,
        unitPriceLkr: 2652500.00,
        isAvailable: true,
      },
      {
        itemCode: "DM-002",
        itemDescription: "0.75ct Princess Cut Diamond — E/VVS2 GIA Certified",
        unitPriceUsd: 5200.00,
        unitPriceLkr: 1622400.00,
        isAvailable: true,
      },
      {
        itemCode: "RG-101",
        itemDescription: "18K White Gold Diamond Engagement Ring — 0.5ct",
        unitPriceUsd: 3800.00,
        unitPriceLkr: 1185800.00,
        isAvailable: true,
      },
      {
        itemCode: "NK-201",
        itemDescription: "Diamond Pendant Necklace — Platinum Setting 0.3ct",
        unitPriceUsd: 2400.00,
        unitPriceLkr: 748800.00,
        isAvailable: true,
      },
      {
        itemCode: "BR-301",
        itemDescription: "Diamond Tennis Bracelet — 18K Yellow Gold 2.0ct Total",
        unitPriceUsd: 12000.00,
        unitPriceLkr: 3744000.00,
        isAvailable: true,
      },
      {
        itemCode: "ER-401",
        itemDescription: "Diamond Stud Earrings — 0.5ct Pair F/VS2",
        unitPriceUsd: 3200.00,
        unitPriceLkr: 998400.00,
        isAvailable: true,
      },
      {
        itemCode: "DM-003",
        itemDescription: "2.0ct Oval Cut Diamond — G/SI1 IGI Certified",
        unitPriceUsd: 14500.00,
        unitPriceLkr: 4524500.00,
        isAvailable: true,
      },
    ];
    await itemRepo.save(items);
    console.log(`💎  ${items.length} sample items seeded`);
  } else {
    console.log(`💎  Items already exist (${itemCount} found) — skipped`);
  }

  // ── Sample customers ──────────────────────────────────────────
  const custCount = await customerRepo.count();
  if (custCount === 0) {
    const customers = [
      { customerName: "Amara Perera",   phoneNumber: "+94 77 123 4567", email: "amara@example.com" },
      { customerName: "Rohan Silva",    phoneNumber: "+94 71 987 6543", email: "rohan@example.com" },
      { customerName: "Nimali Fernando",phoneNumber: "+94 76 555 0101", email: "nimali@example.com" },
    ];
    await customerRepo.save(customers);
    console.log(`👥  ${customers.length} sample customers seeded`);
  } else {
    console.log(`👥  Customers already exist (${custCount} found) — skipped`);
  }

  await AppDataSource.destroy();
  console.log("\n🎉  Seed complete!");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
