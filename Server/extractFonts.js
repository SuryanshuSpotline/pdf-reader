const {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    ExtractPDFParams,
    ExtractElementType,
    ExtractPDFJob,
    ExtractPDFResult
  } = require("@adobe/pdfservices-node-sdk");
  
  const fs = require("fs");
  const AdmZip = require("adm-zip");
  const path = require("path");
  const dotenv = require("dotenv");
  
  dotenv.config();
  
  async function extractFontsFromPDF(inputFilePath) {
    let readStream;
    try {
      const credentials = new ServicePrincipalCredentials({
        clientId: process.env.PDF_SERVICES_CLIENT_ID,
        clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET,
      });
  
      const pdfServices = new PDFServices({ credentials });
  
      readStream = fs.createReadStream(inputFilePath);
      const inputAsset = await pdfServices.upload({
        readStream,
        mimeType: MimeType.PDF,
      });
  
      const params = new ExtractPDFParams({
        elementsToExtract: [ExtractElementType.TEXT],
        includeFontInfo: true,
      });
  
      const job = new ExtractPDFJob({ inputAsset, params });
      const pollingURL = await pdfServices.submit({ job });
      const pdfServicesResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: ExtractPDFResult,
      });
  
      const resultAsset = pdfServicesResponse.result.resource;
      const streamAsset = await pdfServices.getContent({ asset: resultAsset });
      fs.mkdirSync("outputs", { recursive: true });
      const tempOutputPath = path.join("outputs", `${Date.now()}-Extract.zip`);
      const writeStream = fs.createWriteStream(tempOutputPath);
      streamAsset.readStream.pipe(writeStream);
  
      await new Promise((resolve) => writeStream.on("finish", resolve));
  
      const zip = new AdmZip(tempOutputPath);
      const jsonData = zip.readAsText("structuredData.json");
      const data = JSON.parse(jsonData);
  
      const fontMap = new Map();
  
      data.elements.forEach((element) => {
        if (element.Font) {
          const fontString = JSON.stringify(element.Font);
          fontMap.set(fontString, element.Font);
        }
      });
  
      fs.unlinkSync(tempOutputPath); // Clean up temp file
  
      return Array.from(fontMap.values());
    } catch (err) {
      console.error("Error during font extraction:", err);
      return [];
    } finally {
      readStream?.destroy();
    }
  }
  
  module.exports = extractFontsFromPDF;  