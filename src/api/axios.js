import axios from "axios";

// Centralized Axios instance
// All frontend -> backend API calls go through this single instance.
// baseURL is defined here and NOWHERE else.
const api = axios.create({
  baseURL: "http://localhost:5000/api/",
});

export default api;
