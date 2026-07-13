# RedHope / UBTS Intelligent Blood Donation Platform — Defense Guide

One document to prepare from. It covers what each intelligent module does, **how** it was implemented, **why** it was built that way, and the questions an examiner is likely to ask about each.

---

## 1. The One-Paragraph Pitch

RedHope is an intelligent donor-management platform for the Uganda Blood Transfusion Service (UBTS). A Django REST API sits on PostgreSQL for transactional data (donors, camps, medical records) and Neo4j for a graph-based audit trail of every AI decision. A single **intent router** looks at what a user is asking and dispatches to one of four intelligent subsystems: a **retrieval-based conversational assistant**, a **deterministic eligibility rule engine**, a **machine-learning availability predictor**, and a **geospatial camp recommender**. A React (Leaflet + Recharts) frontend consumes it all. The unifying design principle: **every decision that affects a donor's health or campaign eligibility is made by an explainable, auditable component — never by a generative model.** GPT is used only to phrase language, never to decide facts.

---

## 2. Tech Stack (say this fast, examiners like specifics)

| Layer | Choice | Notes |
|---|---|---|
| Backend framework | Django 6 + Django REST Framework | `config/settings.py` |
| Database | PostgreSQL (`psycopg2`) | relational, transactional source of truth |
| Graph DB | Neo4j (official `neo4j` driver) | audit trail / interaction graph, not the source of truth |
| Auth | Django session auth, CSRF-exempt for the API (`accounts/authentication.py`) | simpler than JWT for a single first-party frontend; role field (`DONOR`/`ADMIN`) drives permissioning |
| Conversational model | `sentence-transformers` — `all-mpnet-base-v2`, fine-tuned | domain-adapted with triplet loss |
| Availability model | `scikit-learn` Logistic Regression (`joblib` artifact) | chosen after comparing against Random Forest and XGBoost |
| LLM | OpenAI `gpt-4o-mini` (openai SDK) | rephrasing layer only, temperature 0.4, 250 max tokens |
| Frontend | React 19 + Vite + Tailwind | |
| Maps | Leaflet / react-leaflet | |
| Charts | Recharts | |

---

## 3. The Intent Router — the system's "traffic controller"

**File:** [ai_modules/router/intent_detector.py](ubts-intelligent-platform/backend/ai_modules/router/intent_detector.py), [ai_modules/router/unified_router.py](ubts-intelligent-platform/backend/ai_modules/router/unified_router.py)

Every chat message goes through `detect_intent(query)` first. It's a **plain keyword classifier** — no ML, no LLM — that buckets the query into `ELIGIBILITY`, `AVAILABILITY`, `GEOSPATIAL`, `COMBINED`, or falls through to `CONVERSATIONAL`. `unified_router.route_chatbot_query()` then:

1. Resolves the caller's role (`GUEST`/`DONOR`/`ADMIN`) — sensitive checks (eligibility, availability) are refused for non-donors with a polite decline, never silently answered.
2. For eligibility, it runs a **multi-turn illness check first** (`_extract_illness_from_history`): before scoring eligibility, it asks "have you been ill in the past 2 weeks?" and parses free-text yes/no from the conversation history (with negation handled *before* positive matching, e.g. "haven't" must not match "have"). This answer is folded into `medical_record.has_recent_illness` before the rule engine runs.
3. Calls the correct engine (eligibility / availability / both) and asks GPT only to phrase the explanation.

**Why keyword routing instead of an LLM-based router or intent-classification model?** It's deterministic, free, instant, and fully explainable in a viva — you can point at the exact list of keywords that produced a given routing decision. An LLM router would add latency, cost, and a non-deterministic failure mode for a decision that doesn't need semantic nuance.

---

## 4. Conversational Assistant (Retrieval-Augmented, not Generative)

**Files:** [ai_modules/conversational/mpnet_retriever.py](ubts-intelligent-platform/backend/ai_modules/conversational/mpnet_retriever.py), [ai_modules/gpt_response_generator.py](ubts-intelligent-platform/backend/ai_modules/gpt_response_generator.py)

