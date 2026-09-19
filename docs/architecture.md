# NetThreat AI — System Architecture Document (SIH-153)
**Challenge Statement:** AI-Based Network Attack Forecasting using World Models & State Transition Dynamics  
**Target Environments:** Enterprise Networks & Critical Information Infrastructure (CII)

---

## 1. Executive Summary & Conceptual Approach
Traditional Intrusion Detection Systems (IDS) inspect network flows in isolation, applying static pattern-matching or single-flow binary classification. This discards the temporal progression of a multi-stage cyber infiltration (e.g., slow port reconnaissance $\rightarrow$ initial access credential stuffing $\rightarrow$ C2 beaconing $\rightarrow$ lateral spread).

**NetThreat AI** introduces a **World Model** approach to cyber defense. Rather than asking *"is this isolated packet malicious?"*, it models the causal transition dynamics:
$$\mathcal{P}(S_{t+1} \mid S_t)$$
where $S_t$ is the structured network state at time $t$. By projecting state evolution across $K$ time horizons ($t+1 \dots t+5$), NetThreat AI anticipates attack progression, computes a **Time-to-Compromise (TTC)** defensive lead-time window, maps evolving behavior to **MITRE ATT&CK** kill-chain stages, and executes autonomous **SOAR** remediation before crown-jewel assets are compromised.

---

## 2. Multi-Level Traffic Ingestion & Feature Engineering

The pipeline ingests raw network telemetry at two complementary levels of abstraction:

```
                      RAW NETWORK TELEMETRY
                                │
       ┌────────────────────────┴────────────────────────┐
       ▼                                                 ▼
[LEVEL 1: Flow-Level Telemetry]           [LEVEL 2: Packet-Level Telemetry]
• IPFIX / NetFlow 5-Tuple records         • PCAP Raw Wire Dissection (Scapy)
• TCP Flag Bitmasks (SYN, ACK, RST, FIN)  • Time-To-Live (TTL) & Variance
• Bidirectional Flow Ratios (Fwd / Bwd)   • TCP Window Size & Flags
• Flow Duration & Packet/Byte Counts      • IP Fragmentation & Payload Sizes
• Inter-Arrival Time (IAT) Statistics     • Sequential & Random Port Patterns
```

- **Flow-Level Attributes:** Capture macroeconomic traffic volume, session symmetry, and volumetric anomalies (e.g., SYN flooding, high-bandwidth exfiltration).
- **Packet-Level Attributes:** Capture micro-timing subtleties, evasive slow port scanning, and fragmented protocol sequences designed to bypass flow thresholds.

---

## 3. Dual-Stage World Model & State-Transition Dynamics

The AI core is structured as a decoupled two-stage inference engine:

```
                            Network State Vector S_t
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
      [STAGE 1: FORECASTING ENGINE]             [STAGE 2: ATTRIBUTION ENGINE]
       • Temporal XGBoost & GRU RNN              • Multiclass CatBoost Classifier
       • Supervised Dynamics P(S_t+1 | S_t)      • Trained on CTU-13 Benchmark
       • Multi-Step Horizon (t+1 ... t+5)        • Attributes Botnet Families
       • Time-to-Compromise (TTC) Radar          • RBot, Neris, Murlo, Virut
                 │                                           │
                 └─────────────────────┬─────────────────────┘
                                       ▼
                     [OUT-OF-DISTRIBUTION (OOD) ENGINE]
                     • Normalized Shannon Entropy H(X)
                     • Identifies Unseen / Zero-Day Evasion
```

- **Stage 1 (State Dynamics):** Ingests sliding temporal windows, computing the transition probability into an escalated attack state across $K=5$ future intervals.
- **Stage 2 (Threat Attribution):** Evaluates packet-level feature distributions to classify known botnet family signatures.
- **OOD Detection:** Quantifies softmax prediction divergence to flag zero-day attacks when traffic deviates from established training distributions.

---

## 4. Infiltration Prediction, MITRE Mapping & Explainable AI (XAI)

For every analysis snapshot, the platform computes four actionable decision-support dimensions:

1. **Infiltration Probability Trajectory:** Projects multi-horizon attack probability ($t+1$ to $t+5$), categorizing trajectory as *Accelerating*, *Persistent*, or *Suppressed*.
2. **Preemptive Time-to-Compromise (TTC):** Calculates lead time in minutes and seconds remaining before lateral movement reaches internal subnets.
3. **MITRE ATT&CK Phase Mapping:** Rules and behavioral heuristics map active telemetry to tactical kill-chain phases:
   - *Reconnaissance* (T1046 Network Service Scanning)
   - *Initial Access* (T1110 Brute Force)
   - *Command and Control* (T1071 Application Layer Protocol, T1043 Non-Standard Port)
   - *Lateral Movement* (T1021 Remote Services / SMB)
   - *Exfiltration / Impact* (T1499 Endpoint Denial of Service)
4. **SHAP-Inspired Feature Attribution:** Generates a bidirectional waterfall unboxing the ML prediction into **Risk-Elevating Drivers (+)** and **Risk-Suppressing Factors (-)**.

---

## 5. Autonomous SOAR Playbook Remediation & Defense War-Gaming

```
                       Inferred Threat Intelligence
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
     ["What-If" Countermeasure]              [One-Click Automated SOAR]
     • Dynamic Defense Sandbox               • Linux iptables Drop Chains
     • Toggles: IP Quarantine, SYN Shield,   • Suricata / Snort IDS Signatures
       C2 Severance, Host Isolation          • Sigma SIEM Standard YAML Rules
     • Real-time Recalculated Risk Trajectory • PowerShell / Bash Zero-Trust Scripts
```

- **"What-If" Defense Simulator:** Allows security operators to test mitigation strategies in software before modifying network policy, demonstrating real-time risk reduction.
- **Automated SOAR Engine:** Synthesizes vendor-neutral, production-ready defense rules deployable via a 1-click execution terminal with live streaming audit logs.

---

## 6. Deployment & Enterprise Resilience
- **Zero Cloud Dependencies:** Completely self-contained; runs fully offline on on-premise air-gapped infrastructure.
- **Low Latency:** Dual-stage inference executes in $<50\text{ms}$ per flow window.
- **RBAC Persona Architecture:** Native support for Tier-1 SOC Analysts, Tier-2 Threat Hunters, and CISO incident commanders.
