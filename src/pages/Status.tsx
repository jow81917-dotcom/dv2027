import { FormEvent, useState } from 'react';
import { InnerShell } from '../App';
import { lookupStatus } from '../lib/api';

const labels: Record<string, string> = {
  pending_payment: 'Waiting for payment',
  payment_submitted: 'Payment submitted — under review',
  payment_verified: 'Payment verified',
  submitted: 'Entry submitted',
  completed: 'Completed',
  rejected: 'Rejected',
};

export default function Status() {
  const [ref, setRef] = useState(''), [phone, setPhone] = useState('');
  const [result, setResult] = useState<any>(null), [searched, setSearched] = useState(false);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setResult(null); setSearched(false);
    if (!/^DVR-[0-9A-F]{8}$/.test(ref.trim())) return setError('Enter a reference in the format DVR-XXXXXXXX using uppercase letters and numbers.');
    if (!/^\+?[0-9]{9,15}$/.test(phone.trim())) return setError('Enter the phone number used during registration.');
    setBusy(true);
    try {
      const row = await lookupStatus(ref.trim(), phone.trim());
      setResult(row); setSearched(true);
    } catch (err: any) {
      if (err?.message?.includes('404') || err?.message?.includes('Not found')) { setResult(null); setSearched(true); }
      else setError(err instanceof Error ? err.message : 'Unable to look up this registration. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <InnerShell>
      <div className="content-card status-card">
        <div className="eyebrow blue-eyebrow">REGISTRATION STATUS</div>
        <h1>Check my status</h1>
        <p className="muted">Enter your reference and the phone number used during registration.</p>
        <form className="status-form" onSubmit={e => void submit(e)}>
          <label className="field">Registration reference<input value={ref} onChange={e => setRef(e.target.value.toUpperCase())} placeholder="DVR-1A2B3C4D" required /></label>
          <label className="field">Phone number<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251…" required /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="button primary-button" disabled={busy}>{busy ? 'Checking…' : 'Check status'}</button>
        </form>
        {searched && (result
          ? <div className="result-card">
              <div className="result-status">{labels[result.status] || result.status}</div>
              <p><span>Reference</span><strong>{result.reference}</strong></p>
              <p><span>First name</span><strong>{result.first_name}</strong></p>
              <p><span>Created</span><strong>{new Date(result.created_at).toLocaleString()}</strong></p>
            </div>
          : <div className="not-found-box">We could not find a registration matching that reference and phone number. Check both and try again.</div>
        )}
      </div>
    </InnerShell>
  );
}
