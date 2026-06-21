"""
RedHope / UBTS Platform — User Accounts Seed
Run with:  python manage.py shell < seed_users.py
Creates 1 admin + 15 donors (idempotent — skips existing emails).
Admin password  : Admin@UBTS2024
Donor password  : Donor@UBTS123
"""
from django.db import transaction
from accounts.models import User

ADMIN_PW = "Admin@UBTS2024"
DONOR_PW = "Donor@UBTS123"

# (email, username, full_name, role, is_staff, is_superuser)
USERS = [
    ("admin@redhope.ug",              "admin_ubts",          "UBTS Administrator",     "ADMIN", True,  True),
    ("david.kizito@gmail.com",        "david_kizito",        "David Kizito",           "DONOR", False, False),
    ("mary.nakazibwe@gmail.com",      "mary_nakazibwe",      "Mary Nakazibwe",         "DONOR", False, False),
    ("james.ssemakula@gmail.com",     "james_ssemakula",     "James Ssemakula",        "DONOR", False, False),
    ("grace.nakato@gmail.com",        "grace_nakato",        "Grace Nakato",           "DONOR", False, False),
    ("robert.ssebagala@gmail.com",    "robert_ssebagala",    "Robert Ssebagala",       "DONOR", False, False),
    ("flavia.namukasa@gmail.com",     "flavia_namukasa",     "Flavia Namukasa",        "DONOR", False, False),
    ("patrick.okwir@gmail.com",       "patrick_okwir",       "Patrick Okwir",          "DONOR", False, False),
    ("sarah.akello@gmail.com",        "sarah_akello",        "Sarah Akello",           "DONOR", False, False),
    ("moses.ssempijja@gmail.com",     "moses_ssempijja",     "Moses Ssempijja",        "DONOR", False, False),
    ("diana.nabirye@gmail.com",       "diana_nabirye",       "Diana Nabirye",          "DONOR", False, False),
    ("emmanuel.tumwesigye@gmail.com", "emmanuel_tumwesigye", "Emmanuel Tumwesigye",    "DONOR", False, False),
    ("irene.nakiganda@gmail.com",     "irene_nakiganda",     "Irene Nakiganda",        "DONOR", False, False),
    ("ivan.mutebi@gmail.com",         "ivan_mutebi",         "Ivan Mutebi",            "DONOR", False, False),
    ("rose.akello@gmail.com",         "rose_akello",         "Rose Akello",            "DONOR", False, False),
    ("peter.kyambadde@gmail.com",     "peter_kyambadde",     "Peter Kyambadde",        "DONOR", False, False),
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
print(f"  Admin   : admin@redhope.ug  →  {ADMIN_PW}")
print(f"  Donors  : <email>           →  {DONOR_PW}\n")
