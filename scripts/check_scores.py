import sys
from pathlib import Path
sys.path.insert(0, '.')
from app.analyzer import extract_aggregate_features, compute_overall_risk, _compute_statistical_risk
from app.parsers import parse_csv

scenarios = [
    ('Benign', 'test_data/01_benign_normal_traffic.csv'),
    ('Port Scan', 'test_data/02_reconnaissance_port_scan.csv'),
    ('Brute Force', 'test_data/03_bruteforce_initial_access.csv'),
    ('Neris C2', 'test_data/04_botnet_neris_c2_beaconing.csv'),
    ('DDoS Flood', 'test_data/05_ddos_exfiltration_flood.csv'),
    ('Zero Day', 'test_data/06_zero_day_novel_attack.csv'),
]

from app.analyzer import extract_aggregate_features, compute_overall_risk, _compute_statistical_risk, generate_report

for name, rel_path in scenarios:
    p = Path(rel_path)
    if not p.exists():
        continue
    records = parse_csv(str(p))
    rep = generate_report(records, p.name)
    s1 = rep['stage1_output']
    s2 = rep['stage2_output']
    f_val = list(s1['forecast'].values())[0] if s1['forecast'] else 0.0
    sev = rep['severity']
    fam = s2['dominant_family']
    fam_p = s2['dominant_family_probability']
    ood = rep.get('zero_day_analysis', {}).get('verdict')
    print(f"{name:15} | t+1_risk={f_val:.3f} | sev={sev:8} | family={fam:15} ({fam_p:.2f}) | ood={ood}")
