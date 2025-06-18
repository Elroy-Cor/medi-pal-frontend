import json, os, boto3
from openai import OpenAI

# ── Config via env-vars ───────────────────────────────────────────────
PARSED_BUCKET       = os.getenv("PARSED_BUCKET", "")
SAMBANOVA_API_BASE  = os.getenv("SAMBANOVA_API_BASE", "https://api.sambanova.ai/v1")
MODEL_ID            = os.getenv("MODEL_ID", "QwQ-32B")
# NOTE: move this key to Secrets Manager or an env var in production!
SAMBANOVA_API_KEY   = ""

# 0 ➜ no preview; N ➜ log first N chars of the prompt
PROMPT_PREVIEW_LEN  = int(os.getenv("PROMPT_PREVIEW_LEN", "0"))

# ── AWS / LLM clients ────────────────────────────────────────────────
s3      = boto3.client("s3")
client  = OpenAI(api_key=SAMBANOVA_API_KEY, base_url=SAMBANOVA_API_BASE)

# ── Helpers ───────────────────────────────────────────────────────────
def list_txt(bucket: str) -> list[str]:
    """Return all *.txt keys in the bucket."""
    keys, pag = [], s3.get_paginator("list_objects_v2")
    for page in pag.paginate(Bucket=bucket):
        keys.extend(obj["Key"] for obj in page.get("Contents", [])
                     if obj["Key"].lower().endswith(".txt"))
    return keys

def read_txt(bucket: str, key: str) -> str:
    """Download and decode a text file."""
    return s3.get_object(Bucket=bucket, Key=key)["Body"].read().decode("utf-8")

def build_prompt(context: str, question: str) -> str:
    """Gen-Z doctor persona → exactly three ≤20-word sentences."""
    return f"""
You’re an upbeat Gen-Z doctor. Use ONLY the text in CONTEXT to explain the patient’s medical record in plain, friendly terms.

OUTPUT RULES
1. Return valid JSON with a single key "answer".
2. "answer" must be EXACTLY three sentences (each ≤20 words):
   answer in general and refer to dates of the visit if relevant
4. Remove special characters, keep it casual and crystal-clear.

CONTEXT
{context}

QUESTION
{question}

Return ONLY the JSON object described in rule 1.
""".strip()

def query_llm(prompt: str) -> str:
    resp = client.chat.completions.create(
        model       = MODEL_ID,
        messages    = [{"role": "user", "content": prompt}],
        temperature = 0,
        top_p       = 0.9,
    )
    return resp.choices[0].message.content

def extract_json(raw: str) -> str:
    """
    Grab the first top-level {{...}} block; fall back to raw text.
    Prevents JSONDecodeError if model adds extra chatter.
    """
    start = raw.find("{")
    if start == -1:
        return raw.strip()

    depth = 0
    for i, ch in enumerate(raw[start:]):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(raw[start:start + i + 1])["answer"]
                except Exception:
                    break
    return raw.strip()

# ── Lambda entry-point ───────────────────────────────────────────────
def lambda_handler(event, _ctx):
    # 1 — Parse request
    try:
        body = event.get("body", event)
        if isinstance(body, str):
            body = json.loads(body)
        question = body["question"]
    except Exception as exc:
        return {"statusCode": 400,
                "body": json.dumps(f"Invalid request: {exc}")}

    # 2 — Aggregate context from S3
    context = ""
    for key in list_txt(PARSED_BUCKET):
        try:
            context += f"\n\n--- {key} ---\n\n{read_txt(PARSED_BUCKET, key)}"
        except Exception as exc:
            context += f"\n\n--- Error reading {key}: {exc} ---\n\n"

    # 3 — Build prompt & query LLM
    prompt     = build_prompt(context, question)
    raw_reply  = query_llm(prompt)
    final_ans  = extract_json(raw_reply)

    # Optional prompt preview for debugging
    if PROMPT_PREVIEW_LEN:
        print("PROMPT PREVIEW:\n",
              prompt[:PROMPT_PREVIEW_LEN] +
              ("…" if len(prompt) > PROMPT_PREVIEW_LEN else ""))

    # 4 — HTTP response
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({
            "question": question,
            "answer":   final_ans
        })
    }
