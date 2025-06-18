import json, os, boto3
from openai import OpenAI

# ─── Config via env-vars ──────────────────────────────────────────────
PARSED_BUCKET       = os.environ.get("PARSED_BUCKET", "")
SAMBANOVA_API_KEY   = ""
SAMBANOVA_API_BASE  = os.environ.get("SAMBANOVA_API_BASE", "https://api.sambanova.ai/v1")
MODEL_ID            = os.environ.get("MODEL_ID", "QwQ-32B")

# 0-to-disable, or e.g. 1500 to return first 1 500 chars only
PROMPT_PREVIEW_LEN  = int(os.environ.get("PROMPT_PREVIEW_LEN", "0"))

# ─── Clients ─────────────────────────────────────────────────────────
s3      = boto3.client("s3")
client  = OpenAI(api_key="", base_url=SAMBANOVA_API_BASE)

# ─── Helpers ─────────────────────────────────────────────────────────
def list_txt(bucket: str) -> list[str]:
    keys = []
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket):
        keys.extend(k["Key"] for k in page.get("Contents", []) if k["Key"].endswith(".txt"))
    return keys

def read_txt(bucket: str, key: str) -> str:
    obj = s3.get_object(Bucket=bucket, Key=key)
    return obj["Body"].read().decode("utf-8")

def build_prompt(context: str, question: str) -> str:
    return f"""
You are an expert insurance-policy assistant. Use **ONLY** the text in the CONTEXT to answer.

RULES
1. Reply with valid JSON containing a single key "answer".
2. "answer" must be **exactly three short sentences** (≤ 20 words each):
   • Sentence 1 – start with Yes/No + conclusion.
   • Sentence 2 – cite one clause/page as evidence.
   • Sentence 3 – give next steps (claim form, deadline, etc.).
   - Dont include the reasoning in the answer
3. Output **nothing** outside that JSON object.
4. Remove any special characters


CONTEXT
{context}

QUESTION
{question}

Return only the JSON object described in rule 1.
""".strip()

def query_llm(prompt: str) -> str:
    resp = client.chat.completions.create(
        model=MODEL_ID,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        top_p=0.9,
    )
    return resp.choices[0].message.content

# ─── Lambda entry-point ───────────────────────────────────────────────
def lambda_handler(event, context):
    # 1. Parse request
    try:
        body = event.get("body", event)
        if isinstance(body, str):
            body = json.loads(body)
        question = body["question"]
    except Exception as exc:
        return {"statusCode": 400, "body": json.dumps(f"Invalid request: {exc}")}

    # 2. Assemble context from S3
    context_txt = ""
    for key in list_txt(PARSED_BUCKET):
        try:
            context_txt += f"\n\n--- {key} ---\n\n{read_txt(PARSED_BUCKET, key)}"
        except Exception as exc:
            context_txt += f"\n\n--- Error reading {key}: {exc} ---\n\n"

    # 3. Build prompt & query model
    prompt = build_prompt(context_txt, question)
    # answer = query_llm(prompt)

    # 4. Optionally truncate the prompt we echo back
    raw_reply =query_llm(prompt)          # ← returns one string, e.g. '{"answer":"…"}'

    # --- 4. Extract the answer safely -----------------------------------
    try:
        # normal path: the model followed the rules
        final_answer = json.loads(raw_reply)["answer"]

    except (json.JSONDecodeError, KeyError):
        # model added extra text → grab the last {...}
        brace = raw_reply.rfind("{")
        if brace != -1:
            final_answer = json.loads(raw_reply[brace:]).get("answer", raw_reply)
        else:
            final_answer = raw_reply
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body":
            json.dumps({
            "question": question,
            "answer":  final_answer        # ← echoed for debugging
        })
    }
