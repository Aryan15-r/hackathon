# StudySpace Web Application — Supabase Database Schema Reference

> **Full SQL Migrations Directory:** `supabase/migrations/` (Run files `001` through `006` in order)

---

## 🌐 Web Architecture & Database Overview

In **StudySpace Web Application**, Supabase acts as the centralized backend data store and WebSocket realtime hub.

```
Browser Web Client (Flutter Web SPA)
    │
    ├── Supabase Web Auth (Cookies / LocalStorage Session Persistence)
    │     └── public.profiles                 ← Automatically synced on user signup
    │             │
    │             ├── public.tasks            ← Personal to-do items & deadlines
    │             │
    │             ├── public.communities      ← Study groups & channels
    │             │     └── public.channels
    │             │           ├── public.messages           <--- WebSocket Realtime
    │             │           │     ├── public.message_reactions <--- WebSocket Realtime
    │             │           │     └── public.reports
    │             │           └── public.channel_members
    │             │
    │             ├── public.search_history   ← User search queries
    │             │
    │             ├── public.study_tracker_states  ← Pomodoro timer state sync
    │             │
    │             └── public.user_daily_stats      ← Daily focus time & attendance
```

---

## 📜 SQL Migration Execution Order

When initializing the database for a new web project, run the 6 migration files in `supabase/migrations/` in order:

1. **`001_initial_schema.sql`**: Core tables (`profiles`, `tasks`, `communities`, `channels`, `messages`, `message_reactions`, `search_history`, `reports`), triggers, and seed communities.
2. **`002_fix_channels_rls.sql`**: Adds RLS policies allowing authenticated web users to create and update channels.
3. **`003_private_rooms_and_admin_delete.sql`**: Adds private room passcodes, admin deletion RLS, and enables `supabase_realtime` WebSockets for `messages`.
4. **`004_channel_members_and_moderation.sql`**: Adds `channel_members` table and admin moderation policies.
5. **`005_task_times.sql`**: Adds `due_time` (`time`) column to `tasks`.
6. **`006_study_tracker_cloud_sync.sql`**: Creates `study_tracker_states` & `user_daily_stats` tables, and updates `handle_new_user()` trigger for Google Auth metadata compatibility.

---

## 📊 Database Tables Reference

### 1. `profiles`
Extends `auth.users`. Populated automatically via PostgreSQL trigger when a user registers on the web via email/password or Google OAuth.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, REFERENCES `auth.users(id)` ON DELETE CASCADE | Matches `auth.users.id` |
| `username` | `text` | UNIQUE, NOT NULL | Student username |
| `full_name` | `text` | | Full name |
| `avatar_url` | `text` | | Profile picture URL |
| `bio` | `text` | | Bio / summary |
| `college` | `text` | | College / University name |
| `branch` | `text` | | Branch of study (e.g., Computer Science) |
| `year` | `integer` | | Current academic year (1–6) |
| `created_at` | `timestamptz` | DEFAULT `now()` | Account creation timestamp |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last profile update timestamp |

**RLS Policies:**
- **SELECT:** Public read access for all web visitors.
- **UPDATE:** Only the owning user (`auth.uid() = id`).

---

### 2. `tasks`
Personal tasks and deadlines for web users.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Unique task ID |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE | Task owner |
| `title` | `text` | NOT NULL | Task title |
| `description` | `text` | | Optional notes or subtasks |
| `category` | `text` | DEFAULT `'personal'` | `assignment` \| `exam` \| `project` \| `personal` \| `college` |
| `priority` | `text` | DEFAULT `'medium'` | `low` \| `medium` \| `high` |
| `due_date` | `date` | | Optional deadline date |
| `due_time` | `time` | | Optional deadline time |
| `completed` | `boolean` | DEFAULT `false` | Completion status |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last modification timestamp |

**RLS Policies:** Full CRUD access restricted exclusively to the owning user (`auth.uid() = user_id`).

---

