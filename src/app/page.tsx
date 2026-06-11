'use client';

import type { FileManagerAdapter, ThemeMode } from '@/types';
import React, { useMemo, useState } from 'react';

import { FileManager } from '@/components/FileManager/FileManager';
import { RestAdapter } from '@/adapters/RestAdapter';
import { SupabaseAdapter } from '@/adapters/SupabaseAdapter';

export default function Home() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Create adapter based on environment variable
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

      console.log('🚀 Using Supabase Storage adapter');
      return new SupabaseAdapter({
        url: supabaseUrl,
        anonKey: supabaseKey,
        bucketName: bucketName,
      });
    }

    console.log('📁 Using Local REST adapter');
    return new RestAdapter('/api/files');
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const adapterType = process.env.NEXT_PUBLIC_FILE_MANAGER_TYPE || 'local';

  return (
    <div className="demo-container">
      <header className="demo-header">
        <div className="demo-title">
          <div className="demo-logo">📁</div>
          <h1>Modern File Manager Pro</h1>
          <span>v1.0.0</span>
          <span style={{
            marginLeft: '12px',
            padding: '4px 8px',
            background: adapterType === 'supabase' ? '#3ecf8e' : '#ffa500',
            color: '#000',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {adapterType === 'supabase' ? '☁️ Supabase' : '💾 Local'}
          </span>
        </div>
        <div className="demo-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <a
            href="/demo/form"
            className="demo-link"
          >
            🎯 Demo
          </a>
          <a
            href="https://github.com/deneshiqua/modern-fm-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            ⭐ GitHub
          </a>
        </div>
      </header>

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
