// scripts/seed-user.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI not set in .env");

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // bcrypt hash ของ admin123 (เตรียมไว้ล่วงหน้า)
  const adminHash = "$2b$10$sOJ8J.doJdC/3n4A9eTOEu6FhWNjGx4hTrkvYwBV16IadnD7z3svq";

  await User.updateOne(
    { username: "admin" },
    {
      $set: {
        username: "admin",
        passwordHash: adminHash,
        name: "Administrator",
        role: "admin",
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  console.log("👤 User admin/admin123 seeded");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
