"""
File parsers for network traffic analysis.
Supports: CSV, binetflow, PCAP/PCAPNG, Zeek logs, JSON flows.
"""
import csv
import io
import json
import struct
import os
from datetime import datetime
from collections import defaultdict


def parse_uploaded_file(filepath: str, filename: str) -> list[dict]:
    """Route to the correct parser based on file extension."""
    ext = os.path.splitext(filename)[1].lower()
    
    PARSERS = {
        '.csv':      parse_csv,
        '.binetflow': parse_binetflow,
        '.pcap':     parse_pcap,
        '.pcapng':   parse_pcap,
        '.cap':      parse_pcap,
        '.log':      parse_zeek_log,
        '.json':     parse_json_flows,
        '.tsv':      parse_tsv,
        '.netflow':  parse_csv,        # NetFlow exports are usually CSV
        '.nfcapd':   parse_csv,
    }
    
    parser = PARSERS.get(ext)
    if not parser:
        raise ValueError(f"Unsupported file format: {ext}. Supported: {', '.join(PARSERS.keys())}")
    
    return parser(filepath)


def parse_csv(filepath: str) -> list[dict]:
    """Parse CSV flow/feature files."""
    rows = []
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        # Sniff delimiter
        sample = f.read(4096)
        f.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=',\t;|')
        except csv.Error:
            dialect = csv.excel
        
        reader = csv.DictReader(f, dialect=dialect)
        for row in reader:
            cleaned = {}
            for k, v in row.items():
                if k is None:
                    continue
                k = k.strip().lower().replace(' ', '_').replace('-', '_')
                try:
                    cleaned[k] = float(v)
                except (ValueError, TypeError):
                    cleaned[k] = v.strip() if isinstance(v, str) else v
            rows.append(cleaned)
    return rows


def parse_tsv(filepath: str) -> list[dict]:
    """Parse TSV files (tab-separated)."""
    rows = []
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            cleaned = {}
            for k, v in row.items():
                if k is None:
                    continue
                k = k.strip().lower().replace(' ', '_')
                try:
                    cleaned[k] = float(v)
                except (ValueError, TypeError):
                    cleaned[k] = v.strip() if isinstance(v, str) else v
            rows.append(cleaned)
    return rows


def parse_binetflow(filepath: str) -> list[dict]:
    """
    Parse CTU-13 .binetflow format.
    Columns: StartTime,Dur,Proto,SrcAddr,Sport,Dir,DstAddr,Dport,State,sTos,dTos,TotPkts,TotBytes,SrcBytes,Label
    """
    rows = []
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            flow = {}
            for k, v in row.items():
                if k is None:
                    continue
                key = k.strip().lower()
                val = v.strip() if isinstance(v, str) else v
                
                # Normalize common binetflow columns
                if key in ('dur', 'totpkts', 'totbytes', 'srcbytes', 'stos', 'dtos'):
                    try:
                        flow[key] = float(val)
                    except (ValueError, TypeError):
                        flow[key] = 0.0
                elif key == 'sport' or key == 'dport':
                    try:
                        flow[key] = int(val) if val else 0
                    except ValueError:
                        flow[key] = 0
                else:
                    flow[key] = val
            
            # Compute derived features
            dur = flow.get('dur', 0.0)
            pkts = flow.get('totpkts', 0.0)
            bytez = flow.get('totbytes', 0.0)
            flow['packet_rate'] = pkts / dur if dur > 0 else pkts
            flow['byte_rate'] = bytez / dur if dur > 0 else bytez
            flow['avg_packet_size'] = bytez / pkts if pkts > 0 else 0
            
            rows.append(flow)
    return rows