### How it works
1. **Knowledge base:** `blood_donation_qa.csv` — ~3,376 curated question/answer pairs about blood donation, screening, safety, eligibility, etc.
2. **Embedding model:** base model `all-mpnet-base-v2` (Sentence-Transformers), **fine-tuned** on a domain-specific dataset using **Triplet Loss** (anchor question, positive/matching answer, hard-negative near-miss answer), 1 epoch with 100 warmup steps, saved as `mpnet_donor_finetuned`. Fine-tuning notebooks: `CONVERSATIONAL MODELS/mpnet_finetuning.ipynb`, `hard-negative-construction.ipynb`.
3. **Retrieval:** the fine-tuned model encodes the user's query, computes cosine similarity (`np.dot` on L2-normalized embeddings) against pre-computed, cached embeddings of all 3,376 questions, and returns the top-3 matches.
4. **Confidence tiering** (`classify_confidence`): `Very High` ≥0.88, `High` ≥0.80, `Moderate` ≥0.68, `Blood Domain Low` ≥0.55 *and* the query contains a blood-domain keyword, else `Low`.
5. **Domain gate:** `is_blood_domain_query()` checks the query against a hand-built keyword list (blood, donate, hemoglobin, eligibility, malaria, HIV, camp, …). A `Low`-confidence match that is *also* off-domain triggers a **safe decline** instead of guessing.
6. **GPT rephrasing:** `gpt-4o-mini` is handed the *retrieved trusted answer* and told explicitly: "You must only answer using the trusted retrieved blood donation answer... Do not add medical claims that are not in the trusted answer." It rewrites tone/phrasing; it never originates a fact. If the OpenAI call fails, the raw retrieved answer is returned as a fallback (`with_fallback`) — the system degrades gracefully instead of breaking.

### Why this architecture (the key defense point)
This is a **RAG (retrieval-augmented generation) pattern deliberately chosen over a pure generative chatbot** to eliminate medical hallucination risk. A general-purpose LLM asked "am I eligible to donate blood" might invent a plausible-sounding but wrong answer. Here, the *only* facts that ever reach the user come from a UBTS-vetted CSV; GPT's role is capped to natural-language phrasing. The confidence tiers plus domain gate give a second layer of protection: even a good semantic match on an out-of-domain question gets declined rather than answered.

### Anticipated questions
- *"Why not just use ChatGPT directly?"* → Hallucination risk in a health context; retrieval-then-rephrase keeps facts sourced and auditable.
- *"Why MPNet and not a simpler TF-IDF/BM25?"* → Needed semantic matching (paraphrases, typos, different phrasing of the same medical question), not just keyword overlap.
- *"Why fine-tune instead of using the base model as-is?"* → Domain adaptation: general MPNet doesn't know that "can I give blood with a cold" and "am I eligible if I'm sick" should be near-neighbors; triplet loss with hard negatives teaches it to distinguish subtly different donation-related questions.
- *"What happens if OpenAI is down?"* → Falls back to the raw retrieved answer (`with_fallback`), so the assistant still answers, just without the friendly rephrasing.

---

## 5. Eligibility Engine (Deterministic Rule Engine, *not* ML)

**Files:** [ai_modules/eligibility/eligibility_engine.py](ubts-intelligent-platform/backend/ai_modules/eligibility/eligibility_engine.py), [ai_modules/eligibility/eligibility_rules.json](ubts-intelligent-platform/backend/ai_modules/eligibility/eligibility_rules.json)

### How it works
`run_eligibility_rules(profile, medical_record)` loads thresholds from a JSON config file (not hardcoded) and evaluates, in order:
- **Age** — must be within `min_age`–`max_age` (17–65), computed from `date_of_birth`.
- **Weight** — must be ≥ `min_weight_kg` (50 kg).
- **Hemoglobin** — must be ≥ `min_hemoglobin_g_dl` (12.5 g/dL).
- **Donation interval** — must be ≥ `min_donation_interval_days` (90 days) since `last_donation_date`.
- **Disallowed medical conditions** — `medical_condition` is checked against a configurable list (HIV, Hepatitis B/C, TB, Malaria, Cancer, Hypertension, Diabetes, Cardiac issues, Recent Surgery, Asthma, Anemia, resolved infections).
- **Boolean health flags** — recent illness, chronic condition, pregnancy, on medication — each independently disqualifying pending UBTS staff review.

