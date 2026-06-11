// ============================================
// SVG Icon Components - Zero Dependencies
// ============================================

import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
    color?: string;
}

const defaultProps: IconProps = {
    size: 20,
    color: 'currentColor',
};

export const FolderIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="rgba(251, 191, 36, 0.2)" stroke="rgb(251, 191, 36)" />
    </svg>
);

export const FolderOpenIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 19a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v1" fill="rgba(251, 191, 36, 0.2)" stroke="rgb(251, 191, 36)" />
        <path d="M20 12H8l-4 8h16l4-8z" fill="rgba(251, 191, 36, 0.15)" stroke="rgb(251, 191, 36)" />
    </svg>
);

export const FileIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = defaultProps.size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="rgb(59, 130, 246)" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="rgb(59, 130, 246)" />
        <polyline points="21 15 16 10 5 21" stroke="rgb(59, 130, 246)" />
    </svg>
);

export const VideoIcon: React.FC<IconProps> = ({ size = defaultProps.size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="rgb(239, 68, 68)" />
        <polygon points="10 8 16 12 10 16 10 8" fill="rgba(239, 68, 68, 0.3)" stroke="rgb(239, 68, 68)" />
    </svg>
);

export const AudioIcon: React.FC<IconProps> = ({ size = defaultProps.size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 18V5l12-2v13" stroke="rgb(168, 85, 247)" />
        <circle cx="6" cy="18" r="3" fill="rgba(168, 85, 247, 0.3)" stroke="rgb(168, 85, 247)" />
        <circle cx="18" cy="16" r="3" fill="rgba(168, 85, 247, 0.3)" stroke="rgb(168, 85, 247)" />
    </svg>
);

export const PdfIcon: React.FC<IconProps> = ({ size = defaultProps.size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="rgb(239, 68, 68)" />
        <polyline points="14 2 14 8 20 8" stroke="rgb(239, 68, 68)" />
        <text x="8" y="17" fontSize="7" fontWeight="bold" fill="rgb(239, 68, 68)" fontFamily="sans-serif">PDF</text>
    </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ size = defaultProps.size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="16 18 22 12 16 6" stroke="rgb(34, 197, 94)" />
        <polyline points="8 6 2 12 8 18" stroke="rgb(34, 197, 94)" />
    </svg>
);

export const ArchiveIcon: React.FC<IconProps> = ({ size = defaultProps.size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="21 8 21 21 3 21 3 8" stroke="rgb(245, 158, 11)" />
        <rect x="1" y="3" width="22" height="5" rx="1" fill="rgba(245, 158, 11, 0.2)" stroke="rgb(245, 158, 11)" />
        <line x1="10" y1="12" x2="14" y2="12" stroke="rgb(245, 158, 11)" />
    </svg>
);

export const ArrowBackIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

export const ArrowForwardIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
    </svg>
);

export const GridViewIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

export const ListViewIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

export const RenameIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

export const CutIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
);

export const PasteIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const NewFolderIcon: React.FC<IconProps> = ({ size = defaultProps.size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="rgba(251, 191, 36, 0.2)" stroke="rgb(251, 191, 36)" />
        <line x1="12" y1="11" x2="12" y2="17" stroke="rgb(251, 191, 36)" />
        <line x1="9" y1="14" x2="15" y2="14" stroke="rgb(251, 191, 36)" />
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

export const SortIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
    </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

export const MoreIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const EmptyIcon: React.FC<IconProps> = ({ size = 80, className }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
        <rect x="15" y="10" width="50" height="60" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
        <path d="M35 35 L45 45 M45 35 L35 45" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <text x="40" y="65" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.4">Empty</text>
    </svg>
);

// Helper: get icon by file type
export function getFileIcon(item: { isDirectory: boolean; mimeType: string; name: string }, size = 20) {
    if (item.isDirectory) return <FolderIcon size={size} />;

    const mime = item.mimeType || '';
    const ext = item.name.split('.').pop()?.toLowerCase() || '';

    if (mime.startsWith('image/')) return <ImageIcon size={size} />;
    if (mime.startsWith('video/')) return <VideoIcon size={size} />;
    if (mime.startsWith('audio/')) return <AudioIcon size={size} />;
    if (mime === 'application/pdf' || ext === 'pdf') return <PdfIcon size={size} />;
    if (
        ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'json', 'xml', 'yml', 'yaml', 'md', 'sh', 'bat', 'ps1'].includes(ext)
    ) return <CodeIcon size={size} />;
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return <ArchiveIcon size={size} />;

    return <FileIcon size={size} />;
}
