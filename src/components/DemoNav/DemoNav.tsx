'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PACKAGE_VERSION = '0.1.7';

type DemoNavProps = {
    adapterLabel?: string | null;
    onToggleTheme?: () => void;
    theme?: 'light' | 'dark';
};

export function DemoNav({ adapterLabel, onToggleTheme, theme }: DemoNavProps) {
    const pathname = usePathname();

    const linkClass = (href: string) =>
        `demo-link${pathname === href || (href !== '/' && pathname.startsWith(href)) ? ' demo-link-active' : ''}`;

    return (
        <header className="demo-header">
            <div className="demo-title">
                <div className="demo-logo">FM</div>
                <h1>Modern File Manager Pro</h1>
                <span>v{PACKAGE_VERSION}</span>
                {adapterLabel ? (
                    <span
                        style={{
                            marginLeft: '4px',
                            padding: '4px 8px',
                            background: adapterLabel.includes('Supabase') ? '#3ecf8e' : '#ffa500',
                            color: '#000',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                        }}
                    >
                        {adapterLabel}
                    </span>
                ) : null}
            </div>
            <div className="demo-actions">
                {onToggleTheme && theme ? (
                    <button type="button" className="theme-toggle" onClick={onToggleTheme}>
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                ) : null}
                <Link href="/" className={linkClass('/')}>
                    Demo
                </Link>
                <Link href="/demo/form" className={linkClass('/demo/form')}>
                    Form
                </Link>
                <Link href="/docs" className={linkClass('/docs')}>
                    Docs
                </Link>
                <a
                    href="https://github.com/deneshiqua/modern-fm-pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                >
                    GitHub
                </a>
                <a
                    href="https://www.npmjs.com/package/modern-fm-pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                >
                    npm
                </a>
            </div>
        </header>
    );
}
