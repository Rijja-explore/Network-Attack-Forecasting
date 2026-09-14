"""Quick offline environment and artifact validation; never trains a model."""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
required = ["streamlit", "pandas", "numpy"]
assets = [
    ROOT / "app" / "app.py",
    ROOT / "configs" / "model_registry.yaml",
    ROOT / "processed_data" / "final_demo" / "demo_cases.json",
    ROOT / "reports" / "final" / "FINAL_STATUS.json",
]
failed = []
for name in required:
    if importlib.util.find_spec(name) is None:
        failed.append(f"missing package: {name}")
for path in assets:
    if not path.exists():
        failed.append(f"missing asset: {path.relative_to(ROOT)}")
if not failed:
    try:
        cases = json.loads((ROOT / "processed_data" / "final_demo" / "demo_cases.json").read_text(encoding="utf-8"))
        if len(cases) < 4:
            failed.append("fewer than four demo cases")
    except Exception as exc:
        failed.append(f"invalid demo cases: {exc}")
print(f"Python {sys.version.split()[0]}")
print("ENVIRONMENT PASS" if not failed else "ENVIRONMENT FAIL")
for item in failed:
    print("-", item)
raise SystemExit(bool(failed))
