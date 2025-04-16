import React, { useState, useEffect } from "react";
import "./pdf-viewer.css";
import { FaInfoCircle, FaFileUpload } from "react-icons/fa";
import { uploadFile } from "./file-upload";
import { PDFDocument, PDFName, PDFDict } from "pdf-lib";

const PdfViewerComponent = () => {
  const [fileUrl, setFileUrl] = useState(localStorage.getItem("pdfUrl") || null);
  const [fileName, setFileName] = useState(localStorage.getItem("pdfName") || null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [fonts, setFonts] = useState([]);
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
      localStorage.setItem("pdfUrl", uploadedFile.url);
      localStorage.setItem("pdfName", uploadedFile.name);

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);
          const pdfDoc = await PDFDocument.load(typedArray);
          const fontsList = [];
          const fontSet = new Set();

          for (const page of pdfDoc.getPages()) {
            const resources = page.node.get(PDFName.of("Resources"));
            if (!(resources instanceof PDFDict)) continue;

            const fontsDict = resources.lookup(PDFName.of("Font"), PDFDict);
            if (!(fontsDict instanceof PDFDict)) continue;

            for (const [key, fontRef] of fontsDict.entries()) {
              const fontName = fontRef.lookupMaybe(PDFName.of("BaseFont"))?.name ?? "Unknown";
              const fontType = fontRef.lookupMaybe(PDFName.of("Subtype"))?.name ?? "Unknown";
              const descriptor = fontRef.lookupMaybe(PDFName.of("FontDescriptor"), PDFDict);
              let actualFont = "Unknown";
              let actualFontType = "Unknown";

              if (descriptor instanceof PDFDict) {
                actualFont = descriptor.lookupMaybe(PDFName.of("FontName"))?.name ?? "Unknown";
                actualFontType = descriptor.has(PDFName.of("FontFile2"))
                  ? "TrueType"
                  : descriptor.has(PDFName.of("FontFile3"))
                  ? "Type1 or CID"
                  : "Unknown";
              }

              const fontKey = `${fontName}-${actualFont}`;
              if (!fontSet.has(fontKey)) {
                fontSet.add(fontKey);
                fontsList.push({
                  fontName,
                  type: fontType,
                  actualFont,
                  actualFontType,
                });
              }
            }
          }

          setFonts(fontsList);
        } catch (error) {
          console.error("Error while extracting fonts:", error);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
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
                  {fileName && <p><strong>File Name:</strong> {fileName}</p>}
                </div>
              )}

              {activeTab === "fonts" && (
                <div>
                  {fonts.length === 0 ? (
                    <p>No font information available.</p>
                  ) : (
                    fonts.map((font, index) => (
                      <div key={index} style={{ marginBottom: "1rem" }}>
                        <p><strong>Font Name:</strong> {font.fontName}</p>
                        <p><strong>Type:</strong> {font.type}</p>
                        <p><strong>Actual Font:</strong> {font.actualFont}</p>
                        <p><strong>Actual Font Type:</strong> {font.actualFontType}</p>
                        <hr />
                      </div>
                    ))
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