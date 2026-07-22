# 93 Cross Fitness — Build Roadmap

Last verified: 2026-07-22. Build status: `npm run build` clean, 48 routes.

---

## ✅ Done

| Phase | What |
|-------|------|
| 0 — Foundation | Next.js 16 scaffold, Tailwind v4, all deps, site.ts config, theme, fonts |
| 1 — Design system | Header/nav, footer, Lenis smooth-scroll, motion primitives, UI primitives |
| 2 — Marketing site | 35 pages: home, about, services×12, trainers, pricing, schedule, gallery, blog×3, faq, tools, contact, join, legal×3, 404/error. SEO: sitemap, robots, JSON-LD, per-page metadata |
| 3 — Supabase backend | 19 tables, migrations 0001–0008, 37 RLS policies (0 gaps), seed data, role model (8 roles + self-promotion guard) |
| 4 — Auth | Signup/login pages, server actions, @supabase/ssr clients, middleware route guards |
| 5 — Member portal | /portal: overview (membership status, days left), payments/invoices, attendance, editable profile |
| 5 — Admin panel | /admin: dashboard KPIs, member CRUD + check-in, record payment, bookings workflow, leads pipeline, expenses, inventory, notifications UI, reports (recharts) |
| 5 — Notify abstraction | src/lib/notify.ts: email (Resend) + WhatsApp (Meta Cloud) + SMS, simulated fallback, bulk fee-expiry reminders. Code done; keys not wired yet |

---

## 🔴 Must-do before launch

### 1. Rotate all credentials ← DO THIS FIRST, MANUALLY
The Supabase DB password, anon key, and service_role key were shared in a previous chat session.
- Supabase dashboard → Project Settings → Database → Reset password
- Supabase dashboard → Project Settings → API → Regenerate anon + service_role keys
- Update `.env.local` with new values
- Change admin password after first login

### 2. Razorpay online payments — ✅ BUILT (needs keys to go live)
Implemented 2026-07-22:
- `POST /api/razorpay/order` — auth member → plan price lookup → creates order (auto-creates the `members` row on first purchase, closing the signup-link gap)
- `POST /api/razorpay/verify` — checkout callback; verifies signature, reads trusted amount/notes from Razorpay, records payment
- `POST /api/razorpay/webhook` — `payment.captured` backstop; signature-verified, retries safely
- Idempotent recording (`migration 0009`, unique `razorpay_payment_id`); stacked renewals extend from current end date; SQL validated against live DB (rolled back)
- `/portal/membership` page + checkout UI (`RenewMembership`); shows "coming soon" until keys are set

**Remaining:** create a Razorpay account, put `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` in `.env.local`, add the webhook URL in the Razorpay dashboard, and test with test-mode keys.

### 3. Real images
Every photo is a `MediaPlaceholder` branded gradient. Replace with real gym photos:
- Drop files into `public/images/real/`
- Swap `<MediaPlaceholder>` for `<Image>` (next/image) in each component
- Separate folders already exist: `public/images/real/` vs `public/images/stock/`

### 4. Verify NAP + hours
Business facts are owner-brief only, never web-verified. The address/phone/hours in `src/config/site.ts` must exactly match the Google Business listing for local SEO.

### 5. Legal pages
Privacy, terms, and refund pages are templates. Get lawyer-reviewed text before launch.

---

## 🟡 Important functional gaps

### 6. Notifications — ✅ WIRED (needs provider keys to go live)
Implemented 2026-07-22:
- Shared reminder core `src/lib/reminders.ts` (3-day dedup so the daily cron doesn't spam)
- `GET /api/cron/reminders` + `vercel.json` cron (daily 10:07 IST), guarded by `CRON_SECRET`
- Event sends: renewal thanks on Razorpay payment (verify + webhook, first-processing only), booking-confirmed message when staff confirm a booking
- All sends logged to `notifications_log`; simulate mode without keys

**Remaining:** add `RESEND_API_KEY`/`NOTIFY_FROM_EMAIL` (email) and `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` (WhatsApp) + `CRON_SECRET` to env; verify a real send from `/admin/notifications`.

### 7. Member class-booking UI — ✅ BUILT
Implemented 2026-07-22: `/portal/classes` — 7-day view of the weekly schedule with per-slot
spots-left, Book button (capacity + duplicate + weekday validation server-side), your-upcoming-classes
list with Cancel (ownership enforced). Bookings land as `confirmed` `group_class` rows and appear in
`/admin/bookings`. SQL validated against live DB (rolled back).

### 8. Signup → member record link — ✅ PARTLY CLOSED
The Razorpay order route now auto-creates the `members` row on first online purchase.
Front-desk signups still need admin linking via `/admin/members/new` (unchanged workaround).

### 9. Admin schedule editor
Class schedule is currently seed-data only (SQL). Admins can't edit it via UI.
- Add CRUD to `/admin/schedule` (or extend `/admin/bookings`)

---

## 🟢 Polish / stretch (post-launch)

| Item | Notes |
|------|-------|
| Real R3F 3D hero | Currently animated CSS/SVG placeholder. Add react-three-fiber scene as enhancement |
| Lighthouse audit | Target: Perf ≥85, SEO ≥95, A11y ≥90. Run after real images are in |
| Screen-reader pass | Test with NVDA/JAWS/VoiceOver |
| Rate limiting | Add to signup/login/forms (Vercel rate limit or Upstash) |
| Analytics | Add Google Analytics or Plausible |
| PDF invoices | Export payment receipts as PDF from portal + admin |
| QR / ID cards | Member QR code for attendance scanning |
| Bulk import/export | CSV import for members, Excel export for reports |
| AI chatbot | WhatsApp/web chat for FAQs + lead capture |
| Trainer management | Schedules, assigned members, salary/incentive tracking |
| Staff payroll/leave | HR module |
| GST / P&L reports | Finance module |
| CMS | Admin UI for blogs, gallery, testimonials, homepage banners |

---

## Deployment checklist (when ready to ship)

- [ ] Rotate all Supabase credentials
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Add real images to `public/images/real/`
- [ ] Update legal pages with reviewed text
- [ ] Set up domain (e.g. `93crossfitness.com`) → Vercel
- [ ] Add analytics script
- [ ] Test signup → portal flow on production
- [ ] Test admin login → add member → record payment on production
- [ ] Run Lighthouse on production URL
