from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
from .model_manager import ModelManager
from .parser import extract_text_from_file
from .utils import save_upload_file_tmp

app = FastAPI(title="Resume Analyzer API")

# Allow CORS from frontend port (dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_manager: ModelManager = None


JSON_STRUCTURE_PROMPT = """
Return the result strictly in the following JSON structure:

{
  "name": string,
  "similarity": number, 
  "score_pct": number,
  "matched_skills": [string],
  "sections": {
    "education": string,
    "projects": string,
    "certifications": string
  },
  "experience_years": number,
  "common_terms": [string],
  "text_preview": string,
  "eligible": string
}
"""


@app.on_event("startup")
async def startup_event():
    global model_manager
    model_name = os.environ.get("SBERT_MODEL", "all-MiniLM-L6-v2")
    model_manager = ModelManager(model_name=model_name)


@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), job_description: str = Form(None)):
    # Append schema instructions to job description
    final_job_description = (job_description or "") + "\n\n" + JSON_STRUCTURE_PROMPT

    # Save file temporarily
    tmp_path = save_upload_file_tmp(file)
    try:
        text = extract_text_from_file(tmp_path)
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

    result = model_manager.analyze(text, job_description)
    return {"ok": True, "result": result}


# For local run: `uvicorn app.main:app --reload --port 8000`