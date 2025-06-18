"""
lambda_function.py  –  “Gen-Z Doctor” medical-report Q&A (stateless)

What it does
────────────
• Reads plain-text medical documents from an S3 bucket.
• Builds a prompt that forces an upbeat Gen-Z doctor persona to answer
  *only* from that context in super-simple language.
• Calls a SambaNova-hosted OpenAI-compatible model with retry/back-off.
• Returns just the three-sentence JSON answer.

Environment variables (defaults in parentheses)
───────────────────────────────────────────────
AWS_REGION          (us-west-2)                    # region for S3
PARSED_BUCKET       (medical-docs-parsed)          # bucket with *.txt files
MODEL_ID            (QwQ-32B)
SAMBANOVA_API_KEY   (set this!)                    # your key
SAMBANOVA_API_BASE  (https://api.sambanova.ai/v1)
PROMPT_PREVIEW_LEN  (0)                            # >0 prints first N chars
MAX_RETRIES         (4)                            # LLM retry attempts
BASE_DELAY          (1.5)                          # sec for exponential back-off
"""

import json, os, time, random
import boto3
from openai import OpenAI, RateLimitError

# ─── Config ──────────────────────────────────────────────────────────
REGION            = os.getenv("AWS_REGION", "us-west-2")
PARSED_BUCKET     = os.getenv("PARSED_BUCKET", "")

MODEL_ID          = os.getenv("MODEL_ID", "QwQ-32B")
SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY", "")
SAMBANOVA_API_BASE= os.getenv("SAMBANOVA_API_BASE", "https://api.sambanova.ai/v1")

PROMPT_PREVIEW_LEN= int(os.getenv("PROMPT_PREVIEW_LEN", "0"))
MAX_RETRIES       = int(os.getenv("MAX_RETRIES", "4"))
BASE_DELAY        = float(os.getenv("BASE_DELAY", "1.5"))

# ─── AWS + model clients ─────────────────────────────────────────────
s3  = boto3.client("s3", region_name=REGION)
ai  = OpenAI(api_key=SAMBANOVA_API_KEY, base_url=SAMBANOVA_API_BASE)


# ─── S3 helpers ──────────────────────────────────────────────────────
def list_txt(bucket):
    keys, pag = [], s3.get_paginator("list_objects_v2")
    for page in pag.paginate(Bucket=bucket):
        keys += [o["Key"] for o in page.get("Contents", []) if o["Key"].endswith(".txt")]
    return keys


def read_txt(bucket, key):
    return s3.get_object(Bucket=bucket, Key=key)["Body"].read().decode()


# ─── Prompt builder ──────────────────────────────────────────────────
def build_prompt(context: str, question: str) -> str:
    """
    Persona: upbeat Gen-Z doctor who explains medical jargon in plain English.
    Output: JSON with exactly one key "answer", three ≤20-word sentences.
    """

    return f"""
You’re an upbeat Gen-Z doctor. Use ONLY the text in CONTEXT to answer medical-report questions in plain, friendly terms.

OUTPUT RULES
1. Return valid JSON with a single key "answer".
2. "answer" = exactly three sentences (each ≤20 words):
   • Sentence 1 – start with Yes/No + explantion in genz.
   • Sentence 2 – cite one clause/page (e.g. "See Lab Results p. 3").
   • Sentence 3 – next steps, simplified ("Talk to your GP within 24 hrs").
3. No other keys, markdown, or explanations.
4. Remove special characters. Keep language casual but clear.

CONTEXT
{context}

QUESTION
{question}

Return ONLY the JSON object described above.
""".strip()


# ─── LLM call with retry/back-off ────────────────────────────────────
def ask_llm(prompt: str) -> str:
    for attempt in range(MAX_RETRIES):
        try:
            resp = ai.chat.completions.create(
                model       = MODEL_ID,
                messages    = [{"role": "user", "content": prompt}],
                temperature = 0.0,
                top_p       = 0.9,
            )
            return resp.choices[0].message.content

        except RateLimitError:
            if attempt == MAX_RETRIES - 1:
                raise
            delay = BASE_DELAY ** attempt + random.random()
            print(f"Rate-limited → retrying in {delay:.1f}s")
            time.sleep(delay)


# ─── Lambda entry-point ──────────────────────────────────────────────
def lambda_handler(event, _ctx):
    # 1. Parse request
    body = event.get("body", event)
    if isinstance(body, str):
        body = json.loads(body)
    question = body["question"]

    # 2. Gather context from S3
    context_txt = ""
    for key in list_txt(PARSED_BUCKET):
        try:
            context_txt += f"\n\n--- {key} ---\n\n{read_txt(PARSED_BUCKET, key)}"
        except Exception as e:
            context_txt += f"\n\n--- Error reading {key}: {e} ---\n\n"

    # 3. Build prompt & query model
    prompt    = build_prompt(context_txt, question)
    raw_reply = ask_llm(prompt)

    # 4. Extract clean answer
    try:
        final_answer = json.loads(raw_reply)["answer"]
    except Exception:
        brace = raw_reply.rfind("{")
        final_answer = json.loads(raw_reply[brace:]).get("answer", raw_reply) if brace != -1 else raw_reply

    # 5. Optional prompt preview for debugging
    if PROMPT_PREVIEW_LEN:
        print("PROMPT PREVIEW:\n", prompt[:PROMPT_PREVIEW_LEN] + ("…" if len(prompt) > PROMPT_PREVIEW_LEN else ""))

    # 6. Return HTTP response
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({
            "question": question,
            "answer":   final_answer
        })
    }
