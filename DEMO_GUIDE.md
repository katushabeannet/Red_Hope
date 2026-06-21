# RedHope — Full Feature Demo & Presentation Guide

> This guide walks through every feature of the RedHope platform step by step.
> Use it during your presentation to run a complete, confident live demo.
> Each section explains WHAT to click, WHY the feature was built, and HOW it benefits donor retention.

---

## Before You Start — Pre-Flight Checklist

Run these in two separate terminal windows before your presentation:

**Terminal 1 — Backend:**
```bash
cd ubts-intelligent-platform/backend
venv\Scripts\activate
python manage.py runserver
# Should say: Starting development server at http://127.0.0.1:8000/
```

**Terminal 2 — Frontend:**
```bash
cd ubts-intelligent-platform/frontend
npm run dev
# Should say: Local: http://localhost:5173/
```

Open your browser to **http://localhost:5173**

Make sure you have run the seed scripts first:
```bash
python manage.py shell < seed_users.py
psql -U postgres -d redhope_db -f seed_data.sql
```

---

## Demo Flow Overview

The recommended presentation order tells a story:

```
1. Public Website (what a visitor sees before registering)
2. Donor Registration (how a new donor joins)
3. Donor Login + Dashboard (the donor experience)
4. AI Eligibility Check (core AI feature #1)
5. AI Availability Check (core AI feature #2)
6. Donation History + Badges (gamification and recognition)
7. Blood Demand Alerts — Donor View (urgency awareness)
8. Notifications Inbox (personalised communication)
9. Reddy Chatbot (AI assistant)
10. Admin Login + Dashboard (management view)
11. Donor Management Page (full donor overview)
12. Walk-In Donor Registration (camp-day feature)
13. Personalised Campaign Targeting (core AI feature #3)
14. Campaign History (tracking outreach results)
15. Manage Donation Camps (geographic management)
16. Blood Demand Alerts — Admin View (creating alerts)
17. SMS & WhatsApp Management (multi-channel outreach)
18. Dark Mode Toggle (UI polish)
```

---

## Part 1 — The Public Website

*Audience: General visitors, prospective donors, presentation panel*

### 1.1 Home Page — http://localhost:5173/

**What to do:**
- Open the site at the root URL
- Let the hero section load — observe the animated headline and the blood drop/donor imagery
- Scroll slowly through the page, noting: impact statistics, how-it-works section, call-to-action buttons
- Point out the "Donate Blood" and "Learn More" CTA buttons

**What to say:**
> "This is the public landing page that any Ugandan visiting the RedHope platform sees. We designed it to immediately communicate the mission — saving lives through organised voluntary blood donation. The statistics section shows real aggregate data pulled from the platform."

**Why it matters for retention:**
> The public page is the entry point for new donor acquisition. A clear, compelling first impression increases the conversion rate of curious visitors into registered donors.

---

### 1.2 About Page — http://localhost:5173/about

**What to do:**
- Click "About" in the navigation bar
- Scroll to the Team Section — show the real team member cards with photos and roles

**What to say:**
> "The About page shows the team behind RedHope. We deliberately used real photos rather than placeholders to humanise the platform and build trust with donors."

---

### 1.3 Process Page — http://localhost:5173/process

**What to do:**
- Click "Process" in the navigation
- Walk through each step of the donation process shown on the page

**What to say:**
> "One barrier to first-time donation is fear of the unknown — people don't know what happens when they show up. This page demystifies the donation process step by step, from registration to refreshments after donation. Reducing anxiety directly increases the likelihood of first donations."

---

### 1.4 Reddy Chatbot — http://localhost:5173/chatbot

**What to do:**
- Click "Chatbot" or navigate to `/chatbot`
- Type a question such as: **"Can I donate if I have malaria?"**
- Wait for the response and show the AI answer
- Try another: **"What blood type is most needed in Uganda?"**
- Show the Reddy branding and watermark

**What to say:**
> "Meet Reddy — our AI-powered donor assistant. Reddy is available 24/7 to answer any blood donation question. This matters because donor questions typically come at night or on weekends when UBTS offices are closed. With Reddy, no question goes unanswered and no prospective donor is turned away due to lack of information."

**Why it matters for retention:**
> Donors who feel informed and supported are significantly more likely to follow through with donation and return for repeat donations. Reddy is always available — no staff required.

