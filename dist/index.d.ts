import React$1 from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'size' | 'type' | 'modifiedAt';
type SortOrder = 'asc' | 'desc';
type ThemeMode = 'light' | 'dark';
type FileCategory = 'all' | 'documents' | 'images' | 'media' | 'other';
interface FileItem {
    id: string;
    name: string;
    isDirectory: boolean;
    size: number;
    mimeType: string;
    path: string;
    parentPath: string;
    thumbnailUrl?: string;
    createdAt: string;
    modifiedAt: string;
}
interface DeleteItemTarget {
    path: string;
    isDirectory: boolean;
}
interface SortConfig {
    field: SortField;
    order: SortOrder;
}
interface ClipboardState {
    items: FileItem[];
    operation: 'cut' | 'copy' | null;
}
interface UploadProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}
interface ContextMenuPosition {
    x: number;
    y: number;
}
interface ContextMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    disabled?: boolean;
    separator?: boolean;
    danger?: boolean;
    action?: () => void;
}
interface FileManagerConfig {
    rootPath?: string;
    allowedExtensions?: string[];
    maxFileSize?: number;
    maxUploadFiles?: number;
    viewMode?: ViewMode;
    theme?: ThemeMode;
    showSidebar?: boolean;
    showStatusBar?: boolean;
    showBreadcrumb?: boolean;
    showCategoryFilter?: boolean;
    initialCategory?: FileCategory;
    height?: string;
    width?: string;
    locale?: string;
    selectionMode?: boolean;
    multiSelect?: boolean;
    onFileSelect?: (files: FileItem[]) => void;
    onClose?: () => void;
    hideSystemFiles?: boolean;
    supabase?: {
        url: string;
        anonKey: string;
        bucketName: string;
    };
}
interface FileManagerAdapter {
    listFiles(path: string): Promise<FileItem[]>;
    createFolder(path: string, name: string): Promise<FileItem>;
    deleteItems(targets: DeleteItemTarget[]): Promise<void>;
    renameItem(path: string, newName: string): Promise<FileItem>;
    moveItems(sourcePaths: string[], targetPath: string): Promise<void>;
    copyItems(sourcePaths: string[], targetPath: string): Promise<void>;
    uploadFiles(path: string, files: File[], onProgress?: (progress: UploadProgress[]) => void): Promise<FileItem[]>;
    downloadFile(path: string): Promise<Blob>;
    saveFileContent(path: string, content: string | Blob): Promise<FileItem>;
    getPreviewUrl(path: string): string;
    getDownloadUrl(path: string): string;
    search?(path: string, query: string): Promise<FileItem[]>;
}
type ModalType = 'upload' | 'preview' | 'rename' | 'newFolder' | 'delete' | null;
interface FileManagerState {
    currentPath: string;
    files: FileItem[];
    selectedItems: FileItem[];
    viewMode: ViewMode;
    sortConfig: SortConfig;
    clipboard: ClipboardState;
    activeCategory: FileCategory;
    searchQuery: string;
    isLoading: boolean;
    error: string | null;
    activeModal: ModalType;
    previewItem: FileItem | null;
    renameItem: FileItem | null;
    uploadProgress: UploadProgress[];
    navigationHistory: string[];
    historyIndex: number;
    sidebarFolders: FileItem[];
}
type FileManagerAction = {
    type: 'SET_PATH';
    payload: string;
} | {
    type: 'SET_FILES';
    payload: FileItem[];
} | {
    type: 'SET_LOADING';
    payload: boolean;
} | {
    type: 'SET_ERROR';
    payload: string | null;
} | {
    type: 'SELECT_ITEM';
    payload: FileItem;
} | {
    type: 'TOGGLE_SELECT';
    payload: FileItem;
} | {
    type: 'SELECT_ALL';
} | {
    type: 'CLEAR_SELECTION';
} | {
    type: 'SET_VIEW_MODE';
    payload: ViewMode;
} | {
    type: 'SET_CATEGORY';
    payload: FileCategory;
} | {
    type: 'SET_SORT';
    payload: SortConfig;
} | {
    type: 'SET_SEARCH';
    payload: string;
} | {
    type: 'SET_CLIPBOARD';
    payload: ClipboardState;
} | {
    type: 'CLEAR_CLIPBOARD';
} | {
    type: 'SET_MODAL';
    payload: ModalType;
} | {
    type: 'SET_PREVIEW_ITEM';
    payload: FileItem | null;
} | {
    type: 'SET_RENAME_ITEM';
    payload: FileItem | null;
} | {
    type: 'SET_UPLOAD_PROGRESS';
    payload: UploadProgress[];
} | {
    type: 'NAVIGATE_TO';
    payload: string;
} | {
    type: 'GO_BACK';
} | {
    type: 'GO_FORWARD';
} | {
    type: 'SET_SIDEBAR_FOLDERS';
    payload: FileItem[];
};

