import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reference, phone, payer_name, transaction_reference, proof_url } = req.body ?? {};
  if (!reference?.trim()) return res.status(400).json({ error: 'reference is required' });
  if (!phone?.trim()) return res.status(400).json({ error: 'phone is required' });
  if (!payer_name?.trim()) return res.status(400).json({ error: 'payer_name is required' });
  if (!transaction_reference?.trim()) return res.status(400).json({ error: 'transaction_reference is required' });
  if (!proof_url?.trim()) return res.status(400).json({ error: 'proof_url is required' });

  const sql = neon(process.env.DATABASE_URL!);

  const applicants = await sql`
    SELECT id FROM applicants WHERE reference = ${reference.trim()} AND phone = ${phone.trim()} LIMIT 1
  `;
  if (!applicants.length) return res.status(404).json({ error: 'No matching registration found' });

  const applicant_id = applicants[0].id;

  await sql`
    INSERT INTO payments (applicant_id, method, amount, payer_name, transaction_reference, proof_url, verified)
    VALUES (${applicant_id}, 'Telebirr', 350.00, ${payer_name.trim()}, ${transaction_reference.trim()}, ${proof_url.trim()}, false)
  `;

  await sql`
    UPDATE applicants SET status = 'payment_submitted' WHERE id = ${applicant_id}
  `;

  return res.status(200).json({ success: true });
}
