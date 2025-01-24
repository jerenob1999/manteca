import axios from "axios";
import { env } from "../configs/environments";

export const axiosInstanceManteca = axios.create({
  baseURL: "https://sandbox.manteca.dev/crypto/v1",
  headers: {
    "md-api-key": env.API_KEY || "",
  },
});
