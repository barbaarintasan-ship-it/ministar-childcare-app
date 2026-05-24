-- ============================================================
-- Mini Star Childcare — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL editor to set up all tables.
-- Enable Row Level Security (RLS) on all tables.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('parent', 'teacher', 'admin')),
  avatar_url text,
  phone text,
  email text,
  language text default 'en' check (language in ('en', 'es')),
  push_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CLASSROOMS
-- ============================================================
create table public.classrooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  emoji text default '🌟',
  capacity int default 10,
  age_min int default 2,
  age_max int default 5,
  color text default '#3da98a',
  created_at timestamptz default now()
);

alter table public.classrooms enable row level security;

create policy "Authenticated users can view classrooms"
  on public.classrooms for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage classrooms"
  on public.classrooms for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Default classrooms
insert into public.classrooms (name, emoji, capacity, age_min, age_max, color) values
  ('Sunflower', '🌻', 8, 2, 3, '#f59e0b'),
  ('Daisy', '🌼', 8, 2, 3, '#10b981'),
  ('Rainbow', '🌈', 8, 3, 4, '#3b82f6'),
  ('Butterfly', '🦋', 8, 4, 5, '#8b5cf6');

-- ============================================================
-- CHILDREN
-- ============================================================
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  age int,
  classroom_id uuid references public.classrooms(id),
  parent_id uuid references public.profiles(id),
  teacher_id uuid references public.profiles(id),
  emoji text default '👶',
  color_index int default 0,
  allergies text[] default '{}',
  allergy_alert boolean default false,
  medical_notes text default '',
  emergency_contact text default '',
  emergency_phone text default '',
  enroll_date date default current_date,
  status text default 'not_arrived' check (status in ('not_arrived','checked_in','checked_out','absent','sleeping')),
  checkin_time timestamptz,
  checkout_time timestamptz,
  mood text default 'N/A',
  mood_emoji text default '😊',
  teacher_note text default '',
  photo_count int default 0,
  unread_messages int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.children enable row level security;

create policy "Parents can view own children"
  on public.children for select
  using (parent_id = auth.uid());

create policy "Teachers can view children in their classroom"
  on public.children for select
  using (teacher_id = auth.uid());

create policy "Admins can manage all children"
  on public.children for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
  );

-- ============================================================
-- STAFF
-- ============================================================
create table public.staff (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  role text not null default 'Teacher',
  classroom_id uuid references public.classrooms(id),
  email text,
  phone text,
  hire_date date default current_date,
  status text default 'active' check (status in ('active', 'on_leave', 'part_time', 'inactive')),
  certifications text[] default '{}',
  children_count int default 0,
  rating numeric(3,1) default 5.0,
  emoji text default '👤',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.staff enable row level security;

create policy "Staff and admins can view staff"
  on public.staff for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

create policy "Admins can manage staff"
  on public.staff for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- ATTENDANCE
-- ============================================================
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  date date default current_date not null,
  status text not null default 'not_arrived' check (status in ('not_arrived','checked_in','checked_out','absent')),
  checkin_time timestamptz,
  checkout_time timestamptz,
  checked_in_by uuid references public.profiles(id),
  checked_out_by uuid references public.profiles(id),
  notes text,
  qr_checkin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(child_id, date)
);

alter table public.attendance enable row level security;

create policy "Parents can view own child attendance"
  on public.attendance for select
  using (
    exists (select 1 from public.children where id = child_id and parent_id = auth.uid())
  );

create policy "Teachers and admins can manage attendance"
  on public.attendance for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- SLEEP LOGS
