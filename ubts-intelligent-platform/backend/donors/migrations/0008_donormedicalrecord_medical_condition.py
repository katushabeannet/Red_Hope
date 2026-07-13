from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("donors", "0007_donorprofile_whatsapp"),
    ]

    operations = [
        migrations.AddField(
            model_name="donormedicalrecord",
            name="medical_condition",
            field=models.CharField(blank=True, default="None", max_length=100),
        ),
    ]
