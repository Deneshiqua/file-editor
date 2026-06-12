// ============================================
// modern-fm-pro - Type Definitions
// ============================================

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'size' | 'type' | 'modifiedAt';
export type SortOrder = 'asc' | 'desc';
export type ThemeMode = 'light' | 'dark';
export type FileCategory = 'all' | 'documents' | 'images' | 'media' | 'other';

export interface FileItem {
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

export interface DeleteItemTarget {
  path: string;
  isDirectory: boolean;
}

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface ClipboardState {
  items: FileItem[];
  operation: 'cut' | 'copy' | null;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
  action?: () => void;
}

export interface FileManagerConfig {
  rootPath?: string;
  allowedExtensions?: string[];
  maxFileSize?: number; // in bytes
  maxUploadFiles?: number;
  viewMode?: ViewMode;
  theme?: ThemeMode;
  showSidebar?: boolean;
  showStatusBar?: boolean;
  showBreadcrumb?: boolean;
  showCategoryFilter?: boolean; // Show category filter buttons
  initialCategory?: FileCategory; // Initial category filter
  height?: string;
  width?: string;
  locale?: string;
  // Selection Mode (for file picker)
  selectionMode?: boolean;
  multiSelect?: boolean;
  onFileSelect?: (files: FileItem[]) => void;
  onClose?: () => void;
  // Hide system files (.folderkeep, .gitkeep, etc.)
  hideSystemFiles?: boolean;
  // Supabase Storage Configuration (Optional)
  supabase?: {
    url: string;
    anonKey: string;
    bucketName: string;
  };
}

// Backend Adapter Interface
export interface FileManagerAdapter {
  listFiles(path: string): Promise<FileItem[]>;
  createFolder(path: string, name: string): Promise<FileItem>;
  deleteItems(targets: DeleteItemTarget[]): Promise<void>;
  renameItem(path: string, newName: string): Promise<FileItem>;
  moveItems(sourcePaths: string[], targetPath: string): Promise<void>;
  copyItems(sourcePaths: string[], targetPath: string): Promise<void>;
  uploadFiles(
    path: string,
    files: File[],
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<FileItem[]>;
  downloadFile(path: string): Promise<Blob>;
  saveFileContent(path: string, content: string | Blob): Promise<FileItem>;
  getPreviewUrl(path: string): string;
  getDownloadUrl(path: string): string;
  search?(path: string, query: string): Promise<FileItem[]>;
}

// State types
export type ModalType = 'upload' | 'preview' | 'rename' | 'newFolder' | 'delete' | null;

export interface FileManagerState {
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

export type FileManagerAction =
  | { type: 'SET_PATH'; payload: string }
  | { type: 'SET_FILES'; payload: FileItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_ITEM'; payload: FileItem }
  | { type: 'TOGGLE_SELECT'; payload: FileItem }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_CATEGORY'; payload: FileCategory }
  | { type: 'SET_SORT'; payload: SortConfig }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CLIPBOARD'; payload: ClipboardState }
  | { type: 'CLEAR_CLIPBOARD' }
  | { type: 'SET_MODAL'; payload: ModalType }
  | { type: 'SET_PREVIEW_ITEM'; payload: FileItem | null }
  | { type: 'SET_RENAME_ITEM'; payload: FileItem | null }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: UploadProgress[] }
  | { type: 'NAVIGATE_TO'; payload: string }
  | { type: 'GO_BACK' }
  | { type: 'GO_FORWARD' }
  | { type: 'SET_SIDEBAR_FOLDERS'; payload: FileItem[] };
