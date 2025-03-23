import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("ADOBE_CLIENT_ID")
url = "https://pdf-services.adobe.io/assets"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def upload_pdf_to_adobe(file):
    try:
        headers = {"Authorization": f"Bearer {API_KEY}","x-api-key": API_KEY}
        files = {"file": file}
        response = requests.post(url, headers=headers, files=files)
        if response.status_code == 200:
            logger.info("PDF uploaded successfully to Adobe Document Cloud")
            file_id = response.json().get("assetID")
            file_name = file.filename
            return file_id, file_name
    except Exception as e:
        logger.error("Failed to upload PDF: %s", response.text)
        return None