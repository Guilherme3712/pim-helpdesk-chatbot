import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // onde seu back está rodando
});

export default api;
