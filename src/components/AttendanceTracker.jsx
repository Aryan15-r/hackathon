import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Flame,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  BookOpen,
  Target,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

const DEFAULT_COURSES = [
  { id: 'c-1', name: 'Data Structures & Algorithms', code: 'CS201', attended: 24, total: 28, target: 75 },
  { id: 'c-2', name: 'Operating Systems & Concurrency', code: 'CS202', attended: 19, total: 26, target: 75 },
  { id: 'c-3', name: 'Database Management Systems', code: 'CS203', attended: 22, total: 25, target: 75 },
  { id: 'c-4', name: 'Discrete Mathematics', code: 'MA201', attended: 16, total: 24, target: 75 },
];

export default function AttendanceTracker() {
  const { totalFocusedSecondsToday, setTotalFocusedSecondsToday } = useApp();

  // ── Attendance State ──────────────────────────────────────────
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('studyspace_attendance_courses');
      return saved ? JSON.parse(saved) : DEFAULT_COURSES;
    } catch {
      return DEFAULT_COURSES;
    }
  });

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    attended: 0,
    total: 0,
    target: 75
  });

  // ── Daily Study Tracker State ────────────────────────────────
  const [dailyGoalHours, setDailyGoalHours] = useState(() => {
    return parseFloat(localStorage.getItem('studyspace_daily_goal_hours') || '4');
  });

  const [studySessions, setStudySessions] = useState(() => {
    try {
      const saved = localStorage.getItem('studyspace_today_sessions');
      return saved ? JSON.parse(saved) : [
        { id: 1, subject: 'Operating Systems', duration: 45, time: '09:30 AM' },
        { id: 2, subject: 'Data Structures Problem Solving', duration: 60, time: '11:15 AM' },
      ];
    } catch {
      return [];
    }
  });

  // Save courses to localStorage
  useEffect(() => {
    localStorage.setItem('studyspace_attendance_courses', JSON.stringify(courses));
  }, [courses]);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('studyspace_today_sessions', JSON.stringify(studySessions));
  }, [studySessions]);

  // Calculate study progress
  const totalFocusMinutes = Math.floor(totalFocusedSecondsToday / 60) + studySessions.reduce((acc, s) => acc + s.duration, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const progressPercent = Math.min(100, Math.round((totalFocusMinutes / (dailyGoalHours * 60)) * 100));

  // ── Attendance Helpers ────────────────────────────────────────
  const markAttendance = (id, isPresent) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          attended: isPresent ? c.attended + 1 : c.attended,
          total: c.total + 1
        };
      }
      return c;
    }));
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourse.name.trim()) return;

    const courseObj = {
      id: 'c-' + Date.now(),
      name: newCourse.name.trim(),
      code: newCourse.code.trim().toUpperCase() || 'GEN',
      attended: Math.max(0, parseInt(newCourse.attended, 10) || 0),
      total: Math.max(1, parseInt(newCourse.total, 10) || 1),
      target: parseInt(newCourse.target, 10) || 75
    };

    setCourses(prev => [...prev, courseObj]);
    setNewCourse({ name: '', code: '', attended: 0, total: 0, target: 75 });
    setIsAddCourseModalOpen(false);
  };

  const handleDeleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Quick log focus study
  const handleQuickLog = (minutes, label) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStudySessions(prev => [
      { id: Date.now(), subject: label, duration: minutes, time: timeStr },
      ...prev
    ]);
  };

  // Overall attendance calculation
  const totalAttendedAll = courses.reduce((sum, c) => sum + c.attended, 0);
  const totalClassesAll = courses.reduce((sum, c) => sum + c.total, 0);
  const overallAttendancePercent = totalClassesAll > 0 ? Math.round((totalAttendedAll / totalClassesAll) * 100) : 100;

  return (
    <div className="attendance-tracker-page animate-fade-in space-y-6">
      {/* Top Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1E3A5F]/10 text-[#1E3A5F]">
              ACADEMIC WELLNESS & TRACKING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] font-['Outfit']">
            Daily Study Tracker & Attendance Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#374151] mt-1">
            Monitor today's active study hours against your goals, and manage your college 75% attendance criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddCourseModalOpen(true)}
            className="gradient-button flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Progress of the Day (Study Tracker) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress Ring & Goal */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col sm:flex-row items-center gap-6">
          {/* Radial Gauge */}
          <div className="relative size-36 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1E3A5F]/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#1E3A5F] transition-all duration-700 ease-out"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#1E3A5F] font-['Outfit']">{progressPercent}%</span>
              <span className="text-[10px] font-bold text-[#6B7280] tracking-wider uppercase">OF DAILY GOAL</span>
            </div>
          </div>

          {/* Goal & Quick Log */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-between flex-wrap gap-2">
                <span className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1.5">
                  <Target size={16} className="text-[#D97706]" /> Today's Focus Progress
                </span>
                <span className="text-xs text-[#6B7280]">
                  Target: <strong>{dailyGoalHours} hours</strong> ({Math.round(dailyGoalHours * 60)} mins)
                </span>
              </div>
              <p className="text-xs text-[#374151] mt-1">
                You have logged <strong>{totalFocusHours} hours</strong> ({totalFocusMinutes} mins) today. {progressPercent >= 100 ? '🎉 Goal smashed for today!' : `${Math.max(0, Math.round(dailyGoalHours * 60 - totalFocusMinutes))} mins remaining to reach your target.`}
              </p>
            </div>

            {/* Quick Log Buttons */}
            <div>
              <div className="text-[11px] font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">
                ⚡ Quick Log Session
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <button
                  onClick={() => handleQuickLog(15, 'Quick Revision')}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-[#1E3A5F]/20 bg-white hover:bg-[#1E3A5F]/5 text-[#1E3A5F] transition-all cursor-pointer"
                >
                  +15m Revision
                </button>
                <button
                  onClick={() => handleQuickLog(30, 'Problem Solving')}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-[#1E3A5F]/20 bg-white hover:bg-[#1E3A5F]/5 text-[#1E3A5F] transition-all cursor-pointer"
                >
                  +30m Practice
                </button>
                <button
                  onClick={() => handleQuickLog(60, 'Deep Study Block')}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152b46] text-white transition-all cursor-pointer shadow-sm"
                >
                  +1h Deep Work
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Logged Sessions Card */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5 uppercase tracking-wider">
                <Clock size={14} className="text-[#1E3A5F]" /> Today's Log
              </span>
              <span className="text-[11px] text-[#6B7280]">{studySessions.length} sessions</span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {studySessions.length === 0 ? (
                <div className="text-xs text-[#6B7280] text-center py-6">No study sessions logged yet today.</div>
              ) : (
                studySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#1E3A5F]/5 border border-[#1E3A5F]/10">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-[#1A1A2E] truncate">{session.subject}</div>
                      <div className="text-[10px] text-[#6B7280]">{session.time}</div>
                    </div>
                    <span className="font-mono font-bold text-[#059669] shrink-0">+{session.duration}m</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>🔥 5 Day Study Streak</span>
            <span className="font-semibold text-[#1E3A5F]">High Productivity</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: 75% Attendance Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E] font-['Outfit'] flex items-center gap-2">
              <UserCheck size={20} className="text-[#1E3A5F]" /> College Attendance Criteria (75% Rule)
            </h2>
            <p className="text-xs text-[#6B7280]">
              Overall Attendance: <strong className={overallAttendancePercent >= 75 ? 'text-[#059669]' : 'text-[#DC2626]'}>{overallAttendancePercent}%</strong> across {courses.length} courses.
            </p>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map(course => {
            const currentPercent = course.total > 0 ? Math.round((course.attended / course.total) * 100) : 100;
            const target = course.target || 75;
            const isSafe = currentPercent >= target;

            // Bunk / Attend calculations
            // To maintain 75%: attended / (total + x) >= target/100 -> x <= (attended * 100 / target) - total
            const maxBunk = Math.max(0, Math.floor((course.attended * 100) / target) - course.total);

            // If below target: (attended + y) / (total + y) >= target/100 -> y >= (target*total - 100*attended) / (100 - target)
            const mustAttend = !isSafe
              ? Math.ceil((target * course.total - 100 * course.attended) / (100 - target))
              : 0;

            return (
              <div
                key={course.id}
                className="glass-card p-5 flex flex-col justify-between border-l-4 transition-all"
                style={{ borderLeftColor: isSafe ? '#059669' : '#DC2626' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E3A5F]/10 text-[#1E3A5F] font-semibold">
                        {course.code}
                      </span>
                      <h3 className="text-base font-bold text-[#1A1A2E] mt-1 font-['Outfit']">
                        {course.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                        isSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {currentPercent}%
                      </div>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-black/30 hover:text-red-600 transition-colors p-1"
                        title="Delete course"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                      <span>Attended: <strong>{course.attended}</strong> / {course.total} classes</span>
                      <span>Target: {target}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isSafe ? 'bg-[#059669]' : 'bg-[#DC2626]'}`}
                        style={{ width: `${Math.min(100, currentPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Smart Bunk Advice Badge */}
                  <div className="mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 bg-[#FDF6EC]/60 border border-[#1E3A5F]/10">
                    {isSafe ? (
                      <>
                        <CheckCircle2 size={16} className="text-[#059669] shrink-0" />
                        <span className="text-[#059669] font-medium">
                          On track! You can safely miss <strong>{maxBunk}</strong> {maxBunk === 1 ? 'class' : 'classes'} and stay above {target}%.
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="text-[#DC2626] shrink-0" />
                        <span className="text-[#DC2626] font-medium">
                          Shortage alert! You must attend the next <strong>{mustAttend}</strong> consecutive {mustAttend === 1 ? 'class' : 'classes'} to reach {target}%.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-end gap-2">
                  <span className="text-[11px] text-[#6B7280] mr-auto">Mark today:</span>
                  <button
                    onClick={() => markAttendance(course.id, false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                  >
                    <XCircle size={14} /> Absent
                  </button>
                  <button
                    onClick={() => markAttendance(course.id, true)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 size={14} /> Present
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Course Modal */}
      {isAddCourseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-lg font-bold text-[#1A1A2E] font-['Outfit'] flex items-center gap-2">
                <BookOpen size={18} className="text-[#1E3A5F]" /> Add Course for Attendance
              </h3>
              <button onClick={() => setIsAddCourseModalOpen(false)} className="text-black/40 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1A1A2E]/70 block mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Networks"
                  value={newCourse.name}
                  onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-black/15 bg-white text-xs text-black outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E]/70 block mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={newCourse.code}
                    onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-black/15 bg-white text-xs text-black outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E]/70 block mb-1">Minimum Target %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newCourse.target}
                    onChange={e => setNewCourse({ ...newCourse, target: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-black/15 bg-white text-xs text-black outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E]/70 block mb-1">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={newCourse.attended}
                    onChange={e => setNewCourse({ ...newCourse, attended: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-black/15 bg-white text-xs text-black outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E]/70 block mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    min="0"
                    value={newCourse.total}
                    onChange={e => setNewCourse({ ...newCourse, total: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-black/15 bg-white text-xs text-black outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium border border-black/15 bg-transparent text-[#374151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-button px-4 py-2 rounded-lg text-xs font-semibold text-white"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
