# 93 Cross Fitness Gym & Spa — Comprehensive User Guide

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Public Website (Marketing Pages)](#3-public-website-marketing-pages)
4. [Authentication System](#4-authentication-system)
5. [Member Portal](#5-member-portal)
6. [Admin Panel](#6-admin-panel)
7. [Technical Architecture](#7-technical-architecture)
8. [Deployment & Hosting](#8-deployment--hosting)
9. [FAQ & Troubleshooting](#9-faq--troubleshooting)

---

## 1. Introduction

### About the Application
93 Cross Fitness Gym & Spa is a **full-stack gym management web application** built for managing memberships, payments, class bookings, leads, expenses, inventory, notifications, and more. It features a stunning public-facing marketing website and a powerful admin dashboard.

### Key Features
- **Marketing Website** — 10+ beautifully designed public pages showcasing services, trainers, pricing, schedule, gallery, blog, and contact
- **Secure Authentication** — Login, signup, forgot password with Supabase Auth
- **Member Portal** — Members can view their dashboard, book classes, track attendance, manage profile, and view payment history
- **Admin Panel** — Full gym management: members, payments, bookings, leads, notifications, expenses, inventory, and analytics reports
- **Fully Responsive** — Works on desktop, tablet, and mobile
- **WhatsApp Integration** — Floating WhatsApp button for instant contact

### Live URLs
| Resource | URL |
|----------|-----|
| **Production Site** | https://93-cross-fitness-gym.vercel.app |
| **GitHub Repository** | https://github.com/BhaveshSolanki2611/93-Cross-Fitness-Gym |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/oyuesibpjbgfmivsmlqz |

---

## 2. Getting Started

### For Visitors (Public)
Simply visit **https://93-cross-fitness-gym.vercel.app** to browse the website. No account needed to view:
- Services offered
- Trainer profiles
- Membership pricing plans
- Class schedule
- Photo gallery
- Blog articles
- Contact information

### For Members
1. Visit the website and click **"Log In"** in the navigation or go to `/login`
2. Enter your registered email and password
3. You'll be redirected to the **Member Portal** at `/portal`

### For Admin/Staff
1. Log in with your staff account at `/login`
2. You'll be redirected to the **Member Portal** first
3. Navigate to `/admin` or click the **"ADMIN PANEL"** button

### Admin Login Credentials
| Field | Value |
|-------|-------|
| Email | admin@93crossfitness.com |
| Password | Admin@93Cross! |
| Role | Super Admin |

---

## 3. Public Website (Marketing Pages)

### 3.1 Home Page (`/`)
The landing page features:
- **Hero section** with animated heading "FORGE YOUR STRONGEST SELF"
- **Google Review badge** — 4.8 stars with 199+ reviews
- **CTA buttons** — "Claim Your Free Trial" and "View Membership Plans"
- **Why Choose Us** section highlighting unique selling points
- **Services overview** with cards
- **Testimonials** from real members
- **WhatsApp floating button** (bottom right corner)

### 3.2 About Page (`/about`)
- Gym story and mission
- Team introduction
- Facility highlights
- Values and culture

### 3.3 Services Page (`/services`)
- Grid of all available services with images
- Each service card links to a detailed individual page
- **Individual Service Pages** (`/services/[slug]`) include:
  - CrossFit, HIIT, Personal Training, Weight Training
  - Yoga, Pilates, Zumba, Kickboxing
  - Nutrition Counseling, Spa & Recovery, Sports Conditioning, Kids Fitness

### 3.4 Trainers Page (`/trainers`)
- Profiles of all 6 certified trainers:
  - **Rohit Verma** — Head Coach (CrossFit, Strength)
  - **Sneha Kapoor** — Yoga & Wellness Lead
  - **Amit Sharma** — HIIT & Kickboxing
  - **Pooja Nair** — Zumba & Dance Fitness
  - **Karan Patel** — Sports Performance
  - **Divya Menon** — Nutrition & Pilates
- Each card shows photo, specialization, certifications, and bio

### 3.5 Pricing Page (`/pricing`)
Four membership tiers displayed in attractive cards:

| Plan | Monthly | Quarterly | Annual |
|------|---------|-----------|--------|
| **Basic** | Rs.1,999 | Rs.4,999 | Rs.17,999 |
| **Pro** | Rs.2,999 | Rs.7,999 | Rs.27,999 |
| **Elite** | Rs.4,999 | Rs.13,999 | Rs.49,999 |
| **VIP** | Rs.9,999 | Rs.24,999 | Rs.89,999 |

Each plan details included features with checkmarks.

### 3.6 Schedule Page (`/schedule`)
- Weekly class timetable organized by day
- Shows class name, trainer, time, and intensity level
- Color-coded by category

### 3.7 Gallery Page (`/gallery`)
- Photo grid of gym facilities, equipment, classes in action
- High-quality images of the gym interior

### 3.8 Blog Page (`/blog`)
- List of articles with thumbnails and excerpts
- Individual blog post pages (`/blog/[slug]`)
- Topics include fitness tips, nutrition, CrossFit vs HIIT comparisons

### 3.9 Contact Page (`/contact`)
- **Contact form** with fields: Name, Email, Phone, Interest (dropdown), Message
- Submitting creates a **Lead** in the admin panel automatically
- **Gym address**: Sector 82, Faridabad, Haryana
- **Phone and email** information displayed

### 3.10 Additional Pages
- **FAQ** (`/faq`) — Frequently asked questions with accordion UI
- **Join** (`/join`) — Membership booking form
- **Fitness Tools** (`/tools`) — BMI calculator, calorie estimator
- **Privacy Policy** (`/privacy`), **Terms** (`/terms`), **Refund Policy** (`/refund`)

---

## 4. Authentication System

### 4.1 Login (`/login`)
- **Email + Password** login form
- "Forgot password?" link for account recovery
- "Create an account" link for new users
- On success, redirects to Member Portal or Admin (based on role)

### 4.2 Sign Up (`/signup`)
- Registration form: **Full Name, Phone, Email, Password**
- Password validation (minimum length, complexity)
- Email verification via Supabase Auth
- New users get the **"member"** role by default

### 4.3 Forgot Password (`/forgot-password`)
- Enter email to receive a password reset link
- Secure reset flow via Supabase Auth

### 4.4 Sign Out
- Click **"SIGN OUT"** button (visible in Portal header and Admin sidebar)
- Clears session and redirects to login page

### 4.5 Role-Based Access
| Role | Portal Access | Admin Access |
|------|---------------|--------------|
| member | Yes | No |
| trainer | Yes | Yes |
| receptionist | Yes | Yes |
| manager | Yes | Yes |
| admin | Yes | Yes |
| super_admin | Yes | Yes (full) |

---

## 5. Member Portal

The Member Portal is the authenticated area where gym members manage their account.

### 5.1 Overview Dashboard (`/portal`)
The main portal page shows:
- **Welcome message** with member name
- **4 KPI cards**:
  - **Membership** — Current plan name and member code (e.g., GX-000001)
  - **Days Remaining** — Countdown to renewal with renewal date
  - **Total Check-ins** — Lifetime check-in count with start date
  - **Status** — Active/Expired with subscription type
- **Recent Payments** — Last payments with invoice numbers and amounts

### 5.2 Book Classes (`/portal/classes`)
- View available classes organized by **Today**, **Tomorrow**, and upcoming days
- Each class card shows:
  - Class name (e.g., "Olympic Lifting", "Vinyasa Flow", "Zumba")
  - Time slot (e.g., 6:00 AM to 7:00 AM)
  - Trainer name
  - Intensity level (High/Medium/Low)
  - **Spots remaining** count
- Click **"BOOK"** button to reserve a spot

### 5.3 Membership (`/portal/membership`)
- View **current plan** details (plan name, term)
- **Validity date** — when the membership expires
- **Last payment amount**
- Instructions to renew at the front desk or via WhatsApp

### 5.4 Payment History (`/portal/payments`)
- Full table of all payments:
  - **Date** — Payment date
  - **Invoice** — Invoice number (e.g., INV-2026-000001)
  - **Method** — CASH, UPI, CARD, etc.
  - **Status** — paid/pending/refunded
  - **Amount** — in INR

### 5.5 Attendance (`/portal/attendance`)
- Monthly visit count with motivational message
- History of all check-ins recorded by admin
- "No check-ins recorded yet" if empty

### 5.6 Profile (`/portal/profile`)
- View and edit personal information:
  - **Email** (read-only, login identifier)
  - **Full Name** (editable)
  - **Phone** (editable)
- Click **"SAVE CHANGES"** to update

---

## 6. Admin Panel

The Admin Panel is the backbone of gym management. Only staff-role users can access it.

### 6.1 Dashboard (`/admin`)
The admin homepage shows a real-time overview:
- **6 KPI Cards**:
  - **Active Members** — Count of members with active subscriptions
  - **Expiring in 7 Days** — Members needing renewal soon
  - **Revenue This Month** — Total payments collected
  - **Pending Bookings** — Bookings awaiting confirmation
  - **New Leads** — Uncontacted leads from website
  - **Check-ins Today** — Today's attendance count
- **Latest Bookings** — Recent booking requests with quick actions

### 6.2 Members Management (`/admin/members`)

#### Viewing Members
- **Search bar** — Search by name, phone, or member code
- **Status filter** — Filter by All statuses, Active, Expired, etc.
- **Member table** with columns: Member, Code, Plan, Valid Till, Status, Visits, Actions

#### Actions per Member
- **Edit** — Opens member edit form (`/admin/members/[id]`)
  - Edit: Full Name, Email, Phone, Member Code
  - Change: Plan, Status, Join Date, End Date
  - Save changes with validation
- **Check-in** — Record a gym visit/attendance
- **Add Member** — Top-right CTA button to create new member

### 6.3 Payments (`/admin/payments`)

#### Revenue Summary
- **Today's Revenue** — Cash collected today
- **This Month's Revenue** — Running monthly total

#### Record a Payment
Form fields:
1. **Member** — Dropdown selector (all members)
2. **Amount (Rs.)** — Payment amount
3. **Method** — CASH, UPI, CARD, NEFT

#### Renew Subscription (Optional)
When recording a payment, optionally renew the member's plan:
1. **Plan** — None, Basic, Pro, Elite, VIP
2. **Term** — Monthly, Quarterly, Annual
3. Click **"RECORD"** to save

#### Payment History Table
- All payments listed with: Date, Member, Invoice, Method, Status, Amount

### 6.4 Bookings (`/admin/bookings`)
- **Filter tabs**: All, Pending, Confirmed, Completed, Cancelled
- Each booking shows:
  - Requested date
  - Contact name, phone, email
  - Type (Membership, Trial, PT, Spa)
  - Preferred date
  - Status badge
- **Actions**: Confirm, Complete, or Cancel bookings

### 6.5 Leads (`/admin/leads`)
- Leads from the Contact page form arrive here
- **Filter tabs**: All, New, Contacted, Trial Booked, Converted, Lost
- Each lead shows:
  - Received date
  - Contact info
  - Interest area
  - Current status
- **Actions**: Update lead status, add notes

### 6.6 Notifications (`/admin/notifications`)

#### Compose Notifications
- **Channel** — WhatsApp, Email, SMS
- **Member** — Select specific member (optional)
- **To** — Phone number or email auto-fills from member
- **Message** — Free text message
- Click **"SEND"** to dispatch (simulated without API keys)

#### Bulk Fee Reminders
- One-click button to notify members whose subscription:
  - Expires within 7 days
  - Lapsed in the last 3 days

#### Notification Log
- History table: When, Member, Channel, Template, Status (sent/simulated/error)

### 6.7 Expenses (`/admin/expenses`)

#### This Month Summary
- Total expenses for the current month displayed prominently

#### Add Expense
- **Category** — Rent, Utilities, Equipment, Salaries, Marketing, Maintenance, Other
- **Amount (Rs.)** — Expense amount
- **Date** — When the expense occurred
- **Note** — Optional description (e.g., "AC repair")
- Click **"ADD EXPENSE"** to save

#### Expense Table
- All expenses listed with: Date, Category, Note, Amount
- **Delete** button to remove incorrect entries

### 6.8 Inventory (`/admin/inventory`)

#### Add Item
- **Item** — Name (e.g., "Treadmill — Matrix T50")
- **Category** — Equipment, Supplements, Merchandise, Cleaning
- **Qty** — Quantity count
- **Maintenance due** — Next maintenance date
- Click **"ADD ITEM"** to save

#### Inventory Table
- Item, Category, Status (In Stock/Low Stock), Maintenance Due, Qty
- **Delete** button to remove items

### 6.9 Reports & Analytics (`/admin/reports`)
Visual analytics dashboard with:

#### KPI Summary Cards
- **Revenue YTD** — Year-to-date total revenue
- **Expenses YTD** — Year-to-date total expenses
- **Net YTD** — Revenue minus expenses (profit)
- **Avg Payment** — Average payment amount

#### Charts
1. **Revenue vs Expenses (6 Months)** — Line/bar chart comparing income to costs over 6 months
2. **New Members** — Bar chart showing member sign-ups per month
3. **Active Plan Mix** — Donut/pie chart showing distribution of membership plans (Basic, Pro, Elite, VIP)

---

## 7. Technical Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4, Custom design system |
| **Database** | PostgreSQL 17.6 (via Supabase) |
| **Auth** | Supabase Auth (email/password) |
| **Backend** | Next.js Server Actions, API Routes |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Hosting** | Vercel (production), Supabase (database) |

### Database Tables
| Table | Purpose |
|-------|---------|
| profiles | User profiles (linked to Supabase Auth) |
| members | Gym member records with plans and codes |
| payments | Payment records with invoices |
| bookings | Class/trial/PT bookings |
| attendance | Check-in records |
| leads | Contact form submissions |
| expenses | Operating cost tracking |
| inventory | Equipment and merchandise |
| notifications_log | Sent notification history |
| subscriptions | Subscription plan history |
| schedule | Class schedule definitions |

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Supabase Auth** for authentication
- **Server-only** database access for admin operations
- **CSRF protection** via Next.js server actions
- **Environment variables** for all secrets (never exposed client-side)

---

## 8. Deployment & Hosting

### Production Deployment
The application is deployed on **Vercel** with automatic deployments:

| Setting | Value |
|---------|-------|
| **Platform** | Vercel |
| **Project** | bhavesh-solankis-projects/93-cross-fitness-gym |
| **Framework** | Next.js (auto-detected) |
| **Region** | Washington D.C. (iad1) |
| **Build Command** | next build |
| **Output Directory** | .next |

### Environment Variables (Production)
All environment variables are configured in Vercel:
- DATABASE_URL — PostgreSQL connection string
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase public key
- SUPABASE_SERVICE_ROLE_KEY — Supabase admin key (server-only)
- NEXT_PUBLIC_SITE_URL — Production URL
- CRON_SECRET — Auth token for scheduled cron jobs

### Running Locally
```
# 1. Clone the repository
git clone https://github.com/BhaveshSolanki2611/93-Cross-Fitness-Gym.git
cd 93-Cross-Fitness-Gym

# 2. Install dependencies
npm install

# 3. Create .env.local with your Supabase credentials

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

---

## 9. FAQ & Troubleshooting

### Q: How do I add a new staff member?
A: Create a user account via the Sign Up page. Then, in the Supabase Dashboard, update their profiles table role to admin, manager, trainer, or receptionist.

### Q: How do I change a member's plan?
A: Go to Admin Panel -> Members -> Click the edit (pencil) icon -> Change the Plan dropdown -> Save.

### Q: How do I record a payment and renew subscription together?
A: Go to Admin Panel -> Payments -> Select the member, enter the amount and method. In the "Renew Subscription" section, select the new plan and term, then click "RECORD".

### Q: Why are notifications in "simulated" status?
A: Without WhatsApp/SMS/Email API keys configured, notifications are logged as "simulated". The message content is still saved for record-keeping. Configure provider APIs for real delivery.

### Q: How do I add a custom domain?
A: In Vercel Dashboard -> Project Settings -> Domains -> Add your domain and configure DNS records.

### Q: How do I update the class schedule?
A: The class schedule is currently managed via the schedule database table. Update entries in the Supabase Dashboard table editor.

### Q: Contact form submissions don't appear in Leads?
A: Ensure the leads table exists in your Supabase database and that the forms.ts server action is correctly inserting records.

---

**Copyright 2026 93 Cross Fitness Gym & Spa. All rights reserved.**

*Document Version: 1.0 | Last Updated: July 2026*
