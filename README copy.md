# StudySpace 🌐 — Web Application

> **One web workspace. Zero downloads. Less switching. More learning.**

**StudySpace** is a modern, high-performance student productivity web application and Progressive Web App (PWA) built with **Flutter Web, Supabase, and Google Gemini AI**. It provides instant browser access to essential academic tools without requiring any software installation.

---

## 🎯 Web Application Features

| Feature | Web Capabilities |
|---|---|
| 🌐 **Instant Browser Access** | Full SPA URL navigation (`/dashboard`, `/todo`, `/ai-assistant`, `/community`, etc.) powered by `go_router` |
| 🤖 **AI Assistant & Tutor** | High-speed Gemini AI study tutor with LaTeX formula sanitization and 16k output token responses |
| ✅ **Task & Assignment Planner** | Real-time task manager with priority tags, categories, and deadline sorting |
| ⏱️ **Cloud-Synced Study Tracker** | Pomodoro timer synced to Supabase database (`study_tracker_states`) with daily focus analytics |
| 🔍 **Smart Academic Search** | Curated search engine for open-access study materials with search query history |
| 💬 **Real-Time Community Rooms** | WebSockets-powered chat channels, private study rooms with passcodes, and admin moderation |
| 🧮 **Scientific Calculator** | Full scientific calculator engine — runs 100% in-browser offline |
| 📄 **Web PDF & Document Studio** | In-browser PDF merge, split, extract, and HTML5 embedded viewing |
| 👤 **Profile & Customization** | Student profiles, academic details, avatars, and dark mode themes |

---

## ⚙️ Web Tech Stack

- **Frontend Core:** Flutter Web (Dart ^3.12.2) — Single Page Application (SPA) & PWA
- **Routing:** `go_router` (Deep linking, browser back/forward history, clean URLs)
- **Backend:** Supabase Web SDK (PostgreSQL, Realtime WebSockets, Web Auth, RLS)
- **AI Backend:** Google Gemini API (REST client with automated model cascade fallback)
- **Hosting & CI/CD:** Vercel (Configured with `vercel.json` SPA rewrite rules and `vercel_build.sh`)
- **State & UI:** Provider, Google Fonts (Inter + Outfit), Flutter Animate, Shimmer skeleton loaders

---

## 🚀 Recreating This Web Application From Scratch

Follow this guide to set up, run locally, and deploy **StudySpace Web Application** in a new workspace.

### 1. Web Prerequisites

Ensure you have installed:
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (v3.12.0 or higher with Chrome web support enabled)
- [Dart SDK](https://dart.dev/get-dart) (included with Flutter)
- A free [Supabase](https://supabase.com) account
- A free [Google Gemini API Key](https://aistudio.google.com)

Verify web support is enabled in your Flutter installation:
```bash
flutter config --enable-web
flutter doctor
```

---

### 2. Environment Configuration

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Add your Web environment variables:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_REF.supabase.co
   SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

   # Google Gemini AI API Key
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY

   # Google OAuth (Web Client ID)
   GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
   GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here
   ```

---

### 3. Supabase Database & Web Auth Setup

1. Create a new project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** and run the 6 migration files in `supabase/migrations/` in exact sequence:
   - `001_initial_schema.sql` — Core database tables, triggers, and seed communities.
   - `002_fix_channels_rls.sql` — Channel creation and modification policies.
   - `003_private_rooms_and_admin_delete.sql` — Private room passcodes & admin deletion.
   - `004_channel_members_and_moderation.sql` — Channel memberships and moderation policies.
   - `005_task_times.sql` — Task due time column (`due_time`).
   - `006_study_tracker_cloud_sync.sql` — Pomodoro state sync and Google OAuth user profile handler.

3. **Configure Web Authentication Redirects**:
   - In Supabase Dashboard → **Authentication** → **URL Configuration**.
   - Set **Site URL**: `http://localhost:8080` (or your production Vercel URL).
   - Add **Additional Redirect URLs**:
     - `http://localhost:8080/#/`
     - `https://YOUR-APP-NAME.vercel.app/#/`

4. **Enable WebSockets Realtime**:
   - In Supabase Dashboard → **Database** → **Publications** → `supabase_realtime`.
   - Toggle ON `messages` and `message_reactions` tables for live browser updates.

---

### 4. Local Web Server Setup

1. Install project dependencies:
   ```bash
   flutter pub get
   ```

2. Launch local web development server in Chrome:
   ```bash
   flutter run -d chrome
   ```

3. Launch local web server accessible across local network (for testing on mobile browsers):
   ```bash
   flutter run -d web-server --web-hostname 0.0.0.0 --web-port 8080
   ```

---

### 5. Production Web Deployment (Vercel)

StudySpace comes with turnkey Vercel deployment configuration (`vercel.json` & `vercel_build.sh`).

#### Automated Deployment Steps:
1. Push your project to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project** → **Import Repository**.
3. Configure Build Settings:
   - **Framework Preset**: `Other`
   - **Build Command**: `bash vercel_build.sh`
   - **Output Directory**: `build/web`
4. Add Environment Variables under Vercel Project Settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `GOOGLE_WEB_CLIENT_ID`
5. Click **Deploy**. Vercel will run `vercel_build.sh`, install Flutter in the cloud CI container, generate `.env`, compile the web app, and deploy it to a fast global CDN.

#### How `vercel.json` Handles SPA Routing:
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
*This rewrite rule ensures that refreshing any deep URL (e.g. `/todo` or `/community`) properly routes back to `index.html` where `go_router` handles client-side routing.*

---

## 📂 Web Project Structure

```
student-workspace/
├── vercel.json               # Vercel SPA route rewrite configuration
├── vercel_build.sh           # Automated Vercel CI build script
├── .env                      # Local environment variables (gitignored)
├── pubspec.yaml              # Web dependencies & asset declarations
├── web/                      # HTML5 index, manifest.json, favicon, PWA configs
│   ├── index.html
│   ├── manifest.json
│   └── favicon.png
├── supabase/
│   └── migrations/           # 6 SQL migration scripts (001 to 006)
├── docs/
│   └── schema.md             # Full database schema reference
├── AI.md                     # Gemini Web AI architecture & setup guide
├── pitching.md               # Web product pitch & presentation guide
├── paste.md                  # Quick web setup cheat sheet
└── lib/
    ├── main.dart             # Application entrypoint & Supabase web init
    ├── app/
    │   └── router.dart       # GoRouter web URL navigation & auth guards
    ├── core/                 # Shared web services & UI utilities
    └── features/             # Feature modules (AI, Auth, PDF, Community, Tasks, etc.)
```

---

## 📄 Documentation Links

- [Database Schema Reference](docs/schema.md) — Database structure, RLS policies, and triggers for web apps.
- [AI Architecture & Web Setup Guide](AI.md) — Gemini model cascade strategy & browser CORS configuration.
- [Web Product Pitch Deck](pitching.md) — Executive summary, GTM strategy, and web presentation brief.
- [Quick Setup Cheat Sheet](paste.md) — Instant terminal commands & SQL snippets.

---

## 📜 License

Distributed under the MIT License.
