'use client';

import {
    ArrowBackIcon,
    ArrowForwardIcon,
    ArrowUpIcon,
    DeleteIcon,
    DownloadIcon,
    GridViewIcon,
    ListViewIcon,
    NewFolderIcon,
    RefreshIcon,
    SearchIcon,
    UploadIcon,
} from '@/components/Icons/Icons';

import type { FileCategory } from '@/types';
import React from 'react';
import stylesModule from './Toolbar.module.css';
import { useFileManager } from '@/context/FileManagerContext';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        toolbar: 'toolbar',
        navButtons: 'navButtons',
        iconBtn: 'iconBtn',
        separator: 'separator',
        actions: 'actions',
        actionBtn: 'actionBtn',
        actionBtnPrimary: 'actionBtnPrimary',
        actionBtnDanger: 'actionBtnDanger',
        searchWrapper: 'searchWrapper',
        searchIcon: 'searchIcon',
        searchInput: 'searchInput',
        viewToggle: 'viewToggle',
        viewToggleBtn: 'viewToggleBtn',
        viewToggleBtnActive: 'viewToggleBtnActive',
        categoryFilter: 'categoryFilter',
        categoryBtn: 'categoryBtn',
        categoryBtnActive: 'categoryBtnActive',
    };

export function Toolbar() {
    const {
        state,
        config,
        goBack,
        goForward,
        goUp,
        refreshFiles,
        openModal,
        deleteItems,
        downloadFile,
        setViewMode,
        setSearch,
        setCategory,
    } = useFileManager();

    const canGoBack = state.historyIndex > 0;
    const canGoForward = state.historyIndex < state.navigationHistory.length - 1;
    const rootPath = config.rootPath || '/';
    const canGoUp = state.currentPath !== rootPath && state.currentPath !== '/';
    const hasSelection = state.selectedItems.length > 0;
    const singleFileSelected = state.selectedItems.length === 1 && !state.selectedItems[0].isDirectory;
    const isSelectionMode = config.selectionMode === true;
    const showCategoryFilter = config.showCategoryFilter !== false; // Default to true
    const hasInitialCategory = config.initialCategory && config.initialCategory !== 'all';

    const categories: Array<{ id: FileCategory; label: string; icon: string }> = [
        { id: 'all', label: 'All', icon: '📁' },
        { id: 'documents', label: 'Documents', icon: '📄' },
        { id: 'images', label: 'Images', icon: '🖼️' },
        { id: 'media', label: 'Media', icon: '🎵' },
        { id: 'other', label: 'Other', icon: '📦' },
    ];

    const handleSelect = () => {
        if (config.onFileSelect && hasSelection) {
            config.onFileSelect(state.selectedItems);
        }
    };

    return (
        <div className={styles.toolbar}>
            {/* Navigation */}
            <div className={styles.navButtons}>
                <button
                    className={styles.iconBtn}
                    onClick={goBack}
                    disabled={!canGoBack}
                    title="Back"
                >
                    <ArrowBackIcon size={18} />
                </button>
                <button
                    className={styles.iconBtn}
                    onClick={goForward}
                    disabled={!canGoForward}
                    title="Forward"
                >
                    <ArrowForwardIcon size={18} />
                </button>
                <button
                    className={styles.iconBtn}
                    onClick={goUp}
                    disabled={!canGoUp}
                    title="Go up"
                >
                    <ArrowUpIcon size={18} />
                </button>
                <button
                    className={styles.iconBtn}
                    onClick={refreshFiles}
                    title="Refresh"
                >
                    <RefreshIcon size={18} />
                </button>
            </div>

            <div className={styles.separator} />

            {/* Actions */}
            <div className={styles.actions}>
                {/* Upload and New Folder - Always Available */}
                <button
                    className={styles.actionBtnPrimary}
                    onClick={() => openModal('upload')}
                    title="Upload files"
                >
                    <UploadIcon size={16} />
                    <span>Upload</span>
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => openModal('newFolder')}
                    title="New folder"
                >
                    <NewFolderIcon size={16} />
                    <span>New Folder</span>
                </button>

                {/* Selection Mode - Show Select Button */}
                {isSelectionMode && hasSelection && (
                    <>
                        <div className={styles.separator} />
                        <button
                            className={styles.actionBtnPrimary}
                            onClick={handleSelect}
                            title={`Select ${state.selectedItems.length} file(s)`}
                        >
                            ✓ Select ({state.selectedItems.length})
                        </button>
                    </>
                )}

                {/* Normal Mode - Show Download/Delete */}
                {!isSelectionMode && hasSelection && (
                    <>
                        <div className={styles.separator} />
                        {singleFileSelected && (
                            <button
                                className={styles.actionBtn}
                                onClick={() => downloadFile(state.selectedItems[0])}
                                title="Download"
                            >
                                <DownloadIcon size={16} />
                                <span>Download</span>
                            </button>
                        )}
                        <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => openModal('delete')}
                            title="Delete selected"
                        >
                            <DeleteIcon size={16} />
                            <span>Delete</span>
                        </button>
                    </>
                )}
            </div>

            {/* Category Filter */}
            {showCategoryFilter && (
                <>
                    <div className={styles.separator} />
                    <div className={styles.categoryFilter}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={
                                    state.activeCategory === cat.id
                                        ? styles.categoryBtnActive
                                        : styles.categoryBtn
                                }
                                onClick={() => setCategory(cat.id)}
                                disabled={hasInitialCategory}
                                title={hasInitialCategory ? 'Category filter is locked' : cat.label}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Search */}
            <div className={styles.searchWrapper}>
                <SearchIcon size={15} className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search files..."
                    value={state.searchQuery}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* View Toggle */}
            <div className={styles.viewToggle}>
                <button
                    className={
                        state.viewMode === 'grid'
                            ? styles.viewToggleBtnActive
                            : styles.viewToggleBtn
                    }
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                >
                    <GridViewIcon size={16} />
                </button>
                <button
                    className={
                        state.viewMode === 'list'
                            ? styles.viewToggleBtnActive
                            : styles.viewToggleBtn
                    }
                    onClick={() => setViewMode('list')}
                    title="List view"
                >
                    <ListViewIcon size={16} />
                </button>
            </div>
        </div>
    );
}
