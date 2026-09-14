import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def test_model_registry_matches_final_selection():
    registry = (ROOT / 'configs/model_registry.yaml').read_text(encoding='utf-8')
    final = json.loads((ROOT / 'reports/final/final_model_selection.json').read_text(encoding='utf-8'))
    assert 'xgboost_current_risk' in registry
    assert 'catboost_attack_family' in registry
    assert final['stage1_current_risk']['model'] == 'XGBoost'
    assert final['stage2_attack_family']['model'] == 'CatBoost'
