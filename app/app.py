"""Offline SIH-153 analyst demo. It presents deterministic, provenance-safe demo cases."""
import json
from pathlib import Path
import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
CASES = json.loads((ROOT / 'processed_data' / 'final_demo' / 'demo_cases.json').read_text(encoding='utf-8'))
CLAIMS = json.loads((ROOT / 'reports' / 'final' / 'approved_claims.json').read_text(encoding='utf-8'))

st.set_page_config(page_title='SIH-153 Analyst Demo', layout='wide')
st.title('AI Network Attack Forecasting — Analyst Demo')
st.caption('Offline recorded-dataset replay using existing validated artifacts. No model retraining or cloud service is used.')

if 'replay_index' not in st.session_state:
    st.session_state.replay_index = 0
controls = st.columns([1, 1, 1, 4])
with controls[0]:
    if st.button('◀ Previous', disabled=st.session_state.replay_index == 0):
        st.session_state.replay_index -= 1
with controls[1]:
    if st.button('Next ▶', disabled=st.session_state.replay_index == len(CASES) - 1):
        st.session_state.replay_index += 1
with controls[2]:
    if st.button('Reset'):
        st.session_state.replay_index = 0
index = st.slider('Recorded replay window / case', 0, len(CASES) - 1, st.session_state.replay_index)
st.session_state.replay_index = index
case = CASES[index]
st.caption(f"Recorded dataset replay — window/case {index + 1} of {len(CASES)}")
st.subheader(case['purpose'])
st.write(case['input_context'])
cols = st.columns(2)
with cols[0]:
    st.subheader('Stage-1 flow risk / forecast')
    if case['stage1_output']:
        st.json(case['stage1_output'])
        trajectory = case['stage1_output'].get('forecast', {})
        if trajectory:
            st.line_chart(trajectory, y_label='Predicted attack-state probability')
            st.caption('Validated next-window attack-state forecasting. Persistence is the strongest validated reference on the current dataset.')
    else:
        st.info('No Stage-1 evidence is attached to this packet-only case.')
with cols[1]:
    st.subheader('Stage-2 packet intelligence')
    if case['stage2_output']:
        st.json(case['stage2_output'])
    else:
        st.info('No Stage-2 evidence is attached to this flow-only case.')
st.subheader('MITRE ATT&CK evidence')
st.write(case['mitre_evidence'])
st.subheader('Explainability')
st.write(case['xai_evidence'])
st.subheader('Why is this risk level shown?')
if case['stage2_output']:
    st.write('Packet-channel global drivers: packet-size maximum, SYN/ACK ratio, and median inter-arrival time. The recorded state changes are shown above.')
elif case['stage1_output']:
    st.write('Flow-channel global native feature importance is available in the Stage-1 XGBoost report. This panel does not claim a causal, local explanation.')
else:
    st.info('No model evidence is available for this case.')
st.subheader('Analyst assessment')
st.metric('Severity', case['severity'])
st.write('**Confidence:**', case['confidence'])
st.write('**Recommended action:**', case['recommended_action'])
st.warning('Uncertainty: ' + ' '.join(case['uncertainty']))
st.subheader('Evidence provenance')
st.info(case['provenance'])
st.markdown('**Contextual evidence from independent dataset/capture pipelines; not a supervised temporal fusion prediction.**')
with st.expander('Approved claim language and limitations'):
    st.json(CLAIMS)
