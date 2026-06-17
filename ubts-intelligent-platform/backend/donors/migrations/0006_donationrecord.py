from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('donors', '0005_donorprofile_total_donations'),
    ]

    operations = [
        migrations.CreateModel(
            name='DonationRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('donation_date', models.DateField()),
                ('camp_name', models.CharField(blank=True, max_length=255)),
                ('notes', models.TextField(blank=True)),
                ('recorded_at', models.DateTimeField(auto_now_add=True)),
                ('donor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='donation_records', to='donors.donorprofile')),
            ],
        ),
    ]
