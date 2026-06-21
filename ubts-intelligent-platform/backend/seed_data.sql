-- ════════════════════════════════════════════════════════════════════════════
-- RED HOPE / UBTS PLATFORM — POSTGRESQL SAMPLE DATA SEED
-- Run AFTER: python manage.py shell < seed_users.py
-- Run with:  psql -U <user> -d <dbname> -f seed_data.sql
--            OR paste into pgAdmin / DBeaver query window
-- All FK references use subquery lookups (no hardcoded IDs)
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- §1  DONATION CAMPS  (8 camps across Uganda)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO camps_donationcamp
    (name, description, region, district, venue, latitude, longitude,
     start_date, end_date, contact_phone, status, created_at, updated_at)
VALUES
  ('Kampala Central Blood Drive',
   'Monthly flagship drive at the heart of Kampala serving Central region donors.',
   'Central', 'Kampala', 'Kololo Community Hall',
   0.3136, 32.5811, '2025-05-01', '2025-08-31', '0800123001', 'ACTIVE', NOW(), NOW()),

  ('Mulago Hospital Drive',
   'Hospital-based continuous collection point at Mulago National Referral Hospital.',
   'Central', 'Kampala', 'Mulago National Referral Hospital',
   0.3395, 32.5776, '2025-04-15', '2025-09-15', '0800123002', 'ACTIVE', NOW(), NOW()),

  ('Entebbe Lakeside Drive',
   'Community blood collection camp for Entebbe municipality and lakeside parishes.',
   'Central', 'Wakiso', 'Entebbe Community Centre',
   0.0614, 32.4644, '2025-06-01', '2025-09-01', '0800123003', 'ACTIVE', NOW(), NOW()),

  ('Mbarara Regional Drive',
   'Western Uganda regional camp based at Mbarara University of Science & Technology Hospital.',
   'Western', 'Mbarara', 'MUST Teaching Hospital',
   -0.6058, 30.6580, '2025-05-10', '2025-08-10', '0800123004', 'ACTIVE', NOW(), NOW()),

  ('Gulu Northern Drive',
   'Northern Uganda drive serving Acholi sub-region communities around Gulu city.',
   'Northern', 'Gulu', 'Gulu Regional Referral Hospital',
   2.7858, 32.2998, '2025-06-15', '2025-10-15', '0800123005', 'ACTIVE', NOW(), NOW()),

  ('Jinja Source of the Nile Drive',
   'Eastern Uganda community drive at the historic source of the Nile.',
   'Eastern', 'Jinja', 'Jinja Municipal Hall',
   0.4478, 33.2026, '2024-09-01', '2024-11-30', '0800123006', 'COMPLETED', NOW(), NOW()),

  ('Mbale Mt. Elgon Drive',
   'Bi-annual Eastern Uganda drive covering Mbale, Sironko and Manafwa districts.',
   'Eastern', 'Mbale', 'Mbale Regional Referral Hospital',
   1.0760, 34.1750, '2024-10-01', '2024-12-31', '0800123007', 'COMPLETED', NOW(), NOW()),

  ('Fort Portal Rwenzori Drive',
   'Planned Western highlands camp — pending resource allocation and staffing.',
   'Western', 'Kabarole', 'Fort Portal Tourism City Hall',
   0.6712, 30.2750, '2025-10-01', '2025-12-31', '0800123008', 'INACTIVE', NOW(), NOW());


-- ─────────────────────────────────────────────────────────────────────────────
-- §2  DONOR PROFILES  (15 donors, Ugandan population spread)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO donors_donorprofile
    (user_id, phone_number, blood_group, date_of_birth, gender, address,
     total_donations, latitude, longitude, whatsapp_number, whatsapp_consent, created_at)
SELECT u.id, v.phone_number, v.blood_group, v.dob::date, v.gender, v.address,
       v.total_donations, v.lat, v.lng, v.wa_number, v.wa_consent, NOW()
FROM (VALUES
  ('david.kizito@gmail.com',        '0772100001', 'O+',  '1992-03-15', 'Male',   'Kololo, Kampala',          5,  0.3136, 32.5811, '0772100001', TRUE),
  ('mary.nakazibwe@gmail.com',      '0782200002', 'A+',  '1995-07-22', 'Female', 'Gayaza Road, Wakiso',      4,  0.4019, 32.4591, '0782200002', TRUE),
  ('james.ssemakula@gmail.com',     '0755300003', 'B+',  '1988-11-08', 'Male',   'Mukono Town Centre',       3,  0.3530, 32.7551, '',           FALSE),
  ('grace.nakato@gmail.com',        '0776400004', 'AB+', '2000-01-30', 'Female', 'Jinja Central Division',   0,  0.4478, 33.2026, '0776400004', TRUE),
  ('robert.ssebagala@gmail.com',    '0752500005', 'O-',  '1985-06-12', 'Male',   'Mbarara City Centre',      6,  -0.6058,30.6580, '',           FALSE),
  ('flavia.namukasa@gmail.com',     '0703600006', 'A-',  '1997-09-25', 'Female', 'Entebbe Municipality',     3,  0.0614, 32.4644, '0703600006', TRUE),
  ('patrick.okwir@gmail.com',       '0785700007', 'B-',  '1990-04-18', 'Male',   'Gulu City Centre',         4,  2.7858, 32.2998, '',           FALSE),
  ('sarah.akello@gmail.com',        '0779800008', 'O+',  '1993-12-05', 'Female', 'Lira Municipality',        2,  2.2499, 32.8998, '0779800008', TRUE),
  ('moses.ssempijja@gmail.com',     '0756900009', 'A+',  '1987-08-14', 'Male',   'Mbale City',               5,  1.0760, 34.1750, '',           FALSE),
  ('diana.nabirye@gmail.com',       '0771010010', 'B+',  '1999-03-28', 'Female', 'Masaka Municipality',      1,  -0.3404,31.7379, '0771010010', TRUE),
  ('emmanuel.tumwesigye@gmail.com', '0753110011', 'AB-', '1991-07-07', 'Male',   'Kabale Municipality',      3,  -1.2497,29.9874, '',           FALSE),
  ('irene.nakiganda@gmail.com',     '0782210012', 'O+',  '1994-11-19', 'Female', 'Jinja Masese Division',    2,  0.4398, 33.2100, '0782210012', TRUE),
  ('ivan.mutebi@gmail.com',         '0775310013', 'A+',  '1996-05-03', 'Male',   'Nakawa Division, Kampala', 4,  0.3244, 32.6142, '',           FALSE),
  ('rose.akello@gmail.com',         '0703410014', 'B+',  '2001-02-14', 'Female', 'Arua City',                0,  3.0196, 30.9107, '0703410014', TRUE),
  ('peter.kyambadde@gmail.com',     '0784510015', 'O+',  '1983-10-22', 'Male',   'Tororo Municipality',      5,  0.6924, 34.1835, '',           FALSE)
) AS v(email, phone_number, blood_group, dob, gender, address,
        total_donations, lat, lng, wa_number, wa_consent)
