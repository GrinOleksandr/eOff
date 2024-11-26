import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

// Create a custom Axios instance with an httpsAgent
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const axiosInstance: AxiosInstance = axios.create({
  httpsAgent,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
