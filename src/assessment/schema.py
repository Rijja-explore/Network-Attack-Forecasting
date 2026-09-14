REQUIRED_FIELDS = {
    "case_id", "purpose", "input_context", "stage1_output", "stage2_output",
    "mitre_evidence", "xai_evidence", "confidence", "uncertainty", "severity",
    "recommended_action", "provenance",
}
VALID_SEVERITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

def validate_case(case: dict) -> list[str]:
    """Validate a recorded assessment without combining Stage-1/Stage-2 probabilities."""
    errors = sorted(REQUIRED_FIELDS - set(case))
    if case.get("severity") not in VALID_SEVERITIES:
        errors.append("invalid severity")
    provenance = str(case.get("provenance", "")).lower()
    if case.get("stage1_output") and case.get("stage2_output") and "separate" not in provenance and "independ" not in provenance:
        errors.append("combined contextual case must preserve separate provenance")
    return errors
