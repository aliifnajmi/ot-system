# Mulia OT System V4 — Supabase migration

This branch is a migration scaffold for the existing static GitHub Pages frontend.

## Why this branch exists
The current frontend uses localStorage for authentication, worker records, OT records, and audit logs. That data is browser-local and is not a shared database. This branch introduces a Supabase schema and client bootstrap without overwriting the current master branch.

## Files added
- `database/supabase_schema.sql`: PostgreSQL tables and initial Row Level Security policies.
- `assets/js/supabase-config.js`: browser-safe project URL and publishable-key placeholders.
- `assets/js/supabase-client.js`: shared client/session/profile/audit helpers.
- `setup.html`: setup checklist shown until valid Supabase configuration is provided.

## Setup
1. Create a Supabase project.
2. Run `database/supabase_schema.sql` in the Supabase SQL Editor.
3. Replace the placeholders in `assets/js/supabase-config.js` with the Project URL and publishable key.
4. Create users using Supabase Auth and insert a matching `public.user_profiles` row for each user. Set `role` to `admin` or `technician`.
5. Test all policies with separate accounts before moving real worker or OT data.
6. Migrate existing localStorage/MySQL data only after reviewing and mapping columns.

## Security notes
- Do not put the Supabase service-role or secret key in browser code.
- Do not treat localStorage-only login as authentication.
- All exposed tables require suitable grants and RLS policies. Review and test policies before production.
- Current dashboard pages still need to be migrated one by one to use Supabase queries; this scaffold does not claim that all existing HTML pages are already database-connected.
- OT hours should be validated again in trusted logic before insert. For overnight shifts, calculate duration with the date boundary correctly.
- Monthly cost is not included in this schema because the current requirements do not define a validated OT rate/payroll rule.
