// ============================================
// REST API Adapter - Default Backend Adapter
// ============================================

import type { DeleteItemTarget, FileManagerAdapter, FileItem, UploadProgress } from '@/types';

export class RestAdapter implements FileManagerAdapter {
    private baseUrl: string;

    constructor(baseUrl: string = '/api/files') {
        this.baseUrl = baseUrl;
    }

    async listFiles(path: string): Promise<FileItem[]> {
        const res = await fetch(
            `${this.baseUrl}?path=${encodeURIComponent(path)}`
        );
        if (!res.ok) throw new Error('Failed to list files');
        return res.json();
    }

    async createFolder(path: string, name: string): Promise<FileItem> {
        const res = await fetch(`${this.baseUrl}/folder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, name }),
        });
        if (!res.ok) throw new Error('Failed to create folder');
        return res.json();
    }

    async deleteItems(targets: DeleteItemTarget[]): Promise<void> {
        const res = await fetch(this.baseUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paths: targets.map((t) => t.path) }),
        });
        if (!res.ok) throw new Error('Failed to delete items');
    }

    async renameItem(path: string, newName: string): Promise<FileItem> {
        const res = await fetch(`${this.baseUrl}/rename`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, newName }),
        });
        if (!res.ok) throw new Error('Failed to rename item');
        return res.json();
    }

    async moveItems(sourcePaths: string[], targetPath: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/move`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourcePaths, targetPath }),
        });
        if (!res.ok) throw new Error('Failed to move items');
    }

    async copyItems(sourcePaths: string[], targetPath: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/copy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourcePaths, targetPath }),
        });
        if (!res.ok) throw new Error('Failed to copy items');
    }

    async uploadFiles(
        path: string,
        files: File[],
        onProgress?: (progress: UploadProgress[]) => void
    ): Promise<FileItem[]> {
        const formData = new FormData();
        formData.append('path', path);
        files.forEach((file) => formData.append('files', file));

        // Set all to uploading
        if (onProgress) {
            onProgress(
                files.map((file) => ({
                    file,
                    progress: 0,
                    status: 'uploading' as const,
                }))
            );
        }

        const res = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Failed to upload files');

        // Set all to success
        if (onProgress) {
            onProgress(
                files.map((file) => ({
                    file,
                    progress: 100,
                    status: 'success' as const,
                }))
            );
        }

        return res.json();
    }

    async downloadFile(path: string): Promise<Blob> {
        const response = await fetch(`${this.baseUrl}/download?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }
        return response.blob();
    }

    async saveFileContent(path: string, content: string | Blob): Promise<FileItem> {
        const formData = new FormData();
        formData.append('path', path);
        // If it's a blob, append as file, otherwise append as text blob
        if (content instanceof Blob) {
            formData.append('content', content);
        } else {
            formData.append('content', new Blob([content], { type: 'text/plain' }));
        }

        const response = await fetch(`${this.baseUrl}/save`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Save failed: ${response.statusText}`);
        }

        return response.json();
    }
    getPreviewUrl(path: string): string {
        return `${this.baseUrl}/preview?path=${encodeURIComponent(path)}`;
    }

    getDownloadUrl(path: string): string {
        return `${this.baseUrl}/download?path=${encodeURIComponent(path)}`;
    }

    async search(path: string, query: string): Promise<FileItem[]> {
        const res = await fetch(
            `${this.baseUrl}/search?path=${encodeURIComponent(path)}&q=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error('Failed to search files');
        return res.json();
    }
}
