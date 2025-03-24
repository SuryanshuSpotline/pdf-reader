import logging
import requests
from adobe_auth import get_token
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ADOBE_UPLOAD_URL = "https://pdf-services-ue1.adobe.io/assets"
ADOBE_CLIENT_ID = os.getenv("ADOBE_CLIENT_ID")
ADOBE_CLIENT_SECRET = os.getenv("ADOBE_CLIENT_SECRET")

def get_presigned_url():
    access_token = get_token()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "x-api-key": ADOBE_CLIENT_ID,
    }
    
    body = {
        "mediaType": "application/pdf"
    }

    try:
        response = requests.post(ADOBE_UPLOAD_URL, headers=headers, json=body)

        if response.status_code == 200:
            response_data = response.json()
            asset_id = response_data.get("assetID")
            presigned_uri = response_data.get("uploadUri")
            logger.info(f"Asset ID: {asset_id}")
            logger.info(f"Pre-signed URI for upload: {presigned_uri}")
            return asset_id, presigned_uri
        else:
            logger.error(f"Error getting pre-signed URL: {response.text}")
            return None, None
    except Exception as e:
        logger.error(f"Exception while getting pre-signed URL: {str(e)}")
        return None, None

def upload_file_to_adobe(file, presigned_uri):
    try:
        headers = {
            "Content-Type": "application/pdf",
        }
        file_content = file.read()
        response = requests.put(presigned_uri, headers=headers, data=file_content)

        if response.status_code == 200:
            logger.info("File uploaded successfully!")
            return True
        else:
            logger.error(f"Error uploading file: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return False

def confirm_upload(asset_id):
    access_token = get_token()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "x-api-key": ADOBE_CLIENT_ID,
    }

    confirm_url = f"{ADOBE_UPLOAD_URL}/{asset_id}/metadata"
    try:
        response = requests.get(confirm_url, headers=headers)
        if response.status_code == 200:
            logger.info("Upload confirmed successfully!")
            return response.json()
        else:
            logger.error(f"Error confirming upload: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Exception while confirming upload: {str(e)}")
        return None

def upload_pdf_to_adobe(file):
    asset_id, presigned_uri = get_presigned_url()
    
    if not presigned_uri:
        return {"error": "Failed to get pre-signed URI for upload"}
    
    upload_success = upload_file_to_adobe(file, presigned_uri)
    if not upload_success:
        return {"error": "Failed to upload file"}
    
    # Confirm the upload to get the Asset ID
    confirmation_response = confirm_upload(asset_id)
    if confirmation_response:
        return {"message": "File uploaded and confirmed successfully", "assetID": asset_id, "confirmationResponse": confirmation_response}
    else:
        return {"error": "Failed to confirm upload"}