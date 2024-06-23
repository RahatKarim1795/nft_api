const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

// Fetch data from your server with authentication
const fetchServerData = async () => {
  try {
    const token = process.env.CPANEL_API_TOKEN;
    const baseURL = process.env.SERVER_BASE_URL;

    const imagesResponse = await axios.get(`${baseURL}/images`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const metadataResponse = await axios.get(`${baseURL}/metadata`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const images = imagesResponse.data;
    const metadata = metadataResponse.data;

    return { images, metadata };
  } catch (error) {
    console.error('Error fetching data from server:', error);
    throw new Error('Failed to fetch data from server');
  }
};

// Upload data to Crossmint
const uploadToCrossmint = async (files) => {
  try {
    const crossmintApiUrl = 'https://api.crossmint.io/upload';
    const apiKey = process.env.CROSSMINT_API_KEY;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file.url);

      const response = await axios.post(crossmintApiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      console.log('Uploaded to Crossmint:', response.data);
    }

    return 'Uploads to Crossmint successful';
  } catch (error) {
    console.error('Error uploading to Crossmint:', error);
    throw new Error('Failed to upload to Crossmint');
  }
};

router.get('/upload', async (req, res) => {
  try {
    const { images, metadata } = await fetchServerData();
    const uploadResult = await uploadToCrossmint([...images, ...metadata]);

    res.status(200).json({ message: 'Data fetched and uploaded to Crossmint successfully', uploadResult });
  } catch (error) {
    console.error('Error in API endpoint:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

module.exports = router;
