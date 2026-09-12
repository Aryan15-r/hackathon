# Patch Notes — StudySpace Fixes

Apply with `git apply patches.md` from the repo root (or paste the diff blocks into your IDE's "apply patch" tool).

Files changed:

- `src/index.css` — fix Tailwind cascade-layer bug causing 0 padding/margin everywhere
- `server/index.js` — fix silently swallowed AI cascade errors + mislabeled `isFallback` flag
- `src/components/AiAssistant.jsx` — surface fallback state in the UI ("Offline mode" badge)
- `src/components/AttendanceTracker.jsx` — remove hardcoded seed courses/sessions/streak, add empty state

```diff
diff --git a/server/index.js b/server/index.js
index ce0af2a..2241a49 100644
--- a/server/index.js
+++ b/server/index.js
@@ -240,10 +240,13 @@ app.post('/api/ai/chat', async (req, res) => {
             });
           }
         }
+        console.error(`[AI cascade] ${model} responded ${response.status}: ${await response.text().catch(() => '')}`);
       } catch (err) {
-        // Continue to next cascade model
+        console.error(`[AI cascade] ${model} threw: ${err.message}`);
       }
     }
+  } else {
+    console.error('[AI cascade] No valid Gemini API key found (checked GEMINI_API_KEY env var and x-gemini-api-key header).');
   }

   // Autonomous high-yield academic response engine (zero failure, zero downtime)
@@ -251,7 +254,7 @@ app.post('/api/ai/chat', async (req, res) => {
   return res.json({
     text: cleanMathFormulas(answer),
     modelUsed: 'StudySpace AI Tutor',
-    isFallback: false
+    isFallback: true
   });
 });

diff --git a/src/components/AiAssistant.jsx b/src/components/AiAssistant.jsx
index 3ebdb8f..347b52c 100644
--- a/src/components/AiAssistant.jsx
+++ b/src/components/AiAssistant.jsx
@@ -352,7 +352,7 @@ export default function AiAssistant() {
       if (response.ok) {
         const data = await response.json();
         if (data.text) {
-          setAiHistory(prev => [...prev, { role: 'model', text: data.text, modelUsed: data.modelUsed || 'StudySpace AI' }]);
+          setAiHistory(prev => [...prev, { role: 'model', text: data.text, modelUsed: data.modelUsed || 'StudySpace AI', isFallback: Boolean(data.isFallback) }]);
           if (data.modelUsed) setAiModelUsed(data.modelUsed);
           return;
         }
@@ -360,12 +360,12 @@ export default function AiAssistant() {

       // If backend responded without text or error, seamlessly fall back to client-side Academic Tutor
       const smartResponse = cleanMathFormulas(generateAcademicResponse(textToSend));
-      setAiHistory(prev => [...prev, { role: 'model', text: smartResponse, modelUsed: 'StudySpace Academic Engine' }]);
+      setAiHistory(prev => [...prev, { role: 'model', text: smartResponse, modelUsed: 'StudySpace Academic Engine', isFallback: true }]);
       setAiModelUsed('StudySpace Academic Engine');
     } catch (err) {
       // Backend offline or network blip: instant intelligent response, zero failure!
       const smartResponse = cleanMathFormulas(generateAcademicResponse(textToSend));
-      setAiHistory(prev => [...prev, { role: 'model', text: smartResponse, modelUsed: 'StudySpace Academic Engine' }]);
+      setAiHistory(prev => [...prev, { role: 'model', text: smartResponse, modelUsed: 'StudySpace Academic Engine', isFallback: true }]);
       setAiModelUsed('StudySpace Academic Engine');
     } finally {
       setLoading(false);
@@ -439,6 +439,7 @@ export default function AiAssistant() {
                 ) : (
                   <span className="author-name model">
                     <Sparkles size={14} /> StudySpace AI {msg.modelUsed && <small>({msg.modelUsed})</small>}
+                    {msg.isFallback && <small className="fallback-badge" title="Live AI was unavailable; this is an offline template response.">Offline mode</small>}
                   </span>
                 )}
               </div>
@@ -624,6 +625,17 @@ export default function AiAssistant() {
         .author-name.model { color: var(--accent-cyan); }
         .author-name.model small { font-weight: 400; color: var(--text-muted); }

+        .fallback-badge {
+          font-size: 0.65rem;
+          font-weight: 600;
+          color: var(--accent-amber, #D97706);
+          background: rgba(217, 119, 6, 0.12);
+          border: 1px solid rgba(217, 119, 6, 0.3);
+          border-radius: 999px;
+          padding: 0.1rem 0.5rem;
+          margin-left: 0.25rem;
+        }
+
         .copy-btn {
           background: transparent;
           border: none;
diff --git a/src/components/AttendanceTracker.jsx b/src/components/AttendanceTracker.jsx
index d4d0f18..c3c2c48 100644
--- a/src/components/AttendanceTracker.jsx
+++ b/src/components/AttendanceTracker.jsx
@@ -18,13 +18,6 @@ import {
   X
 } from 'lucide-react';

-const DEFAULT_COURSES = [
-  { id: 'c-1', name: 'Data Structures & Algorithms', code: 'CS201', attended: 24, total: 28, target: 75 },
-  { id: 'c-2', name: 'Operating Systems & Concurrency', code: 'CS202', attended: 19, total: 26, target: 75 },
-  { id: 'c-3', name: 'Database Management Systems', code: 'CS203', attended: 22, total: 25, target: 75 },
-  { id: 'c-4', name: 'Discrete Mathematics', code: 'MA201', attended: 16, total: 24, target: 75 },
-];
-
 export default function AttendanceTracker() {
   const { totalFocusedSecondsToday, setTotalFocusedSecondsToday } = useApp();

@@ -32,9 +25,9 @@ export default function AttendanceTracker() {
   const [courses, setCourses] = useState(() => {
     try {
       const saved = localStorage.getItem('studyspace_attendance_courses');
-      return saved ? JSON.parse(saved) : DEFAULT_COURSES;
+      return saved ? JSON.parse(saved) : [];
     } catch {
-      return DEFAULT_COURSES;
+      return [];
     }
   });

@@ -55,10 +48,7 @@ export default function AttendanceTracker() {
   const [studySessions, setStudySessions] = useState(() => {
     try {
       const saved = localStorage.getItem('studyspace_today_sessions');
-      return saved ? JSON.parse(saved) : [
-        { id: 1, subject: 'Operating Systems', duration: 45, time: '09:30 AM' },
-        { id: 2, subject: 'Data Structures Problem Solving', duration: 60, time: '11:15 AM' },
-      ];
+      return saved ? JSON.parse(saved) : [];
     } catch {
       return [];
     }
@@ -79,6 +69,43 @@ export default function AttendanceTracker() {
   const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
   const progressPercent = Math.min(100, Math.round((totalFocusMinutes / (dailyGoalHours * 60)) * 100));

+  // ── Streak Tracking (real, based on days the daily goal was met) ──
+  const todayKey = new Date().toISOString().slice(0, 10);
+  useEffect(() => {
+    if (progressPercent < 100) return;
+    try {
+      const raw = localStorage.getItem('studyspace_goal_met_dates');
+      const dates = raw ? JSON.parse(raw) : [];
+      if (!dates.includes(todayKey)) {
+        localStorage.setItem('studyspace_goal_met_dates', JSON.stringify([...dates, todayKey]));
+      }
+    } catch {
+      // ignore storage errors
+    }
+  }, [progressPercent, todayKey]);
+
+  const studyStreak = (() => {
+    try {
+      const raw = localStorage.getItem('studyspace_goal_met_dates');
+      const dates = new Set(raw ? JSON.parse(raw) : []);
+      if (progressPercent >= 100) dates.add(todayKey);
+
+      let streak = 0;
+      const cursor = new Date();
+      // If today's goal isn't met yet, the streak counts consecutive days up to yesterday.
+      if (!dates.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
+      while (dates.has(cursor.toISOString().slice(0, 10))) {
+        streak += 1;
+        cursor.setDate(cursor.getDate() - 1);
+      }
+      return streak;
+    } catch {
+      return 0;
+    }
+  })();
+
+  const productivityLabel = progressPercent >= 100 ? 'Goal Achieved' : progressPercent >= 60 ? 'High Productivity' : progressPercent >= 25 ? 'Building Momentum' : 'Just Getting Started';
+
   // ── Attendance Helpers ────────────────────────────────────────
   const markAttendance = (id, isPresent) => {
     setCourses(prev => prev.map(c => {
@@ -261,8 +288,8 @@ export default function AttendanceTracker() {
           </div>

           <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-[#6B7280]">
-            <span>🔥 5 Day Study Streak</span>
-            <span className="font-semibold text-[#1E3A5F]">High Productivity</span>
+            <span>🔥 {studyStreak} Day Study Streak</span>
+            <span className="font-semibold text-[#1E3A5F]">{productivityLabel}</span>
           </div>
         </div>
       </div>
@@ -274,13 +301,30 @@ export default function AttendanceTracker() {
             <h2 className="text-lg font-bold text-[#1A1A2E] font-['Outfit'] flex items-center gap-2">
               <UserCheck size={20} className="text-[#1E3A5F]" /> College Attendance Criteria (75% Rule)
             </h2>
-            <p className="text-xs text-[#6B7280]">
-              Overall Attendance: <strong className={overallAttendancePercent >= 75 ? 'text-[#059669]' : 'text-[#DC2626]'}>{overallAttendancePercent}%</strong> across {courses.length} courses.
-            </p>
+            {courses.length > 0 && (
+              <p className="text-xs text-[#6B7280]">
+                Overall Attendance: <strong className={overallAttendancePercent >= 75 ? 'text-[#059669]' : 'text-[#DC2626]'}>{overallAttendancePercent}%</strong> across {courses.length} courses.
+              </p>
+            )}
           </div>
         </div>

         {/* Course Cards Grid */}
+        {courses.length === 0 ? (
+          <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-2">
+            <BookOpen size={28} className="text-[#1E3A5F]/40" />
+            <p className="text-sm font-semibold text-[#1A1A2E]">No courses added yet</p>
+            <p className="text-xs text-[#6B7280] max-w-sm">
+              Add your courses to start tracking attendance against your college's 75% rule.
+            </p>
+            <button
+              onClick={() => setIsAddCourseModalOpen(true)}
+              className="gradient-button flex items-center gap-2 px-4 py-2 mt-2 rounded-xl text-xs font-semibold cursor-pointer"
+            >
+              <Plus size={14} /> Add Your First Course
+            </button>
+          </div>
+        ) : (
         <div className="grid md:grid-cols-2 gap-4">
           {courses.map(course => {
             const currentPercent = course.total > 0 ? Math.round((course.attended / course.total) * 100) : 100;
@@ -383,6 +427,7 @@ export default function AttendanceTracker() {
             );
           })}
         </div>
+        )}
       </div>

       {/* Add Course Modal */}
diff --git a/src/index.css b/src/index.css
index e70f5a2..aad0ef7 100644
--- a/src/index.css
+++ b/src/index.css
@@ -46,10 +46,12 @@
 }

 /* ── Reset & Full-Bleed Layout ──────────────────────────────── */
-*, *::before, *::after {
-  box-sizing: border-box;
-  margin: 0;
-  padding: 0;
+@layer base {
+  *, *::before, *::after {
+    box-sizing: border-box;
+    margin: 0;
+    padding: 0;
+  }
 }

 html {
```
