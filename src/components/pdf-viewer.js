import React, { useEffect } from "react";

const PdfViewerComponent = () => {
  useEffect(() => {
    const adobeClientId = process.env.REACT_APP_ADOBE_CLIENT_ID;

    if (window.AdobeDC) {
      const adobeDCView = new window.AdobeDC.View({
        clientId: adobeClientId,
        divId: "adobe-dc-view",
      });

      adobeDCView.previewFile(
        {
          content: {location: {url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf"}},
          metaData: {fileName: "Bodea Brochure.pdf"},
        },
        {}
      );
    }
  }, []);

  return (
    <div>
      <div id="adobe-dc-view"></div>
      <script src="https://documentcloud.adobe.com/view-sdk/viewer.js"></script>
    </div>
  );
};

export default PdfViewerComponent;