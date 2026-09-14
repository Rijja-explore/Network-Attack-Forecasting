# Model cards

## Stage-1 XGBoost current risk

**Purpose:** classify current flow-window attack state. **Features:** 51 flow counts, bytes, rates, IAT, TCP flags, directional and packet-length statistics. **Validation:** F1 0.9406, PR-AUC 0.9871, ROC-AUC 0.9668. **Intended use:** offline analyst evidence. **Not intended:** calibrated early-warning or production real-time detection. **Weakness:** only six normal test windows.

## Forecasting reference

**Model:** persistence. **Purpose:** predict next observed-window binary state in the recorded experiment. **Validation:** mean F1 0.9749, PR-AUC 0.9677. **Weakness:** block-contiguous labels make persistence strong and it misses transitions; it is not evidence of pre-compromise lead time.

## Stage-1 state transition

**Selected validation model:** Random Forest over 12 compact state variables. **Validation mean R²:** 0.2024. **Test mean R²:** 0.0086. **Use:** exploratory state-evolution evidence only.

## Stage-2 CatBoost family model

**Purpose:** seven-family packet behavioural characterisation. **Features:** 50 packet/flow statistics. **Validation macro-F1:** 0.7681. **Test macro-F1:** 0.6708. **Not intended:** normal-vs-attack detection, per-packet maliciousness, or Stage-1 outcome prediction. Small Sogou/Virut holdouts limit confidence.
