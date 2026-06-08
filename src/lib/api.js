import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://ministar-api.fly.dev';

async function getToken() {
  return await AsyncStorage.getItem('auth_token');
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// ─── Normalizers ────────────────────────────────────────────────────────────
function fmtTime(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function normalizeChild(c) {
  return {
    id: c.id,
    name: `${c.first_name} ${c.last_name}`,
    firstName: c.first_name,
    lastName: c.last_name,
    age: c.age || 3,
    dob: c.date_of_birth,
    room: c.classroom_name || 'Unassigned',
    roomEmoji: c.classroom_emoji || '🌟',
    classroomId: c.classroom_id,
    emoji: c.emoji || '👶',
    colorIndex: c.color_index || 0,
    status: c.status || 'not_arrived',
    checkinTime: fmtTime(c.checkin_time),
    checkoutTime: fmtTime(c.checkout_time),
    mood: c.mood || 'N/A',
    moodEmoji: c.mood_emoji || '😶',
    allergies: c.allergies || [],
    allergyAlert: c.allergy_alert || false,
    medicalNotes: c.medical_notes || '',
    emergencyContact: c.emergency_contact || '',
    emergencyPhone: c.emergency_phone || '',
    teacherId: c.teacher_id || null,
    teacherNote: c.teacher_note || '',
    photoCount: c.photo_count || 0,
    unreadMessages: c.unread_messages || 0,
    parentId: c.parent_id || null,
    enrollDate: c.enroll_date || null,
    // raw fields for forms
    _raw: c,
  };
}

export function normalizeStaff(s) {
  return {
    id: s.id,
    name: s.name,
    firstName: s.name ? s.name.split(' ').slice(-1)[0] : 'Staff',
    role: s.role || 'Teacher',
    room: s.classroom_name || 'Office',
    roomEmoji: '🏫',
    classroomId: s.classroom_id,
    email: s.email || '',
    phone: s.phone || '',
    emoji: s.emoji || '👤',
    colorIndex: 0,
    status: s.status || 'active',
    certifications: s.certifications || [],
    startDate: s.hire_date || null,
    childrenCount: s.children_count || 0,
    rating: parseFloat(s.rating) || 5.0,
  };
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) await AsyncStorage.setItem('auth_token', data.token);
  return data;
}

export async function signup(email, password, full_name, role) {
  const data = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, role }),
  });
  if (data.token) await AsyncStorage.setItem('auth_token', data.token);
  return data;
}

export async function getMe() {
  return request('/api/auth/me');
}

export async function logout() {
  await AsyncStorage.removeItem('auth_token');
}

// ─── Classrooms ─────────────────────────────────────────────────────────────
export async function getClassrooms() {
  return request('/api/classrooms');
}

// ─── Children ───────────────────────────────────────────────────────────────
export async function getChildren() {
  const data = await request('/api/children');
  return data.map(normalizeChild);
}

export async function getChild(id) {
  const data = await request(`/api/children/${id}`);
  return normalizeChild(data);
}

export async function createChild(data) {
  const result = await request('/api/children', { method: 'POST', body: JSON.stringify(data) });
  return normalizeChild(result);
}

export async function updateChild(id, data) {
  const result = await request(`/api/children/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return normalizeChild(result);
}

export async function deleteChild(id) {
  return request(`/api/children/${id}`, { method: 'DELETE' });
}

// ─── Attendance ─────────────────────────────────────────────────────────────
export async function getAttendance(date) {
  const q = date ? `?date=${date}` : '';
  return request(`/api/attendance${q}`);
}

export async function updateAttendance(childId, data) {
  return request(`/api/attendance/${childId}`, { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Staff ──────────────────────────────────────────────────────────────────
export async function getStaff() {
  const data = await request('/api/staff');
  return data.map(normalizeStaff);
}

export async function createStaff(data) {
  const result = await request('/api/staff', { method: 'POST', body: JSON.stringify(data) });
  return normalizeStaff(result);
}

export async function updateStaff(id, data) {
  const result = await request(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return normalizeStaff(result);
}

export async function deleteStaff(id) {
  return request(`/api/staff/${id}`, { method: 'DELETE' });
}

// ─── Messages ───────────────────────────────────────────────────────────────
export async function getMessages(childId) {
  return request(`/api/messages/${childId}`);
}

export async function sendMessage(childId, text, receiverId) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ child_id: childId, text, receiver_id: receiverId }),
  });
}

// ─── Payments ───────────────────────────────────────────────────────────────
export async function getPayments() {
  return request('/api/payments');
}

export async function createPayment(data) {
  return request('/api/payments', { method: 'POST', body: JSON.stringify(data) });
}

export async function markPaymentPaid(id) {
  return request(`/api/payments/${id}/pay`, { method: 'PUT' });
}

export async function deletePayment(id) {
  return request(`/api/payments/${id}`, { method: 'DELETE' });
}

// ─── Reports ────────────────────────────────────────────────────────────────
export async function getReportsSummary() {
  return request('/api/reports/summary');
}

export async function getWeeklyAttendance() {
  return request('/api/reports/attendance-weekly');
}

// ─── Seed ────────────────────────────────────────────────────────────────────
export async function seedDatabase() {
  return request('/api/seed', { method: 'POST' });
}
