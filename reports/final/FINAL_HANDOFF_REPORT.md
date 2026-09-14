# SIH-153 Final Handoff

## Problem statement
AI based Network Attack Forecasting from Network Traffic Data.

## What the system demonstrates
A provenance-safe, offline analyst decision view combining separate flow-level risk/forecast evidence and PCAP-derived attack-family/state evidence.

## Pipeline
Flow telemetry → Stage-1 risk/forecast/state experiment. PCAP telemetry → Stage-2 family/state characterization. Both feed transparent MITRE evidence, XAI, uncertainty and analyst recommendation. They are **not** temporally fused.

## Validated results
- Stage-1 XGBoost current-risk validation: F1 0.9406, PR-AUC 0.9871, ROC-AUC 0.9668.
- Existing GRU validation F1: 0.9208; retained as a baseline.
- Forecasting: persistence validation mean F1 0.9749, PR-AUC 0.9677; it outperforms lagged learned forecasts.
- State transition: Random Forest validation mean R² 0.2024, test mean R² 0.0086.
- Stage-2 CatBoost: validation macro-F1 0.7681, test macro-F1 0.6708.

## What is not claimed
No early lead time, real-time deployment, unseen-attack generalization, world model, trained MITRE classifier, or Stage-1/Stage-2 temporal fusion. Stage-2 is not binary detection.

## Demo
From the repository root, run `streamlit run app/app.py`. The interface is offline and uses deterministic packaged cases.

## Readiness
Ready with limitations. Use [approved_claims.json](approved_claims.json), [claim_audit.json](claim_audit.json), and [final_model_selection.json](final_model_selection.json) as the presentation authority.
