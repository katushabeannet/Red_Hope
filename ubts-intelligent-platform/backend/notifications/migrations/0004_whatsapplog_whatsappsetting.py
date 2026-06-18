import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0003_smslog_smssetting"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="WhatsAppLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("phone_number", models.CharField(max_length=30)),
                ("message", models.TextField()),
                ("template_name", models.CharField(blank=True, max_length=100)),
                ("message_type", models.CharField(default="text", max_length=20)),
                ("status", models.CharField(
                    choices=[("SENT", "Sent"), ("FAILED", "Failed"), ("SKIPPED", "Skipped")],
                    default="SKIPPED",
                    max_length=10,
                )),
                ("error_message", models.TextField(blank=True)),
                ("response_data", models.JSONField(blank=True, null=True)),
                ("wa_message_id", models.CharField(blank=True, max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("recipient", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="whatsapp_logs",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="WhatsAppSetting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("whatsapp_enabled", models.BooleanField(default=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("updated_by", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={"verbose_name": "WhatsApp Setting"},
        ),
    ]
