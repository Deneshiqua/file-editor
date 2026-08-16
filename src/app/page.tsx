'use client';

import type { FileManagerAdapter, ThemeMode } from '@/types';
import React, { useMemo, useState } from 'react';

import { DemoNav } from '@/components/DemoNav/DemoNav';
import { FileManager } from '@/components/FileManager/FileManager';
import { RestAdapter } from '@/adapters/RestAdapter';
import { SupabaseAdapter } from '@/adapters/SupabaseAdapter';

export default function Home() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  const adapter: FileManagerAdapter = useMemo(() => {
    const adapterType = process.env.NEXT_PUBLIC_FILE_MANAGER_TYPE || 'local';

    if (adapterType === 'supabase') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'file-manager';

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials missing! Falling back to local adapter.');
        return new RestAdapter('/api/files');
      }

      return new SupabaseAdapter({
        url: supabaseUrl,
        anonKey: supabaseKey,
        bucketName: bucketName,
      });
    }

    return new RestAdapter('/api/files');
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const adapterType = process.env.NEXT_PUBLIC_FILE_MANAGER_TYPE || 'local';

  return (
    <div className="demo-container">
      <DemoNav
        theme={theme}
        onToggleTheme={toggleTheme}
        adapterLabel={adapterType === 'supabase' ? 'Supabase' : 'Local'}
      />

      <main className="demo-main">
        <FileManager
          adapter={adapter}
          config={{
            theme,
            viewMode: 'grid',
            showSidebar: true,
            showStatusBar: true,
            showBreadcrumb: true,
            height: '100%',
            hideSystemFiles: true,
          }}
        />
      </main>
    </div>
  );
}
