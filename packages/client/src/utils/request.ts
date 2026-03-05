import axios from "axios";
import type { AxiosRequestConfig } from "axios";
// To-do: 替换真实url
export const BASE_URL = "https://api.example.com";
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.request.use((config) => {
  return config;
});

request.interceptors.response.use(
  (response) => {
    const { data } = response.data;
    if (data.code !== 0 && data.message) {
    }
    return data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default async function makeRequest(
  url: string,
  options?: AxiosRequestConfig,
) {
  return (await request({ url, ...options })).data;
}
