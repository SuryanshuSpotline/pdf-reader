import React, { useState, useEffect } from "react";
import "./pdf-viewer.css";
import { FaInfoCircle, FaFileUpload } from "react-icons/fa";
import { uploadFile } from "./file-upload";

const PdfViewerComponent = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const adobeClientId = process.env.REACT_APP_ADOBE_CLIENT_ID;

  useEffect(() => {
    if (!adobeClientId) {
      console.error("Adobe Client ID is missing.");
      return;
    }

    const initializeAdobePDF = (pdfUrl) => {
      if (!pdfUrl) {
        console.warn("No file selected, skipping PDF rendering.");
        return;
      }

      console.log("Adobe SDK Loaded, Initializing Viewer...");

      const adobeDCView = new window.AdobeDC.View({
        clientId: adobeClientId,
        divId: "adobe-dc-view",
      });

      adobeDCView.previewFile(
        {
          content: { location: { url: pdfUrl } },
          metaData: { fileName: "Bodea Brochure.pdf" },
        },
        { embedMode: "FULL_WINDOW" }
      );
    };

    const checkAdobeSDK = setInterval(() => {
      if (window.AdobeDC) {
        clearInterval(checkAdobeSDK);
        if (fileUrl) {
          initializeAdobePDF(fileUrl);
        }
      }
    }, 500);

    return () => clearInterval(checkAdobeSDK);
  }, [fileUrl, adobeClientId]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    console.log("Uploading file...");
    const uploadedFileUrl = await uploadFile(selectedFile);

    if (uploadedFileUrl) {
      console.log("File uploaded successfully:", uploadedFileUrl);
      setFileUrl(uploadedFileUrl);
      localStorage.setItem("pdfUrl", uploadedFileUrl);
    } else {
      console.error("File upload failed.");
    }
  };

  return (
    <div className="pdf-container">
      <div id="adobe-dc-view"></div>
      <div className="info-icon" selenium-name="doc-info">
        <FaInfoCircle size={24} title="More Information" />
      </div>
      <label className="upload-icon" selenium-name="file-upload"><input type="file"accept="application/pdf" onChange={handleFileChange} style={{ display: "none" }}/>
        <FaFileUpload size={24} title="Upload Document" />
      </label>
    </div>
  );
};

export default PdfViewerComponent;