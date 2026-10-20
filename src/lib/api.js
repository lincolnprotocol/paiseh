// Calls to the Node server. Any failure (server down, no AWS config, slow reply, bad JSON)
// throws, and the caller falls back to the scripted demo or saves the feedback for later.

async function post(url, payload, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Asks the server (which calls Amazon Bedrock) for the next conversation turn.
export async function fetchTurn(payload, { timeoutMs = 9000 } = {}) {
  const data = await post('/api/chat', payload, timeoutMs);
  if (!data?.ai?.text) throw new Error('chat reply had the wrong shape');
  return data;
}

export async function postFeedback(entry) {
  const data = await post('/api/feedback', entry, 6000);
  if (!data?.ok) throw new Error('feedback not accepted');
}
