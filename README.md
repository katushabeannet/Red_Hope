# RedHope — UBTS Intelligent Blood Donor Retention Platform

> Final-Year Computer Science Capstone Project | Makerere University
> An AI-powered web platform built for the Uganda Blood Transfusion Service (UBTS) to intelligently manage, engage, and retain blood donors across Uganda.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [System Architecture](#3-system-architecture)
4. [Key Features](#4-key-features)
5. [Technology Stack](#5-technology-stack)
6. [Data Models](#6-data-models)
7. [API Reference](#7-api-reference)
8. [Installation & Setup](#8-installation--setup)
9. [Seeding Sample Data](#9-seeding-sample-data)
10. [Default Credentials](#10-default-credentials)
11. [Project Structure](#11-project-structure)
12. [AI & Machine Learning Components](#12-ai--machine-learning-components)
13. [Donor Retention Framework](#13-donor-retention-framework)
14. [Authors](#14-authors)

---

## 1. Project Overview

**RedHope** (codename: UBTS Intelligent Platform) is a full-stack web application that combines artificial intelligence, geospatial analysis, and donor psychology to address one of Uganda's most persistent healthcare challenges — the low retention rate of voluntary blood donors.

The platform serves two audiences:

| User | Role |
|------|------|
| **UBTS Staff / Administrators** | Manage donors, run AI-powered campaigns, track donation camps, send outreach communications, monitor blood demand |
| **Blood Donors** | View their donation history, check eligibility, receive personalised notifications, earn gamification badges, and locate nearby camps |

---

## 2. Problem Statement

Uganda's blood supply consistently falls below WHO-recommended safe levels. The Uganda Blood Transfusion Service relies heavily on replacement donors (family members of patients) rather than voluntary regular donors. Key issues include:

- **Low repeat donation rates** — most donors give once and are never contacted again
- **No personalised outreach** — mass SMS blasts with no targeting waste resources and annoy donors
- **No eligibility intelligence** — staff cannot quickly tell which donors are medically ready to donate again
- **Geographic blindness** — no way to know which donors are near an active camp
- **No gamification** — donors receive no recognition or motivation to return

RedHope addresses each of these through AI-driven eligibility assessment, geospatial availability scoring, personalised campaign targeting, badge-based gamification, and multi-channel outreach (SMS + WhatsApp).

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              React 19 + Vite  (port 5173)                   │
│   Public Pages │ Auth Pages │ Donor Dashboard │ Admin Shell │
└───────────────────────────┬─────────────────────────────────┘
                            │  REST API (Axios + JWT)
┌───────────────────────────▼─────────────────────────────────┐
│                         BACKEND                             │
│           Django 6 + Django REST Framework  (port 8000)     │
│                                                             │
│  accounts │ donors │ camps │ campaigns │ notifications       │
│           │ chatbot │ neo4j_service                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │                            │
   ┌──────────▼───────────┐    ┌───────────▼──────────┐
   │    PostgreSQL DB      │    │    AI / ML Layer      │
   │  (primary data store) │    │  scikit-learn models  │
   │                       │    │  sentence-transformers│
   │                       │    │  OpenAI GPT chatbot   │
   └───────────────────────┘    └──────────────────────┘
```

---

## 4. Key Features

### Public-Facing Website
| Feature | Description |
|---------|-------------|
| Landing Page | Hero section, mission statement, impact statistics, call-to-action |
| About Page | Team profiles with real photos, organisation background |
| Process Page | Step-by-step blood donation process with interactive visuals |
| Campaigns Page | Active donation drives and public campaign awareness |
| Contact Page | Contact form and location details |
| AI Chatbot (Reddy) | Intelligent chatbot powered by OpenAI GPT for donor Q&A |

### Donor Dashboard
| Feature | Description |
|---------|-------------|
| Dashboard Overview | Personal stats — total donations, badges earned, eligibility status |
| AI Eligibility Check | Instant AI assessment of whether a donor can donate today (age, weight, haemoglobin, conditions) |
| AI Availability Check | Probabilistic score (0–1) of how likely a donor is to respond to outreach |
| Donation History | Full chronological record of all past donations with camp names |
| My Profile | Update personal information, blood group, address, coordinates |
| Gamification Badges | Earn badges: First Drop, Life Saver, Regular Donor, Rare Blood Hero |
| Blood Demand Alerts | See active blood shortage alerts relevant to their blood group |
| Notifications | Personalised inbox — badge awards, retention reminders, camp alerts |
| Donation Certificate | Download a certificate for any recorded donation |

### Admin Dashboard
| Feature | Description |
|---------|-------------|
| Dashboard Overview | Platform-wide statistics — total donors, active camps, recent activity |
| Donor Management | Full list of all registered donors, search, filter, medical record management |
| Walk-In Donor Registration | 3-step wizard to register donors at a camp in real time, with account creation and optional medical records |
| Personalised Campaign Targeting | AI-powered scan — select blood group + radius → ranked list of best donors to contact |
| Campaign History | View all past campaign scans with conversion metrics |
| Manage Camps | Create, edit, and manage donation camps (ACTIVE / INACTIVE / COMPLETED) |
| Blood Demand Alerts | Create and manage hospital blood shortage alerts with urgency levels |
| SMS Management | Toggle SMS outreach on/off, view SMS delivery logs |
| WhatsApp Management | Toggle WhatsApp outreach, view delivery logs |
| Notifications | Admin notification inbox |

---

## 5. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 8.0 | Build tool and dev server |
| React Router DOM | 7.16 | Client-side routing |
| Axios | 1.16 | HTTP client for API calls |
| Recharts | 3.8 | Charts and data visualisation |
| React Leaflet + Leaflet | 5.0 / 1.9 | Interactive maps for camp and donor locations |
| React Big Calendar | 1.20 | Calendar view for camp scheduling |
| Framer Motion | 12.4 | Animations and transitions |
| React Icons (Remix Icons) | 5.6 | Icon library |
| date-fns | 4.4 | Date formatting and calculation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 6.0 | Web framework |
| Django REST Framework | 3.17 | REST API layer |
| django-cors-headers | 4.9 | Cross-origin resource sharing |
| psycopg2-binary | 2.9 | PostgreSQL adapter |
| python-decouple | 3.8 | Environment variable management |
| scikit-learn | 1.9 | ML models for donor scoring |
| sentence-transformers | 5.6 | NLP embeddings for chatbot |
| transformers + torch | 4.57 / 2.12 | Hugging Face transformer models |
| openai | 0.28 | GPT-powered chatbot |
| pandas + numpy | 3.0 / 2.4 | Data processing for AI features |
| qrcode | 8.2 | QR code generation (donation certificates) |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary relational database |

---

## 6. Data Models

### `accounts.User` (extends Django AbstractUser)
```
email (unique, login field) | username | full_name | role (ADMIN/DONOR/GUEST)
is_staff | is_superuser
```

### `donors.DonorProfile`
```
user (1:1) | phone_number | blood_group | date_of_birth | gender | address
total_donations | latitude | longitude | whatsapp_number | whatsapp_consent
```

### `donors.DonorMedicalRecord`
```
donor (1:1) | weight_kg | hemoglobin_level | has_recent_illness
has_chronic_condition | last_donation_date | is_pregnant | is_on_medication
```

### `donors.EligibilityAssessment`
```
donor (FK) | is_eligible | age | reasons (JSON array) | summary | assessed_at
```

### `donors.AvailabilityAssessment`
```
donor (FK) | is_available | availability_probability (0.0–1.0)
reasons (JSON array) | summary | assessed_at
```

### `donors.DonationRecord`
```
donor (FK) | donation_date | camp_name | notes | recorded_at
```

### `donors.DonorBadge`
```
donor (FK) | badge_name | badge_description | awarded_at
```

### `camps.DonationCamp`
```
name | description | region | district | venue | latitude | longitude
start_date | end_date | contact_phone | status (ACTIVE/INACTIVE/COMPLETED)
```

### `campaigns.CampaignPerformance`
```
blood_group | radius_km | campaign_latitude | campaign_longitude
total_matches | available_donors | unavailable_donors
high/medium/low_priority_donors | ineligible_donors | outside_radius_donors
average_availability_score | average_campaign_priority_score
contacted_donors | converted_donors | campaign_name | created_by
```

### `campaigns.CampaignResponse`
```
campaign (FK) | donor (FK) | status (CONTACTED/RESPONDED/DONATED/NOT_INTERESTED)
response_date | outcome | notes | recorded_by
```

### `notifications.BloodDemandAlert`
```
blood_group | title | message | urgency_level (CRITICAL/HIGH/MEDIUM/LOW)
units_needed | hospital_name | status (ACTIVE/RESOLVED) | notified_count
resolved_at | created_by
```

### `notifications.Notification`
```
recipient (FK) | title | message
notification_type (RETENTION/BADGE/CAMP/BLOOD_DEMAND/SYSTEM)
target_role | is_read | action_label | action_url
```

### `notifications.SMSLog / WhatsAppLog`
```
recipient (FK) | phone_number | message | status (SENT/FAILED/SKIPPED)
error_message | response_data (JSON) | created_at
```

---

## 7. API Reference

Base URL: `http://localhost:8000/api`

### Authentication — `/api/auth/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login/` | Login — returns JWT access + refresh tokens |
| POST | `/auth/register/` | Public donor self-registration |
| POST | `/auth/token/refresh/` | Refresh access token |
| POST | `/auth/forgot-password/` | Send password reset email |
| POST | `/auth/reset-password/` | Reset password using UID + token |

### Donor — `/api/donors/`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET / PATCH | `/donors/profile/` | Donor | View / update own profile |
| PATCH | `/donors/profile/update/` | Donor | Update profile fields |
| GET / POST / PATCH | `/donors/medical-record/` | Donor | View / create / update medical record |
| GET | `/donors/eligibility-check/` | Donor | Run AI eligibility assessment |
| GET | `/donors/availability-check/` | Donor | Run AI availability assessment |
| GET | `/donors/assessment-history/` | Donor | View past assessments |
| GET | `/donors/donation-history/` | Donor | View all donation records |
| GET | `/donors/certificate/<id>/` | Donor | Generate donation certificate |
| GET | `/donors/impact/` | Donor | Impact stats (lives saved, etc.) |
| GET | `/donors/retention-summary/` | Donor | Personal retention insights |
| GET | `/donors/admin/donors/` | Admin | List all donors |
| POST | `/donors/admin/record-donation/` | Admin | Record a new donation for a donor |
| GET/POST/PATCH | `/donors/admin/medical-record/` | Admin | Manage any donor's medical record |
| GET | `/donors/admin/donors/export/` | Admin | Export donor list as CSV |
| GET | `/donors/admin/donors/lapsed/` | Admin | List lapsed donors |
| GET | `/donors/admin/campaign-ready/` | Admin | List campaign-ready donors |
| POST | `/donors/admin/retention-reminders/` | Admin | Send retention reminder notifications |
| POST | `/donors/admin/personalized-campaign-scan/` | Admin | Run AI campaign scan |
| POST | `/donors/admin/walkin-register/` | Admin | Register a walk-in donor |
| GET/POST | `/donors/camp-checkin/<camp_id>/` | Admin | Check in a donor at a camp |

### Camps — `/api/camps/`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/camps/` | Any | List all active camps |
| GET | `/camps/<id>/` | Any | Camp detail |
| POST | `/camps/` | Admin | Create a camp |
| PATCH | `/camps/<id>/` | Admin | Update a camp |
| DELETE | `/camps/<id>/` | Admin | Delete a camp |

### Notifications — `/api/notifications/`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications/` | Any (own) | List own notifications |
| PATCH | `/notifications/<id>/mark-read/` | Any | Mark notification as read |
| GET | `/notifications/blood-demand-alerts/` | Any | List blood demand alerts |
| POST | `/notifications/blood-demand-alerts/` | Admin | Create a blood demand alert |
| PATCH | `/notifications/blood-demand-alerts/<id>/` | Admin | Update / resolve an alert |
| GET | `/notifications/sms-logs/` | Admin | View SMS delivery logs |
| GET/PATCH | `/notifications/sms-settings/` | Admin | View / toggle SMS setting |
| GET | `/notifications/whatsapp-logs/` | Admin | View WhatsApp delivery logs |
| GET/PATCH | `/notifications/whatsapp-settings/` | Admin | View / toggle WhatsApp setting |

### Chatbot — `/api/chatbot/`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chatbot/ask/` | None | Send a message to Reddy AI chatbot |

### Campaigns — `/api/admin/`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/campaign-history/` | Admin | List all past campaign scans |
| GET | `/admin/campaign-history/<id>/responses/` | Admin | View responses for a scan |
| POST/PATCH | `/admin/campaign-history/<id>/responses/<donor_id>/` | Admin | Record / update a donor response |

---

## 8. Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- pip and npm

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd ubts-intelligent-platform/backend

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create a .env file in the backend root with the following keys:
#    (Copy the template below and fill in your values)
```

**`.env` template:**
```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=redhope_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

OPENAI_API_KEY=your-openai-api-key

# Optional — Twilio SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Optional — WhatsApp Business API
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

```bash
# 5. Create the PostgreSQL database
# In psql:
CREATE DATABASE redhope_db;

# 6. Run Django migrations
python manage.py migrate

# 7. Start the backend server
python manage.py runserver
# Backend runs at http://localhost:8000
```

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd ubts-intelligent-platform/frontend

# 2. Install Node dependencies
npm install

# 3. Start the development server
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 9. Seeding Sample Data

The seed is split into two steps because Django requires Python for password hashing.

### Step 1 — Create user accounts

```bash
cd ubts-intelligent-platform/backend
python manage.py shell < seed_users.py
```

This creates 1 admin account and 15 Ugandan donor accounts.

### Step 2 — Seed all other data

Run `seed_data.sql` in your PostgreSQL database after Step 1:

```bash
psql -U postgres -d redhope_db -f seed_data.sql
```

Or open the file in pgAdmin / DBeaver and execute it as a query.

### What the seed provides
- 8 donation camps across Uganda (Kampala, Mulago, Entebbe, Mbarara, Gulu, Jinja, Mbale, Fort Portal)
- 15 donor profiles with realistic Ugandan demographics, coordinates, and blood groups
- 14 medical records (including 2 ineligible donors — Grace: low haemoglobin, Emmanuel: chronic condition)
- 47 donation records matching each donor's total_donations count
- 28 gamification badges awarded based on donation milestones
- 14 AI eligibility assessments with JSONB reasons
- 14 AI availability assessments with probability scores (0.18 – 0.92)
- 3 past campaign performance records
- 8 campaign responses
- 6 blood demand alerts (3 active including a CRITICAL O- shortage)
- 12 notifications across all types
- 15 SMS log entries and 6 WhatsApp log entries
- SMS and WhatsApp settings (both disabled — safe for testing)

---

## 10. Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@redhope.ug | Admin@UBTS2024 |
| Donor (veteran, O+) | david.kizito@gmail.com | Donor@UBTS123 |
| Donor (O- rare, 6 donations) | robert.ssebagala@gmail.com | Donor@UBTS123 |
| Donor (ineligible — low Hgb) | grace.nakato@gmail.com | Donor@UBTS123 |
| Donor (deferred — chronic) | emmanuel.tumwesigye@gmail.com | Donor@UBTS123 |
| Donor (A-, rare blood) | flavia.namukasa@gmail.com | Donor@UBTS123 |
| Donor (no donations yet) | rose.akello@gmail.com | Donor@UBTS123 |

All other donors use password: `Donor@UBTS123`

---

## 11. Project Structure

```
Red_Hope/
├── README.md
├── DEMO_GUIDE.md
├── seed_users.py              ← Run first: creates user accounts
├── seed_data.sql              ← Run second: all other sample data
│
└── ubts-intelligent-platform/
    ├── backend/
    │   ├── config/            ← Django project settings & root URLs
    │   ├── accounts/          ← Custom User model, JWT auth, registration
    │   ├── donors/            ← DonorProfile, medical records, AI assessments,
    │   │                          donation records, badges, campaign views
    │   ├── camps/             ← DonationCamp model and CRUD API
    │   ├── campaigns/         ← CampaignPerformance, CampaignResponse
    │   ├── notifications/     ← Notifications, SMS/WhatsApp logs, BloodDemandAlerts
    │   ├── chatbot/           ← Reddy AI chatbot views (OpenAI GPT)
    │   ├── neo4j_service/     ← (reserved for graph-based donor network analysis)
    │   ├── seed_users.py      ← Django shell user seed script
    │   ├── seed_data.sql      ← Full PostgreSQL sample data
    │   └── requirements.txt
    │
    └── frontend/
        ├── public/
        ├── src/
        │   ├── assets/        ← Images, logos, team photos
        │   ├── components/    ← Reusable UI components (Chatbot, ScrollToTop, etc.)
        │   ├── context/       ← AuthContext, ThemeContext
        │   ├── layouts/       ← MainLayout (public), AuthLayout + Sidebar (dashboard)
        │   ├── pages/
        │   │   ├── public/    ← Home, About, Process, Campaigns, Contact, NotFound
        │   │   ├── auth/      ← Login, Register, ForgotPassword, ResetPassword
        │   │   ├── chatbot/   ← Chatbot full page
        │   │   ├── admin/     ← All admin dashboard pages
        │   │   └── donor/     ← Donor dashboard pages
        │   ├── routes/        ← ProtectedRoute component
        │   ├── services/      ← Axios API service files per domain
        │   ├── App.jsx        ← Route definitions
        │   ├── main.jsx       ← React entry point
        │   └── index.css      ← Global design system (CSS variables, card tiers)
        └── package.json
```

---

## 12. AI & Machine Learning Components

### Eligibility Assessment Engine
**File:** `donors/views.py` → `eligibility_check_view`

Evaluates a donor's current medical suitability using rule-based logic on:
- Age (18–65 years)
- Weight (≥ 50 kg minimum)
- Haemoglobin level (≥ 13.5 g/dL male, ≥ 12.5 g/dL female)
- Chronic conditions and active medication status
- Interval since last donation (≥ 90 days)
- Pregnancy status

Returns: `is_eligible` boolean + `reasons` list + narrative `summary`

**Why this matters:** Traditionally, UBTS staff manually reviewed paper forms at the camp gate. The AI assessment lets both donors and staff know in advance whether a donation attempt is likely to succeed — reducing wasted trips and deferral embarrassment.

### Availability Assessment Engine
**File:** `donors/views.py` → `availability_check_view`

Uses a weighted scoring model combining:
- Historical donation frequency and recency
- Time since last donation (donation interval adherence)
- Medical eligibility status
- Blood group rarity multiplier (rare groups score higher)
- WhatsApp consent (preferred channel availability)
- Geographic proximity to active camps

Returns: `availability_probability` (0.0 – 1.0) + `is_available` boolean + `reasons` list

**Why this matters:** Instead of contacting all 500 donors before a camp, the AI ranks them and the admin contacts only the top 20 with the highest probability. This saves staff time and reduces donor fatigue from unwanted messages.

### Personalised Campaign Targeting Scan
**File:** `donors/views_campaign.py` → `personalized_campaign_scan_view`

Combines eligibility + availability scores with geospatial distance filtering:
1. Admin selects blood group (or "Any") and search radius in km
2. System calculates each donor's distance from the camp coordinates
3. Donors outside the radius are excluded
4. Remaining donors are scored and ranked
5. Result is grouped into: High Priority / Medium Priority / Low Priority / Ineligible / Outside Radius

Returns: structured JSON with ranked donor lists and aggregate campaign statistics

**Why this matters:** This is the core AI innovation — turning a manual "call everyone" process into a targeted, data-driven outreach strategy. Higher conversion rates, fewer wasted contacts.

### Reddy — AI Chatbot
**File:** `chatbot/views.py`

A named chatbot powered by OpenAI GPT, pre-prompted with context about blood donation, UBTS services, and the RedHope platform. Available on both the public website and within the donor dashboard. Handles donor questions about eligibility, donation process, camp locations, and more.

---

## 13. Donor Retention Framework

RedHope is designed around a five-stage donor retention cycle:

```
 ACQUIRE → ASSESS → ENGAGE → RECOGNISE → RE-ACTIVATE
```

| Stage | Platform Feature |
|-------|-----------------|
| **Acquire** | Public website, QR registration at camps, walk-in donor registration by staff |
| **Assess** | AI eligibility check, AI availability scoring, medical record management |
| **Engage** | Personalised campaign targeting, SMS/WhatsApp outreach, blood demand alerts |
| **Recognise** | Badge gamification system (First Drop → Life Saver → Regular Donor → Rare Blood Hero), donation certificates |
| **Re-Activate** | Lapsed donor detection, automated retention reminders, personalised notification inbox |

---

## 14. Authors

**Alberto Grande Nuwarin da** — Lead Developer
- Final Year BSc Computer Science, Makerere University
- Contact: nuwarindaalbertgrande@gmail.com

**Supervisor:** [Supervisor Name]
**Institution:** Makerere University, Kampala, Uganda
**Academic Year:** 2025/2026

---

*Built with the mission: Every donor remembered, every donation valued, every life saved.*
