# Supabase Storage Setup Guide

This file manager supports Supabase Storage as an optional storage backend. Follow these steps to set it up.

## Prerequisites

1. A Supabase project (create one at [https://supabase.com](https://supabase.com))
2. Supabase client library installed

## Installation

Install the Supabase client library:

```bash
npm install @supabase/supabase-js
```

## Configuration

### 1. Create a Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New Bucket**
4. Name your bucket (e.g., `file-manager`)
5. Configure bucket settings:
   - **Public bucket**: Enable if you want files to be publicly accessible
   - **File size limit**: Set according to your needs
   - **Allowed MIME types**: Configure as needed

### 2. Set up Bucket Policies

For a public bucket with authenticated uploads/deletes, add these policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'file-manager' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'file-manager' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'file-manager' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'file-manager' AND auth.role() = 'authenticated' );
```

### 3. Get Your Supabase Credentials

From your Supabase project settings:
- **URL**: Found in Settings > API > Project URL
- **Anon Key**: Found in Settings > API > Project API keys > anon/public

## Usage

### Option 1: Using the Adapter Directly

```typescript
import { FileManager, SupabaseAdapter } from 'modern-fm-pro';
import 'modern-fm-pro/styles.css';

const adapter = new SupabaseAdapter({
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
  bucketName: 'file-manager',
});

export default function Page() {
  return <FileManager adapter={adapter} config={{ viewMode: 'grid' }} />;
}
```

### Option 2: Using the Provider Explicitly

Create a Supabase adapter and pass it to the FileManagerProvider:

```typescript
'use client';

import {
  FileManager,
  FileManagerProvider,
  SupabaseAdapter,
} from 'modern-fm-pro';
import 'modern-fm-pro/styles.css';

const supabaseAdapter = new SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  bucketName: 'file-manager',
});

export default function Page() {
  return (
    <FileManagerProvider adapter={supabaseAdapter}>
      <FileManager />
    </FileManagerProvider>
  );
}
```

### Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then use them in your code:

```typescript
const adapter = new SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  bucketName: 'file-manager',
});
```

## Features

The Supabase adapter supports all file manager operations:

- ✅ List files and folders
- ✅ Create folders
- ✅ Upload files (with progress tracking)
- ✅ Download files
- ✅ Rename files/folders
- ✅ Move files/folders
- ✅ Copy files/folders
- ✅ Delete files/folders
- ✅ Preview files (images, videos, text, etc.)
- ✅ Edit and save text files
- ✅ Image editing
- ✅ Search files

## Notes

1. **Folder Representation**: Since Supabase Storage doesn't have explicit folders, folders are represented by creating a `.folderkeep` file inside them.

2. **Public URLs**: The `getPreviewUrl()` method returns public URLs. Ensure your bucket is public or adjust your RLS policies accordingly.

3. **Authentication**: For production use, implement proper authentication. Never expose a Supabase service role key in client-side code:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabase = createClient(url, anonKey);
   
   // Sign in user
   await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password',
   });
   ```

4. **Custom Storage Paths**: You can customize the root path structure:
   ```typescript
   // Store files per user
   const userPath = `/users/${userId}/files`;
   ```

## Troubleshooting

### Files not appearing
- Check bucket policies (RLS)
- Verify bucket name is correct
- Ensure files are uploaded to the correct path

### Upload failures
- Check file size limits in bucket settings
- Verify authentication is working
- Check browser console for detailed errors

### CORS Issues
- Add your domain to allowed origins in Supabase Settings > API > CORS

## Migration from REST Adapter

To migrate from the REST adapter to Supabase:

1. Install `@supabase/supabase-js`
2. Create a Supabase bucket
3. Replace your `RestAdapter` with `SupabaseAdapter`
4. Update your environment variables and bucket policies
5. Migrate existing files to Supabase Storage
