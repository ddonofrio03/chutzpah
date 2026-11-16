/*
  Tiny storage helpers for things Eric changes from /update/ (the daily special and
  the holiday menu). Each is one small JSON file in the project's Vercel Blob store.
*/
import { put } from '@vercel/blob';

export function blobToken(): string {
  return import.meta.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN ?? '';
}

/** Public address of a stored file, worked out from the store id inside the token. */
export function blobUrl(name: string): string {
  const storeId = blobToken().split('_')[3]?.toLowerCase();
  return storeId ? `https://${storeId}.public.blob.vercel-storage.com/${name}` : '';
}

export function json(body: unknown, status = 200, cache = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': cache },
  });
}

/** Read a stored JSON file. Returns null if nothing has been saved yet. */
export async function readJson<T>(name: string): Promise<T | null> {
  const url = blobUrl(name);
  if (!url) throw new Error('storage not configured');
  // Minute-sized cache buster so changes show within about a minute everywhere.
  const res = await fetch(`${url}?v=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function writeJson(name: string, data: unknown): Promise<void> {
  await put(name, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
    token: blobToken(),
  });
}

/** True when the PIN matches UPDATE_PIN. Compared without leaking timing. */
export function pinOk(given: unknown): boolean {
  const pin = import.meta.env.UPDATE_PIN ?? process.env.UPDATE_PIN ?? '';
  const a = String(given ?? '');
  if (!a || !pin || a.length !== pin.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ pin.charCodeAt(i);
  return diff === 0;
}

/** Wrong PIN: wait a moment before answering to slow down guessing. */
export const wrongPin = async () => {
  await new Promise((r) => setTimeout(r, 1200));
  return json({ error: 'That PIN is not right. Check it and try again.' }, 401);
};

export const clean = (v: unknown, max: number): string =>
  String(v ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

export const CACHE_PUBLIC = 'public, max-age=0, s-maxage=30, stale-while-revalidate=60';
