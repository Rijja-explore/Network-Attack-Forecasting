"""
Generate realistic test datasets (both .csv and .pcap) for all SIH-153 evaluation scenarios.
Scenarios:
1. 01_benign_normal_traffic
2. 02_reconnaissance_port_scan
3. 03_bruteforce_initial_access
4. 04_botnet_neris_c2_beaconing
5. 05_ddos_exfiltration_flood
6. 06_zero_day_novel_attack
"""
import os
import csv
import time
from pathlib import Path

try:
    import scapy.all as scapy
except ImportError:
    scapy = None

ROOT_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT_DIR / 'test_data'
OUT_DIR.mkdir(exist_ok=True)

CSV_COLUMNS = [
    'srcaddr', 'dstaddr', 'sport', 'dport', 'proto', 'dur',
    'totpkts', 'totbytes', 'packet_rate', 'byte_rate',
    'avg_packet_size', 'syn_count', 'ack_count', 'rst_count', 'fin_count'
]


def write_csv(filepath: Path, records: list):
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(records)
    print(f"  [+] Saved CSV: {filepath.name} ({len(records)} records)")


def write_pcap(filepath: Path, packets: list):
    if scapy and packets:
        scapy.wrpcap(str(filepath), packets)
        print(f"  [+] Saved PCAP: {filepath.name} ({len(packets)} packets)")


