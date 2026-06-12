/* Normalize file-manager paths for comparisons and storage API calls */
export function normalizeManagerPath(path: string): string {
    if (!path || path === '/') return '/';

    let normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
    if (!normalized.startsWith('/')) {
        normalized = `/${normalized}`;
    }
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
}

/* Strip leading slash for Supabase Storage object keys */
export function toStoragePath(path: string): string {
    const normalized = normalizeManagerPath(path);
    return normalized === '/' ? '' : normalized.slice(1);
}

/* Sanitize file names for S3/Supabase Storage object keys */
export function sanitizeStorageFileName(fileName: string, maxBaseLength = 180): string {
    const trimmed = fileName.trim();
    if (!trimmed) {
        return `file-${Date.now()}`;
    }

    const lastDot = trimmed.lastIndexOf('.');
    const hasExtension = lastDot > 0 && lastDot < trimmed.length - 1;
    const rawBase = hasExtension ? trimmed.slice(0, lastDot) : trimmed;
    const extension = hasExtension ? trimmed.slice(lastDot + 1).toLowerCase() : '';

    let base = rawBase
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '');

    if (!base) {
        base = 'file';
    }

    if (base.length > maxBaseLength) {
        base = base.slice(0, maxBaseLength).replace(/[-.]+$/g, '');
    }

    const safeExtension = extension.replace(/[^a-z0-9]+/gi, '');
    return safeExtension ? `${base}.${safeExtension}` : base;
}

/* Utility: format file sizes */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/* Utility: format dates */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

/* Utility: get file extension */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/* Utility: get file name without extension */
export function getFileBaseName(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex <= 0) return filename;
    return filename.substring(0, lastDotIndex);
}

/* Utility: truncate file name for grid view */
export function truncateFileName(filename: string, maxLength: number = 15): string {
    if (filename.length <= maxLength) return filename;

    const lastDotIndex = filename.lastIndexOf('.');

    // If no extension or it's a hidden file (starts with .)
    if (lastDotIndex <= 0) {
        return filename.substring(0, maxLength - 3) + '...';
    }

    const extension = filename.substring(lastDotIndex);
    const nameWithoutExt = filename.substring(0, lastDotIndex);

    // If extension is too long, just truncate the whole name
    if (extension.length >= maxLength - 3) {
        return filename.substring(0, maxLength - 3) + '...';
    }

    // Calculate how much of the name we can keep
    const availableLength = maxLength - extension.length - 3; // 3 for "..."

    if (availableLength <= 0) {
        return filename.substring(0, maxLength - 3) + '...';
    }

    return nameWithoutExt.substring(0, availableLength) + '...' + extension;
}

/* Utility: check if file is previewable */
export function isPreviewable(mimeType: string, name: string): boolean {
    const ext = getFileExtension(name);
    if (mimeType.startsWith('image/')) return true;
    if (mimeType.startsWith('video/')) return true;
    if (mimeType.startsWith('audio/')) return true;
    if (mimeType === 'application/pdf') return true;
    if (['txt', 'md', 'json', 'xml', 'csv', 'log', 'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'py', 'java', 'cpp', 'c', 'h', 'sh', 'yml', 'yaml'].includes(ext)) return true;
    return false;
}

/* Utility: sort files */

import type { FileCategory, FileItem, SortConfig } from '@/types';

// File category definitions
const FILE_CATEGORIES = {
    documents: [
        'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
        'xls', 'xlsx', 'csv', 'ods',
        'ppt', 'pptx', 'odp',
        'md', 'json', 'xml', 'yaml', 'yml'
    ],
    images: [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',
        'ico', 'tiff', 'tif', 'heic', 'heif'
    ],
    media: [
        'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a',
        'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'
    ]
};

/* Utility: get file category */
export function getFileCategory(file: FileItem): FileCategory {
    if (file.isDirectory) return 'all';

    const ext = getFileExtension(file.name);

    if (FILE_CATEGORIES.documents.includes(ext)) return 'documents';
    if (FILE_CATEGORIES.images.includes(ext)) return 'images';
    if (FILE_CATEGORIES.media.includes(ext)) return 'media';

    return 'other';
}

/* Utility: filter files by category */
export function filterByCategory(files: FileItem[], category: FileCategory): FileItem[] {
    if (category === 'all') return files;

    return files.filter(file => {
        // Always show directories
        if (file.isDirectory) return true;

        // Filter files by category
        return getFileCategory(file) === category;
    });
}

/* Utility: get accept attribute for category */
export function getAcceptForCategory(category: FileCategory): string | undefined {
    if (category === 'all' || category === 'other') return undefined;

    const extensions = FILE_CATEGORIES[category];
    return extensions.map(ext => `.${ext}`).join(',');
}

/* Utility: check if file matches category */
export function fileMatchesCategory(fileName: string, category: FileCategory): boolean {
    if (category === 'all') return true;
    if (category === 'other') {
        const ext = getFileExtension(fileName);
        return !FILE_CATEGORIES.documents.includes(ext) &&
            !FILE_CATEGORIES.images.includes(ext) &&
            !FILE_CATEGORIES.media.includes(ext);
    }

    const ext = getFileExtension(fileName);
    return FILE_CATEGORIES[category].includes(ext);
}

export function sortFiles(files: FileItem[], config: SortConfig): FileItem[] {
    const sorted = [...files].sort((a, b) => {
        // Directories always first
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        let comparison = 0;
        switch (config.field) {
            case 'name':
                comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
                break;
            case 'size':
                comparison = a.size - b.size;
                break;
            case 'type':
                comparison = getFileExtension(a.name).localeCompare(getFileExtension(b.name));
                break;
            case 'modifiedAt':
                comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
                break;
        }

        return config.order === 'asc' ? comparison : -comparison;
    });

    return sorted;
}

/* Utility: filter files by search query */
export function filterFiles(files: FileItem[], query: string, hideSystemFiles: boolean = true): FileItem[] {
    let filtered = files;

    // Filter system files if enabled
    if (hideSystemFiles) {
        const systemFilePatterns = ['.folderkeep', '.gitkeep', '.DS_Store', 'Thumbs.db'];
        filtered = filtered.filter((f) => !systemFilePatterns.includes(f.name));
    }

    // Filter by search query
    if (!query.trim()) return filtered;
    const q = query.toLowerCase();
    return filtered.filter(
        (f) =>
            f.name.toLowerCase().includes(q) ||
            getFileExtension(f.name).includes(q)
    );
}
