'use client';

import type { ContextMenuPosition, FileItem } from '@/types';
import {
    CopyIcon,
    CutIcon,
    DeleteIcon,
    DownloadIcon,
    FolderOpenIcon,
    NewFolderIcon,
    PasteIcon,
    RenameIcon,
    UploadIcon,
} from '@/components/Icons/Icons';
import React, { useEffect, useRef } from 'react';

import { isPreviewable } from '@/utils/helpers';
import stylesModule from './ContextMenu.module.css';
import { useFileManager } from '@/context/FileManagerContext';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        overlay: 'overlay',
        menu: 'menu',
        menuItem: 'menuItem',
        menuItemDanger: 'menuItemDanger',
        menuItemIcon: 'menuItemIcon',
        menuItemLabel: 'menuItemLabel',
        menuItemShortcut: 'menuItemShortcut',
        menuSeparator: 'menuSeparator',
    };

interface ContextMenuProps {
    position: ContextMenuPosition;
    item?: FileItem;
    onClose: () => void;
}

export function ContextMenu({ position, item, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const {
        state,
        navigateTo,
        openPreview,
        openRename,
        openModal,
        cutItems,
        copyItems,
        pasteItems,
        downloadFile,
        selectItem,
    } = useFileManager();

    const hasClipboard = state.clipboard.items.length > 0;

    // Adjust position to stay within viewport
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (rect.right > vw) {
                menuRef.current.style.left = `${position.x - rect.width}px`;
            }
            if (rect.bottom > vh) {
                menuRef.current.style.top = `${position.y - rect.height}px`;
            }
        }
    }, [position]);

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
            <div
                ref={menuRef}
                className={styles.menu}
                style={{ left: position.x, top: position.y }}
            >
                {item ? (
                    <>
                        {/* File/folder specific actions */}
                        {item.isDirectory && (
                            <button
                                className={styles.menuItem}
                                onClick={() => handleAction(() => navigateTo(item.path))}
                            >
                                <span className={styles.menuItemIcon}><FolderOpenIcon size={16} /></span>
                                <span className={styles.menuItemLabel}>Open</span>
                            </button>
                        )}
                        {!item.isDirectory && isPreviewable(item.mimeType, item.name) && (
                            <button
                                className={styles.menuItem}
                                onClick={() => handleAction(() => openPreview(item))}
                            >
                                <span className={styles.menuItemIcon}><FolderOpenIcon size={16} /></span>
                                <span className={styles.menuItemLabel}>Preview</span>
                            </button>
                        )}
                        {!item.isDirectory && (
                            <button
                                className={styles.menuItem}
                                onClick={() => handleAction(() => downloadFile(item))}
                            >
                                <span className={styles.menuItemIcon}><DownloadIcon size={16} /></span>
                                <span className={styles.menuItemLabel}>Download</span>
                            </button>
                        )}

                        <div className={styles.menuSeparator} />

                        <button
                            className={styles.menuItem}
                            onClick={() => handleAction(() => cutItems([item]))}
                        >
                            <span className={styles.menuItemIcon}><CutIcon size={16} /></span>
                            <span className={styles.menuItemLabel}>Cut</span>
                            <span className={styles.menuItemShortcut}>Ctrl+X</span>
                        </button>
                        <button
                            className={styles.menuItem}
                            onClick={() => handleAction(() => copyItems([item]))}
                        >
                            <span className={styles.menuItemIcon}><CopyIcon size={16} /></span>
                            <span className={styles.menuItemLabel}>Copy</span>
                            <span className={styles.menuItemShortcut}>Ctrl+C</span>
                        </button>
                        {hasClipboard && (
                            <button
                                className={styles.menuItem}
                                onClick={() => handleAction(pasteItems)}
                            >
                                <span className={styles.menuItemIcon}><PasteIcon size={16} /></span>
                                <span className={styles.menuItemLabel}>Paste</span>
                                <span className={styles.menuItemShortcut}>Ctrl+V</span>
                            </button>
                        )}

                        <div className={styles.menuSeparator} />

                        <button
                            className={styles.menuItem}
                            onClick={() => handleAction(() => openRename(item))}
                        >
                            <span className={styles.menuItemIcon}><RenameIcon size={16} /></span>
                            <span className={styles.menuItemLabel}>Rename</span>
                            <span className={styles.menuItemShortcut}>F2</span>
                        </button>
                        <button
                            className={styles.menuItemDanger}
                            onClick={() => {
                                selectAndDelete();
                            }}
                        >
                            <span className={styles.menuItemIcon}><DeleteIcon size={16} /></span>
                            <span className={styles.menuItemLabel}>Delete</span>
                            <span className={styles.menuItemShortcut}>Del</span>
                        </button>
                    </>
                ) : (
                    <>
                        {/* Background context menu */}
                        <button
                            className={styles.menuItem}
                            onClick={() => handleAction(() => openModal('newFolder'))}
                        >
                            <span className={styles.menuItemIcon}><NewFolderIcon size={16} /></span>
                            <span className={styles.menuItemLabel}>New Folder</span>
                        </button>
                        <button
                            className={styles.menuItem}
                            onClick={() => handleAction(() => openModal('upload'))}
                        >
                            <span className={styles.menuItemIcon}><UploadIcon size={16} /></span>
                            <span className={styles.menuItemLabel}>Upload Files</span>
                        </button>
                        {hasClipboard && (
                            <>
                                <div className={styles.menuSeparator} />
                                <button
                                    className={styles.menuItem}
                                    onClick={() => handleAction(pasteItems)}
                                >
                                    <span className={styles.menuItemIcon}><PasteIcon size={16} /></span>
                                    <span className={styles.menuItemLabel}>Paste</span>
                                    <span className={styles.menuItemShortcut}>Ctrl+V</span>
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );

    function selectAndDelete() {
        // First select the item, then open delete modal
        if (!item) return;
        selectItem(item);
        onClose();
        openModal('delete');
    }
}
