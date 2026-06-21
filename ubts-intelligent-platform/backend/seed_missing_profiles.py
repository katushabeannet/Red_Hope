"""
RedHope / UBTS Platform — Fix Missing Seeded Donor Data
Run with:  python manage.py shell < seed_missing_profiles.py

Creates donor profiles, medical records, donation records, badges,
eligibility assessments, availability assessments, and campaign responses
for the 15 seeded users. Idempotent — safe to re-run.
"""
from datetime import date, datetime, timezone
from django.db import transaction
from accounts.models import User
from donors.models import (
    DonorProfile, DonorMedicalRecord, DonationRecord,
    DonorBadge, EligibilityAssessment, AvailabilityAssessment,
)
from campaigns.models import CampaignPerformance, CampaignResponse
from notifications.models import Notification

def get_user(email):
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        print(f"  WARN: User {email} not found — skipping")
        return None


with transaction.atomic():
    admin_user = get_user("admin@redhope.ug")

    # ─── §2  DONOR PROFILES ────────────────────────────────────────────────────
    print("\n→ Creating donor profiles...")
    PROFILES = [
        ("david.kizito@gmail.com",        "0772100001", "O+",  date(1992, 3, 15),  "Male",   "Kololo, Kampala",          5,  0.3136, 32.5811, "0772100001", True),
        ("mary.nakazibwe@gmail.com",      "0782200002", "A+",  date(1995, 7, 22),  "Female", "Gayaza Road, Wakiso",      4,  0.4019, 32.4591, "0782200002", True),
        ("james.ssemakula@gmail.com",     "0755300003", "B+",  date(1988, 11, 8),  "Male",   "Mukono Town Centre",       3,  0.3530, 32.7551, "",           False),
        ("grace.nakato@gmail.com",        "0776400004", "AB+", date(2000, 1, 30),  "Female", "Jinja Central Division",   0,  0.4478, 33.2026, "0776400004", True),
        ("robert.ssebagala@gmail.com",    "0752500005", "O-",  date(1985, 6, 12),  "Male",   "Mbarara City Centre",      6, -0.6058, 30.6580, "",           False),
        ("flavia.namukasa@gmail.com",     "0703600006", "A-",  date(1997, 9, 25),  "Female", "Entebbe Municipality",     3,  0.0614, 32.4644, "0703600006", True),
        ("patrick.okwir@gmail.com",       "0785700007", "B-",  date(1990, 4, 18),  "Male",   "Gulu City Centre",         4,  2.7858, 32.2998, "",           False),
        ("sarah.akello@gmail.com",        "0779800008", "O+",  date(1993, 12, 5),  "Female", "Lira Municipality",        2,  2.2499, 32.8998, "0779800008", True),
        ("moses.ssempijja@gmail.com",     "0756900009", "A+",  date(1987, 8, 14),  "Male",   "Mbale City",               5,  1.0760, 34.1750, "",           False),
        ("diana.nabirye@gmail.com",       "0771010010", "B+",  date(1999, 3, 28),  "Female", "Masaka Municipality",      1, -0.3404, 31.7379, "0771010010", True),
        ("emmanuel.tumwesigye@gmail.com", "0753110011", "AB-", date(1991, 7, 7),   "Male",   "Kabale Municipality",      3, -1.2497, 29.9874, "",           False),
        ("irene.nakiganda@gmail.com",     "0782210012", "O+",  date(1994, 11, 19), "Female", "Jinja Masese Division",    2,  0.4398, 33.2100, "0782210012", True),
        ("ivan.mutebi@gmail.com",         "0775310013", "A+",  date(1996, 5, 3),   "Male",   "Nakawa Division, Kampala", 4,  0.3244, 32.6142, "",           False),
        ("rose.akello@gmail.com",         "0703410014", "B+",  date(2001, 2, 14),  "Female", "Arua City",                0,  3.0196, 30.9107, "0703410014", True),
        ("peter.kyambadde@gmail.com",     "0784510015", "O+",  date(1983, 10, 22), "Male",   "Tororo Municipality",      5,  0.6924, 34.1835, "",           False),
    ]

    profile_map = {}
    p_created = p_skipped = 0
    for email, phone, blood, dob, gender, address, donations, lat, lng, wa, wa_consent in PROFILES:
        user = get_user(email)
        if not user:
            continue
        profile, created = DonorProfile.objects.get_or_create(
            user=user,
            defaults=dict(
                phone_number=phone, blood_group=blood, date_of_birth=dob,
                gender=gender, address=address, total_donations=donations,
                latitude=lat, longitude=lng,
                whatsapp_number=wa, whatsapp_consent=wa_consent,
            ),
        )
        profile_map[email] = profile
        if created:
            p_created += 1
        else:
            p_skipped += 1
    print(f"  Profiles: created={p_created}, skipped={p_skipped}")


    # ─── §3  MEDICAL RECORDS ───────────────────────────────────────────────────
    print("→ Creating medical records...")
    MEDICAL = [
        ("david.kizito@gmail.com",          78.0, 15.2, False, False, date(2024, 10, 15), False, False),
        ("mary.nakazibwe@gmail.com",        62.0, 13.8, False, False, date(2025, 1,  20), False, False),
        ("james.ssemakula@gmail.com",       70.0, 14.1, False, False, date(2024, 11, 30), False, False),
        ("grace.nakato@gmail.com",          55.0, 11.5, False, False, None,               False, False),
        ("robert.ssebagala@gmail.com",      85.0, 16.0, False, False, date(2024, 9,  5),  False, False),
        ("flavia.namukasa@gmail.com",       58.0, 13.0, False, False, date(2025, 2,  15), False, False),
        ("patrick.okwir@gmail.com",         72.0, 14.5, False, False, date(2024, 10, 20), False, False),
        ("sarah.akello@gmail.com",          54.0, 12.8, False, False, date(2025, 3,  1),  False, False),
        ("moses.ssempijja@gmail.com",       80.0, 15.5, False, False, date(2024, 8,  15), False, False),
        ("diana.nabirye@gmail.com",         61.0, 13.4, False, False, date(2024, 9,  14), False, False),
        ("emmanuel.tumwesigye@gmail.com",   65.0, 13.0, False, True,  date(2024, 12, 10), False, True),
        ("irene.nakiganda@gmail.com",       60.0, 13.2, False, False, date(2024, 11, 5),  False, False),
        ("ivan.mutebi@gmail.com",           75.0, 15.8, False, False, date(2024, 9,  20), False, False),
        ("peter.kyambadde@gmail.com",       82.0, 14.8, False, False, date(2024, 8,  1),  False, False),
    ]

    m_created = m_skipped = 0
    for email, wt, hgb, ill, chronic, last_don, preg, meds in MEDICAL:
        profile = profile_map.get(email)
        if not profile:
            continue
        _, created = DonorMedicalRecord.objects.get_or_create(
            donor=profile,
            defaults=dict(
                weight_kg=wt, hemoglobin_level=hgb,
                has_recent_illness=ill, has_chronic_condition=chronic,
                last_donation_date=last_don, is_pregnant=preg, is_on_medication=meds,
            ),
        )
        if created:
            m_created += 1
        else:
            m_skipped += 1
    print(f"  Medical records: created={m_created}, skipped={m_skipped}")


    # ─── §4  DONATION RECORDS ─────────────────────────────────────────────────
    print("→ Creating donation records...")
    DONATIONS = [
        # David Kizito (5)
        ("david.kizito@gmail.com", date(2020, 4,  10), "Jinja Source of the Nile Drive",  "Routine donation — healthy and well"),
        ("david.kizito@gmail.com", date(2021, 7,  15), "Kampala Central Blood Drive",     "Proactive walk-in donor"),
        ("david.kizito@gmail.com", date(2022, 9,  20), "Mulago Hospital Drive",           "Referred by colleague"),
        ("david.kizito@gmail.com", date(2023, 11, 8),  "Kampala Central Blood Drive",     "Regular scheduled donation"),
        ("david.kizito@gmail.com", date(2024, 10, 15), "Kampala Central Blood Drive",     "Annual camp donation"),
        # Mary Nakazibwe (4)
        ("mary.nakazibwe@gmail.com", date(2021, 6,  12), "Kampala Central Blood Drive",  "First time — encouraged by friend"),
        ("mary.nakazibwe@gmail.com", date(2022, 3,  18), "Entebbe Lakeside Drive",       "Consistent repeat donor"),
        ("mary.nakazibwe@gmail.com", date(2023, 5,  22), "Mulago Hospital Drive",        "Volunteered at hospital camp"),
        ("mary.nakazibwe@gmail.com", date(2025, 1,  20), "Entebbe Lakeside Drive",       "New year donation"),
        # James Ssemakula (3)
        ("james.ssemakula@gmail.com", date(2022, 8,  14), "Mulago Hospital Drive",       "Walk-in donor"),
        ("james.ssemakula@gmail.com", date(2023, 9,  25), "Kampala Central Blood Drive", "SMS campaign response"),
        ("james.ssemakula@gmail.com", date(2024, 11, 30), "Kampala Central Blood Drive", "Regular annual donation"),
        # Robert Ssebagala (6)
        ("robert.ssebagala@gmail.com", date(2019, 11, 20), "Mbarara Regional Drive",     "O- universal donor, priority recruit"),
        ("robert.ssebagala@gmail.com", date(2020, 8,  15), "Mbarara Regional Drive",     "Emergency appeal response"),
        ("robert.ssebagala@gmail.com", date(2021, 6,  10), "Mbarara Regional Drive",     "Regular semi-annual donation"),
        ("robert.ssebagala@gmail.com", date(2022, 4,  5),  "Gulu Northern Drive",        "Travelled to Gulu for regional drive"),
        ("robert.ssebagala@gmail.com", date(2023, 2,  18), "Mbarara Regional Drive",     "Local camp walk-in"),
        ("robert.ssebagala@gmail.com", date(2024, 9,  5),  "Mbarara Regional Drive",     "Semi-annual scheduled donation"),
        # Flavia Namukasa (3)
        ("flavia.namukasa@gmail.com", date(2021, 5,  22), "Entebbe Lakeside Drive",      "Workplace outreach participant"),
        ("flavia.namukasa@gmail.com", date(2022, 11, 8),  "Kampala Central Blood Drive", "WhatsApp campaign response"),
        ("flavia.namukasa@gmail.com", date(2025, 2,  15), "Entebbe Lakeside Drive",      "Annual community drive"),
        # Patrick Okwir (4)
        ("patrick.okwir@gmail.com", date(2020, 7,  14), "Gulu Northern Drive",           "Community sensitisation donor"),
        ("patrick.okwir@gmail.com", date(2021, 10, 22), "Gulu Northern Drive",           "Repeat donor — reliable"),
        ("patrick.okwir@gmail.com", date(2022, 8,  30), "Gulu Northern Drive",           "Brought two friends along"),
        ("patrick.okwir@gmail.com", date(2024, 10, 20), "Gulu Northern Drive",           "Annual camp participant"),
        # Sarah Akello (2)
        ("sarah.akello@gmail.com", date(2023, 9,  12), "Gulu Northern Drive",            "First donation — motivated by family"),
        ("sarah.akello@gmail.com", date(2025, 3,  1),  "Gulu Northern Drive",            "Returned after 18-month gap"),
        # Moses Ssempijja (5)
        ("moses.ssempijja@gmail.com", date(2019, 3,  20), "Mbale Mt. Elgon Drive",      "First-time donor at regional camp"),
        ("moses.ssempijja@gmail.com", date(2020, 5,  18), "Mbale Mt. Elgon Drive",      "Consistent repeat — no adverse effects"),
        ("moses.ssempijja@gmail.com", date(2021, 8,  14), "Mbale Mt. Elgon Drive",      "Invited colleagues this time"),
        ("moses.ssempijja@gmail.com", date(2022, 10, 22), "Jinja Source of the Nile Drive", "Donated at Jinja while on travel"),
        ("moses.ssempijja@gmail.com", date(2024, 8,  15), "Mbale Mt. Elgon Drive",      "Back to home camp after Jinja visit"),
        # Diana Nabirye (1)
        ("diana.nabirye@gmail.com", date(2024, 9,  14), "Kampala Central Blood Drive",   "First donation — campus awareness event"),
        # Emmanuel Tumwesigye (3)
        ("emmanuel.tumwesigye@gmail.com", date(2020, 2,  14), "Mbarara Regional Drive",  "Pre-diagnosis donation — healthy at time"),
        ("emmanuel.tumwesigye@gmail.com", date(2021, 9,  18), "Kampala Central Blood Drive", "Follow-up after medical clearance"),
        ("emmanuel.tumwesigye@gmail.com", date(2024, 12, 10), "Kampala Central Blood Drive", "Cleared by doctor for single donation"),
        # Irene Nakiganda (2)
        ("irene.nakiganda@gmail.com", date(2022, 7,  22), "Jinja Source of the Nile Drive", "Donor awareness rally participant"),
        ("irene.nakiganda@gmail.com", date(2024, 11, 5),  "Kampala Central Blood Drive",    "Returned after 2-year gap"),
        # Ivan Mutebi (4)
        ("ivan.mutebi@gmail.com", date(2020, 11, 15), "Kampala Central Blood Drive",     "University blood drive"),
        ("ivan.mutebi@gmail.com", date(2021, 12, 8),  "Mulago Hospital Drive",           "Emergency hospital appeal"),
        ("ivan.mutebi@gmail.com", date(2022, 10, 14), "Kampala Central Blood Drive",     "Regular annual camp"),
        ("ivan.mutebi@gmail.com", date(2024, 9,  20), "Mulago Hospital Drive",           "Hospital walk-in donation"),
        # Peter Kyambadde (5)
        ("peter.kyambadde@gmail.com", date(2018, 6,  20), "Mbale Mt. Elgon Drive",      "Long-standing community donor"),
        ("peter.kyambadde@gmail.com", date(2019, 8,  14), "Jinja Source of the Nile Drive", "Travelled to Jinja drive"),
        ("peter.kyambadde@gmail.com", date(2021, 5,  18), "Kampala Central Blood Drive", "Central camp visit during business trip"),
        ("peter.kyambadde@gmail.com", date(2023, 3,  12), "Mulago Hospital Drive",       "Hospital donation — responding to alert"),
        ("peter.kyambadde@gmail.com", date(2024, 8,  1),  "Kampala Central Blood Drive", "Annual community camp"),
    ]

    d_created = 0
    for email, don_date, camp_name, notes in DONATIONS:
        profile = profile_map.get(email)
        if not profile:
            continue
        exists = DonationRecord.objects.filter(
            donor=profile, donation_date=don_date, camp_name=camp_name
        ).exists()
        if not exists:
            DonationRecord.objects.create(
                donor=profile, donation_date=don_date, camp_name=camp_name, notes=notes,
            )
            d_created += 1
    print(f"  Donation records: created={d_created}")


    # ─── §5  DONOR BADGES ──────────────────────────────────────────────────────
    print("→ Creating donor badges...")
    BADGES = [
        ("david.kizito@gmail.com",     "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("david.kizito@gmail.com",     "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("david.kizito@gmail.com",     "Regular Donor",   "Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme."),
        ("robert.ssebagala@gmail.com", "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("robert.ssebagala@gmail.com", "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("robert.ssebagala@gmail.com", "Regular Donor",   "Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme."),
        ("robert.ssebagala@gmail.com", "Rare Blood Hero", "Your O- universal donor blood is precious — it can save any patient, regardless of blood type."),
        ("flavia.namukasa@gmail.com",  "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("flavia.namukasa@gmail.com",  "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("flavia.namukasa@gmail.com",  "Rare Blood Hero", "Your A- blood type is rare in Uganda — your donations are especially valuable to patients."),
        ("patrick.okwir@gmail.com",    "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("patrick.okwir@gmail.com",    "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("patrick.okwir@gmail.com",    "Rare Blood Hero", "B- is one of the rarest blood types in Uganda — thank you for stepping up."),
        ("moses.ssempijja@gmail.com",  "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("moses.ssempijja@gmail.com",  "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("moses.ssempijja@gmail.com",  "Regular Donor",   "Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme."),
        ("peter.kyambadde@gmail.com",  "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("peter.kyambadde@gmail.com",  "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("peter.kyambadde@gmail.com",  "Regular Donor",   "Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme."),
        ("ivan.mutebi@gmail.com",      "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("ivan.mutebi@gmail.com",      "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("mary.nakazibwe@gmail.com",   "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("mary.nakazibwe@gmail.com",   "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("james.ssemakula@gmail.com",  "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("james.ssemakula@gmail.com",  "Life Saver",      "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("emmanuel.tumwesigye@gmail.com", "First Drop",   "Completed your very first blood donation — welcome to the family!"),
        ("emmanuel.tumwesigye@gmail.com", "Life Saver",   "Donated blood 3 times — your generosity has helped save up to 9 lives."),
        ("irene.nakiganda@gmail.com",  "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("sarah.akello@gmail.com",     "First Drop",      "Completed your very first blood donation — welcome to the family!"),
        ("diana.nabirye@gmail.com",    "First Drop",      "Completed your very first blood donation — welcome to the family!"),
    ]

    b_created = b_skipped = 0
    for email, badge_name, badge_desc in BADGES:
        profile = profile_map.get(email)
        if not profile:
            continue
        exists = DonorBadge.objects.filter(donor=profile, badge_name=badge_name).exists()
        if not exists:
            DonorBadge.objects.create(donor=profile, badge_name=badge_name, badge_description=badge_desc)
            b_created += 1
        else:
            b_skipped += 1
    print(f"  Badges: created={b_created}, skipped={b_skipped}")


    # ─── §6  ELIGIBILITY ASSESSMENTS ──────────────────────────────────────────
    print("→ Creating eligibility assessments...")
    ELIGIBILITY = [
        ("david.kizito@gmail.com", True, 33,
         ["Age is within the required 18–65 range", "Weight 78 kg meets the 50 kg minimum",
          "Haemoglobin 15.2 g/dL is adequate for male donors (≥13.5)", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-10-15)"],
         "Donor is fully eligible to donate blood. All criteria met without exception."),
        ("mary.nakazibwe@gmail.com", True, 30,
         ["Age is within the required 18–65 range", "Weight 62 kg meets the 50 kg minimum",
          "Haemoglobin 13.8 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported",
          "Last donation was over 90 days ago (2025-01-20)"],
         "Donor is fully eligible to donate blood. All health and time criteria are satisfied."),
        ("james.ssemakula@gmail.com", True, 37,
         ["Age is within the required 18–65 range", "Weight 70 kg meets the 50 kg minimum",
          "Haemoglobin 14.1 g/dL is adequate for male donors (≥13.5)", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-11-30)"],
         "Donor is fully eligible. All screening criteria passed successfully."),
        ("grace.nakato@gmail.com", False, 26,
         ["Haemoglobin level 11.5 g/dL is below the minimum threshold of 12.5 g/dL for female donors"],
         "Donor is currently not eligible due to low haemoglobin. Recommend dietary iron supplementation and re-screening in 3 months."),
        ("robert.ssebagala@gmail.com", True, 40,
         ["Age is within the required 18–65 range", "Weight 85 kg meets the 50 kg minimum",
          "Haemoglobin 16.0 g/dL is excellent for male donors", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-09-05)", "O- universal donor — high clinical value"],
         "Donor is fully eligible and is a highly valuable O- universal donor. Priority recruitment recommended."),
        ("flavia.namukasa@gmail.com", True, 28,
         ["Age is within the required 18–65 range", "Weight 58 kg meets the 50 kg minimum",
          "Haemoglobin 13.0 g/dL meets the threshold for female donors (≥12.5)", "No chronic conditions reported",
          "Last donation was over 90 days ago (2025-02-15)"],
         "Donor is eligible to donate. A- is a rare blood type — active outreach recommended."),
        ("patrick.okwir@gmail.com", True, 35,
         ["Age is within the required 18–65 range", "Weight 72 kg meets the 50 kg minimum",
          "Haemoglobin 14.5 g/dL is adequate for male donors", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-10-20)", "B- is a rare blood type in Uganda"],
         "Donor is eligible and is a rare B- type. Prioritise for upcoming drive outreach."),
        ("sarah.akello@gmail.com", True, 32,
         ["Age is within the required 18–65 range", "Weight 54 kg meets the 50 kg minimum",
          "Haemoglobin 12.8 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported",
          "Last donation was over 90 days ago (2025-03-01)"],
         "Donor is eligible. Borderline haemoglobin — encourage iron-rich diet before next donation."),
        ("moses.ssempijja@gmail.com", True, 38,
         ["Age is within the required 18–65 range", "Weight 80 kg meets the 50 kg minimum",
          "Haemoglobin 15.5 g/dL is excellent for male donors", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-08-15)"],
         "Donor is fully eligible. Strong donation history and excellent health profile."),
        ("diana.nabirye@gmail.com", True, 27,
         ["Age is within the required 18–65 range", "Weight 61 kg meets the 50 kg minimum",
          "Haemoglobin 13.4 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-09-14)"],
         "Donor is eligible. Good health indicators — encourage more frequent participation."),
        ("emmanuel.tumwesigye@gmail.com", False, 34,
         ["Chronic health condition (hypertension) reported",
          "Currently on long-term medication — increases deferral risk",
          "Haemoglobin 13.0 g/dL is near the lower limit for male donors"],
         "Donor is currently deferred due to chronic condition and ongoing medication. Medical clearance required before next donation."),
        ("irene.nakiganda@gmail.com", True, 31,
         ["Age is within the required 18–65 range", "Weight 60 kg meets the 50 kg minimum",
          "Haemoglobin 13.2 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-11-05)"],
         "Donor is eligible. Consistent donation history — send retention reminder for next drive."),
        ("ivan.mutebi@gmail.com", True, 30,
         ["Age is within the required 18–65 range", "Weight 75 kg meets the 50 kg minimum",
          "Haemoglobin 15.8 g/dL is excellent for male donors", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-09-20)"],
         "Donor is fully eligible. Very strong haemoglobin levels — ideal candidate for upcoming campaign."),
        ("peter.kyambadde@gmail.com", True, 42,
         ["Age is within the required 18–65 range", "Weight 82 kg meets the 50 kg minimum",
          "Haemoglobin 14.8 g/dL is adequate for male donors", "No chronic conditions reported",
          "Last donation was over 90 days ago (2024-08-01)"],
         "Veteran donor — fully eligible. Donation history of 5+ records signals reliable participation."),
    ]

    e_created = e_skipped = 0
    for email, is_eligible, age, reasons, summary in ELIGIBILITY:
        profile = profile_map.get(email)
        if not profile:
            continue
        exists = EligibilityAssessment.objects.filter(donor=profile).exists()
        if not exists:
            EligibilityAssessment.objects.create(
                donor=profile, is_eligible=is_eligible, age=age,
                reasons=reasons, summary=summary,
            )
            e_created += 1
        else:
            e_skipped += 1
    print(f"  Eligibility assessments: created={e_created}, skipped={e_skipped}")


    # ─── §7  AVAILABILITY ASSESSMENTS ─────────────────────────────────────────
    print("→ Creating availability assessments...")
    AVAILABILITY = [
        ("david.kizito@gmail.com", True, 0.85,
         ["Strong multi-year donation history (5 records) signals high commitment",
          "Last donation 2024-10-15 — over 19 months ago, well within donation window",
          "No health barriers identified", "Active in Kampala — near multiple camps"],
         "High availability. Donor has a consistent pattern and is physically ready. Priority contact for next drive."),
        ("mary.nakazibwe@gmail.com", True, 0.78,
         ["Regular donor with 4 recorded donations — shows sustained intent",
          "Last donation 2025-01-20 — 17 months ago",
          "Haemoglobin and weight are satisfactory",
          "WhatsApp consent granted — preferred contact channel"],
         "Good availability. SMS/WhatsApp outreach likely to convert. Schedule for Entebbe drive."),
        ("james.ssemakula@gmail.com", True, 0.72,
         ["3 donations across 3 years — moderate commitment level",
          "Last donation 2024-11-30 — 19 months ago", "No health barriers",
          "Mukono location — consider for nearby Kampala or Jinja camps"],
         "Moderate-to-good availability. Contact via SMS — no WhatsApp consent on file."),
        ("grace.nakato@gmail.com", False, 0.22,
         ["No donation history — intent and tolerance unknown",
          "Haemoglobin 11.5 g/dL below minimum threshold — medically not currently suitable",
          "Age 26 with good weight — potential future donor after health improvement"],
         "Not available due to low haemoglobin. Follow up with nutritional advice and schedule re-assessment in 12 weeks."),
        ("robert.ssebagala@gmail.com", True, 0.92,
         ["6 donations — one of the most active donors on the platform",
          "Last donation 2024-09-05 — over 21 months ago",
          "O- universal donor — extremely high clinical priority",
          "Strong health profile: 85 kg, haemoglobin 16.0 g/dL",
          "Mbarara-based — target for western regional drives"],
         "Exceptional availability. O- universal donor with outstanding history. Highest-priority contact for any urgent blood demand."),
        ("flavia.namukasa@gmail.com", True, 0.70,
         ["3 donations over 4 years — moderate frequency",
          "Last donation 2025-02-15 — 16 months ago",
          "A- rare blood type — high recipient value",
          "WhatsApp consent — preferred outreach channel"],
         "Good availability. Rare A- donor — prioritise WhatsApp outreach for next Entebbe drive."),
        ("patrick.okwir@gmail.com", True, 0.80,
         ["4 donations at Gulu camp — very loyal local donor",
          "Last donation 2024-10-20 — 20 months ago",
          "B- is rare — strong clinical value per donation",
          "Gulu-based — ideal candidate for Northern drive outreach"],
         "High availability. Consistent Gulu-based donor with rare B- blood. Prioritise for next Northern drive."),
        ("sarah.akello@gmail.com", True, 0.65,
         ["2 donations, 18-month gap between them — sporadic but returning",
          "Last donation 2025-03-01 — 15 months ago",
          "Haemoglobin borderline but adequate",
          "Lira-based — Northern region outreach candidate"],
         "Moderate availability. Donor returns after long gaps — SMS reminder 4 weeks before camp recommended."),
        ("moses.ssempijja@gmail.com", True, 0.88,
         ["5 donations spanning 2019–2024 — dedicated long-term donor",
          "Last donation 2024-08-15 — 22 months ago",
          "Excellent haemoglobin (15.5 g/dL) and weight (80 kg)",
          "Mbale-based — top recruit for Eastern regional camps"],
         "Very high availability. Veteran donor with excellent health profile. High conversion probability for Mbale drive."),
        ("diana.nabirye@gmail.com", True, 0.60,
         ["1 donation — early-stage donor, intent needs reinforcement",
          "Last donation 2024-09-14 — 21 months ago",
          "Good health profile — haemoglobin and weight adequate",
          "Campus-recruited — consider group outreach at Masaka University"],
         "Moderate availability. New donor — personalised retention message recommended to build habit."),
        ("emmanuel.tumwesigye@gmail.com", False, 0.18,
         ["Chronic condition (hypertension) and active medication reduce donation suitability",
          "Despite 3 past donations, current health status makes near-term availability unlikely",
          "Last donation 2024-12-10 — 18 months ago but medical deferral applies"],
         "Not available due to health constraints. Retain in system for future re-screening when condition improves."),
        ("irene.nakiganda@gmail.com", True, 0.70,
         ["2 donations with a 2-year gap between them — re-engaged donor",
          "Last donation 2024-11-05 — 19 months ago",
          "Good health indicators, no barriers",
          "Jinja-based — near Jinja camp"],
         "Good availability. Re-engaged donor — maintain contact to reinforce habit. Candidate for Jinja future drive."),
        ("ivan.mutebi@gmail.com", True, 0.83,
         ["4 donations, steady pattern every 1–2 years",
          "Last donation 2024-09-20 — 21 months ago",
          "Outstanding haemoglobin (15.8 g/dL) and good weight (75 kg)",
          "Kampala-based — easy access to multiple camp sites"],
         "High availability. Strong health and donation pattern. Priority contact for Kampala Central next cycle."),
        ("peter.kyambadde@gmail.com", True, 0.87,
         ["5 donations spanning 2018–2024 — one of the longest-serving donors",
          "Last donation 2024-08-01 — 22 months ago",
          "Excellent weight (82 kg) and haemoglobin (14.8 g/dL)",
          "Tororo-based — Eastern Uganda regional outreach"],
         "Very high availability. Veteran donor with consistent multi-year participation. Strong conversion for Eastern drive."),
    ]

    a_created = a_skipped = 0
    for email, is_avail, prob, reasons, summary in AVAILABILITY:
        profile = profile_map.get(email)
        if not profile:
            continue
        exists = AvailabilityAssessment.objects.filter(donor=profile).exists()
        if not exists:
            AvailabilityAssessment.objects.create(
                donor=profile, is_available=is_avail,
                availability_probability=prob, reasons=reasons, summary=summary,
            )
            a_created += 1
        else:
            a_skipped += 1
    print(f"  Availability assessments: created={a_created}, skipped={a_skipped}")


    # ─── §9  CAMPAIGN RESPONSES ────────────────────────────────────────────────
    print("→ Creating campaign responses...")
    try:
        kampala_campaign = CampaignPerformance.objects.filter(
            campaign_name__icontains="Kampala O+"
        ).first()
        if kampala_campaign and admin_user:
            RESPONSES = [
                ("david.kizito@gmail.com",    "DONATED",        date(2026, 6, 8),  "Donated 450 ml whole blood at Kampala Central", "Successful — no adverse events"),
                ("irene.nakiganda@gmail.com", "DONATED",        date(2026, 6, 8),  "Donated 450 ml whole blood at Kampala Central", "Successful — first donation after long gap"),
                ("ivan.mutebi@gmail.com",     "DONATED",        date(2026, 6, 9),  "Donated 450 ml whole blood at Mulago Hospital", "Successful — excellent haemoglobin reading"),
                ("sarah.akello@gmail.com",    "RESPONDED",      date(2026, 6, 7),  "Replied yes but could not attend scheduled date", "Will attend next available camp — follow up in 2 weeks"),
                ("peter.kyambadde@gmail.com", "CONTACTED",      None,              "", "SMS sent — awaiting response"),
                ("diana.nabirye@gmail.com",   "CONTACTED",      None,              "", "WhatsApp message sent — awaiting response"),
                ("james.ssemakula@gmail.com", "NOT_INTERESTED", date(2026, 6, 6),  "Replied unavailable due to work travel", "Re-contact for next Kampala drive in 3 months"),
                ("mary.nakazibwe@gmail.com",  "RESPONDED",      date(2026, 6, 7),  "Confirmed attendance for next Saturday camp", "High likelihood of conversion"),
            ]
            r_created = r_skipped = 0
            for email, status, resp_date, outcome, notes in RESPONSES:
                profile = profile_map.get(email)
                if not profile:
                    continue
                _, created = CampaignResponse.objects.get_or_create(
                    campaign=kampala_campaign, donor=profile,
                    defaults=dict(
                        status=status, response_date=resp_date,
                        outcome=outcome, notes=notes,
                        recorded_by=admin_user,
                    ),
                )
                if created:
                    r_created += 1
                else:
                    r_skipped += 1
            print(f"  Campaign responses: created={r_created}, skipped={r_skipped}")
        else:
            print("  Campaign responses: Kampala O+ campaign not found — skipping")
    except Exception as ex:
        print(f"  Campaign responses: skipped ({ex})")


print("\n✓ Seed complete. Final counts:")
from accounts.models import User
from donors.models import DonorProfile, DonationRecord, DonorMedicalRecord, DonorBadge, EligibilityAssessment, AvailabilityAssessment
from camps.models import DonationCamp
from campaigns.models import CampaignPerformance, CampaignResponse

print(f"  Users:                   {User.objects.count()}")
print(f"  Donor profiles:          {DonorProfile.objects.count()}")
print(f"  Medical records:         {DonorMedicalRecord.objects.count()}")
print(f"  Donation records:        {DonationRecord.objects.count()}")
print(f"  Badges:                  {DonorBadge.objects.count()}")
print(f"  Eligibility assessments: {EligibilityAssessment.objects.count()}")
print(f"  Availability assessments:{AvailabilityAssessment.objects.count()}")
print(f"  Camps:                   {DonationCamp.objects.count()}")
print(f"  Campaign performance:    {CampaignPerformance.objects.count()}")
print(f"  Campaign responses:      {CampaignResponse.objects.count()}")
