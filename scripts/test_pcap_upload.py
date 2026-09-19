import urllib.request, json
data = open('test_data/02_reconnaissance_port_scan.pcap', 'rb').read()
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
header = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="02_reconnaissance_port_scan.pcap"\r\n'
    f'Content-Type: application/vnd.tcpdump.pcap\r\n\r\n'
).encode('latin-1')
footer = f'\r\n--{boundary}--\r\n'.encode('latin-1')
body = header + data + footer

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/analyze',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)
try:
    res = urllib.request.urlopen(req, timeout=10)
    rep = json.loads(res.read().decode('utf-8'))
    print('SUCCESS! Uploaded PCAP parsed.')
    print('Dominant family:', rep.get('stage2_output', {}).get('dominant_family'))
    print('Severity:', rep.get('severity'))
    print('Forecast:', rep.get('stage1_output', {}).get('forecast'))
except Exception as e:
    import traceback
    traceback.print_exc()
