import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export async function getAdobeAccessToken() {
  const tokenEndpoint = 'https://ims-na1.adobelogin.com/ims/token/v3';

  const data = new URLSearchParams({
    client_id: process.env.ADOBE_CLIENT_ID,
    client_secret: process.env.ADOBE_CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: 'openid,AdobeID,DCAPI'
  });

  try {
    const response = await axios.post(tokenEndpoint, data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining Adobe access token:', error.response?.data || error.message);
    throw error;
  }
}