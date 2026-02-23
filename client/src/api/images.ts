import api from './client';

interface UploadedImage {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadedImage>('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteImage(id: string): Promise<void> {
  await api.delete(`/images/${id}`);
}
