
# Resume Analyzer Project Setup Guide

## Backend (Python + FastAPI)

1. **Install dependencies**
    pip install -r requirements.txt

2. **Activate virtual environment**
    - On Windows (PowerShell):
        .venv\Scripts\activate
    - On Mac/Linux:
        source .venv/bin/activate

3. **Run FastAPI server**
    uvicorn app.main:app --reload --port 8000


## Frontend (React + Vite + TypeScript)

1. **Install dependencies**
    npm install

2. **Run development server**
    npm run dev


## Recommended Folder Structure
project-root/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── ...
│   ├── requirements.txt
│   ├── .venv/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│
└── README.txt   # This setup guide

## Notes
- Make sure the backend runs on **http://127.0.0.1:8000**
- Update the `baseURL` in frontend's `api.ts` to point to your backend URL if changed.
- If CORS issues occur, enable CORS in `main.py` using FastAPI's CORSMiddleware.

