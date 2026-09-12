# ⚡ StudySpace Web Application — Quick Copy-Paste Setup Cheat Sheet

Quick reference commands, environment templates, and SQL snippets for recreating **StudySpace Web Application** in a new workspace.

---

## 1. Quick Terminal Commands

```bash
# 1. Clone the repository
git clone https://github.com/Aryan15-r/student-workspace.git
cd student-workspace

# 2. Create environment file from template
cp .env.example .env

# 3. Enable Flutter Web support & install dependencies
flutter config --enable-web
flutter pub get

# 4. Run local web server (Chrome)
flutter run -d chrome

# 5. Run local web server for network access (testing on phone browser)
flutter run -d web-server --web-hostname 0.0.0.0 --web-port 8080

# 6. Build production web bundle
flutter build web --release --base-href /
```

---

## 2. `.env` Web Environment Template

```env
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Google Gemini API Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google OAuth Credentials
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here
```

---

## 3. Vercel Web Deployment Snippets

### `vercel.json` (SPA Rewrite Configuration)
```json
{
  "buildCommand": "bash vercel_build.sh",
  "outputDirectory": "build/web",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Vercel CLI Commands
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy preview build
vercel

# Deploy production build
vercel --prod
```

---

## 4. SQL Migrations Execution Order (Supabase SQL Editor)

Run these 6 migration files from `supabase/migrations/` in order:

1. `001_initial_schema.sql` — Core database tables, triggers, and seed communities.
2. `002_fix_channels_rls.sql` — Channel creation and modification RLS policies.
3. `003_private_rooms_and_admin_delete.sql` — Private room passcodes & message deletion policies.
4. `004_channel_members_and_moderation.sql` — Channel members table & admin moderation policies.
5. `005_task_times.sql` — Task time column (`due_time`).
6. `006_study_tracker_cloud_sync.sql` — Pomodoro state sync and Google OAuth user profile handler.
