# Model artifacts

Trained binary model files are excluded from Git to keep the repository lightweight. The canonical artifact paths and validated metrics are listed in `configs/model_registry.yaml` and `reports/final/final_model_selection.json`.

The packaged Streamlit demo intentionally renders deterministic recorded outputs and does not load or train models at startup. To perform local inference, securely provision the compatible artifacts at their registry paths; never substitute a model without updating the registry and validation report.
