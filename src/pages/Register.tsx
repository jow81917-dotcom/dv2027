import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InnerShell } from '../App';
import { encryptIdNumber } from '../lib/crypto';
import { registerApplicant } from '../lib/api';

const steps = [
  { name: 'Personal', am: 'የግል' }, { name: 'Birth', am: 'የትውልድ' }, { name: 'Contact', am: 'አድራሻ' },
  { name: 'Family', am: 'ቤተሰብ' }, { name: 'Education', am: 'ትምህርት' }, { name: 'Work', am: 'ሥራ' }, { name: 'ID', am: 'መታወቂያ' },
];
const blank = { first_name: '', middle_name: '', last_name: '', gender: '', birth_date: '', birth_city: '', birth_country: '', email: '', phone: '', country_of_residence: '', marital_status: '', children_count: '0', spouse_details: '', education: '', school: '', occupation: '', work_years: '0', id_type: 'passport', id_number: '', consent: false };
type F = typeof blank;

function Field({ label, name, data, setData, type = 'text', required = false, children, ...props }: any) {
  return (
    <label className="field">
      {label}{required && <span className="required"> *</span>}
      {children ?? <input type={type} value={data[name]} onChange={(e: any) => setData((d: F) => ({ ...d, [name]: e.target.value }))} required={required} {...props} />}
    </label>
  );
}

export default function Register() {
  const [step, setStep] = useState(0), [data, setData] = useState<F>(blank), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const update = (name: keyof F, value: any) => setData(d => ({ ...d, [name]: value }));

  function next() {
    setError('');
    if (step === 0 && (!data.first_name.trim() || !data.last_name.trim())) return setError('First name and last name are required.');
    if (step === 2 && (!data.phone.trim() || !/^\+?[0-9]{9,15}$/.test(data.phone))) return setError('Enter a valid phone number with 9–15 digits.');
    if (step === 6 && (!data.id_number.trim() || !data.consent)) return setError('Enter your ID number and accept the consent statement.');
    setStep(s => Math.min(6, s + 1));
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const encrypted = await encryptIdNumber(data.id_number);
      const { reference } = await registerApplicant({ ...data, children_count: Number(data.children_count) || 0, work_years: Number(data.work_years) || 0, id_number: encrypted, consent: true });
      navigate(`/payment?ref=${encodeURIComponent(reference)}&phone=${encodeURIComponent(data.phone)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <InnerShell>
      <div className="form-card">
        <div className="eyebrow blue-eyebrow">PRE-REGISTRATION</div>
        <h1>Your details</h1>
        <p className="muted">Fields marked * are required. / * ምልክት ያላቸው ያስፈልጋሉ።</p>
        <div className="step-tabs">{steps.map((s, i) => <button type="button" key={s.name} className={i === step ? 'active' : ''} onClick={() => { if (i < step) setStep(i); }}><b>{s.name}</b><small>{s.am}</small></button>)}</div>
        <div className="progress-track"><div style={{ width: `${((step + 1) / 7) * 100}%` }} /></div>
        {error && <div className="error-box" role="alert">{error}</div>}
        <form onSubmit={e => { if (step < 6) { e.preventDefault(); next(); } else void submit(e); }}>
          {step === 0 && <div className="field-grid">
            <Field label="First name / የመጀመሪያ ስም" name="first_name" data={data} setData={setData} required />
            <Field label="Middle name / የአባት ስም" name="middle_name" data={data} setData={setData} />
            <Field label="Last name / የአያት ስም" name="last_name" data={data} setData={setData} required />
            <Field label="Gender / ጾታ" name="gender" data={data} setData={setData}>
              <select value={data.gender} onChange={e => update('gender', e.target.value)}><option value="">Select</option>{['Female', 'Male', 'Prefer not to say'].map(x => <option key={x}>{x}</option>)}</select>
            </Field>
          </div>}
          {step === 1 && <div className="field-grid">
            <Field label="Birth date / የትውልድ ቀን" name="birth_date" data={data} setData={setData} type="date" />
            <Field label="Birth city / የትውልድ ከተማ" name="birth_city" data={data} setData={setData} />
            <Field label="Birth country / የትውልድ አገር" name="birth_country" data={data} setData={setData} />
          </div>}
          {step === 2 && <div className="field-grid">
            <Field label="Email" name="email" data={data} setData={setData} type="email" />
            <Field label="Phone / ስልክ *" name="phone" data={data} setData={setData} type="tel" required />
            <Field label="Country of residence / የመኖሪያ አገር" name="country_of_residence" data={data} setData={setData} />
          </div>}
          {step === 3 && <div className="field-grid">
            <Field label="Marital status / የጋብቻ ሁኔታ" name="marital_status" data={data} setData={setData}>
              <select value={data.marital_status} onChange={e => update('marital_status', e.target.value)}><option value="">Select</option>{['Single', 'Married', 'Divorced', 'Widowed'].map(x => <option key={x}>{x}</option>)}</select>
            </Field>
            <Field label="Children count (0–30)" name="children_count" data={data} setData={setData} type="number" min="0" max="30" />
            <Field label="Spouse details (optional)" name="spouse_details" data={data} setData={setData} />
          </div>}
          {step === 4 && <div className="field-grid">
            <Field label="Education / ትምህርት" name="education" data={data} setData={setData}>
              <select value={data.education} onChange={e => update('education', e.target.value)}><option value="">Select</option>{['Primary', 'Secondary', 'Technical', 'College', 'Postgraduate', 'Other'].map(x => <option key={x}>{x}</option>)}</select>
            </Field>
            <Field label="School" name="school" data={data} setData={setData} />
          </div>}
          {step === 5 && <div className="field-grid">
            <Field label="Occupation" name="occupation" data={data} setData={setData} />
            <Field label="Work years (0–70)" name="work_years" data={data} setData={setData} type="number" min="0" max="70" />
          </div>}
          {step === 6 && <div className="field-grid">
            <fieldset className="field radio-field">
              <legend>ID type / የመታወቂያ አይነት *</legend>
              <label><input type="radio" checked={data.id_type === 'passport'} onChange={() => update('id_type', 'passport')} /> Passport</label>
              <label><input type="radio" checked={data.id_type === 'fan'} onChange={() => update('id_type', 'fan')} /> FAN ID</label>
            </fieldset>
            <Field label="ID number / መለያ ቁጥር" name="id_number" data={data} setData={setData} required />
            <label className="consent">
              <input type="checkbox" checked={data.consent} onChange={e => update('consent', e.target.checked)} />
              I confirm the information is accurate and consent to its use for this service. Winners are chosen randomly; pre-registering early does not improve my chances.
            </label>
          </div>}
          <div className="form-actions">
            {step > 0 && <button type="button" className="button secondary-button" onClick={() => { setError(''); setStep(s => s - 1); }}>Back</button>}
            {step < 6 ? <button type="submit" className="button primary-button">Continue</button> : <button type="submit" disabled={busy} className="button primary-button">{busy ? 'Submitting…' : 'Continue to payment'}</button>}
          </div>
        </form>
      </div>
    </InnerShell>
  );
}
