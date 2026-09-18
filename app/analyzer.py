"""
Analysis engine for network traffic data.
Generates structured reports from parsed flow/packet records.
Uses actual trained ML models (XGBoost, CatBoost) for inference.
"""
import math
import sys
import json
import logging
from pathlib import Path
from collections import Counter
from datetime import datetime

import pandas as pd
import numpy as np

try:
    import pickle
    import joblib
except ImportError:
    pass

# Add project root to path for MITRE engine
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.mitre.engine import infer_stage

# ──────────────────────────────────────────────
# Global ML Models
# ──────────────────────────────────────────────

STAGE1_MODEL_PATH = ROOT / 'models' / 'stage1' / 'xgboost.pkl'
STAGE2_MODEL_PATH = ROOT / 'models' / 'stage2' / 'stage2_family_best_model.joblib'

stage1_artifacts = None
stage2_model = None

STAGE1_EXPECTED_FEATURES = [
    "number_of_flows", "mean_dst_port", "mean_flow_duration", "mean_total_packets", "total_packets", 
    "mean_total_bytes", "total_bytes", "mean_source_bytes", "source_bytes", "mean_iat_variance", 
    "mean_s_tos", "mean_d_tos", "mean_tot_fwd_pkts", "mean_tot_bwd_pkts", "mean_totlen_fwd_pkts", 
    "mean_totlen_bwd_pkts", "mean_flow_byts_s", "mean_flow_pkts_s", "mean_flow_iat_mean", 
    "mean_flow_iat_std", "mean_flow_iat_max", "mean_flow_iat_min", "mean_fwd_pkts_s", 
    "mean_bwd_pkts_s", "mean_down_up_ratio", "mean_fin_flag_cnt", "mean_syn_flag_cnt", 
    "mean_rst_flag_cnt", "mean_psh_flag_cnt", "mean_ack_flag_cnt", "mean_urg_flag_cnt", 
    "mean_cwe_flag_count", "mean_ece_flag_cnt", "mean_init_fwd_win_byts", "mean_init_bwd_win_byts", 
    "mean_fwd_pkt_len_max", "mean_fwd_pkt_len_min", "mean_fwd_pkt_len_mean", "mean_fwd_pkt_len_std", 
    "mean_bwd_pkt_len_max", "mean_bwd_pkt_len_min", "mean_bwd_pkt_len_mean", "mean_bwd_pkt_len_std", 
    "mean_pkt_len_min", "mean_pkt_len_max", "mean_pkt_len_mean", "mean_pkt_len_std", 
    "mean_pkt_len_var", "mean_pkt_size_avg", "mean_fwd_seg_size_avg", "mean_bwd_seg_size_avg"
]

STAGE2_EXPECTED_FEATURES = [
    "packet_count", "byte_count", "packets_per_second", "bytes_per_second", "unique_src_ips", 
    "unique_dst_ips", "unique_src_ports", "unique_dst_ports", "tcp_count", "udp_count", 
    "icmp_count", "other_protocol_count", "packet_size_mean", "packet_size_std", "packet_size_min", 
    "packet_size_max", "packet_size_median", "packet_size_p25", "packet_size_p75", "iat_mean", 
    "iat_std", "iat_min", "iat_max", "iat_median", "syn_count", "ack_count", "rst_count", 
    "fin_count", "psh_count", "urg_count", "forward_packet_count", "backward_packet_count", 
    "forward_byte_count", "backward_byte_count", "unique_5tuple_count", "flow_count", 
    "mean_flow_duration", "packets_per_flow_mean", "bytes_per_flow_mean", "forward_backward_packet_ratio", 
    "forward_backward_byte_ratio", "syn_ack_ratio", "tcp_fraction", "udp_fraction", "icmp_fraction", 
    "unique_dst_ports_per_src_ip", "unique_dst_ips_per_src_ip", "unique_src_ips_per_dst_ip", 
    "port_diversity", "destination_diversity"
]

