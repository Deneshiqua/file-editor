// PATCH: Move files/folders
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
    const { sourcePaths, targetPath } = body;

    try {
        for (const source of sourcePaths) {
            const absSource = getAbsolutePath(source);
            const name = path.basename(absSource);
            const absTarget = path.join(getAbsolutePath(targetPath), name);
            await fs.rename(absSource, absTarget);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to move items' },
            { status: 500 }
        );
    }
}
