'use client';

import type {
    ClipboardState,
    FileCategory,
    FileItem,
    FileManagerAction,
    FileManagerAdapter,
    FileManagerConfig,
    FileManagerState,
    ModalType,
    SortConfig,
    UploadProgress,
    ViewMode,
} from '@/types';
import React, { createContext, useCallback, useContext, useReducer, useRef } from 'react';

// Initial state
const initialState: FileManagerState = {
    currentPath: '/',
    files: [],
    selectedItems: [],
    viewMode: 'grid',
    sortConfig: { field: 'name', order: 'asc' },
    clipboard: { items: [], operation: null },
    searchQuery: '',
    activeCategory: 'all',
    isLoading: false,
    error: null,
    activeModal: null,
    previewItem: null,
    renameItem: null,
    uploadProgress: [],
    navigationHistory: ['/'],
    historyIndex: 0,
    sidebarFolders: [],
};

// Reducer
function fileManagerReducer(
    state: FileManagerState,
    action: FileManagerAction
): FileManagerState {
    switch (action.type) {
        case 'SET_PATH':
            return { ...state, currentPath: action.payload };

        case 'SET_FILES':
            return { ...state, files: action.payload };

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        case 'SELECT_ITEM':
            return { ...state, selectedItems: [action.payload] };

        case 'TOGGLE_SELECT': {
            const exists = state.selectedItems.find((i) => i.id === action.payload.id);
            return {
                ...state,
                selectedItems: exists
                    ? state.selectedItems.filter((i) => i.id !== action.payload.id)
                    : [...state.selectedItems, action.payload],
            };
        }

        case 'SELECT_ALL':
            return { ...state, selectedItems: [...state.files] };

        case 'CLEAR_SELECTION':
            return { ...state, selectedItems: [] };

        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };

        case 'SET_SORT':
            return { ...state, sortConfig: action.payload };

        case 'SET_SEARCH':
            return { ...state, searchQuery: action.payload };

        case 'SET_CATEGORY':
            return { ...state, activeCategory: action.payload };

        case 'SET_CLIPBOARD':
            return { ...state, clipboard: action.payload };

        case 'CLEAR_CLIPBOARD':
            return { ...state, clipboard: { items: [], operation: null } };

        case 'SET_MODAL':
            return { ...state, activeModal: action.payload };

        case 'SET_PREVIEW_ITEM':
            return { ...state, previewItem: action.payload };

        case 'SET_RENAME_ITEM':
            return { ...state, renameItem: action.payload };

        case 'SET_UPLOAD_PROGRESS':
            return { ...state, uploadProgress: action.payload };

        case 'NAVIGATE_TO': {
            const newHistory = [
                ...state.navigationHistory.slice(0, state.historyIndex + 1),
                action.payload,
            ];
            return {
                ...state,
                currentPath: action.payload,
                navigationHistory: newHistory,
                historyIndex: newHistory.length - 1,
                selectedItems: [],
                searchQuery: '',
            };
        }

        case 'GO_BACK': {
            if (state.historyIndex <= 0) return state;
            const newIndex = state.historyIndex - 1;
            return {
                ...state,
                currentPath: state.navigationHistory[newIndex],
                historyIndex: newIndex,
                selectedItems: [],
                searchQuery: '',
            };
        }

        case 'GO_FORWARD': {
            if (state.historyIndex >= state.navigationHistory.length - 1) return state;
            const newIndex = state.historyIndex + 1;
            return {
                ...state,
                currentPath: state.navigationHistory[newIndex],
                historyIndex: newIndex,
                selectedItems: [],
                searchQuery: '',
            };
        }

        case 'SET_SIDEBAR_FOLDERS':
            return { ...state, sidebarFolders: action.payload };

        default:
            return state;
    }
}