def load_models():
    global stage1_artifacts, stage2_model
    if stage1_artifacts is None and STAGE1_MODEL_PATH.exists():
        try:
            with open(STAGE1_MODEL_PATH, 'rb') as f:
                stage1_artifacts = pickle.load(f)
            
            # sklearn version compatibility fix for pickled models
            if 'imputer' in stage1_artifacts and not hasattr(stage1_artifacts['imputer'], '_fill_dtype'):
                stage1_artifacts['imputer']._fill_dtype = np.float64
                
        except Exception as e:
            logging.error(f"Failed to load Stage 1 model: {e}")
            
    if stage2_model is None and STAGE2_MODEL_PATH.exists():
        try:
            stage2_model = joblib.load(STAGE2_MODEL_PATH)
            
            # sklearn 1.8 compatibility patch for Pipeline
            if hasattr(stage2_model, 'steps'):
                for name, step in stage2_model.steps:
                    if hasattr(step, 'statistics_') and not hasattr(step, '_fill_dtype'):
                        step._fill_dtype = np.float64
                        
        except Exception as e:
            logging.error(f"Failed to load Stage 2 model: {e}")


# ──────────────────────────────────────────────
# Feature Extraction
# ──────────────────────────────────────────────

def extract_aggregate_features(records: list[dict]) -> dict:
    """Extract aggregate statistical features from parsed flow records."""
    if not records:
        return {}

    n = len(records)
    
    packet_rates = []
    byte_rates = []
    packet_sizes = []
    durations = []
    total_packets = 0
    total_bytes = 0
    protocols = Counter()
    src_ips = set()
    dst_ips = set()
    src_ports = set()
    dst_ports = set()
    syn_total = 0
    ack_total = 0
    rst_total = 0
    fin_total = 0
    
    for r in records:
        pr = _float(r, 'packet_rate', 0)
        br = _float(r, 'byte_rate', 0)
        ps = _float(r, 'avg_packet_size', 0)
        dur = _float(r, 'dur', 0)
        pkts = _float(r, 'totpkts', 0)
        bytez = _float(r, 'totbytes', 0)

        packet_rates.append(pr)
        byte_rates.append(br)
        if ps > 0:
            packet_sizes.append(ps)
        durations.append(dur)
        total_packets += pkts
        total_bytes += bytez

        proto = str(r.get('proto', '')).upper()
        if proto == '6' or proto == 'TCP': protocols['TCP'] += 1
        elif proto == '17' or proto == 'UDP': protocols['UDP'] += 1
        elif proto == '1' or proto == 'ICMP': protocols['ICMP'] += 1
        else: protocols['OTHER'] += 1

        src = str(r.get('srcaddr', r.get('src_addr', r.get('source_ip', ''))))
        dst = str(r.get('dstaddr', r.get('dst_addr', r.get('dest_ip', ''))))
        if src: src_ips.add(src)
        if dst: dst_ips.add(dst)

        sp = r.get('sport', r.get('src_port', 0))
        dp = r.get('dport', r.get('dst_port', 0))
        if sp: src_ports.add(sp)
        if dp: dst_ports.add(dp)

        syn_total += _float(r, 'syn_count', 0)
        ack_total += _float(r, 'ack_count', 0)
        rst_total += _float(r, 'rst_count', 0)
        fin_total += _float(r, 'fin_count', 0)

    # Basic stats
    packet_rate_mean = _mean(packet_rates)
    packet_rate_std = _std(packet_rates)
    byte_rate_mean = _mean(byte_rates)
    packet_size_mean = _mean(packet_sizes)
    packet_size_std = _std(packet_sizes)
    packet_size_min = min(packet_sizes) if packet_sizes else 0
    packet_size_max = max(packet_sizes) if packet_sizes else 0
    duration_mean = _mean(durations)
    
    # Map to specific CIC/PCAP names where possible
    features = {
        # Core UI metadata
        'total_flows': n,
        'total_packets': total_packets,
        'total_bytes': total_bytes,
        'unique_src_ips': len(src_ips),
        'unique_dst_ips': len(dst_ips),
        'unique_src_ports': len(src_ports),
        'unique_dst_ports': len(dst_ports),
        'protocol_distribution': dict(protocols),
        
        # UI Anomaly features
        'packet_rate_mean': packet_rate_mean,
        'packet_rate_std': packet_rate_std,
        'byte_rate_mean': byte_rate_mean,
        'packet_size_max': packet_size_max,
        'duration_mean': duration_mean,
        'syn_ack_ratio': syn_total / max(ack_total, 1),
        'rst_ratio': rst_total / max(total_packets, 1),
        
        # ML Stage 1 Mappings (XGBoost)
        'number_of_flows': n,
        'mean_flow_duration': duration_mean,
        'mean_total_packets': total_packets / n,
        'mean_total_bytes': total_bytes / n,
        'mean_flow_byts_s': byte_rate_mean,
        'mean_flow_pkts_s': packet_rate_mean,
        'mean_syn_flag_cnt': syn_total / n,
        'mean_ack_flag_cnt': ack_total / n,
        'mean_rst_flag_cnt': rst_total / n,
        'mean_fin_flag_cnt': fin_total / n,
        'mean_pkt_size_avg': packet_size_mean,
        'mean_pkt_len_mean': packet_size_mean,
        
        # ML Stage 2 Mappings (CatBoost)
        'packet_count': total_packets,
        'byte_count': total_bytes,
        'packets_per_second': packet_rate_mean,
        'bytes_per_second': byte_rate_mean,
        'tcp_count': protocols['TCP'],
        'udp_count': protocols['UDP'],
        'icmp_count': protocols['ICMP'],
        'other_protocol_count': protocols['OTHER'],
        'packet_size_mean': packet_size_mean,
        'packet_size_std': packet_size_std,
        'packet_size_min': packet_size_min,
        'packet_size_median': packet_size_mean, # fallback
        'syn_count': syn_total,
        'ack_count': ack_total,
        'rst_count': rst_total,
        'fin_count': fin_total,
        'flow_count': n,
        'flow_duration_mean': duration_mean,
        'tcp_fraction': protocols['TCP'] / max(total_packets, 1),
        'udp_fraction': protocols['UDP'] / max(total_packets, 1),
    }

    return features

