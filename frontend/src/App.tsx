import React, { useState } from "react";
import {
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import "./App.css";

interface ResumeResult {
  ok?: boolean;
  result?: {
    name?: string;
    similarity?: number;
    score_pct?: number;
    matched_skills?: string[];
    sections?: {
      education?: string;
      projects?: string;
      certifications?: string;
    };
    experience_years?: number;
    common_terms?: string[];
    text_preview?: string;
    eligible?: boolean;
  };
}

const App: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!resume || !jobDescription.trim()) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", resume);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error ${res.status}: ${txt}`);
      }

      const data: ResumeResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      alert("Error analyzing resume — check console for details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <div className="main-column">
        {/* Header */}
        <div className="header">
          <div>
            <div className="title">Resume Analyzer</div>
            <div className="subtitle">
              Upload resume, paste JD, and get instant analysis
            </div>
          </div>
          <div className="subtitle">Local / Dev</div>
        </div>

        {/* Upload Section */}
        <Paper className="upload-card" elevation={0}>
          <div className="upload-left">
            <div className="upload-drop">
              <UploadFileIcon sx={{ fontSize: 36 }} />
            </div>
          </div>

          <div className="upload-actions">
            <div className="hint">
              Upload one resume file (PDF, DOCX or TXT)
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                component="label"
                className="btn-primary"
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
              </Button>

              <Button
                className="btn-secondary"
                onClick={() => {
                  setResume(null);
                  setResult(null);
                }}
              >
                Reset
              </Button>

              {resume && <div className="file-name">{resume.name}</div>}
            </div>

            <div className="job-text">
              <TextField
                label="Job Description"
                multiline
                rows={5}
                fullWidth
                variant="outlined"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 14 }}>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        </Paper>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <CircularProgress />
          </div>
        )}

        {/* Results */}
        {result && result.ok && (
          <Paper className="result-card" style={{ padding: 20 }}>
            {/* Name + Experience */}
            <Typography variant="h5" fontWeight="bold">
              {result.result?.name ?? "N/A"}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Experience: {result.result?.experience_years ?? "N/A"} years
            </Typography>

            {/* Education Card */}
            <Card style={{ marginTop: 16, marginBottom: 16 }}>
              <CardContent>
                <Typography variant="h6">Education</Typography>
                <Typography>
                  {result.result?.sections?.education ?? "N/A"}
                </Typography>
              </CardContent>
            </Card>

            {/* Projects Card */}
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                <Typography variant="h6">Projects</Typography>
                <Typography>
                  {result.result?.sections?.projects ?? "N/A"}
                </Typography>
              </CardContent>
            </Card>

            {/* Skills as Buttons */}
            <Typography variant="h6" style={{ marginTop: 10 }}>
              Skills
            </Typography>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.result?.matched_skills?.length ? (
                result.result.matched_skills.map((s, i) => (
                  <Button
                    key={i}
                    variant="outlined"
                    size="small"
                    style={{ borderRadius: 20 }}
                  >
                    {s}
                  </Button>
                ))
              ) : (
                <Typography color="text.secondary">
                  No skills found
                </Typography>
              )}
            </div>

            {/* Eligible Status */}
            <Typography
              variant="h6"
              style={{
                marginTop: 20,
                color: result.result?.eligible ? "green" : "red",
              }}
            >
              Eligible:{" "}
              {result.result?.eligible
                ? "Yes"
                : result.result?.eligible === false
                ? "No"
                : "N/A"}
            </Typography>
          </Paper>
        )}
      </div>
    </div>
  );
};

export default App;
