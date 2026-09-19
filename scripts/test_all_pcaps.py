"""Test all 6 PCAP files via the /api/analyze endpoint."""
import urllib.request, json

BASE = 'http://127.0.0.1:8000'
boundary = '----SIH153TestBoundary'

pcaps = [
    '01_benign_normal_traffic.pcap',
    '02_reconnaissance_port_scan.pcap',
    '03_bruteforce_initial_access.pcap',
    '04_botnet_neris_c2_beaconing.pcap',
    '05_ddos_exfiltration_flood.pcap',
    '06_zero_day_novel_attack.pcap',
]

for fname in pcaps:
    data = open(f'test_data/{fname}', 'rb').read()
    header = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{fname}"\r\n'
        f'Content-Type: application/vnd.tcpdump.pcap\r\n\r\n'
    ).encode('latin-1')
    footer = f'\r\n--{boundary}--\r\n'.encode('latin-1')
    body = header + data + footer
    req = urllib.request.Request(
        f'{BASE}/api/analyze',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    try:
        res = urllib.request.urlopen(req, timeout=10)
        rep = json.loads(res.read())
        fam = rep.get('stage2_output', {}).get('dominant_family', '?')
        sev = rep.get('severity', '?')
        risk = list(rep.get('stage1_output', {}).get('forecast', {}).values())[0]
        print(f"{fname:35} | risk={risk:.3f} | sev={sev:8} | family={fam}")
    except Exception as e:
        print(f"{fname:35} | ERROR: {e}")
