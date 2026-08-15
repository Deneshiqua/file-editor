# Modern File Manager Pro

Modern File Manager Pro is a Next.js file manager component with preview, upload, download, rename, move, copy, text editing, image editing, grid and list views, and pluggable storage adapters.

## What's New in 0.1.7

- **Demo / Vercel build**: `@supabase/supabase-js` is now installed as a `devDependency` so `next build` (including Turbopack on Vercel) can resolve `SupabaseAdapter` imports
- **Peer dependency unchanged**: Host apps that use `SupabaseAdapter` must still install `@supabase/supabase-js` themselves; it remains an optional peer dependency of the published package

## What's New in 0.1.6

- **List view overhaul**: CSS Grid columns (name, size, type, modified), default sort by modified descending, unique class names to prevent CSS collisions in bundled `dist/index.css`
- **Supabase storage fixes**: Path normalization for nested folders, recursive folder delete (including `.folderkeep` markers), image-only bucket support for empty folders (`image/svg+xml`), filename sanitization on upload
- **Save & overwrite**: `saveFileContent` uses remove-then-upload for RLS-friendly overwrites; optional `supabase` client in `SupabaseAdapterConfig` for session-aware auth
- **Save As UI**: Simplified modal — filename only (extension locked), Cancel left / Save As right, no image preview in Save As mode
- **Image editor (Filerobot)**: Portaled modals (Save, Warning) receive correct `pointer-events` and z-index; duplicate preview header hidden in edit mode; canvas padding trimmed
- **Upload modal**: Progress state resets when the modal closes or reopens after errors
- **Context menu**: Portaled to `document.body` with backdrop; works in nested Radix/shadcn dialogs
- **Toolbar**: Close (`X`) button added
- **Keyboard & empty areas**: Delete key handled in capture phase (avoids host app conflicts); right-click paste on empty folder views
- **Helpers**: `normalizeManagerPath`, `toStoragePath`, `sanitizeStorageFileName`, `getFileBaseName`

### Host app integration notes

When embedding FileManager inside a **Radix Dialog** (`modal={true}`), Filerobot portaled modals may not receive clicks. Use `modal={false}` with a manual backdrop on the host dialog (same pattern as TinyMCE / Slider Pro in shopon360).

For Supabase image overwrite from the browser, ensure storage RLS includes **UPDATE** (or rely on remove+upload with INSERT/DELETE policies).

```tsx
import { createBrowserClient } from '@supabase/ssr';

const adapter = new SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  bucketName: 'media',
  supabase: createBrowserClient(url, anonKey), // optional: reuse authenticated session
});
```

## What's New in 0.1.5

- **Category Filtering**: Built-in file type filtering (All, Documents, Images, Media, Other)
- **Initial Category**: Open FileManager with a specific category pre-selected using `initialCategory` config option
- **Upload Restrictions**: When opened with a specific category, uploads are automatically restricted to matching file types
- **Root Path Boundary**: FileManager now respects `rootPath` configuration and prevents navigation above it for security and isolation
- **Grid View Truncation**: Long file/folder names are truncated to 15 characters in grid view with full name shown on hover
- **Dark Theme Improvements**: Fixed hover effects in context menus for better visual feedback

## What's New in 0.1.4

- Fixed the published package so component class names resolve correctly in consuming apps.
- FileManager styles continue to stay scoped under the FileManager root without relying on broken runtime CSS module maps.
- Filerobot editor overrides remain active only while the FileManager image editor is open.
- This release is intended to fix broken package rendering in host applications.

## Features

- File browsing with grid and list modes
- Text editing with Monaco Editor
- Image editing with Filerobot Image Editor
- Preview support for images, videos, audio, PDF, and text files
- Clipboard operations: cut, copy, paste
- Optional Supabase Storage integration
- Selection mode for file-picker workflows

## Installation

```bash
npm install modern-fm-pro@0.1.7
```

If you want Supabase support, install the client library as well (optional peer dependency):

```bash
npm install modern-fm-pro@0.1.7 @supabase/supabase-js
```

`@supabase/supabase-js` is **not** bundled with the package. Without it, `RestAdapter` and the rest of the UI still work; only `SupabaseAdapter` requires the peer package.

## Quick Start

```tsx
import { FileManager, RestAdapter } from 'modern-fm-pro';
import 'modern-fm-pro/styles.css';

const adapter = new RestAdapter('/api/files');

export default function Page() {
  return (
    <FileManager
      adapter={adapter}
      config={{
        theme: 'dark',
        viewMode: 'grid',
        hideSystemFiles: true,
        rootPath: '/uploads', // Prevent navigation above this path
        initialCategory: 'images', // Optional: Start with images filter
      }}
    />
  );
}
```

## Adapters

### RestAdapter

`RestAdapter` expects a backend that implements the same HTTP contract as this repository's demo routes under `/api/files`.

Use it when:

- you control the backend
- you want local or custom server-side storage
- you can expose compatible file CRUD endpoints

It is not a hosted storage layer by itself.

### SupabaseAdapter

```tsx
import { FileManager, SupabaseAdapter } from 'modern-fm-pro';
import 'modern-fm-pro/styles.css';

const adapter = new SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  bucketName: 'file-manager',
});

export default function Page() {
  return <FileManager adapter={adapter} config={{ theme: 'dark' }} />;
}
```

Detailed setup: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## Security Notes

- Do not expose Supabase service role keys in the browser. Use only the public anon key on the client.
- If you use `RestAdapter`, validate paths and permissions on the server. The UI is not a security boundary.
- Publish only built artifacts. This package is configured to ship `dist`, not demo code, uploads, `.env`, or `.next` output.
- Review upload limits, allowed MIME types, and authorization rules in your backend or Supabase bucket policies.

## Package Outputs

The published package exposes:

- `modern-fm-pro`
- `modern-fm-pro/styles.css`

Current publish payload is limited to:

- `dist`
- `README.md`
- `SUPABASE_SETUP.md`

## Local Development

Run the demo application locally:

```bash
npm install
npm run dev
```

Open `http://localhost:3001` (default demo port).

The demo app imports `SupabaseAdapter`, so `@supabase/supabase-js` is listed under `devDependencies` and is installed with this repository. That keeps Vercel / `next build` working without forcing Supabase onto every npm consumer.

## Publishing

Validate the package before publishing:

```bash
npm run build:package
npm run pack:check
```

Publish publicly to npm:

```bash
npm publish --access public
```

## Repository

Source repository: https://github.com/deneshiqua/modern-fm-pro
