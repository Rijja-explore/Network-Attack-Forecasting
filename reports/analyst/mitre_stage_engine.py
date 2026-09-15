# Transparent rule engine; not a trained MITRE classifier.
def infer_stage(changes):
 scores={'Reconnaissance':max(0,changes.get('port',0))+max(0,changes.get('destination',0)),'Command & Control':max(0,changes.get('packet_rate',0))+max(0,changes.get('iat',0)),'Lateral Movement':max(0,changes.get('destination',0))+max(0,changes.get('syn',0))+max(0,changes.get('rst',0))}
 best=max(scores,key=scores.get); return {'stage':best if scores[best]>0 else 'INSUFFICIENT_EVIDENCE','score':scores[best]}