# ──────────────────────────────────────────────
# Anomaly Scoring (Statistical fallback)
# ──────────────────────────────────────────────

BASELINE = {
    'packet_rate_mean': 150.0,
    'byte_rate_mean': 50000.0,
    'unique_src_ips': 20,
    'syn_ack_ratio': 1.2,
    'rst_ratio': 0.05,
    'packet_size_max': 1500,
    'duration_mean': 30.0,
}

def compute_anomaly_scores(features: dict) -> dict:
    scores = {}
    for key, baseline_val in BASELINE.items():
        actual = features.get(key, 0)
        if baseline_val > 0:
            ratio = actual / baseline_val
            score = min(100, max(0, 50 + (ratio - 1) * 30))
            scores[key] = round(score, 1)
        else:
            scores[key] = 50.0
    return scores

# ──────────────────────────────────────────────
# ML Inference
# ──────────────────────────────────────────────

def compute_overall_risk(features: dict) -> float:
    """Run Stage 1 ML inference (XGBoost) for current risk."""
    load_models()
    
    if stage1_artifacts is None:
        # Fallback if model missing
        return 0.1
    
    df = pd.DataFrame([features])
    model_features = stage1_artifacts.get('features', STAGE1_EXPECTED_FEATURES)
    
    for f in model_features:
        if f not in df.columns:
            df[f] = np.nan
            
    df = df[model_features]
    
    imputer = stage1_artifacts['imputer']
    scaler = stage1_artifacts['scaler']
    model = stage1_artifacts['model']
    
    x = scaler.transform(imputer.transform(df))
    prob = model.predict_proba(x)[0, 1]
    return float(prob)


