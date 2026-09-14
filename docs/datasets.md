# Datasets

Stage-1 contains preprocessed flow-level temporal traffic windows with fixed chronological train/validation/test partitions. Stage-2 uses original CTU botnet PCAP scenario captures to produce packet-level behavioural windows and a seven-family target.

The associated `.binetflow` files are not joined to PCAP records by timestamp. Audits found timestamp mismatches in multiple scenarios, so no fabricated correspondence is used.

Raw captures, large CSVs and external data are not redistributed in this repository. See `data/README.md`.
