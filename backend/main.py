from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import re
import os
from dotenv import load_dotenv
from google import genai

# Safely extract variables from your local .env configuration file
load_dotenv()

app = FastAPI(title="LogInsight AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the official Google GenAI Client
# The SDK automatically uses the GEMINI_API_KEY environment variable.
ai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Updated our Pydantic schema to include an optional field for AI summaries
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

def generate_log_diagnostic(error_message: str) -> str:
    """Dispatches suspicious log signatures directly to Gemini for root-cause profiling."""
    try:
        prompt = (
            f"You are an expert Senior Site Reliability Engineer (SRE). "
            f"Analyze this software log error string and return exactly a maximum of 3 sentences. "
            f"Identify: 1. The likely root cause, 2. Threat/Severity impact, 3. The precise developer fix action required.\n\n"
            f"Error Log: {error_message}"
        )
        
        # Using the standard gemini-2.5-flash model through the official Client
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        return f"AI Diagnosis engine error: {str(e)}"

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
            log_item = parse_raw_log(line)
            
            # Conditionally intercept system risks or crashes to invoke AI triage
            if log_item.level in ["ERROR", "CRITICAL", "WARN"]:
                log_item.ai_analysis = generate_log_diagnostic(log_item.message)
                
            parsed_logs.append(log_item)
            
    return parsed_logs