'use client';

import { useState } from 'react';

export function DdysDiagnostics({ endpoint = '/api/ddys/diagnostics' }: { endpoint?: string }) {
  const [status, setStatus] = useState('Ready.');
  const [data, setData] = useState<unknown>(null);

  async function load() {
    setStatus('Loading...');
    const response = await fetch(endpoint, { credentials: 'same-origin' });
    const json = await response.json().catch(() => ({ success: false, message: 'Invalid JSON response.' }));
    setData(json);
    setStatus(json.success ? 'Diagnostics loaded.' : json.message || `HTTP ${response.status}`);
  }

  async function test() {
    setStatus('Testing...');
    const response = await fetch(endpoint, { method: 'POST', credentials: 'same-origin' });
    const json = await response.json().catch(() => ({ success: false, message: 'Invalid JSON response.' }));
    setData(json);
    setStatus(json.success ? 'Connection OK.' : json.message || `HTTP ${response.status}`);
  }

  return (
    <section className="ddys-rr-diagnostics">
      <div className="ddys-rr-actions">
        <button type="button" onClick={load}>Load diagnostics</button>
        <button type="button" onClick={test}>Test API</button>
      </div>
      <p className="ddys-rr-status" role="status">{status}</p>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : null}
    </section>
  );
}
