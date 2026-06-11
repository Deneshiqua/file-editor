// ============================================
// modern-fm-pro - Package Exports
// ============================================

// Main component
export { FileManager } from './components/FileManager/FileManager';

// Context & Hook
export { FileManagerProvider, useFileManager } from './context/FileManagerContext';

// Adapter
export { RestAdapter } from './adapters/RestAdapter';
export { SupabaseAdapter } from './adapters/SupabaseAdapter';
export type { SupabaseAdapterConfig } from './adapters/SupabaseAdapter';

// Types
export type {
    FileItem,
    FileManagerConfig,
    FileManagerAdapter,
    ViewMode,
    SortField,
    SortOrder,
    SortConfig,
    ThemeMode,
    ClipboardState,
    UploadProgress,
    ContextMenuPosition,
    ContextMenuItem,
    ModalType,
} from './types';

// Utilities
export { formatFileSize, formatDate, getFileExtension, isPreviewable, sortFiles, filterFiles } from './utils/helpers';

// Icons
export { getFileIcon } from './components/Icons/Icons';
