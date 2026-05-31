-- 1. Enable Row Level Security (RLS) on the database
-- 2. Create the Profiles table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('professional', 'facility', 'admin')),
  full_name text not null,
  tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Create Credentials table
CREATE TABLE public.credentials (
  id uuid default uuid_generate_v4() primary key,
  professional_id uuid references public.profiles(id) on delete cascade not null,
  document_name text not null,
  document_url text not null,
  status text check (status in ('pending', 'verified', 'expired')) default 'pending',
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Credential RLS Policies
CREATE POLICY "Professionals can view their own credentials"
  ON public.credentials FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert their own credentials"
  ON public.credentials FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

-- 4. Create Shifts table (Job postings)
CREATE TABLE public.shifts (
  id uuid default uuid_generate_v4() primary key,
  facility_id uuid references public.profiles(id) on delete cascade not null,
  facility_name text not null,
  role text not null,
  hourly_rate numeric not null,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  status text check (status in ('open', 'filled', 'completed', 'cancelled')) default 'open',
  is_urgent boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Shift RLS Policies
CREATE POLICY "Anyone can view open shifts"
  ON public.shifts FOR SELECT
  USING (status = 'open' OR auth.uid() = facility_id);

CREATE POLICY "Facilities can insert their own shifts"
  ON public.shifts FOR INSERT
  WITH CHECK (auth.uid() = facility_id);

CREATE POLICY "Facilities can update their own shifts"
  ON public.shifts FOR UPDATE
  USING (auth.uid() = facility_id);

-- 5. Create Applications table (Professionals accepting shifts)
CREATE TABLE public.applications (
  id uuid default uuid_generate_v4() primary key,
  shift_id uuid references public.shifts(id) on delete cascade not null,
  professional_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('applied', 'accepted', 'rejected', 'completed')) default 'applied',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(shift_id, professional_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Application RLS Policies
CREATE POLICY "Professionals can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Facilities can view applications for their shifts"
  ON public.applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.shifts WHERE shifts.id = applications.shift_id AND shifts.facility_id = auth.uid()
  ));

CREATE POLICY "Professionals can apply to shifts"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = professional_id);
