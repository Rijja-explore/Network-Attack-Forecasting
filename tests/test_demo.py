import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def test_demo_assets_and_app_syntax():
    app = ROOT / 'app/app.py'
    ast.parse(app.read_text(encoding='utf-8'))
    cases = json.loads((ROOT / 'processed_data/final_demo/demo_cases.json').read_text(encoding='utf-8'))
    assert {c['case_id'] for c in cases} >= {
        'CASE_1_STABLE_LOW_RISK', 'CASE_2_PERSISTENT_HIGH_RISK',
        'CASE_3_PACKET_FAMILY_IDENTIFICATION', 'CASE_4_CONTEXTUAL_EVIDENCE_CHANNELS'}
