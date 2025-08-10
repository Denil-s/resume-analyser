import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL
});

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/analyze_resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
