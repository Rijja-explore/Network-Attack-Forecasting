# Architecture specification

```text
DATA LAYER
Flow telemetry -> temporal windows -> Stage-1 features
PCAP telemetry -> streamed packets -> 60-second packet/flow behaviour features

AI / BACKEND LAYER
Stage-1 XGBoost current-risk model
Stage-1 persistence forecasting reference + compact state experiment
Stage-2 CatBoost family model -> attack-state encoder
Transparent MITRE rules + native feature importance

ANALYST / UI LAYER
Risk and forecast trajectory | packet family/state | MITRE evidence
Top drivers | confidence/uncertainty | recommendation | provenance panel
```

For PPT: draw Stage-1 and Stage-2 as parallel columns that meet only in an **Analyst Contextual Evidence** box. Place a red boundary label: “No row-level temporal fusion; no shared capture correspondence.”