### 3. `communities`
Top-level discussion groups and study domains.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Community ID |
| `name` | `text` | NOT NULL | Community title |
| `description` | `text` | | Description |
| `icon` | `text` | | Display emoji or icon key |
| `category` | `text` | | Subject domain |
| `is_private` | `boolean` | DEFAULT `false` | Private room flag |
| `passcode` | `text` | DEFAULT `''` | Access passcode for private rooms |
| `created_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | Room owner / creator |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation timestamp |

**RLS Policies:**
- **SELECT:** Everyone.
- **INSERT:** Authenticated users.
- **DELETE:** Room creator (`auth.uid() = created_by`).

---

### 4. `channels`
Sub-channels within communities (e.g., `#general`, `#homework-help`).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Channel ID |
| `community_id` | `uuid` | FK → `communities(id)` ON DELETE CASCADE | Parent community |
| `name` | `text` | NOT NULL | Channel name |
| `description` | `text` | | Description |
| `is_private` | `boolean` | DEFAULT `false` | Private channel flag |
| `passcode` | `text` | DEFAULT `''` | Passcode |
| `created_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | Channel creator |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation timestamp |

---

### 5. `channel_members`
Tracks users who have joined specific channels and their roles (`admin` vs `member`).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Membership ID |
| `channel_id` | `uuid` | FK → `channels(id)` ON DELETE CASCADE | Channel reference |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE | User reference |
| `role` | `text` | DEFAULT `'member'` | `'admin'` \| `'member'` |
| `joined_at` | `timestamptz` | DEFAULT `now()` | Join timestamp |

---

### 6. `messages`
Chat messages sent inside channels (**Supabase Realtime WebSocket Enabled**).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Message ID |
| `channel_id` | `uuid` | FK → `channels(id)` ON DELETE CASCADE | Channel reference |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE | Sender user ID |
| `content` | `text` | NOT NULL | Message text |
| `created_at` | `timestamptz` | DEFAULT `now()` | Sent timestamp |
| `edited_at` | `timestamptz` | | Edit timestamp (null if unedited) |

**RLS Policies:**
- **SELECT:** Everyone.
- **INSERT/UPDATE:** Message author (`auth.uid() = user_id`).
- **DELETE:** Message author or channel/room admin.

---

### 7. `message_reactions`
Emoji reactions on messages (**Supabase Realtime WebSocket Enabled**).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Reaction ID |
| `message_id` | `uuid` | FK → `messages(id)` ON DELETE CASCADE | Target message |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE | Reacting user |
| `emoji` | `text` | NOT NULL | Emoji character (e.g. "👍") |
| — | UNIQUE | `(message_id, user_id, emoji)` | Prevents duplicate reactions |

---

### 8. `search_history`
Stores student search queries for quick repeat web searches.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Record ID |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE | User reference |
| `query` | `text` | NOT NULL | Search query string |
| `created_at` | `timestamptz` | DEFAULT `now()` | Timestamp |

---

### 9. `reports`
User reports for chat moderation in web channels.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Report ID |
| `reporter_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE | Reporter ID |
| `message_id` | `uuid` | FK → `messages(id)` ON DELETE CASCADE | Reported message ID |
| `reason` | `text` | NOT NULL | Reason for report |
| `created_at` | `timestamptz` | DEFAULT `now()` | Report timestamp |

---

### 10. `study_tracker_states`
Cloud sync for active Pomodoro timers across browser tab closes and device changes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `uuid` | PK, REFERENCES `profiles(id)` ON DELETE CASCADE | User ID |
| `remaining_seconds` | `integer` | DEFAULT 1500, CHECK `>= 0` | Remaining timer seconds |
| `is_running` | `boolean` | DEFAULT `false` | Timer running state |
| `target_end_at` | `timestamptz` | | Planned completion time |
| `alarms` | `jsonb` | DEFAULT `'[]'` | Scheduled alarm configs |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last sync timestamp |

---

### 11. `user_daily_stats`
Daily student focus statistics and attendance.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE | User ID |
| `date` | `date` | NOT NULL | Date of stat record |
| `focused_seconds` | `integer` | DEFAULT 0, CHECK `>= 0` | Total focused seconds |
| `attended` | `boolean` | DEFAULT `false` | Attendance check-in |
| — | PRIMARY KEY | `(user_id, date)` | Composite primary key |

---

## ⚡ Triggers & Web Functions

- **`handle_new_user()`**: Triggered on `AFTER INSERT ON auth.users`. Automatically populates `public.profiles` using raw metadata from email registration or Google OAuth.
- **`on_profiles_updated`**: Automatically updates `updated_at = now()` on profile changes.
- **`on_tasks_updated`**: Automatically updates `updated_at = now()` on task changes.
