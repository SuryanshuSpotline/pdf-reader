import React, { useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
          content: { location: { url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf" } },
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
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div id="adobe-dc-view" style={{ width: "100%", height: "100%" }}></div>
      <i
        className="fas fa-info-circle"
        style={{
          position: "absolute",
          top: "18vh",
          right: "0.8vw",
          fontSize: "1.7vw",
          color: "black",
          cursor: "pointer",
        }}
        title="This is an Info Icon"
        onClick={() => alert("This is the PDF viewer.")}
      ></i>
    </div>
  );
};

export default PdfViewerComponent;