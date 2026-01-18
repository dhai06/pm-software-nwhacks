"""
Configuration module
Loads environment variables
"""

import os
from dotenv import load_dotenv

# Load . env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in environment variables")

API_PORT = int(os.getenv("API_PORT", 8000))
API_HOST = os.getenv("API_HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if not all([DATABASE_URL]):
    raise RuntimeError("Missing required environment variables")