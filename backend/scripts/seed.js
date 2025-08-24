// scripts/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Equipment from '../src/models/Equipment.js';
import Settings from '../src/models/Settings.js';

async function run() {
await mongoose.connect(process.env.MONGODB_URI);

await User.deleteMany({});
await Equipment.deleteMany({});
await Settings.deleteMany({});

const [adminHash, inspHash, userHash] = await Promise.all([
bcrypt.hash('admin123', 10),
bcrypt.hash('inspect123', 10),
bcrypt.hash('user123', 10)
]);

await User.create([
{ username: 'admin', passwordHash: adminHash, name: 'ผู้ดูแลระบบ', role: 'admin' },
{ username: 'inspector', passwordHash: inspHash, name: 'ผู้ตรวจสอบ', role: 'inspector', code: 'INS001' },
{ username: 'user', passwordHash: userHash, name: 'ผู้ใช้งาน', role: 'user' }
]);

await Equipment.create([
{ code: 'EQ001', name: 'เครื่องปรับอากาศ A1', type: 'เครื่องปรับอากาศ', location: 'ห้องประชุม A', status: 'ปกติ' },
{ code: 'EQ002', name: 'เครื่องพิมพ์ B1', type: 'เครื่องพิมพ์', location: 'ห้องทำงาน B', status: 'ผิดปกติ' },
{ code: 'EQ003', name: 'คอมพิวเตอร์ C1', type: 'คอมพิวเตอร์', location: 'ห้องทำงาน C', status: 'รอตรวจสอบ' }
]);

await Settings.create({
equipmentTypes: ['เครื่องปรับอากาศ', 'เครื่องพิมพ์', 'คอมพิวเตอร์', 'เครื่องถ่ายเอกสาร'],
locations: ['ห้องประชุม A', 'ห้องทำงาน B', 'ห้องทำงาน C', 'ห้องแผนก D'],
inspectionIntervals: { 'เครื่องปรับอากาศ': 30, 'เครื่องพิมพ์': 60, 'คอมพิวเตอร์': 90, 'เครื่องถ่ายเอกสาร': 45 },
inspectionChecklists: {
'เครื่องปรับอากาศ': [ { item: 'ตรวจสอบการทำงานของปุ่มเปิด/ปิด', note: 'ทดสอบการเปิด-ปิดเครื่อง' } ],
'เครื่องพิมพ์': [ { item: 'ทดสอบการพิมพ์', note: 'พิมพ์เอกสารทดสอบ' } ],
'คอมพิวเตอร์': [ { item: 'ตรวจสอบการเปิดเครื่อง', note: 'ทดสอบ Boot' } ],
'เครื่องถ่ายเอกสาร': [ { item: 'ทดสอบการถ่ายเอกสาร', note: 'ถ่ายเอกสารทดสอบ' } ]
}
});

console.log('Seed complete. Users: admin/admin123, inspector/inspect123, user/user123');
await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
