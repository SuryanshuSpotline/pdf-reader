from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from upload import upload_to_drive


app = Flask(__name__)
CORS(app)

@app.route("/upload", methods=["POST"])

def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_id = upload_to_drive(file)
    if file_id:
        return jsonify({"message": "File uploaded successfully", "fileId": file_id})
    else:
        return jsonify({"error": "Upload failed"}), 500

if __name__ == "__main__":
    app.run(debug=True)