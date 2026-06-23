from pathlib import Path
from django.conf import settings
from django.db import connection

sql_path = Path(settings.BASE_DIR) / "seed_data.sql"

if not sql_path.exists():
    print("seed_data.sql not found. Skipping.")
else:
    sql = sql_path.read_text(encoding="utf-8")
    with connection.cursor() as cursor:
        cursor.execute(sql)
    print("✓ SQL seed data executed successfully.")