import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL
});

export const uploadResume = async (file: File, jobDescription: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription || ""); // Append empty string if not provided

  const res = await API.post("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
