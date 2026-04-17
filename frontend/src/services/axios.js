import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // ye backend ke sath match hona chahiye
});

export default API;
