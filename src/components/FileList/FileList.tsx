'use client';

import React from 'react';
import { useFileManager } from '@/context/FileManagerContext';
import { getFileIcon, EmptyIcon } from '@/components/Icons/Icons';
import { formatFileSize, formatDate, getFileExtension } from '@/utils/helpers';
import type { FileItem, SortField } from '@/types';
import stylesModule from './FileList.module.css';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        sortIndicator: 'sortIndicator',
        listEmpty: 'listEmpty',
        listEmptyText: 'listEmptyText',
        listEmptySubtext: 'listEmptySubtext',
        fileListTable: 'fileListTable',
        fileListHeader: 'fileListHeader',
        fileListHeaderRow: 'fileListHeaderRow',
        fileListBody: 'fileListBody',
        fileListRow: 'fileListRow',
        fileListRowSelected: 'fileListRowSelected',
        checkbox: 'checkbox',
        checkboxHeaderCell: 'checkboxHeaderCell',
        headerCell: 'headerCell',
        headerCellActive: 'headerCellActive',
        listCheckboxCell: 'listCheckboxCell',
        listNameCell: 'listNameCell',
        listFileName: 'listFileName',
        listSizeCell: 'listSizeCell',
        listTypeCell: 'listTypeCell',
        listDateCell: 'listDateCell',
        listNameHeaderCell: 'listNameHeaderCell',
        listSizeHeaderCell: 'listSizeHeaderCell',
        listTypeHeaderCell: 'listTypeHeaderCell',
        listDateHeaderCell: 'listDateHeaderCell',
    };

interface FileListProps {
    files: FileItem[];
    onContextMenu: (e: React.MouseEvent, item?: FileItem) => void;
}

export function FileList({ files, onContextMenu }: FileListProps) {
    const {
        state,
        navigateTo,
        selectItem,
        toggleSelect,
        openPreview,
        clearSelection,
        setSort,
    } = useFileManager();

    const handleClick = (e: React.MouseEvent, item: FileItem) => {
        e.stopPropagation();
        if (e.ctrlKey || e.metaKey) {
            toggleSelect(item);
        } else {
            selectItem(item);
        }
    };

    const handleDoubleClick = (item: FileItem) => {
        if (item.isDirectory) {
            navigateTo(item.path);
        } else {
            openPreview(item);
        }
    };

    const handleSort = (field: SortField) => {
        const newOrder =
            state.sortConfig.field === field && state.sortConfig.order === 'asc'
                ? 'desc'
                : 'asc';
        setSort({ field, order: newOrder });
    };

    const getSortIndicator = (field: SortField) => {
        if (state.sortConfig.field !== field) return null;
        return (
            <span className={styles.sortIndicator}>
                {state.sortConfig.order === 'asc' ? '▲' : '▼'}
            </span>
        );
    };

    const handleBackgroundContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        onContextMenu(e);
    };

    if (files.length === 0) {
        return (
            <div
                className={styles.listEmpty}
                onClick={() => clearSelection()}
                onContextMenu={handleBackgroundContextMenu}
            >
                <EmptyIcon />
                <span className={styles.listEmptyText}>This folder is empty</span>
                <span className={styles.listEmptySubtext}>
                    Drop files here or use the Upload button
                </span>
            </div>
        );
    }

    return (
        <div className={styles.fileListTable} role="table">
            <div className={styles.fileListHeader} role="rowgroup">
                <div className={styles.fileListHeaderRow} role="row">
                    <div className={styles.checkboxHeaderCell} role="columnheader">
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={
                                state.selectedItems.length === files.length && files.length > 0
                            }
                            onChange={(e) => {
                                if (e.target.checked) {
                                    files.forEach((f) => toggleSelect(f));
                                } else {
                                    clearSelection();
                                }
                            }}
                        />
                    </div>
                    <div className={styles.listNameHeaderCell} role="columnheader">
                        <button
                            type="button"
                            className={
                                state.sortConfig.field === 'name'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('name')}
                        >
                            Name {getSortIndicator('name')}
                        </button>
                    </div>
                    <div className={styles.listSizeHeaderCell} role="columnheader">
                        <button
                            type="button"
                            className={
                                state.sortConfig.field === 'size'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('size')}
                        >
                            Size {getSortIndicator('size')}
                        </button>
                    </div>
                    <div className={styles.listTypeHeaderCell} role="columnheader">
                        <button
                            type="button"
                            className={
                                state.sortConfig.field === 'type'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('type')}
                        >
                            Type {getSortIndicator('type')}
                        </button>
                    </div>
                    <div className={styles.listDateHeaderCell} role="columnheader">
                        <button
                            type="button"
                            className={
                                state.sortConfig.field === 'modifiedAt'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('modifiedAt')}
                        >
                            Modified {getSortIndicator('modifiedAt')}
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles.fileListBody} role="rowgroup">
                {files.map((item) => {
                    const isSelected = state.selectedItems.some((s) => s.id === item.id);
                    const rowClassName = isSelected
                        ? `${styles.fileListRow} ${styles.fileListRowSelected}`
                        : styles.fileListRow;

                    return (
                        <div
                            key={item.id}
                            className={rowClassName}
                            role="row"
                            onClick={(e) => handleClick(e, item)}
                            onDoubleClick={() => handleDoubleClick(item)}
                            onContextMenu={(e) => {
                                e.stopPropagation();
                                if (!isSelected) selectItem(item);
                                onContextMenu(e, item);
                            }}
                        >
                            <div className={styles.listCheckboxCell} role="cell">
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={isSelected}
                                    onChange={() => toggleSelect(item)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className={styles.listNameCell} role="cell">
                                {getFileIcon(item, 18)}
                                <span className={styles.listFileName}>{item.name}</span>
                            </div>
                            <div className={styles.listSizeCell} role="cell">
                                {item.isDirectory ? '—' : formatFileSize(item.size)}
                            </div>
                            <div className={styles.listTypeCell} role="cell">
                                {item.isDirectory ? 'Folder' : getFileExtension(item.name).toUpperCase() || '—'}
                            </div>
                            <div className={styles.listDateCell} role="cell">
                                {formatDate(item.modifiedAt)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