---

## Part 2 — Donor Registration

### 2.1 Register as a New Donor — http://localhost:5173/register

**What to do:**
- Click "Register" or the "Get Started" / "Donate Blood" CTA button
- Fill in the registration form:
  - Full Name: `Test Donor`
  - Email: `test.donor@gmail.com`
  - Password: `Test@1234`
  - Blood Group: `O+`
- Submit the form
- Show the success state / redirect to login

**What to say:**
> "Any Ugandan can register as a blood donor using just their name, email, and blood group. No complicated forms — we keep the barrier to entry low. Once registered, the platform immediately begins building their donor profile."

**Why it matters for retention:**
> A simple, frictionless registration process maximises the number of people who complete sign-up rather than abandoning halfway through a complex form.

---

## Part 3 — Donor Experience

### 3.1 Log In as a Donor

**What to do:**
- Navigate to http://localhost:5173/login
- Log in with:
  - Email: `david.kizito@gmail.com`
  - Password: `Donor@UBTS123`
- Observe the smooth redirect to the donor dashboard

*David Kizito is a veteran donor with 5 donations, multiple badges, and a full medical record — perfect for a rich demo.*

---

### 3.2 Donor Dashboard — http://localhost:5173/donor-dashboard

**What to do:**
- Let the dashboard fully load
- Point to the stats cards:
  - Total Donations
  - Badges Earned
  - Assessment history
- Show the quick-action buttons
- If there is a map section, zoom around Uganda to show camp locations

**What to say:**
> "This is what David sees every time he logs in. At a glance he knows his donation history, his badges, and whether he is eligible to donate today. The dashboard puts the donor in control of their own blood donation journey."

**Why it matters for retention:**
> Donors who can see their own impact and progress feel ownership and pride in their contribution. A personal dashboard transforms blood donation from a one-time transaction into an ongoing relationship.

---

### 3.3 AI Eligibility Check — http://localhost:5173/donor-dashboard (or My Profile)

**What to do:**
- Find the "Check My Eligibility" button on the dashboard or profile page
- Click it and wait for the AI response
- Show the result: `✓ Eligible` with a list of reasons
- Explain each reason shown in the JSONB list

**What to say:**
> "This is AI Feature Number One — the Eligibility Assessment Engine. It analyses David's medical record in real time: his age is 33 (within 18–65), weight is 78 kg (above the 50 kg minimum), haemoglobin is 15.2 g/dL (well above the 13.5 threshold for males), and his last donation was over 19 months ago. The AI confirms he is fully eligible and explains every reason clearly."

**Then demonstrate an ineligible donor. Open a new browser tab and log in as:**
- Email: `grace.nakato@gmail.com`
- Password: `Donor@UBTS123`

- Run the eligibility check for Grace

**What to say:**
> "Grace Nakato is 26 years old with a haemoglobin level of only 11.5 g/dL — below the 12.5 minimum for female donors. The AI immediately flags her as ineligible and explains why. It even suggests she eat iron-rich foods and return for re-screening in 3 months. This is the AI being a personal health advisor, not just a gatekeeper."

**Why it matters for retention:**
> Before RedHope, donors would travel to a camp, queue for hours, and be turned away at the gate. That experience is deeply demotivating — many never return. By letting donors know their eligibility before arriving, we prevent wasted journeys and the disappointment that kills long-term donor relationships.

---

### 3.4 AI Availability Check

**What to do:**
- Go back to David's account
- Find and click "Check My Availability" or the availability assessment button
- Show the probability score: David should score around 0.85 (85%)
- Show the reasons list

**What to say:**
> "AI Feature Number Two — the Availability Assessment. This tells UBTS staff how likely David is to respond positively if they contact him today. He scores 85% because: he has a strong five-donation history, hasn't donated in 19 months so he's due, his haemoglobin is excellent, and he lives in Kampala near multiple active camps."

**Then show Emmanuel's low score:**
- Log in as `emmanuel.tumwesigye@gmail.com` / `Donor@UBTS123`
- Run availability check — score should be around 0.18 (18%)

**What to say:**
> "Emmanuel scores only 18% because he has a chronic condition (hypertension) and is on long-term medication. Even though he has donated three times in the past, the AI correctly flags him as unavailable right now. The system protects him from being contacted unnecessarily while also protecting UBTS from wasted outreach."

