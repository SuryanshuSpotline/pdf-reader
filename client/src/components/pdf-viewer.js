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
          content: { location: { url: "https://sqa-automation-dev.s3.us-east-2.amazonaws.com/61e07b8b324c7eadd42a5a1c/170-report.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIQCCqJYUGnlKmCpuZrCXd0Q1AWpGJENllx4OUixq%2Bd9kTgIgXkrQ84HWUzPUsRzMf6FKDkRgYjhPK61SS2Aof7%2BhxoQq6wMI7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw4NTY2OTIzMDE3NzMiDD8sM6dF6RIPA%2BuuAiq%2FA2HdDoiZhc%2F%2FCZAopX2mBVOEdMJbsZAnorrOE%2Buv9OXoCfdrYWdycfsTMuzCtny5rKVWI%2FJZZ0qoVS8qBCCrrm67t2I4BUtDobBzLd%2FQcbwb8cTgVrhxfny9qNL%2Bsujwv91Jr%2BJGxoM5YoPoUz9U7EJS%2FJ92ILo4jXeCbVkCH0zNuwMDXEBtaiQQztjooyhAFnWHQ7V6qU4ZgUoaoSkXa1uElPGTKcI5fZ9T7W%2BGc8lWr920Z7GVDPSxecgXQIXhyKLf%2B6wGhYu9iRVZiHjEHVeoKhYoJzYFtlQA3cw2S%2BK8qC209VbMU%2F7RUkRRxkxj5xALZ1mQId04LYiEsNNw0hwBGD4YRNnonNlFK2lUxPnmECpGgWYswZj5qgjEHqpAHVBXysjVcn1uEUWajg5E%2F%2FbvebEp48AhyzrVPks4wTlpYBCy96eqjCWJ7ltNsgHQBUvdqSrdiO%2F0IfEmubfy4LnshBxOOpRnGsib%2F%2BGUZiRSrHCF248zsev8fpvyITw7y39oUUmebZf4ub%2F1V8BlxAGLI2i3IvYdr96jmRCjA7G2KrpXKhl6JCdNE%2FDGadI24N%2Bmnw2LL1TSZ0G8xC%2Bh6TCL04W%2FBjrkAsbTQSX1NNEOMgy%2BfEE4aWALwCgybvdYCDOFLzgFKRGN3o7%2FqcNoZtx0%2BXMLlz2m7EBgw92RdsWdqrVeXAeNvA%2FcYOjzctmlzrFSUdaTmnZifoNf%2BZDOsbbGEEtBorvqPq8ti5HIoqURTdRQU%2BxfPUAla4ZCp08BsqPdvlvDUqAYa%2B%2FcP%2B2Ff6TNdqCo7MbPjJgbRYuf7TgAbOgGpVHpf%2BeIIaCW%2FNmP0BO3Rwh%2Fa40y0l63SqVggxK3hUaC7lfvyNMer149NbTFY5kOWWpUgeXzN9LcnDQWOa5ehTEuCkw4CMzJ8%2FhP5VcmZtQ90aXk%2FZWi37Stl1EI40eB9Yr4K73X%2BXfF5wVA%2Fjaak4fe%2BY1kzJlA4FvDDYChhDu7Q%2FsoHc0jxGekZllpgsiA47qGmeLKmq7NU1P8BLe9TgeixP0pHvSKNbJIrQ2Q1wvbySUMm24B1w8PSGK%2F0CWdRfrdS0ErXOjc&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA4O5WXD7GRDKS2GEZ%2F20250324%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250324T142117Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=f97b351042e89d83e8d2c47d740259fd3c54923daf60e345e860d9deb92060e8" } },
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