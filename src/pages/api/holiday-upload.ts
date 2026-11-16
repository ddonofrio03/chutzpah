/*
  Lets the /update/ page upload a holiday menu (PDF, JPG or PNG) straight to Vercel Blob
  from the phone. The file goes directly to storage, so big PDFs are fine. This route only
  checks the PIN and hands out a short-lived upload permission.
*/
import type { APIRoute } from 'astro';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { json, pinOk, blobToken } from '../../lib/store';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      token: blobToken(),
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const { pin } = JSON.parse(clientPayload || '{}');
        if (!pinOk(pin)) throw new Error('That PIN is not right. Check it and try again.');
        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 25 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do: the update page saves the file's address when Eric taps Save.
      },
    });
    return json(result);
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
};
