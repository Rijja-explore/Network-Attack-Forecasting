"""Launch the offline dashboard from any working directory."""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
raise SystemExit(subprocess.call([sys.executable, "-m", "streamlit", "run", str(root / "app" / "app.py")], cwd=root))
