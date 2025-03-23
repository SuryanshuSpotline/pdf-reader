import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ADOBE_CLIENT_ID = os.getenv("ADOBE_CLIENT_ID")
ADOBE_CLIENT_SECRET = os.getenv("ADOBE_CLIENT_SECRET")
ADOBE_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v2"

ADOBE_ACCESS_TOKEN = None

def get_adobe_access_token():
    global ADOBE_ACCESS_TOKEN
    try:
        data = {
            "client_id": ADOBE_CLIENT_ID,
            "client_secret": ADOBE_CLIENT_SECRET,
            "grant_type": "client_credentials",
            "scope": "openid, AdobeID, DCAPI",
        }

        response = requests.post(ADOBE_TOKEN_URL, data=data)

        if response.status_code == 200:
            ADOBE_ACCESS_TOKEN = response.json().get("access_token")
            logger.info("Successfully obtained Adobe Access Token.")
        else:
            logger.error(f"Failed to get Adobe token: {response.text}")
            ADOBE_ACCESS_TOKEN = None

    except Exception as e:
        logger.error(f"Error fetching Adobe token: {str(e)}")
        ADOBE_ACCESS_TOKEN = None

get_adobe_access_token()

def get_token():
    if not ADOBE_ACCESS_TOKEN:
        get_adobe_access_token()
    return ADOBE_ACCESS_TOKEN