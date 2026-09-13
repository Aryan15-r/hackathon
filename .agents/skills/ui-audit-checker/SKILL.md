---
name: ui-audit-checker
description: Comprehensive UI & visual design auditor for evaluating text sizes, contrast ratios, responsive scaling, section margins, element padding, dark/light theme consistency, and interactive states in web applications. Use whenever auditing, designing, or repairing web application UIs.
---

# UI Audit Checker Skill

This skill provides an automated and systematic design system review protocol to ensure high visual quality, contrast compliance, responsive scaling, and proper section layout spacing across web applications.

---

## 1. Typography & Hierarchy Standard

When reviewing or building UI components, enforce strict typographical hierarchy:

| Element | Recommended Tailwind Classes | Font Weight | Line Height |
| :--- | :--- | :--- | :--- |
| **Page Title (H1)** | `text-2xl sm:text-3xl lg:text-4xl` | `font-extrabold` / `font-bold` | `leading-tight` |
| **Section Header (H2)** | `text-xl sm:text-2xl` | `font-bold` | `leading-snug` |
| **Subheader (H3)** | `text-base sm:text-lg` | `font-bold` | `leading-normal` |
| **Card Title** | `text-sm sm:text-base` | `font-bold` | `leading-snug` |
| **Body Text** | `text-xs sm:text-sm` (12px - 14px) | `font-normal` / `font-medium` | `leading-relaxed` (1.5-1.6) |
| **Labels & Badges** | `text-[10px]` or `text-[11px]` | `font-semibold` / `font-mono` | `leading-none` |

---

## 2. Color Contrast Compliance (WCAG AA & AAA)

Every text element MUST contrast sharply against its immediate background container.

### Dark Background Containers (`bg-[#0F172A]`, `bg-[#1E3A5F]`, `bg-[#18191C]`, `bg-[#0D1117]`)
- **Primary Body Text**: MUST use `text-white` or `text-slate-100` (Contrast ratio $\ge 7:1$).
- **Secondary / Muted Text**: MUST use `text-white/80`, `text-slate-300`, or `text-gray-300`.
- ❌ **Forbidden on Dark**: NEVER use `text-slate-500`, `text-gray-600`, or dark navy on dark backgrounds.
- **Accents & Highlights**: Use `text-amber-400`, `text-emerald-400`, or `text-indigo-300`.

### Light Background Containers (`bg-white`, `bg-slate-50`, `bg-[#FDF6EC]`)
- **Primary Body Text**: MUST use `text-[#1A1A2E]`, `text-slate-900`, or `text-[#0F172A]`.
- **Headings**: MUST use `text-[#1E3A5F]` or `text-slate-900` `font-bold`.
- **Secondary Text**: MUST use `text-slate-600` or `text-slate-700`.
- ❌ **Forbidden on Light**: NEVER use white text (`text-white`), yellow text (`text-amber-200`), or light gray on white cards.

---

## 3. Section Margins, Padding & Scale Guidelines

### Container & Layout Spacing
- **Main Viewport Wrappers**: `px-4 sm:px-6 lg:px-8 py-6`
- **Section Gaps**: `space-y-6 sm:space-y-8`
- **Grid Gaps**: `gap-4 sm:gap-6`

### Cards & Panel Elements
- **Compact Card Padding**: `p-4 sm:p-5`
- **Hero / Feature Panel Padding**: `p-6 sm:p-8`
- **Border Radius**: Consistent rounding (`rounded-xl` for cards, `rounded-2xl` for modals/panels, `rounded-lg` for buttons).

### Interactive Target Sizing
- **Standard Action Buttons**: `px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold h-10`
- **Compact / Icon Buttons**: `p-2 rounded-lg text-xs h-8 w-8`
- **Touch Target Requirement**: Minimum 36px $\times$ 36px interactive hit area.

---

## 4. Overlay & Z-Index Elevation Hierarchy

Ensure sticky and popup overlays do not clip behind content:

| Layer Type | Z-Index Class | Use Case |
| :--- | :--- | :--- |
| **Sticky Navigation Bar** | `z-50` | Top header navigation |
| **Mobile Drawer / Sticky CTA** | `z-40` | Mobile bottom bar |
| **Modal Backdrops & Dialogs** | `z-[600]` | Modals, confirmation popups |
| **Cookie Banner & Global Toasts**| `z-[9999]` | Unintrusive floating banners |

---

## 5. Audit Workflow Procedure

When executing a UI audit:
1. **Inspect Background Tokens**: Identify every panel's background color (`bg-*`).
2. **Verify Children Text Contrast**: Ensure child text elements match the contrast matrix above.
3. **Check Responsive Breakpoints**: Verify layout adapts cleanly from mobile (`375px`) to desktop (`1440px`).
4. **Test Interactive Feedback**: Confirm all buttons have hover, focus, and active visual states.
