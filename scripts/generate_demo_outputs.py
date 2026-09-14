"""Validate packaged replay data; it deliberately does not regenerate scientific outputs."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "processed_data" / "final_demo" / "demo_cases.json"
cases = json.loads(source.read_text(encoding="utf-8"))
print(f"Validated {len(cases)} recorded demo cases from {source.relative_to(ROOT)}")
