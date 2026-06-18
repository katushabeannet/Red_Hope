import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("campaigns", "0002_campaignperformance_extra_fields"),
        ("donors", "0006_donationrecord"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CampaignResponse",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(
                    choices=[
                        ("CONTACTED", "Contacted"),
                        ("RESPONDED", "Responded"),
                        ("DONATED", "Donated"),
                        ("NOT_INTERESTED", "Not Interested"),
                    ],
                    default="CONTACTED",
                    max_length=20,
                )),
                ("response_date", models.DateField(blank=True, null=True)),
                ("outcome", models.TextField(blank=True)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("campaign", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="responses",
                    to="campaigns.campaignperformance",
                )),
                ("donor", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="campaign_responses",
                    to="donors.donorprofile",
                )),
                ("recorded_by", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="recorded_campaign_responses",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={"ordering": ["-updated_at"], "unique_together": {("campaign", "donor")}},
        ),
    ]