// Context
interface FileManagerContextValue {
    state: FileManagerState;
    dispatch: React.Dispatch<FileManagerAction>;
    adapter: FileManagerAdapter;
    config: FileManagerConfig;
    // Actions
    navigateTo: (path: string) => Promise<void>;
    goBack: () => void;
    goForward: () => void;
    goUp: () => void;
    refreshFiles: () => Promise<void>;
    createFolder: (name: string) => Promise<void>;
    deleteItems: (items?: FileItem[]) => Promise<void>;
    renameItem: (item: FileItem, newName: string) => Promise<void>;
    cutItems: (items?: FileItem[]) => void;
    copyItems: (items?: FileItem[]) => void;
    pasteItems: () => Promise<void>;
    uploadFiles: (files: File[]) => Promise<void>;
    downloadFile: (item: FileItem) => void;
    selectItem: (item: FileItem) => void;
    toggleSelect: (item: FileItem) => void;
    selectAll: () => void;
    clearSelection: () => void;
    setViewMode: (mode: ViewMode) => void;
    setSort: (config: SortConfig) => void;
    setSearch: (query: string) => void;
    setCategory: (category: FileCategory) => void;
    openModal: (modal: ModalType) => void;
    closeModal: () => void;
    openPreview: (item: FileItem) => void;
    openRename: (item: FileItem) => void;
    saveFileContent: (path: string, content: string | Blob) => Promise<FileItem>;
}

const FileManagerContext = createContext<FileManagerContextValue | null>(null);

// Provider
interface FileManagerProviderProps {
    children: React.ReactNode;
    adapter: FileManagerAdapter;
    config?: FileManagerConfig;
}

