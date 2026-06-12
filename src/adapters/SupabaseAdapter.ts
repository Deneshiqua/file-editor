// ============================================
// Supabase Storage Adapter
// ============================================

import type { DeleteItemTarget, FileItem, FileManagerAdapter, UploadProgress } from '@/types';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { normalizeManagerPath, sanitizeStorageFileName, toStoragePath } from '@/utils/helpers';

export interface SupabaseAdapterConfig {
    url: string;
    anonKey: string;
    bucketName: string;
    /** Use a session-aware client (e.g. createBrowserClient) when provided */
    supabase?: SupabaseClient;
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

// Supabase Storage has no real folders; .folderkeep marks an empty directory.
// Use image/svg+xml so image-only buckets (e.g. shopon360 "media") accept the upload.
const FOLDER_PLACEHOLDER_CONTENT = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
const FOLDER_PLACEHOLDER_MIME = 'image/svg+xml';
const FOLDER_PLACEHOLDER_FILE = '.folderkeep';
const FOLDER_MARKER_FILES = [
    FOLDER_PLACEHOLDER_FILE,
    '.emptyFolderPlaceholder',
    '.gitkeep',
];

function isStorageFolder(item: SupabaseFileObject): boolean {
    return item.id == null;
}

export class SupabaseAdapter implements FileManagerAdapter {
    private supabase: SupabaseClient;
    private bucketName: string;

    constructor(config: SupabaseAdapterConfig) {
        this.supabase = config.supabase ?? createClient(config.url, config.anonKey);
        this.bucketName = config.bucketName;
    }

