"""Non-ML MITRE evidence rules used for analyst context, never ground truth."""

VALID_STAGES = {"Reconnaissance", "Command & Control", "Lateral Movement", "INSUFFICIENT_EVIDENCE"}

def infer_stage(change_score: float, destination_diversity_change: float = 0.0,
                packet_rate_change: float = 0.0) -> dict:
    """Return transparent, low-confidence evidence from observed packet-state changes."""
    if change_score <= 0:
        return {"stage": "INSUFFICIENT_EVIDENCE", "confidence": "LOW", "evidence": []}
    if destination_diversity_change > 0:
        return {"stage": "Reconnaissance", "confidence": "LOW", "evidence": ["Destination diversity increased"]}
    if packet_rate_change > 0:
        return {"stage": "Command & Control", "confidence": "LOW", "evidence": ["Packet-rate change observed"]}
    return {"stage": "INSUFFICIENT_EVIDENCE", "confidence": "LOW", "evidence": ["Change is non-specific"]}
