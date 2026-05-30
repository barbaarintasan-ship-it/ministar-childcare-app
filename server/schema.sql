-- Mini Star Childcare — Neon PostgreSQL Schema
-- Run this in Neon SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROFILES (users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent','teacher','admin')),
  phone TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CLASSROOMS
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🌟',
  capacity INT DEFAULT 10,
  age_min INT DEFAULT 2,
  age_max INT DEFAULT 5,
  color TEXT DEFAULT '#3da98a',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO classrooms (name, emoji, capacity, age_min, age_max, color) VALUES
  ('Sunflower', '🌻', 8, 2, 3, '#f59e0b'),
  ('Daisy',     '🌼', 8, 2, 3, '#10b981'),
  ('Rainbow',   '🌈', 8, 3, 4, '#3b82f6'),
  ('Butterfly', '🦋', 8, 4, 5, '#8b5cf6')
ON CONFLICT DO NOTHING;

-- CHILDREN
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  age INT,
  classroom_id UUID REFERENCES classrooms(id),
  parent_id UUID REFERENCES profiles(id),
  teacher_id UUID REFERENCES profiles(id),
  emoji TEXT DEFAULT '👶',
  color_index INT DEFAULT 0,
  allergies TEXT[] DEFAULT '{}',
  allergy_alert BOOLEAN DEFAULT false,
  medical_notes TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  emergency_phone TEXT DEFAULT '',
  enroll_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'not_arrived'
    CHECK (status IN ('not_arrived','checked_in','checked_out','absent','sleeping')),
  checkin_time TIMESTAMPTZ,
  checkout_time TIMESTAMPTZ,
  mood TEXT DEFAULT 'N/A',
  mood_emoji TEXT DEFAULT '😊',
  teacher_note TEXT DEFAULT '',
  photo_count INT DEFAULT 0,
  unread_messages INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- STAFF
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Teacher',
  classroom_id UUID REFERENCES classrooms(id),
  email TEXT,
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','on_leave','part_time','inactive')),
  certifications TEXT[] DEFAULT '{}',
  children_count INT DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 5.0,
  emoji TEXT DEFAULT '👤',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_arrived'
    CHECK (status IN ('not_arrived','checked_in','checked_out','absent')),
  checkin_time TIMESTAMPTZ,
  checkout_time TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, date)
);

-- SLEEP LOGS
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  sleep_start TIMESTAMPTZ,
  sleep_end TIMESTAMPTZ,
  duration_minutes INT,
  notes TEXT,
  logged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MEAL LOGS
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','morning_snack','lunch','afternoon_snack')),
  portion TEXT NOT NULL CHECK (portion IN ('all','most','some','none')),
  notes TEXT,
  logged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, date, meal_type)
);

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id),
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT DEFAULT 'learning',
  icon TEXT DEFAULT '🎨',
  color TEXT DEFAULT '#3da98a',
  scheduled_time TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE,
  logged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HEALTH NOTES
CREATE TABLE IF NOT EXISTS health_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('general','temperature','incident','medication')),
  text TEXT NOT NULL,
  temperature NUMERIC(4,1),
  icon TEXT DEFAULT '📝',
  color TEXT,
  date DATE DEFAULT CURRENT_DATE,
  logged_by UUID REFERENCES profiles(id),
  notified_parent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id),
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  payment_type TEXT DEFAULT 'Tuition',
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','paid','overdue','cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GROWTH RECORDS
CREATE TABLE IF NOT EXISTS growth_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,2),
  head_circumference_cm NUMERIC(5,1),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- VACCINATIONS
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  vaccine_name TEXT NOT NULL,
  scheduled_date DATE,
  given_date DATE,
  status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('given','due','overdue','scheduled')),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DAILY REPORTS
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  mood TEXT,
  mood_emoji TEXT,
  teacher_note TEXT,
  eating_score INT CHECK (eating_score BETWEEN 1 AND 5),
  sleeping_score INT CHECK (sleeping_score BETWEEN 1 AND 5),
  socializing_score INT CHECK (socializing_score BETWEEN 1 AND 5),
  learning_score INT CHECK (learning_score BETWEEN 1 AND 5),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, date)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_classroom ON children(classroom_id);
CREATE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance(child_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_child_date ON sleep_logs(child_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_child_date ON meal_logs(child_id, date);
CREATE INDEX IF NOT EXISTS idx_messages_child ON messages(child_id);
CREATE INDEX IF NOT EXISTS idx_payments_parent ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- DEMO ACCOUNTS (password: demo123)
INSERT INTO profiles (email, password_hash, full_name, role) VALUES
  ('admin@demo.com',   '$2a$10$NeFUlr4XFCVXtbHHSaQj0.rdufFEYyYWw9TpfdzMgLih3xNU3zanu', 'Admin User',           'admin'),
  ('teacher@demo.com', '$2a$10$NeFUlr4XFCVXtbHHSaQj0.rdufFEYyYWw9TpfdzMgLih3xNU3zanu', 'Ms. Patricia Torres',  'teacher'),
  ('parent@demo.com',  '$2a$10$NeFUlr4XFCVXtbHHSaQj0.rdufFEYyYWw9TpfdzMgLih3xNU3zanu', 'Sarah Johnson',        'parent')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
