// PUT: Save file content (overwrite existing or create new)
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
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.ts': 'application/typescript',
    };
    return mimeMap[ext] || 'application/octet-stream';
}

export async function PUT(request: NextRequest) {
    const formData = await request.formData();
    let targetPath = formData.get('path') as string;
    const content = formData.get('content') as File;

    if (!targetPath || !content) {
        return NextResponse.json({ error: 'Path and content are required' }, { status: 400 });
    }

    // Handle Save As: Ensure extension matches content type for images if it was changed
    if (content.type && content.type.startsWith('image/')) {
        const originalExt = path.extname(targetPath).toLowerCase();
        let newExt = originalExt;

        if (content.type === 'image/jpeg' && !['.jpg', '.jpeg'].includes(originalExt)) newExt = '.jpg';
        else if (content.type === 'image/png' && originalExt !== '.png') newExt = '.png';
        else if (content.type === 'image/webp' && originalExt !== '.webp') newExt = '.webp';

        if (newExt !== originalExt) {
            // Replace extension
            targetPath = targetPath.substring(0, targetPath.lastIndexOf(originalExt)) + newExt;
        }
    }

    const absPath = getAbsolutePath(targetPath);

    // Ensure directory exists
    await fs.mkdir(path.dirname(absPath), { recursive: true });

    try {
        const buffer = Buffer.from(await content.arrayBuffer());
        await fs.writeFile(absPath, buffer);

        const stat = await fs.stat(absPath);
        const relativePath = '/' + path.relative(UPLOAD_DIR, absPath).replace(/\\/g, '/');
        const parentRelative = path.dirname(relativePath);

        // Check if it's an image to generate preview url
        const mimeType = getMimeType(path.basename(absPath));
        const isImage = mimeType.startsWith('image/');

        return NextResponse.json({
            id: Buffer.from(relativePath).toString('base64'),
            name: path.basename(absPath),
            isDirectory: false,
            size: stat.size,
            mimeType,
            path: relativePath,
            parentPath: parentRelative === '.' ? '/' : parentRelative,
            createdAt: stat.birthtime.toISOString(),
            modifiedAt: stat.mtime.toISOString(),
            thumbnailUrl: isImage ? `/api/files/preview?path=${encodeURIComponent(relativePath)}` : undefined
        });
    } catch (error) {
        console.error("Save error:", error);
        return NextResponse.json(
            { error: 'Failed to save file' },
            { status: 500 }
        );
    }
}
