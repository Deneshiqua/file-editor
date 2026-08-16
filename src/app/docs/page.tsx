'use client';

import React, { useEffect, useState } from 'react';

import { DemoNav } from '@/components/DemoNav/DemoNav';
import styles from './docs.module.css';

const TOC = [
    { id: 'kurulum', label: 'Kurulum' },
    { id: 'hizli-baslangic', label: 'Hizli baslangic' },
    { id: 'filemanager', label: 'FileManager' },
    { id: 'config', label: 'FileManagerConfig' },
    { id: 'adapter', label: 'Adapter arayuzu' },
    { id: 'rest', label: 'RestAdapter' },
    { id: 'supabase', label: 'SupabaseAdapter' },
    { id: 'hook', label: 'useFileManager' },
    { id: 'helpers', label: 'Helpers' },
    { id: 'tipler', label: 'Tipler' },
    { id: 'guvenlik', label: 'Guvenlik' },
    { id: 'paket', label: 'Paket ciktilari' },
] as const;

function CodeBlock({ code, lang = 'tsx' }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // sessizce gec
        }
    };

    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
                <span className={styles.codeLang}>{lang}</span>
                <button type="button" className={styles.copyBtn} onClick={copy}>
                    {copied ? 'Kopyalandi' : 'Kopyala'}
                </button>
            </div>
            <pre>
                <code>{code}</code>
            </pre>
        </div>
    );
}

