# Data policy

Raw PCAPs, `.binetflow` files, large CIC/CTU CSVs, and generated bulk feature tables are deliberately excluded from Git. They are large, may have dataset licensing/redistribution constraints, and are not required to launch the packaged recorded-demo interface.

The local research workspace uses `processed_data/` for validated generated artifacts. A new developer should obtain raw data only from the official source documented in the project reports, follow its licence, then reproduce feature extraction separately. Do not commit raw captures, executables, or credentials.

For the offline dashboard, use the small deterministic records in `processed_data/final_demo/demo_cases.json`.
