// POST: Create a new folder
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function getAbsolutePath(relativePath: string): string {
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(UPLOAD_DIR, normalized);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { path: dirPath, name } = body;

    const newFolderPath = path.join(getAbsolutePath(dirPath), name);

    try {
        await fs.mkdir(newFolderPath, { recursive: true });
        const stat = await fs.stat(newFolderPath);
        const relativePath = '/' + path.relative(UPLOAD_DIR, newFolderPath).replace(/\\/g, '/');
        const parentRelative = path.dirname(relativePath);

        return NextResponse.json({
            id: Buffer.from(relativePath).toString('base64'),
            name,
            isDirectory: true,
            size: 0,
            mimeType: '',
            path: relativePath,
            parentPath: parentRelative === '.' ? '/' : parentRelative,
            createdAt: stat.birthtime.toISOString(),
            modifiedAt: stat.mtime.toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create folder' },
            { status: 500 }
        );
    }
}