    async listFiles(path: string): Promise<FileItem[]> {
        const storagePath = toStoragePath(path);
        const parentPath = normalizeManagerPath(path);

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .list(storagePath, {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) {
            console.error('Error listing files:', error);
            throw new Error(`Failed to list files: ${error.message}`);
        }

        return (data || []).map((item: SupabaseFileObject) => {
            const fullPath = storagePath
                ? normalizeManagerPath(`${storagePath}/${item.name}`)
                : normalizeManagerPath(`/${item.name}`);

            return {
                id: item.id || fullPath,
                name: item.name,
                isDirectory: isStorageFolder(item),
                size: item.metadata?.size || 0,
                mimeType: item.metadata?.mimetype || 'application/octet-stream',
                path: fullPath,
                parentPath,
                createdAt: item.created_at || new Date().toISOString(),
                modifiedAt: item.updated_at || item.created_at || new Date().toISOString(),
                thumbnailUrl: isStorageFolder(item) ? undefined : this.getPreviewUrl(fullPath),
            };
        });
    }

    async createFolder(path: string, name: string): Promise<FileItem> {
        // Supabase doesn't have explicit folder creation
        // We create a .folderkeep file to represent the folder
        const storagePath = toStoragePath(path);
        const folderPath = storagePath
            ? `${storagePath}/${name}/${FOLDER_PLACEHOLDER_FILE}`
            : `${name}/${FOLDER_PLACEHOLDER_FILE}`;

        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(
                folderPath,
                new Blob([FOLDER_PLACEHOLDER_CONTENT], { type: FOLDER_PLACEHOLDER_MIME }),
                {
                    contentType: FOLDER_PLACEHOLDER_MIME,
                    upsert: false,
                }
            );

        if (error) {
            throw new Error(`Failed to create folder: ${error.message}`);
        }

        const fullPath = storagePath
            ? normalizeManagerPath(`${storagePath}/${name}`)
            : normalizeManagerPath(`/${name}`);
        const parentPath = normalizeManagerPath(path);

        return {
            id: fullPath,
            name,
            isDirectory: true,
            size: 0,
            mimeType: 'application/folder',
            path: fullPath,
            parentPath,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    }

    async deleteItems(targets: DeleteItemTarget[]): Promise<void> {
        for (const target of targets) {
            const storagePath = toStoragePath(target.path);

            if (target.isDirectory) {
                await this.deleteFolder(storagePath);
            } else if (storagePath) {
                await this.removeStorageObjects([storagePath]);
            }
        }
    }

    private async deleteFolder(storagePath: string): Promise<void> {
        const pathsToDelete = new Set<string>();

        for (const marker of FOLDER_MARKER_FILES) {
            pathsToDelete.add(`${storagePath}/${marker}`);
        }

        await this.collectFilePathsUnderPrefix(storagePath, pathsToDelete);
        await this.removeStorageObjects([...pathsToDelete]);
    }

    private async collectFilePathsUnderPrefix(
        prefix: string,
        paths: Set<string>
    ): Promise<void> {
        let offset = 0;
        const limit = 100;

        while (true) {
            const { data: items, error } = await this.supabase.storage
                .from(this.bucketName)
                .list(prefix, {
                    limit,
                    offset,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error || !items || items.length === 0) {
                break;
            }

            for (const item of items) {
                const childPath = prefix ? `${prefix}/${item.name}` : item.name;

                if (isStorageFolder(item)) {
                    for (const marker of FOLDER_MARKER_FILES) {
                        paths.add(`${childPath}/${marker}`);
                    }
                    await this.collectFilePathsUnderPrefix(childPath, paths);
                } else {
                    paths.add(childPath);
                }
            }

            if (items.length < limit) {
                break;
            }

            offset += limit;
        }
    }

    private normalizeObjectKey(objectPath: string): string {
        return objectPath.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '');
    }

    private async removeStorageObjects(paths: string[]): Promise<void> {
        const normalized = [
            ...new Set(paths.map((p) => this.normalizeObjectKey(p)).filter(Boolean)),
        ];

        if (normalized.length === 0) {
            return;
        }

        const batchSize = 100;

        for (let i = 0; i < normalized.length; i += batchSize) {
            const batch = normalized.slice(i, i + batchSize);
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove(batch);

            if (error) {
                throw new Error(`Failed to delete items: ${error.message}`);
            }
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
            isDirectory: isStorageFolder(item),
            size: item.metadata?.size || 0,
            mimeType: item.metadata?.mimetype || 'application/octet-stream',
            path: normalizeManagerPath(`/${newPath}`),
            parentPath: normalizeManagerPath(`/${parentPath}`),
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
        const storagePath = toStoragePath(path);
        const uploadedItems: FileItem[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const safeName = sanitizeStorageFileName(file.name);
            const filePath = storagePath ? `${storagePath}/${safeName}` : safeName;

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
                id: normalizeManagerPath(`/${filePath}`),
                name: safeName,
                isDirectory: false,
                size: file.size,
                mimeType: file.type,
                path: normalizeManagerPath(`/${filePath}`),
                parentPath: normalizeManagerPath(path),
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
        const storagePath = toStoragePath(path);

        let blob: Blob;
        if (typeof content === 'string') {
            blob = new Blob([content], { type: 'text/plain' });
        } else {
            blob = content;
        }

        // Storage RLS often allows INSERT/DELETE but not UPDATE; upsert needs UPDATE.
        // Replace existing object via remove + upload instead.
        await this.supabase.storage
            .from(this.bucketName)
            .remove([storagePath]);

        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(storagePath, blob, {
                contentType: blob.type || 'application/octet-stream',
                upsert: false,
            });

        if (error) {
            throw new Error(`Failed to save file: ${error.message}`);
        }

        const fileName = storagePath.split('/').pop() || 'file';
        const parentPath = storagePath.substring(0, storagePath.lastIndexOf('/'));

        return {
            id: normalizeManagerPath(`/${storagePath}`),
            name: fileName,
            isDirectory: false,
            size: blob.size,
            mimeType: blob.type || 'application/octet-stream',
            path: normalizeManagerPath(`/${storagePath}`),
            parentPath: parentPath ? normalizeManagerPath(`/${parentPath}`) : '/',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    }

    getPreviewUrl(path: string): string {
        const storagePath = toStoragePath(path);

        const { data } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(storagePath);

        return data.publicUrl;
    }

    getDownloadUrl(path: string): string {
        // For Supabase, preview and download URLs are the same
        return this.getPreviewUrl(path);
    }

    async search(path: string, query: string): Promise<FileItem[]> {
        const storagePath = toStoragePath(path);

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .list(storagePath, {
                limit: 1000,
                search: query,
            });

        if (error) {
            throw new Error(`Failed to search: ${error.message}`);
        }

        const parentPath = normalizeManagerPath(path);

        return (data || []).map((item: SupabaseFileObject) => {
            const fullPath = storagePath
                ? normalizeManagerPath(`${storagePath}/${item.name}`)
                : normalizeManagerPath(`/${item.name}`);

            return {
                id: item.id || fullPath,
                name: item.name,
                isDirectory: isStorageFolder(item),
                size: item.metadata?.size || 0,
                mimeType: item.metadata?.mimetype || 'application/octet-stream',
                path: fullPath,
                parentPath,
                createdAt: item.created_at || new Date().toISOString(),
                modifiedAt: item.updated_at || item.created_at || new Date().toISOString(),
                thumbnailUrl: isStorageFolder(item) ? undefined : this.getPreviewUrl(fullPath),
            };
        });
    }
}
