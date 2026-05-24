// ─── CHILDREN ────────────────────────────────────────────────────────────────
export const CHILDREN = [
  {
    id: 'child-1',
    name: 'Emma Johnson',
    firstName: 'Emma',
    age: 3,
    dob: '2021-03-15',
    room: 'Sunflower',
    roomEmoji: '🌻',
    emoji: '👧',
    colorIndex: 0,
    status: 'checked_in',
    checkinTime: '7:45 AM',
    checkoutTime: null,
    mood: 'Happy',
    moodEmoji: '😄',
    allergies: ['Peanuts'],
    allergyAlert: true,
    medicalNotes: 'Carries EpiPen. Peanut allergy — severe.',
    parentName: 'Sarah Johnson',
    parentEmail: 'parent@demo.com',
    parentPhone: '+1 (555) 010-1001',
    emergencyContact: 'Tom Johnson (Father) — +1 (555) 010-1002',
    teacherId: 'staff-1',
    teacherName: 'Ms. Patricia Torres',
    enrollDate: '2023-09-01',
    sleepStart: '12:35',
    sleepEnd: '2:20',
    sleepDuration: '1h 45m',
    meals: { breakfast: 'all', morningSnack: 'most', lunch: 'some', afternoonSnack: null },
    wellness: { eating: 80, sleeping: 90, socializing: 95, learning: 85 },
    teacherNote: 'Emma had a wonderful day! She loved the finger painting and shared her artwork with all her friends.',
    photoCount: 6,
    unreadMessages: 2,
  },
  {
    id: 'child-2',
    name: 'Liam Smith',
    firstName: 'Liam',
    age: 4,
    dob: '2020-07-22',
    room: 'Daisy',
    roomEmoji: '🌼',
    emoji: '👦',
    colorIndex: 1,
    status: 'checked_in',
    checkinTime: '8:10 AM',
    checkoutTime: null,
    mood: 'Excited',
    moodEmoji: '🤩',
    allergies: [],
    allergyAlert: false,
    medicalNotes: '',
    parentName: 'Mike Smith',
    parentEmail: 'mike@demo.com',
    parentPhone: '+1 (555) 020-2001',
    emergencyContact: 'Julie Smith (Mother) — +1 (555) 020-2002',
    teacherId: 'staff-3',
    teacherName: 'Mr. David Chen',
    enrollDate: '2022-09-01',
    sleepStart: '12:40',
    sleepEnd: '2:15',
    sleepDuration: '1h 35m',
    meals: { breakfast: 'all', morningSnack: 'all', lunch: 'most', afternoonSnack: null },
    wellness: { eating: 95, sleeping: 80, socializing: 90, learning: 88 },
    teacherNote: 'Liam was very enthusiastic during science class today. He asked excellent questions!',
    photoCount: 4,
    unreadMessages: 0,
  },
  {
    id: 'child-3',
    name: 'Sofia Garcia',
    firstName: 'Sofia',
    age: 2,
    dob: '2022-01-10',
    room: 'Sunflower',
    roomEmoji: '🌻',
    emoji: '👧',
    colorIndex: 2,
    status: 'absent',
    checkinTime: null,
    checkoutTime: null,
    mood: 'N/A',
    moodEmoji: '😶',
    allergies: ['Dairy'],
    allergyAlert: true,
    medicalNotes: 'Lactose intolerant. Use dairy-free alternatives.',
    parentName: 'Maria Garcia',
    parentEmail: 'maria@demo.com',
    parentPhone: '+1 (555) 030-3001',
    emergencyContact: 'Carlos Garcia (Father) — +1 (555) 030-3002',
    teacherId: 'staff-1',
    teacherName: 'Ms. Patricia Torres',
    enrollDate: '2023-01-15',
    sleepStart: null,
    sleepEnd: null,
    sleepDuration: null,
    meals: {},
    wellness: { eating: 0, sleeping: 0, socializing: 0, learning: 0 },
    teacherNote: '',
    photoCount: 0,
    unreadMessages: 1,
  },
  {
    id: 'child-4',
    name: 'Noah Williams',
    firstName: 'Noah',
    age: 5,
    dob: '2019-11-05',
    room: 'Rainbow',
    roomEmoji: '🌈',
    emoji: '👦',
    colorIndex: 3,
    status: 'checked_in',
    checkinTime: '8:30 AM',
    checkoutTime: null,
    mood: 'Playful',
    moodEmoji: '😊',
    allergies: [],
    allergyAlert: false,
    medicalNotes: '',
    parentName: 'James Williams',
    parentEmail: 'james@demo.com',
    parentPhone: '+1 (555) 040-4001',
    emergencyContact: 'Anna Williams (Mother) — +1 (555) 040-4002',
    teacherId: 'staff-4',
    teacherName: 'Ms. Amy Wilson',
    enrollDate: '2021-09-01',
    sleepStart: '12:30',
    sleepEnd: '2:00',
    sleepDuration: '1h 30m',
    meals: { breakfast: 'all', morningSnack: 'most', lunch: 'all', afternoonSnack: null },
    wellness: { eating: 100, sleeping: 75, socializing: 95, learning: 92 },
    teacherNote: 'Noah showed great leadership during group activities. Very proud of him!',
    photoCount: 8,
    unreadMessages: 0,
  },
  {
    id: 'child-5',
    name: 'Mia Brown',
    firstName: 'Mia',
    age: 3,
    dob: '2021-06-18',
    room: 'Daisy',
    roomEmoji: '🌼',
    emoji: '👧',
    colorIndex: 4,
    status: 'checked_out',
    checkinTime: '7:55 AM',
    checkoutTime: '3:30 PM',
    mood: 'Tired',
    moodEmoji: '😴',
    allergies: ['Gluten'],
    allergyAlert: true,
    medicalNotes: 'Mild gluten sensitivity. Offer gluten-free options.',
    parentName: 'Lisa Brown',
    parentEmail: 'lisa@demo.com',
    parentPhone: '+1 (555) 050-5001',
    emergencyContact: 'Tom Brown (Father) — +1 (555) 050-5002',
    teacherId: 'staff-3',
    teacherName: 'Mr. David Chen',
    enrollDate: '2022-03-10',
    sleepStart: '12:45',
    sleepEnd: '2:30',
    sleepDuration: '1h 45m',
    meals: { breakfast: 'most', morningSnack: 'some', lunch: 'most', afternoonSnack: 'all' },
    wellness: { eating: 75, sleeping: 92, socializing: 85, learning: 80 },
    teacherNote: 'Mia was a bit tired today but still participated well in all activities.',
    photoCount: 5,
    unreadMessages: 0,
  },
  {
    id: 'child-6',
    name: 'Oliver Davis',
    firstName: 'Oliver',
    age: 4,
    dob: '2020-09-12',
    room: 'Rainbow',
    roomEmoji: '🌈',
    emoji: '👦',
    colorIndex: 5,
    status: 'checked_in',
    checkinTime: '8:00 AM',
    checkoutTime: null,
    mood: 'Happy',
    moodEmoji: '😄',
    allergies: [],
    allergyAlert: false,
    medicalNotes: '',
    parentName: 'Robert Davis',
    parentEmail: 'robert@demo.com',
    parentPhone: '+1 (555) 060-6001',
    emergencyContact: 'Susan Davis (Mother) — +1 (555) 060-6002',
    teacherId: 'staff-4',
    teacherName: 'Ms. Amy Wilson',
    enrollDate: '2022-09-01',
    sleepStart: '12:35',
    sleepEnd: '2:10',
    sleepDuration: '1h 35m',
    meals: { breakfast: 'all', morningSnack: 'all', lunch: 'all', afternoonSnack: null },
    wellness: { eating: 100, sleeping: 88, socializing: 92, learning: 95 },
    teacherNote: 'Oliver was absolutely delightful today. He helped younger children during art time.',
    photoCount: 7,
    unreadMessages: 3,
  },
];

