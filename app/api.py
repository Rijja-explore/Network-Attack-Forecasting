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

import threading
import time
import random
from typing import List, Optional
from pydantic import BaseModel

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.parsers import parse_uploaded_file
from app.analyzer import generate_report, simulate_what_if_defense

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
    '.log', '.json', '.tsv', '.txt', '.netflow', '.nfcapd',
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
            {"ext": ".txt",      "name": "Text/CSV",     "desc": "Delimited text/CSV flow records"},
            {"ext": ".netflow",  "name": "NetFlow",      "desc": "NetFlow export files"},
        ]
    }


TEST_DATA_DIR = PROJECT_ROOT / "test_data"

SCENARIOS = [
    {
        "id": "benign",
        "title": "Nominal Business Traffic",
        "badge": "LOW RISK",
        "color": "#30D158",
        "file": "01_benign_normal_traffic.csv",
        "desc": "Normal enterprise web traffic (HTTPS 443, DNS 53). Baseline nominal flow behavior."
    },
    {
        "id": "recon",
        "title": "Reconnaissance Port Scan",
        "badge": "RECON STAGE",
        "color": "#FFD60A",
        "file": "02_reconnaissance_port_scan.csv",
        "desc": "Attacker scanning 25+ destination ports. High SYN/ACK ratio, small probe packets."
    },
    {
        "id": "bruteforce",
        "title": "Brute Force Initial Access",
        "badge": "INITIAL ACCESS",
        "color": "#FF9F0A",
        "file": "03_bruteforce_initial_access.csv",
        "desc": "Rapid repeated login attempts against SSH (22) and RDP (3389). High connection bursts."
    },
    {
        "id": "neris_c2",
        "title": "Neris Botnet C2 Beaconing",
        "badge": "C2 BEACON",
        "color": "#FF453A",
        "file": "04_botnet_neris_c2_beaconing.csv",
        "desc": "Periodic IRC command & control beacons (port 6667). Characteristic botnet heartbeat."
    },
    {
        "id": "ddos",
        "title": "DDoS Volumetric Flood",
        "badge": "CRITICAL RISK",
        "color": "#FF3B30",
        "file": "05_ddos_exfiltration_flood.csv",
        "desc": "Volumetric saturation flood (>1.7 MB/s). Massive packet rate and resource starvation."
    },
    {
        "id": "zeroday",
        "title": "Zero-Day Novel Threat Vector",
        "badge": "NOVEL OOD VECTOR",
        "color": "#BF5AF2",
        "file": "06_zero_day_novel_attack.csv",
        "desc": "Unseen multi-vector attack with high entropy across botnet signatures. Triggers OOD alarm."
    },
]


@app.get("/api/scenarios")
def get_scenarios():
    return {"scenarios": SCENARIOS}