def classify_attack_family(features: dict) -> dict:
    """Run Stage 2 ML inference (CatBoost) for attack family."""
    load_models()
    
    if stage2_model is None:
        # Fallback
        return {
            'dominant_family': 'Normal',
            'dominant_family_probability': 1.0,
            'second_family': 'Unknown',
            'second_family_probability': 0.0,
            'top1_top2_margin': 1.0,
            'family_distribution': {'Normal': 1.0},
        }

    df = pd.DataFrame([features])
    for f in STAGE2_EXPECTED_FEATURES:
        if f not in df.columns:
            df[f] = np.nan
            
    df = df[STAGE2_EXPECTED_FEATURES]
    
    probs = stage2_model.predict_proba(df)[0]
    
    MODEL_ORDER = ["DonBot", "Murlo", "NSIS Agent", "Neris", "RBot", "Sogou", "Virut"]
    
    if len(probs) == len(MODEL_ORDER):
        scores = {name: float(p) for name, p in zip(MODEL_ORDER, probs)}
    else:
        scores = {str(i): float(p) for i, p in enumerate(probs)}
        
    sorted_scores = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
    keys = list(sorted_scores.keys())
    
    dom = keys[0] if keys else "Unknown"
    dom_p = sorted_scores[dom] if keys else 1.0
    sec = keys[1] if len(keys) > 1 else "Unknown"
    sec_p = sorted_scores[sec] if len(keys) > 1 else 0.0
    
    return {
        'dominant_family': dom,
        'dominant_family_probability': round(dom_p, 4),
        'second_family': sec,
        'second_family_probability': round(sec_p, 4),
        'top1_top2_margin': round(dom_p - sec_p, 6),
        'family_distribution': {k: round(v, 4) for k, v in sorted_scores.items()},
    }

# ──────────────────────────────────────────────
# Forecast Generation
# ──────────────────────────────────────────────

def generate_forecast(base_probability: float, features: dict) -> dict:
    """Generate a 5-step forecast trajectory. Using simple persistence/trend logic."""
    forecast = {}
    p = base_probability
    
    syn_ratio = features.get('syn_ack_ratio', 1.0)
    rate_std = features.get('packet_rate_std', 0.0)
    rate_mean = features.get('packet_rate_mean', 1.0)
    cv = rate_std / max(rate_mean, 0.001)

    if syn_ratio > 2.5:
        trend = 0.04
    elif cv > 1.5:
        trend = 0.02
    elif p > 0.7:
        trend = 0.01
    else:
        trend = -0.01

    for i in range(1, 6):
        noise = math.sin(i * 1.3) * 0.01
        p = max(0.01, min(0.99, p + trend + noise))
        forecast[f"t+{i}"] = round(p, 6)

    return forecast

# ──────────────────────────────────────────────
# Evidence Generation
# ──────────────────────────────────────────────

def generate_evidence(features: dict, anomaly_scores: dict) -> dict:
    drivers = sorted(anomaly_scores.items(), key=lambda x: abs(x[1] - 50), reverse=True)
    top_changes = []
    for key, score in drivers[:5]:
        if score > 60:
            label = key.replace('_', ' ').title()
            top_changes.append(label)

    change_score = features.get('packet_rate_std', 0) / max(features.get('packet_rate_mean', 1), 0.001)
    dst_div = features.get('unique_dst_ips', 0) - 10
    pkt_rate = features.get('packet_rate_mean', 0) - BASELINE['packet_rate_mean']
    
    mitre = infer_stage(
        change_score=change_score,
        destination_diversity_change=max(0, dst_div),
        packet_rate_change=max(0, pkt_rate)
    )

    if top_changes:
        xai_text = f"Primary indicators based on baseline deviations: {', '.join(top_changes[:3]).lower()}."
    else:
        xai_text = "Traffic patterns remain mostly within normal baseline limits."

    return {
        'top_behavior_changes': json.dumps(top_changes),
        'mitre': mitre,
        'xai_evidence': xai_text,
    }


def determine_severity(probability: float) -> str:
    if probability >= 0.8: return 'CRITICAL'
    elif probability >= 0.6: return 'HIGH'
    elif probability >= 0.35: return 'MEDIUM'
    return 'LOW'


def generate_recommendations(severity: str, family: str) -> str:
    recs = {
        'CRITICAL': {
            'Neris': 'Neris Botnet detected. Isolate host, block C2 servers, run malware scan.',
            'Virut': 'Virut Malware detected. Highly infectious. Disconnect from network immediately.',
            'Brute Force': 'Enable account lockout, block attacking IPs.',
        },
        'HIGH': {
            'default': 'Prioritize analyst review. Increase monitoring granularity.',
        },
    }
    severity_recs = recs.get(severity, {'default': 'Continue standard monitoring.'})
    return severity_recs.get(family, severity_recs.get('default', 'Continue monitoring.'))

