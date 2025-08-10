from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Optional
import numpy as np

from .parser import extract_skills, extract_sections, estimate_experience_years


class ModelManager:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        # You can use 'sentence-transformers/all-MiniLM-L6-v2' as well
        self.model_name = model_name
        print(f"Loading model {model_name} ...")
        self.model = SentenceTransformer(model_name)

    def embed(self, texts: List[str]):
        return self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)

    def analyze(self, resume_text: str, job_description: Optional[str] = None) -> dict:
        resume_text = resume_text or ""
        job_description = job_description or ""
        resume_emb = self.embed([resume_text])[0]
        result = {}
        if job_description:
            job_emb = self.embed([job_description])[0]
            sim = float(cosine_similarity([resume_emb], [job_emb])[0][0])
            result["similarity"] = sim
            result["score_pct"] = round(sim * 100.0, 2)
        else:
            result["similarity"] = None
            result["score_pct"] = None

        # Skills and sections heuristics
        result["matched_skills"] = extract_skills(resume_text)
        result["sections"] = extract_sections(resume_text)
        result["experience_years"] = estimate_experience_years(resume_text)

        # top-k keywords using a simple TF heuristic (token frequency)
        words = [w.lower() for w in resume_text.split() if len(w) > 2]
        from collections import Counter
        c = Counter(words)
        common = [w for w, _ in c.most_common(40)]
        result["common_terms"] = common[:20]

        # include truncated raw text (for UI display)
        result["text_preview"] = resume_text[:50_000]
        return result