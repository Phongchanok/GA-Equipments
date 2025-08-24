// src/models/Inspection.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
label: String,
status: { type: String, enum: ['ปกติ', 'ผิดปกติ'] }
}, { _id: false });

const inspectionSchema = new mongoose.Schema({
equipmentCode: { type: String, required: true, index: true },
inspectorId: { type: String },
inspectorName: { type: String },
date: { type: Date, default: () => new Date() },
items: [itemSchema],
overallStatus: { type: String, enum: ['ปกติ', 'ผิดปกติ'], required: true }
}, { timestamps: true });

export default mongoose.model('Inspection', inspectionSchema);
