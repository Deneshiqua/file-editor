// Next.js API Route: File listing and deletion

import { NextRequest, NextResponse } from 'next/server';
import { existsSync, statSync } from 'fs';

import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
async function ensureDir(dir: string) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch {
        // ignore
    }
}

function getAbsolutePath(relativePath: string): string {
    // Prevent path traversal
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(UPLOAD_DIR, normalized);
}

function getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.bmp': 'image/bmp',
        '.ico': 'image/x-icon',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.flac': 'audio/flac',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.7z': 'application/x-7z-compressed',
        '.tar': 'application/x-tar',
        '.gz': 'application/gzip',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.ts': 'application/typescript',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.yml': 'text/yaml',
        '.yaml': 'text/yaml',
        '.csv': 'text/csv',
        '.py': 'text/x-python',
        '.java': 'text/x-java',
        '.cpp': 'text/x-c++src',
        '.c': 'text/x-csrc',
        '.h': 'text/x-chdr',
        '.sh': 'application/x-sh',
        '.bat': 'application/x-bat',
        '.ps1': 'application/x-powershell',
    };
    return mimeMap[ext] || 'application/octet-stream';
}

function fileToItem(filePath: string, stat: Awaited<ReturnType<typeof fs.stat>>): {
    id: string;
    name: string;
    isDirectory: boolean;
    size: number;
    mimeType: string;
    path: string;
    parentPath: string;
    thumbnailUrl?: string;
    createdAt: string;
    modifiedAt: string;
} {
    const relativePath = '/' + path.relative(UPLOAD_DIR, filePath).replace(/\\/g, '/');
    const parentRelative = path.dirname(relativePath);

    const item = {
        id: Buffer.from(relativePath).toString('base64'),
        name: path.basename(filePath),
        isDirectory: stat.isDirectory(),
        size: Number(stat.size),
        mimeType: stat.isDirectory() ? '' : getMimeType(path.basename(filePath)),
        path: relativePath,
        parentPath: parentRelative === '.' ? '/' : parentRelative,
        createdAt: stat.birthtime.toISOString(),
        modifiedAt: stat.mtime.toISOString(),
        thumbnailUrl: undefined as string | undefined,
    };

    // Add thumbnail URL for images
    if (item.mimeType.startsWith('image/')) {
        item.thumbnailUrl = `/api/files/preview?path=${encodeURIComponent(relativePath)}`;
    }

    return item;
}

// GET: List files in a directory
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const dirPath = searchParams.get('path') || '/';

    await ensureDir(UPLOAD_DIR);
    const absPath = getAbsolutePath(dirPath);

    if (!existsSync(absPath)) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        const entries = await fs.readdir(absPath);
        const items = await Promise.all(
            entries.map(async (entry) => {
                const entryPath = path.join(absPath, entry);
                const stat = await fs.stat(entryPath);
                return fileToItem(entryPath, stat);
            })
        );

        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to list files' },
            { status: 500 }
        );
    }
}

// DELETE: Delete files
export async function DELETE(request: NextRequest) {
    const body = await request.json();
    const paths: string[] = body.paths;

    try {
        await Promise.all(
            paths.map(async (p) => {
                const absPath = getAbsolutePath(p);
                if (existsSync(absPath)) {
                    const stat = statSync(absPath);
                    if (stat.isDirectory()) {
                        await fs.rm(absPath, { recursive: true });
                    } else {
                        await fs.unlink(absPath);
                    }
                }
            })
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete items' },
            { status: 500 }
        );
    }
}
