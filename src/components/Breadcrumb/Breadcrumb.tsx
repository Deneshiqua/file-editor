'use client';

import { ChevronRightIcon, HomeIcon } from '@/components/Icons/Icons';

import React from 'react';
import stylesModule from './Breadcrumb.module.css';
import { useFileManager } from '@/context/FileManagerContext';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        breadcrumb: 'breadcrumb',
        crumb: 'crumb',
        crumbActive: 'crumbActive',
        separator: 'separator',
    };

export function Breadcrumb() {
    const { state, config, navigateTo } = useFileManager();

    const rootPath = config.rootPath || '/';
    const parts = state.currentPath.split('/').filter(Boolean);
    const rootParts = rootPath.split('/').filter(Boolean);

    // Start from rootPath instead of '/'
    const crumbs = [
        { label: rootPath === '/' ? 'Root' : rootParts[rootParts.length - 1] || 'Root', path: rootPath },
        ...parts.slice(rootParts.length).map((part, i) => {
            const pathIndex = rootParts.length + i;
            return {
                label: part,
                path: '/' + parts.slice(0, pathIndex + 1).join('/'),
            };
        }),
    ];

    return (
        <div className={styles.breadcrumb}>
            {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                    <React.Fragment key={crumb.path}>
                        <button
                            className={isLast ? styles.crumbActive : styles.crumb}
                            onClick={() => !isLast && navigateTo(crumb.path)}
                        >
                            {idx === 0 && <HomeIcon size={14} />}
                            {crumb.label}
                        </button>
                        {!isLast && (
                            <span className={styles.separator}>
                                <ChevronRightIcon size={12} />
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
