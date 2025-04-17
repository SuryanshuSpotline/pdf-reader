const {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  ExtractPDFParams,
  ExtractElementType,
  ExtractPDFJob,
  ExtractPDFResult,
  PDFPropertiesParams,
  PDFPropertiesJob,
  PDFPropertiesResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError
} = require("@adobe/pdfservices-node-sdk");

const fs = require("fs");
const AdmZip = require("adm-zip");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

async function extractPDFProperties(inputFilePath) {
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

    const extractParams = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT],
      includeFontInfo: true,
    });

    const extractJob = new ExtractPDFJob({ inputAsset, params: extractParams });
    const extractPollingURL = await pdfServices.submit({ job: extractJob });
    const extractResponse = await pdfServices.getJobResult({
      pollingURL: extractPollingURL,
      resultType: ExtractPDFResult,
    });

    const resultAsset = extractResponse.result.resource;
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

    fs.unlinkSync(tempOutputPath);

    const fonts = Array.from(fontMap.values());

    const propertiesParams = new PDFPropertiesParams({
      includePageLevelProperties: true,
    });

    const propertiesJob = new PDFPropertiesJob({ inputAsset, params: propertiesParams });
    const propertiesPollingURL = await pdfServices.submit({ job: propertiesJob });
    const propertiesResponse = await pdfServices.getJobResult({
      pollingURL: propertiesPollingURL,
      resultType: PDFPropertiesResult,
    });

    const pdfProperties = propertiesResponse.result.pdfProperties;

    const documentProperties = {
      fileSize: pdfProperties.document.fileSize,
      pdfVersion: pdfProperties.document.pdfVersion,
      pageCount: pdfProperties.document.pageCount,
    };

    return {
      fonts,
      properties: documentProperties,
    };
  } catch (err) {
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.log("Exception encountered while executing operation", err);
    } else {
      console.log("Exception encountered while executing operation", err);
    }

    return {
      fonts: [],
      properties: {},
    };
  } finally {
    readStream?.destroy();
  }
}

module.exports = extractPDFProperties;