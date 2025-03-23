import os
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

SERVICE_ACCOUNT_FILE = "googleserviceaccountcreds.json"

SCOPES = ["https://www.googleapis.com/auth/drive.file"]

def upload_to_drive(file):
    try:
        creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build("drive", "v3", credentials=creds)
        file_metadata = {"name": file.filename}
        media = MediaIoBaseUpload(file, mimetype=file.content_type, resumable=True)
        file_drive = service.files().create(body=file_metadata, media_body=media, fields="id").execute()
        return file_drive.get("id")
    except Exception as e:
        print("Error uploading file:", str(e))
        return None