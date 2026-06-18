from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("campaigns", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="campaignperformance",
            name="contacted_donors",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="campaignperformance",
            name="converted_donors",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="campaignperformance",
            name="campaign_name",
            field=models.CharField(blank=True, max_length=200),
        ),
    ]
