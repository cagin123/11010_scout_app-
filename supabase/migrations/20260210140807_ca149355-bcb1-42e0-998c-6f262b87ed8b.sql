
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'scout', 'strategist');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  team_number TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can read all roles
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Match entries table
CREATE TABLE public.match_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scouted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_number INT NOT NULL,
  team_number TEXT NOT NULL,
  alliance TEXT NOT NULL CHECK (alliance IN ('red', 'blue')),
  -- Autonomous
  auto_fuel_total INT NOT NULL DEFAULT 0,
  left_starting_zone BOOLEAN NOT NULL DEFAULT false,
  auto_climb_attempted BOOLEAN NOT NULL DEFAULT false,
  -- Teleop
  teleop_fuel_total INT NOT NULL DEFAULT 0,
  cycles_completed INT NOT NULL DEFAULT 0,
  defense TEXT NOT NULL DEFAULT 'none' CHECK (defense IN ('none', 'light', 'heavy')),
  effective_over_bumps BOOLEAN NOT NULL DEFAULT false,
  used_trench_well BOOLEAN NOT NULL DEFAULT false,
  -- Endgame
  climb_result TEXT NOT NULL DEFAULT 'none' CHECK (climb_result IN ('none', 'low', 'mid', 'high')),
  parked_only BOOLEAN NOT NULL DEFAULT false,
  -- Reliability
  broke_down BOOLEAN NOT NULL DEFAULT false,
  tipped_over BOOLEAN NOT NULL DEFAULT false,
  lost_comms BOOLEAN NOT NULL DEFAULT false,
  driver_skill_rating INT NOT NULL DEFAULT 3 CHECK (driver_skill_rating BETWEEN 1 AND 5),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.match_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all match entries" ON public.match_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert match entries" ON public.match_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = scouted_by);
CREATE POLICY "Users can update own entries" ON public.match_entries FOR UPDATE TO authenticated USING (auth.uid() = scouted_by);
CREATE POLICY "Admins can delete entries" ON public.match_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for profile auto-creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, team_number, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'team_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'scout'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