-- ============================================================
create table public.sleep_logs (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  date date default current_date not null,
  sleep_start timestamptz,
  sleep_end timestamptz,
  duration_minutes int,
  notes text,
  logged_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.sleep_logs enable row level security;

create policy "Parents can view own child sleep logs"
  on public.sleep_logs for select
  using (
    exists (select 1 from public.children where id = child_id and parent_id = auth.uid())
  );

create policy "Teachers and admins can manage sleep logs"
  on public.sleep_logs for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- MEAL LOGS
-- ============================================================
create table public.meal_logs (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  date date default current_date not null,
  meal_type text not null check (meal_type in ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack')),
  portion text not null check (portion in ('all', 'most', 'some', 'none')),
  notes text,
  logged_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  unique(child_id, date, meal_type)
);

alter table public.meal_logs enable row level security;

create policy "Parents can view own child meal logs"
  on public.meal_logs for select
  using (
    exists (select 1 from public.children where id = child_id and parent_id = auth.uid())
  );

create policy "Teachers and admins can manage meal logs"
  on public.meal_logs for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  classroom_id uuid references public.classrooms(id),
  title text not null,
  description text,
  activity_type text default 'learning',
  icon text default '🎨',
  color text default '#3da98a',
  scheduled_time text,
  completed boolean default false,
  completed_at timestamptz,
  date date default current_date,
  logged_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

create policy "All authenticated users can view activities"
  on public.activity_logs for select
  using (auth.role() = 'authenticated');

create policy "Teachers and admins can manage activities"
  on public.activity_logs for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- HEALTH NOTES
-- ============================================================
create table public.health_notes (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  note_type text not null check (note_type in ('general', 'temperature', 'incident', 'medication')),
  text text not null,
  temperature numeric(4,1),
  icon text default '📝',
  color text,
  date date default current_date,
  logged_by uuid references public.profiles(id),
  notified_parent boolean default false,
  created_at timestamptz default now()
);

alter table public.health_notes enable row level security;

create policy "Parents can view own child health notes"
  on public.health_notes for select
  using (
    exists (select 1 from public.children where id = child_id and parent_id = auth.uid())
  );

create policy "Teachers and admins can manage health notes"
  on public.health_notes for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- PHOTOS
-- ============================================================
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  storage_path text not null,
  thumbnail_path text,
  caption text,
  tags uuid[] default '{}',
  classroom_id uuid references public.classrooms(id),
  uploaded_by uuid references public.profiles(id),
  date date default current_date,
  visible_to_parents boolean default true,
  created_at timestamptz default now()
);

alter table public.photos enable row level security;

create policy "Parents can view photos visible to parents"
  on public.photos for select
  using (visible_to_parents = true and auth.role() = 'authenticated');

create policy "Teachers and admins can manage photos"
  on public.photos for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- MESSAGES
-- ============================================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id),
  text text not null,
  read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view messages they sent or received"
  on public.messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Users can send messages"
  on public.messages for insert
  with check (sender_id = auth.uid());

create policy "Receivers can mark messages as read"
  on public.messages for update
  using (receiver_id = auth.uid());

-- ============================================================
-- PAYMENTS / INVOICES
-- ============================================================
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  parent_id uuid references public.profiles(id),
  amount numeric(10,2) not null,
  description text,
  payment_type text default 'Tuition',
  status text not null default 'upcoming' check (status in ('upcoming', 'paid', 'overdue', 'cancelled')),
  due_date date not null,
  paid_date date,
  payment_method text,
  invoice_number text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Parents can view own payments"
  on public.payments for select
  using (parent_id = auth.uid());

create policy "Admins can manage all payments"
  on public.payments for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- GROWTH RECORDS