**Why it matters for retention:**
> This score directly feeds into the Campaign Targeting feature (shown in the Admin section). It ensures that when UBTS needs to contact 30 donors before a camp, they contact the 30 most likely to say yes — not a random 30. Higher response rates mean donors feel their time is respected, which increases long-term retention.

---

### 3.5 Donation History — My Profile

**What to do:**
- Log in as David Kizito (if not already)
- Navigate to donation history
- Show the chronological list of all 5 of David's donations with camp names and dates
- Click on one donation to show the detail / certificate option if available

**What to say:**
> "Every donation David has ever made is recorded here with the exact camp name and date. This is his permanent record of service to Uganda's blood supply. He can also download a donation certificate for any of these records — useful for student voluntary service hours, workplace recognition programs, and personal pride."

**Why it matters for retention:**
> Donors who can see and share evidence of their contribution are significantly more likely to continue donating. A certificate gives a blood donor something tangible to show for an act that would otherwise be invisible.

---

### 3.6 Gamification Badges

**What to do:**
- Navigate to the badges section on the donor dashboard or profile
- Show David's badges: First Drop, Life Saver, Regular Donor
- Switch to Robert Ssebagala's account (`robert.ssebagala@gmail.com` / `Donor@UBTS123`)
- Show Robert has 4 badges including the rare **Rare Blood Hero** badge (he is O- universal donor)

**What to say:**
> "This is our gamification system. Every milestone in a donor's journey is recognised with a named badge. The First Drop badge celebrates the very first donation. Life Saver is awarded at 3 donations — because one person can donate up to 3 units from a single session, helping up to 3 patients per visit. Regular Donor recognises 5 donations. And the Rare Blood Hero badge is a special award for donors with rare blood types — O-, A-, B-, or AB- — whose blood is universally compatible or in extremely short supply."

**Why it matters for retention:**
> Research in behavioural psychology shows that recognition and milestone rewards are among the most powerful drivers of repeated behaviour. A badge costs nothing but can be the reason a donor returns for a third or fourth donation instead of stopping at one.

---

### 3.7 Blood Demand Alerts — Donor View

**What to do:**
- In David's account, navigate to "Blood Alerts" in the sidebar
- Show the list of active alerts — the O- CRITICAL alert should be most prominent
- Point out the urgency level colour coding (CRITICAL = red, HIGH = orange, MEDIUM = amber, LOW = green)
- Point out the hospital name, units needed, and the message for each alert

**What to say:**
> "Blood demand alerts are visible to all donors. When Mulago Hospital runs critically short of O- blood, that alert appears here for every registered donor to see. A donor with O- blood — like Robert Ssebagala — can immediately see that their specific blood type is urgently needed and where to go."

**Why it matters for retention:**
> Making blood shortages visible to donors creates a sense of urgency and personal responsibility. It transforms donation from 'something I do when I feel like it' into 'someone needs this right now and I can help.' This is the emotional hook that motivates lapsed donors to return.

---

### 3.8 Notifications Inbox

**What to do:**
- Navigate to "Notifications" in the sidebar
- Show the list of notifications for David's account
- Point out different notification types: Badge awarded, Blood demand alert, Camp notification, Retention reminder
- Show an unread notification and mark it as read
- Show the action button that takes the donor directly to the relevant page

**What to say:**
> "Every donor has a personal notification inbox. These are not generic mass messages — each notification is targeted to this specific donor based on their blood group, location, and donation history. David gets a badge notification when he reaches a milestone, a camp notification when a drive opens near Kololo, and a blood demand alert when O+ blood is needed."

**Why it matters for retention:**
> Personalised communication is 3–4 times more effective than mass outreach. A donor who receives a message that says 'Dear David, your O+ blood is needed at a camp 2km from your home' is far more likely to act than one who receives 'Dear valued donor, please visit your nearest camp.'

---

## Part 4 — Admin Experience

### 4.1 Log In as Administrator

**What to do:**
- Open a new browser tab (or log out of the donor account)
- Navigate to http://localhost:5173/login
- Log in with:
  - Email: `admin@redhope.ug`
  - Password: `Admin@UBTS2024`
- Observe the redirect to the admin dashboard (sidebar shows admin navigation)

---

### 4.2 Admin Dashboard — http://localhost:5173/admin-dashboard

