from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from adobe_upload import upload_pdf_to_adobe

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Adobe PDF Upload API is Running!"})

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        logger.warning("No file provided in request")
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    upload_response = upload_pdf_to_adobe(file)

    if "error" in upload_response:
        logger.error("Upload failed: %s", upload_response["error"])
        return jsonify({"error": "Upload failed", "details": upload_response["error"]}), 500

    file_id = upload_response.get("assetID")
    file_name = file.filename
    
    if file_id:
        return jsonify({"message": "File uploaded successfully", "fileId": file_id, "fileName": file_name})
    else:
        logger.error("Upload failed")
        return jsonify({"error": "Upload failed"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)