JOIN accounts_user u ON u.email = v.email
ON CONFLICT (user_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- §3  MEDICAL RECORDS  (13 out of 15 donors — Grace & Rose have records but
--     Grace has low haemoglobin; Rose has none yet as new registrant)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO donors_donormedicalrecord
    (donor_id, weight_kg, hemoglobin_level, has_recent_illness, has_chronic_condition,
     last_donation_date, is_pregnant, is_on_medication, updated_at)
SELECT p.id,
       v.weight_kg::float8,
       v.hemoglobin_level::float8,
       v.has_recent_illness::boolean,
       v.has_chronic_condition::boolean,
       v.last_donation_date::date,
       v.is_pregnant::boolean,
       v.is_on_medication::boolean,
       NOW()
FROM (VALUES
  -- email                            wt    hgb    ill    chronic  last_don        preg   meds
  ('david.kizito@gmail.com',          '78', '15.2','false','false', '2024-10-15',  'false','false'),
  ('mary.nakazibwe@gmail.com',        '62', '13.8','false','false', '2025-01-20',  'false','false'),
  ('james.ssemakula@gmail.com',       '70', '14.1','false','false', '2024-11-30',  'false','false'),
  ('grace.nakato@gmail.com',          '55', '11.5','false','false', NULL,           'false','false'),
  ('robert.ssebagala@gmail.com',      '85', '16.0','false','false', '2024-09-05',  'false','false'),
  ('flavia.namukasa@gmail.com',       '58', '13.0','false','false', '2025-02-15',  'false','false'),
  ('patrick.okwir@gmail.com',         '72', '14.5','false','false', '2024-10-20',  'false','false'),
  ('sarah.akello@gmail.com',          '54', '12.8','false','false', '2025-03-01',  'false','false'),
  ('moses.ssempijja@gmail.com',       '80', '15.5','false','false', '2024-08-15',  'false','false'),
  ('diana.nabirye@gmail.com',         '61', '13.4','false','false', '2024-09-14',  'false','false'),
  ('emmanuel.tumwesigye@gmail.com',   '65', '13.0','false','true',  '2024-12-10',  'false','true'),
  ('irene.nakiganda@gmail.com',       '60', '13.2','false','false', '2024-11-05',  'false','false'),
  ('ivan.mutebi@gmail.com',           '75', '15.8','false','false', '2024-09-20',  'false','false'),
  ('peter.kyambadde@gmail.com',       '82', '14.8','false','false', '2024-08-01',  'false','false')
) AS v(email, weight_kg, hemoglobin_level, has_recent_illness, has_chronic_condition,
       last_donation_date, is_pregnant, is_on_medication)
JOIN accounts_user u ON u.email = v.email
JOIN donors_donorprofile p ON p.user_id = u.id
ON CONFLICT (donor_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- §4  DONATION RECORDS  (47 records — matches total_donations in §2)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO donors_donationrecord (donor_id, donation_date, camp_name, notes, recorded_at)
SELECT p.id, v.don_date::date, v.camp_name, v.notes, NOW() - (random() * INTERVAL '30 days')
FROM (VALUES
  -- David Kizito (5)
  ('david.kizito@gmail.com', '2020-04-10', 'Jinja Source of the Nile Drive',  'Routine donation — healthy and well'),
  ('david.kizito@gmail.com', '2021-07-15', 'Kampala Central Blood Drive',     'Proactive walk-in donor'),
  ('david.kizito@gmail.com', '2022-09-20', 'Mulago Hospital Drive',           'Referred by colleague'),
  ('david.kizito@gmail.com', '2023-11-08', 'Kampala Central Blood Drive',     'Regular scheduled donation'),
  ('david.kizito@gmail.com', '2024-10-15', 'Kampala Central Blood Drive',     'Annual camp donation'),

  -- Mary Nakazibwe (4)
  ('mary.nakazibwe@gmail.com', '2021-06-12', 'Kampala Central Blood Drive',  'First time — encouraged by friend'),
  ('mary.nakazibwe@gmail.com', '2022-03-18', 'Entebbe Lakeside Drive',       'Consistent repeat donor'),
  ('mary.nakazibwe@gmail.com', '2023-05-22', 'Mulago Hospital Drive',        'Volunteered at hospital camp'),
  ('mary.nakazibwe@gmail.com', '2025-01-20', 'Entebbe Lakeside Drive',       'New year donation'),

  -- James Ssemakula (3)
  ('james.ssemakula@gmail.com', '2022-08-14', 'Mulago Hospital Drive',       'Walk-in donor'),
  ('james.ssemakula@gmail.com', '2023-09-25', 'Kampala Central Blood Drive', 'SMS campaign response'),
  ('james.ssemakula@gmail.com', '2024-11-30', 'Kampala Central Blood Drive', 'Regular annual donation'),

  -- Robert Ssebagala (6 — rare O- blood type)
  ('robert.ssebagala@gmail.com', '2019-11-20', 'Mbarara Regional Drive',     'O- universal donor, priority recruit'),
  ('robert.ssebagala@gmail.com', '2020-08-15', 'Mbarara Regional Drive',     'Emergency appeal response'),
  ('robert.ssebagala@gmail.com', '2021-06-10', 'Mbarara Regional Drive',     'Regular semi-annual donation'),
  ('robert.ssebagala@gmail.com', '2022-04-05', 'Gulu Northern Drive',        'Travelled to Gulu for regional drive'),
  ('robert.ssebagala@gmail.com', '2023-02-18', 'Mbarara Regional Drive',     'Local camp walk-in'),
  ('robert.ssebagala@gmail.com', '2024-09-05', 'Mbarara Regional Drive',     'Semi-annual scheduled donation'),

  -- Flavia Namukasa (3 — A- rare type)
  ('flavia.namukasa@gmail.com', '2021-05-22', 'Entebbe Lakeside Drive',      'Workplace outreach participant'),
  ('flavia.namukasa@gmail.com', '2022-11-08', 'Kampala Central Blood Drive', 'WhatsApp campaign response'),
  ('flavia.namukasa@gmail.com', '2025-02-15', 'Entebbe Lakeside Drive',      'Annual community drive'),

  -- Patrick Okwir (4 — B- rare type)
  ('patrick.okwir@gmail.com', '2020-07-14', 'Gulu Northern Drive',           'Community sensitisation donor'),
  ('patrick.okwir@gmail.com', '2021-10-22', 'Gulu Northern Drive',           'Repeat donor — reliable'),
  ('patrick.okwir@gmail.com', '2022-08-30', 'Gulu Northern Drive',           'Brought two friends along'),
  ('patrick.okwir@gmail.com', '2024-10-20', 'Gulu Northern Drive',           'Annual camp participant'),

  -- Sarah Akello (2)
  ('sarah.akello@gmail.com', '2023-09-12', 'Gulu Northern Drive',            'First donation — motivated by family'),
  ('sarah.akello@gmail.com', '2025-03-01', 'Gulu Northern Drive',            'Returned after 18-month gap'),

  -- Moses Ssempijja (5)
  ('moses.ssempijja@gmail.com', '2019-03-20', 'Mbale Mt. Elgon Drive',      'First-time donor at regional camp'),
  ('moses.ssempijja@gmail.com', '2020-05-18', 'Mbale Mt. Elgon Drive',      'Consistent repeat — no adverse effects'),
  ('moses.ssempijja@gmail.com', '2021-08-14', 'Mbale Mt. Elgon Drive',      'Invited colleagues this time'),
  ('moses.ssempijja@gmail.com', '2022-10-22', 'Jinja Source of the Nile Drive', 'Donated at Jinja while on travel'),
  ('moses.ssempijja@gmail.com', '2024-08-15', 'Mbale Mt. Elgon Drive',      'Back to home camp after Jinja visit'),

  -- Diana Nabirye (1)
  ('diana.nabirye@gmail.com', '2024-09-14', 'Kampala Central Blood Drive',   'First donation — campus awareness event'),

  -- Emmanuel Tumwesigye (3 — AB- rare, chronic condition)
  ('emmanuel.tumwesigye@gmail.com', '2020-02-14', 'Mbarara Regional Drive',  'Pre-diagnosis donation — healthy at time'),
  ('emmanuel.tumwesigye@gmail.com', '2021-09-18', 'Kampala Central Blood Drive','Follow-up after medical clearance'),
  ('emmanuel.tumwesigye@gmail.com', '2024-12-10', 'Kampala Central Blood Drive','Cleared by doctor for single donation'),

  -- Irene Nakiganda (2)
  ('irene.nakiganda@gmail.com', '2022-07-22', 'Jinja Source of the Nile Drive', 'Donor awareness rally participant'),
  ('irene.nakiganda@gmail.com', '2024-11-05', 'Kampala Central Blood Drive',    'Returned after 2-year gap'),

  -- Ivan Mutebi (4)
  ('ivan.mutebi@gmail.com', '2020-11-15', 'Kampala Central Blood Drive',     'University blood drive'),
  ('ivan.mutebi@gmail.com', '2021-12-08', 'Mulago Hospital Drive',           'Emergency hospital appeal'),
  ('ivan.mutebi@gmail.com', '2022-10-14', 'Kampala Central Blood Drive',     'Regular annual camp'),
  ('ivan.mutebi@gmail.com', '2024-09-20', 'Mulago Hospital Drive',           'Hospital walk-in donation'),

  -- Peter Kyambadde (5 — veteran donor)
  ('peter.kyambadde@gmail.com', '2018-06-20', 'Mbale Mt. Elgon Drive',      'Long-standing community donor'),
  ('peter.kyambadde@gmail.com', '2019-08-14', 'Jinja Source of the Nile Drive','Travelled to Jinja drive'),
  ('peter.kyambadde@gmail.com', '2021-05-18', 'Kampala Central Blood Drive', 'Central camp visit during business trip'),
  ('peter.kyambadde@gmail.com', '2023-03-12', 'Mulago Hospital Drive',       'Hospital donation — responding to alert'),
  ('peter.kyambadde@gmail.com', '2024-08-01', 'Kampala Central Blood Drive', 'Annual community camp')
) AS v(email, don_date, camp_name, notes)
JOIN accounts_user u ON u.email = v.email
JOIN donors_donorprofile p ON p.user_id = u.id;


-- ─────────────────────────────────────────────────────────────────────────────
-- §5  DONOR BADGES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO donors_donorbadge (donor_id, badge_name, badge_description, awarded_at)
SELECT p.id, v.badge_name, v.badge_description, v.awarded_at::timestamptz
FROM (VALUES
  -- David Kizito (5 donations)
  ('david.kizito@gmail.com',     'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2020-04-10 00:00:00+03'),
  ('david.kizito@gmail.com',     'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2022-09-20 00:00:00+03'),
  ('david.kizito@gmail.com',     'Regular Donor',   'Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme.',             '2024-10-15 00:00:00+03'),

  -- Robert Ssebagala (6 donations, O- rare)
  ('robert.ssebagala@gmail.com', 'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2019-11-20 00:00:00+03'),
  ('robert.ssebagala@gmail.com', 'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2021-06-10 00:00:00+03'),
  ('robert.ssebagala@gmail.com', 'Regular Donor',   'Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme.',             '2023-02-18 00:00:00+03'),
  ('robert.ssebagala@gmail.com', 'Rare Blood Hero', 'Your O- universal donor blood is precious — it can save any patient, regardless of blood type.',   '2024-09-05 00:00:00+03'),

  -- Flavia Namukasa (3 donations, A-)
  ('flavia.namukasa@gmail.com',  'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2021-05-22 00:00:00+03'),
  ('flavia.namukasa@gmail.com',  'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2025-02-15 00:00:00+03'),
  ('flavia.namukasa@gmail.com',  'Rare Blood Hero', 'Your A- blood type is rare in Uganda — your donations are especially valuable to patients.',       '2025-02-15 00:00:00+03'),

  -- Patrick Okwir (4 donations, B-)
  ('patrick.okwir@gmail.com',    'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2020-07-14 00:00:00+03'),
  ('patrick.okwir@gmail.com',    'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2022-08-30 00:00:00+03'),
  ('patrick.okwir@gmail.com',    'Rare Blood Hero', 'B- is one of the rarest blood types in Uganda — thank you for stepping up.',                       '2024-10-20 00:00:00+03'),

  -- Moses Ssempijja (5 donations)
  ('moses.ssempijja@gmail.com',  'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2019-03-20 00:00:00+03'),
  ('moses.ssempijja@gmail.com',  'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2021-08-14 00:00:00+03'),
  ('moses.ssempijja@gmail.com',  'Regular Donor',   'Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme.',             '2024-08-15 00:00:00+03'),

  -- Peter Kyambadde (5 donations)
  ('peter.kyambadde@gmail.com',  'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2018-06-20 00:00:00+03'),
  ('peter.kyambadde@gmail.com',  'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2021-05-18 00:00:00+03'),
  ('peter.kyambadde@gmail.com',  'Regular Donor',   'Achieved 5 donations — you are now a recognised Regular Donor in the UBTS programme.',             '2024-08-01 00:00:00+03'),

  -- Ivan Mutebi (4 donations)
  ('ivan.mutebi@gmail.com',      'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2020-11-15 00:00:00+03'),
  ('ivan.mutebi@gmail.com',      'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2022-10-14 00:00:00+03'),

  -- Mary Nakazibwe (4 donations)
  ('mary.nakazibwe@gmail.com',   'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2021-06-12 00:00:00+03'),
  ('mary.nakazibwe@gmail.com',   'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2023-05-22 00:00:00+03'),

  -- James Ssemakula (3 donations)
  ('james.ssemakula@gmail.com',  'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2022-08-14 00:00:00+03'),
  ('james.ssemakula@gmail.com',  'Life Saver',      'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2024-11-30 00:00:00+03'),

  -- Emmanuel Tumwesigye (3 donations)
  ('emmanuel.tumwesigye@gmail.com','First Drop',    'Completed your very first blood donation — welcome to the family!',                               '2020-02-14 00:00:00+03'),
  ('emmanuel.tumwesigye@gmail.com','Life Saver',    'Donated blood 3 times — your generosity has helped save up to 9 lives.',                          '2024-12-10 00:00:00+03'),

  -- Irene Nakiganda (2 donations)
  ('irene.nakiganda@gmail.com',  'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2022-07-22 00:00:00+03'),

  -- Sarah Akello (2 donations)
  ('sarah.akello@gmail.com',     'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2023-09-12 00:00:00+03'),

  -- Diana Nabirye (1 donation)
  ('diana.nabirye@gmail.com',    'First Drop',      'Completed your very first blood donation — welcome to the family!',                               '2024-09-14 00:00:00+03')
) AS v(email, badge_name, badge_description, awarded_at)
JOIN accounts_user u ON u.email = v.email
JOIN donors_donorprofile p ON p.user_id = u.id;


-- ─────────────────────────────────────────────────────────────────────────────
-- §6  ELIGIBILITY ASSESSMENTS  (one per donor with a medical record)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO donors_eligibilityassessment (donor_id, is_eligible, age, reasons, summary, assessed_at)
SELECT p.id,
       v.is_eligible::boolean,
       v.age::int,
       v.reasons::jsonb,
       v.summary,
       v.assessed_at::timestamptz
FROM (VALUES
  ('david.kizito@gmail.com', 'true', '33',
   '["Age is within the required 18–65 range", "Weight 78 kg meets the 50 kg minimum", "Haemoglobin 15.2 g/dL is adequate for male donors (≥13.5)", "No chronic conditions reported", "Last donation was over 90 days ago (2024-10-15)"]',
   'Donor is fully eligible to donate blood. All criteria met without exception.',
   '2026-05-10 09:30:00+03'),

  ('mary.nakazibwe@gmail.com', 'true', '30',
   '["Age is within the required 18–65 range", "Weight 62 kg meets the 50 kg minimum", "Haemoglobin 13.8 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported", "Last donation was over 90 days ago (2025-01-20)"]',
   'Donor is fully eligible to donate blood. All health and time criteria are satisfied.',
   '2026-05-12 10:15:00+03'),

  ('james.ssemakula@gmail.com', 'true', '37',
   '["Age is within the required 18–65 range", "Weight 70 kg meets the 50 kg minimum", "Haemoglobin 14.1 g/dL is adequate for male donors (≥13.5)", "No chronic conditions reported", "Last donation was over 90 days ago (2024-11-30)"]',
   'Donor is fully eligible. All screening criteria passed successfully.',
   '2026-05-14 11:00:00+03'),

  ('grace.nakato@gmail.com', 'false', '26',
   '["Haemoglobin level 11.5 g/dL is below the minimum threshold of 12.5 g/dL for female donors"]',
   'Donor is currently not eligible due to low haemoglobin. Recommend dietary iron supplementation and re-screening in 3 months.',
   '2026-05-15 09:00:00+03'),

  ('robert.ssebagala@gmail.com', 'true', '40',
   '["Age is within the required 18–65 range", "Weight 85 kg meets the 50 kg minimum", "Haemoglobin 16.0 g/dL is excellent for male donors", "No chronic conditions reported", "Last donation was over 90 days ago (2024-09-05)", "O- universal donor — high clinical value"]',
   'Donor is fully eligible and is a highly valuable O- universal donor. Priority recruitment recommended.',
   '2026-05-16 14:30:00+03'),

  ('flavia.namukasa@gmail.com', 'true', '28',
   '["Age is within the required 18–65 range", "Weight 58 kg meets the 50 kg minimum", "Haemoglobin 13.0 g/dL meets the threshold for female donors (≥12.5)", "No chronic conditions reported", "Last donation was over 90 days ago (2025-02-15)"]',
   'Donor is eligible to donate. A- is a rare blood type — active outreach recommended.',
   '2026-05-17 10:45:00+03'),

  ('patrick.okwir@gmail.com', 'true', '35',
   '["Age is within the required 18–65 range", "Weight 72 kg meets the 50 kg minimum", "Haemoglobin 14.5 g/dL is adequate for male donors", "No chronic conditions reported", "Last donation was over 90 days ago (2024-10-20)", "B- is a rare blood type in Uganda"]',
   'Donor is eligible and is a rare B- type. Prioritise for upcoming drive outreach.',
   '2026-05-18 08:20:00+03'),

  ('sarah.akello@gmail.com', 'true', '32',
   '["Age is within the required 18–65 range", "Weight 54 kg meets the 50 kg minimum", "Haemoglobin 12.8 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported", "Last donation was over 90 days ago (2025-03-01)"]',
   'Donor is eligible. Borderline haemoglobin — encourage iron-rich diet before next donation.',
   '2026-05-20 13:00:00+03'),

  ('moses.ssempijja@gmail.com', 'true', '38',
   '["Age is within the required 18–65 range", "Weight 80 kg meets the 50 kg minimum", "Haemoglobin 15.5 g/dL is excellent for male donors", "No chronic conditions reported", "Last donation was over 90 days ago (2024-08-15)"]',
   'Donor is fully eligible. Strong donation history and excellent health profile.',
   '2026-05-21 09:00:00+03'),

  ('diana.nabirye@gmail.com', 'true', '27',
   '["Age is within the required 18–65 range", "Weight 61 kg meets the 50 kg minimum", "Haemoglobin 13.4 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported", "Last donation was over 90 days ago (2024-09-14)"]',
   'Donor is eligible. Good health indicators — encourage more frequent participation.',
   '2026-05-22 10:30:00+03'),

  ('emmanuel.tumwesigye@gmail.com', 'false', '34',
   '["Chronic health condition (hypertension) reported", "Currently on long-term medication — increases deferral risk", "Haemoglobin 13.0 g/dL is near the lower limit for male donors"]',
   'Donor is currently deferred due to chronic condition and ongoing medication. Medical clearance required before next donation.',
   '2026-05-23 11:00:00+03'),

  ('irene.nakiganda@gmail.com', 'true', '31',
   '["Age is within the required 18–65 range", "Weight 60 kg meets the 50 kg minimum", "Haemoglobin 13.2 g/dL is adequate for female donors (≥12.5)", "No chronic conditions reported", "Last donation was over 90 days ago (2024-11-05)"]',
   'Donor is eligible. Consistent donation history — send retention reminder for next drive.',
   '2026-05-25 14:00:00+03'),

  ('ivan.mutebi@gmail.com', 'true', '30',
   '["Age is within the required 18–65 range", "Weight 75 kg meets the 50 kg minimum", "Haemoglobin 15.8 g/dL is excellent for male donors", "No chronic conditions reported", "Last donation was over 90 days ago (2024-09-20)"]',
   'Donor is fully eligible. Very strong haemoglobin levels — ideal candidate for upcoming campaign.',
   '2026-05-26 09:30:00+03'),

  ('peter.kyambadde@gmail.com', 'true', '42',
   '["Age is within the required 18–65 range", "Weight 82 kg meets the 50 kg minimum", "Haemoglobin 14.8 g/dL is adequate for male donors", "No chronic conditions reported", "Last donation was over 90 days ago (2024-08-01)"]',
   'Veteran donor — fully eligible. Donation history of 5+ records signals reliable participation.',
   '2026-05-27 10:00:00+03')
) AS v(email, is_eligible, age, reasons, summary, assessed_at)
JOIN accounts_user u ON u.email = v.email
JOIN donors_donorprofile p ON p.user_id = u.id;


-- ─────────────────────────────────────────────────────────────────────────────
-- §7  AVAILABILITY ASSESSMENTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO donors_availabilityassessment
    (donor_id, is_available, availability_probability, reasons, summary, assessed_at)
SELECT p.id,
       v.is_available::boolean,
       v.probability::float8,
       v.reasons::jsonb,
       v.summary,
       v.assessed_at::timestamptz
FROM (VALUES
  ('david.kizito@gmail.com', 'true', '0.85',
   '["Strong multi-year donation history (5 records) signals high commitment", "Last donation 2024-10-15 — over 19 months ago, well within donation window", "No health barriers identified", "Active in Kampala — near multiple camps"]',
   'High availability. Donor has a consistent pattern and is physically ready. Priority contact for next drive.',
   '2026-05-10 09:45:00+03'),

  ('mary.nakazibwe@gmail.com', 'true', '0.78',
   '["Regular donor with 4 recorded donations — shows sustained intent", "Last donation 2025-01-20 — 17 months ago", "Haemoglobin and weight are satisfactory", "WhatsApp consent granted — preferred contact channel"]',
   'Good availability. SMS/WhatsApp outreach likely to convert. Schedule for Entebbe drive.',
   '2026-05-12 10:30:00+03'),

  ('james.ssemakula@gmail.com', 'true', '0.72',
   '["3 donations across 3 years — moderate commitment level", "Last donation 2024-11-30 — 19 months ago", "No health barriers", "Mukono location — consider for nearby Kampala or Jinja camps"]',
   'Moderate-to-good availability. Contact via SMS — no WhatsApp consent on file.',
   '2026-05-14 11:15:00+03'),

  ('grace.nakato@gmail.com', 'false', '0.22',
   '["No donation history — intent and tolerance unknown", "Haemoglobin 11.5 g/dL below minimum threshold — medically not currently suitable", "Age 26 with good weight — potential future donor after health improvement"]',
   'Not available due to low haemoglobin. Follow up with nutritional advice and schedule re-assessment in 12 weeks.',
   '2026-05-15 09:15:00+03'),

  ('robert.ssebagala@gmail.com', 'true', '0.92',
   '["6 donations — one of the most active donors on the platform", "Last donation 2024-09-05 — over 21 months ago", "O- universal donor — extremely high clinical priority", "Strong health profile: 85 kg, haemoglobin 16.0 g/dL", "Mbarara-based — target for western regional drives"]',
   'Exceptional availability. O- universal donor with outstanding history. Highest-priority contact for any urgent blood demand.',
   '2026-05-16 14:45:00+03'),

  ('flavia.namukasa@gmail.com', 'true', '0.70',
   '["3 donations over 4 years — moderate frequency", "Last donation 2025-02-15 — 16 months ago", "A- rare blood type — high recipient value", "WhatsApp consent — preferred outreach channel"]',
   'Good availability. Rare A- donor — prioritise WhatsApp outreach for next Entebbe drive.',
   '2026-05-17 11:00:00+03'),

  ('patrick.okwir@gmail.com', 'true', '0.80',
   '["4 donations at Gulu camp — very loyal local donor", "Last donation 2024-10-20 — 20 months ago", "B- is rare — strong clinical value per donation", "Gulu-based — ideal candidate for Northern drive outreach"]',
   'High availability. Consistent Gulu-based donor with rare B- blood. Prioritise for next Northern drive.',
   '2026-05-18 08:35:00+03'),

  ('sarah.akello@gmail.com', 'true', '0.65',
   '["2 donations, 18-month gap between them — sporadic but returning", "Last donation 2025-03-01 — 15 months ago", "Haemoglobin borderline but adequate", "Lira-based — Northern region outreach candidate"]',
   'Moderate availability. Donor returns after long gaps — SMS reminder 4 weeks before camp recommended.',
   '2026-05-20 13:15:00+03'),

  ('moses.ssempijja@gmail.com', 'true', '0.88',
   '["5 donations spanning 2019–2024 — dedicated long-term donor", "Last donation 2024-08-15 — 22 months ago", "Excellent haemoglobin (15.5 g/dL) and weight (80 kg)", "Mbale-based — top recruit for Eastern regional camps"]',
   'Very high availability. Veteran donor with excellent health profile. High conversion probability for Mbale drive.',
   '2026-05-21 09:15:00+03'),

  ('diana.nabirye@gmail.com', 'true', '0.60',
   '["1 donation — early-stage donor, intent needs reinforcement", "Last donation 2024-09-14 — 21 months ago", "Good health profile — haemoglobin and weight adequate", "Campus-recruited — consider group outreach at Masaka University"]',
   'Moderate availability. New donor — personalised retention message recommended to build habit.',
   '2026-05-22 10:45:00+03'),

  ('emmanuel.tumwesigye@gmail.com', 'false', '0.18',
   '["Chronic condition (hypertension) and active medication reduce donation suitability", "Despite 3 past donations, current health status makes near-term availability unlikely", "Last donation 2024-12-10 — 18 months ago but medical deferral applies"]',
   'Not available due to health constraints. Retain in system for future re-screening when condition improves.',
   '2026-05-23 11:15:00+03'),

  ('irene.nakiganda@gmail.com', 'true', '0.70',
   '["2 donations with a 2-year gap between them — re-engaged donor", "Last donation 2024-11-05 — 19 months ago", "Good health indicators, no barriers", "Jinja-based — near Jinja camp"]',
   'Good availability. Re-engaged donor — maintain contact to reinforce habit. Candidate for Jinja future drive.',
   '2026-05-25 14:15:00+03'),

  ('ivan.mutebi@gmail.com', 'true', '0.83',
   '["4 donations, steady pattern every 1–2 years", "Last donation 2024-09-20 — 21 months ago", "Outstanding haemoglobin (15.8 g/dL) and good weight (75 kg)", "Kampala-based — easy access to multiple camp sites"]',
   'High availability. Strong health and donation pattern. Priority contact for Kampala Central next cycle.',
   '2026-05-26 09:45:00+03'),

  ('peter.kyambadde@gmail.com', 'true', '0.87',
   '["5 donations spanning 2018–2024 — one of the longest-serving donors", "Last donation 2024-08-01 — 22 months ago", "Excellent weight (82 kg) and haemoglobin (14.8 g/dL)", "Tororo-based — Eastern Uganda regional outreach"]',
   'Very high availability. Veteran donor with consistent multi-year participation. Strong conversion for Eastern drive.',
   '2026-05-27 10:15:00+03')
) AS v(email, is_available, probability, reasons, summary, assessed_at)
JOIN accounts_user u ON u.email = v.email
JOIN donors_donorprofile p ON p.user_id = u.id;


-- ─────────────────────────────────────────────────────────────────────────────
-- §8  CAMPAIGN PERFORMANCE RECORDS  (3 past scans by admin)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO campaigns_campaignperformance
    (blood_group, radius_km, campaign_latitude, campaign_longitude,
     total_matches, available_donors, unavailable_donors,
     high_priority_donors, medium_priority_donors, low_priority_donors,
     ineligible_donors, outside_radius_donors, skipped_donors,
     average_availability_score, average_campaign_priority_score,
     contacted_donors, converted_donors, campaign_name, created_by_id, created_at)
VALUES
  ('O+', 20.0, 0.3136, 32.5811,
   8, 6, 2,
   3, 2, 1,
   1, 2, 0,
   0.74, 0.71,
   5, 3,
   'Kampala O+ Emergency Drive — June 2026',
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '15 days'),

  ('A+', 25.0, 1.0760, 34.1750,
   5, 3, 2,
   2, 1, 0,
   1, 1, 1,
   0.68, 0.65,
   3, 2,
   'Mbale A+ Regional Campaign — May 2026',
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '35 days'),

  (NULL, 30.0, 2.7858, 32.2998,
   12, 9, 3,
   4, 3, 2,
   2, 3, 0,
   0.71, 0.68,
   8, 5,
   'Gulu Northern All-Groups Drive — April 2026',
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '60 days');


-- ─────────────────────────────────────────────────────────────────────────────
-- §9  CAMPAIGN RESPONSES  (8 responses for the O+ Kampala campaign)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO campaigns_campaignresponse
    (campaign_id, donor_id, status, response_date, outcome, notes, recorded_by_id, created_at, updated_at)
SELECT
    (SELECT id FROM campaigns_campaignperformance WHERE campaign_name = 'Kampala O+ Emergency Drive — June 2026'),
    p.id,
    v.status,
    v.response_date::date,
    v.outcome,
    v.notes,
    (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '10 days'
FROM (VALUES
  ('david.kizito@gmail.com',    'DONATED',        '2026-06-08', 'Donated 450 ml whole blood at Kampala Central', 'Successful — no adverse events'),
  ('irene.nakiganda@gmail.com', 'DONATED',        '2026-06-08', 'Donated 450 ml whole blood at Kampala Central', 'Successful — first donation after long gap'),
  ('ivan.mutebi@gmail.com',     'DONATED',        '2026-06-09', 'Donated 450 ml whole blood at Mulago Hospital', 'Successful — excellent haemoglobin reading'),
  ('sarah.akello@gmail.com',    'RESPONDED',      '2026-06-07', 'Replied yes but could not attend scheduled date', 'Will attend next available camp — follow up in 2 weeks'),
  ('peter.kyambadde@gmail.com', 'CONTACTED',      NULL,         '', 'SMS sent — awaiting response'),
  ('diana.nabirye@gmail.com',   'CONTACTED',      NULL,         '', 'WhatsApp message sent — awaiting response'),
  ('james.ssemakula@gmail.com', 'NOT_INTERESTED', '2026-06-06', 'Replied unavailable due to work travel', 'Re-contact for next Kampala drive in 3 months'),
  ('mary.nakazibwe@gmail.com',  'RESPONDED',      '2026-06-07', 'Confirmed attendance for next Saturday camp', 'High likelihood of conversion')
) AS v(email, status, response_date, outcome, notes)
JOIN accounts_user u ON u.email = v.email
JOIN donors_donorprofile p ON p.user_id = u.id
ON CONFLICT (campaign_id, donor_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- §10  BLOOD DEMAND ALERTS  (6 alerts — mix of active and resolved)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications_blooddemandalert
    (blood_group, title, message, urgency_level, units_needed, hospital_name,
     status, notified_count, resolved_at, created_by_id, created_at)
VALUES
  ('O-', 'Critical O- Shortage at Mulago',
   'Mulago National Referral Hospital is facing a critical shortage of O- blood. Surgical and trauma patients at risk. Immediate donation needed.',
   'CRITICAL', 8, 'Mulago National Referral Hospital',
   'ACTIVE', 12, NULL,
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '2 days'),

  ('AB-', 'Urgent AB- Request — Mbarara University Hospital',
   'MUST Teaching Hospital urgently requires AB- blood units for multiple scheduled surgeries next week. Donors in Western region needed.',
   'HIGH', 4, 'MUST Teaching Hospital, Mbarara',
   'ACTIVE', 5, NULL,
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '5 days'),

  ('O+', 'O+ Demand — Jinja Regional Hospital',
   'Jinja Regional Hospital requests O+ blood donations ahead of planned caesarean procedures. Community donors encouraged to attend the Jinja camp.',
   'MEDIUM', 10, 'Jinja Regional Referral Hospital',
   'ACTIVE', 23, NULL,
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '8 days'),

  ('B+', 'B+ Blood Needed — Mbale Regional Hospital',
   'Mbale Regional Referral Hospital required B+ blood for paediatric patients last month. Community response was strong.',
   'MEDIUM', 6, 'Mbale Regional Referral Hospital',
   'RESOLVED', 18, NOW() - INTERVAL '20 days',
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '45 days'),

  ('A+', 'A+ Campaign Response — Gulu Hospital Drive',
   'A+ donors were urgently needed to support trauma patients at Gulu Regional Referral Hospital following a road accident surge. Resolved after campaign.',
   'HIGH', 12, 'Gulu Regional Referral Hospital',
   'RESOLVED', 30, NOW() - INTERVAL '35 days',
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '55 days'),

  ('O+', 'Low O+ Stock — Entebbe Lakeside Drive',
   'Routine O+ stock replenishment needed at Entebbe Municipal Hospital. No emergency — donors welcome any day this week.',
   'LOW', 5, 'Entebbe Municipal Hospital',
   'ACTIVE', 7, NULL,
   (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   NOW() - INTERVAL '3 days');


-- ─────────────────────────────────────────────────────────────────────────────
-- §11  NOTIFICATIONS  (12 notifications for various donors and admin)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications_notification
    (recipient_id, title, message, notification_type, target_role,
     is_read, action_label, action_url, created_at)
VALUES
  -- Badge awarded notifications
  ((SELECT id FROM accounts_user WHERE email='robert.ssebagala@gmail.com'),
   'Badge Earned: Rare Blood Hero',
   'Congratulations Robert! You have earned the Rare Blood Hero badge for your continued O- donations. Your blood can save anyone — regardless of blood type. Thank you!',
   'BADGE', 'DONOR', TRUE, 'View Badges', '/donor-dashboard', NOW() - INTERVAL '22 days'),

  ((SELECT id FROM accounts_user WHERE email='david.kizito@gmail.com'),
   'Badge Earned: Regular Donor',
   'Congratulations David! You have earned the Regular Donor badge for reaching 5 donations. Your consistent commitment is saving lives across Uganda.',
   'BADGE', 'DONOR', TRUE, 'View Dashboard', '/donor-dashboard', NOW() - INTERVAL '60 days'),

  ((SELECT id FROM accounts_user WHERE email='moses.ssempijja@gmail.com'),
   'Badge Earned: Regular Donor',
   'Congratulations Moses! Your 5th donation has earned you the Regular Donor badge. The communities of Eastern Uganda thank you for your service.',
   'BADGE', 'DONOR', FALSE, 'View Dashboard', '/donor-dashboard', NOW() - INTERVAL '45 days'),

  -- Retention reminders
  ((SELECT id FROM accounts_user WHERE email='grace.nakato@gmail.com'),
   'Health Update Reminder',
   'Hi Grace, your last haemoglobin screening showed levels below the minimum threshold. We recommend eating iron-rich foods and getting re-screened in 3 months. We look forward to welcoming you as a donor!',
   'RETENTION', 'DONOR', FALSE, 'Update Profile', '/my-profile', NOW() - INTERVAL '10 days'),

  ((SELECT id FROM accounts_user WHERE email='rose.akello@gmail.com'),
   'Make Your First Donation!',
   'Hi Rose! You registered with RedHope but have not yet donated. There is an active camp in Gulu this month — your blood group B+ is needed. Take that first step today!',
   'RETENTION', 'DONOR', FALSE, 'Find Nearest Camp', '/donor-dashboard', NOW() - INTERVAL '7 days'),

  ((SELECT id FROM accounts_user WHERE email='diana.nabirye@gmail.com'),
   'It''s Time to Donate Again',
   'Hi Diana! It has been over 20 months since your first donation at Kampala Central. You are eligible to donate again. Check your nearest camp and book a time.',
   'RETENTION', 'DONOR', FALSE, 'Donate Now', '/donor-dashboard', NOW() - INTERVAL '5 days'),

  -- Blood demand notifications
  ((SELECT id FROM accounts_user WHERE email='robert.ssebagala@gmail.com'),
   'URGENT: O- Blood Needed at Mulago',
   'As an O- universal donor, you are critically needed. Mulago National Referral Hospital has a shortage affecting surgical patients. Please donate as soon as possible.',
   'BLOOD_DEMAND', 'DONOR', FALSE, 'View Alert', '/blood-demand-alerts', NOW() - INTERVAL '2 days'),

  ((SELECT id FROM accounts_user WHERE email='emmanuel.tumwesigye@gmail.com'),
   'AB- Blood Request — Mbarara Hospital',
   'Hi Emmanuel, Mbarara University Hospital needs AB- blood. While your medical clearance is currently pending, please consult your doctor and contact UBTS if you are able to donate.',
   'BLOOD_DEMAND', 'DONOR', FALSE, 'View Alert', '/blood-demand-alerts', NOW() - INTERVAL '5 days'),

  -- Camp notifications
  ((SELECT id FROM accounts_user WHERE email='patrick.okwir@gmail.com'),
   'Camp Near You: Gulu Northern Drive',
   'A blood donation camp is running in Gulu this month! Gulu Regional Referral Hospital — you are within 5 km. We would love to see you there.',
   'CAMP', 'DONOR', TRUE, 'View Camp', '/donor-dashboard', NOW() - INTERVAL '30 days'),

  ((SELECT id FROM accounts_user WHERE email='sarah.akello@gmail.com'),
   'Camp Near You: Gulu Northern Drive',
   'Hi Sarah! The Gulu Northern Drive camp is nearby. You are now eligible again after your March 2025 donation. Come donate and earn your next badge!',
   'CAMP', 'DONOR', FALSE, 'View Camp', '/donor-dashboard', NOW() - INTERVAL '14 days'),

  -- System notifications
  ((SELECT id FROM accounts_user WHERE email='ivan.mutebi@gmail.com'),
   'Check-In Confirmed at Mulago Hospital Drive',
   'Your blood donation on 2024-09-20 at Mulago Hospital Drive has been recorded. Thank you Ivan! Your next eligible donation date is 2024-12-19.',
   'SYSTEM', 'DONOR', TRUE, 'View Dashboard', '/donor-dashboard', NOW() - INTERVAL '8 months'),

  ((SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
   'Monthly Platform Summary — June 2026',
   '15 registered donors, 47 donation records, 3 active campaigns, 3 active blood demand alerts. O- and AB- stocks critically low — recommend urgent outreach.',
   'SYSTEM', 'ADMIN', FALSE, 'Go to Dashboard', '/admin-dashboard', NOW() - INTERVAL '1 day');


-- ─────────────────────────────────────────────────────────────────────────────
-- §12  SMS LOGS  (15 log entries — mix of statuses)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications_smslog
    (recipient_id, phone_number, message, status, error_message, response_data, created_at)
VALUES
  ((SELECT id FROM accounts_user WHERE email='david.kizito@gmail.com'),
   '0772100001',
   'Dear David, a blood donation camp is active near you at Kampala Central. Your O+ blood is needed. Reply YES to confirm attendance. — RedHope UBTS',
   'SENT', '', '{"sid": "SM001", "status": "delivered"}'::jsonb, NOW() - INTERVAL '14 days'),

  ((SELECT id FROM accounts_user WHERE email='robert.ssebagala@gmail.com'),
   '0752500005',
   'URGENT: Dear Robert, Mulago Hospital critically needs O- blood. As a universal donor, your help is vital. Please attend the nearest camp today. — RedHope UBTS',
   'SENT', '', '{"sid": "SM002", "status": "delivered"}'::jsonb, NOW() - INTERVAL '2 days'),

  ((SELECT id FROM accounts_user WHERE email='patrick.okwir@gmail.com'),
   '0785700007',
   'Dear Patrick, the Gulu Northern Drive is running this month. You last donated in Oct 2024 — you are eligible again! — RedHope UBTS',
   'SENT', '', '{"sid": "SM003", "status": "delivered"}'::jsonb, NOW() - INTERVAL '25 days'),

  ((SELECT id FROM accounts_user WHERE email='moses.ssempijja@gmail.com'),
   '0756900009',
   'Congratulations Moses! You have earned the Regular Donor badge. Come celebrate with another donation at Mbale Eastern Drive. — RedHope UBTS',
   'SENT', '', '{"sid": "SM004", "status": "delivered"}'::jsonb, NOW() - INTERVAL '45 days'),

  ((SELECT id FROM accounts_user WHERE email='james.ssemakula@gmail.com'),
   '0755300003',
   'Dear James, it has been 19 months since your last donation. A camp near Mukono is active — your B+ blood is needed. — RedHope UBTS',
   'SENT', '', '{"sid": "SM005", "status": "delivered"}'::jsonb, NOW() - INTERVAL '10 days'),

  ((SELECT id FROM accounts_user WHERE email='irene.nakiganda@gmail.com'),
   '0782210012',
   'Dear Irene, thank you for donating at Kampala Central last November! Your next eligible date is February 2025. We look forward to seeing you again. — RedHope UBTS',
   'SENT', '', '{"sid": "SM006", "status": "delivered"}'::jsonb, NOW() - INTERVAL '60 days'),

  ((SELECT id FROM accounts_user WHERE email='peter.kyambadde@gmail.com'),
   '0784510015',
   'Dear Peter, the RedHope platform has you listed as an eligible O+ donor. Kampala Central Blood Drive is ongoing — can we count on you? — RedHope UBTS',
   'SENT', '', '{"sid": "SM007", "status": "delivered"}'::jsonb, NOW() - INTERVAL '12 days'),

  ((SELECT id FROM accounts_user WHERE email='sarah.akello@gmail.com'),
   '0779800008',
   'Dear Sarah, Gulu Northern Drive is nearby and you are eligible to donate again. Please come and help save lives this month! — RedHope UBTS',
   'SENT', '', '{"sid": "SM008", "status": "delivered"}'::jsonb, NOW() - INTERVAL '14 days'),

  ((SELECT id FROM accounts_user WHERE email='diana.nabirye@gmail.com'),
   '0771010010',
   'Hi Diana! It has been over a year since your first donation. You are eligible again. Join us at Kampala Central Blood Drive this month! — RedHope UBTS',
   'SENT', '', '{"sid": "SM009", "status": "delivered"}'::jsonb, NOW() - INTERVAL '5 days'),

  ((SELECT id FROM accounts_user WHERE email='flavia.namukasa@gmail.com'),
   '0703600006',
   'Dear Flavia, A- blood is rare and always in high demand. Entebbe Lakeside Drive is active — we would love your help! — RedHope UBTS',
   'SENT', '', '{"sid": "SM010", "status": "delivered"}'::jsonb, NOW() - INTERVAL '8 days'),

  ((SELECT id FROM accounts_user WHERE email='grace.nakato@gmail.com'),
   '0776400004',
   'Dear Grace, your haemoglobin level was below the minimum at last screening. Eat more iron-rich foods and return for re-screening in 3 months. We look forward to welcoming you! — RedHope UBTS',
   'SENT', '', '{"sid": "SM011", "status": "delivered"}'::jsonb, NOW() - INTERVAL '30 days'),

  ((SELECT id FROM accounts_user WHERE email='rose.akello@gmail.com'),
   '0703410014',
   'Hi Rose! Your account is set up but you have not yet donated. The Gulu Northern Drive is near you — make your first donation today! — RedHope UBTS',
   'SENT', '', '{"sid": "SM012", "status": "delivered"}'::jsonb, NOW() - INTERVAL '7 days'),

  ((SELECT id FROM accounts_user WHERE email='mary.nakazibwe@gmail.com'),
   '0782200002',
   'Dear Mary, it has been 17 months since your last donation at Entebbe! You are eligible and the Entebbe Lakeside Drive is active. Please come donate. — RedHope UBTS',
   'SENT', '', '{"sid": "SM013", "status": "delivered"}'::jsonb, NOW() - INTERVAL '9 days'),

  -- A failed SMS (wrong number format)
  (NULL, '0700XXXXXX',
   'Test message — failed delivery due to invalid number format.',
   'FAILED', 'Invalid phone number format — could not connect to SMS gateway.', NULL,
   NOW() - INTERVAL '20 days'),

  -- A skipped SMS (SMS disabled at the time)
  ((SELECT id FROM accounts_user WHERE email='ivan.mutebi@gmail.com'),
   '0775310013',
   'Dear Ivan, thank you for your recent donation! Your next eligible date is 19 Dec 2024. We hope to see you again soon. — RedHope UBTS',
   'SKIPPED', 'SMS delivery is currently disabled by the administrator.', NULL,
   NOW() - INTERVAL '9 months');


-- ─────────────────────────────────────────────────────────────────────────────
-- §13  SMS & WHATSAPP SETTINGS  (singleton rows — id=1)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications_smssetting (id, sms_enabled, updated_by_id, updated_at)
VALUES (1, FALSE, (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'), NOW())
ON CONFLICT (id) DO UPDATE SET
    sms_enabled   = FALSE,
    updated_by_id = (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
    updated_at    = NOW();

INSERT INTO notifications_whatsappsetting (id, whatsapp_enabled, updated_by_id, updated_at)
VALUES (1, FALSE, (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'), NOW())
ON CONFLICT (id) DO UPDATE SET
    whatsapp_enabled = FALSE,
    updated_by_id    = (SELECT id FROM accounts_user WHERE email='admin@redhope.ug'),
    updated_at       = NOW();


-- ─────────────────────────────────────────────────────────────────────────────
-- §14  WHATSAPP LOGS  (6 sample entries)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications_whatsapplog
    (recipient_id, phone_number, message, template_name, message_type,
     status, error_message, response_data, wa_message_id, created_at)
VALUES
  ((SELECT id FROM accounts_user WHERE email='robert.ssebagala@gmail.com'),
   '0752500005',
   'URGENT: Hi Robert, Mulago Hospital needs O- blood. As a universal donor your help is critical. Please attend your nearest camp. — RedHope UBTS',
   'blood_demand_alert', 'text', 'SENT', '',
   '{"messaging_product": "whatsapp", "messages": [{"id": "WA001"}]}'::jsonb,
   'WA001', NOW() - INTERVAL '2 days'),

  ((SELECT id FROM accounts_user WHERE email='flavia.namukasa@gmail.com'),
   '0703600006',
   'Hi Flavia! A- blood is rare and needed. Entebbe Lakeside Drive is open this week. Come donate! — RedHope UBTS',
   'retention_reminder', 'text', 'SENT', '',
   '{"messaging_product": "whatsapp", "messages": [{"id": "WA002"}]}'::jsonb,
   'WA002', NOW() - INTERVAL '8 days'),

  ((SELECT id FROM accounts_user WHERE email='mary.nakazibwe@gmail.com'),
   '0782200002',
   'Dear Mary, the Entebbe Lakeside Drive is active and you are eligible to donate again. See you there! — RedHope UBTS',
   'camp_notification', 'text', 'SENT', '',
   '{"messaging_product": "whatsapp", "messages": [{"id": "WA003"}]}'::jsonb,
   'WA003', NOW() - INTERVAL '9 days'),

  ((SELECT id FROM accounts_user WHERE email='sarah.akello@gmail.com'),
   '0779800008',
   'Hi Sarah! Gulu Northern Drive is near you. You are eligible to donate O+ blood again. Your help matters! — RedHope UBTS',
   'camp_notification', 'text', 'SENT', '',
   '{"messaging_product": "whatsapp", "messages": [{"id": "WA004"}]}'::jsonb,
   'WA004', NOW() - INTERVAL '14 days'),

  -- Failed WhatsApp (WhatsApp account not registered)
  ((SELECT id FROM accounts_user WHERE email='james.ssemakula@gmail.com'),
   '0755300003',
   'Dear James, your B+ blood is needed. Please attend your nearest camp. — RedHope UBTS',
   'retention_reminder', 'text', 'FAILED',
   'User is not registered on WhatsApp Business API.',
   NULL, '', NOW() - INTERVAL '10 days'),

  -- Skipped (WhatsApp disabled)
  ((SELECT id FROM accounts_user WHERE email='diana.nabirye@gmail.com'),
   '0771010010',
   'Hi Diana! Come make your second donation at Kampala Central Blood Drive this month.',
   'retention_reminder', 'text', 'SKIPPED',
   'WhatsApp notifications are currently disabled.', NULL, '',
   NOW() - INTERVAL '5 days');


-- ─────────────────────────────────────────────────────────────────────────────
-- §15  VERIFY ROW COUNTS  (run after commit to confirm seed success)
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT 'accounts_user'                  AS tbl, COUNT(*) FROM accounts_user
-- UNION ALL SELECT 'donors_donorprofile', COUNT(*) FROM donors_donorprofile
-- UNION ALL SELECT 'donors_donormedicalrecord', COUNT(*) FROM donors_donormedicalrecord
-- UNION ALL SELECT 'donors_donationrecord', COUNT(*) FROM donors_donationrecord
-- UNION ALL SELECT 'donors_donorbadge', COUNT(*) FROM donors_donorbadge
-- UNION ALL SELECT 'donors_eligibilityassessment', COUNT(*) FROM donors_eligibilityassessment
-- UNION ALL SELECT 'donors_availabilityassessment', COUNT(*) FROM donors_availabilityassessment
-- UNION ALL SELECT 'camps_donationcamp', COUNT(*) FROM camps_donationcamp
-- UNION ALL SELECT 'campaigns_campaignperformance', COUNT(*) FROM campaigns_campaignperformance
-- UNION ALL SELECT 'campaigns_campaignresponse', COUNT(*) FROM campaigns_campaignresponse
-- UNION ALL SELECT 'notifications_notification', COUNT(*) FROM notifications_notification
-- UNION ALL SELECT 'notifications_smslog', COUNT(*) FROM notifications_smslog
-- UNION ALL SELECT 'notifications_blooddemandalert', COUNT(*) FROM notifications_blooddemandalert
-- UNION ALL SELECT 'notifications_whatsapplog', COUNT(*) FROM notifications_whatsapplog;

COMMIT;
