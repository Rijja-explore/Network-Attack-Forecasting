# Judge Q&A

**Why XGBoost?** It gave the strongest recorded validation result among lightweight Stage-1 tabular models.

**Why not LSTM/GRU?** A GRU baseline exists (validation F1 0.9208). Expanded TensorFlow trials stalled, and the current evidence does not justify replacing stronger validated references.

**Why is persistence better?** Labels are highly block-contiguous, so copying the latest observed state is difficult to beat. This is reported as a limitation, not a learned forecasting success.

**What is the world model?** We do not claim one. The compact state-transition experiment is a limited proxy with weak test generalisation.

**How do packet and flow analysis connect?** They are shown as separate analyst evidence channels. They are not row-level temporally fused.

**How do you handle unseen attacks?** We do not claim validated unseen/zero-day generalisation.

**How do you explain results?** Native global feature importance plus transparent MITRE behaviour rules; neither is presented as causal proof.

**Can it work in real time?** The architecture could inform future streaming work, but no production latency or deployment validation is claimed.

**What is novel?** A provenance-safe analyst view that combines independent flow-risk and packet-family evidence without fabricating data correspondence.
