// ============================================
// Supabase Storage Adapter
// ============================================

import type { FileItem, FileManagerAdapter, UploadProgress } from '@/types';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

export interface SupabaseAdapterConfig {
    url: string;
    anonKey: string;
    bucketName: string;
}

interface SupabaseFileObject {
    id?: string | null;
    name: string;
    metadata?: {
        size?: number;
        mimetype?: string;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export class SupabaseAdapter implements FileManagerAdapter {
    private supabase: SupabaseClient;
    private bucketName: string;

    constructor(config: SupabaseAdapterConfig) {
        this.supabase = createClient(config.url, config.anonKey);
        this.bucketName = config.bucketName;
    }

    async listFiles(path: string): Promise<FileItem[]> {
        // Remove leading slash
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .list(normalizedPath, {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) {
            console.error('Error listing files:', error);
            throw new Error(`Failed to list files: ${error.message}`);
        }

        return (data || []).map((item: SupabaseFileObject) => {
            const fullPath = normalizedPath ? `/${normalizedPath}/${item.name}` : `/${item.name}`;

            return {
                id: item.id || fullPath,
                name: item.name,
                isDirectory: !item.metadata,
                size: item.metadata?.size || 0,
                mimeType: item.metadata?.mimetype || 'application/octet-stream',
                path: fullPath,
                parentPath: `/${normalizedPath}`,
                createdAt: item.created_at || new Date().toISOString(),
                modifiedAt: item.updated_at || item.created_at || new Date().toISOString(),
                thumbnailUrl: item.metadata ? this.getPreviewUrl(fullPath) : undefined,
            };
        });
    }

    async createFolder(path: string, name: string): Promise<FileItem> {
        // Supabase doesn't have explicit folder creation
        // We create a .folderkeep file to represent the folder
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        const folderPath = normalizedPath ? `${normalizedPath}/${name}/.folderkeep` : `${name}/.folderkeep`;

        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(folderPath, new Blob([''], { type: 'text/plain' }), {
                contentType: 'text/plain',
                upsert: false,
            });

        if (error) {
            throw new Error(`Failed to create folder: ${error.message}`);
        }

        const fullPath = normalizedPath ? `/${normalizedPath}/${name}` : `/${name}`;

        return {
            id: fullPath,
            name,
            isDirectory: true,
            size: 0,
            mimeType: 'application/folder',
            path: fullPath,
            parentPath: `/${normalizedPath}`,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    }

    async deleteItems(paths: string[]): Promise<void> {
        const normalizedPaths = paths.map(p => p.startsWith('/') ? p.slice(1) : p);

        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .remove(normalizedPaths);

        if (error) {
            throw new Error(`Failed to delete items: ${error.message}`);
        }
    }

    async renameItem(path: string, newName: string): Promise<FileItem> {
        // Supabase doesn't support rename directly, we need to move
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        const pathParts = normalizedPath.split('/');
        pathParts.pop(); // Remove old filename
        const parentPath = pathParts.join('/');
        const newPath = parentPath ? `${parentPath}/${newName}` : newName;

        const { error: moveError } = await this.supabase.storage
            .from(this.bucketName)
            .move(normalizedPath, newPath);

        if (moveError) {
            throw new Error(`Failed to rename item: ${moveError.message}`);
        }

        // Fetch the updated item info
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .list(parentPath, {
                search: newName,
            });

        if (error || !data || data.length === 0) {
            // Fallback response
            return {
                id: `/${newPath}`,
                name: newName,
                isDirectory: false,
                size: 0,
                mimeType: 'application/octet-stream',
                path: `/${newPath}`,
                parentPath: `/${parentPath}`,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
            };
        }

        const item = data[0];
        return {
            id: item.id || `/${newPath}`,
            name: item.name,
            isDirectory: !item.metadata,
            size: item.metadata?.size || 0,
            mimeType: item.metadata?.mimetype || 'application/octet-stream',
            path: `/${newPath}`,
            parentPath: `/${parentPath}`,
            createdAt: item.created_at || new Date().toISOString(),
            modifiedAt: item.updated_at || item.created_at || new Date().toISOString(),
        };
    }

    async moveItems(sourcePaths: string[], targetPath: string): Promise<void> {
        const normalizedTarget = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;

        for (const sourcePath of sourcePaths) {
            const normalizedSource = sourcePath.startsWith('/') ? sourcePath.slice(1) : sourcePath;
            const fileName = normalizedSource.split('/').pop();
            const destination = normalizedTarget ? `${normalizedTarget}/${fileName}` : fileName!;

            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .move(normalizedSource, destination);

            if (error) {
                throw new Error(`Failed to move ${fileName}: ${error.message}`);
            }
        }
    }

    async copyItems(sourcePaths: string[], targetPath: string): Promise<void> {
        const normalizedTarget = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;

        for (const sourcePath of sourcePaths) {
            const normalizedSource = sourcePath.startsWith('/') ? sourcePath.slice(1) : sourcePath;
            const fileName = normalizedSource.split('/').pop();
            const destination = normalizedTarget ? `${normalizedTarget}/${fileName}` : fileName!;

            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .copy(normalizedSource, destination);

            if (error) {
                throw new Error(`Failed to copy ${fileName}: ${error.message}`);
            }
        }
    }

    async uploadFiles(
        path: string,
        files: File[],
        onProgress?: (progress: UploadProgress[]) => void
    ): Promise<FileItem[]> {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        const uploadedItems: FileItem[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = normalizedPath ? `${normalizedPath}/${file.name}` : file.name;

            if (onProgress) {
                onProgress(
                    files.map((f, idx) => ({
                        file: f,
                        progress: idx < i ? 100 : idx === i ? 50 : 0,
                        status: idx < i ? 'success' : idx === i ? 'uploading' : 'pending',
                    }))
                );
            }

            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: true,
                });

            if (error) {
                if (onProgress) {
                    onProgress(
                        files.map((f, idx) => ({
                            file: f,
                            progress: idx <= i ? 100 : 0,
                            status: idx < i ? 'success' : idx === i ? 'error' : 'pending',
                            error: idx === i ? error.message : undefined,
                        }))
                    );
                }
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }

            uploadedItems.push({
                id: `/${filePath}`,
                name: file.name,
                isDirectory: false,
                size: file.size,
                mimeType: file.type,
                path: `/${filePath}`,
                parentPath: `/${normalizedPath}`,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                thumbnailUrl: this.getPreviewUrl(`/${filePath}`),
            });
        }

        if (onProgress) {
            onProgress(
                files.map((f) => ({
                    file: f,
                    progress: 100,
                    status: 'success',
                }))
            );
        }

        return uploadedItems;
    }

    async downloadFile(path: string): Promise<Blob> {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .download(normalizedPath);

        if (error || !data) {
            throw new Error(`Failed to download file: ${error?.message || 'Unknown error'}`);
        }

        return data;
    }

    async saveFileContent(path: string, content: string | Blob): Promise<FileItem> {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

        let blob: Blob;
        if (typeof content === 'string') {
            blob = new Blob([content], { type: 'text/plain' });
        } else {
            blob = content;
        }

        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(normalizedPath, blob, {
                contentType: blob.type || 'application/octet-stream',
                upsert: true,
            });

        if (error) {
            throw new Error(`Failed to save file: ${error.message}`);
        }

        const fileName = normalizedPath.split('/').pop() || 'file';
        const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));

        return {
            id: `/${normalizedPath}`,
            name: fileName,
            isDirectory: false,
            size: blob.size,
            mimeType: blob.type || 'application/octet-stream',
            path: `/${normalizedPath}`,
            parentPath: `/${parentPath}`,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    }

    getPreviewUrl(path: string): string {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

        const { data } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(normalizedPath);

        return data.publicUrl;
    }

    getDownloadUrl(path: string): string {
        // For Supabase, preview and download URLs are the same
        return this.getPreviewUrl(path);
    }

    async search(path: string, query: string): Promise<FileItem[]> {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .list(normalizedPath, {
                limit: 1000,
                search: query,
            });

        if (error) {
            throw new Error(`Failed to search: ${error.message}`);
        }

        return (data || []).map((item: SupabaseFileObject) => {
            const fullPath = normalizedPath ? `/${normalizedPath}/${item.name}` : `/${item.name}`;

            return {
                id: item.id || fullPath,
                name: item.name,
                isDirectory: !item.metadata,
                size: item.metadata?.size || 0,
                mimeType: item.metadata?.mimetype || 'application/octet-stream',
                path: fullPath,
                parentPath: `/${normalizedPath}`,
                createdAt: item.created_at || new Date().toISOString(),
                modifiedAt: item.updated_at || item.created_at || new Date().toISOString(),
                thumbnailUrl: item.metadata ? this.getPreviewUrl(fullPath) : undefined,
            };
        });
    }
}
