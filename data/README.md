# Data policy
 
All processed feature datasets, train/val/test splits, state transitions, and representation tables used by the models are tracked directly in Git under `processed_data/`.

Raw PCAPs (`.pcap`), flow dumps (`.binetflow`), and unaggregated dumps (`ctu_level1.csv` [620 MB], `cic_level1.csv` [305 MB]) exceed GitHub's strict 100 MB file limit and are hosted via [GitHub Releases](https://github.com/Rijja-explore/Network-Attack-Forecasting/releases) under tag `v1.0.0-artifacts`.

### Quick Access
- **Temporal Modeling Splits**: `processed_data/temporal/train.csv`, `validation.csv`, `test.csv`
- **PCAP Packet Features (50 features)**: `processed_data/stage2_pcap/multi_scenario/stage2_pcap_features_multi_v2.csv`
- **State Transition & Forecasting Data**: `processed_data/forecasting/`
- **Fusion Representations**: `processed_data/fusion/`
- **Deterministic Demo Data**: `processed_data/final_demo/demo_cases.json`
- **Large Dumps (>100 MB)**: Available on GitHub Releases.
