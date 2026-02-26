const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;

export const cloudinaryService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'upload de l\'image');
    }

    const data = await response.json();
    return data.url;
  },
};
