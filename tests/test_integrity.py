import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def test_final_status_and_integrity_pass():
    status = json.loads((ROOT / 'reports/final/FINAL_STATUS.json').read_text(encoding='utf-8'))
    audit = json.loads((ROOT / 'reports/final/integrity_audit.json').read_text(encoding='utf-8'))
    assert status['DATA_STATUS'] == 'PASS'
    assert audit['overall_status'].startswith('PASS')

def test_stage2_probability_integrity_reported():
    report = json.loads((ROOT / 'reports/stage2_state/stage2_attack_state_report.json').read_text(encoding='utf-8'))
    assert report['probability_sum_max_absolute_error'] < 1e-9
    assert report['missing_values'] == 0
    assert report['infinite_values'] == 0