// ─── STAFF ────────────────────────────────────────────────────────────────────
export const STAFF = [
  {
    id: 'staff-1',
    name: 'Ms. Patricia Torres',
    firstName: 'Patricia',
    role: 'Lead Teacher',
    room: 'Sunflower',
    roomEmoji: '🌻',
    email: 'teacher@demo.com',
    phone: '+1 (555) 100-1001',
    emoji: '👩‍🏫',
    colorIndex: 0,
    startDate: '2020-09-01',
    status: 'active',
    certifications: ['CPR', 'First Aid', 'Early Childhood Education'],
    bio: '8 years of experience in early childhood education. Specializes in arts and creative development.',
  },
  {
    id: 'staff-2',
    name: 'Ms. Rosa Martinez',
    firstName: 'Rosa',
    role: 'Assistant Teacher',
    room: 'Sunflower',
    roomEmoji: '🌻',
    email: 'rosa@ministar.com',
    phone: '+1 (555) 100-1002',
    emoji: '👩',
    colorIndex: 1,
    startDate: '2021-03-15',
    status: 'active',
    certifications: ['CPR', 'First Aid'],
    bio: 'Passionate about nurturing young minds. Bilingual English/Spanish.',
  },
  {
    id: 'staff-3',
    name: 'Mr. David Chen',
    firstName: 'David',
    role: 'Lead Teacher',
    room: 'Daisy',
    roomEmoji: '🌼',
    email: 'david@ministar.com',
    phone: '+1 (555) 100-1003',
    emoji: '👨‍🏫',
    colorIndex: 2,
    startDate: '2019-08-20',
    status: 'active',
    certifications: ['CPR', 'First Aid', 'Early Childhood Education', 'Montessori Certified'],
    bio: '10 years experience. Montessori certified. Passionate about STEM for young children.',
  },
  {
    id: 'staff-4',
    name: 'Ms. Amy Wilson',
    firstName: 'Amy',
    role: 'Lead Teacher',
    room: 'Rainbow',
    roomEmoji: '🌈',
    email: 'amy@ministar.com',
    phone: '+1 (555) 100-1004',
    emoji: '👩',
    colorIndex: 3,
    startDate: '2022-01-10',
    status: 'active',
    certifications: ['CPR', 'First Aid', 'Special Education'],
    bio: 'Specializes in inclusive education and supporting children with diverse learning needs.',
  },
  {
    id: 'staff-5',
    name: 'Mr. James Lee',
    firstName: 'James',
    role: 'Assistant Teacher',
    room: 'Daisy',
    roomEmoji: '🌼',
    email: 'james@ministar.com',
    phone: '+1 (555) 100-1005',
    emoji: '👨',
    colorIndex: 4,
    startDate: '2023-06-01',
    status: 'active',
    certifications: ['CPR', 'First Aid'],
    bio: 'New to teaching but brings enthusiasm and creativity to the classroom.',
  },
  {
    id: 'staff-6',
    name: 'Linda Park',
    firstName: 'Linda',
    role: 'Administrator',
    room: 'Office',
    roomEmoji: '🏢',
    email: 'admin@demo.com',
    phone: '+1 (555) 100-1006',
    emoji: '👩‍💼',
    colorIndex: 5,
    startDate: '2018-01-15',
    status: 'active',
    certifications: ['CPR', 'Center Director Credential', 'Business Administration'],
    bio: 'Center director with 12+ years in childcare administration.',
  },
];

