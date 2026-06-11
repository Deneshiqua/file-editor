// POST: Copy files/folders
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { statSync } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function getAbsolutePath(relativePath: string): string {
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(UPLOAD_DIR, normalized);
}

async function copyRecursive(src: string, dest: string) {
    const stat = statSync(src);
    if (stat.isDirectory()) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src);
        for (const entry of entries) {
            await copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        await fs.copyFile(src, dest);
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { sourcePaths, targetPath } = body;

    try {
        for (const source of sourcePaths) {
            const absSource = getAbsolutePath(source);
            let name = path.basename(absSource);
            let absTarget = path.join(getAbsolutePath(targetPath), name);

            // Handle name conflict
            let counter = 1;
            const baseName = path.parse(name).name;
            const ext = path.parse(name).ext;
            while (true) {
                try {
                    await fs.access(absTarget);
                    name = `${baseName} (${counter})${ext}`;
                    absTarget = path.join(getAbsolutePath(targetPath), name);
                    counter++;
                } catch {
                    break;
                }
            }

            await copyRecursive(absSource, absTarget);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to copy items' },
            { status: 500 }
        );
    }
}