@app.post("/api/scenarios/{scenario_id}/load")
def load_scenario(scenario_id: str):
    target_id = "zeroday" if scenario_id == "zero_day" else scenario_id
    match = next((s for s in SCENARIOS if s["id"] == target_id or s["id"] == scenario_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    file_path = TEST_DATA_DIR / match["file"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Scenario file {match['file']} not found")
        
    records = parse_uploaded_file(str(file_path), match["file"])
    report = generate_report(records, match["file"])
    return JSONResponse(content=report)


@app.get("/api/stream/windows")
def get_stream_windows():
    """Returns sequential sliding windows simulating live sensor traffic progression."""
    steps = [
        {"window_index": 0, "scenario_id": "benign", "label": "Window T-0 (Baseline)", "risk_estimate": 0.05},
        {"window_index": 1, "scenario_id": "recon", "label": "Window T+1 (Probing)", "risk_estimate": 0.35},
        {"window_index": 2, "scenario_id": "bruteforce", "label": "Window T+2 (Breach Attempt)", "risk_estimate": 0.65},
        {"window_index": 3, "scenario_id": "neris_c2", "label": "Window T+3 (C2 Beacon Active)", "risk_estimate": 0.88},
        {"window_index": 4, "scenario_id": "ddos", "label": "Window T+4 (Volumetric Surge)", "risk_estimate": 0.96},
    ]
    return {"windows": steps}


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

# ──────────────────────────────────────────────
# Authentication & Role-Based Access Control
# ──────────────────────────────────────────────

USERS_DB = {
    "analyst": {
        "username": "analyst",
        "name": "Sarah Chen",
        "role": "SOC Analyst",
        "tier": "Tier-1 Monitoring",
        "badge": "L1 ANALYST",
        "avatar": "SC",
        "permissions": ["view_telemetry", "upload_pcap", "acknowledge_alert"],
        "token": "token-analyst-sih153"
    },
    "hunter": {
        "username": "hunter",
        "name": "Alex Rivera",
        "role": "Threat Hunter",
        "tier": "Tier-2 Investigation",
        "badge": "THREAT HUNTER",
        "avatar": "AR",
        "permissions": ["view_telemetry", "upload_pcap", "deep_xai", "mitre_navigator", "deploy_soar"],
        "token": "token-hunter-sih153"
    },
    "ciso": {
        "username": "ciso",
        "name": "Dr. Vikram Malhotra",
        "role": "CISO / Commander",
        "tier": "Executive Leadership",
        "badge": "COMMANDER",
        "avatar": "VM",
        "permissions": ["view_telemetry", "upload_pcap", "deep_xai", "mitre_navigator", "deploy_soar", "executive_briefing", "export_stix", "admin_config"],
        "token": "token-ciso-sih153"
    }
}

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = "password"

@app.get("/api/auth/users")
def get_demo_users():
    """Return preset profiles for one-click demo login."""
    return {"users": list(USERS_DB.values())}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = USERS_DB.get(req.username.lower())
    if not user:
        user = USERS_DB["analyst"]
    return {
        "success": True,
        "token": user["token"],
        "user": user
    }


# ──────────────────────────────────────────────
# Real-Time Packet Sniffer & Live Sensor Capture
# ──────────────────────────────────────────────

capture_lock = threading.Lock()
capture_state = {
    "is_active": False,
    "interface": "eth0 (Sensor Bridge)",
    "packet_count": 0,
    "byte_count": 0,
    "start_time": None,
    "pps": 0,
    "kbps": 0.0,
    "recent_packets": [],
    "buffer_records": []
}

def _capture_worker():
    """Simulated background packet sensor thread generating live network packets."""
    global capture_state
    
    protocols = ['TCP', 'UDP', 'TCP', 'TCP', 'ICMP']
    ports = [80, 443, 22, 6667, 3389, 8080, 53, 445]
    src_ips = ['192.168.1.105', '10.0.0.14', '198.51.100.4', '172.16.5.20']
    dst_ips = ['10.0.2.15', '10.0.2.20', '10.0.2.5', '192.168.1.1']
    
    while True:
        with capture_lock:
            if not capture_state["is_active"]:
                break
                
            batch_size = random.randint(5, 18)
            for _ in range(batch_size):
                proto = random.choice(protocols)
                port = random.choice(ports)
                src = random.choice(src_ips)
                dst = random.choice(dst_ips)
                size = random.randint(64, 1480)
                
                capture_state["packet_count"] += 1
                capture_state["byte_count"] += size
                
                pkt_entry = {
                    "id": capture_state["packet_count"],
                    "timestamp": round(time.time(), 2),
                    "proto": proto,
                    "src": f"{src}:{random.randint(40000, 65000)}",
                    "dst": f"{dst}:{port}",
                    "len": size,
                    "flags": "SYN" if port in [6667, 3389, 22] and random.random() > 0.4 else "ACK"
                }
                
                capture_state["recent_packets"].insert(0, pkt_entry)
                if len(capture_state["recent_packets"]) > 40:
                    capture_state["recent_packets"].pop()
                
                flow_entry = {
                    "src_ip": src,
                    "dst_ip": dst,
                    "sport": random.randint(40000, 65000),
                    "dport": port,
                    "proto": proto,
                    "packets": 1,
                    "bytes": size,
                    "dur": 0.05,
                    "totpkts": 1,
                    "totbytes": size,
                    "syn_flag": 1 if pkt_entry["flags"] == "SYN" else 0,
                    "ack_flag": 1 if pkt_entry["flags"] == "ACK" else 0,
                    "rst_flag": 1 if random.random() < 0.05 else 0
                }
                capture_state["buffer_records"].append(flow_entry)
                if len(capture_state["buffer_records"]) > 500:
                    capture_state["buffer_records"].pop(0)

            elapsed = max(0.1, time.time() - (capture_state["start_time"] or time.time()))
            capture_state["pps"] = int(capture_state["packet_count"] / elapsed)
            capture_state["kbps"] = round((capture_state["byte_count"] / 1024) / elapsed, 1)

        time.sleep(0.3)


@app.post("/api/capture/start")
def start_capture(interface: Optional[str] = "eth0 (Sensor Bridge)"):
    global capture_state
    with capture_lock:
        if capture_state["is_active"]:
            return {"status": "already_running", "state": capture_state}
            
        capture_state["is_active"] = True
        capture_state["interface"] = interface or "eth0 (Sensor Bridge)"
        capture_state["packet_count"] = 0
        capture_state["byte_count"] = 0
        capture_state["start_time"] = time.time()
        capture_state["recent_packets"] = []
        capture_state["buffer_records"] = []
        
        t = threading.Thread(target=_capture_worker, daemon=True)
        t.start()
        
    return {"status": "started", "interface": interface}


@app.post("/api/capture/stop")
def stop_capture():
    global capture_state
    with capture_lock:
        capture_state["is_active"] = False
    return {"status": "stopped", "total_packets": capture_state["packet_count"]}


@app.get("/api/capture/status")
def get_capture_status():
    with capture_lock:
        return {
            "is_active": capture_state["is_active"],
            "interface": capture_state["interface"],
            "packet_count": capture_state["packet_count"],
            "byte_count": capture_state["byte_count"],
            "pps": capture_state["pps"],
            "kbps": capture_state["kbps"],
            "recent_packets": capture_state["recent_packets"][:25],
            "buffered_flows": len(capture_state["buffer_records"])
        }


@app.post("/api/capture/snapshot")
def analyze_capture_snapshot():
    """Take current buffered packets from live sniffer and generate immediate NetThreat report."""
    with capture_lock:
        records = list(capture_state["buffer_records"])
        
    if not records:
        p = TEST_DATA_DIR / "01_benign_normal_traffic.csv"
        records = parse_uploaded_file(str(p), "live_stream_fallback.csv")
        
    report = generate_report(records, f"Live_Capture_{int(time.time())}.pcap")
    return JSONResponse(content=report)


# ──────────────────────────────────────────────
# What-If Defensive Countermeasure Simulator
# ──────────────────────────────────────────────

class WhatIfRequest(BaseModel):
    probability: float
    features: dict
    applied_defenses: List[str]

@app.post("/api/simulate/countermeasures")
def simulate_countermeasures(req: WhatIfRequest):
    result = simulate_what_if_defense(req.probability, req.features, req.applied_defenses)
    return JSONResponse(content=result)


# ──────────────────────────────────────────────
# Autonomous SOC AI Forensic Co-Pilot
# ──────────────────────────────────────────────

class CopilotChatRequest(BaseModel):
    message: str
    report_context: Optional[dict] = None

@app.post("/api/copilot/chat")
def copilot_chat(req: CopilotChatRequest):
    """
    Autonomous SOC AI Forensic Co-Pilot.
    Provides instant contextual answers grounded in active threat telemetry.
    """
    from datetime import datetime
    q = req.message.lower().strip()
    ctx = req.report_context or {}
    
    stage1 = ctx.get('stage1_output', {})
    stage2 = ctx.get('stage2_output', {})
    traffic = ctx.get('traffic_summary', {})
    severity = ctx.get('severity', 'UNKNOWN')
    family = stage2.get('dominant_family', 'Unknown')
    active_stage = ctx.get('mitre_kill_chain', {}).get('active_stage', 'Initial Reconnaissance')
    prob = list(stage1.get('forecast', {}).values())[0] if stage1.get('forecast') else 0.75
    src_ip = (ctx.get('blast_radius', {}).get('threat_origin')) or '198.51.100.14'
    top_ports = ctx.get('countermeasures', {}).get('target_indicators', {}).get('top_dst_ports', ['80', '443'])

    if any(k in q for k in ['why', 'classify', 'rbot', 'neris', 'reason', 'model', 'attribution']):
        reply = (
            f"**AI Attribution Rationale:** The Stage-2 CatBoost model assigned **{family}** "
            f"({stage2.get('dominant_family_probability', 0.85)*100:.1f}% posterior) because the packet telemetry "
            f"exhibits characteristic IRC command-and-control beacon signatures on ports `{', '.join(top_ports[:2])}`. "
            f"The flow profile matches known CTU-13 botnet behavior with asymmetric forward/backward byte ratios and rapid connection teardowns."
        )
    elif any(k in q for k in ['blast', 'lateral', 'spread', 'pivot', 'database', 'dc']):
        reply = (
            f"**Blast Radius Assessment:** The primary target host is `{ctx.get('geo_context', {}).get('target', {}).get('facility', 'Corporate Workstation')}`. "
            f"Based on observed reconnaissance across internal subnets, the attacker is forecasted with **85% probability** "
            f"to attempt lateral movement via SMB (TCP 445) toward the **Core Database Cluster (10.0.2.20)** within the next 8–15 minutes."
        )
    elif any(k in q for k in ['firewall', 'rule', 'iptables', 'contain', 'block', 'command']):
        reply = (
            f"**Immediate Defense Execution:**\n"
            f"To sever the active attack channel immediately, execute the generated SOAR directive on the perimeter firewall:\n"
            f"```bash\n"
            f"# 1. Drop attacker IP\n"
            f"iptables -I INPUT 1 -s {src_ip} -j DROP\n"
            f"# 2. Block outbound C2 port beaconing\n"
            f"iptables -I OUTPUT 1 -p tcp --dport {top_ports[0] if top_ports else 6667} -j DROP\n"
            f"```\n"
            f"Alternatively, click **'Execute Automated Containment'** in the SOAR Playbook panel to deploy this in 1-click."
        )
    elif any(k in q for k in ['ciso', 'executive', 'email', 'report', 'brief']):
        reply = (
            f"**Draft CISO Flash Bulletin:**\n"
            f"> **SUBJECT:** [PRIORITY-{severity}] Incident Containment Alert: {family} Threat Vector Detected\n>\n"
            f"> **EXECUTIVE SUMMARY:** At {datetime.now().strftime('%H:%M UTC')}, NetThreat AI flagged an escalating "
            f"**{severity}** risk incident ({prob*100:.1f}% attack probability). Attribution points to `{family}` "
            f"originating from `{src_ip}`. Active kill-chain phase: `{active_stage}`. Automated firewall countermeasures "
            f"have been staged; analyst review underway."
        )
    elif any(k in q for k in ['zero-day', 'ood', 'novel', 'entropy', 'unknown']):
        ood = ctx.get('zero_day_analysis', {})
        reply = (
            f"**Zero-Day / Novel Threat Vector Assessment:**\n"
            f"- **Verdict:** `{ood.get('verdict', 'KNOWN_FAMILY_VARIANT')}` ({ood.get('status_label', 'Standard')})\n"
            f"- **Normalized Shannon Entropy:** `{ood.get('normalized_entropy', 0.25)}` (Threshold: >0.75 for zero-day)\n"
            f"- **Confidence Calibration:** `{ood.get('confidence_calibration', 'CONFIDENT')}`\n"
            f"The feature divergence indicates this traffic { 'exhibits novel multi-vector evasion characteristics' if ood.get('is_zero_day') else 'conforms closely to known baseline malware families' }."
        )
    else:
        reply = (
            f"**NetThreat SOC Co-Pilot:** Telemetry analysis shows active threat **{family}** at **{severity}** threat level "
            f"({prob*100:.1f}% attack probability). Currently in **{active_stage}** phase targeting ports `{', '.join(top_ports[:3])}`. "
            f"I recommend executing the staged SOAR isolation playbook or reviewing the XAI feature attribution waterfall below."
        )

    return {
        "response": reply,
        "reply": reply,
        "latency_ms": 14,
        "timestamp": datetime.now().isoformat()
    }


# ──────────────────────────────────────────────
# One-Click Automated SOAR Remediation Engine
# ──────────────────────────────────────────────

class SoarExecutionRequest(BaseModel):
    attacker_ip: Optional[str] = "198.51.100.14"
    target_ip: Optional[str] = None
    target_ports: Optional[List[str]] = ["80", "443"]
    playbook_type: Optional[str] = "full_containment"
    playbook_id: Optional[str] = None
    actions: Optional[List[str]] = None

@app.post("/api/soar/execute")
def execute_soar_containment(req: SoarExecutionRequest):
    """
    Simulated Automated SOAR Containment Playbook Deployment.
    Returns live step-by-step audit logs and verified mitigation status.
    """
    from datetime import datetime
    import time
    timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
    ip = req.attacker_ip if req.attacker_ip != "198.51.100.14" else (req.target_ip or req.attacker_ip)
    ports = req.target_ports or ["80", "443"]
    p_type = req.playbook_type or req.playbook_id or "full_containment"
    logs = [
        f"[{timestamp}] [INIT] Initiating Automated SOAR Playbook: {p_type.upper()}",
        f"[{timestamp}] [AUTH] Authenticated as CISO / Incident Commander session via Kerberos token",
        f"[{timestamp}] [SSH] Connecting to Edge Security Gateway (192.168.1.1:22)... CONNECTED",
        f"[{timestamp}] [IPTABLES] Injecting quarantine rule: iptables -I INPUT 1 -s {ip} -j DROP ... SUCCESS",
        f"[{timestamp}] [SURICATA] Dynamically reloading live IDS ruleset with SID:1530010 ... ACTIVE",
        f"[{timestamp}] [EGRESS] Severing TCP ports {', '.join(ports[:3])} outbound channels ... ISOLATED",
        f"[{timestamp}] [SIEM] Broadcasting STIX 2.1 Threat Indicator bundle to Splunk/Sentinel ... SYNCED",
        f"[{timestamp}] [COMPLETE] Blast radius successfully barricaded in 1.14 seconds. Threat status: MITIGATED"
    ]
    steps = [
        {"action": log.split("] [")[1].split("]")[0] if "] [" in log else "EXEC", "log": log}
        for log in logs
    ]
    return {
        "status": "CONTAINED",
        "playbook": req.playbook_type,
        "execution_id": f"SOAR-RUN-{int(time.time())}",
        "steps": steps,
        "logs": logs,
        "mitigated_risk": 0.08,
        "mitigated_severity": "LOW",
        "timestamp": timestamp
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
