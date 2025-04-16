import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export async function getAdobeAccessToken() {
  const tokenEndpoint = 'https://ims-na1.adobelogin.com/ims/token';

  const data = new URLSearchParams({
    client_id: process.env.ADOBE_CLIENT_ID,
    client_secret: process.env.ADOBE_CLIENT_SECRET,
    grant_type: 'client_credentials',  // Update this if you're using a different flow
  });

  try {
    const response = await axios.post(tokenEndpoint, data);
    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining Adobe access token:', error.response?.data || error.message);
    throw error;
  }
}