-- ============================================================
create table public.growth_records (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  date date default current_date not null,
  height_cm numeric(5,1),
  weight_kg numeric(5,2),
  head_circumference_cm numeric(5,1),
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.growth_records enable row level security;

create policy "Parents can view own child growth records"
  on public.growth_records for select
  using (
    exists (select 1 from public.children where id = child_id and parent_id = auth.uid())
  );

create policy "Teachers and admins can manage growth records"
  on public.growth_records for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- VACCINATIONS
-- ============================================================
create table public.vaccinations (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  vaccine_name text not null,
  scheduled_date date,
  given_date date,
  status text not null default 'due' check (status in ('given', 'due', 'overdue', 'scheduled')),
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.vaccinations enable row level security;

create policy "Parents can view own child vaccinations"
  on public.vaccinations for select
  using (
    exists (select 1 from public.children where id = child_id and parent_id = auth.uid())
  );

create policy "Admins can manage vaccinations"
  on public.vaccinations for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- NOTICES / ANNOUNCEMENTS
-- ============================================================
create table public.notices (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  body text not null,
  type text default 'info' check (type in ('info', 'warning', 'event', 'urgent')),
  icon text default '📢',
  color text default '#3da98a',
  target_role text check (target_role in ('all', 'parent', 'teacher', 'admin')),
  classroom_id uuid references public.classrooms(id),
  created_by uuid references public.profiles(id),
  expires_at date,
  created_at timestamptz default now()
);

alter table public.notices enable row level security;

create policy "All authenticated users can view relevant notices"
  on public.notices for select
  using (
    auth.role() = 'authenticated' and (
      target_role = 'all' or
      target_role = (select role from public.profiles where id = auth.uid())
    )
  );

create policy "Admins can manage notices"
  on public.notices for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- DAILY REPORTS (denormalized summary per child per day)
-- ============================================================
create table public.daily_reports (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  date date default current_date not null,
  mood text,
  mood_emoji text,
  teacher_note text,
  eating_score int check (eating_score between 1 and 5),
  sleeping_score int check (sleeping_score between 1 and 5),
  socializing_score int check (socializing_score between 1 and 5),
  learning_score int check (learning_score between 1 and 5),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(child_id, date)
);

alter table public.daily_reports enable row level security;

create policy "Parents can view own child daily reports"
  on public.daily_reports for select
  using (
    exists (select 1 from public.children where id = child_id and parent_id = auth.uid())
  );

create policy "Teachers and admins can manage daily reports"
  on public.daily_reports for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Today's attendance summary
create or replace view public.today_attendance_summary as
select
  c.id as classroom_id,
  c.name as classroom_name,
  count(ch.id) as total,
  count(case when a.status = 'checked_in' then 1 end) as present,
  count(case when a.status = 'absent' then 1 end) as absent,
  count(case when a.status = 'not_arrived' then 1 end) as not_arrived
from public.classrooms c
left join public.children ch on ch.classroom_id = c.id and ch.active = true
left join public.attendance a on a.child_id = ch.id and a.date = current_date
group by c.id, c.name;

-- Monthly revenue summary
create or replace view public.monthly_revenue_summary as
select
  date_trunc('month', due_date) as month,
  sum(amount) as total_invoiced,
  sum(case when status = 'paid' then amount else 0 end) as total_collected,
  sum(case when status = 'overdue' then amount else 0 end) as total_overdue,
  count(*) as invoice_count,
  count(case when status = 'paid' then 1 end) as paid_count,
  count(case when status = 'overdue' then 1 end) as overdue_count
from public.payments
group by date_trunc('month', due_date)
order by month desc;

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_children_parent_id on public.children(parent_id);
create index idx_children_teacher_id on public.children(teacher_id);
create index idx_children_classroom_id on public.children(classroom_id);
create index idx_attendance_child_date on public.attendance(child_id, date);
create index idx_sleep_logs_child_date on public.sleep_logs(child_id, date);
create index idx_meal_logs_child_date on public.meal_logs(child_id, date);
create index idx_health_notes_child on public.health_notes(child_id);
create index idx_messages_child on public.messages(child_id);
create index idx_messages_sender on public.messages(sender_id);
create index idx_messages_receiver on public.messages(receiver_id);
create index idx_payments_child on public.payments(child_id);
create index idx_payments_parent on public.payments(parent_id);
create index idx_payments_status on public.payments(status);
create index idx_growth_child on public.growth_records(child_id);
create index idx_vaccinations_child on public.vaccinations(child_id);
create index idx_daily_reports_child_date on public.daily_reports(child_id, date);

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or management API)
-- ============================================================
-- Create these storage buckets in Supabase Storage:
--   "photos"    — public read, authenticated write
--   "avatars"   — public read, authenticated write
--   "documents" — private, authenticated read/write

-- Storage policy example for photos bucket:
-- insert into storage.objects(bucket_id, name, owner, ...) ...
-- Policies are managed in the Supabase dashboard under Storage.