**What to do:**
- Let the dashboard load
- Walk through the top stat cards — Total Donors, Active Camps, Blood Demand Alerts
- Point to the three-tier card design: the large gradient hero card (MAIN tier), the sparkline cards (SUBMAIN tier), and the compact metric cards (NORMAL tier)

**What to say:**
> "The admin dashboard gives UBTS staff a platform-wide overview at a single glance. The card design uses a three-tier hierarchy — the most important information is in the large hero card, supporting statistics are in the sparkline cards, and compact detail metrics are in the smaller cards. This hierarchy was deliberately designed to guide the eye to the most critical information first."

---

### 4.3 Donor Management Page — http://localhost:5173/admin-donors

**What to do:**
- Click "Donor Management" in the sidebar
- Show the full list of all 15 seeded donors
- Point out columns: name, blood group, total donations, eligibility status, last donation date
- Use the search box to filter — type "robert" to find Robert Ssebagala
- Click on a donor to see their full profile details

**What to say:**
> "The Donor Management page is the master list of every registered donor on the platform. Staff can search by name, filter by blood group, and immediately see who is eligible and who has lapsed. Clicking on any donor reveals their full profile, medical record, and AI assessment history."

**Why it matters for retention:**
> Before RedHope, UBTS kept donor information in spreadsheets or paper files. Finding a specific O- donor before a surgery required manual searching through hundreds of records. This page makes that process instantaneous.

---

### 4.4 Walk-In Donor Registration — http://localhost:5173/walkin-donor

**What to do:**
- Click "Register Walk-In" in the sidebar
- **Step 1 — Personal Info:**
  - Full Name: `Amina Nakawunde`
  - Email: `amina.nakawunde@gmail.com`
  - Password: `Donor@UBTS123`
  - Phone: `0775000999`
  - Gender: `Female`
  - Date of Birth: `1998-04-15`
  - Blood Group: `B+`
  - Address: `Kampala, Kawempe Division`
  - Click "Next Step"

- **Step 2 — Medical Details:**
  - Weight: `64`
  - Haemoglobin: `13.6`
  - Last Donation Date: (leave blank — first-time donor)
  - Leave all condition checkboxes unchecked
  - Click "Next Step"

- **Step 3 — Review:**
  - Show the full summary review screen
  - Point out all the information displayed cleanly before submission
  - Click "Register Donor"

- Show the success screen
- Click "View Donor List" to confirm Amina now appears in the donor management page

**What to say:**
> "This is one of the most practically important features for UBTS — the Walk-In Donor Registration. During a donation camp, donors often arrive without a prior account. Previously, a UBTS staff member would write their details on a paper form and type them into a spreadsheet later — if at all. With RedHope, the staff member opens this page on a tablet or laptop, registers the donor in under 2 minutes through this 3-step wizard, captures their medical details on the spot, and creates them a permanent digital account. By the time they finish donating, they are already in the system and will receive future outreach."

**Why it matters for retention:**
> Walk-in donors who are not captured digitally are lost after one donation. This feature ensures that every person who donates at a camp — regardless of whether they pre-registered online — enters the retention pipeline immediately.

---

### 4.5 Personalised Campaign Targeting — http://localhost:5173/personalized-campaign

**What to do:**
- Click "Campaign Targeting" in the sidebar
- In the configuration panel, set:
  - Blood Group: `O+`
  - Search Radius: `25 km`
  - Location: Use Kampala coordinates (or current location if GPS works)
- Click "Run Campaign Scan"
- Wait for the results to load
- Show the three ranked groups: High Priority, Medium Priority, Low Priority
- Show the aggregate statistics: total matches, available donors, average availability score
- Click on a High Priority donor to see their individual score and reasons

**What to say:**
> "This is the centrepiece AI feature — Personalised Campaign Targeting. Watch what happens when I tell the system I need O+ donors within 25km of Kampala. In seconds, the AI analyses every O+ donor in the database, calculates their eligibility status, availability probability, and distance from the camp, and returns a ranked shortlist. The High Priority group are the donors most likely to say yes — contact them first. The Medium Priority group are worth contacting if you need more donors. The Low Priority group can wait for next time. This turns a manual, hours-long process into a 10-second AI task."

