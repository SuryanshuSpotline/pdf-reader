import React, { useEffect } from "react";

const PdfViewerComponent = () => {
  useEffect(() => {
    const adobeClientId = process.env.REACT_APP_ADOBE_CLIENT_ID;

    if (!adobeClientId) {
      console.error("❌ Adobe Client ID is missing! Check your .env file.");
      return;
    }

    const initializeAdobePDF = () => {
      console.log("✅ Adobe SDK Loaded Successfully!");

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

  return <div id="adobe-dc-view" style={{ width: "100vw", height: "100vh" }}></div>;
};

export default PdfViewerComponent;