interface FileManagerProps {
    adapter: FileManagerAdapter;
    config?: FileManagerConfig;
}
declare function FileManager({ adapter, config }: FileManagerProps): React$1.JSX.Element;

interface FileManagerContextValue {
    state: FileManagerState;
    dispatch: React$1.Dispatch<FileManagerAction>;
    adapter: FileManagerAdapter;
    config: FileManagerConfig;
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
    clearUploadProgress: () => void;
    openPreview: (item: FileItem) => void;
    openRename: (item: FileItem) => void;
    saveFileContent: (path: string, content: string | Blob) => Promise<FileItem>;
}
interface FileManagerProviderProps {
    children: React$1.ReactNode;
    adapter: FileManagerAdapter;
    config?: FileManagerConfig;
}
declare function FileManagerProvider({ children, adapter, config, }: FileManagerProviderProps): React$1.JSX.Element;
declare function useFileManager(): FileManagerContextValue;

declare class RestAdapter implements FileManagerAdapter {
    private baseUrl;
    constructor(baseUrl?: string);
    listFiles(path: string): Promise<FileItem[]>;
    createFolder(path: string, name: string): Promise<FileItem>;
    deleteItems(targets: DeleteItemTarget[]): Promise<void>;
    renameItem(path: string, newName: string): Promise<FileItem>;
    moveItems(sourcePaths: string[], targetPath: string): Promise<void>;
    copyItems(sourcePaths: string[], targetPath: string): Promise<void>;
    uploadFiles(path: string, files: File[], onProgress?: (progress: UploadProgress[]) => void): Promise<FileItem[]>;
    downloadFile(path: string): Promise<Blob>;
    saveFileContent(path: string, content: string | Blob): Promise<FileItem>;
    getPreviewUrl(path: string): string;
    getDownloadUrl(path: string): string;
    search(path: string, query: string): Promise<FileItem[]>;
}

interface SupabaseAdapterConfig {
    url: string;
    anonKey: string;
    bucketName: string;
    /** Use a session-aware client (e.g. createBrowserClient) when provided */
    supabase?: SupabaseClient;
}
declare class SupabaseAdapter implements FileManagerAdapter {
    private supabase;
    private bucketName;
    constructor(config: SupabaseAdapterConfig);
    listFiles(path: string): Promise<FileItem[]>;
    createFolder(path: string, name: string): Promise<FileItem>;
    deleteItems(targets: DeleteItemTarget[]): Promise<void>;
    private deleteFolder;
    private collectFilePathsUnderPrefix;
    private normalizeObjectKey;
    private removeStorageObjects;
    renameItem(path: string, newName: string): Promise<FileItem>;
    moveItems(sourcePaths: string[], targetPath: string): Promise<void>;
    copyItems(sourcePaths: string[], targetPath: string): Promise<void>;
    uploadFiles(path: string, files: File[], onProgress?: (progress: UploadProgress[]) => void): Promise<FileItem[]>;
    downloadFile(path: string): Promise<Blob>;
    saveFileContent(path: string, content: string | Blob): Promise<FileItem>;
    getPreviewUrl(path: string): string;
    getDownloadUrl(path: string): string;
    search(path: string, query: string): Promise<FileItem[]>;
}

declare function formatFileSize(bytes: number): string;
declare function formatDate(dateString: string): string;
declare function getFileExtension(filename: string): string;
declare function isPreviewable(mimeType: string, name: string): boolean;

declare function sortFiles(files: FileItem[], config: SortConfig): FileItem[];
declare function filterFiles(files: FileItem[], query: string, hideSystemFiles?: boolean): FileItem[];

declare function getFileIcon(item: {
    isDirectory: boolean;
    mimeType: string;
    name: string;
}, size?: number): React$1.JSX.Element;

export { type ClipboardState, type ContextMenuItem, type ContextMenuPosition, type FileItem, FileManager, type FileManagerAdapter, type FileManagerConfig, FileManagerProvider, type ModalType, RestAdapter, type SortConfig, type SortField, type SortOrder, SupabaseAdapter, type SupabaseAdapterConfig, type ThemeMode, type UploadProgress, type ViewMode, filterFiles, formatDate, formatFileSize, getFileExtension, getFileIcon, isPreviewable, sortFiles, useFileManager };
