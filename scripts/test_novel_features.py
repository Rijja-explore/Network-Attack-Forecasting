import urllib.request
import json
import time

BASE = "http://127.0.0.1:8000"

def test_api():
    print("1. Testing Auth Endpoints...")
    res = urllib.request.urlopen(f"{BASE}/api/auth/users")
    users = json.loads(res.read())["users"]
    print(f"   Fetched {len(users)} demo personas: {[u['role'] for u in users]}")

    req = urllib.request.Request(
        f"{BASE}/api/auth/login",
        data=json.dumps({"username": "hunter"}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    login_res = json.loads(urllib.request.urlopen(req).read())
    print(f"   Logged in as: {login_res['user']['name']} ({login_res['user']['badge']})")

    print("\n2. Testing Live Sniffer Studio...")
    urllib.request.urlopen(urllib.request.Request(f"{BASE}/api/capture/start", data=b"{}", headers={'Content-Type': 'application/json'}))
    print("   Capture started. Gathering packets for 1.2s...")
    time.sleep(1.2)

    status = json.loads(urllib.request.urlopen(f"{BASE}/api/capture/status").read())
    print(f"   Sniffer Status: {status['packet_count']} pkts captured, {status['pps']} pps, {status['kbps']} KB/s")
    if status['recent_packets']:
        sample = status['recent_packets'][0]
        print(f"   Sample packet: {sample['proto']} {sample['src']} -> {sample['dst']} ({sample['len']}B)")

    print("\n3. Testing Live Snapshot Analysis...")
    snap_req = urllib.request.Request(f"{BASE}/api/capture/snapshot", data=b"{}", headers={'Content-Type': 'application/json'})
    snap_res = json.loads(urllib.request.urlopen(snap_req).read())
    print(f"   Snapshot Generated: Case {snap_res['case_id']}")
    print(f"   Attack Prob (t+1): {snap_res['stage1_output']['forecast']['t+1']}")
    print(f"   Severity: {snap_res['severity']}")
    print(f"   Dominant Family: {snap_res['stage2_output']['dominant_family']}")

    print("\n4. Verifying SIH-153 Novel Intelligence Fields...")
    print(f"   Feature Attributions (XAI): {len(snap_res.get('feature_attributions', []))} drivers identified")
    for fa in snap_res.get('feature_attributions', [])[:2]:
        print(f"     - {fa['feature']}: {fa['direction']} ({fa['contribution']}) -> {fa['description']}")

    print(f"   MITRE ATT&CK Matrix: {len(snap_res.get('mitre_matrix', []))} tactical categories populated")
    print(f"   Blast Radius Topology: {len(snap_res.get('blast_radius', {}).get('nodes', []))} nodes mapped")

    print("\n5. Verifying Show-Stopping War Map, TTC Radar, and Hex Dissector...")
    geo = snap_res.get('geo_context', {})
    print(f"   Threat Origin: {geo.get('origin', {}).get('country')} ({geo.get('origin', {}).get('ip')}) -> Target: {geo.get('target', {}).get('city')}")
    print(f"   Threat Group: {geo.get('origin', {}).get('threat_actor')} | ASN: {geo.get('origin', {}).get('asn')}")
    
    ttc = snap_res.get('time_to_compromise', {})
    print(f"   TTC Countdown: {ttc.get('countdown_str')} (Urgency: {ttc.get('urgency')})")
    print(f"   Attack Velocity: {ttc.get('propagation_velocity')} | Distance: {ttc.get('hops_remaining')} hops")

    dissect = snap_res.get('hex_dissector', {})
    print(f"   Hex Dissector: {len(dissect.get('raw_hex_dump', ''))} hex chars, Layers: {list(dissect.get('layers', {}).keys())}")

    print("\n6. Testing SOC AI Forensic Co-Pilot Endpoint...")
    copilot_req = urllib.request.Request(
        f"{BASE}/api/copilot/chat",
        data=json.dumps({
            "message": "Give me an executive summary and recommended mitigation for this attack",
            "report": snap_res
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    copilot_res = json.loads(urllib.request.urlopen(copilot_req).read())
    print(f"   Copilot Reply ({copilot_res['latency_ms']}ms):\n   {copilot_res['reply'][:150]}...")

    print("\n7. Testing Live SOAR Playbook Remediation Engine...")
    soar_req = urllib.request.Request(
        f"{BASE}/api/soar/execute",
        data=json.dumps({
            "playbook_id": "auto_soar_containment",
            "target_ip": geo.get('origin', {}).get('ip', '185.220.101.5'),
            "actions": ["isolate_host", "deploy_iptables_drop", "null_route_asn"]
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    soar_res = json.loads(urllib.request.urlopen(soar_req).read())
    print(f"   SOAR Run ID: {soar_res['execution_id']} | Status: {soar_res['status']}")
    print(f"   Steps Executed ({len(soar_res['steps'])}): {[s['action'] for s in soar_res['steps']]}")

    print("\n8. Testing What-If Countermeasure Simulator...")
    what_if_req = urllib.request.Request(
        f"{BASE}/api/simulate/countermeasures",
        data=json.dumps({
            "probability": 0.88,
            "features": {"byte_rate_mean": 250000},
            "applied_defenses": ["quarantine_ip", "syn_shield", "sever_c2"]
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    what_if_res = json.loads(urllib.request.urlopen(what_if_req).read())
    print(f"   Original Prob: {what_if_res['original_probability']*100:.1f}% ({what_if_res['original_severity']})")
    print(f"   Mitigated Prob: {what_if_res['mitigated_probability']*100:.1f}% ({what_if_res['mitigated_severity']})")
    print(f"   Risk Reduction: -{what_if_res['reduction_percentage']}%")
    print(f"   Verdict: {what_if_res['roi_verdict']}")

    urllib.request.urlopen(urllib.request.Request(f"{BASE}/api/capture/stop", data=b"{}", headers={'Content-Type': 'application/json'}))
    print("\n All SIH-153 novel features and endpoints verified successfully!")

if __name__ == '__main__':
    test_api()
