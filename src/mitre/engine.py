"""
MITRE ATT&CK Kill-Chain Inference & Predictive Next-TTP Engine.
Provides empirical Markov Tactical Transition Probabilities and Next-TTP Forecasting.
"""
from typing import Dict, Any, List

VALID_STAGES = {
    "Reconnaissance",
    "Initial Access",
    "Lateral Movement",
    "Command & Control",
    "Exfiltration & Impact",
    "INSUFFICIENT_EVIDENCE",
}

KILL_CHAIN_STAGES = [
    {
        "id": "recon",
        "name": "Reconnaissance",
        "tactic": "TA0043",
        "techniques": ["T1046: Network Service Discovery", "T1595: Active Scanning"],
        "description": "Port scanning, host sweeps, and vulnerability probing."
    },
    {
        "id": "access",
        "name": "Initial Access",
        "tactic": "TA0001",
        "techniques": ["T1190: Exploit Public-Facing App", "T1110: Brute Force"],
        "description": "Targeted exploit attempts, authentication bursts, or service login."
    },
    {
        "id": "lateral",
        "name": "Lateral Movement",
        "tactic": "TA0008",
        "techniques": ["T1021: Remote Services (SMB/RDP)", "T1210: Exploitation of Remote Services"],
        "description": "Internal subnet traversal, RPC/SMB propagation, or peer discovery."
    },
    {
        "id": "c2",
        "name": "Command & Control",
        "tactic": "TA0011",
        "techniques": ["T1071: Application Layer Protocol", "T1573: Encrypted Channel"],
        "description": "Periodic beaconing, botnet heartbeat, or remote command receipt."
    },
    {
        "id": "exfil",
        "name": "Exfiltration & Impact",
        "tactic": "TA0010",
        "techniques": ["T1048: Exfiltration Over Alternative Protocol", "T1498: Network DoS"],
        "description": "High-volume data transfer, resource hijacking, or network denial of service."
    }
]

# Baseline Markov Tactical Transition Matrix: P(Next Stage | Current Stage)
TRANSITION_MATRIX = {
    "Reconnaissance": {
        "Initial Access": 0.62,
        "Lateral Movement": 0.20,
        "Command & Control": 0.12,
        "Exfiltration & Impact": 0.06,
    },
    "Initial Access": {
        "Lateral Movement": 0.54,
        "Command & Control": 0.32,
        "Exfiltration & Impact": 0.10,
        "Reconnaissance": 0.04,
    },
    "Lateral Movement": {
        "Command & Control": 0.52,
        "Exfiltration & Impact": 0.36,
        "Initial Access": 0.08,
        "Reconnaissance": 0.04,
    },
    "Command & Control": {
        "Exfiltration & Impact": 0.72,
        "Lateral Movement": 0.18,
        "Command & Control": 0.08,
        "Reconnaissance": 0.02,
    },
    "Exfiltration & Impact": {
        "Command & Control": 0.45,
        "Exfiltration & Impact": 0.45,
        "Lateral Movement": 0.08,
        "Reconnaissance": 0.02,
    },
    "INSUFFICIENT_EVIDENCE": {
        "Reconnaissance": 0.40,
        "Initial Access": 0.30,
        "Command & Control": 0.20,
        "Exfiltration & Impact": 0.10,
    }
}


def infer_stage(change_score: float, destination_diversity_change: float = 0.0,
                packet_rate_change: float = 0.0) -> dict:
    """Legacy backward-compatible function returning low-confidence evidence."""
    if change_score <= 0:
        return {"stage": "INSUFFICIENT_EVIDENCE", "confidence": "LOW", "evidence": []}
    if destination_diversity_change > 0:
        return {"stage": "Reconnaissance", "confidence": "LOW", "evidence": ["Destination diversity increased"]}
    if packet_rate_change > 0:
        return {"stage": "Command & Control", "confidence": "LOW", "evidence": ["Packet-rate change observed"]}
    return {"stage": "INSUFFICIENT_EVIDENCE", "confidence": "LOW", "evidence": ["Change is non-specific"]}


