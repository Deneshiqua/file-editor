'use client';

import React from 'react';
import { useFileManager } from '@/context/FileManagerContext';
import stylesModule from './StatusBar.module.css';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        statusBar: 'statusBar',
        statusLeft: 'statusLeft',
        statusRight: 'statusRight',
        statusItem: 'statusItem',
        errorBanner: 'errorBanner',
        errorDismiss: 'errorDismiss',
    };

export function StatusBar() {
    const { state } = useFileManager();

    const fileCount = state.files.filter((f) => !f.isDirectory).length;
    const folderCount = state.files.filter((f) => f.isDirectory).length;
    const selectedCount = state.selectedItems.length;

    return (
        <div className={styles.statusBar}>
            <div className={styles.statusLeft}>
                <span className={styles.statusItem}>
                    {folderCount} folder{folderCount !== 1 ? 's' : ''}, {fileCount} file{fileCount !== 1 ? 's' : ''}
                </span>
                {selectedCount > 0 && (
                    <span className={styles.statusItem}>
                        {selectedCount} selected
                    </span>
                )}
            </div>
            <div className={styles.statusRight}>
                <span className={styles.statusItem}>{state.currentPath}</span>
            </div>
        </div>
    );
}

export function ErrorBanner() {
    const { state, dispatch } = useFileManager();

    if (!state.error) return null;

    return (
        <div className={styles.errorBanner}>
            <span>⚠ {state.error}</span>
            <button
                className={styles.errorDismiss}
                onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
            >
                Dismiss
            </button>
        </div>
    );
}
