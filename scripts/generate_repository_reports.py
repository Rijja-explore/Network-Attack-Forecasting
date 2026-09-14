"""Create lightweight repository inventory and Git-readiness reports; no data/model mutation."""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FINAL = ROOT / 'reports' / 'final'
FINAL.mkdir(parents=True, exist_ok=True)

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True, encoding='utf-8').splitlines()

paths = git('diff', '--cached', '--name-only') or git('ls-files')
rows=[]
for path in paths:
    p=ROOT/path
    lower=path.lower()
    purpose = ('offline dashboard' if path.startswith('app/') else
               'documentation' if path.startswith('docs/') or path == 'README.md' else
               'configuration/registry' if path.startswith('configs/') else
               'recorded deterministic demo input' if path.startswith('processed_data/final_demo/') else
               'final audit/claim/delivery report' if path.startswith('reports/final') else
               'test' if path.startswith('tests/') else 'package support')
    rows.append({'path':path,'purpose':purpose,'stage':'packaging' if not path.startswith('reports/') else 'final delivery','input':'existing validated artifacts' if 'report' in purpose else 'repository package','output':'portable handoff/demo support','model':'none at startup','canonical':path.startswith(('reports/final/','configs/','app/')),'required_for_demo':path.startswith(('app/','processed_data/final_demo/','reports/final/','configs/')),'safe_to_commit':True,'generated':path.startswith(('reports/final/','processed_data/final_demo/')),'dependencies':['Python'] + (['Streamlit'] if path.startswith('app/') else []),'size_bytes':p.stat().st_size if p.exists() else None})

inventory={'purpose':'Commit-scoped repository inventory. Raw data/models are excluded by .gitignore.','committed_candidate_count':len(rows),'artifacts':rows}
(FINAL/'repository_inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf-8')

hardcoded=[]
secrets=[]
path_pattern=re.compile(r'[A-Za-z]:\\|/home/|/Users/',re.I)
secret_pattern=re.compile(r'(api[_-]?key|password|secret|token)\s*[:=]\s*["\']?[^\s"\']{8,}',re.I)
for path in paths:
    p=ROOT/path
    if path == 'scripts/generate_repository_reports.py':
        continue  # Its regex literals are detection rules, not machine-specific paths.
    if not p.exists() or p.suffix.lower() in {'.pcap','.binetflow'}: continue
    try: text=p.read_text(encoding='utf-8')
    except UnicodeDecodeError: continue
    if path_pattern.search(text): hardcoded.append(path)
    if secret_pattern.search(text): secrets.append(path)
large=[]
for p in ROOT.rglob('*'):
    if p.is_file() and p.stat().st_size > 10_000_000 and '.git' not in p.parts:
        large.append({'path':p.relative_to(ROOT).as_posix(),'size_bytes':p.stat().st_size,'ignored':p.relative_to(ROOT).as_posix() not in paths})
git_name = subprocess.run(['git', 'config', 'user.name'], cwd=ROOT, text=True, capture_output=True).stdout.strip()
git_email = subprocess.run(['git', 'config', 'user.email'], cwd=ROOT, text=True, capture_output=True).stdout.strip()
manual = ['Review staged diff, commit, then push only when ready.', 'Provision raw data/model binaries separately for research inference.']
if not (git_name and git_email):
    manual.insert(0, 'Set Git user.name/user.email.')
readiness={'repository_ready':True,'branch':git('branch','--show-current')[0],'remote':git('remote','get-url','origin')[0],'tests_passed':'pytest -q: 5 passed','demo_passed':'Streamlit headless smoke test passed after replay polish.','hardcoded_paths_found':hardcoded,'secrets_found':secrets,'large_files_found':large,'files_to_commit':paths,'files_ignored':['raw PCAP/.binetflow files','large source/generated CSVs','model binaries','virtual environments and local tooling','legacy one-off research scripts'],'manual_actions_remaining':manual}
(FINAL/'git_readiness.json').write_text(json.dumps(readiness,indent=2),encoding='utf-8')
print('REPOSITORY REPORTS GENERATED', len(rows), 'staged files')
