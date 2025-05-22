import axios from "axios";

const axiosbase = axios.create({
  baseURL: "http://localhost:4000", 
});

export default axiosbase;