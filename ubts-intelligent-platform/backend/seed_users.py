"""
RedHope / UBTS Platform — User Accounts Seed
Run with:  python manage.py shell < seed_users.py
Creates 1 admin + 100 donors (idempotent — skips existing emails).
Admin password  : Admin@UBTS2024
Donor password  : Donor@UBTS123
"""
from django.db import transaction
from accounts.models import User

ADMIN_PW = "Admin@UBTS2024"
DONOR_PW = "Donor@UBTS123"

# (email, username, full_name, role, is_staff, is_superuser)
USERS = [
    # ── Admin ────────────────────────────────────────────────────────────────
    ("admin@redhope.ug",                   "admin_ubts",             "UBTS Administrator",      "ADMIN", True,  True),

    # ── Original 15 donors ───────────────────────────────────────────────────
    ("david.kizito@gmail.com",             "david_kizito",           "David Kizito",            "DONOR", False, False),
    ("mary.nakazibwe@gmail.com",           "mary_nakazibwe",         "Mary Nakazibwe",          "DONOR", False, False),
    ("james.ssemakula@gmail.com",          "james_ssemakula",        "James Ssemakula",         "DONOR", False, False),
    ("grace.nakato@gmail.com",             "grace_nakato",           "Grace Nakato",            "DONOR", False, False),
    ("robert.ssebagala@gmail.com",         "robert_ssebagala",       "Robert Ssebagala",        "DONOR", False, False),
    ("flavia.namukasa@gmail.com",          "flavia_namukasa",        "Flavia Namukasa",         "DONOR", False, False),
    ("patrick.okwir@gmail.com",            "patrick_okwir",          "Patrick Okwir",           "DONOR", False, False),
    ("sarah.akello@gmail.com",             "sarah_akello",           "Sarah Akello",            "DONOR", False, False),
    ("moses.ssempijja@gmail.com",          "moses_ssempijja",        "Moses Ssempijja",         "DONOR", False, False),
    ("diana.nabirye@gmail.com",            "diana_nabirye",          "Diana Nabirye",           "DONOR", False, False),
    ("emmanuel.tumwesigye@gmail.com",      "emmanuel_tumwesigye",    "Emmanuel Tumwesigye",     "DONOR", False, False),
    ("irene.nakiganda@gmail.com",          "irene_nakiganda",        "Irene Nakiganda",         "DONOR", False, False),
    ("ivan.mutebi@gmail.com",              "ivan_mutebi",            "Ivan Mutebi",             "DONOR", False, False),
    ("rose.akello@gmail.com",              "rose_akello",            "Rose Akello",             "DONOR", False, False),
    ("peter.kyambadde@gmail.com",          "peter_kyambadde",        "Peter Kyambadde",         "DONOR", False, False),

    # ── New donors 16–20 : PLATINUM (20+ donations) ───────────────────────
    ("henry.katumba@gmail.com",            "henry_katumba",          "Henry Katumba",           "DONOR", False, False),
    ("juliet.nassali@gmail.com",           "juliet_nassali",         "Juliet Nassali",          "DONOR", False, False),
    ("charles.byamugisha@gmail.com",       "charles_byamugisha",     "Charles Byamugisha",      "DONOR", False, False),
    ("alice.nantongo@gmail.com",           "alice_nantongo",         "Alice Nantongo",          "DONOR", False, False),
    ("tom.oryem@gmail.com",                "tom_oryem",              "Tom Oryem",               "DONOR", False, False),

    # ── New donors 21–35 : SILVER (10–19 donations) ───────────────────────
    ("benard.ssekandi@gmail.com",          "benard_ssekandi",        "Benard Ssekandi",         "DONOR", False, False),
    ("felix.okello@gmail.com",             "felix_okello",           "Felix Okello",            "DONOR", False, False),
    ("herbert.ssali@gmail.com",            "herbert_ssali",          "Herbert Ssali",           "DONOR", False, False),
    ("paul.muteesa@gmail.com",             "paul_muteesa",           "Paul Muteesa",            "DONOR", False, False),
    ("richard.opio@gmail.com",             "richard_opio",           "Richard Opio",            "DONOR", False, False),
    ("frank.mugisha@gmail.com",            "frank_mugisha",          "Frank Mugisha",           "DONOR", False, False),
    ("phionah.nalwanga@gmail.com",         "phionah_nalwanga",       "Phionah Nalwanga",        "DONOR", False, False),
    ("joan.nansubuga@gmail.com",           "joan_nansubuga",         "Joan Nansubuga",          "DONOR", False, False),
    ("joyce.atim@gmail.com",               "joyce_atim",             "Joyce Atim",              "DONOR", False, False),
    ("denis.lwanga@gmail.com",             "denis_lwanga",           "Denis Lwanga",            "DONOR", False, False),
    ("alice.tumusiime@gmail.com",          "alice_tumusiime",        "Alice Tumusiime",         "DONOR", False, False),
    ("prossy.namutebi@gmail.com",          "prossy_namutebi",        "Prossy Namutebi",         "DONOR", False, False),
    ("charity.nakalembe@gmail.com",        "charity_nakalembe",      "Charity Nakalembe",       "DONOR", False, False),
    ("fred.ssentamu@gmail.com",            "fred_ssentamu",          "Fred Ssentamu",           "DONOR", False, False),
    ("aisha.nakayiza@gmail.com",           "aisha_nakayiza",         "Aisha Nakayiza",          "DONOR", False, False),

    # ── New donors 36–55 : BRONZE (5–9 donations) ────────────────────────
    ("ronald.mugerwa@gmail.com",           "ronald_mugerwa",         "Ronald Mugerwa",          "DONOR", False, False),
    ("faridah.namazzi@gmail.com",          "faridah_namazzi",        "Faridah Namazzi",         "DONOR", False, False),
    ("george.ssempala@gmail.com",          "george_ssempala",        "George Ssempala",         "DONOR", False, False),
    ("brenda.nalwanga@gmail.com",          "brenda_nalwanga",        "Brenda Nalwanga",         "DONOR", False, False),
    ("joseph.sewanyana@gmail.com",         "joseph_sewanyana",       "Joseph Sewanyana",        "DONOR", False, False),
    ("mariam.nakakande@gmail.com",         "mariam_nakakande",       "Mariam Nakakande",        "DONOR", False, False),
    ("simon.odongo@gmail.com",             "simon_odongo",           "Simon Odongo",            "DONOR", False, False),
    ("christine.atim@gmail.com",           "christine_atim",         "Christine Atim",          "DONOR", False, False),
    ("judith.naturinda@gmail.com",         "judith_naturinda",       "Judith Naturinda",        "DONOR", False, False),
    ("peter.bahemuka@gmail.com",           "peter_bahemuka",         "Peter Bahemuka",          "DONOR", False, False),
    ("hope.kiconco@gmail.com",             "hope_kiconco",           "Hope Kiconco",            "DONOR", False, False),
    ("sam.byaruhanga@gmail.com",           "sam_byaruhanga",         "Sam Byaruhanga",          "DONOR", False, False),
    ("daniel.mukasa@gmail.com",            "daniel_mukasa",          "Daniel Mukasa",           "DONOR", False, False),
    ("stella.apolot@gmail.com",            "stella_apolot",          "Stella Apolot",           "DONOR", False, False),
    ("isaac.mbogo@gmail.com",              "isaac_mbogo",            "Isaac Mbogo",             "DONOR", False, False),
    ("esther.nagawa@gmail.com",            "esther_nagawa",          "Esther Nagawa",           "DONOR", False, False),
    ("geoffrey.mutumba@gmail.com",         "geoffrey_mutumba",       "Geoffrey Mutumba",        "DONOR", False, False),
    ("paul.ssenyonga@gmail.com",           "paul_ssenyonga",         "Paul Ssenyonga",          "DONOR", False, False),
    ("tony.omara@gmail.com",               "tony_omara",             "Tony Omara",              "DONOR", False, False),
    ("doreen.barungi@gmail.com",           "doreen_barungi",         "Doreen Barungi",          "DONOR", False, False),

    # ── New donors 56–75 : REGULAR CERT (3–4 donations) ─────────────────
    ("mark.begumya@gmail.com",             "mark_begumya",           "Mark Begumya",            "DONOR", False, False),
    ("jane.atukunda@gmail.com",            "jane_atukunda",          "Jane Atukunda",           "DONOR", False, False),
    ("agnes.nimusiima@gmail.com",          "agnes_nimusiima",        "Agnes Nimusiima",         "DONOR", False, False),
    ("evelyn.adong@gmail.com",             "evelyn_adong",           "Evelyn Adong",            "DONOR", False, False),
    ("harriet.auma@gmail.com",             "harriet_auma",           "Harriet Auma",            "DONOR", False, False),
    ("denis.ongom@gmail.com",              "denis_ongom",            "Denis Ongom",             "DONOR", False, False),
    ("brian.kato@gmail.com",               "brian_kato",             "Brian Kato",              "DONOR", False, False),
    ("agnes.nanteza@gmail.com",            "agnes_nanteza",          "Agnes Nanteza",           "DONOR", False, False),
    ("lydia.aber@gmail.com",               "lydia_aber",             "Lydia Aber",              "DONOR", False, False),
    ("alex.wamono@gmail.com",              "alex_wamono",            "Alex Wamono",             "DONOR", False, False),
    ("catherine.tusiime@gmail.com",        "catherine_tusiime",      "Catherine Tusiime",       "DONOR", False, False),
    ("patrick.emoru@gmail.com",            "patrick_emoru",          "Patrick Emoru",           "DONOR", False, False),
    ("george.okello@gmail.com",            "george_okello",          "George Okello",           "DONOR", False, False),
    ("mary.achan@gmail.com",               "mary_achan",             "Mary Achan",              "DONOR", False, False),
    ("doreen.tumwine@gmail.com",           "doreen_tumwine",         "Doreen Tumwine",          "DONOR", False, False),
    ("paul.byakagaba@gmail.com",           "paul_byakagaba",         "Paul Byakagaba",          "DONOR", False, False),
    ("susan.nakimuli@gmail.com",           "susan_nakimuli",         "Susan Nakimuli",          "DONOR", False, False),
    ("joseph.kankiriho@gmail.com",         "joseph_kankiriho",       "Joseph Kankiriho",        "DONOR", False, False),
    ("teddy.namuganza@gmail.com",          "teddy_namuganza",        "Teddy Namuganza",         "DONOR", False, False),
    ("alex.kizito@gmail.com",              "alex_kizito",            "Alex Kizito",             "DONOR", False, False),

    # ── New donors 76–90 : 1–2 donations ─────────────────────────────────
    ("ruth.ankunda@gmail.com",             "ruth_ankunda",           "Ruth Ankunda",            "DONOR", False, False),
    ("simon.opio@gmail.com",               "simon_opio",             "Simon Opio",              "DONOR", False, False),
    ("patricia.naluyima@gmail.com",        "patricia_naluyima",      "Patricia Naluyima",       "DONOR", False, False),
    ("james.otim@gmail.com",               "james_otim",             "James Otim",              "DONOR", False, False),
    ("doreen.ankwatsa@gmail.com",          "doreen_ankwatsa",        "Doreen Ankwatsa",         "DONOR", False, False),
    ("michael.ssewanyana@gmail.com",       "michael_ssewanyana",     "Michael Ssewanyana",      "DONOR", False, False),
    ("sarah.nambatya@gmail.com",           "sarah_nambatya",         "Sarah Nambatya",          "DONOR", False, False),
    ("robert.ocen@gmail.com",              "robert_ocen",            "Robert Ocen",             "DONOR", False, False),
    ("judith.nabbumba@gmail.com",          "judith_nabbumba",        "Judith Nabbumba",         "DONOR", False, False),
    ("david.ochieng@gmail.com",            "david_ochieng",          "David Ochieng",           "DONOR", False, False),
    ("pamela.nannozi@gmail.com",           "pamela_nannozi",         "Pamela Nannozi",          "DONOR", False, False),
    ("tom.okori@gmail.com",                "tom_okori",              "Tom Okori",               "DONOR", False, False),
    ("grace.birungi@gmail.com",            "grace_birungi",          "Grace Birungi",           "DONOR", False, False),
    ("kenneth.mugabi@gmail.com",           "kenneth_mugabi",         "Kenneth Mugabi",          "DONOR", False, False),
    ("winnie.nabaggala@gmail.com",         "winnie_nabaggala",       "Winnie Nabaggala",        "DONOR", False, False),

    # ── New donors 91–100 : 0 donations (new registrants) ────────────────
    ("samuel.muheirwe@gmail.com",          "samuel_muheirwe",        "Samuel Muheirwe",         "DONOR", False, False),
    ("joan.akite@gmail.com",               "joan_akite",             "Joan Akite",              "DONOR", False, False),
    ("richard.ssemwanga@gmail.com",        "richard_ssemwanga",      "Richard Ssemwanga",       "DONOR", False, False),
    ("penelope.nantume@gmail.com",         "penelope_nantume",       "Penelope Nantume",        "DONOR", False, False),
    ("andrew.ochola@gmail.com",            "andrew_ochola",          "Andrew Ochola",           "DONOR", False, False),
    ("vivian.kobusingye@gmail.com",        "vivian_kobusingye",      "Vivian Kobusingye",       "DONOR", False, False),
    ("joshua.okalang@gmail.com",           "joshua_okalang",         "Joshua Okalang",          "DONOR", False, False),
    ("aminah.nabukeera@gmail.com",         "aminah_nabukeera",       "Aminah Nabukeera",        "DONOR", False, False),
    ("martin.ssekitoleko@gmail.com",       "martin_ssekitoleko",     "Martin Ssekitoleko",      "DONOR", False, False),
    ("nancy.amuron@gmail.com",             "nancy_amuron",           "Nancy Amuron",            "DONOR", False, False),
]

with transaction.atomic():
    created = skipped = 0
    for email, username, full_name, role, is_staff, is_superuser in USERS:
        if User.objects.filter(email=email).exists():
            skipped += 1
            continue
        u = User(
            email=email, username=username, full_name=full_name,
            role=role, is_staff=is_staff, is_superuser=is_superuser,
        )
        u.set_password(ADMIN_PW if is_superuser else DONOR_PW)
        u.save()
        created += 1

print(f"\n✓ Users seeded — created: {created}, skipped (exists): {skipped}")
print(f"  Admin  : admin@redhope.ug  →  {ADMIN_PW}")
print(f"  Donors : <email>           →  {DONOR_PW}\n")
