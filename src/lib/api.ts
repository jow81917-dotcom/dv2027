async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json as T;
}

export const registerApplicant = (data: Record<string, unknown>) =>
  post<{ reference: string }>('/api/register', data);

export const lookupStatus = (reference: string, phone: string) =>
  post<{ reference: string; first_name: string; status: string; created_at: string }>(
    '/api/status', { reference, phone }
  );

export const confirmPayment = (data: {
  reference: string;
  phone: string;
  payer_name: string;
  transaction_reference: string;
  proof_url: string;
}) => post<{ success: true }>('/api/payment-confirm', data);
