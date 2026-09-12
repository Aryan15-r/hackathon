# 🤖 StudySpace — AI Agent Context & System Prompt (`PROMPT.md`)

> **Instruction for AI Agents:** Read this document carefully before making any code modifications, creating new features, or fixing bugs in the **StudySpace** repository. This file serves as the definitive reference for the application's context, architecture, tech stack, database schema, design conventions, and developer guidelines.

---

## 🧭 Executive Summary

**StudySpace** (package name: `student_workspace`) is an all-in-one student productivity workspace built with **Flutter (Dart)** and **Supabase**. It eliminates app-switching for college and university students by consolidating AI tutoring, task management, study tools (Pomodoro, flashcards, quizzes), community discussion channels, offline scientific calculation, PDF document manipulation, and resource search into a unified mobile and web platform.

---

## 🛠️ Core Tech Stack & Architecture

| Layer | Technology | Key Packages / Details |
|---|---|---|
| **Framework** | Flutter (Dart SDK `^3.12.2`) | Cross-platform: Android, iOS, Web/PWA |
| **Backend & DB** | Supabase | PostgreSQL, Supabase Auth, Realtime Broadcasts, Storage |
| **AI Backend** | Google Gemini REST API | Multi-model fallback cascade (`gemini-3.6-flash`, etc.) |
| **State Management** | `provider` (`MultiProvider`, `ChangeNotifier`) | Feature-scoped state management |
| **Navigation** | `go_router` | Declarative, URL-aware routing for mobile & web |
| **UI & Animation** | Material Design 3, Google Fonts (`Inter`, `Outfit`), `flutter_animate`, `shimmer` | Vibrant modern aesthetic with dark mode support |
| **Study & Utilities** | `alarm`, `table_calendar`, `math_expressions`, `pdfx`, `pdf`, `file_picker` | Alarms, calendars, offline math engine, PDF viewer & tools |
| **Environment Config**| `flutter_dotenv` | `.env` file management for API keys and Supabase credentials |

---

## 📁 Repository & Directory Structure

The project follows a **Feature-First Architecture** inside `lib/`:

```
lib/
├── main.dart                      # App entry point, Supabase & Alarm initialization, MultiProvider setup
├── app/
│   ├── app.dart                   # MaterialApp.router definition, global theme setup
│   ├── router.dart                # GoRouter route definitions, authentication guards
│   └── theme/                     # AppTheme, color schemes, typography (Inter + Outfit)
├── core/
│   ├── constants/                 # App constants, API endpoints, asset strings
│   ├── errors/                    # Exception classes, failure handling
│   ├── utils/                     # Formatters, math sanitizers, date utilities
│   └── widgets/                   # Core shared UI elements (custom buttons, card wrappers, inputs)
├── features/                      # Feature modules (Feature-First Architecture)
│   ├── ai_assistant/              # Gemini AI chat, prompt templates, math LaTeX sanitizer
│   ├── auth/                      # Login, Signup, Google Sign-In, profile initialization
│   ├── calculator/                # Offline scientific calculator with expression parser
│   ├── community/                 # Realtime channels, community chats, reactions, moderation
│   ├── dashboard/                 # Home screen dashboard, progress stats, quick shortcuts
│   ├── pdf_tools/                 # PDF viewer, document generator, file pickers
│   ├── profile/                   # User profile management, college/branch/year details, theme toggle
│   ├── search/                    # Educational resource discovery & search history
│   ├── study_tools/               # Flashcards, Pomodoro timer, Quiz generator, Notes
│   └── todo/                      # Tasks, deadlines, categories, priorities, local alarms
└── shared/                        # App-wide reusable components and dialogs
```

---

## 🗄️ Database & Supabase Schema Reference

For full SQL definitions, consult [`docs/schema.md`](docs/schema.md) and [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).

### Key Tables & Relationships

```
auth.users (Supabase internal)
  └── profiles (1:1 with auth.users)
        ├── tasks (User to-do items)
        ├── communities (Top-level groups created by users)
        │     └── channels (Discussion rooms e.g. #general, #homework-help)
        │           └── messages (Realtime channel messages)
        │                 └── message_reactions (Emoji reactions)
        ├── search_history (User past searches)
        └── reports (Moderation reports against messages)
```

