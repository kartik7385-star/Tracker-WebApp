/*
# Add app role column to members

1. Modified tables
- `members`: adds `app_role` column (text, not null, defaults to 'member') with a CHECK constraint
  constraining values to 'admin' or 'member'. This distinguishes society admins from regular members
  so the UI can show role-appropriate functionality.

2. Data migration
- Updates the first seeded member (Aarav Mehta) to 'admin' role so the demo has an admin user.

3. Security
- No policy changes — the table remains shared (anon + authenticated) for this no-auth internal workspace.
*/

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS app_role text NOT NULL DEFAULT 'member' CHECK (app_role IN ('admin', 'member'));

UPDATE public.members
SET app_role = 'admin'
WHERE id = '11111111-1111-4111-8111-111111111111';