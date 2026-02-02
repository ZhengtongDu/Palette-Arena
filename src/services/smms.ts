const SMMS_API_URL = 'https://sm.ms/api/v2';

interface SmmsUploadResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    file_id: number;
    width: number;
    height: number;
    filename: string;
    storename: string;
    size: number;
    path: string;
    hash: string;
    url: string;
    delete: string;
    page: string;
  };
  images?: string;
}

export async function uploadToSmms(file: File): Promise<string> {
  const token = import.meta.env.VITE_SMMS_TOKEN;

  if (!token) {
    throw new Error('SM.MS API Token not configured');
  }

  const formData = new FormData();
  formData.append('smfile', file);

  const response = await fetch(`${SMMS_API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: token,
    },
    body: formData,
  });

  const result: SmmsUploadResponse = await response.json();

  if (result.success && result.data) {
    return result.data.url;
  }

  // If image already exists, SM.MS returns the existing URL
  if (result.code === 'image_repeated' && result.images) {
    return result.images;
  }

  throw new Error(result.message || 'Upload failed');
}

export async function deleteFromSmms(hash: string): Promise<boolean> {
  const token = import.meta.env.VITE_SMMS_TOKEN;

  if (!token) {
    throw new Error('SM.MS API Token not configured');
  }

  const response = await fetch(`${SMMS_API_URL}/delete/${hash}`, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  });

  const result = await response.json();
  return result.success;
}
