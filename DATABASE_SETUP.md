# Database Setup Instructions

## Overview
This application uses Supabase as the database. To get the authentication working properly, you need to run the database migrations.

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended for now)
Since we're using JWT sessions temporarily, the database is not strictly required for authentication. However, to store projects and components, you'll need to:

1. Create a Supabase project at https://supabase.com
2. Get your project URL and keys from the Settings > API section
3. Add them to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Option 2: Run All Migrations (For Full Setup)
To enable database-backed authentication and all features:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `database/migrations/001_auth_tables.sql`
   - `database/migrations/002_application_tables.sql`
   - `database/migrations/003_analytics_monitoring_tables.sql`
   - `database/migrations/004_row_level_security.sql`
   - `database/migrations/005_storage_buckets.sql`
   - `database/migrations/006_database_functions.sql`
   - `database/migrations/007_component_library_tables.sql`
   - `database/migrations/008_component_helper_functions.sql`

4. After running migrations, update `src/lib/auth/index.ts` to re-enable the Supabase adapter by uncommenting the adapter configuration.

## Current Status
The application is currently configured to use JWT sessions (stored in cookies) instead of database sessions. This allows authentication to work without the database tables being set up.

## Features Available Without Database
- ✅ Google OAuth login
- ✅ Protected routes
- ✅ User sessions

## Features Requiring Database
- ❌ Saving projects
- ❌ Component library data
- ❌ Audio recordings storage
- ❌ Prompt generation history

## Troubleshooting

### AdapterError
If you see an `AdapterError`, it means the auth tables don't exist in your database. Either:
1. Run the migrations as described above, OR
2. Keep using JWT sessions (current configuration)

### Missing Environment Variables
Make sure all required environment variables are set in `.env.local`:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`