If *no* medical record exists yet, the engine explicitly refuses to guess ("cannot be confirmed... missing") rather than defaulting to eligible or ineligible. Every check that fails appends a **human-readable reason string**, so the API response is never just `true`/`false` — it's a transparent list of exactly why.

### Why a rule engine instead of a machine-learning classifier (this is the strongest architectural point in the whole project)
The team trained a Random Forest on a labelled eligibility dataset (`ELEGIBILITY MODELS/Phase_15_Clean_Eligibility_Modeling.ipynb`) and it hit **100% accuracy** — suspiciously perfect. Investigation showed *why*: the label was itself generated by a 3-line rule (`Medical_Condition == "None" AND Weight ≥ 50 AND Hemoglobin ≥ 12.5`), confirmed by re-deriving that exact rule from the data and getting a perfect match (`Rule Accuracy: 1.0`). In other words: **eligibility isn't a pattern to be learned — it's a known, published medical policy.** Training an opaque model to re-approximate a rule that's already fully known would only add:
- a black box where UBTS staff and regulators need an auditable justification per applicant,
- retraining/versioning overhead for a policy that changes by ministerial guideline, not by data drift,
- risk of the model learning spurious correlations that happen to fit historical data.

So the decision was to keep the exact rule as an explicit, JSON-configurable rule engine — instantly explainable, instantly auditable, and trivially updated by editing thresholds (no retraining) when UBTS policy changes. This is a *deliberate* engineering trade-off, not a missed opportunity to "use AI everywhere."

### Recent work on this file (useful to mention if asked about it)
The rules JSON originally only had `min_weight_kg`, `min_hemoglobin_g_dl`, and an unused `disallowed_conditions` list — `min_age`/`max_age` were silently defaulting in Python, the 90-day interval was a hardcoded constant, and disallowed conditions were never actually checked by the real engine (only by an orphaned prototype script). This was fixed by: making all thresholds live in the JSON, wiring `disallowed_conditions` into the real engine, and adding a `medical_condition` field to `DonorMedicalRecord` (migration `0008`) so a condition can actually be recorded and checked.

### Anticipated questions
- *"Could this scale to more nuanced medical rules?"* → Yes — it's config-driven; new thresholds or conditions are a JSON edit, not a redeploy or retrain.
- *"Why keep it out of the ML pipeline entirely?"* → Because the ground truth showed eligibility is rule-derived, not data-derived; see the 100%-accuracy/rule-matching finding above.
- *"What if the medical record is incomplete?"* → Explicitly refuses to assess rather than guessing eligible/ineligible.

---

## 6. Availability / Retention Prediction (Machine Learning)

**Files:** [ai_modules/availability/availability_engine.py](ubts-intelligent-platform/backend/ai_modules/availability/availability_engine.py), [donors/retention_engine.py](ubts-intelligent-platform/backend/donors/retention_engine.py)

### The problem
Being medically *eligible* to donate doesn't mean a donor is *likely to actually show up* if invited. Availability is a genuine behavioral-prediction problem — unlike eligibility, this one *is* appropriate for ML because donor return behavior is a real statistical pattern, not a published deterministic policy.

