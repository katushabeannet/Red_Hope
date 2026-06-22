import os
import pickle
import re

import numpy as np
import pandas as pd
from django.conf import settings


MODEL_PATH = os.path.join(
    settings.BASE_DIR,
    "ai_modules",
    "conversational",
    "mpnet_donor_finetuned",
)

QA_PATH = os.path.join(
    settings.BASE_DIR,
    "ai_modules",
    "conversational",
    "blood_donation_qa.csv",
)

CACHE_PATH = os.path.join(
    settings.BASE_DIR,
    "ai_modules",
    "conversational",
    "mpnet_embeddings_cache.pkl",
)

_model = None
_questions = None
_answers = None
_embeddings = None


BLOOD_DOMAIN_KEYWORDS = [
    "blood",
    "donate",
    "donation",
    "donor",
    "transfusion",
    "ubts",
    "eligibility",
    "eligible",
    "hemoglobin",
    "haemoglobin",
    "weight",
    "pregnant",
    "pregnancy",
    "malaria",
    "hiv",
    "hepatitis",
    "sickle",
    "blood group",
    "blood type",
    "camp",
    "donation camp",
    "platelets",
    "plasma",
    "red blood cells",
    "after donating",
    "before donating",
    "safe",
    "safety",
    "needle",
    "screening",
    "medical check",
    "health check",
]


def normalize_text(text):
    text = str(text).lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def is_blood_domain_query(query):
    normalized = normalize_text(query)
    return any(keyword in normalized for keyword in BLOOD_DOMAIN_KEYWORDS)


def load_model():
    global _model

    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(MODEL_PATH)

    return _model


def load_dataset():
    global _questions, _answers

    if _questions is not None and _answers is not None:
        return _questions, _answers

    if not os.path.exists(QA_PATH):
        raise FileNotFoundError(f"Q&A dataset not found at: {QA_PATH}")

    df = pd.read_csv(QA_PATH)
    df.columns = [col.strip().lower() for col in df.columns]

    if "question" not in df.columns or "answer" not in df.columns:
        raise ValueError(
            "blood_donation_qa.csv must contain question and answer columns."
        )

    df = df.dropna(subset=["question", "answer"])

    _questions = df["question"].astype(str).tolist()
    _answers = df["answer"].astype(str).tolist()

    return _questions, _answers


def load_embeddings():
    global _embeddings

    if _embeddings is not None:
        return _embeddings

    questions, _ = load_dataset()

    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, "rb") as file:
            _embeddings = pickle.load(file)
    else:
        model = load_model()

        _embeddings = model.encode(
            questions,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        with open(CACHE_PATH, "wb") as file:
            pickle.dump(_embeddings, file)

    return _embeddings


def classify_confidence(score, blood_domain=False):
    if score >= 0.88:
        return "Very High"

    if score >= 0.80:
        return "High"

    if score >= 0.68:
        return "Moderate"

    if blood_domain and score >= 0.55:
        return "Blood Domain Low"

    return "Low"


def retrieve_top_k(query, k=3):
    model = load_model()
    questions, answers = load_dataset()
    embeddings = load_embeddings()

    blood_domain = is_blood_domain_query(query)

    query_embedding = model.encode(
        query,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    scores = np.dot(embeddings, query_embedding)
    top_indices = np.argsort(scores)[::-1][:k]

    matches = []

    for index in top_indices:
        score = float(scores[index])

        matches.append(
            {
                "matched_question": questions[int(index)],
                "answer": answers[int(index)],
                "similarity_score": round(score, 4),
                "confidence": classify_confidence(score, blood_domain),
            }
        )

    return matches


def retrieve_blood_donation_answer(query):
    blood_domain = is_blood_domain_query(query)
    matches = retrieve_top_k(query, k=3)

    best_match = matches[0]
    best_confidence = best_match["confidence"]

    if best_confidence == "Low" and not blood_domain:
        return {
            "matched_question": best_match["matched_question"],
            "answer": (
                "I am not confident that this question is about blood donation. "
                "Please ask about blood donation, eligibility, availability, or donation camps."
            ),
            "similarity_score": best_match["similarity_score"],
            "confidence": "Low",
            "response_type": "safe_decline",
            "blood_domain": False,
            "top_matches": matches,
        }

    if best_confidence in ["Blood Domain Low", "Moderate"]:
        return {
            "matched_question": best_match["matched_question"],
            "answer": best_match["answer"],
            "similarity_score": best_match["similarity_score"],
            "confidence": best_confidence,
            "response_type": "retrieved_answer_with_caution",
            "blood_domain": blood_domain,
            "top_matches": matches,
        }

    return {
        "matched_question": best_match["matched_question"],
        "answer": best_match["answer"],
        "similarity_score": best_match["similarity_score"],
        "confidence": best_confidence,
        "response_type": "retrieved_answer",
        "blood_domain": blood_domain,
        "top_matches": matches,
    }