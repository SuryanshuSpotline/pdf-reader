import dotenv from 'dotenv';
import axios from 'axios';
import PDFServicesSdk from '@adobe/pdfservices-node-sdk';
import fs from 'fs';
import path from 'path';
import { getAdobeAccessToken } from './getAdobeAccessToken.js';
import AdmZip from 'adm-zip';

dotenv.config();

async function extractFontsFromPDF(pdfFilePath) {
  const adobeAccessToken = await getAdobeAccessToken();

  const credentials = PDFServicesSdk.Credentials
    .serviceAccountCredentialsBuilder()
    .fromJSON({
      access_token: adobeAccessToken,
    })
    .build();

  const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
  const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew();

  const input = PDFServicesSdk.FileRef.createFromLocalFile(
    pdfFilePath,
    PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
  );
  extractPDFOperation.setInput(input);

  const options = new PDFServicesSdk.ExtractPDF.options.ExtractPDFOptions.Builder()
    .addElementsToExtract(
      PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT,
      PDFServicesSdk.ExtractPDF.options.ExtractElementType.FONT
    )
    .build();

  extractPDFOperation.setOptions(options);

  const result = await extractPDFOperation.execute(executionContext);
  const outputPath = path.join(path.dirname(pdfFilePath), 'result.zip');
  await result.saveAsFile(outputPath);

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

export default extractFontsFromPDF;