# Feature dictionary

| Feature group | Meaning | Why it matters | Stage |
|---|---|---|---|
| Flow count | Connections in a window | Activity volume | Stage-1 |
| Total packets / bytes | Window traffic volume | Traffic intensity | Stage-1 |
| Flow duration, IAT | Connection/timing behaviour | Burstiness and regularity | Stage-1/2 |
| Packet/byte rate | Volume per unit time | Behaviour shifts | Stage-1/2 |
| SYN/ACK/RST/FIN counts | TCP handshake/termination behaviour | Connection-pattern evidence | Stage-1/2 |
| Direction ratios | Forward/backward traffic relation | Request-response asymmetry | Stage-1/2 |
| Packet-size statistics | Distribution of packet lengths | Family behavioural signature | Stage-2 |
| Destination/port diversity | Distinct peers/services | Exploration/scanning evidence | Stage-2 |
| Family probabilities | CatBoost probabilities for seven families | Family-state evidence | Stage-2 |
| Confidence, entropy, margin | Probability concentration | Uncertainty reporting | Stage-2 |
