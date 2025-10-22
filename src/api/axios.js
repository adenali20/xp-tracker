import axios from 'axios';


const origin = window.location.origin; // e.g., "http://localhost:3000" or "http://dev.xptracker.com"
  const url = new URL(origin);

  // Check if it's localhost
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  // If localhost, drop the port (3000) and use just the protocol + hostname
  const base = isLocalhost
  ? `${url.protocol}//${url.hostname}`
  : origin;
  const BASE_URL = `${base}:8050`;
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for session cookie
});

export default axiosInstance;