def generate_all():
    print(f"[*] Generating test datasets into: {OUT_DIR}\n")

    base_time = 1726650000.0

    # ─────────────────────────────────────────────────────────────
    # Scenario 1: Benign Normal Traffic
    # ─────────────────────────────────────────────────────────────
    print("[1/6] Generating Scenario 1: Benign Normal Traffic...")
    records_1 = []
    pkts_1 = []
    client_ip = "192.168.1.45"
    servers = [("142.250.190.46", 443, "TCP"), ("1.1.1.1", 53, "UDP"), ("8.8.8.8", 53, "UDP"), ("104.16.132.229", 443, "TCP")]

    sizes = [420, 850, 120, 1440, 68, 520, 1200, 310]
    for i in range(25):
        dst_ip, dst_port, proto = servers[i % len(servers)]
        src_port = 50000 + i
        dur = round(2.5 + (i * 0.2), 2)
        tot_pkts = 15 + (i % 8) * 3
        pkt_sz = sizes[i % len(sizes)]
        tot_bytes = tot_pkts * pkt_sz
        records_1.append({
            'srcaddr': client_ip, 'dstaddr': dst_ip, 'sport': src_port, 'dport': dst_port,
            'proto': proto, 'dur': dur, 'totpkts': tot_pkts, 'totbytes': tot_bytes,
            'packet_rate': round(tot_pkts / dur, 2), 'byte_rate': round(tot_bytes / dur, 2),
            'avg_packet_size': pkt_sz, 'syn_count': 1, 'ack_count': tot_pkts - 1, 'rst_count': 0, 'fin_count': 1
        })
        if scapy:
            t = base_time + i * 2.0
            if proto == "TCP":
                p1 = scapy.IP(src=client_ip, dst=dst_ip)/scapy.TCP(sport=src_port, dport=dst_port, flags="S", seq=1000)
                p1.time = t
                p2 = scapy.IP(src=dst_ip, dst=client_ip)/scapy.TCP(sport=dst_port, dport=src_port, flags="SA", seq=2000, ack=1001)
                p2.time = t + 0.02
                p3 = scapy.IP(src=client_ip, dst=dst_ip)/scapy.TCP(sport=src_port, dport=dst_port, flags="PA", seq=1001, ack=2001)/b"GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"
                p3.time = t + 0.05
                pkts_1.extend([p1, p2, p3])
            else:
                p = scapy.IP(src=client_ip, dst=dst_ip)/scapy.UDP(sport=src_port, dport=dst_port)/scapy.DNS(rd=1, qd=scapy.DNSQR(qname="google.com"))
                p.time = t
                pkts_1.append(p)

    write_csv(OUT_DIR / '01_benign_normal_traffic.csv', records_1)
    write_pcap(OUT_DIR / '01_benign_normal_traffic.pcap', pkts_1)

    # ─────────────────────────────────────────────────────────────
    # Scenario 2: Reconnaissance / Port Scan
    # ─────────────────────────────────────────────────────────────
    print("\n[2/6] Generating Scenario 2: Reconnaissance Port Scan...")
    records_2 = []
    pkts_2 = []
    scanner_ip = "198.51.100.89"
    target_ip = "10.0.0.15"
    scan_ports = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 8000, 8080, 8443, 8888]

    for i, port in enumerate(scan_ports):
        dur = 0.08
        records_2.append({
            'srcaddr': scanner_ip, 'dstaddr': target_ip, 'sport': 42000 + i, 'dport': port,
            'proto': 'TCP', 'dur': dur, 'totpkts': 3, 'totbytes': 180,
            'packet_rate': 37.5, 'byte_rate': 2250.0,
            'avg_packet_size': 60, 'syn_count': 2, 'ack_count': 0, 'rst_count': 1, 'fin_count': 0
        })
        if scapy:
            t = base_time + i * 0.1
            p1 = scapy.IP(src=scanner_ip, dst=target_ip)/scapy.TCP(sport=42000 + i, dport=port, flags="S", seq=100 + i)
            p1.time = t
            p2 = scapy.IP(src=target_ip, dst=scanner_ip)/scapy.TCP(sport=port, dport=42000 + i, flags="RA", seq=0, ack=101 + i)
            p2.time = t + 0.01
            pkts_2.extend([p1, p2])

    write_csv(OUT_DIR / '02_reconnaissance_port_scan.csv', records_2)
    write_pcap(OUT_DIR / '02_reconnaissance_port_scan.pcap', pkts_2)

    # ─────────────────────────────────────────────────────────────
    # Scenario 3: Brute Force / Initial Access
    # ─────────────────────────────────────────────────────────────
    print("\n[3/6] Generating Scenario 3: Brute Force Initial Access...")
    records_3 = []
    pkts_3 = []
    attacker_ip = "203.0.113.42"
    auth_target = "10.0.0.22"

    for i in range(40):
        target_port = 22 if i % 2 == 0 else 3389
        dur = 0.45
        tot_pkts = 18
        tot_bytes = 18 * 120
        records_3.append({
            'srcaddr': attacker_ip, 'dstaddr': auth_target, 'sport': 45000 + i, 'dport': target_port,
            'proto': 'TCP', 'dur': dur, 'totpkts': tot_pkts, 'totbytes': tot_bytes,
            'packet_rate': round(tot_pkts / dur, 2), 'byte_rate': round(tot_bytes / dur, 2),
            'avg_packet_size': 120, 'syn_count': 2, 'ack_count': 8, 'rst_count': 2, 'fin_count': 1
        })
        if scapy:
            t = base_time + i * 0.5
            p1 = scapy.IP(src=attacker_ip, dst=auth_target)/scapy.TCP(sport=45000 + i, dport=target_port, flags="S")
            p1.time = t
            p2 = scapy.IP(src=auth_target, dst=attacker_ip)/scapy.TCP(sport=target_port, dport=45000 + i, flags="SA")
            p2.time = t + 0.01
            p3 = scapy.IP(src=attacker_ip, dst=auth_target)/scapy.TCP(sport=45000 + i, dport=target_port, flags="PA")/b"SSH-2.0-OpenSSH_8.2p1\r\n"
            p3.time = t + 0.03
            p4 = scapy.IP(src=auth_target, dst=attacker_ip)/scapy.TCP(sport=target_port, dport=45000 + i, flags="R")
            p4.time = t + 0.08
            pkts_3.extend([p1, p2, p3, p4])

    write_csv(OUT_DIR / '03_bruteforce_initial_access.csv', records_3)
    write_pcap(OUT_DIR / '03_bruteforce_initial_access.pcap', pkts_3)

    # ─────────────────────────────────────────────────────────────
    # Scenario 4: Botnet Neris C2 Beaconing
    # ─────────────────────────────────────────────────────────────
    print("\n[4/6] Generating Scenario 4: Botnet Neris C2 Beaconing...")
    records_4 = []
    pkts_4 = []
    bot_ip = "192.168.1.105"
    c2_ip = "195.113.214.201"

    for i in range(30):
        dur = 12.0
        tot_pkts = 40
        tot_bytes = 40 * 180
        records_4.append({
            'srcaddr': bot_ip, 'dstaddr': c2_ip, 'sport': 48100 + i, 'dport': 6667,
            'proto': 'TCP', 'dur': dur, 'totpkts': tot_pkts, 'totbytes': tot_bytes,
            'packet_rate': round(tot_pkts / dur, 2), 'byte_rate': round(tot_bytes / dur, 2),
            'avg_packet_size': 180, 'syn_count': 1, 'ack_count': 35, 'rst_count': 0, 'fin_count': 1
        })
        if scapy:
            t = base_time + i * 15.0
            p1 = scapy.IP(src=bot_ip, dst=c2_ip)/scapy.TCP(sport=48100 + i, dport=6667, flags="PA")/b"NICK bot_neris_42\r\nUSER neris 0 * :Neris Bot\r\n"
            p1.time = t
            p2 = scapy.IP(src=c2_ip, dst=bot_ip)/scapy.TCP(sport=6667, dport=48100 + i, flags="PA")/b":c2.server 001 bot_neris_42 :Welcome to C2 IRC Network\r\n"
            p2.time = t + 0.15
            p3 = scapy.IP(src=bot_ip, dst=c2_ip)/scapy.TCP(sport=48100 + i, dport=6667, flags="PA")/b"PING :c2.server\r\n"
            p3.time = t + 5.0
            pkts_4.extend([p1, p2, p3])

    write_csv(OUT_DIR / '04_botnet_neris_c2_beaconing.csv', records_4)
    write_pcap(OUT_DIR / '04_botnet_neris_c2_beaconing.pcap', pkts_4)

    # ─────────────────────────────────────────────────────────────
    # Scenario 5: DDoS / Volumetric Flood
    # ─────────────────────────────────────────────────────────────
    print("\n[5/6] Generating Scenario 5: DDoS Volumetric Flood...")
    records_5 = []
    pkts_5 = []
    victim_ip = "10.0.0.50"

    for i in range(50):
        attacker_subnet = f"198.18.{i % 10}.{10 + (i * 3) % 200}"
        dur = 0.20
        tot_pkts = 250
        tot_bytes = 250 * 1400
        records_5.append({
            'srcaddr': attacker_subnet, 'dstaddr': victim_ip, 'sport': 10000 + i * 100, 'dport': 80,
            'proto': 'TCP', 'dur': dur, 'totpkts': tot_pkts, 'totbytes': tot_bytes,
            'packet_rate': 1250.0, 'byte_rate': 1750000.0,
            'avg_packet_size': 1400, 'syn_count': 150, 'ack_count': 10, 'rst_count': 5, 'fin_count': 0
        })
        if scapy:
            t = base_time + i * 0.05
            payload = b"X" * 1200
            p = scapy.IP(src=attacker_subnet, dst=victim_ip)/scapy.TCP(sport=10000 + i * 100, dport=80, flags="S")/payload
            p.time = t
            pkts_5.append(p)

    write_csv(OUT_DIR / '05_ddos_exfiltration_flood.csv', records_5)
    write_pcap(OUT_DIR / '05_ddos_exfiltration_flood.pcap', pkts_5)

    # ─────────────────────────────────────────────────────────────
    # Scenario 6: Out-of-Distribution / Zero-Day Novel Attack
    # ─────────────────────────────────────────────────────────────
    print("\n[6/6] Generating Scenario 6: Zero-Day Novel Attack...")
    records_6 = []
    pkts_6 = []
    novel_actor = "185.220.101.5"
    internal_core = "10.0.0.5"

    for i in range(35):
        exotic_ports = [31337, 44444, 55555, 9999, 1337, 27182]
        dport = exotic_ports[i % len(exotic_ports)]
        dur = 0.40
        tot_pkts = 180
        tot_bytes = 180 * 1100
        records_6.append({
            'srcaddr': novel_actor, 'dstaddr': internal_core, 'sport': 61000 + i, 'dport': dport,
            'proto': 'TCP', 'dur': dur, 'totpkts': tot_pkts, 'totbytes': tot_bytes,
            'packet_rate': 450.0, 'byte_rate': 495000.0,
            'avg_packet_size': 1100, 'syn_count': 45, 'ack_count': 10, 'rst_count': 25, 'fin_count': 2
        })
        if scapy:
            t = base_time + i * 0.4
            p1 = scapy.IP(src=novel_actor, dst=internal_core)/scapy.TCP(sport=61000 + i, dport=dport, flags="FPU")/b"\xde\xad\xbe\xef\xca\xfe\xba\xbe"
            p1.time = t
            p2 = scapy.IP(src=internal_core, dst=novel_actor)/scapy.TCP(sport=dport, dport=61000 + i, flags="R")
            p2.time = t + 0.05
            pkts_6.extend([p1, p2])

    write_csv(OUT_DIR / '06_zero_day_novel_attack.csv', records_6)
    write_pcap(OUT_DIR / '06_zero_day_novel_attack.pcap', pkts_6)

    print("\n[SUCCESS] All 12 test files successfully generated in 'test_data/'!")


if __name__ == '__main__':
    generate_all()