function PropTable({
    rows,
}: {
    rows: Array<{ prop: string; type: string; defaultValue?: string; desc: string }>;
}) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Parametre</th>
                        <th>Tip</th>
                        <th>Varsayilan</th>
                        <th>Aciklama</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.prop}>
                            <td className={styles.prop}>{row.prop}</td>
                            <td className={styles.type}>{row.type}</td>
                            <td className={styles.default}>{row.defaultValue ?? '—'}</td>
                            <td className={styles.desc}>{row.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function DocsPage() {
    const [active, setActive] = useState<string>(TOC[0].id);

    useEffect(() => {
        const nodes = TOC.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
        if (nodes.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) {
                    setActive(visible[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.35, 0.6] }
        );

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.page}>
            <DemoNav />

            <div className={styles.shell}>
                <aside className={styles.toc}>
                    <div className={styles.tocLabel}>Icerik</div>
                    <ul className={styles.tocList}>
                        {TOC.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className={active === item.id ? styles.tocActive : undefined}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className={styles.content}>
                    <header className={styles.hero}>
                        <span className={styles.heroEyebrow}>Dokumantasyon · modern-fm-pro@0.1.7</span>
                        <h2>Modern File Manager Pro</h2>
                        <p>
                            Next.js icin dosya yoneticisi bileseni. Preview, upload, rename, move, copy,
                            metin/gorsel duzenleme ve pluggable storage adapter&apos;lari destekler.
                        </p>
                    </header>

                    <section id="kurulum" className={styles.section}>
                        <h3>Kurulum</h3>
                        <p className={styles.sectionLead}>
                            Paketi kurun ve stilleri import edin. Supabase kullanacaksaniz peer paketini
                            ayri ekleyin.
                        </p>
                        <CodeBlock
                            lang="bash"
                            code={`npm install modern-fm-pro@0.1.7

# Supabase destekli kullanim icin:
npm install modern-fm-pro@0.1.7 @supabase/supabase-js`}
                        />
                        <div className={styles.note}>
                            <code>@supabase/supabase-js</code> paketle birlikte gelmez. Yalnizca{' '}
                            <code>SupabaseAdapter</code> icin gerekir; <code>RestAdapter</code> ve UI tek
                            basina calisir.
                        </div>
                    </section>

                    <section id="hizli-baslangic" className={styles.section}>
                        <h3>Hizli baslangic</h3>
                        <p className={styles.sectionLead}>
                            En az bir adapter ve stil import&apos;u yeterlidir.
                        </p>
                        <CodeBlock
                            code={`import { FileManager, RestAdapter } from 'modern-fm-pro';
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
        rootPath: '/uploads',
        initialCategory: 'images',
      }}
    />
  );
}`}
                        />
                    </section>

                    <section id="filemanager" className={styles.section}>
                        <h3>FileManager</h3>
                        <p className={styles.sectionLead}>
                            Ana bilesen. Iceride <code>FileManagerProvider</code> olusturur; harici provider
                            zorunlu degildir.
                        </p>
                        <PropTable
                            rows={[
                                {
                                    prop: 'adapter',
                                    type: 'FileManagerAdapter',
                                    defaultValue: 'zorunlu',
                                    desc: 'Depolama backend sozlesmesini uygulayan adapter ornegi.',
                                },
                                {
                                    prop: 'config',
                                    type: 'FileManagerConfig',
                                    defaultValue: '{}',
                                    desc: 'Tema, gorunum, secim modu ve UI secenekleri.',
                                },
                            ]}
                        />
                    </section>

                    <section id="config" className={styles.section}>
                        <h3>FileManagerConfig</h3>
                        <p className={styles.sectionLead}>
                            Tum yapilandirma alanlari opsiyoneldir. Asagidaki tabloda varsayilan davranislar
                            listelenir.
                        </p>
                        <PropTable
                            rows={[
                                {
                                    prop: 'rootPath',
                                    type: 'string',
                                    defaultValue: "'/'",
                                    desc: 'Navigasyon siniri. Kullanici bu yolun ustune cikamaz.',
                                },
                                {
                                    prop: 'allowedExtensions',
                                    type: 'string[]',
                                    desc: 'Izin verilen uzantilar (ornek: [".png", ".jpg"]).',
                                },
                                {
                                    prop: 'maxFileSize',
                                    type: 'number',
                                    desc: 'Maksimum dosya boyutu (byte).',
                                },
                                {
                                    prop: 'maxUploadFiles',
                                    type: 'number',
                                    desc: 'Tek seferde yuklenebilecek dosya sayisi ust limiti.',
                                },
                                {
                                    prop: 'viewMode',
                                    type: "'grid' | 'list'",
                                    defaultValue: "'grid'",
                                    desc: 'Baslangic gorunum modu.',
                                },
                                {
                                    prop: 'theme',
                                    type: "'light' | 'dark'",
                                    defaultValue: "'dark'",
                                    desc: 'Bilesen temasi. [data-fm-theme] uzerinden uygulanir.',
                                },
                                {
                                    prop: 'showSidebar',
                                    type: 'boolean',
                                    defaultValue: 'true',
                                    desc: 'Sol klasor sidebar\'ini gosterir.',
                                },
                                {
                                    prop: 'showStatusBar',
                                    type: 'boolean',
                                    defaultValue: 'true',
                                    desc: 'Alt durum cubugunu gosterir.',
                                },
                                {
                                    prop: 'showBreadcrumb',
                                    type: 'boolean',
                                    defaultValue: 'true',
                                    desc: 'Ust breadcrumb yolunu gosterir.',
                                },
                                {
                                    prop: 'showCategoryFilter',
                                    type: 'boolean',
                                    desc: 'Kategori filtre butonlarini gosterir.',
                                },
                                {
                                    prop: 'initialCategory',
                                    type: "'all' | 'documents' | 'images' | 'media' | 'other'",
                                    defaultValue: "'all'",
                                    desc: 'Baslangic kategori filtresi. Secili kategoride upload da kisitlanir.',
                                },
                                {
                                    prop: 'height',
                                    type: 'string',
                                    defaultValue: "'700px'",
                                    desc: 'Kok konteyner yuksekligi (CSS degeri).',
                                },
                                {
                                    prop: 'width',
                                    type: 'string',
                                    defaultValue: "'100%'",
                                    desc: 'Kok konteyner genisligi (CSS degeri).',
                                },
                                {
                                    prop: 'locale',
                                    type: 'string',
                                    desc: 'Tarih/formatlama icin locale ipucu.',
                                },
                                {
                                    prop: 'selectionMode',
                                    type: 'boolean',
                                    defaultValue: 'false',
                                    desc: 'File-picker akisi. Secim sonrasi onFileSelect tetiklenir.',
                                },
                                {
                                    prop: 'multiSelect',
                                    type: 'boolean',
                                    defaultValue: 'false',
                                    desc: 'Coklu dosya secimine izin verir.',
                                },
                                {
                                    prop: 'onFileSelect',
                                    type: '(files: FileItem[]) => void',
                                    desc: 'selectionMode acikken secilen dosyalar.',
                                },
                                {
                                    prop: 'onClose',
                                    type: '() => void',
                                    desc: 'Toolbar Close (X) dugmesi callback\'i.',
                                },
                                {
                                    prop: 'hideSystemFiles',
                                    type: 'boolean',
                                    defaultValue: 'true',
                                    desc: '.folderkeep, .gitkeep gibi sistem dosyalarini gizler.',
                                },
                                {
                                    prop: 'supabase',
                                    type: '{ url, anonKey, bucketName }',
                                    desc: 'Opsiyonel config alani. Asil Supabase kullanimi adapter uzerinden yapilir.',
                                },
                            ]}
                        />
                        <div className={styles.note}>
                            Radix Dialog icinde (<code>modal={'{true}'}</code>) Filerobot portal
                            modallari tiklanamayabilir. Host dialog&apos;da <code>modal={'{false}'}</code> ve
                            manuel backdrop kullanin.
                        </div>
                    </section>

                    <section id="adapter" className={styles.section}>
                        <h3>Adapter arayuzu</h3>
                        <p className={styles.sectionLead}>
                            Ozel depolama icin <code>FileManagerAdapter</code> sozlesmesini uygulayin.
                        </p>
                        <PropTable
                            rows={[
                                {
                                    prop: 'listFiles',
                                    type: '(path: string) => Promise<FileItem[]>',
                                    desc: 'Verilen yoldaki dosya/klasor listesi.',
                                },
                                {
                                    prop: 'createFolder',
                                    type: '(path, name) => Promise<FileItem>',
                                    desc: 'Yeni klasor olusturur.',
                                },
                                {
                                    prop: 'deleteItems',
                                    type: '(targets: DeleteItemTarget[]) => Promise<void>',
                                    desc: 'Dosya veya klasor siler. Klasorde recursive davranis adapter\'a baglidir.',
                                },
                                {
                                    prop: 'renameItem',
                                    type: '(path, newName) => Promise<FileItem>',
                                    desc: 'Yeniden adlandirir.',
                                },
                                {
                                    prop: 'moveItems',
                                    type: '(sourcePaths, targetPath) => Promise<void>',
                                    desc: 'Ogeleri tasir.',
                                },
                                {
                                    prop: 'copyItems',
                                    type: '(sourcePaths, targetPath) => Promise<void>',
                                    desc: 'Ogeleri kopyalar.',
                                },
                                {
                                    prop: 'uploadFiles',
                                    type: '(path, files, onProgress?) => Promise<FileItem[]>',
                                    desc: 'Yukleme. onProgress ile yuzde/durum guncellenir.',
                                },
                                {
                                    prop: 'downloadFile',
                                    type: '(path) => Promise<Blob>',
                                    desc: 'Dosya icerigini Blob olarak indirir.',
                                },
                                {
                                    prop: 'saveFileContent',
                                    type: '(path, content: string | Blob) => Promise<FileItem>',
                                    desc: 'Metin/gorsel kaydetme ve overwrite.',
                                },
                                {
                                    prop: 'getPreviewUrl',
                                    type: '(path) => string',
                                    desc: 'Onizleme URL\'i.',
                                },
                                {
                                    prop: 'getDownloadUrl',
                                    type: '(path) => string',
                                    desc: 'Indirme URL\'i.',
                                },
                                {
                                    prop: 'search?',
                                    type: '(path, query) => Promise<FileItem[]>',
                                    desc: 'Opsiyonel arama. Yoksa istemci tarafinda filtre kullanilir.',
                                },
                            ]}
                        />
                        <CodeBlock
                            lang="ts"
                            code={`type DeleteItemTarget = {
  path: string;
  isDirectory: boolean;
};`}
                        />
                    </section>

                    <section id="rest" className={styles.section}>
                        <h3>RestAdapter</h3>
                        <p className={styles.sectionLead}>
                            Bu repodaki <code>/api/files</code> demo sozlesmesine uyumlu HTTP adapter.
                            Kendi backend&apos;inizi kontrol ettiginizde kullanin.
                        </p>
                        <PropTable
                            rows={[
                                {
                                    prop: 'constructor(baseUrl)',
                                    type: 'string',
                                    defaultValue: "'/api/files'",
                                    desc: 'API kok URL\'i.',
                                },
                            ]}
                        />
                        <CodeBlock
                            code={`import { FileManager, RestAdapter } from 'modern-fm-pro';

const adapter = new RestAdapter('/api/files');
return <FileManager adapter={adapter} />;`}
                        />
                        <p className={styles.sectionLead}>Beklenen HTTP sozlesmesi (demo rotalari):</p>
                        <ul className={styles.list}>
                            <li>
                                <span className={styles.method}>GET</span>{' '}
                                <span className={styles.endpoint}>/api/files?path=</span> — listele
                            </li>
                            <li>
                                <span className={styles.method}>DELETE</span>{' '}
                                <span className={styles.endpoint}>/api/files</span> — sil
                            </li>
                            <li>
                                <span className={styles.method}>POST</span>{' '}
                                <span className={styles.endpoint}>/api/files/folder</span> — klasor
                            </li>
                            <li>
                                <span className={styles.method}>PATCH</span>{' '}
                                <span className={styles.endpoint}>/api/files/rename</span> — rename
                            </li>
                            <li>
                                <span className={styles.method}>PATCH</span>{' '}
                                <span className={styles.endpoint}>/api/files/move</span> — tasi
                            </li>
                            <li>
                                <span className={styles.method}>POST</span>{' '}
                                <span className={styles.endpoint}>/api/files/copy</span> — kopyala
                            </li>
                            <li>
                                <span className={styles.method}>POST</span>{' '}
                                <span className={styles.endpoint}>/api/files/upload</span> — yukle
                            </li>
                            <li>
                                <span className={styles.method}>GET</span>{' '}
                                <span className={styles.endpoint}>/api/files/download</span> — indir
                            </li>
                            <li>
                                <span className={styles.method}>GET</span>{' '}
                                <span className={styles.endpoint}>/api/files/preview</span> — onizle
                            </li>
                            <li>
                                <span className={styles.method}>PUT</span>{' '}
                                <span className={styles.endpoint}>/api/files/save</span> — kaydet
                            </li>
                        </ul>
                    </section>

                    <section id="supabase" className={styles.section}>
                        <h3>SupabaseAdapter</h3>
                        <p className={styles.sectionLead}>
                            Supabase Storage uzerinde calisir. Bos klasorler icin{' '}
                            <code>.folderkeep</code> marker kullanir (image-only bucket uyumlu MIME).
                        </p>
                        <PropTable
                            rows={[
                                {
                                    prop: 'url',
                                    type: 'string',
                                    defaultValue: 'zorunlu',
                                    desc: 'Supabase project URL.',
                                },
                                {
                                    prop: 'anonKey',
                                    type: 'string',
                                    defaultValue: 'zorunlu',
                                    desc: 'Public anon key. Service role asla istemciye konmaz.',
                                },
                                {
                                    prop: 'bucketName',
                                    type: 'string',
                                    defaultValue: 'zorunlu',
                                    desc: 'Storage bucket adi.',
                                },
                                {
                                    prop: 'supabase',
                                    type: 'SupabaseClient',
                                    desc: 'Opsiyonel. createBrowserClient ile oturum paylasimi icin.',
                                },
                            ]}
                        />
                        <CodeBlock
                            code={`import { FileManager, SupabaseAdapter } from 'modern-fm-pro';
import 'modern-fm-pro/styles.css';

const adapter = new SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  bucketName: 'file-manager',
  // supabase: createBrowserClient(url, anonKey), // opsiyonel
});

export default function Page() {
  return <FileManager adapter={adapter} config={{ theme: 'dark' }} />;
}`}
                        />
                        <div className={styles.warn}>
                            Tarayicidan overwrite icin storage RLS&apos;te UPDATE (veya remove+upload icin
                            INSERT/DELETE) politikasi gerekir. Service role key istemciye vermeyin.
                        </div>
                    </section>

                    <section id="hook" className={styles.section}>
                        <h3>useFileManager</h3>
                        <p className={styles.sectionLead}>
                            Provider cocuklarinda state ve aksiyonlara erisim. <code>FileManager</code>{' '}
                            kendi provider&apos;ini acar; ozel UI sarmak icin{' '}
                            <code>FileManagerProvider</code> da export edilir.
                        </p>
                        <CodeBlock
                            code={`import { FileManagerProvider, useFileManager, RestAdapter } from 'modern-fm-pro';

function CustomToolbar() {
  const { state, navigateTo, uploadFiles, setViewMode } = useFileManager();
  return (
    <div>
      <span>{state.currentPath}</span>
      <button onClick={() => setViewMode('list')}>List</button>
    </div>
  );
}`}
                        />
                        <p className={styles.sectionLead}>Baglanan baslica alanlar:</p>
                        <ul className={styles.list}>
                            <li>
                                <code>state</code> — path, files, selection, sort, clipboard, modals, upload
                                progress
                            </li>
                            <li>
                                Navigasyon: <code>navigateTo</code>, <code>goBack</code>,{' '}
                                <code>goForward</code>, <code>goUp</code>, <code>refreshFiles</code>
                            </li>
                            <li>
                                CRUD: <code>createFolder</code>, <code>deleteItems</code>,{' '}
                                <code>renameItem</code>, <code>cutItems</code>, <code>copyItems</code>,{' '}
                                <code>pasteItems</code>
                            </li>
                            <li>
                                Transfer: <code>uploadFiles</code>, <code>downloadFile</code>,{' '}
                                <code>saveFileContent</code>
                            </li>
                            <li>
                                UI: <code>setViewMode</code>, <code>setSort</code>, <code>setSearch</code>,{' '}
                                <code>setCategory</code>, <code>openModal</code>, <code>openPreview</code>
                            </li>
                        </ul>
                    </section>

                    <section id="helpers" className={styles.section}>
                        <h3>Helpers</h3>
                        <p className={styles.sectionLead}>Paketten export edilen yardimci fonksiyonlar.</p>
                        <PropTable
                            rows={[
                                {
                                    prop: 'formatFileSize',
                                    type: '(bytes: number) => string',
                                    desc: 'Insan okunur boyut (KB/MB...).',
                                },
                                {
                                    prop: 'formatDate',
                                    type: '(dateString: string) => string',
                                    desc: 'Tarih formatlama.',
                                },
                                {
                                    prop: 'getFileExtension',
                                    type: '(filename: string) => string',
                                    desc: 'Uzanti cikarir.',
                                },
                                {
                                    prop: 'isPreviewable',
                                    type: '(mimeType, name) => boolean',
                                    desc: 'Onizlenebilir mi kontrolu.',
                                },
                                {
                                    prop: 'sortFiles',
                                    type: '(files, SortConfig) => FileItem[]',
                                    desc: 'Siralamaya gore dosyalari duzenler.',
                                },
                                {
                                    prop: 'filterFiles',
                                    type: '(files, query, hideSystemFiles?) => FileItem[]',
                                    desc: 'Arama ve sistem dosyasi filtreleme.',
                                },
                                {
                                    prop: 'getFileIcon',
                                    type: '(item, size?) => ReactNode',
                                    desc: 'Dosya/klasor ikonu bileseni.',
                                },
                            ]}
                        />
                    </section>

                    <section id="tipler" className={styles.section}>
                        <h3>Tipler</h3>
                        <p className={styles.sectionLead}>Public type export&apos;lari.</p>
                        <CodeBlock
                            lang="ts"
                            code={`import type {
  FileItem,
  FileManagerConfig,
  FileManagerAdapter,
  ViewMode,
  SortField,
  SortOrder,
  SortConfig,
  ThemeMode,
  ClipboardState,
  UploadProgress,
  ContextMenuPosition,
  ContextMenuItem,
  ModalType,
  SupabaseAdapterConfig,
} from 'modern-fm-pro';`}
                        />
                        <CodeBlock
                            lang="ts"
                            code={`interface FileItem {
  id: string;
  name: string;
  isDirectory: boolean;
  size: number;
  mimeType: string;
  path: string;
  parentPath: string;
  thumbnailUrl?: string;
  createdAt: string;
  modifiedAt: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}`}
                        />
                    </section>

                    <section id="guvenlik" className={styles.section}>
                        <h3>Guvenlik</h3>
                        <ul className={styles.list}>
                            <li>
                                Supabase <strong>service role</strong> key&apos;ini tarayiciya koymayin; sadece
                                anon key kullanin.
                            </li>
                            <li>
                                <code>RestAdapter</code> kullaniyorsaniz path ve yetki kontrollerini sunucu
                                tarafinda yapin. UI guvenlik siniri degildir.
                            </li>
                            <li>
                                <code>rootPath</code> yalnizca UI navigasyonunu sinirlar; backend&apos;de de
                                ayni siniri uygulayin.
                            </li>
                            <li>
                                Upload limitleri, MIME allowlist ve bucket RLS politikalarini gozden gecirin.
                            </li>
                        </ul>
                    </section>

                    <section id="paket" className={styles.section}>
                        <h3>Paket ciktilari</h3>
                        <ul className={styles.list}>
                            <li>
                                <code>modern-fm-pro</code> — JS/TS entry
                            </li>
                            <li>
                                <code>modern-fm-pro/styles.css</code> — zorunlu stiller
                            </li>
                            <li>
                                Yayinlanan dosyalar: <code>dist</code>, <code>README.md</code>,{' '}
                                <code>SUPABASE_SETUP.md</code>
                            </li>
                        </ul>
                        <CodeBlock
                            lang="bash"
                            code={`npm run build:package
npm run pack:check
npm publish --access public`}
                        />
                        <p className={styles.sectionLead}>
                            Canli ornekler: <a href="/">Demo</a> · <a href="/demo/form">Form picker</a>
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}
