// PATCH: Rename a file or folder
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function getAbsolutePath(relativePath: string): string {
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(UPLOAD_DIR, normalized);
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { path: filePath, newName } = body;

    const absPath = getAbsolutePath(filePath);
    const newAbsPath = path.join(path.dirname(absPath), newName);

    try {
        await fs.rename(absPath, newAbsPath);
        const stat = await fs.stat(newAbsPath);
        const relativePath = '/' + path.relative(UPLOAD_DIR, newAbsPath).replace(/\\/g, '/');
        const parentRelative = path.dirname(relativePath);

        return NextResponse.json({
            id: Buffer.from(relativePath).toString('base64'),
            name: newName,
            isDirectory: stat.isDirectory(),
            size: stat.size,
            mimeType: '',
            path: relativePath,
            parentPath: parentRelative === '.' ? '/' : parentRelative,
            createdAt: stat.birthtime.toISOString(),
            modifiedAt: stat.mtime.toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to rename item' },
            { status: 500 }
        );
    }
}
