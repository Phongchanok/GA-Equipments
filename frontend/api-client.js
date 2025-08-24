// public/api-client.js
/** Tiny API client for the existing static HTML pages. Include this file and set window.API_BASE_URL. */
const API_BASE = window.API_BASE_URL || '';
const withCreds = (opts={}) => ({ credentials: 'include', headers: { 'content-type': 'application/json', ...(opts.headers||{}) }, ...opts });

export const api = {
// Auth
login: async (username, password) => {
const r = await fetch(`${API_BASE}/auth/login`, withCreds({ method: 'POST', body: JSON.stringify({ username, password }) }));
if (!r.ok) throw new Error((await r.json()).error || 'Login failed');
return r.json();
},
logout: async () => { await fetch(`${API_BASE}/auth/logout`, withCreds({ method: 'POST' })); },
me: async () => { const r = await fetch(`${API_BASE}/auth/me`, withCreds()); if (!r.ok) return null; return r.json(); },
verifyInspectorCode: async (code) => {
const r = await fetch(`${API_BASE}/auth/inspectors/verify?code=${encodeURIComponent(code)}`, withCreds());
if (!r.ok) throw new Error((await r.json()).error || 'ไม่พบผู้ตรวจสอบ');
return r.json();
},

// Equipment
listEquipment: async (params={}) => {
const q = new URLSearchParams(params).toString();
const r = await fetch(`${API_BASE}/equipment?${q}`, withCreds());
if (!r.ok) throw new Error('โหลดรายการอุปกรณ์ล้มเหลว');
return r.json();
},
getEquipment: async (code) => {
const r = await fetch(`${API_BASE}/equipment/${encodeURIComponent(code)}`, withCreds());
if (!r.ok) throw new Error('ไม่พบอุปกรณ์');
return r.json();
},
createEquipment: async (payload) => {
const r = await fetch(`${API_BASE}/equipment`, withCreds({ method: 'POST', body: JSON.stringify(payload) }));
if (!r.ok) throw new Error('เพิ่มอุปกรณ์ล้มเหลว');
return r.json();
},
updateEquipment: async (code, patch) => {
const r = await fetch(`${API_BASE}/equipment/${encodeURIComponent(code)}`, withCreds({ method: 'PUT', body: JSON.stringify(patch) }));
if (!r.ok) throw new Error('แก้ไขอุปกรณ์ล้มเหลว');
return r.json();
},
deleteEquipment: async (code) => {
const r = await fetch(`${API_BASE}/equipment/${encodeURIComponent(code)}`, withCreds({ method: 'DELETE' }));
if (!r.ok) throw new Error('ลบอุปกรณ์ล้มเหลว');
return r.json();
},
listInspections: async (code, params={}) => {
const q = new URLSearchParams(params).toString();
const r = await fetch(`${API_BASE}/equipment/${encodeURIComponent(code)}/inspections?${q}`, withCreds());
if (!r.ok) throw new Error('โหลดประวัติล้มเหลว');
return r.json();
},
createInspection: async (code, payload) => {
const r = await fetch(`${API_BASE}/equipment/${encodeURIComponent(code)}/inspections`, withCreds({ method: 'POST', body: JSON.stringify(payload) }));
if (!r.ok) throw new Error('บันทึกผลตรวจล้มเหลว');
return r.json();
},

// Requests
listRequests: async (params={}) => {
const q = new URLSearchParams(params).toString();
const r = await fetch(`${API_BASE}/requests?${q}`, withCreds());
if (!r.ok) throw new Error('โหลดคำร้องขอล้มเหลว');
return r.json();
},
createRequest: async (payload) => {
const r = await fetch(`${API_BASE}/requests`, withCreds({ method: 'POST', body: JSON.stringify(payload) }));
if (!r.ok) throw new Error('สร้างคำร้องขอล้มเหลว');
return r.json();
},
updateRequestStatus: async (id, status) => {
const r = await fetch(`${API_BASE}/requests/${id}/status`, withCreds({ method: 'PUT', body: JSON.stringify({ status }) }));
if (!r.ok) throw new Error('อัปเดตสถานะคำร้องล้มเหลว');
return r.json();
},

// Settings
getSettings: async () => {
const r = await fetch(`${API_BASE}/settings`, withCreds());
if (!r.ok) throw new Error('โหลด settings ล้มเหลว');
return r.json();
},
updateSettings: async (payload) => {
const r = await fetch(`${API_BASE}/settings`, withCreds({ method: 'PUT', body: JSON.stringify(payload) }));
if (!r.ok) throw new Error('อัปเดต settings ล้มเหลว');
return r.json();
}
};
