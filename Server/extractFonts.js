import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { getAdobeAccessToken } from './getAdobeAccessToken.js';

dotenv.config();

export async function extractFontsFromPDF(pdfFilePath) {
  const accessToken = await getAdobeAccessToken();

  const form = new FormData();
  form.append('file', fs.createReadStream(pdfFilePath));
  form.append('options', JSON.stringify({
    elementsToExtract: ['text', 'fonts']
  }));

  const outputZipPath = path.join(path.dirname(pdfFilePath), 'result.zip');

  try {
    const response = await axios.post(
      'https://pdf-services.adobe.io/extractpdf',
      form,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID,
          ...form.getHeaders()
        },
        responseType: 'arraybuffer'
      }
    );

    fs.writeFileSync(outputZipPath, response.data);

    const zip = new AdmZip(outputZipPath);
    const jsonEntry = zip.getEntry('structuredData.json');
    const structuredData = JSON.parse(jsonEntry.getData().toString('utf8'));

    const fonts = new Set();
    structuredData.elements.forEach(el => {
      if (el.Font) {
        fonts.add(el.Font);
      }
    });

    return Array.from(fonts);
  } catch (error) {
    console.error('Error extracting fonts from PDF:', error.response?.data || error.message);
    throw error;
  }
}