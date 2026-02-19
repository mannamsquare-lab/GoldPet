import { apiClient } from './apiClient';

interface FileUploadResponse {
  id: number;
  url: string;
  fileType: string;
  mimeType: string;
  originalFileName: string;
}

export const fileService = {
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<FileUploadResponse>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
