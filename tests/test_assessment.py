import json
from pathlib import Path
from src.assessment.schema import validate_case

ROOT = Path(__file__).resolve().parents[1]

def test_demo_assessments_have_required_fields_and_safe_provenance():
    cases = json.loads((ROOT / 'processed_data/final_demo/demo_cases.json').read_text(encoding='utf-8'))
    assert len(cases) >= 4
    assert all(not validate_case(case) for case in cases)
    combined = next(c for c in cases if c['case_id'] == 'CASE_4_CONTEXTUAL_EVIDENCE_CHANNELS')
    assert 'independently sourced' in combined['provenance']
