import os
import json
from google.oauth2.service_account import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

google_creds = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT"))
credentials = service_account.Credentials.from_service_account_info(google_creds)

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
permission = {"type": "anyone", "role": "writer"}

def upload_to_drive(file):
    try:
        service = build("drive", "v3", credentials=credentials)
        file_metadata = {"name": file.filename}
        media = MediaIoBaseUpload(file, mimetype=file.content_type, resumable=True)
        file_drive = service.files().create(body=file_metadata, media_body=media, fields="id").execute()
        file_id = file_drive.get("id")
        service.permissions().create(fileId=file_id, body=permission, fields="id").execute()
        return file_id
    except Exception as e:
        print("Error uploading file:", str(e))
        return None