// ─── TODAY'S ACTIVITIES ───────────────────────────────────────────────────────
export const TODAY_ACTIVITIES = [
  { id: 'a1', time: '8:00 AM', icon: '🌅', type: 'circle', title: 'Morning Circle', desc: 'Greetings, calendar, and weather discussion', completed: true, color: '#3da98a' },
  { id: 'a2', time: '9:00 AM', icon: '🎨', type: 'art', title: 'Art & Craft', desc: 'Ocean-themed finger painting', completed: true, color: '#e8633a' },
  { id: 'a3', time: '10:30 AM', icon: '📚', type: 'story', title: 'Story Time', desc: '"The Very Hungry Caterpillar"', completed: true, color: '#3b82f6' },
  { id: 'a4', time: '11:00 AM', icon: '🌳', type: 'outdoor', title: 'Outdoor Play', desc: 'Playground and sandbox', completed: true, color: '#10b981' },
  { id: 'a5', time: '12:00 PM', icon: '🍽', type: 'meal', title: 'Lunch', desc: 'Mac & Cheese with steamed veggies', completed: true, color: '#f59e0b' },
  { id: 'a6', time: '12:30 PM', icon: '😴', type: 'nap', title: 'Nap Time', desc: 'Rest and quiet time', completed: true, color: '#8b5cf6' },
  { id: 'a7', time: '2:30 PM', icon: '🧩', type: 'puzzle', title: 'Puzzle Play', desc: 'Shape sorting and building blocks', completed: false, color: '#ec4899' },
  { id: 'a8', time: '3:30 PM', icon: '🎵', type: 'music', title: 'Music & Dance', desc: 'Songs, movement, and rhythm', completed: false, color: '#14b8a6' },
  { id: 'a9', time: '4:00 PM', icon: '🍎', type: 'snack', title: 'Afternoon Snack', desc: 'Apple slices and crackers', completed: false, color: '#f97316' },
  { id: 'a10', time: '5:00 PM', icon: '🚗', type: 'pickup', title: 'Pickup Time', desc: 'Children ready for parents', completed: false, color: '#6b7280' },
];

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const MESSAGES = [
  { id: 'm1', role: 'teacher', sender: 'Ms. Patricia Torres', text: 'Good morning! Emma arrived safely and is having a great day. She loved the morning circle! 🌟', time: '8:02 AM', read: true },
  { id: 'm2', role: 'parent', sender: 'Sarah Johnson', text: "That's wonderful! She was so excited this morning 😊", time: '8:30 AM', read: true },
  { id: 'm3', role: 'teacher', sender: 'Ms. Patricia Torres', text: 'Emma had a wonderful day! She loved the finger painting and shared her artwork with all her friends. 🎨', time: '2:10 PM', read: true },
  { id: 'm4', role: 'teacher', sender: 'Ms. Patricia Torres', text: 'Reminder: Picture Day is this Friday May 29! Please dress Emma in her favourite outfit. 📸', time: '3:00 PM', read: false },
  { id: 'm5', role: 'teacher', sender: 'Ms. Patricia Torres', text: 'Also, please remember to bring sunscreen this week for outdoor play ☀️', time: '3:01 PM', read: false },
];

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const PAYMENTS = [
  { id: 'p1', date: 'Jun 1, 2025', desc: 'Monthly Tuition — June 2025', amount: 1200, status: 'upcoming', method: null, dueDate: 'Jun 1, 2025' },
  { id: 'p2', date: 'May 1, 2025', desc: 'Monthly Tuition — May 2025', amount: 1200, status: 'paid', method: 'Visa ••4242', paidDate: 'May 1, 2025' },
  { id: 'p3', date: 'Apr 1, 2025', desc: 'Monthly Tuition — April 2025', amount: 1200, status: 'paid', method: 'Visa ••4242', paidDate: 'Apr 1, 2025' },
  { id: 'p4', date: 'Mar 15, 2025', desc: 'Field Trip — Zoo Visit 🦁', amount: 25, status: 'paid', method: 'Cash', paidDate: 'Mar 14, 2025' },
  { id: 'p5', date: 'Mar 1, 2025', desc: 'Monthly Tuition — March 2025', amount: 1200, status: 'paid', method: 'Bank Transfer', paidDate: 'Mar 1, 2025' },
  { id: 'p6', date: 'Feb 1, 2025', desc: 'Monthly Tuition — February 2025', amount: 1200, status: 'paid', method: 'Visa ••4242', paidDate: 'Feb 1, 2025' },
];

