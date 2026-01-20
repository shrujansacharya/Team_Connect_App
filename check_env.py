from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path("backend")
load_dotenv(ROOT_DIR / ".env")

print(f"ADMIN_PASSWORD from env: '{os.environ.get('ADMIN_PASSWORD')}'")
