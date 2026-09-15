# Model artifacts

All trained model binaries and preprocessing scalers are tracked directly in Git for reproducibility and ease of deployment:

- **Stage 1 (Binary Attack Risk Classification)**:
  - `models/stage1/xgboost.pkl`: Production Stage 1 model (F1: 0.9406)
  - `models/stage1/random_forest.pkl`: Tree baseline
  - `models/stage1/logistic_regression.pkl`: Tabular baseline
  - `models/level1_gru.keras`: Sequence baseline
  - `models/gru_scaler.pkl` & `models/gru_imputer.pkl`: GRU feature preprocessing
  - `models/gru_features.json`: Ordered list of 51 features
- **Stage 2 (Botnet Attack Family Classification)**:
  - `models/stage2/stage2_family_best_model.joblib`: Production 7-family CatBoost classifier (Macro-F1: 0.7681)
  - `models/stage2/stage2_family_catboost.joblib`: CatBoost family artifact
  - `models/stage2/stage2_family_xgboost.joblib`: Comparison model
  - `models/stage2/stage2_family_randomforest.joblib`: Comparison model
  - `models/stage2/stage2_family_extratrees.joblib`: Comparison model
  - `models/stage2/stage2_family_histgradientboosting.joblib`: Comparison model
  - `models/stage2/stage2_family_logisticregression.joblib`: Linear baseline
- **Forecasting & State Transition**:
  - `models/forecasting/state_transition_xgboost.pkl`: One-step network state predictor
  - `models/forecasting/best_forecaster.pkl`: Forecaster model
  - `models/forecasting/forecast_preprocessing.pkl`: Scaler/preprocessor

The canonical artifact paths, feature dimensions, and metrics are documented in `configs/model_registry.yaml` and `reports/final/final_model_selection.json`.

