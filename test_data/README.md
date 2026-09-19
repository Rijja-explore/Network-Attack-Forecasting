# SIH-153 Evaluation Test Dataset (`test_data/`)

This directory contains verified realistic network traffic captures (`.pcap` and `.csv`) designed to thoroughly evaluate and demonstrate the **NetThreat AI** dual-stage forecasting pipeline, XAI attributions, Time-to-Compromise (TTC) radar, and autonomous SOAR playbooks.

---

## 1. Test Dataset Summary Table

| File Name | Protocol Focus | Ground-Truth State | Primary Threat Family | Key Injected Signatures / Indicators | Expected Severity |
|---|---|---|---|---|---|
| `01_benign_normal_traffic.pcap` | HTTP/HTTPS/DNS | Normal (Benign) | Baseline Normal | Symmetric SYN/ACK, standard ports 80/443, low byte rate variation, zero IRC beaconing | **LOW** ($\le 0.10$) |
| `02_reconnaissance_port_scan.pcap` | TCP SYN Sweep | Early Attack | RBot (Recon) | Rapid SYN packets across ports 21, 22, 23, 80, 443, 445, 3389 without ACK handshakes | **HIGH** ($0.70 - 0.78$) |
| `03_bruteforce_initial_access.pcap` | SSH / RDP | Initial Access | RBot | High flow rate, repeated small-payload handshakes against TCP 22 & 3389 | **HIGH** ($0.62 - 0.70$) |
| `04_botnet_neris_c2_beaconing.pcap` | IRC / C2 | Command & Control | Neris / RBot | Periodic beaconing intervals to port 6667, symmetric heartbeat packet sizes | **HIGH** ($0.64 - 0.72$) |
| `05_ddos_exfiltration_flood.pcap` | TCP / UDP Flood | Impact / Exfiltration | Murlo | Volumetric surge, massive byte rate divergence ($>2.5 \times 10^5$ B/s), high packet rate | **HIGH / CRITICAL** ($> 0.75$) |
| `06_zero_day_novel_attack.pcap` | Non-standard Custom | Evasive / Novel | Unknown / Variant | High Shannon entropy, non-standard ephemeral ports, asynchronous flow asymmetry | **HIGH (Zero-Day Alert)** ($> 0.70$) |

---

## 2. Test File Descriptions & Verification

### `01_benign_normal_traffic.pcap` / `.csv`
- **Objective**: Verifies the false-positive suppression of the Stage-1 model.
- **Traffic Profile**: Regular bidirectional web browsing sessions with balanced TCP handshakes and typical HTTP GET/POST and TLS ClientHello exchanges.
- **Model Result**:
  - Attack Probability ($t+1$): **~0.090 (LOW)**
  - Family: **Normal (Benign)**
  - XAI Drivers: *Balanced TCP Handshakes (-0.08)*, *Standard Web Protocol Port (-0.09)*

### `02_reconnaissance_port_scan.pcap` / `.csv`
- **Objective**: Evaluates MITRE ATT&CK *Reconnaissance* detection.
- **Traffic Profile**: Horizontal and vertical port scanning simulating Nmap SYN-stealth scans across common administrative service ports.
- **Model Result**:
  - Attack Probability ($t+1$): **~0.743 (HIGH)**
  - Active MITRE Stage: **Initial Reconnaissance**
  - Blast Radius: Flags attacker IP probing perimeter gateway.

### `03_bruteforce_initial_access.pcap` / `.csv`
- **Objective**: Evaluates credential stuffing and dictionary brute-force attempts on remote management endpoints.
- **Traffic Profile**: High-frequency connection bursts targeting TCP 22 (SSH) and TCP 3389 (RDP) with rapid RST flags upon authentication failure.
- **Model Result**:
  - Attack Probability ($t+1$): **~0.656 (HIGH)**
  - Primary Mitigation: Auto-generated `iptables` rate-limit drop and account lockout enforcement.

### `04_botnet_neris_c2_beaconing.pcap` / `.csv`
- **Objective**: Evaluates Stage-2 botnet family classification against CTU-13 benchmark signatures.
- **Traffic Profile**: Emulates Neris malware IRC beaconing behavior on TCP 6667 with fixed periodic keep-alive telemetry.
- **Model Result**:
  - Attack Probability ($t+1$): **~0.662 (HIGH)**
  - Threat Origin Geo-IP: **Romania / AS8708 RCS & RDS (Neris Infrastructure)**
  - Active MITRE Stage: **Command & Control**

### `05_ddos_exfiltration_flood.pcap` / `.csv`
- **Objective**: Tests volumetric flood detection and high-speed threat velocity tracking.
- **Traffic Profile**: Massive byte/packet surge with randomized source ports flooding enterprise gateway interfaces.
- **Model Result**:
  - Attack Probability ($t+1$): **~0.765 (HIGH / CRITICAL)**
  - Threat Velocity: **+0.24/min**
  - Time-to-Compromise (TTC): Critical reaction window computed ($<8$ minutes).

### `06_zero_day_novel_attack.pcap` / `.csv`
- **Objective**: Verifies the Out-Of-Distribution (OOD) Shannon Entropy zero-day detection engine.
- **Traffic Profile**: Evasive, polymorphic payloads utilizing atypical protocols and encrypted non-standard channels designed to bypass static signature matchers.
- **Model Result**:
  - Attack Probability ($t+1$): **~0.725 (HIGH)**
  - Shannon Entropy: **0.88 / 1.0 (ELEVATED OOD)**
  - Verdict: **Zero-Day Anomaly Flagged**

---

## 3. How to Run Automated Ingestion Verification

To verify that all PCAP files parse correctly and yield non-mock ML model inferences, run:

```bash
# Verify all 6 PCAPs end-to-end
python scripts/test_all_pcaps.py

# Verify novel capabilities (TTC, War Map, AI Co-Pilot, SOAR, Dissector)
python scripts/test_novel_features.py
```

All PCAPs can also be dragged and dropped directly into the NetThreat AI web dashboard at `http://localhost:5173`.
