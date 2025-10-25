import axios from 'axios';

const origin = window.location.origin; // e.g. "http://localhost:3000" or "https://dev.xptracker.com"
const url = new URL(origin);

// Check if it's localhost
const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

// For localhost, replace the port with 8050.
// For deployed (non-local) environments, just use the same origin.
const base = isLocalhost
  ? `${url.protocol}//${url.hostname}:8050`
  : `${url.protocol}//${url.hostname}/expense-service`;

const axiosInstance = axios.create({
  baseURL: base,
  withCredentials: true, // Important for session cookie
});

export default axiosInstance;
