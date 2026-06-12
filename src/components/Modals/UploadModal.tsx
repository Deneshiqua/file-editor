'use client';

import { CloseIcon, UploadIcon } from '@/components/Icons/Icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fileMatchesCategory, formatFileSize, getAcceptForCategory } from '@/utils/helpers';

import { getFileIcon } from '@/components/Icons/Icons';
import { modalClassNames } from './modalClassNames';
import stylesModule from './Modals.module.css';
import { useFileManager } from '@/context/FileManagerContext';

const styles = Object.keys(stylesModule).length > 0 ? stylesModule : modalClassNames;

export function UploadModal() {
    const { state, config, uploadFiles, closeModal, clearUploadProgress } = useFileManager();
    const [files, setFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isUploading = state.uploadProgress.some((p) => p.status === 'uploading');
    const hasUploadError = state.uploadProgress.some((p) => p.status === 'error');

    useEffect(() => {
        return () => {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
    }, []);

    const handleClose = () => {
        setFiles([]);
        setRejectedFiles([]);
        setIsDragOver(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        closeModal();
    };

    const category = config.initialCategory || 'all';
    const acceptAttribute = getAcceptForCategory(category);
    const hasRestriction = category !== 'all';

    const filterFilesByCategory = (fileList: File[]): File[] => {
        if (!hasRestriction) return fileList;

        const accepted: File[] = [];
        const rejected: string[] = [];

        fileList.forEach(file => {
            if (fileMatchesCategory(file.name, category)) {
                accepted.push(file);
            } else {
                rejected.push(file.name);
            }
        });

        if (rejected.length > 0) {
            setRejectedFiles(prev => [...prev, ...rejected]);
            // Clear rejected files message after 5 seconds
            setTimeout(() => setRejectedFiles([]), 5000);
        }

        return accepted;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        clearUploadProgress();
        const droppedFiles = Array.from(e.dataTransfer.files);
        const filteredFiles = filterFilesByCategory(droppedFiles);
        setFiles((prev) => [...prev, ...filteredFiles]);
    }, [hasRestriction, category, clearUploadProgress]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearUploadProgress();
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const filteredFiles = filterFilesByCategory(selectedFiles);
            setFiles((prev) => [...prev, ...filteredFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0 || hasUploadError) return;
        await uploadFiles(files);
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>Upload Files</span>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        <CloseIcon size={18} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div
                        className={isDragOver ? styles.dropZoneActive : styles.dropZone}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className={styles.dropZoneIcon}>
                            <UploadIcon size={40} />
                        </div>
                        <div className={styles.dropZoneText}>
                            Drag & drop files here
                        </div>
                        <div className={styles.dropZoneSubtext}>
                            or <span className={styles.dropZoneBrowse}>browse</span> to select files
                            {hasRestriction && (
                                <div style={{ marginTop: '8px', fontSize: '0.85em', color: '#fbbf24' }}>
                                    Only {category} files allowed
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={acceptAttribute}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                    </div>

                    {rejectedFiles.length > 0 && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            marginTop: '12px',
                            fontSize: '0.875rem',
                            color: '#fca5a5'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                                ❌ Rejected files (invalid type):
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {rejectedFiles.map((fileName, idx) => (
                                    <li key={idx}>{fileName}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(files.length > 0 || state.uploadProgress.length > 0) && (
                        <div className={styles.fileQueue}>
                            {state.uploadProgress.length > 0
                                ? state.uploadProgress.map((p, idx) => (
                                    <div key={idx} className={styles.fileQueueItem}>
                                        {getFileIcon({ isDirectory: false, mimeType: p.file.type, name: p.file.name }, 20)}
                                        <div className={styles.fileQueueInfo}>
                                            <div className={styles.fileQueueName}>{p.file.name}</div>
                                            <div className={styles.fileQueueSize}>{formatFileSize(p.file.size)}</div>
                                            {p.status === 'error' && p.error && (
                                                <div className={styles.fileQueueError}>{p.error}</div>
                                            )}
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={
                                                        p.status === 'success'
                                                            ? styles.progressFillSuccess
                                                            : p.status === 'error'
                                                                ? styles.progressFillError
                                                                : styles.progressFill
                                                    }
                                                    style={{ width: `${p.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className={styles.statusIcon}>
                                            {p.status === 'success' ? '✓' : p.status === 'error' ? '✕' : ''}
                                        </span>
                                        {p.status === 'error' && (
                                            <button
                                                className={styles.fileQueueRemove}
                                                onClick={clearUploadProgress}
                                                title="Dismiss error"
                                            >
                                                <CloseIcon size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                                : files.map((file, idx) => (
                                    <div key={idx} className={styles.fileQueueItem}>
                                        {getFileIcon({ isDirectory: false, mimeType: file.type, name: file.name }, 20)}
                                        <div className={styles.fileQueueInfo}>
                                            <div className={styles.fileQueueName}>{file.name}</div>
                                            <div className={styles.fileQueueSize}>{formatFileSize(file.size)}</div>
                                        </div>
                                        <button
                                            className={styles.fileQueueRemove}
                                            onClick={() => removeFile(idx)}
                                        >
                                            <CloseIcon size={14} />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btn} onClick={handleClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.btnPrimary}
                        onClick={handleUpload}
                        disabled={files.length === 0 || isUploading || hasUploadError}
                    >
                        <UploadIcon size={16} />
                        {isUploading ? 'Uploading...' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}