// ─── GROWTH RECORDS ───────────────────────────────────────────────────────────
export const GROWTH_RECORDS = [
  { id: 'g1', date: '2024-09-01', age: '3y 6m', height: 95.2, weight: 14.8, headCirc: 49.5 },
  { id: 'g2', date: '2024-12-01', age: '3y 9m', height: 96.8, weight: 15.1, headCirc: 49.8 },
  { id: 'g3', date: '2025-03-01', age: '4y 0m', height: 98.5, weight: 15.6, headCirc: 50.1 },
  { id: 'g4', date: '2025-05-01', age: '4y 2m', height: 99.3, weight: 15.9, headCirc: 50.2 },
];

// ─── VACCINATIONS ─────────────────────────────────────────────────────────────
export const VACCINATIONS = [
  { id: 'v1', name: 'MMR (Measles, Mumps, Rubella)', dateGiven: 'Oct 15, 2021', nextDue: null, status: 'given' },
  { id: 'v2', name: 'DTaP (Diphtheria, Tetanus, Pertussis)', dateGiven: 'Oct 15, 2021', nextDue: 'Oct 2026', status: 'given' },
  { id: 'v3', name: 'Varicella (Chickenpox)', dateGiven: 'Apr 20, 2022', nextDue: null, status: 'given' },
  { id: 'v4', name: 'Annual Flu Vaccine', dateGiven: 'Sep 10, 2024', nextDue: 'Sep 2025', status: 'due' },
  { id: 'v5', name: 'Hepatitis A', dateGiven: 'Jan 5, 2023', nextDue: null, status: 'given' },
  { id: 'v6', name: 'PCV13 (Pneumococcal)', dateGiven: 'Oct 15, 2021', nextDue: null, status: 'given' },
];

// ─── NOTICES ──────────────────────────────────────────────────────────────────
export const NOTICES = [
  { id: 'n1', icon: '📸', text: 'Picture Day Friday May 29! Dress your little star nicely.', color: '#3b82f6', lightColor: '#dbeafe' },
  { id: 'n2', icon: '☀️', text: 'Please bring sunscreen this week for outdoor play.', color: '#f59e0b', lightColor: '#fef3c7' },
  { id: 'n3', icon: '🍕', text: 'Pizza Friday this week! No need to pack lunch on Friday.', color: '#e8633a', lightColor: '#faece7' },
];

