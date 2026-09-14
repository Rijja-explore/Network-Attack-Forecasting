# AI Based Network Attack Forecasting

SIH26153 — an offline, AI-assisted cyber-defence and analyst decision-support pipeline for network traffic. It turns recorded flow telemetry and PCAP-derived packet behaviour into separately sourced risk, forecast, attack-family, XAI, MITRE-evidence, confidence, and recommendation views.

## What we built

```text
NETWORK TRAFFIC
       |
  +----+--------------------+
  |                         |
  v                         v
Stage 1: flow/temporal   Stage 2: PCAP/packet
current risk + forecast  attack family + behaviour
  |                         |
  +-----------+-------------+
              v
 Analyst intelligence: XAI + MITRE evidence + confidence + uncertainty
              v
   Offline dashboard and recorded-dataset replay
```

Stage-1 and Stage-2 are **separate evidence channels**. The dashboard contextualises them together but does not align their rows, synchronise their timestamps, combine their probabilities, or claim that packet features predict flow-level future outcomes.

## Validated results

| Experiment | Validation | Test | Interpretation |
|---|---:|---:|---|
| Stage-1 XGBoost current risk | F1 0.9406; PR-AUC 0.9871; ROC-AUC 0.9668 | F1 0.9688* | Strong flow-window classification experiment |
| Stage-1 GRU baseline | F1 0.9208 | F1 0.9805* | Historical baseline |
| Persistence forecasting | Mean F1 0.9749; PR-AUC 0.9677 | — | Strongest validated forecasting reference |
| Lagged XGBoost forecasting | Mean F1 0.9191; PR-AUC 0.9466 | — | Does not beat persistence |
| State-transition Random Forest | Mean R² 0.2024 | Mean R² 0.0086 | Weak chronological test generalisation |
| Stage-2 CatBoost family model | Macro-F1 0.7681 | Macro-F1 0.6708; weighted F1 0.9575 | Seven-family packet-state characterisation |

\*The Stage-1 test split has only six normal windows, so false-positive statistics are unstable.

## Important interpretation

- Persistence is currently stronger than learned binary forecasting because labels are highly block-contiguous.
- Stage-2 is attack-family/attack-state characterisation on attack-positive CTU botnet-capture windows. It is not a benign-vs-attack detector.
- State-transition validation signal exists, but its test generalisation is weak.
- MITRE results are transparent behavioural evidence rules, not a trained ATT&CK classifier.

## Run the offline demo

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-demo.txt
streamlit run app/app.py
```

The dashboard consumes four deterministic recorded cases, never retrains at startup, and shows a visible provenance panel. Use the slider for recorded replay; it is not a live attack simulation.

## Repository layout

| Path | Purpose |
|---|---|
| `app/` | Offline Streamlit dashboard |
| `configs/` | Default configuration and model registry |
| `src/` | Small testable MITRE/assessment helpers |
| `scripts/` | Demo launcher and environment checks |
| `demo/` | Recorded replay instructions |
| `docs/` | Methodology, model cards, limitations, judge Q&A, handoff |
| `reports/final/` | Canonical audit, selection, claims, architecture, and handoff reports |
| `processed_data/final_demo/` | Small deterministic demo inputs only |

Raw datasets, PCAPs, `.binetflow` captures, large generated tables, and model binaries are intentionally excluded from Git. See [data/README.md](data/README.md) and [models/README.md](models/README.md).

## Reproducing and testing the package

```powershell
python scripts/validate_environment.py
pytest
python scripts/run_demo.py
```

The package validates saved artifacts and displays recorded output; it does not reproduce expensive research training. The canonical source of truth is [reports/final/final_model_selection.json](reports/final/final_model_selection.json).

## Claim safety

Safe: current flow-window risk classification, next observed-window forecasting experiments, seven-family packet behavioural characterisation, transparent MITRE evidence, and provenance-preserving analyst support.

Not claimed: early compromise lead time, learned forecasting superiority over persistence, zero-day generalisation, production real-time validation, a world model, trained MITRE labels, or true Stage-1+Stage-2 temporal fusion.

## Future work

Obtain co-captured flow and packet observations, validate calibrated lead time and streaming performance, broaden family coverage, and perform genuine unseen-domain/attack evaluation.

## Team handoff

Start with [docs/HANDOFF.md](docs/HANDOFF.md), then use [reports/final/approved_claims.json](reports/final/approved_claims.json) for every judge-facing statement.