**Why it matters for retention:**
> Targeted outreach respects donors' time and attention. A donor who is only ever contacted when they are genuinely ready and geographically available has a much more positive experience of UBTS communication. This directly reduces opt-outs and donor fatigue, which are the leading causes of long-term donor loss.

---

### 4.6 Campaign History — http://localhost:5173/campaign-history

**What to do:**
- Click "Campaign History" in the sidebar
- Show the list of 3 past campaign scans from the seed data
- Click on the "Kampala O+ Emergency Drive" to see its detail
- Show the campaign responses — 3 donors donated, 1 responded, 2 still pending, 1 not interested
- Show how to update a donor's response status

**What to say:**
> "Every campaign scan is saved as a permanent record. After a campaign, UBTS staff can come back here and record what actually happened — who donated, who responded but couldn't make it, who was not interested. Over time, this builds a dataset of donor responsiveness that the AI can use to improve its predictions."

**Why it matters for retention:**
> Campaign history creates accountability and enables continuous improvement. Staff can see which outreach approaches worked, which blood groups are hardest to recruit for, and which geographic areas are underserved — and adjust strategy accordingly.

---

### 4.7 Manage Donation Camps — http://localhost:5173/admin-camps

**What to do:**
- Click "Manage Camps" in the sidebar
- Show the list of 8 seeded camps with their status badges (ACTIVE / COMPLETED / INACTIVE)
- Click "Add Camp" button — a **modal popup** appears (not an inline form)
- Fill in a test camp:
  - Name: `Nakivubo Stadium Drive`
  - Venue: `Nakivubo Stadium, Kampala`
  - Region: `Central`
  - District: `Kampala`
  - Start Date: `2026-07-01`
  - End Date: `2026-09-30`
  - Status: `ACTIVE`
- Submit the form — the modal closes and the new camp appears in the list
- Then click the edit button on any existing camp to show the edit modal

**What to say:**
> "The Camp Management page allows UBTS staff to manage their entire network of donation drives across Uganda. Each camp has geographic coordinates so it appears on the map and can be used as a reference point for the campaign targeting AI. Notice the form appears as a popup modal — staff can add or edit camps without leaving the page or losing their scroll position."

**Why it matters for retention:**
> Camps that are not in the system cannot be used in AI targeting or shown to donors on the map. Keeping camp data current and accurate is what makes the geographic features of the platform work correctly.

---

### 4.8 Blood Demand Alerts — Admin View — http://localhost:5173/admin-blood-demand

**What to do:**
- Click "Blood Demand" in the sidebar
- Show the existing 6 alerts with urgency level colour coding
- Click "Create Alert" and fill in:
  - Blood Group: `AB-`
  - Title: `Urgent AB- Needed — Butabika Hospital`
  - Message: `Butabika National Referral Hospital urgently requires AB- blood for psychiatric surgical patients. Only 2 units remain in stock.`
  - Urgency Level: `CRITICAL`
  - Units Needed: `6`
  - Hospital: `Butabika National Referral Hospital`
- Submit the alert
- Show it appearing at the top of the list with the CRITICAL badge
- Then resolve the old "B+ Mbale" alert by clicking "Resolve" on it

**What to say:**
> "When any hospital in Uganda contacts UBTS about a blood shortage, an administrator can publish that alert here within 30 seconds. The alert immediately becomes visible to all donors with matching blood groups in their notification inbox and on the Blood Alerts page. This creates a direct, fast channel from hospital emergency to donor action — something that was previously impossible without individual phone calls."

**Why it matters for retention:**
> Donors who successfully respond to a blood demand alert and know their donation directly saved a specific patient have the most powerful retention motivation possible. This feature creates those moments of direct impact.

---

### 4.9 SMS Management — http://localhost:5173/admin-sms

**What to do:**
- Click "SMS Management" in the sidebar
- Show the tier cards: SMS Status toggle, Total Sent, Failed count, Skipped count
- Show the SMS log table below — 15 entries with donor names, messages, status badges
- Click the toggle on the SMS Status card to enable SMS (then disable it again)
- Point out the SENT / FAILED / SKIPPED colour coding

**What to say:**
> "The SMS Management page gives staff full visibility into every SMS ever sent by the platform. The toggle allows SMS to be enabled or disabled platform-wide — useful for testing or when Twilio credits need renewal. The log shows each message, who it was sent to, whether it was delivered, and the exact content. A SKIPPED status means SMS was disabled at the time — the message was not lost, it was not attempted."