### Table Overview
- `profiles`: Extends `auth.users` with `username`, `full_name`, `avatar_url`, `bio`, `college`, `branch`, `year`.
- `tasks`: `user_id`, `title`, `description`, `category` (`assignment` | `exam` | `project` | `personal` | `college`), `priority` (`low` | `medium` | `high`), `due_date`, `completed`.
- `communities`: Top-level subject groups (`name`, `icon`, `category`, `created_by`).
- `channels`: Sub-channels linked to `community_id`.
- `messages`: Channel messages (Realtime enabled).
- `message_reactions`: Realtime emoji reactions linked to `message_id` and `user_id`.
- `search_history`: User query history.
- `reports`: Moderation reports for flagged content (`reporter_id`, `message_id`, `reason`).

---

## 🤖 AI Architecture & Multi-Model Cascade Rules

The app uses Google's Gemini REST API directly (or via `AiProvider` & `AiService`) with strict resilience rules outlined in [`AI.md`](AI.md):

1. **Zero-Downtime Cascade**: Never rely on a single model name. Always iterate through a cascade fallback array if an endpoint returns `404`, `429`, or `500`:
   ```dart
   final modelsToTry = [
     'gemini-3.6-flash',
     'gemini-3.7-flash',
     'gemini-3.5-flash',
     'gemini-3.1-flash-lite',
     'gemini-flash-latest',
   ];
   ```
2. **Prevent Truncation**:
   - Always set `"maxOutputTokens": 16384` in `generationConfig`.
   - Always concatenate **all** elements in `candidates[0].content.parts`, not just `parts[0]`.
3. **LaTeX Sanitization**: Format raw LaTeX expressions into readable math symbols before rendering in widgets or clean text outputs.

---

## 📐 Development & Coding Guidelines

### 1. State Management Patterns
- Use **`Provider`** (`ChangeNotifier`) for feature state management.
- Place providers in `lib/features/<feature_name>/providers/`.
- Ensure all new providers are registered in `main.dart` inside `MultiProvider`.
- Inject `AuthProvider` or Supabase client instance when user scope is required.

### 2. Navigation & Routing
- Route management is centralized in `lib/app/router.dart` using **`GoRouter`**.
- Define new screens with clear path names and route params.
- Check authentication status for guarded routes (`/login` redirect logic).

### 3. Environment Variables
- Keep secret keys in `.env` (gitignored).
- Access environment variables using `dotenv.env['KEY_NAME']`.
- Required variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.

### 4. Code Quality & Standards
- Keep business logic in providers or services, keeping UI widgets declarative and presentation-focused.
- Handle loading states (`shimmer` or `CircularProgressIndicator`) and error states gracefully.
- Write explanatory comments for non-trivial logic.
- Run `flutter analyze` to ensure zero linter errors.

---

## 🚀 Common Workflows for AI Agents

- **Adding a new feature module:**
  1. Create `lib/features/<feature_name>/` with subfolders: `models/`, `providers/`, `services/`, `presentation/pages/`, `presentation/widgets/`.
  2. Implement state provider extending `ChangeNotifier`.
  3. Register provider in `lib/main.dart`.
  4. Register routes in `lib/app/router.dart`.
- **Modifying Database / Supabase Schema:**
  1. Update SQL migration files in `supabase/migrations/`.
  2. Update schema documentation in `docs/schema.md`.
  3. Update corresponding Dart models and Supabase query methods.
- **Updating UI / Styling:**
  1. Use theme constants from `lib/app/theme/`.
  2. Maintain responsive UI using `LayoutBuilder`, `MediaQuery`, or `Expanded/Flexible`.

---

## 📌 Checklist for AI Instructions & PR Reviews

Before completing any task, verify:
- [ ] Code compiles without Dart lint errors (`flutter analyze`).
- [ ] Environment variable access relies on `flutter_dotenv`.
- [ ] All database queries comply with Supabase Row Level Security (RLS) rules.
- [ ] No API keys are hardcoded in the codebase.
