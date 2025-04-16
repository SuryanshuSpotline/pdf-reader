import React, { useState, useEffect } from "react";
import "./pdf-viewer.css";
import { FaInfoCircle, FaFileUpload } from "react-icons/fa";
import { uploadFile } from "./file-upload";

const PdfViewerComponent = () => {
  const [fileUrl, setFileUrl] = useState(localStorage.getItem("pdfUrl") || null);
  const [fileName, setFileName] = useState(localStorage.getItem("pdfName") || null);
  const [fonts, setFonts] = useState([]); // Store fonts data
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
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
          metaData: { fileName: fileName || "Uploaded Document.pdf" },
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
  }, [fileUrl, fileName, adobeClientId]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    console.log("Uploading file...");
    const uploadedFile = await uploadFile(selectedFile);

    if (uploadedFile) {
      console.log("File uploaded successfully:", uploadedFile.url);
      setFileUrl(uploadedFile.url);
      setFileName(uploadedFile.name);
      setFonts(uploadedFile.fonts || []); // Store fonts data
      localStorage.setItem("pdfUrl", uploadedFile.url);
      localStorage.setItem("pdfName", uploadedFile.name);
    } else {
      console.error("File upload failed.");
    }
  };

  return (
    <div className="pdf-container">
      <div id="adobe-dc-view"></div>

      <div
        className="info-icon"
        selenium-name="doc-info"
        onClick={() => setShowModal(true)}
        style={{ cursor: "pointer" }}
      >
        <FaInfoCircle size={24} title="More Information" />
      </div>

      <label className="upload-icon" selenium-name="file-upload">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <FaFileUpload size={24} title="Upload Document" />
      </label>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Document Information</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="tabs">
              <button onClick={() => setActiveTab("description")} className={activeTab === "description" ? "active" : ""}>Description</button>
              <button onClick={() => setActiveTab("fonts")} className={activeTab === "fonts" ? "active" : ""}>Fonts</button>
              <button onClick={() => setActiveTab("info")} className={activeTab === "info" ? "active" : ""}>Info</button>
            </div>

            <div className="tab-content">
              {activeTab === "description" && (
                <div>
                  <p>This is the description of the uploaded PDF.</p>
                  {fileName && <p><strong>File Name:</strong> {fileName}</p>}
                </div>
              )}
              {activeTab === "fonts" && (
                <div>
                  {fonts.length > 0 ? (
                    <ul>
                      {fonts.map((font, index) => (
                        <li key={index}>{font.name}</li> // Assuming fonts have a 'name' property
                      ))}
                    </ul>
                  ) : (
                    <p>No fonts found for this document.</p>
                  )}
                </div>
              )}
              {activeTab === "info" && (
                <div><p>Additional metadata or document info goes here.</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewerComponent;