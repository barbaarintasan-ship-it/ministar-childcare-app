import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this after Fly.io deployment
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

// ─── Auth ───────────────────────────────────────────────
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

// ─── Children ───────────────────────────────────────────
export async function getChildren() {
  return request('/api/children');
}

export async function getChild(id) {
  return request(`/api/children/${id}`);
}

export async function createChild(data) {
  return request('/api/children', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateChild(id, data) {
  return request(`/api/children/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteChild(id) {
  return request(`/api/children/${id}`, { method: 'DELETE' });
}

// ─── Attendance ─────────────────────────────────────────
export async function getAttendance(date) {
  const q = date ? `?date=${date}` : '';
  return request(`/api/attendance${q}`);
}

export async function updateAttendance(childId, data) {
  return request(`/api/attendance/${childId}`, { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Staff ──────────────────────────────────────────────
export async function getStaff() {
  return request('/api/staff');
}

export async function createStaff(data) {
  return request('/api/staff', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateStaff(id, data) {
  return request(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteStaff(id) {
  return request(`/api/staff/${id}`, { method: 'DELETE' });
}

// ─── Messages ───────────────────────────────────────────
export async function getMessages(childId) {
  return request(`/api/messages/${childId}`);
}

export async function sendMessage(childId, text, receiverId) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ child_id: childId, text, receiver_id: receiverId }),
  });
}

// ─── Payments ───────────────────────────────────────────
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

// ─── Reports ────────────────────────────────────────────
export async function getReportsSummary() {
  return request('/api/reports/summary');
}

export async function getWeeklyAttendance() {
  return request('/api/reports/attendance-weekly');
}
