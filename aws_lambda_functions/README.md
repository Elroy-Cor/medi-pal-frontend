# Serverless AI Lambda Functions – Healthcare Project

This repository contains **three focused AWS Lambda micro-services** that together power the AI features in our healthcare prototype.  
Each Lambda is **self-contained** (own prompt, bucket, IAM scope, timeout), making it easy to tune performance, cost, and security per use-case.

---

## 📑 Quick Index

| Lambda folder / file | Primary role |
|----------------------|--------------|
| `insurance-qa-lambda/lambda_function.py`     | Answers ad-hoc questions about a patient’s insurance coverage. |
| `medical-record-lambda/lambda_function.py`   | Summarises a patient’s **medical record** in three friendly sentences. |
| `medical-report-lambda/lambda_function.py`   | Q&A over arbitrary medical **reports** (same Gen-Z doctor tone). |

---

## 1. `insurance-qa-lambda`

| Key                    | Value |
|------------------------|-------|
| **Default bucket**     | `elroy-and-co-insurance-docs-parsed` |
| **Expected files**     | Plain-text `.txt` policy extracts |
| **Persona / tone**     | *Expert insurance-policy assistant* |
| **Rules**              | Returns **exactly 3 short sentences** (≤ 20 words each) in JSON key `"answer"`<br>1. Yes/No conclusion 2. clause/page citation 3. next steps →
| **Typical request**    | `{ "question": "Am I covered for an X-ray?" }` |
| **Typical response**   | `{ "answer": "Yes, your plan covers it. See Section 5 p.2. Submit claim within 90 days." }` |
| **Env vars**           | `PARSED_BUCKET`, `MODEL_ID`, `SAMBANOVA_API_KEY`, `SAMBANOVA_API_BASE`, `PROMPT_PREVIEW_LEN` |
| **IAM**                | `s3:GetObject`, `s3:ListBucket` on the bucket |
| **Timeout/memory**     | 128 MB / 30 s is plenty |

---

## 2. `medical-record-lambda`

| Key                    | Value |
|------------------------|-------|
| **Default bucket**     | `elroy-and-co-medical-records` |
| **Expected files**     | Plain-text `.txt` patient records |
| **Persona / tone**     | *Upbeat Gen-Z doctor* |
| **Rules**              | Returns **exactly 3 × ≤ 20-word sentences** in JSON key `"answer"`<br>1. vibe-check summary 2. date/page proof 3. chill next step |
| **Typical request**    | `{ "question": "Summarise my latest visit." }` |
| **Typical response**   | `{ "answer": "Yes, overall you’re healthy. See 2025-03-10 bloods p.2. Book a routine GP chat soon." }` |
| **Everything else**    | Same env vars, IAM and packaging pattern as above |

---

## 3. `medical-report-lambda`

| Key                    | Value |
|------------------------|-------|
| **Default bucket**     | `medical-docs-parsed` (override with ENV) |
| **Expected files**     | Plain-text `.txt` medical reports / lab summaries |
| **Persona / tone**     | Same Gen-Z doctor, but open-ended Q&A |
| **Rules**              | Same 3-sentence JSON format as medical-record Lambda |
| **Typical request**    | `{ "question": "Does this report mention kidney function?" }` |
| **Typical response**   | `{ "answer": "Yes, mild CKD noted. See 2024-11-08 report p.3. Discuss renal diet with your GP." }` |

---

## 🔧 Deployment (all Lambdas)

1. **Secrets**  
   Store `SAMBANOVA_API_KEY` in AWS Secrets Manager **or** encrypt as a Lambda env var.

2. **IAM role**  
   Grant the function read-only access (`s3:GetObject`, `s3:ListBucket`) to its designated bucket.

3. **Packaging**  
   *Zip*: Only `lambda_function.py` + `openai` in `requirements.txt` (boto3 is built-in).  
   *Container*:  
   ```dockerfile
   FROM public.ecr.aws/lambda/python:3.11
   RUN pip install openai
   COPY lambda_function.py .
   CMD ["lambda_function.lambda_handler"]

