import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    first_name, last_name, middle_name, gender, birth_date, birth_city, birth_country,
    email, phone, country_of_residence, marital_status, children_count, spouse_details,
    education, school, occupation, work_years, id_type, id_number, consent,
  } = req.body ?? {};

  if (!first_name?.trim()) return res.status(400).json({ error: 'first_name is required' });
  if (!last_name?.trim()) return res.status(400).json({ error: 'last_name is required' });
  if (!phone?.trim()) return res.status(400).json({ error: 'phone is required' });
  if (!id_number?.trim()) return res.status(400).json({ error: 'id_number is required' });
  if (!consent) return res.status(400).json({ error: 'consent is required' });

  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    INSERT INTO applicants (
      first_name, middle_name, last_name, gender, birth_date, birth_city, birth_country,
      email, phone, country_of_residence, marital_status, children_count, spouse_details,
      education, school, occupation, work_years, id_type, id_number, consent, status
    ) VALUES (
      ${first_name.trim()}, ${middle_name?.trim() || null}, ${last_name.trim()},
      ${gender || null}, ${birth_date || null}, ${birth_city?.trim() || null}, ${birth_country?.trim() || null},
      ${email?.trim() || null}, ${phone.trim()}, ${country_of_residence?.trim() || null},
      ${marital_status || null}, ${Number(children_count) || 0}, ${spouse_details?.trim() || null},
      ${education || null}, ${school?.trim() || null}, ${occupation?.trim() || null},
      ${Number(work_years) || 0}, ${id_type || 'passport'}, ${id_number.trim()},
      true, 'pending_payment'
    )
    RETURNING reference
  `;

  return res.status(201).json({ reference: rows[0].reference });
}