**Why it matters for retention:**
> SMS is the primary outreach channel in Uganda, where smartphone penetration is lower than in developed countries. Monitoring delivery rates and failure reasons lets UBTS diagnose communication problems before they affect a full campaign.

---

### 4.10 WhatsApp Management — http://localhost:5173/admin-whatsapp

**What to do:**
- Click "WhatsApp" in the sidebar
- Show the WhatsApp log — 6 entries with delivery status
- Point out that WhatsApp outreach only goes to donors who gave consent (`whatsapp_consent = TRUE`)

**What to say:**
> "WhatsApp is increasingly the preferred communication channel for younger Ugandan donors. The platform supports WhatsApp Business API outreach as a secondary channel alongside SMS. Critically, we only contact donors via WhatsApp if they explicitly gave consent when registering — this is both ethically required and legally compliant with Uganda's data protection guidelines."

**Why it matters for retention:**
> Donors who are contacted on their preferred channel are more likely to respond positively. Consent-based WhatsApp outreach also builds trust — donors know they control how UBTS communicates with them.

---

## Part 5 — UI/UX Highlights

### 5.1 Dark Mode

**What to do:**
- While on any page (dashboard or public site), find the dark mode toggle (sun/moon icon in the header)
- Click it and watch the entire UI transition to dark mode
- Navigate to several different pages to show dark mode is consistent everywhere
- Toggle back to light mode

**What to say:**
> "The platform fully supports dark mode — and it persists across sessions, stored in the browser so a donor who prefers dark mode sees it every time they log in. This matters particularly for mobile users who use their devices at night and for accessibility — reduced eye strain makes the platform more comfortable for regular use."

---

### 5.2 Responsive Sidebar Navigation

**What to do:**
- In the admin dashboard, resize the browser window to mobile size (or use browser dev tools to simulate a phone)
- Show how the sidebar collapses and a hamburger menu appears
- Click the hamburger to open the sidebar, then click a link to navigate and watch the sidebar close

**What to say:**
> "UBTS staff use the platform in the field during donation camps — often on a tablet or even a phone. The responsive sidebar ensures the full admin interface is usable on any screen size without losing functionality."

---

### 5.3 Three-Tier Card Design System

**What to do:**
- Navigate between Admin Dashboard, Donor Management, Camp Management, Blood Demand, and SMS pages
- Point out:
  - **MAIN tier cards** — large, gradient, used for the most important single metric
  - **SUBMAIN tier cards** — white (or dark) with an accent colour bar, sparkline graph, used for key supporting stats
  - **NORMAL tier cards** — compact, minimal, used for secondary metrics

**What to say:**
> "Every admin page uses the same three-tier card design system. This visual consistency means that staff who learn one page immediately understand all pages. The sparkline graphs on SUBMAIN cards give trend context at a glance — not just the current number but whether it is going up or down over time."

---

## Part 6 — Showing the AI in Context

### 6.1 The Full Donor Retention Cycle (Live Story)

Tell this story during your demo using real accounts:

> "Let me show you the full lifecycle of a blood donor in RedHope.
>
> **Acquire:** Amina walks into the Kampala Central Blood Drive today. A UBTS staff member opens the Walk-In Registration page and registers her in 90 seconds on a laptop. Her account is created, her blood group is recorded, and her medical details are captured on the spot.
>
> **Assess:** Three days later, the AI runs an eligibility check on Amina's profile. She is 28 years old, 64 kg, haemoglobin 13.6 — fully eligible. Her availability score is 0.72 — she is a new donor, so her history is short, but her profile shows potential.
>
> **Engage:** Two weeks before the next Kampala camp, an UBTS administrator runs a Campaign Targeting scan for B+ donors within 25km of Kampala. Amina appears in the Medium Priority group. The administrator sends her an SMS: 'Dear Amina, a blood donation camp is running near Kawempe this Saturday. Your B+ blood is needed.' Amina sees the message and confirms attendance.
>
> **Recognise:** Amina donates. Her donation is recorded in the system. That evening, her dashboard shows the First Drop badge — 'Welcome to the family!' She receives a notification with the badge and a certificate she can download and share.
>
> **Re-Activate:** Six months later, Amina has not been back. The system flags her as a lapsed donor. An automated retention reminder is sent: 'Hi Amina! It has been 6 months since your last donation. You are eligible again — come back and earn your Life Saver badge!'
>
> **Amina returns.** This cycle is what RedHope automates — and what manual UBTS operations could never sustain at scale."

