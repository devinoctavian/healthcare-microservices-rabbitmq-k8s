import axios from "axios";

const token = () => localStorage.getItem("token");

/* AUTH */
export const authAPI = axios.create({
  baseURL: "http://localhost:5001",
});

/* DOCTOR */
export const doctorAPI = axios.create({
  baseURL: "http://localhost:5002",
});

doctorAPI.interceptors.request.use((config) => {
  const t = token();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

/* PATIENT */
export const patientAPI = axios.create({
  baseURL: "http://localhost:5003",
});

patientAPI.interceptors.request.use((config) => {
  const t = token();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

/* QUEUE */
export const queueAPI = axios.create({
  baseURL: "http://localhost:5004",
});

queueAPI.interceptors.request.use((config) => {
  const t = token();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
