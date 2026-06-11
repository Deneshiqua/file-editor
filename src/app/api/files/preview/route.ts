// GET: Preview a file (alias for download with inline disposition)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function getAbsolutePath(relativePath: string): string {
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
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.md': 'text/plain',
        '.json': 'application/json',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
    };
    return mimeMap[ext] || 'application/octet-stream';
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const absPath = getAbsolutePath(filePath);

    if (!existsSync(absPath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    try {
        const buffer = await fs.readFile(absPath);
        const mimeType = getMimeType(path.basename(absPath));

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to preview file' },
            { status: 500 }
        );
    }
}
