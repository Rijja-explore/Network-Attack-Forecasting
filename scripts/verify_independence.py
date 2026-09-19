import urllib.request
import json

data = open('test_data/05_ddos_exfiltration_flood.pcap', 'rb').read()
boundary = '----TestBoundary'
fake_filename = 'capture_sensor_node_42.pcap'

header = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="{fake_filename}"\r\n'
    f'Content-Type: application/vnd.tcpdump.pcap\r\n\r\n'
).encode('latin-1')
body = header + data + f'\r\n--{boundary}--\r\n'.encode('latin-1')

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/analyze',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

res = urllib.request.urlopen(req)
report = json.loads(res.read())

print("Test with arbitrary filename:")
print(f"  Reported Filename : {report['input_context']['filename']}")
print(f"  Parsed Packets    : {report['traffic_summary']['total_packets']}")
print(f"  Parsed Total Bytes: {report['traffic_summary']['total_bytes']}")
print(f"  Predicted Family  : {report['stage2_output']['dominant_family']}")
print(f"  Risk Probability  : {report['stage1_output']['forecast']['t+1']}")
print(f"  Assigned Severity : {report['severity']}")
