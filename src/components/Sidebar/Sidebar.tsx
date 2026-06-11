'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFileManager } from '@/context/FileManagerContext';
import { FolderIcon, FolderOpenIcon, HomeIcon, ChevronRightIcon } from '@/components/Icons/Icons';
import type { FileItem } from '@/types';
import stylesModule from './Sidebar.module.css';

const styles = Object.keys(stylesModule).length > 0
    ? stylesModule
    : {
        treeItem: 'treeItem',
        treeItemActive: 'treeItemActive',
        toggleIcon: 'toggleIcon',
        toggleIconExpanded: 'toggleIconExpanded',
        treeItemName: 'treeItemName',
        childrenContainer: 'childrenContainer',
        sidebar: 'sidebar',
        sidebarHeader: 'sidebarHeader',
        treeContainer: 'treeContainer',
        rootItem: 'rootItem',
    };

interface TreeNodeProps {
    folder: FileItem;
    level: number;
}

function TreeNode({ folder, level }: TreeNodeProps) {
    const { state, navigateTo, adapter } = useFileManager();
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState<FileItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    const isActive = state.currentPath === folder.path;
    const isInPath = state.currentPath.startsWith(folder.path + '/');

    useEffect(() => {
        if (isInPath && !expanded) {
            setExpanded(true);
        }
    }, [isInPath, expanded]);

    const loadChildren = useCallback(async () => {
        if (!loaded) {
            try {
                const files = await adapter.listFiles(folder.path);
                setChildren(files.filter((f) => f.isDirectory));
                setLoaded(true);
            } catch {
                // silently fail
            }
        }
    }, [loaded, adapter, folder.path]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!expanded) {
            await loadChildren();
        }
        setExpanded(!expanded);
    };

    const handleClick = () => {
        navigateTo(folder.path);
        if (!expanded) {
            loadChildren();
            setExpanded(true);
        }
    };

    return (
        <div>
            <div
                className={isActive ? styles.treeItemActive : styles.treeItem}
                style={{ paddingLeft: `${8 + level * 8}px` }}
                onClick={handleClick}
            >
                <span
                    className={expanded ? styles.toggleIconExpanded : styles.toggleIcon}
                    onClick={handleToggle}
                >
                    <ChevronRightIcon size={12} />
                </span>
                {expanded ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />}
                <span className={styles.treeItemName}>{folder.name}</span>
            </div>
            {expanded && children.length > 0 && (
                <div className={styles.childrenContainer}>
                    {children.map((child) => (
                        <TreeNode key={child.id} folder={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function Sidebar() {
    const { state, navigateTo } = useFileManager();
    const isRootActive = state.currentPath === '/';

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>Explorer</div>
            <div className={styles.treeContainer}>
                <div
                    className={isRootActive ? styles.treeItemActive : styles.rootItem}
                    onClick={() => navigateTo('/')}
                >
                    <HomeIcon size={16} />
                    <span className={styles.treeItemName}>Root</span>
                </div>
                {state.sidebarFolders.map((folder) => (
                    <TreeNode key={folder.id} folder={folder} level={0} />
                ))}
            </div>
        </div>
    );
}
