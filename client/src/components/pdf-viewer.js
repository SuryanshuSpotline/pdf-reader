import React, { useState, useEffect } from "react";
import "./pdf-viewer.css";
import { FaInfoCircle, FaFileUpload } from "react-icons/fa";
import { uploadFile } from "./file-upload";

const PdfViewerComponent = () => {
  const [fileUrl, setFileUrl] = useState(localStorage.getItem("pdfUrl") || null);
  const [fileName, setFileName] = useState(localStorage.getItem("pdfName") || null);
  const [fontsData, setFontsData] = useState([]);
  const [documentProperties, setDocumentProperties] = useState({});
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
      setFontsData(uploadedFile.fonts || []);
      setDocumentProperties(uploadedFile.properties || {});
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
              <button className="close-button" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="tabs">
              <button onClick={() => setActiveTab("description")} className={activeTab === "description" ? "active" : ""}>Description</button>
              <button onClick={() => setActiveTab("fonts")} className={activeTab === "fonts" ? "active" : ""}>Fonts</button>
            </div>

            <div className="tab-content">
              {activeTab === "description" && (
                <div>
                  {fileName && <p><strong>File Name:</strong> {fileName}</p>}
                  {documentProperties && (
                    <div>
                      <p><strong>File Size:</strong> {documentProperties.fileSize}</p>
                      <p><strong>PDF Version:</strong> {documentProperties.pdfVersion}</p>
                      <p><strong>Page Count:</strong> {documentProperties.pageCount}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "fonts" && (
                <div className="font-list">
                  {fontsData.length === 0 ? (
                    <p>No font data available.</p>
                  ) : (
                    <div className="font-table-wrapper">
                        <table className="font-table">
                          <thead>
                            <tr>
                              <th>Font Name</th>
                              <th>Family Name</th>
                              <th>Embedded</th>
                              <th>Encoding</th>
                              <th>Font Type</th>
                              <th>Italic</th>
                              <th>Monospaced</th>
                              <th>Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fontsData.map((font, index) => (
                              <tr key={index}>
                                <td>{font.name}</td>
                                <td>{font.family_name}</td>
                                <td>{font.embedded ? "Yes" : "No"}</td>
                                <td>{font.encoding}</td>
                                <td>{font.font_type}</td>
                                <td>{font.italic ? "Yes" : "No"}</td>
                                <td>{font.monospaced ? "Yes" : "No"}</td>
                                <td>{font.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewerComponent;