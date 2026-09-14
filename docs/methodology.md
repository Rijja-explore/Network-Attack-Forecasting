# Methodology

Stage-1 uses chronological flow-traffic windows for current attack-risk classification and recorded next-window forecasting experiments. The selected current-risk model is XGBoost; the forecasting selection report retains persistence as the strongest validation reference.

Stage-2 processes original CTU botnet PCAPs as sequential packet streams into 60-second behavioural windows, reconstructs bidirectional flow summaries, and applies a frozen CatBoost model for seven-family characterisation. All Stage-2 records are attack-positive by capture provenance.

The analyst layer is decision-level contextual aggregation only. It keeps flow and packet evidence separate, adds global native feature importance and transparent MITRE behaviour rules, and exposes uncertainty.