def evaluate_kill_chain(features: Dict[str, Any], family: str = "Unknown", current_risk: float = 0.5) -> Dict[str, Any]:
    """
    Comprehensive Kill-Chain evaluation computing:
    1. Likelihood across all 5 MITRE tactics
    2. Active stage determination
    3. Predictive Next-TTP via Markov transitions
    4. Preemptive tactical defense recommendations
    """
    # Extract behavioral signals
    unique_dst_ips = features.get('unique_dst_ips', 1)
    unique_dst_ports = features.get('unique_dst_ports', 1)
    packet_rate = features.get('packet_rate_mean', features.get('mean_flow_pkts_s', 50))
    byte_rate = features.get('byte_rate_mean', features.get('mean_flow_byts_s', 10000))
    syn_ack_ratio = features.get('syn_ack_ratio', 1.0)
    packet_size_mean = features.get('packet_size_mean', features.get('mean_pkt_size_avg', 500))
    top_ports = [str(p) for p in features.get('top_dst_ports', [])]

    # Calculate evidence scores for each tactic
    recon_score = 0.0
    if unique_dst_ips > 5 or unique_dst_ports > 10:
        recon_score += 0.4
    if syn_ack_ratio > 1.8:
        recon_score += 0.4
    if packet_size_mean < 250:
        recon_score += 0.2

    access_score = 0.0
    access_ports = {'22', '80', '443', '3389', '8080', '21', '23'}
    if any(p in access_ports for p in top_ports):
        access_score += 0.45
    if packet_rate > 300:
        access_score += 0.35
    if family in ['Brute Force', 'SSH-Patator', 'FTP-Patator']:
        access_score += 0.4

    lateral_score = 0.0
    lateral_ports = {'445', '139', '135', '389', '88'}
    if any(p in lateral_ports for p in top_ports):
        lateral_score += 0.5
    if unique_dst_ips > 10 and unique_dst_ports <= 3:
        lateral_score += 0.4
    if family in ['Virut', 'Worm']:
        lateral_score += 0.4

    c2_score = 0.0
    if family in ['Neris', 'Rbot', 'Murlo', 'Menti', 'Sogou']:
        c2_score += 0.5
    if 50 <= packet_rate <= 350 and packet_size_mean < 400:
        c2_score += 0.35
    if any(p in {'6667', '443', '80', '53', '8000', '8088'} for p in top_ports):
        c2_score += 0.25

    exfil_score = 0.0
    if byte_rate > 100000 or packet_rate > 800:
        exfil_score += 0.5
    if packet_size_mean > 900:
        exfil_score += 0.4
    if family in ['DDoS', 'DoS', 'Exfiltration']:
        exfil_score += 0.4

    scores = {
        "Reconnaissance": round(min(1.0, recon_score), 2),
        "Initial Access": round(min(1.0, access_score), 2),
        "Lateral Movement": round(min(1.0, lateral_score), 2),
        "Command & Control": round(min(1.0, c2_score), 2),
        "Exfiltration & Impact": round(min(1.0, exfil_score), 2),
    }

    # If overall risk is low, mark as insufficient/initial
    if current_risk < 0.25:
        active_stage = "Reconnaissance" if recon_score > 0.3 else "INSUFFICIENT_EVIDENCE"
    else:
        active_stage = max(scores, key=scores.get)
        if scores[active_stage] == 0:
            active_stage = "Command & Control" if family in ['Neris', 'Rbot'] else "Reconnaissance"

    # Next-TTP Markov Forecast
    transitions = TRANSITION_MATRIX.get(active_stage, TRANSITION_MATRIX["INSUFFICIENT_EVIDENCE"]).copy()
    
    # Adjust transitions by threat family characteristics
    if family in ['Neris', 'Rbot'] and 'Command & Control' in transitions:
        transitions['Command & Control'] += 0.15
    elif family in ['Virut'] and 'Lateral Movement' in transitions:
        transitions['Lateral Movement'] += 0.15
    elif family in ['DoS', 'DDoS'] and 'Exfiltration & Impact' in transitions:
        transitions['Exfiltration & Impact'] += 0.20

    # Normalize transition probabilities
    total_weight = sum(transitions.values())
    normalized_transitions = {
        stage: round((weight / total_weight) * 100, 1)
        for stage, weight in transitions.items()
    }
    
    forecasted_next = max(normalized_transitions, key=normalized_transitions.get)
    next_prob = normalized_transitions[forecasted_next]

    # Preemptive tactical actions per forecasted stage
    preemptive_tactics = {
        "Initial Access": "Enforce Multi-Factor Authentication & dynamic rate-limiting on ingress login endpoints.",
        "Lateral Movement": "Restrict internal subnet RPC/SMB forwarding (ports 445/139) to isolate lateral spread.",
        "Command & Control": "Apply egress DNS inspection and kill unapproved outbound IRC/TLS sockets to sever beaconing.",
        "Exfiltration & Impact": "Throttle outbound bandwidth to external IPs and prepare egress volume alerts in SIEM.",
        "Reconnaissance": "Deploy honeypot listener and drop scanning IPs at border firewall.",
    }

    # Order of stages in kill chain
    stage_order = [s["name"] for s in KILL_CHAIN_STAGES]
    try:
        active_idx = stage_order.index(active_stage)
    except ValueError:
        active_idx = 0

    chain_representation = []
    for idx, stage_def in enumerate(KILL_CHAIN_STAGES):
        s_name = stage_def["name"]
        if s_name == active_stage:
            status = "ACTIVE"
        elif s_name == forecasted_next:
            status = "FORECASTED_NEXT"
        elif idx < active_idx:
            status = "COMPLETED"
        else:
            status = "FUTURE_HORIZON"

        chain_representation.append({
            "id": stage_def["id"],
            "name": s_name,
            "tactic": stage_def["tactic"],
            "techniques": stage_def["techniques"],
            "description": stage_def["description"],
            "status": status,
            "observed_score": scores.get(s_name, 0.0),
            "transition_probability": normalized_transitions.get(s_name, 0.0),
        })

    return {
        "active_stage": active_stage,
        "active_evidence_score": scores.get(active_stage, 0.5),
        "forecasted_next_stage": forecasted_next,
        "forecast_probability": next_prob,
        "lead_time_estimate": "Next 1 to 3 time horizons (approx. 5–15 mins before full escalation)",
        "preemptive_recommendation": preemptive_tactics.get(forecasted_next, "Deploy proactive containment rules."),
        "transition_probabilities": normalized_transitions,
        "stage_evidence_scores": scores,
        "chain": chain_representation,
    }
