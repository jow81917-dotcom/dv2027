function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
function toBase64(value: Uint8Array) {
  return btoa(Array.from(value, b => String.fromCharCode(b)).join(''));
}

// WARNING: key lives in the frontend bundle — a real backend would be needed for true secrecy.
export async function encryptIdNumber(plainText: string): Promise<string> {
  const encodedKey = import.meta.env.VITE_ID_ENC_KEY as string | undefined;
  if (!encodedKey) throw new Error('VITE_ID_ENC_KEY is not set.');
  const rawKey = fromBase64(encodedKey);
  if (rawKey.byteLength !== 32) throw new Error('VITE_ID_ENC_KEY must decode to exactly 32 bytes.');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plainText)));
  const combined = new Uint8Array(iv.length + encrypted.length);
  combined.set(iv);
  combined.set(encrypted, iv.length);
  return toBase64(combined);
}
