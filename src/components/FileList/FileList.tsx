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
        emptyText: 'emptyText',
        emptySubtext: 'emptySubtext',
        table: 'table',
        thead: 'thead',
        headerRow: 'headerRow',
        checkbox: 'checkbox',
        headerCell: 'headerCell',
        headerCellActive: 'headerCellActive',
        row: 'row',
        rowSelected: 'rowSelected',
        cell: 'cell',
        nameCell: 'nameCell',
        fileName: 'fileName',
        sizeCell: 'sizeCell',
        typeCell: 'typeCell',
        dateCell: 'dateCell',
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

    if (files.length === 0) {
        return (
            <div className={styles.listEmpty} onClick={() => clearSelection()}>
                <EmptyIcon />
                <span className={styles.emptyText}>This folder is empty</span>
                <span className={styles.emptySubtext}>
                    Drop files here or use the Upload button
                </span>
            </div>
        );
    }

    return (
        <table className={styles.table}>
            <thead className={styles.thead}>
                <tr className={styles.headerRow}>
                    <th style={{ width: 40, padding: '8px 12px' }}>
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
                    </th>
                    <th>
                        <button
                            className={
                                state.sortConfig.field === 'name'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('name')}
                        >
                            Name {getSortIndicator('name')}
                        </button>
                    </th>
                    <th>
                        <button
                            className={
                                state.sortConfig.field === 'size'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('size')}
                        >
                            Size {getSortIndicator('size')}
                        </button>
                    </th>
                    <th>
                        <button
                            className={
                                state.sortConfig.field === 'type'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('type')}
                        >
                            Type {getSortIndicator('type')}
                        </button>
                    </th>
                    <th>
                        <button
                            className={
                                state.sortConfig.field === 'modifiedAt'
                                    ? styles.headerCellActive
                                    : styles.headerCell
                            }
                            onClick={() => handleSort('modifiedAt')}
                        >
                            Modified {getSortIndicator('modifiedAt')}
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody>
                {files.map((item) => {
                    const isSelected = state.selectedItems.some((s) => s.id === item.id);

                    return (
                        <tr
                            key={item.id}
                            className={isSelected ? styles.rowSelected : styles.row}
                            onClick={(e) => handleClick(e, item)}
                            onDoubleClick={() => handleDoubleClick(item)}
                            onContextMenu={(e) => {
                                e.stopPropagation();
                                if (!isSelected) selectItem(item);
                                onContextMenu(e, item);
                            }}
                        >
                            <td className={styles.cell}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={isSelected}
                                    onChange={() => toggleSelect(item)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>
                            <td className={styles.nameCell}>
                                {getFileIcon(item, 18)}
                                <span className={styles.fileName}>{item.name}</span>
                            </td>
                            <td className={styles.sizeCell}>
                                {item.isDirectory ? '—' : formatFileSize(item.size)}
                            </td>
                            <td className={styles.typeCell}>
                                {item.isDirectory ? 'Folder' : getFileExtension(item.name).toUpperCase() || '—'}
                            </td>
                            <td className={styles.dateCell}>{formatDate(item.modifiedAt)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
