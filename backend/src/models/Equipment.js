// src/models/Equipment.js
import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
code: { type: String, unique: true, required: true },
name: { type: String, required: true },
type: { type: String, required: true },
location: { type: String, required: true },
status: { type: String, enum: ['ปกติ', 'ผิดปกติ', 'รอตรวจสอบ'], default: 'รอตรวจสอบ' },
lastInspection: { type: Date },
nextInspection: { type: Date }
}, { timestamps: true });

export default mongoose.model('Equipment', equipmentSchema);