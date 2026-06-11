'use client';

import React from 'react';
import { useFileManager } from '@/context/FileManagerContext';
import { getFileIcon, EmptyIcon } from '@/components/Icons/Icons';
import { formatFileSize, truncateFileName } from '@/utils/helpers';
import type { FileItem } from '@/types';
import stylesModule from './FileGrid.module.css';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        empty: 'empty',
        emptyText: 'emptyText',
        emptySubtext: 'emptySubtext',
        grid: 'grid',
        gridItem: 'gridItem',
        gridItemSelected: 'gridItemSelected',
        iconWrapper: 'iconWrapper',
        thumbnail: 'thumbnail',
        fileName: 'fileName',
        fileMeta: 'fileMeta',
    };

interface FileGridProps {
    files: FileItem[];
    onContextMenu: (e: React.MouseEvent, item?: FileItem) => void;
}

export function FileGrid({ files, onContextMenu }: FileGridProps) {
    const {
        state,
        navigateTo,
        selectItem,
        toggleSelect,
        openPreview,
        clearSelection,
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

    const handleBackgroundClick = () => {
        clearSelection();
    };

    if (files.length === 0) {
        return (
            <div className={styles.empty} onClick={handleBackgroundClick}>
                <EmptyIcon />
                <span className={styles.emptyText}>This folder is empty</span>
                <span className={styles.emptySubtext}>
                    Drop files here or use the Upload button
                </span>
            </div>
        );
    }

    return (
        <div
            className={styles.grid}
            onClick={handleBackgroundClick}
            onContextMenu={(e) => {
                if (e.target === e.currentTarget) {
                    onContextMenu(e);
                }
            }}
        >
            {files.map((item) => {
                const isSelected = state.selectedItems.some((s) => s.id === item.id);
                const isImage = item.mimeType?.startsWith('image/');

                return (
                    <div
                        key={item.id}
                        className={isSelected ? styles.gridItemSelected : styles.gridItem}
                        onClick={(e) => handleClick(e, item)}
                        onDoubleClick={() => handleDoubleClick(item)}
                        onContextMenu={(e) => {
                            e.stopPropagation();
                            if (!isSelected) {
                                selectItem(item);
                            }
                            onContextMenu(e, item);
                        }}
                    >
                        <div className={styles.iconWrapper}>
                            {isImage && item.thumbnailUrl ? (
                                <img
                                    src={item.thumbnailUrl}
                                    alt={item.name}
                                    className={styles.thumbnail}
                                    loading="lazy"
                                />
                            ) : (
                                getFileIcon(item, 42)
                            )}
                        </div>
                        <span className={styles.fileName} title={item.name}>
                            {truncateFileName(item.name, 15)}
                        </span>
                        {!item.isDirectory && (
                            <span className={styles.fileMeta}>{formatFileSize(item.size)}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
