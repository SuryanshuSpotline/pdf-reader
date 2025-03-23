import logging
import requests
from adobe_auth import get_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ADOBE_UPLOAD_URL = "https://pdf-services.adobe.io/assets"

def upload_file_to_adobe(file):
    access_token = get_token()
    
    if not access_token:
        return {"error": "Failed to authenticate with Adobe API"}, 500
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "x-api-key": "your-adobe-client-id",
        "Content-Type": "application/pdf",
    }
    file_name = file.filename
    files = {"file": (file_name, file.stream, "application/pdf")}

    try:
        response = requests.post(ADOBE_UPLOAD_URL, headers=headers, files=files)

        if response.status_code == 201:
            file_id = response.json().get("assetId")
            return file_id, file_name
        else:
            logger.error(f"Adobe API Error: {response.text}")
            return {"error": response.text}, response.status_code
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return {"error": str(e)}, 500