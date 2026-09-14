# Next-developer handoff

## Already done

Feature extraction, model benchmarking, final audits, deterministic demo cases, claim safety review, and an offline Streamlit replay are complete.

## Do not redo or break

- Do not retrain models merely to recreate reported metrics.
- Do not alter raw/canonical datasets or model weights.
- Do not join Stage-1 and Stage-2 rows or invent timestamps.
- Do not replace persistence as the forecasting reference without a new validation protocol.
- Do not claim lead time, real-time deployment, world modelling, or unseen-attack performance.

## Run

`python scripts/validate_environment.py`, then `pytest`, then `streamlit run app/app.py`.

## Models and artifacts

Use `configs/model_registry.yaml` and `reports/final/final_model_selection.json`. The dashboard uses recorded outputs; binary artifacts are deliberately not committed.

## Safe data and Git policy

Commit code, docs, configs, small demo cases, and selected final reports. Do not commit PCAPs, `.binetflow`, raw/large CSVs, temporary database files, or model binaries.

## Best next task

Acquire a lawful co-captured flow+packet dataset to evaluate genuine temporal fusion with a new, leakage-safe protocol.

## Judge explanation

This is an AI-assisted analyst decision-support pipeline. Use `reports/final/approved_claims.json` verbatim for claim boundaries.