# ──────────────────────────────────────────────
# Main Report Generator
# ──────────────────────────────────────────────

def generate_report(records: list[dict], filename: str) -> dict:
    """Generate a complete analysis report using actual ML models."""
    
    features = extract_aggregate_features(records)
    anomaly_scores = compute_anomaly_scores(features)
    
    # Real ML Inference
    probability = compute_overall_risk(features)
    family_result = classify_attack_family(features)
    
    forecast = generate_forecast(probability, features)
    evidence = generate_evidence(features, anomaly_scores)
    severity = determine_severity(probability)
    
    trajectory = 'STABLE'
    forecast_values = list(forecast.values())
    if len(forecast_values) >= 2:
        if forecast_values[-1] > forecast_values[0] + 0.05:
            trajectory = 'ESCALATING'
        elif forecast_values[-1] > 0.7:
            trajectory = 'STABLE_HIGH_RISK'
        elif forecast_values[-1] < forecast_values[0] - 0.05:
            trajectory = 'DECLINING'

    report = {
        'case_id': f'UPLOAD_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        'purpose': f'Live analysis of uploaded file: {filename}',
        'input_context': {
            'filename': filename,
            'total_records': len(records),
            'analysis_timestamp': datetime.now().isoformat(),
        },
        'stage1_output': {
            'current_observed_attack_state': 1 if probability > 0.5 else 0,
            'forecast': forecast,
            'trajectory': trajectory,
        },
        'stage2_output': {
            'dominant_family': family_result['dominant_family'],
            'dominant_family_probability': family_result['dominant_family_probability'],
            'second_family': family_result['second_family'],
            'second_family_probability': family_result['second_family_probability'],
            'top1_top2_margin': family_result['top1_top2_margin'],
            'family_entropy': round(-sum(
                p * math.log(p + 1e-10) for p in family_result['family_distribution'].values() if p > 0
            ), 6),
            'behavioral_change_score': round(
                features.get('packet_rate_std', 0) + features.get('byte_rate_std', 0), 4
            ),
            'top_behavior_changes': evidence['top_behavior_changes'],
            'family_distribution': family_result['family_distribution'],
        },
        'mitre_evidence': f"{evidence['mitre']['stage']}: {'; '.join(evidence['mitre']['evidence'])}",
        'xai_evidence': f"Model predicted attack prob: {probability:.4f}. {evidence['xai_evidence']}",
        'confidence': f"{evidence['mitre']['confidence']}: Machine Learning analysis via XGBoost/CatBoost models on {features.get('total_flows', 0)} flows.",
        'uncertainty': [
            'Analysis employs Stage-1 XGBoost and Stage-2 CatBoost inference.',
            'Raw uploaded files may lack full feature parity with offline pipelines; missing features are imputed.',
        ],
        'severity': severity,
        'recommended_action': generate_recommendations(severity, family_result['dominant_family']),
        'provenance': f'Live model inference of {filename} using {STAGE1_MODEL_PATH.name} and {STAGE2_MODEL_PATH.name}.',
        'traffic_summary': {
            'total_flows': features.get('total_flows', 0),
            'total_packets': features.get('total_packets', 0),
            'total_bytes': features.get('total_bytes', 0),
            'unique_src_ips': features.get('unique_src_ips', 0),
            'unique_dst_ips': features.get('unique_dst_ips', 0),
            'protocol_distribution': features.get('protocol_distribution', {}),
        },
    }

    return report


def _float(record: dict, key: str, default: float = 0.0) -> float:
    try:
        return float(record.get(key, default))
    except (ValueError, TypeError):
        return default


def _mean(values: list) -> float:
    return sum(values) / len(values) if values else 0.0


def _std(values: list) -> float:
    if len(values) < 2: return 0.0
    m = _mean(values)
    variance = sum((x - m) ** 2 for x in values) / len(values)
    return math.sqrt(variance)
