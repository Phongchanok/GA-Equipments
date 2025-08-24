import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    equipmentTypes: { type: [String], default: [] },
    locations: { type: [String], default: [] },
    // ใช้ Mixed เพื่อความยืดหยุ่น/เข้ากันได้
    inspectionIntervals: { type: mongoose.Schema.Types.Mixed, default: {} },
    inspectionChecklists: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', SettingsSchema);
