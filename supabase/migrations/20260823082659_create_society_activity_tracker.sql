/*
# Create Society Activity Tracker data model

1. New tables
- `members`: people in the society, including contact details, team, role, join date, and active/inactive status.
- `events`: meetings and activities with a title, date, start time, event type, and check-in code.
- `attendance`: one verified check-in per member and event, with the check-in method and timestamp.
- `contributions`: admin-recorded work completed by a member, categorized and scored.

2. Scoring rules
- Meeting attendance is worth 5 points.
- Event attendance is worth 10 points.
- Contribution points are supplied by the admin and validated to stay between 1 and 50.
- The app combines attendance and contribution points into each member's Activity Score.

3. Security
- Row Level Security is enabled on every table.
- This first version intentionally has no sign-in screen, so the internal society workspace is shared by anon and authenticated sessions.
- Four separate CRUD policies are added for every table.
- Unique attendance records prevent duplicate check-ins for the same member and event.

4. Seed data
- Adds a small realistic starter dataset only when the tables are empty so the dashboard is useful on first launch.
*/

CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  team text NOT NULL,
  role text NOT NULL DEFAULT 'Member',
  joined_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL,
  start_time time NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('meeting', 'event', 'workshop', 'orientation')),
  check_in_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  check_in_method text NOT NULL DEFAULT 'code' CHECK (check_in_method IN ('code', 'qr')),
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('technical', 'design', 'content', 'management', 'outreach', 'event operations')),
  contribution_date date NOT NULL DEFAULT CURRENT_DATE,
  points integer NOT NULL CHECK (points BETWEEN 1 AND 50),
  logged_by text NOT NULL DEFAULT 'Admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attendance_member_id_idx ON public.attendance (member_id);
CREATE INDEX IF NOT EXISTS attendance_event_id_idx ON public.attendance (event_id);
CREATE INDEX IF NOT EXISTS contributions_member_id_idx ON public.contributions (member_id);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON public.events (event_date);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_select_members" ON public.members;
CREATE POLICY "shared_select_members" ON public.members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_insert_members" ON public.members;
CREATE POLICY "shared_insert_members" ON public.members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_update_members" ON public.members;
CREATE POLICY "shared_update_members" ON public.members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_delete_members" ON public.members;
CREATE POLICY "shared_delete_members" ON public.members FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_select_events" ON public.events;
CREATE POLICY "shared_select_events" ON public.events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_insert_events" ON public.events;
CREATE POLICY "shared_insert_events" ON public.events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_update_events" ON public.events;
CREATE POLICY "shared_update_events" ON public.events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_delete_events" ON public.events;
CREATE POLICY "shared_delete_events" ON public.events FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_select_attendance" ON public.attendance;
CREATE POLICY "shared_select_attendance" ON public.attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_insert_attendance" ON public.attendance;
CREATE POLICY "shared_insert_attendance" ON public.attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_update_attendance" ON public.attendance;
CREATE POLICY "shared_update_attendance" ON public.attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_delete_attendance" ON public.attendance;
CREATE POLICY "shared_delete_attendance" ON public.attendance FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_select_contributions" ON public.contributions;
CREATE POLICY "shared_select_contributions" ON public.contributions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_insert_contributions" ON public.contributions;
CREATE POLICY "shared_insert_contributions" ON public.contributions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_update_contributions" ON public.contributions;
CREATE POLICY "shared_update_contributions" ON public.contributions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_delete_contributions" ON public.contributions;
CREATE POLICY "shared_delete_contributions" ON public.contributions FOR DELETE TO anon, authenticated USING (true);

INSERT INTO public.members (id, name, email, team, role, joined_date, status)
SELECT * FROM (VALUES
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Aarav Mehta', 'aarav@dtu-society.in', 'Core Team', 'Lead', '2025-08-12'::date, 'active'),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Diya Sharma', 'diya@dtu-society.in', 'Design', 'Member', '2025-09-04'::date, 'active'),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Rohan Verma', 'rohan@dtu-society.in', 'Technology', 'Member', '2025-09-17'::date, 'active'),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Ananya Singh', 'ananya@dtu-society.in', 'Outreach', 'Member', '2025-10-02'::date, 'active'),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Kabir Khan', 'kabir@dtu-society.in', 'Operations', 'Member', '2025-10-15'::date, 'inactive')
) AS seed(id, name, email, team, role, joined_date, status)
WHERE NOT EXISTS (SELECT 1 FROM public.members);

INSERT INTO public.events (id, title, event_date, start_time, event_type, check_in_code)
SELECT * FROM (VALUES
  ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'Weekly Society Sync', '2026-08-18'::date, '17:30'::time, 'meeting', 'DTU-SYNC-18'),
  ('aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid, 'Independence Day Drive', '2026-08-15'::date, '10:00'::time, 'event', 'DTU-DRIVE-15'),
  ('aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3'::uuid, 'Design Thinking Workshop', '2026-08-11'::date, '16:00'::time, 'workshop', 'DTU-DESIGN-11'),
  ('aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4'::uuid, 'New Member Orientation', '2026-08-25'::date, '18:00'::time, 'orientation', 'DTU-ORIENT-25')
) AS seed(id, title, event_date, start_time, event_type, check_in_code)
WHERE NOT EXISTS (SELECT 1 FROM public.events);

INSERT INTO public.attendance (member_id, event_id, check_in_method, checked_in_at)
SELECT m.id, e.id, 'code', now() - interval '1 day'
FROM public.members m
JOIN public.events e ON e.id IN ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid)
WHERE m.id IN ('11111111-1111-4111-8111-111111111111'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, '33333333-3333-4333-8333-333333333333'::uuid)
ON CONFLICT (member_id, event_id) DO NOTHING;

INSERT INTO public.contributions (member_id, title, description, category, contribution_date, points, logged_by)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Led weekly planning', 'Coordinated task assignments and sprint planning.', 'management', '2026-08-18', 15, 'Admin'),
  ('22222222-2222-4222-8222-222222222222', 'Freshers campaign creatives', 'Designed the launch set for the new member drive.', 'design', '2026-08-15', 15, 'Admin'),
  ('33333333-3333-4333-8333-333333333333', 'Event registration system', 'Built the registration form and check-in flow.', 'technical', '2026-08-16', 20, 'Admin'),
  ('44444444-4444-4444-8444-444444444444', 'Partner outreach', 'Reached out to three community partners.', 'outreach', '2026-08-13', 10, 'Admin')
ON CONFLICT DO NOTHING;