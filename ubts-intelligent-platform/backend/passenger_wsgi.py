import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
sys.path.insert(0, CURRENT_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()