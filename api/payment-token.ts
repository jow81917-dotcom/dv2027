import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = await handleUpload({
    body: req.body as HandleUploadBody,
    request: req as unknown as Request,
    onBeforeGenerateToken: async (pathname) => {
      if (!/^DVR-[0-9A-F]{8}\//.test(pathname)) throw new Error('Invalid pathname');
      return {
        allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
        maximumSizeInBytes: 5 * 1024 * 1024,
        addRandomSuffix: false,
      };
    },
    onUploadCompleted: async () => {},
  });
  return res.status(200).json(body);
}
