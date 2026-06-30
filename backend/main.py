from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import re
import os
import asyncio
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = FastAPI(title="LogInsight AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class LogEntry(BaseModel):
    timestamp: str
    level: str
    message: str
    ai_analysis: Optional[str] = None

LOG_PATTERN = re.compile(r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)")

def parse_raw_log(line: str) -> LogEntry:
    match = LOG_PATTERN.match(line.strip())
    if match:
        return LogEntry(timestamp=match.group(1), level=match.group(2), message=match.group(3))
    return LogEntry(timestamp="UNKNOWN", level="INFO", message=line.strip())

async def generate_log_diagnostic(error_message: str) -> str:
    try:
        prompt = (
            f"You are an expert Senior Site Reliability Engineer (SRE). "
            f"Analyze this software log error and return exactly 3 sentences. "
            f"1. Likely root cause. 2. Severity impact. 3. Precise fix required.\n\n"
            f"Error: {error_message}"
        )
        response = await asyncio.to_thread(
            ai_client.models.generate_content,
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        return f"AI Diagnosis error: {str(e)}"

@app.get("/")
def root():
    return {"status": "healthy", "message": "LogInsight AI Backend running Core Services."}

@app.post("/api/logs/upload", response_model=List[LogEntry])
async def upload_log_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.log') and not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .log or .txt file.")

    contents = await file.read()
    parsed_logs = [parse_raw_log(line) for line in contents.decode("utf-8").splitlines() if line.strip()]

    # Cache so duplicate error messages only call Gemini once
    analysis_cache = {}
    error_count = 0
    MAX_AI_CALLS = 20

    async def analyze(log):
        nonlocal error_count
        if log.level in ["ERROR", "CRITICAL", "WARN"] and error_count < MAX_AI_CALLS:
            error_count += 1
            if log.message not in analysis_cache:
                analysis_cache[log.message] = await generate_log_diagnostic(log.message)
            log.ai_analysis = analysis_cache[log.message]
        return log

    # All AI calls run in parallel instead of one by one
    parsed_logs = list(await asyncio.gather(*[analyze(log) for log in parsed_logs]))
    return parsed_logs