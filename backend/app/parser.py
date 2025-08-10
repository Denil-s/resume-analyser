import re
import json
from typing import Dict, List

# load skills list from skills.json
from pathlib import Path
SKILLS_PATH = Path(__file__).parent / "skills.json"
with open(SKILLS_PATH, "r", encoding="utf8") as f:
    SKILL_LIST = json.load(f)


def extract_text_from_file(path: str) -> str:
    """Try pdf -> docx -> txt. Returns plain text.
    Keep it simple and deterministic for this example.
    """
    path = str(path)
    if path.lower().endswith(".pdf"):
        try:
            import pdfplumber
            texts = []
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    texts.append(page.extract_text() or "")
            return "\n\n".join(texts)
        except Exception:
            return ""
    if path.lower().endswith(".docx"):
        try:
            import docx2txt
            return docx2txt.process(path) or ""
        except Exception:
            return ""
    # fallback to plain text
    try:
        with open(path, "r", encoding="utf8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""


def extract_skills(text: str, top_k: int = 25) -> List[str]:
    """Simple keyword matching against SKILL_LIST. Case-insensitive.
    Returns list sorted by first occurrence.
    """
    t = text.lower()
    found = []
    # use word boundaries so 'c' doesn't match 'scala'
    for skill in SKILL_LIST:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, t):
            found.append(skill)
    return found[:top_k]


def extract_sections(text: str) -> Dict[str, str]:
    """Heuristic headings detection. Returns mapping heading -> block text.
    We split text by lines and find common section headings.
    """
    headings = ["summary", "objective", "experience", "work experience", "education", "skills", "projects", "certifications", "achievements"]
    lines = [l.rstrip() for l in text.splitlines()]
    # find indices of headings
    idxs = []
    for i, ln in enumerate(lines):
        low = ln.strip().lower()
        for h in headings:
            if low.startswith(h) or low == h:
                idxs.append((i, h))
    idxs = sorted(idxs)
    result = {}
    for n, (i, h) in enumerate(idxs):
        start = i + 1
        end = idxs[n + 1][0] if n + 1 < len(idxs) else len(lines)
        block = "\n".join(lines[start:end]).strip()
        result[h] = block
    return result


def estimate_experience_years(text: str) -> float:
    """Very simple heuristics:
    - check patterns like "5 years", "5+ years"
    - check date ranges like 2017-2020 and compute oldest year
    Returns a rough years number (float) or 0.
    """
    years = 0.0
    # pattern like '5 years'
    m = re.findall(r"(\d+)\s*\+?\s*years", text, flags=re.I)
    if m:
        nums = [int(x) for x in m]
        years = max(years, max(nums))
    # pattern like '2016-2019' or '2016 – 2019'
    year_ranges = re.findall(r"(20\d{2})\s*[\-–]\s*(20\d{2})", text)
    if year_ranges:
        starts = [int(s) for s, e in year_ranges]
        earliest = min(starts)
        from datetime import datetime
        cur = datetime.now().year
        years = max(years, cur - earliest)
    return float(years)