import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InnerShell } from '../App';

const DEADLINE = new Date('2026-11-01T00:00:00-04:00').getTime();

function useCountdown() {
  const [diff, setDiff] = useState(DEADLINE - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(DEADLINE - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const total = Math.max(0, diff);
  const d = Math.floor(total / 86400000);
  const h = Math.floor((total % 86400000) / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { d, h, m, s };
}

export default function Landing() {
  const { d, h, m, s } = useCountdown();
  return (
    <div className="landing">
      <div className="flag-stripe" />
      <section className="hero">
        <div className="eyebrow blue-eyebrow">INDEPENDENT PRIVATE SERVICE</div>
        <h1>DV Lottery<br />Pre-Registration<br />Assistance</h1>
        <p className="hero-sub">We help you prepare and submit your Diversity Visa pre-registration. Not affiliated with the U.S. government.</p>
        <p className="hero-sub-am">የዲቪ ሎተሪ ቅድመ ምዝገባ እርዳታ። ከአሜሪካ መንግስት ጋር ምንም ግንኙነት የለንም።</p>
        <div className="countdown">
          <div><span>{d}</span><small>Days</small></div>
          <div><span>{h}</span><small>Hours</small></div>
          <div><span>{m}</span><small>Min</small></div>
          <div><span>{s}</span><small>Sec</small></div>
        </div>
        <p className="countdown-label">Until estimated DV-2026 deadline</p>
        <Link to="/register" className="button primary-button hero-cta">Start Pre-Registration</Link>
      </section>

      <section className="how-it-works content-section">
        <h2>How it works / እንዴት ይሰራል</h2>
        <div className="steps-grid">
          <div className="step-card"><div className="step-num">1</div><h3>Register / ይመዝገቡ</h3><p>Fill in your details across 7 simple steps. Takes about 5 minutes.</p></div>
          <div className="step-card"><div className="step-num">2</div><h3>Pay / ይክፈሉ</h3><p>Send 350 Birr via Telebirr and upload your payment proof.</p></div>
          <div className="step-card"><div className="step-num">3</div><h3>We submit / እናስገባለን</h3><p>We review your details and submit your entry during the open period.</p></div>
          <div className="step-card"><div className="step-num">4</div><h3>Check status / ሁኔታ ያረጋግጡ</h3><p>Use your reference number and phone to track your registration status.</p></div>
        </div>
      </section>

      <section className="fee-section content-section">
        <div className="fee-card">
          <div className="eyebrow">SERVICE FEE</div>
          <div className="fee-amount">350 <span>Birr</span></div>
          <p>One-time fee via Telebirr. Manually verified by our team.</p>
          <p className="fee-am">አንድ ጊዜ የሚከፈል ክፍያ። በቴሌብር ይላኩ።</p>
        </div>
      </section>

      <section className="promises content-section">
        <h2>Our promises / ቃላችን</h2>
        <ul>
          <li>✓ Your data is stored securely and never sold.</li>
          <li>✓ Winners are chosen randomly by the U.S. government — early registration does not improve your chances.</li>
          <li>✓ We are an independent private service, not a government agency.</li>
          <li>✓ ውሂብዎ በደህንነት ይቀመጣል፤ ለሌሎች አይሸጥም።</li>
        </ul>
      </section>

      <section className="faq content-section">
        <h2>FAQ</h2>
        <details><summary>Is this an official U.S. government service?</summary><p>No. This is an independent private assistance service. The official DV Lottery is run by the U.S. Department of State at dvlottery.state.gov.</p></details>
        <details><summary>Do I get a guaranteed visa?</summary><p>No. Selection is random. Pre-registering early does not improve your chances.</p></details>
        <details><summary>What happens after I pay?</summary><p>Our team verifies your payment, reviews your details, and submits your entry. You can track progress on the status page.</p></details>
        <details><summary>What if I am selected?</summary><p>We will contact you using the phone number and email you provided.</p></details>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} DV Assist — Independent private service. Not affiliated with the U.S. government.</p>
        <p>Contact: <a href={`https://t.me/${import.meta.env.VITE_TELEGRAM_HANDLE || 'suceessprime1'}`} target="_blank" rel="noreferrer">@{import.meta.env.VITE_TELEGRAM_HANDLE || 'suceessprime1'}</a></p>
      </footer>
    </div>
  );
}