export function FileManagerProvider({
    children,
    adapter,
    config = {},
}: FileManagerProviderProps) {
    const mergedConfig: FileManagerConfig = {
        rootPath: '/',
        viewMode: 'grid',
        theme: 'dark',
        showSidebar: true,
        showStatusBar: true,
        showBreadcrumb: true,
        height: '700px',
        width: '100%',
        ...config,
    };

    const [state, dispatch] = useReducer(fileManagerReducer, {
        ...initialState,
        currentPath: mergedConfig.rootPath || '/',
        viewMode: mergedConfig.viewMode || 'grid',
        activeCategory: mergedConfig.initialCategory || 'all',
        navigationHistory: [mergedConfig.rootPath || '/'],
    });

    const adapterRef = useRef(adapter);
    adapterRef.current = adapter;

    // Helper: Check if path is within rootPath
    const isPathWithinRoot = useCallback((path: string): boolean => {
        const rootPath = mergedConfig.rootPath || '/';
        const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
        const normalizedRoot = rootPath.endsWith('/') && rootPath !== '/' ? rootPath.slice(0, -1) : rootPath;

        if (normalizedRoot === '/') return true; // Root is '/', all paths are within

        return normalizedPath === normalizedRoot || normalizedPath.startsWith(normalizedRoot + '/');
    }, [mergedConfig.rootPath]);

    // Load files for a given path
    const loadFiles = useCallback(async (path: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
            const files = await adapterRef.current.listFiles(path);
            dispatch({ type: 'SET_FILES', payload: files });
        } catch (err) {
            dispatch({
                type: 'SET_ERROR',
                payload: err instanceof Error ? err.message : 'Failed to load files',
            });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    // Load sidebar folders
    const loadSidebarFolders = useCallback(async () => {
        try {
            const rootFiles = await adapterRef.current.listFiles(mergedConfig.rootPath || '/');
            const folders = rootFiles.filter((f) => f.isDirectory);
            dispatch({ type: 'SET_SIDEBAR_FOLDERS', payload: folders });
        } catch {
            // Silently fail for sidebar
        }
    }, [mergedConfig.rootPath]);

    // Navigation
    const navigateTo = useCallback(
        async (path: string) => {
            // Prevent navigation outside rootPath
            if (!isPathWithinRoot(path)) {
                console.warn(`Navigation to ${path} is blocked. Outside root path: ${mergedConfig.rootPath}`);
                return;
            }
            dispatch({ type: 'NAVIGATE_TO', payload: path });
            await loadFiles(path);
            loadSidebarFolders();
        },
        [loadFiles, loadSidebarFolders, isPathWithinRoot, mergedConfig.rootPath]
    );

    const goBack = useCallback(() => {
        if (state.historyIndex > 0) {
            dispatch({ type: 'GO_BACK' });
            const prevPath = state.navigationHistory[state.historyIndex - 1];
            loadFiles(prevPath);
        }
    }, [state.historyIndex, state.navigationHistory, loadFiles]);

    const goForward = useCallback(() => {
        if (state.historyIndex < state.navigationHistory.length - 1) {
            dispatch({ type: 'GO_FORWARD' });
            const nextPath = state.navigationHistory[state.historyIndex + 1];
            loadFiles(nextPath);
        }
    }, [state.historyIndex, state.navigationHistory, loadFiles]);

    const goUp = useCallback(() => {
        const rootPath = mergedConfig.rootPath || '/';

        // Already at root, cannot go up
        if (state.currentPath === rootPath) {
            return;
        }

        const parentPath = state.currentPath === '/'
            ? '/'
            : state.currentPath.split('/').slice(0, -1).join('/') || '/';

        // Don't go above rootPath
        if (!isPathWithinRoot(parentPath) || parentPath.length < rootPath.length) {
            return;
        }

        if (parentPath !== state.currentPath) {
            navigateTo(parentPath);
        }
    }, [state.currentPath, navigateTo, mergedConfig.rootPath, isPathWithinRoot]);

    const refreshFiles = useCallback(async () => {
        await loadFiles(state.currentPath);
        loadSidebarFolders();
    }, [state.currentPath, loadFiles, loadSidebarFolders]);

    // File operations
    const createFolder = useCallback(
        async (name: string) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                await adapterRef.current.createFolder(state.currentPath, name);
                await refreshFiles();
                dispatch({ type: 'SET_MODAL', payload: null });
            } catch (err) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: err instanceof Error ? err.message : 'Failed to create folder',
                });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [state.currentPath, refreshFiles]
    );

    const deleteItems = useCallback(
        async (items?: FileItem[]) => {
            const toDelete = items || state.selectedItems;
            if (toDelete.length === 0) return;
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                await adapterRef.current.deleteItems(toDelete.map((i) => i.path));
                dispatch({ type: 'CLEAR_SELECTION' });
                dispatch({ type: 'SET_MODAL', payload: null });
                await refreshFiles();
            } catch (err) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: err instanceof Error ? err.message : 'Failed to delete items',
                });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [state.selectedItems, refreshFiles]
    );

    const renameItemFn = useCallback(
        async (item: FileItem, newName: string) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                await adapterRef.current.renameItem(item.path, newName);
                dispatch({ type: 'SET_MODAL', payload: null });
                dispatch({ type: 'SET_RENAME_ITEM', payload: null });
                await refreshFiles();
            } catch (err) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: err instanceof Error ? err.message : 'Failed to rename item',
                });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [refreshFiles]
    );

    // Clipboard
    const cutItems = useCallback(
        (items?: FileItem[]) => {
            const toCut = items || state.selectedItems;
            dispatch({
                type: 'SET_CLIPBOARD',
                payload: { items: toCut, operation: 'cut' },
            });
        },
        [state.selectedItems]
    );

    const copyItemsFn = useCallback(
        (items?: FileItem[]) => {
            const toCopy = items || state.selectedItems;
            dispatch({
                type: 'SET_CLIPBOARD',
                payload: { items: toCopy, operation: 'copy' },
            });
        },
        [state.selectedItems]
    );

    const pasteItems = useCallback(async () => {
        if (!state.clipboard.operation || state.clipboard.items.length === 0) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const sourcePaths = state.clipboard.items.map((i) => i.path);
            // We pass the current directory as the target path
            const targetPath = state.currentPath;

            if (state.clipboard.operation === 'cut') {
                await adapterRef.current.moveItems(sourcePaths, targetPath);
            } else {
                await adapterRef.current.copyItems(sourcePaths, targetPath);
            }
            dispatch({ type: 'CLEAR_CLIPBOARD' });
            await refreshFiles();
        } catch (err) {
            dispatch({
                type: 'SET_ERROR',
                payload: err instanceof Error ? err.message : 'Failed to paste items',
            });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.clipboard, state.currentPath, refreshFiles]);

    // Upload
    const uploadFilesFn = useCallback(
        async (files: File[]) => {
            const progress: UploadProgress[] = files.map((file) => ({
                file,
                progress: 0,
                status: 'pending' as const,
            }));
            dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });

            try {
                await adapterRef.current.uploadFiles(state.currentPath, files, (p) => {
                    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: p });
                });
                await refreshFiles();
                // Keep modal open briefly to show success
                setTimeout(() => {
                    dispatch({ type: 'SET_MODAL', payload: null });
                    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: [] });
                }, 1500);
            } catch (err) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: err instanceof Error ? err.message : 'Failed to upload files',
                });
            }
        },
        [state.currentPath, refreshFiles]
    );

    // Download
    const downloadFile = useCallback((item: FileItem) => {
        const url = adapterRef.current.getDownloadUrl(item.path);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, []);

    // Save Content
    const saveFileContentFn = useCallback(
        async (path: string, content: string | Blob) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const item = await adapterRef.current.saveFileContent(path, content);
                await refreshFiles();
                return item;
            } catch (err) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: err instanceof Error ? err.message : 'Failed to save file',
                });
                throw err;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [refreshFiles]
    );

    // Selection
    const selectItem = useCallback((item: FileItem) => {
        dispatch({ type: 'SELECT_ITEM', payload: item });
    }, []);

    const toggleSelect = useCallback((item: FileItem) => {
        dispatch({ type: 'TOGGLE_SELECT', payload: item });
    }, []);

    const selectAll = useCallback(() => {
        dispatch({ type: 'SELECT_ALL' });
    }, []);

    const clearSelection = useCallback(() => {
        dispatch({ type: 'CLEAR_SELECTION' });
    }, []);

    // View
    const setViewMode = useCallback((mode: ViewMode) => {
        dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    }, []);

    const setSort = useCallback((config: SortConfig) => {
        dispatch({ type: 'SET_SORT', payload: config });
    }, []);

    const setSearch = useCallback((query: string) => {
        dispatch({ type: 'SET_SEARCH', payload: query });
    }, []);
    const setCategory = useCallback((category: FileCategory) => {
        dispatch({ type: 'SET_CATEGORY', payload: category });
    }, []);


    // Modals
    const openModal = useCallback((modal: ModalType) => {
        dispatch({ type: 'SET_MODAL', payload: modal });
    }, []);

    const closeModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: null });
        dispatch({ type: 'SET_PREVIEW_ITEM', payload: null });
        dispatch({ type: 'SET_RENAME_ITEM', payload: null });
    }, []);

    const openPreview = useCallback((item: FileItem) => {
        dispatch({ type: 'SET_PREVIEW_ITEM', payload: item });
        dispatch({ type: 'SET_MODAL', payload: 'preview' });
    }, []);

    const openRename = useCallback((item: FileItem) => {
        dispatch({ type: 'SET_RENAME_ITEM', payload: item });
        dispatch({ type: 'SET_MODAL', payload: 'rename' });
    }, []);

    const value: FileManagerContextValue = {
        state,
        dispatch,
        adapter,
        config: mergedConfig,
        navigateTo,
        goBack,
        goForward,
        goUp,
        refreshFiles,
        createFolder,
        deleteItems,
        renameItem: renameItemFn,
        cutItems,
        copyItems: copyItemsFn,
        pasteItems,
        uploadFiles: uploadFilesFn,
        downloadFile,
        selectItem,
        toggleSelect,
        selectAll,
        setCategory,
        clearSelection,
        setViewMode,
        setSort,
        setSearch,
        openModal,
        closeModal,
        openPreview,
        openRename,
        saveFileContent: saveFileContentFn,
    };

    return (
        <FileManagerContext.Provider value={value}>
            {children}
        </FileManagerContext.Provider>
    );
}

// Hook
export function useFileManager() {
    const context = useContext(FileManagerContext);
    if (!context) {
        throw new Error('useFileManager must be used within a FileManagerProvider');
    }
    return context;
}
