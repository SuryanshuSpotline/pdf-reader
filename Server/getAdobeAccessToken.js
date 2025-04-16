require('dotenv').config();
const axios = require('axios');

async function getAdobeAccessToken() {
  const tokenEndpoint = 'https://api.adobe.io/auth/oauth/v2/token';

  const data = new URLSearchParams({
    client_id: process.env.ADOBE_CLIENT_ID,
    client_secret: process.env.ADOBE_CLIENT_SECRET,
    grant_type: 'client_credentials',  // or 'authorization_code' if using OAuth 2.0 Authorization Code Flow
  });

  try {
    const response = await axios.post(tokenEndpoint, data);
    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining Adobe access token:', error);
    throw error;
  }
}

module.exports = { getAdobeAccessToken };