from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("donors", "0006_donationrecord"),
    ]

    operations = [
        migrations.AddField(
            model_name="donorprofile",
            name="whatsapp_number",
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name="donorprofile",
            name="whatsapp_consent",
            field=models.BooleanField(default=False),
        ),
    ]