// ─── THIS WEEK ────────────────────────────────────────────────────────────────
export const THIS_WEEK = [
  { day: 'Mon', date: '26', event: 'Outdoor Play' },
  { day: 'Tue', date: '27', event: 'Science Fun' },
  { day: 'Wed', date: '28', event: 'Cooking Day' },
  { day: 'Thu', date: '29', event: 'Photo Day 📸' },
  { day: 'Fri', date: '30', event: 'Show & Tell' },
];

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
export const ADMIN_STATS = {
  totalChildren: 24,
  totalStaff: 8,
  presentToday: 20,
  absentToday: 4,
  attendanceRate: 83,
  monthlyRevenue: 28800,
  revenueGrowth: 4.2,
  newEnrollments: 3,
  pendingPayments: 2,
};

// ─── WEEKLY ATTENDANCE (for charts) ──────────────────────────────────────────
export const WEEKLY_ATTENDANCE = [
  { day: 'Mon', present: 22, absent: 2 },
  { day: 'Tue', present: 23, absent: 1 },
  { day: 'Wed', present: 20, absent: 4 },
  { day: 'Thu', present: 24, absent: 0 },
  { day: 'Fri', present: 19, absent: 5 },
];

// ─── MEAL STATS ───────────────────────────────────────────────────────────────
export const MEAL_STATS = [
  { name: 'All Eaten', value: 45, color: '#10b981' },
  { name: 'Most', value: 30, color: '#3b82f6' },
  { name: 'Some', value: 15, color: '#f59e0b' },
  { name: 'Not Eaten', value: 10, color: '#ef4444' },
];

// ─── MONTHLY REVENUE ──────────────────────────────────────────────────────────
export const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 24000 },
  { month: 'Feb', revenue: 24800 },
  { month: 'Mar', revenue: 25600 },
  { month: 'Apr', revenue: 26400 },
  { month: 'May', revenue: 27600 },
  { month: 'Jun', revenue: 28800 },
];

// ─── INVOICES ─────────────────────────────────────────────────────────────────
export const INVOICES = [
  { id: 'inv1', child: 'Emma Johnson', parent: 'Sarah Johnson', amount: 1200, date: 'May 1, 2025', dueDate: 'May 15, 2025', status: 'paid' },
  { id: 'inv2', child: 'Liam Smith', parent: 'Mike Smith', amount: 1200, date: 'May 1, 2025', dueDate: 'May 15, 2025', status: 'paid' },
  { id: 'inv3', child: 'Noah Williams', parent: 'James Williams', amount: 1200, date: 'May 1, 2025', dueDate: 'May 15, 2025', status: 'overdue' },
  { id: 'inv4', child: 'Mia Brown', parent: 'Lisa Brown', amount: 1200, date: 'Jun 1, 2025', dueDate: 'Jun 15, 2025', status: 'upcoming' },
  { id: 'inv5', child: 'Oliver Davis', parent: 'Robert Davis', amount: 1200, date: 'Jun 1, 2025', dueDate: 'Jun 15, 2025', status: 'upcoming' },
  { id: 'inv6', child: 'Sofia Garcia', parent: 'Maria Garcia', amount: 1200, date: 'Apr 1, 2025', dueDate: 'Apr 15, 2025', status: 'paid' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const CARD_COLORS = [
  '#e1f5ee', '#dbeafe', '#ede9fe', '#ffedd5', '#fce7f3',
  '#fef3c7', '#ccfbf1', '#fee2e2', '#f3e8ff', '#dcfce7',
];

export const CARD_TEXT_COLORS = [
  '#065f46', '#1e40af', '#4c1d95', '#7c2d12', '#831843',
  '#78350f', '#134e4a', '#7f1d1d', '#581c87', '#14532d',
];

export function getChildColor(index) {
  return {
    bg: CARD_COLORS[index % CARD_COLORS.length],
    text: CARD_TEXT_COLORS[index % CARD_TEXT_COLORS.length],
  };
}

export function getStatusColor(status) {
  switch (status) {
    case 'checked_in': return { type: 'success', label: 'Checked In' };
    case 'checked_out': return { type: 'info', label: 'Checked Out' };
    case 'absent': return { type: 'error', label: 'Absent' };
    default: return { type: 'gray', label: 'Not Arrived' };
  }
}

export function getMealLabel(portion) {
  switch (portion) {
    case 'all': return 'All eaten';
    case 'most': return 'Most eaten';
    case 'some': return 'Some eaten';
    case 'none': return 'Not eaten';
    default: return '—';
  }
}
