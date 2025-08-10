import React, { useState } from "react";
import { uploadResume } from "../api";

const ResumeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    try {
      const data = await uploadResume(file);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resume Analyzer</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit">Upload & Analyze</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Analysis Result:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