def parse_pcap(filepath: str) -> list[dict]:
    """
    Parse PCAP files using raw binary parsing (no external dependencies).
    Extracts packet-level metadata and aggregates into flow-level records.
    """
    flows = defaultdict(lambda: {
        'packets': 0, 'bytes': 0, 'start_time': None, 'end_time': None,
        'src_ports': set(), 'dst_ports': set(), 'protocols': set(),
        'tcp_flags': defaultdict(int), 'packet_sizes': []
    })
    
    with open(filepath, 'rb') as f:
        # Read PCAP global header (24 bytes)
        header = f.read(24)
        if len(header) < 24:
            raise ValueError("Invalid PCAP file: header too short")
        
        magic = struct.unpack('<I', header[:4])[0]
        if magic == 0xa1b2c3d4:
            endian = '<'
        elif magic == 0xd4c3b2a1:
            endian = '>'
        elif magic == 0x0a0d0d0a:
            # PCAPNG - simplified extraction
            return _parse_pcapng_simple(filepath)
        else:
            raise ValueError(f"Not a valid PCAP file (magic: {hex(magic)})")
        
        link_type = struct.unpack(f'{endian}I', header[20:24])[0]
        
        packet_count = 0
        while True:
            # Read packet header (16 bytes)
            pkt_header = f.read(16)
            if len(pkt_header) < 16:
                break
            
            ts_sec, ts_usec, incl_len, orig_len = struct.unpack(f'{endian}IIII', pkt_header)
            timestamp = ts_sec + ts_usec / 1_000_000
            
            # Read packet data
            pkt_data = f.read(incl_len)
            if len(pkt_data) < incl_len:
                break
            
            packet_count += 1
            
            # Parse Ethernet (link_type 1) or raw IP (link_type 101)
            ip_offset = 14 if link_type == 1 else 0
            
            if len(pkt_data) < ip_offset + 20:
                continue
            
            # Parse IP header
            version_ihl = pkt_data[ip_offset]
            version = (version_ihl >> 4) & 0xF
            if version != 4:
                continue
            
            ihl = (version_ihl & 0xF) * 4
            ip_total_len = struct.unpack('!H', pkt_data[ip_offset+2:ip_offset+4])[0]
            protocol = pkt_data[ip_offset + 9]
            
            src_ip = '.'.join(str(b) for b in pkt_data[ip_offset+12:ip_offset+16])
            dst_ip = '.'.join(str(b) for b in pkt_data[ip_offset+16:ip_offset+20])
            
            src_port = dst_port = 0
            tcp_flag_byte = 0
            transport_offset = ip_offset + ihl
            
            if protocol in (6, 17) and len(pkt_data) >= transport_offset + 8:
                src_port = struct.unpack('!H', pkt_data[transport_offset:transport_offset+2])[0]
                dst_port = struct.unpack('!H', pkt_data[transport_offset+2:transport_offset+4])[0]
                
                if protocol == 6 and len(pkt_data) >= transport_offset + 14:
                    tcp_flag_byte = pkt_data[transport_offset + 13]
            
            # Aggregate into flows (5-tuple: src_ip, dst_ip, src_port, dst_port, proto)
            proto_name = {6: 'TCP', 17: 'UDP', 1: 'ICMP'}.get(protocol, str(protocol))
            flow_key = f"{src_ip}:{src_port}->{dst_ip}:{dst_port}:{proto_name}"
            
            flow = flows[flow_key]
            flow['packets'] += 1
            flow['bytes'] += orig_len
            flow['packet_sizes'].append(orig_len)
            flow['protocols'].add(proto_name)
            flow['src_port'] = src_port
            flow['dst_port'] = dst_port
            flow['src_ports'].add(src_port)
            flow['dst_ports'].add(dst_port)
            
            if flow['start_time'] is None or timestamp < flow['start_time']:
                flow['start_time'] = timestamp
            if flow['end_time'] is None or timestamp > flow['end_time']:
                flow['end_time'] = timestamp
            
            if protocol == 6:
                if tcp_flag_byte & 0x02: flow['tcp_flags']['SYN'] += 1
                if tcp_flag_byte & 0x10: flow['tcp_flags']['ACK'] += 1
                if tcp_flag_byte & 0x01: flow['tcp_flags']['FIN'] += 1
                if tcp_flag_byte & 0x04: flow['tcp_flags']['RST'] += 1
                if tcp_flag_byte & 0x08: flow['tcp_flags']['PSH'] += 1
    
    # Convert flows to records
    records = []
    for flow_key, flow in flows.items():
        parts = flow_key.split('->')
        src_part = parts[0].split(':')
        src_ip = src_part[0]
        sport = int(src_part[1]) if len(src_part) > 1 and src_part[1].isdigit() else 0
        
        dst_part = parts[1].split(':')
        dst_ip = dst_part[0]
        dport = int(dst_part[1]) if len(dst_part) > 1 and dst_part[1].isdigit() else 0
        proto = dst_part[2] if len(dst_part) > 2 else 'TCP'
        
        duration = (flow['end_time'] - flow['start_time']) if flow['start_time'] and flow['end_time'] else 0
        pkts = flow['packets']
        bytez = flow['bytes']
        sizes = flow['packet_sizes']
        
        record = {
            'srcaddr': src_ip,
            'dstaddr': dst_ip,
            'sport': sport,
            'dport': dport,
            'proto': proto,
            'totpkts': pkts,
            'totbytes': bytez,
            'dur': max(duration, 0.001),
            'packet_rate': pkts / max(duration, 0.001),
            'byte_rate': bytez / max(duration, 0.001),
            'avg_packet_size': bytez / pkts if pkts > 0 else 0,
            'packet_size_max': max(sizes) if sizes else 0,
            'packet_size_min': min(sizes) if sizes else 0,
            'src_port_count': len(flow['src_ports']),
            'dst_port_count': len(flow['dst_ports']),
            'syn_count': flow['tcp_flags'].get('SYN', 0),
            'ack_count': flow['tcp_flags'].get('ACK', 0),
            'fin_count': flow['tcp_flags'].get('FIN', 0),
            'rst_count': flow['tcp_flags'].get('RST', 0),
            'psh_count': flow['tcp_flags'].get('PSH', 0),
            'syn_ack_ratio': (flow['tcp_flags'].get('SYN', 0) / max(flow['tcp_flags'].get('ACK', 0), 1)),
        }
        records.append(record)
    
    return records


