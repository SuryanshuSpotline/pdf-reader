import React, { useEffect } from "react";
import "./pdf-viewer.css";
import { FaInfoCircle } from "react-icons/fa";
import { FaFileUpload } from "react-icons/fa";

const PdfViewerComponent = () => {
  useEffect(() => {
    const adobeClientId = process.env.REACT_APP_ADOBE_CLIENT_ID;

    if (!adobeClientId) {
      console.error("Adobe Client ID is missing.");
      return;
    }

    const initializeAdobePDF = () => {
      console.log("Adobe SDK Loaded Successfully!");

      const adobeDCView = new window.AdobeDC.View({
        clientId: adobeClientId,
        divId: "adobe-dc-view",
      });

      adobeDCView.previewFile(
        {
          content: { location: { url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" } },
          metaData: { fileName: "Bodea Brochure.pdf" },
        },
        { embedMode: "FULL_WINDOW" }
      );
    };

    const checkAdobeSDK = setInterval(() => {
      if (window.AdobeDC) {
        clearInterval(checkAdobeSDK);
        initializeAdobePDF();
      }
    }, 500);

    return () => clearInterval(checkAdobeSDK);
  }, []);

  return (
    <div className="pdf-container">
      <div id="adobe-dc-view"></div>
      <div className="info-icon" selenium-name="doc-info">
        <FaInfoCircle size={24} title="More Information" />
      </div>
      <div className="upload-icon" selenium-name="file-upload">
        <FaFileUpload size={24} title="Document Upload" />
      </div>
    </div>
  );
};

export default PdfViewerComponent;