### Features (RFM model)
Classic **Recency/Frequency/Time** donor-behavior features, computed per donor:
- `days_since_last_donation` (Recency)
- `total_donations` (Frequency)
- `months_since_first_donation` (Time, estimated from donation count + recency when the exact first-donation date isn't tracked)

### Model selection (this is a great "why did you choose X" answer)
Three models were trained and compared on the RFM features (`ELEGIBILITY MODELS/Phase 17-Logistic-regresion-xgboost.ipynb`, `Phase_17D_Availability_Model_Comparison.ipynb`):

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| Logistic Regression | 0.72 | 0.45 | **0.83** | 0.59 | **0.785** |
| Random Forest | 0.72 | 0.42 | 0.44 | 0.43 | 0.722 |
| XGBoost | **0.787** | **0.57** | 0.47 | 0.52 | 0.747 |

XGBoost has the best raw accuracy, but **Logistic Regression was chosen for production** (`availability_logistic_model_retrained.pkl`) because:
- **Recall matters more than accuracy here.** A false negative (predicting a genuinely available donor as unavailable) means a real donor never gets invited — a lost donation. A false positive just costs one wasted reminder message. Logistic Regression's 0.83 recall vs. XGBoost's 0.47 means it misses far fewer real donors, at the acceptable cost of more low-value invites.
- **Best ROC-AUC** (0.785) — best overall ranking quality across thresholds, which matters because the output is used to *rank/tier* donors for campaigns, not just binary-classify them.
- **Simplicity and explainability** — a linear model with 3 features is easy to defend to non-technical UBTS staff ("more recent + more frequent donors score higher"), unlike an ensemble of 200 trees.

### Output
`predict_availability()` returns a probability, a binary `is_available` (threshold 0.50), and a 3-way **priority tier**: `HIGH` (≥0.80), `MEDIUM` (≥0.50), `LOW` (below) — used directly by campaign targeting to rank donor outreach lists.

### Where it's used
- `retention_engine.get_donor_retention_summary()` — decides whether/what reminder message to send an individual donor.
- `donors/campaign_targeting_engine.py` — feeds into the combined campaign priority score (see §7).

### Anticipated questions
- *"Why not just pick the highest-accuracy model (XGBoost)?"* → Accuracy is the wrong metric alone for an imbalanced, asymmetric-cost problem; recall and ROC-AUC were prioritized deliberately (explained above).
- *"Why only 3 features?"* → Classic, well-validated RFM donor-behavior features from donation-science literature (originally from the UCI Blood Transfusion dataset used during EDA); keeps the model simple, fast, and resistant to overfitting on a modest dataset.

---

## 7. Geospatial Recommendation

**Files:** [ai_modules/geo_recommender.py](ubts-intelligent-platform/backend/ai_modules/geo_recommender.py), [camps/views.py](ubts-intelligent-platform/backend/camps/views.py), [donors/campaign_targeting_engine.py](ubts-intelligent-platform/backend/donors/campaign_targeting_engine.py)

### How it works
- **Haversine formula** (`haversine_distance_km`) computes great-circle distance between two lat/lon points using Earth radius 6371 km — no external mapping API or geospatial DB extension required.
- `find_nearest_camp(user_lat, user_lon, camps)` linearly scans all **active** camps and returns the closest one plus distance — camp counts are small (dozens, not millions), so an O(n) scan is simpler and fast enough; no need for spatial indexing (e.g. PostGIS, R-trees).
- `POST /api/camps/nearest/` is called either directly from the map UI or via the chatbot when intent = `GEOSPATIAL` (the router returns an `action_required: true` payload telling the frontend to request browser geolocation, then call this endpoint).
- Every nearest-camp lookup is also written to **Neo4j** (`create_nearest_camp_trace`) linking the user, their coordinates, and the recommended camp — building a queryable graph of "who was directed where."

### Campaign targeting (geospatial + eligibility + availability combined)
`scan_personalized_campaign_donors(blood_group, campaign_lat, campaign_lon, radius_km)` is the system's most "intelligent" single function — for every donor it:
1. Filters by blood group match.
2. Computes Haversine distance from the donor to the proposed camp location; excludes donors outside `radius_km` (but still evaluates and reports them, tagged `OUTSIDE_RADIUS`, rather than silently dropping them).
3. Runs the **eligibility engine** and **availability model**.
4. Computes a **campaign priority score**: `(availability_probability × 0.75) + (distance_score × 0.25)`, where `distance_score = max(0, 1 − distance_km/50)` — closer and more-likely-to-return donors rank highest.
5. Buckets results into matched / ineligible / outside-radius / skipped (missing data), each with an explicit reason — nothing is silently excluded.

### Why Haversine instead of a GIS library or Google Maps Distance Matrix API
- No external API cost or network dependency for a straight-line distance calculation.
- Donation camps are at city/district scale in Uganda — great-circle distance is an accurate-enough proxy for "how far," and it's fully computable offline/deterministically, easy to unit test and explain live in a viva (it's ~15 lines of trigonometry).
- The weighting (75% availability / 25% distance) is an explicit, tunable business rule — again explainable to a non-technical panel, not a learned weight.

### Frontend
Leaflet + react-leaflet render the interactive map (nearest camp, camp pins, donor location); Recharts renders analytics (e.g. donor tiers, campaign summaries).

### Anticipated questions
- *"Why not PostGIS?"* → Overkill for the current camp count; adds infra complexity without a performance need at this scale.
- *"How is the 75/25 weighting justified?"* → It's an explicit business rule prioritizing donors likely to actually respond over pure proximity, tunable without retraining anything.

