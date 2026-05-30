from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from donors.models import DonorProfile, DonorMedicalRecord
from camps.models import DonationCamp


class Command(BaseCommand):
    help = "Seed sample UBTS donor and camp data"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        admin_user, _ = User.objects.get_or_create(
            email="admin@ubts.test",
            defaults={
                "username": "admin",
                "full_name": "UBTS Admin",
                "role": "ADMIN",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("admin123")
        admin_user.save()

        donor_user, _ = User.objects.get_or_create(
            email="donor@ubts.test",
            defaults={
                "username": "donor",
                "full_name": "Sample Donor",
                "role": "DONOR",
            },
        )
        donor_user.set_password("donor123")
        donor_user.save()

        donor_profile, _ = DonorProfile.objects.get_or_create(
            user=donor_user,
            defaults={
                "phone_number": "0700000000",
                "blood_group": "O+",
                "date_of_birth": date(1998, 5, 20),
                "gender": "Male",
                "address": "Kampala",
                "latitude": 0.3476,
                "longitude": 32.5825,
            },
        )

        DonorMedicalRecord.objects.get_or_create(
            donor=donor_profile,
            defaults={
                "weight_kg": 70,
                "hemoglobin_level": 13.5,
                "has_recent_illness": False,
                "has_chronic_condition": False,
                "last_donation_date": date.today() - timedelta(days=120),
                "is_pregnant": False,
                "is_on_medication": False,
            },
        )

        DonationCamp.objects.get_or_create(
            name="Kampala Central Blood Drive",
            defaults={
                "description": "Central Kampala blood donation camp.",
                "region": "Central",
                "district": "Kampala",
                "venue": "City Square",
                "latitude": 0.3136,
                "longitude": 32.5811,
                "start_date": date.today(),
                "end_date": date.today() + timedelta(days=7),
                "contact_phone": "0800123456",
                "status": "ACTIVE",
            },
        )

        DonationCamp.objects.get_or_create(
            name="Makerere University Blood Donation Camp",
            defaults={
                "description": "Student and community blood donation camp.",
                "region": "Central",
                "district": "Kampala",
                "venue": "Makerere University",
                "latitude": 0.3335,
                "longitude": 32.5686,
                "start_date": date.today(),
                "end_date": date.today() + timedelta(days=5),
                "contact_phone": "0800654321",
                "status": "ACTIVE",
            },
        )

        self.stdout.write(
            self.style.SUCCESS("Sample UBTS data seeded successfully.")
        )