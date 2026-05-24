import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper: fetch children for a parent
export async function getChildrenForParent(parentEmail) {
  const { data, error } = await supabase
    .from('children')
    .select('*, classrooms(name), staff(name)')
    .eq('parent_email', parentEmail);
  return { data, error };
}

// Helper: fetch daily report for a child
export async function getDailyReport(childId, date) {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('child_id', childId)
    .eq('date', date)
    .single();
  return { data, error };
}

// Helper: fetch messages between parent and teacher
export async function getMessages(childId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: true });
  return { data, error };
}

// Helper: send a message
export async function sendMessage(childId, senderId, senderRole, text) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ child_id: childId, sender_id: senderId, sender_role: senderRole, text });
  return { data, error };
}

// Helper: get all children (teacher/admin)
export async function getAllChildren() {
  const { data, error } = await supabase
    .from('children')
    .select('*, classrooms(name)')
    .order('name');
  return { data, error };
}

// Helper: update attendance
export async function updateAttendance(childId, date, status, checkinTime, checkoutTime) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert({ child_id: childId, date, status, checkin_time: checkinTime, checkout_time: checkoutTime });
  return { data, error };
}

// Helper: log meal
export async function logMeal(childId, date, mealType, portion, notes) {
  const { data, error } = await supabase
    .from('meal_logs')
    .upsert({ child_id: childId, date, meal_type: mealType, portion, notes });
  return { data, error };
}

// Helper: log sleep
export async function logSleep(childId, date, sleepStart, sleepEnd) {
  const { data, error } = await supabase
    .from('sleep_logs')
    .upsert({ child_id: childId, date, sleep_start: sleepStart, sleep_end: sleepEnd });
  return { data, error };
}

// Helper: add activity log
export async function addActivity(teacherId, activityType, title, description, time, childIds) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({ teacher_id: teacherId, activity_type: activityType, title, description, activity_time: time, child_ids: childIds });
  return { data, error };
}

// Helper: add health note
export async function addHealthNote(childId, teacherId, noteType, text, temperature) {
  const { data, error } = await supabase
    .from('health_notes')
    .insert({ child_id: childId, teacher_id: teacherId, note_type: noteType, text, temperature });
  return { data, error };
}

// Helper: upload photo
export async function uploadPhoto(uri, childId, caption, uploadedBy) {
  const fileName = `${childId}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('child-photos')
    .upload(fileName, blob, { contentType: 'image/jpeg' });
  if (uploadError) return { error: uploadError };
  const { data: urlData } = supabase.storage.from('child-photos').getPublicUrl(fileName);
  const { data, error } = await supabase
    .from('photos')
    .insert({ child_id: childId, url: urlData.publicUrl, caption, uploaded_by: uploadedBy });
  return { data, error };
}

// Helper: get staff list
export async function getStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name');
  return { data, error };
}

// Helper: get payments for a child
export async function getPayments(parentEmail) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('parent_email', parentEmail)
    .order('due_date', { ascending: false });
  return { data, error };
}

// Helper: get growth records
export async function getGrowthRecords(childId) {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('child_id', childId)
    .order('recorded_date', { ascending: true });
  return { data, error };
}

// Helper: get vaccination records
export async function getVaccinations(childId) {
  const { data, error } = await supabase
    .from('vaccinations')
    .select('*')
    .eq('child_id', childId)
    .order('date_given', { ascending: false });
  return { data, error };
}