---

## 8. Supporting Infrastructure

### Neo4j — the audit/analytics graph
**File:** [neo4j_service/neo4j_client.py](ubts-intelligent-platform/backend/neo4j_service/neo4j_client.py)

PostgreSQL is the transactional source of truth (donor profiles, medical records, camps). Neo4j is a **separate, secondary trace store** recording every AI-assisted decision as a graph: `DonorUser -[:GENERATES_ELIGIBILITY]-> EligibilityAssessment`, `PlatformUser -[:RECOMMENDED_NEAREST_CAMP]-> NearestCampRecommendation -[:POINTS_TO_CAMP]-> DonationCamp`, `PlatformUser -[:ASKED_QUESTION]-> Question -[:MATCHED_QA]-> RetrievalResult`. All Neo4j writes are wrapped in `try/except` and never block the main response — if Neo4j is down, the user still gets their answer; only the audit trace is lost (logged, not raised).

**Why a graph DB in addition to a relational one?** Relationships like "which questions most often precede a low-availability prediction" or "which camps are recommended most across which regions" are natural graph traversal queries, awkward as relational joins. It also gives a clean, append-only audit log of AI-driven decisions distinct from the mutable operational data — useful for both analytics and a "show your work" compliance trail.

### Role-based access & auth
Session-based auth (not JWT) with a `role` field (`DONOR`/`ADMIN`) on the custom `User` model gates every sensitive endpoint (`IsAdminUser`, or router-level role checks for chat intents). Simpler than JWT for a single first-party SPA frontend; avoids token-refresh complexity for a system with no third-party API consumers.

---

## 9. Design Decisions Cheat-Sheet (fast recall table)

| Decision | Why |
|---|---|
| Rule engine (not ML) for eligibility | Ground-truth data proved eligibility is a deterministic policy, not a learned pattern (100%-accuracy/rule-matching finding) — rule engine is more auditable and instantly updatable |
| Logistic Regression (not XGBoost) for availability | Recall (0.83 vs 0.47) and ROC-AUC matter more than raw accuracy for a "don't miss a real donor" ranking problem |
| Retrieval + GPT-rephrase (not pure generative chatbot) | Eliminates medical hallucination risk — GPT only rewrites a vetted trusted answer, never originates facts |
| Fine-tuned MPNet with triplet loss + hard negatives | Base embeddings don't distinguish subtly different donation questions; domain adaptation needed |
| Keyword-based intent router (not an LLM router) | Deterministic, instant, fully explainable, zero extra cost/latency |
| Haversine (not PostGIS/Maps API) | Camp scale doesn't need spatial indexing; keeps the system dependency-free and explainable |
| Neo4j alongside PostgreSQL | Graph-shaped audit/analytics queries vs. relational transactional data — separate concerns |
| JSON-driven eligibility thresholds | Policy changes (age/weight/hemoglobin/interval/conditions) without a code deploy or retrain |
| Session auth (not JWT) | Single first-party frontend; no need for token-refresh complexity |

---

## 10. Likely Cross-Cutting Examiner Questions

- **"What's the actual AI/ML content vs. plain software engineering?"** → Two real ML models (fine-tuned MPNet retriever with triplet loss; Logistic Regression availability classifier, chosen after a 3-model comparison), one deliberately rule-based expert system (eligibility) with a documented justification for *not* using ML, and one LLM used strictly as a language-phrasing layer with hard guardrails against hallucination.
- **"What would you improve with more time?"** → Candidate answers: gather more labelled real-world (not rule-generated) eligibility outcome data to validate whether hidden nuance exists beyond the published rule; add BMI/blood-pressure/pulse fields for a fuller UBTS screening rule set; move geospatial to indexed spatial queries once camp count grows nationally; add JWT if a mobile client is added later.
- **"How do you evaluate the chatbot beyond similarity score?"** → Confidence tiering + domain-keyword gate acts as a built-in evaluation/safety net at inference time; the hard-negative fine-tuning notebook evaluates retrieval quality on a held-out validation split.
- **"Is any of this safe to deploy for real medical decisions?"** → Every eligibility/availability output carries explicit human-readable reasons and is explicitly framed as *not confirmed eligible* pending UBTS staff review — no component claims final medical authority.
