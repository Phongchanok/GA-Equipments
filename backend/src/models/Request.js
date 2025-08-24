// src/models/Request.js
import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
date: { type: Date, default: () => new Date() },
equipment: { type: String, required: true },
quantity: { type: Number, required: true },
location: { type: String, required: true },
requester: { type: String, required: true },
status: { type: String, enum: ['รอตอบรับ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'], default: 'รอตอบรับ', index: true }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);