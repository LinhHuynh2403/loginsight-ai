from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import re

app = FastAPI(title="LogInsight AI API")

# Enable CORS so your React frontend can talk to the backend seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # We will tighten this during deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schema for structured log output
class LogEntry(BaseModel):
    timestamp: str
    level: str
    message: str

# A simple regex parser for standard log formats, e.g., "2026-06-29 22:00:00 [ERROR] Database connection failed"
LOG_PATTERN = re.compile(r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)")

def parse_raw_log(line: str) -> LogEntry:
    match = LOG_PATTERN.match(line.strip())
    if match:
        return LogEntry(timestamp=match.group(1), level=match.group(2), message=match.group(3))
    # Fallback for unstructured logs
    return LogEntry(timestamp="UNKNOWN", level="INFO", message=line.strip())

@app.get("/")
def root():
    return {"status": "healthy", "message": "LogInsight AI Backend running Core Services."}

@app.post("/api/logs/upload", response_model=List[LogEntry])
async def upload_log_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.log') and not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .log or .txt file.")
    
    contents = await file.read()
    decoded_contents = contents.decode("utf-8")
    
    parsed_logs = []
    for line in decoded_contents.splitlines():
        if line.strip():
            parsed_logs.append(parse_raw_log(line))
            
    return parsed_logs