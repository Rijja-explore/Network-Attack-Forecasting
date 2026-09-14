export async function loadCases() {
  const res = await fetch('/data/demo_cases.json');
  const data = await res.json();
  return data.cases || data; // handle if it's wrapped in {cases: [...]}
}

export async function loadModelRegistry() {
  const res = await fetch('/data/model_registry.json');
  return res.json();
}

export async function loadApprovedClaims() {
  const res = await fetch('/data/approved_claims.json');
  return res.json();
}