---

## Part 7 — Common Questions from Panels

**Q: How is this different from a spreadsheet?**
> A spreadsheet cannot run AI assessments, cannot calculate geospatial distances, cannot automatically rank donors by probability, cannot send SMS, cannot award badges, cannot detect lapsed donors, and cannot give donors a self-service portal. RedHope does all of these simultaneously, automatically, and at scale.

**Q: What happens if the AI makes a wrong eligibility prediction?**
> The AI uses well-established medical thresholds from WHO and Uganda Ministry of Health guidelines. It never overrides clinical judgment — it provides information. The final decision to accept or defer a donor at the camp gate remains with trained UBTS medical staff. The AI reduces unnecessary journeys; it does not replace the clinician.

**Q: How is donor data protected?**
> All API endpoints require JWT authentication. Donor data is only visible to the donor themselves and to UBTS administrators. No donor can see another donor's data. Passwords are hashed using Django's PBKDF2 algorithm. WhatsApp outreach only goes to donors who explicitly consented.

**Q: What if a donor does not have a smartphone?**
> The primary outreach channel is standard SMS — accessible on any mobile phone including basic handsets. The platform also supports walk-in registration by UBTS staff, so a donor does not need to self-register online.

**Q: How does the availability score work?**
> It is a weighted composite score considering: donation history frequency (30%), time since last donation (25%), eligibility status (20%), blood group rarity (15%), and geographic proximity to active camps (10%). The weights were determined empirically based on consultation with UBTS staff about which factors most predict successful outreach.

**Q: Can this scale to 500,000 donors?**
> The architecture is designed for scale: PostgreSQL handles millions of rows efficiently, the Django REST API is stateless (can be load-balanced), and the AI campaign scan uses database-level queries with geospatial filtering before applying ML scoring — so it does not load all donors into memory.

---

## Credentials Quick Reference

| Who | Email | Password |
|-----|-------|----------|
| Administrator | admin@redhope.ug | Admin@UBTS2024 |
| David Kizito (O+, 5 donations, veteran) | david.kizito@gmail.com | Donor@UBTS123 |
| Robert Ssebagala (O-, 6 donations, Rare Blood Hero) | robert.ssebagala@gmail.com | Donor@UBTS123 |
| Grace Nakato (ineligible — low haemoglobin) | grace.nakato@gmail.com | Donor@UBTS123 |
| Emmanuel Tumwesigye (deferred — chronic condition) | emmanuel.tumwesigye@gmail.com | Donor@UBTS123 |
| Flavia Namukasa (A-, rare blood type) | flavia.namukasa@gmail.com | Donor@UBTS123 |
| Rose Akello (new — zero donations) | rose.akello@gmail.com | Donor@UBTS123 |

---

## Suggested Presentation Order (30 minutes)

| Time | Section | Key Point |
|------|---------|-----------|
| 0:00–3:00 | Public website (Home + Process) | First impressions, donor onboarding |
| 3:00–5:00 | Reddy Chatbot | AI assistant, 24/7 availability |
| 5:00–7:00 | Donor Registration + Login | Low-friction acquisition |
| 7:00–10:00 | Donor Dashboard + Eligibility AI | AI Feature 1 — medical intelligence |
| 10:00–13:00 | Availability AI (David vs Emmanuel) | AI Feature 2 — outreach intelligence |
| 13:00–15:00 | Badges + Donation History | Gamification and recognition |
| 15:00–17:00 | Blood Demand Alerts (donor view) | Urgency and emotional connection |
| 17:00–19:00 | Admin Dashboard + Donor Management | Management overview |
| 19:00–22:00 | Campaign Targeting AI | AI Feature 3 — core innovation |
| 22:00–24:00 | Walk-In Registration | Camp-day practical feature |
| 24:00–26:00 | Manage Camps + Blood Alerts (admin) | Operational management |
| 26:00–28:00 | SMS + WhatsApp Management | Multi-channel outreach |
| 28:00–30:00 | Dark mode + Q&A | Polish, then open floor |

---

*Good luck with your presentation. You have built something genuinely useful for Uganda.*
