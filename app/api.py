"""
FastAPI backend for SIH-153 Network Attack Forecasting.
Accepts file uploads (CSV, PCAP, binetflow, Zeek, JSON) and returns analysis reports.
"""
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Ensure project root directory is on the path for app.* imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.parsers import parse_uploaded_file
from app.analyzer import generate_report

app = FastAPI(
    title="SIH-153 Network Attack Forecasting API",
    version="1.0.0",
)

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_EXTENSIONS = {
    '.csv', '.binetflow', '.pcap', '.pcapng', '.cap',
    '.log', '.json', '.tsv', '.netflow', '.nfcapd',
}

MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB


@app.get("/api/health")
def health():
    return {"status": "online", "engine": "statistical + rule-based"}


@app.get("/api/supported-formats")
def supported_formats():
    return {
        "formats": [
            {"ext": ".csv",      "name": "CSV",          "desc": "Pre-extracted flow/feature CSV files"},
            {"ext": ".pcap",     "name": "PCAP",         "desc": "Packet capture (libpcap format)"},
            {"ext": ".pcapng",   "name": "PCAPNG",       "desc": "Next-gen packet capture format"},
            {"ext": ".cap",      "name": "CAP",          "desc": "Network capture files"},
            {"ext": ".binetflow","name": "Binetflow",    "desc": "CTU-13 botnet network flow format"},
            {"ext": ".log",      "name": "Zeek Log",     "desc": "Zeek/Bro IDS connection logs"},
            {"ext": ".json",     "name": "JSON",         "desc": "JSON-formatted flow/packet records"},
            {"ext": ".tsv",      "name": "TSV",          "desc": "Tab-separated flow data"},
            {"ext": ".netflow",  "name": "NetFlow",      "desc": "NetFlow export files"},
        ]
    }


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    """Upload a network traffic file and receive a forecasting analysis report."""
    
    # Validate file extension
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: '{ext}'. Supported formats: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )
    
    # Save uploaded file to temp location
    tmp_dir = tempfile.mkdtemp()
    tmp_path = os.path.join(tmp_dir, filename)
    
    try:
        # Read and save file
        content = await file.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum 500 MB.")
        
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
        with open(tmp_path, 'wb') as f:
            f.write(content)
        
        # Parse the file
        try:
            records = parse_uploaded_file(tmp_path, filename)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")
        
        if not records:
            raise HTTPException(status_code=422, detail="No valid records found in the uploaded file.")
        
        # Generate analysis report
        report = generate_report(records, filename)
        
        return JSONResponse(content=report)
    
    finally:
        # Cleanup temp files
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
