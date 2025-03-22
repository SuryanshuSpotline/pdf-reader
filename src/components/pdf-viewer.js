import React, { useEffect } from "react";

const PdfViewerComponent = () => {
    
  useEffect(() => {
    const adobeClientId = process.env.REACT_APP_ADOBE_CLIENT_ID;

    if (!adobeClientId) {
      console.error("❌ Adobe Client ID is missing! Check your .env file.");
      return;
    }

    const initializeAdobePDF = () => {
      if (window.AdobeDC) {
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
      } else {
        console.error("AdobeDC is undefined! The SDK did not load.");
      }
    };

    if (!window.AdobeDC) {
      console.log("🔄 Loading Adobe SDK...");
      const script = document.createElement("script");
      script.src = "https://documentcloud.adobe.com/view-sdk/viewer.js";
      script.async = true;
      script.onload = initializeAdobePDF;
      script.onerror = () => console.error("❌ Failed to load Adobe SDK!");
      document.body.appendChild(script);
    } else {
      initializeAdobePDF();
    }
  }, []);

  return <div id="adobe-dc-view" style={{ width: "100vw", height: "100vh" }}></div>;

};

export default PdfViewerComponent;