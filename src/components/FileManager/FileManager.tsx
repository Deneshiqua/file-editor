'use client';

import '@/styles/variables.css';
import '@/styles/filerobot-overrides.css';

import type { ContextMenuPosition, FileItem, FileManagerAdapter, FileManagerConfig } from '@/types';
import { ErrorBanner, StatusBar } from '@/components/StatusBar/StatusBar';
import { FileManagerProvider, useFileManager } from '@/context/FileManagerContext';
import React, { useCallback, useEffect, useState } from 'react';
import { filterByCategory, filterFiles, sortFiles } from '@/utils/helpers';

import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { ContextMenu } from '@/components/ContextMenu/ContextMenu';
import { DeleteModal } from '@/components/Modals/DeleteModal';
import { FileGrid } from '@/components/FileGrid/FileGrid';
import { FileList } from '@/components/FileList/FileList';
import { InputModal } from '@/components/Modals/InputModal';
import { PreviewModal } from '@/components/Modals/PreviewModal';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { UploadModal } from '@/components/Modals/UploadModal';
import stylesModule from './FileManager.module.css';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        fileManager: 'fileManager',
        body: 'body',
        content: 'content',
        contentArea: 'contentArea',
        loadingOverlay: 'loadingOverlay',
        spinner: 'spinner',
    };

interface FileManagerProps {
    adapter: FileManagerAdapter;
    config?: FileManagerConfig;
}

function FileManagerInner() {
    const {
        state,
        config,
        navigateTo,
        cutItems,
        copyItems,
        pasteItems,
        deleteItems,
        openModal,
        selectAll,
        refreshFiles,
    } = useFileManager();

    const [contextMenu, setContextMenu] = useState<{
        position: ContextMenuPosition;
        item?: FileItem;
    } | null>(null);

    // Initial load
    useEffect(() => {
        navigateTo(state.currentPath);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'a':
                        e.preventDefault();
                        selectAll();
                        break;
                    case 'c':
                        e.preventDefault();
                        copyItems();
                        break;
                    case 'x':
                        e.preventDefault();
                        cutItems();
                        break;
                    case 'v':
                        e.preventDefault();
                        pasteItems();
                        break;
                }
            }

            if (e.key === 'Delete' && state.selectedItems.length > 0) {
                openModal('delete');
            }

            if (e.key === 'F2' && state.selectedItems.length === 1) {
                e.preventDefault();
                openModal('rename');
            }

            if (e.key === 'F5') {
                e.preventDefault();
                refreshFiles();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.selectedItems, selectAll, copyItems, cutItems, pasteItems, openModal, refreshFiles, deleteItems]);

    // Sort and filter files
    const hideSystemFiles = config.hideSystemFiles ?? true; // Default to true
    const sortedFiles = sortFiles(state.files, state.sortConfig);
    const searchFiltered = filterFiles(sortedFiles, state.searchQuery, hideSystemFiles);
    const processedFiles = filterByCategory(searchFiltered, state.activeCategory);

    const handleContextMenu = useCallback(
        (e: React.MouseEvent, item?: FileItem) => {
            e.preventDefault();
            setContextMenu({
                position: { x: e.clientX, y: e.clientY },
                item,
            });
        },
        []
    );

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    return (
        <div
            className={styles.fileManager}
            data-fm-root="true"
            data-fm-theme={config.theme || 'dark'}
            style={{
                height: config.height || '700px',
                width: config.width || '100%',
            }}
        >
            {/* Toolbar */}
            <Toolbar />

            {/* Error Banner */}
            <ErrorBanner />

            {/* Breadcrumb */}
            {config.showBreadcrumb !== false && <Breadcrumb />}

            {/* Body */}
            <div className={styles.body}>
                {/* Sidebar */}
                {config.showSidebar !== false && <Sidebar />}

                {/* Content */}
                <div className={styles.content}>
                    <div
                        className={styles.contentArea}
                        onContextMenu={(e) => {
                            if (e.target === e.currentTarget) {
                                handleContextMenu(e);
                            }
                        }}
                    >
                        {state.viewMode === 'grid' ? (
                            <FileGrid files={processedFiles} onContextMenu={handleContextMenu} />
                        ) : (
                            <FileList files={processedFiles} onContextMenu={handleContextMenu} />
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            {config.showStatusBar !== false && <StatusBar />}

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    position={contextMenu.position}
                    item={contextMenu.item}
                    onClose={closeContextMenu}
                />
            )}

            {/* Modals */}
            {state.activeModal === 'upload' && <UploadModal />}
            {state.activeModal === 'preview' && <PreviewModal />}
            {(state.activeModal === 'newFolder' || state.activeModal === 'rename') && <InputModal />}
            {state.activeModal === 'delete' && <DeleteModal />}

            {/* Loading overlay */}
            {state.isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                </div>
            )}
        </div>
    );
}

export function FileManager({ adapter, config = {} }: FileManagerProps) {
    return (
        <FileManagerProvider adapter={adapter} config={config}>
            <FileManagerInner />
        </FileManagerProvider>
    );
}
