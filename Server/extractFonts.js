require('dotenv').config();
const axios = require('axios');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const fs = require('fs');
const path = require('path');
const { getAdobeAccessToken } = require('./getAdobeAccessToken');

async function extractFontsFromPDF(pdfFilePath) {
  // Get the Adobe Access Token (OAuth)
  const adobeAccessToken = await getAdobeAccessToken();

  // Adobe PDF Services SDK credentials using OAuth token
  const credentials = PDFServicesSdk.Credentials
    .serviceAccountCredentialsBuilder()
    .fromJSON({
      access_token: adobeAccessToken,
    })
    .build();

  const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
  const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew();

  const input = PDFServicesSdk.FileRef.createFromLocalFile(pdfFilePath, PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf);
  extractPDFOperation.setInput(input);

  const options = new PDFServicesSdk.ExtractPDF.options.ExtractPDFOptions.Builder()
    .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT, PDFServicesSdk.ExtractPDF.options.ExtractElementType.FONT)
    .build();

  extractPDFOperation.setOptions(options);

  const result = await extractPDFOperation.execute(executionContext);
  const outputPath = path.join(__dirname, 'output', 'result.zip');

  await result.saveAsFile(outputPath);

  // Unzip and parse fonts
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(outputPath);
  const jsonEntry = zip.getEntry('structuredData.json');
  const structuredData = JSON.parse(jsonEntry.getData().toString('utf8'));

  const fonts = new Set();
  structuredData.elements.forEach(el => {
    if (el.Font) {
      fonts.add(el.Font);
    }
  });

  return Array.from(fonts);
}

module.exports = { extractFontsFromPDF };