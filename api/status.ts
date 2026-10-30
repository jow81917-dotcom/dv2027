import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reference, phone } = req.body ?? {};
  if (!reference?.trim() || !phone?.trim()) return res.status(400).json({ error: 'reference and phone are required' });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM lookup_status(${reference.trim()}, ${phone.trim()})`;

  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  return res.status(200).json(rows[0]);
}
