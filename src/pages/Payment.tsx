import { FormEvent, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { upload } from '@vercel/blob/client';
import { InnerShell } from '../App';
import { confirmPayment } from '../lib/api';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const telegram = (import.meta.env.VITE_TELEGRAM_HANDLE || 'suceessprime1').replace(/^@/, '');

export default function Payment() {
  const [params] = useSearchParams();
  const ref = params.get('ref') || '';
  const phone = params.get('phone') || '';
  const telebirrNumber = import.meta.env.VITE_TELEBIRR_NUMBER || 'Not configured';
  const telebirrName = import.meta.env.VITE_TELEBIRR_NAME || 'Not configured';

  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [payer, setPayer] = useState('');
  const [transaction, setTransaction] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function copy() {
    try { await navigator.clipboard.writeText(telebirrNumber); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { setError('Could not copy. Please copy manually.'); }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (!/^DVR-[0-9A-F]{8}$/.test(ref)) return setError('A valid registration reference is required.');
    if (!payer.trim() || payer.length > 100) return setError('Enter a payer name (max 100 characters).');
    if (!transaction.trim() || transaction.length > 100) return setError('Enter a transaction reference (max 100 characters).');
    if (!file) return setError('Choose your payment proof file.');
    if (!ALLOWED.includes(file.type) || file.size > MAX_SIZE) return setError('File must be PNG, JPG, WEBP, or PDF and under 5 MB.');
    setBusy(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const pathname = `${ref}/${crypto.randomUUID()}.${ext}`;
      const blob = await upload(pathname, file, { access: 'public', handleUploadUrl: '/api/payment-token' });
      await confirmPayment({ reference: ref, phone, payer_name: payer, transaction_reference: transaction, proof_url: blob.url });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally { setBusy(false); }
  }

  if (done) return (
    <InnerShell>
      <div className="content-card">
        <div className="eyebrow blue-eyebrow">PAYMENT</div>
        <h1>Payment submitted ✓</h1>
        <p>Your payment proof has been received. We will verify it and update your status within 24 hours.</p>
        <p><strong>Reference:</strong> {ref}</p>
        <Link to="/status" className="button primary-button">Check my status</Link>
      </div>
    </InnerShell>
  );

  return (
    <InnerShell>
      <div className="content-card">
        <div className="eyebrow blue-eyebrow">PAYMENT</div>
        <h1>Complete your service fee</h1>
        <p className="reference">Registration reference: <strong>{ref || 'Reference missing'}</strong><br /><span>Save it — you need it to check your status.</span></p>
        <div className="telebirr-card">
          <div><span className="muted">Telebirr number</span><div className="copy-row"><strong>{telebirrNumber}</strong><button type="button" className="copy-button" onClick={() => void copy()}>{copied ? 'Copied' : 'Copy'}</button></div></div>
          <div><span className="muted">Account holder</span><strong>{telebirrName}</strong></div>
          <div><span className="muted">Amount</span><strong className="amount">350 Birr</strong></div>
        </div>
        <p className="amharic-note">ከመላክዎ በፊት የተቀባዩን ስምና ቁጥር ያረጋግጡ።</p>
        <form onSubmit={e => void submit(e)} className="payment-form">
          {error && <div className="error-box" role="alert">{error}</div>}
          <label className="field">Payer name *<input value={payer} onChange={e => setPayer(e.target.value)} maxLength={100} required /></label>
          <label className="field">Transaction reference *<input value={transaction} onChange={e => setTransaction(e.target.value)} maxLength={100} required /></label>
          <label className="field">Payment proof *
            <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} required />
            <small>PNG, JPG, WEBP, or PDF. Maximum 5 MB.</small>
          </label>
          <button className="button primary-button" disabled={busy}>{busy ? 'Uploading…' : 'Submit payment proof'}</button>
        </form>
        <div className="support-card">
          <h2>Need help?</h2>
          <p>Contact us on Telegram for support.</p>
          <a href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer">Contact @{telegram}</a>
        </div>
        <p className="small-disclaimer">This is a private service, not an official government website.<br />ይህ የግል አገልግሎት ነው፤ የመንግስት ድረ ገጽ አይደለም።</p>
      </div>
    </InnerShell>
  );
}
