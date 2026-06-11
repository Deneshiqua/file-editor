// POST: Upload files
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function getAbsolutePath(relativePath: string): string {
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(UPLOAD_DIR, normalized);
}

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const uploadPath = (formData.get('path') as string) || '/';
    const files = formData.getAll('files') as File[];

    const targetDir = getAbsolutePath(uploadPath);
    await fs.mkdir(targetDir, { recursive: true });

    const results = [];

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(targetDir, file.name);
        await fs.writeFile(filePath, buffer);

        const stat = await fs.stat(filePath);
        const relativePath = '/' + path.relative(UPLOAD_DIR, filePath).replace(/\\/g, '/');
        const parentRelative = path.dirname(relativePath);

        results.push({
            id: Buffer.from(relativePath).toString('base64'),
            name: file.name,
            isDirectory: false,
            size: stat.size,
            mimeType: file.type || 'application/octet-stream',
            path: relativePath,
            parentPath: parentRelative === '.' ? '/' : parentRelative,
            createdAt: stat.birthtime.toISOString(),
            modifiedAt: stat.mtime.toISOString(),
        });
    }

    return NextResponse.json(results);
}
