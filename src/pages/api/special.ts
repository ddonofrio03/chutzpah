/*
  The daily special.

  GET  /api/special  -> the current special as JSON (cached at the edge for 30 seconds).
  POST /api/special  -> Eric posts a new special from /update/. Needs the PIN.

  The special is stored as one small JSON file in Vercel Blob storage.
  Settings (in Vercel > Project > Settings > Environment Variables):
    BLOB_READ_WRITE_TOKEN  added automatically when the Blob store was connected
    UPDATE_PIN             the PIN Eric types on the update page
*/
import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';

export const prerender = false;

const FILE = 'special.json';
const LIMITS = { label: 40, title: 80, description: 300, price: 30 };
const LABELS = ["Today's Special", 'Breakfast Special', 'Lunch Special', 'Dinner Special', 'Weekend Special'];

export type Special = {
  show: boolean;
  label: string;
  title: string;
  description: string;
  price: string;
  updatedAt: string;
};

function token() {
  return import.meta.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN ?? '';
}

/** Public address of the stored file, worked out from the store id inside the token. */
function fileUrl() {
  const storeId = token().split('_')[3]?.toLowerCase();
  return storeId ? `https://${storeId}.public.blob.vercel-storage.com/${FILE}` : '';
}

function json(body: unknown, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': cache },
  });
}

/** Compare without leaking timing information about how much of the PIN matched. */
function samePin(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

export const GET: APIRoute = async () => {
  const url = fileUrl();
  if (!url) return json({ error: 'not configured' }, 503);
  try {
    // Minute-sized cache buster so a new special shows within about a minute everywhere.
    const res = await fetch(`${url}?v=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store' });
    if (!res.ok) return json({ error: 'no special posted yet' }, 404);
    const data = (await res.json()) as Special;
    return json(data, 200, 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const pin = import.meta.env.UPDATE_PIN ?? process.env.UPDATE_PIN ?? '';
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Something went wrong sending the form. Try again.' }, 400);
  }

  if (!samePin(String(body.pin ?? ''), pin)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 1200));
    return json({ error: 'That PIN is not right. Check it and try again.' }, 401);
  }

  const label = clean(body.label, LIMITS.label);
  const special: Special = {
    show: Boolean(body.show),
    label: LABELS.includes(label) ? label : "Today's Special",
    title: clean(body.title, LIMITS.title),
    description: clean(body.description, LIMITS.description),
    price: clean(body.price, LIMITS.price),
    updatedAt: new Date().toISOString(),
  };
  if (special.show && !special.title) {
    return json({ error: 'Add the name of the special before posting.' }, 400);
  }

  try {
    await put(FILE, JSON.stringify(special), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      token: token(),
    });
  } catch {
    return json({ error: 'Could not save right now. Try again in a minute.' }, 502);
  }
  return json({ ok: true, special });
};