def _parse_pcapng_simple(filepath: str) -> list[dict]:
    """Simplified PCAPNG parser — extracts basic flow metadata."""
    records = []
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
        
        # Count approximate packets by scanning for Enhanced Packet Blocks (type 6)
        offset = 0
        packet_count = 0
        total_bytes = 0
        
        while offset < len(data) - 12:
            block_type = struct.unpack('<I', data[offset:offset+4])[0]
            block_len = struct.unpack('<I', data[offset+4:offset+8])[0]
            
            if block_len < 12 or offset + block_len > len(data):
                break
            
            if block_type == 6:  # Enhanced Packet Block
                packet_count += 1
                if offset + 28 <= len(data):
                    cap_len = struct.unpack('<I', data[offset+20:offset+24])[0]
                    total_bytes += cap_len
            
            offset += block_len
        
        if packet_count > 0:
            records.append({
                'srcaddr': 'aggregated',
                'dstaddr': 'aggregated',
                'proto': 'mixed',
                'totpkts': packet_count,
                'totbytes': total_bytes,
                'dur': 1.0,
                'packet_rate': float(packet_count),
                'byte_rate': float(total_bytes),
                'avg_packet_size': total_bytes / packet_count,
            })
    except Exception:
        pass
    
    return records


def parse_zeek_log(filepath: str) -> list[dict]:
    """Parse Zeek/Bro conn.log format."""
    rows = []
    headers = []
    
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            line = line.strip()
            if line.startswith('#fields'):
                headers = line.split('\t')[1:]
                continue
            if line.startswith('#'):
                continue
            if not headers:
                continue
            
            values = line.split('\t')
            row = {}
            for i, h in enumerate(headers):
                h = h.strip().lower().replace('.', '_')
                val = values[i] if i < len(values) else '-'
                if val == '-' or val == '(empty)':
                    row[h] = 0.0 if h in ('duration', 'orig_bytes', 'resp_bytes', 'orig_pkts', 'resp_pkts') else val
                else:
                    try:
                        row[h] = float(val)
                    except ValueError:
                        row[h] = val
            
            # Normalize Zeek column names to our schema
            flow = {
                'srcaddr': row.get('id_orig_h', row.get('orig_h', '')),
                'dstaddr': row.get('id_resp_h', row.get('resp_h', '')),
                'sport': row.get('id_orig_p', row.get('orig_p', 0)),
                'dport': row.get('id_resp_p', row.get('resp_p', 0)),
                'proto': row.get('proto', 'unknown'),
                'dur': float(row.get('duration', 0)),
                'totpkts': float(row.get('orig_pkts', 0)) + float(row.get('resp_pkts', 0)),
                'totbytes': float(row.get('orig_bytes', 0)) + float(row.get('resp_bytes', 0)),
                'conn_state': row.get('conn_state', ''),
            }
            
            dur = flow['dur'] or 0.001
            flow['packet_rate'] = flow['totpkts'] / dur
            flow['byte_rate'] = flow['totbytes'] / dur
            flow['avg_packet_size'] = flow['totbytes'] / flow['totpkts'] if flow['totpkts'] > 0 else 0
            
            rows.append(flow)
    
    return rows


def parse_json_flows(filepath: str) -> list[dict]:
    """Parse JSON-formatted flow records."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        data = json.load(f)
    
    if isinstance(data, list):
        return data
    elif isinstance(data, dict):
        # Try common JSON wrapper keys
        for key in ('flows', 'records', 'data', 'packets', 'events'):
            if key in data and isinstance(data[key], list):
                return data[key]
        return [data]
    
    return []
