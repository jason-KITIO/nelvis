import { NextRequest, NextResponse } from 'next/server';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = await generateSignature(timestamp);

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY);
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', 'nelvis_logos');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'Upload failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateSignature(timestamp: number): Promise<string> {
  const crypto = await import('crypto');
  const stringToSign = `folder=nelvis_logos&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}
