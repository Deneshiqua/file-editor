'use client';

import { CloseIcon, DownloadIcon } from '@/components/Icons/Icons';
import Editor, { useMonaco } from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import { formatDate, formatFileSize, getFileExtension } from '@/utils/helpers';

import dynamic from 'next/dynamic';
import stylesModule from './Modals.module.css';
import { useFileManager } from '@/context/FileManagerContext';
import { modalClassNames } from './modalClassNames';

const styles = Object.keys(stylesModule).length > 0 ? stylesModule : modalClassNames;

const filerobotGlobalScope = globalThis as typeof globalThis & {
    React?: typeof React;
};

filerobotGlobalScope.React = React;

// Dynamically import FilerobotImageEditor to avoid SSR issues with canvas
const FilerobotImageEditor = dynamic(
    () => import('react-filerobot-image-editor'),
    { ssr: false }
);

// Get appropriate Monaco language from extension
function getMonacoLanguage(ext: string): string {
    const map: Record<string, string> = {
        'js': 'javascript', 'jsx': 'javascript',
        'ts': 'typescript', 'tsx': 'typescript',
        'json': 'json', 'html': 'html', 'css': 'css',
        'md': 'markdown', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
        'py': 'python', 'java': 'java', 'c': 'c', 'cpp': 'cpp', 'h': 'cpp',
        'sh': 'shell', 'sql': 'sql', 'php': 'php', 'rb': 'ruby', 'go': 'go'
    };
    return map[ext.toLowerCase()] || 'plaintext';
}

export function PreviewModal() {
    const { state, dispatch, closeModal, adapter, config, downloadFile, saveFileContent } = useFileManager();
    const item = state.previewItem;

    // Editor States
    const [textContent, setTextContent] = useState<string | null>(null);
    const [originalText, setOriginalText] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filepond/Filerobot reference
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);

    // Rename/SaveAs State
    const [isSaveAs, setIsSaveAs] = useState(false);
    const [saveAsName, setSaveAsName] = useState('');
    const [previewVersion, setPreviewVersion] = useState(0);

    useEffect(() => {
        if (!isImageEditorOpen) {
            return;
        }

        const originalConsoleError = console.error;

        console.error = (...args: unknown[]) => {
            const message = args
                .map((arg) => {
                    if (typeof arg === 'string') {
                        return arg;
                    }

                    return String(arg);
                })
                .join(' ');

            const isInvalidPropWarning =
                message.includes('React does not recognize the') ||
                message.includes('non-boolean attribute');

            if (isInvalidPropWarning) {
                return;
            }

            originalConsoleError(...args);
        };

        return () => {
            console.error = originalConsoleError;
        };
    }, [isImageEditorOpen]);

    useEffect(() => {
        if (!item) return;

        const ext = getFileExtension(item.name);
        const textExts = ['txt', 'md', 'json', 'xml', 'csv', 'log', 'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'py', 'java', 'cpp', 'c', 'h', 'sh', 'yml', 'yaml'];

        if (textExts.includes(ext)) {
            adapter
                .downloadFile(item.path)
                .then((blob) => blob.text())
                .then(text => {
                    setTextContent(text);
                    setOriginalText(text);
                })
                .catch(() => setTextContent('Failed to load file content'));
        }

        setSaveAsName(item.name);
    }, [item, adapter]);

    if (!item) return null;

    const editorTheme = config.theme === 'light'
        ? {
            palette: {
                'bg-primary': '#ffffff',
                'bg-secondary': '#f8fafc',
                'bg-hover': '#f1f5f9',
                'bg-primary-light': '#eef2ff',
                'bg-primary-hover': '#eef2ff',
                'bg-primary-active': '#e8f0ff',
                'bg-primary-stateless': '#cbd5e1',
                'bg-stateless': '#ffffff',
                'bg-active': '#eef2ff',
                'bg-tooltip': '#0f172a',
                'txt-primary': '#111827',
                'txt-placeholder': '#64748b',
                'txt-secondary': '#475569',
                'icon-primary': '#334155',
                'icons-primary-hover': '#4f46e5',
                'icons-secondary': '#64748b',
                'icons-secondary-hover': '#475569',
                'icons-muted': '#94a3b8',
                'icons-invert': '#ffffff',
                'btn-primary-text': '#ffffff',
                'btn-disabled-text': '#94a3b8',
                'link-stateless': '#4f46e5',
                'link-hover': '#4338ca',
                'link-active': '#3730a3',
                'borders-primary': '#dbe3ef',
                'borders-primary-hover': '#94a3b8',
                'borders-secondary': '#dbe3ef',
                'borders-button': '#cbd5e1',
                'borders-item': '#cbd5e1',
                'borders-base-light': '#e0e7ff',
                'borders-base-medium': '#c7d2fe',
                'border-primary-stateless': '#cbd5e1',
                'accent-primary': '#4f46e5',
                'accent-primary-hover': '#4338ca',
                'accent-primary-active': '#4338ca',
                'accent-primary-disabled': '#a5b4fc',
                'accent-stateless': '#4f46e5',
                'active-secondary': '#ffffff',
                'active-secondary-hover': 'rgba(79, 70, 229, 0.08)',
                'light-shadow': 'rgba(15, 23, 42, 0.12)',
                'medium-shadow': 'rgba(15, 23, 42, 0.18)',
                'large-shadow': 'rgba(15, 23, 42, 0.24)',
                'x-large-shadow': 'rgba(15, 23, 42, 0.35)',
            },
            typography: {
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            },
        }
        : {
            palette: {
                'bg-primary': '#0f172a',
                'bg-secondary': '#111827',
                'bg-hover': '#1f2937',
                'bg-primary-light': '#1e293b',
                'bg-primary-hover': '#253044',
                'bg-primary-active': '#1e293b',
                'bg-primary-stateless': '#334155',
                'bg-stateless': '#1f2937',
                'bg-active': '#312e81',
                'bg-tooltip': '#020617',
                'txt-primary': '#e5e7eb',
                'txt-placeholder': '#94a3b8',
                'txt-secondary': '#cbd5e1',
                'icon-primary': '#e2e8f0',
                'icons-primary-hover': '#c7d2fe',
                'icons-secondary': '#94a3b8',
                'icons-secondary-hover': '#e2e8f0',
                'icons-muted': '#64748b',
                'icons-invert': '#ffffff',
                'btn-primary-text': '#ffffff',
                'btn-disabled-text': '#64748b',
                'link-stateless': '#a5b4fc',
                'link-hover': '#c7d2fe',
                'link-active': '#e0e7ff',
                'borders-primary': '#334155',
                'borders-primary-hover': '#475569',
                'borders-secondary': '#243041',
                'borders-button': '#475569',
                'borders-item': '#334155',
                'borders-base-light': '#312e81',
                'borders-base-medium': '#4338ca',
                'border-primary-stateless': '#334155',
                'accent-primary': '#818cf8',
                'accent-primary-hover': '#6366f1',
                'accent-primary-active': '#a5b4fc',
                'accent-primary-disabled': '#4f46e5',
                'accent-stateless': '#818cf8',
                'active-secondary': '#ffffff',
                'active-secondary-hover': 'rgba(165, 180, 252, 0.08)',
                'light-shadow': 'rgba(0, 0, 0, 0.45)',
                'medium-shadow': 'rgba(0, 0, 0, 0.55)',
                'large-shadow': 'rgba(0, 0, 0, 0.65)',
                'x-large-shadow': 'rgba(0, 0, 0, 0.78)',
            },
            typography: {
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            },
        };

    const rawPreviewUrl = adapter.getPreviewUrl(item.path);
    const previewUrl = `${rawPreviewUrl}${rawPreviewUrl.includes('?') ? '&' : '?'}v=${previewVersion}`;
    const ext = getFileExtension(item.name);
    const isImage = item.mimeType?.startsWith('image/');
    const isVideo = item.mimeType?.startsWith('video/');
    const isAudio = item.mimeType?.startsWith('audio/');
    const isPdf = item.mimeType === 'application/pdf' || ext === 'pdf';

    const isText = textContent !== null;
    const isDirty = originalText !== null && textContent !== originalText;

    // Save Handlers
    const handleSaveText = async () => {
        if (!textContent || isSaving) return;

        // Onay al
        const confirmed = window.confirm(
            `Are you sure you want to save changes to "${item.name}"?\n\nThis will overwrite the existing file.`
        );
        if (!confirmed) return;

        setIsSaving(true);
        try {
            await saveFileContent(item.path, textContent);
            setOriginalText(textContent);
            setIsSaveAs(false);
        } catch (error) {
            console.error("Save failed", error);
            alert('Failed to save file. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAsText = async () => {
        if (!textContent || isSaving || !saveAsName) return;
        setIsSaving(true);
        try {
            // Determine parent path
            const parentPath = item.path.substring(0, item.path.lastIndexOf(item.name));
            const newPath = parentPath + saveAsName;
            await saveFileContent(newPath, textContent);
            setIsSaveAs(false);
            closeModal();
        } catch (error) {
            console.error("Save As failed", error);
            alert('Failed to save file. Please try again.');
            setIsSaving(false);
        }
    };

    const handleSaveImage = async (editedImageObject: any) => {
        // If not "Save As", confirm overwrite
        if (!isSaveAs) {
            const confirmed = window.confirm(
                `Are you sure you want to save changes to "${item.name}"?\n\nThis will overwrite the existing image.`
            );
            if (!confirmed) {
                setIsImageEditorOpen(false);
                return;
            }
        }

        setIsSaving(true);
        try {
            const { imageBase64, imageCanvas, mimeType } = editedImageObject ?? {};

            let blob: Blob;

            if (imageBase64) {
                const res = await fetch(imageBase64);
                blob = await res.blob();
            } else if (imageCanvas instanceof HTMLCanvasElement) {
                blob = await new Promise<Blob>((resolve, reject) => {
                    imageCanvas.toBlob(
                        (canvasBlob) => {
                            if (canvasBlob) {
                                resolve(canvasBlob);
                                return;
                            }

                            reject(new Error('Failed to generate image blob from canvas'));
                        },
                        mimeType || item.mimeType || 'image/png'
                    );
                });
            } else {
                throw new Error('No editable image data returned from the editor');
            }

            // If it's a "Save As" operation
            if (isSaveAs && saveAsName) {
                const parentPath = item.path.substring(0, item.path.lastIndexOf(item.name));
                const newPath = parentPath + saveAsName;
                await saveFileContent(newPath, blob);
                setIsSaveAs(false);
                closeModal();
            } else {
                const savedItem = await saveFileContent(item.path, blob);
                dispatch({ type: 'SET_PREVIEW_ITEM', payload: savedItem });
                setPreviewVersion((prev) => prev + 1);
                setIsSaveAs(false);
                setIsImageEditorOpen(false);
            }
        } catch (error) {
            console.error("Failed to save image", error);
            alert('Failed to save image. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onMouseDown={(e) => {
            // Only close if clicking the actual overlay, not Filerobot which renders portals
            if (e.target === e.currentTarget && !isImageEditorOpen) closeModal();
        }}>
            <div
                className={`${styles.modalLarge} ${isImageEditorOpen ? styles.modalEditor : ''}`}
                onClick={(e) => e.stopPropagation()}
            >

                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>
                        {isImageEditorOpen ? `Editing: ${item.name}` : `${item.name} ${isDirty ? '*' : ''}`}
                    </span>
                    <button
                        className={styles.closeBtn}
                        onClick={isImageEditorOpen ? () => setIsImageEditorOpen(false) : closeModal}
                        title={isImageEditorOpen ? 'Back to preview' : 'Close'}
                    >
                        <CloseIcon size={18} />
                    </button>
                </div>

                <div
                    className={`${styles.modalBody} ${isImageEditorOpen ? styles.modalBodyEditor : ''}`}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >

                    {isSaveAs && !isImageEditorOpen && (
                        <div className={styles.inputGroup} style={{ marginBottom: 16 }}>
                            <label className={styles.inputLabel}>Save As Name:</label>
                            <input
                                autoFocus
                                className={styles.input}
                                value={saveAsName}
                                onChange={(e) => setSaveAsName(e.target.value)}
                            />
                        </div>
                    )}

                    <div
                        className={`${styles.previewContainer} ${isImageEditorOpen ? styles.previewContainerEditor : ''}`}
                        style={{ flex: 1, minHeight: isImageEditorOpen ? '100%' : 400 }}
                    >
                        {isImage && !isImageEditorOpen && (
                            <div className={styles.imagePreviewWrapper}>
                                <img
                                    src={previewUrl}
                                    alt={item.name}
                                    className={styles.previewImage}
                                />
                            </div>
                        )}

                        {isImageEditorOpen && (
                            <div data-fm-filerobot-editor="true">
                                <FilerobotImageEditor
                                    source={previewUrl}
                                    theme={editorTheme}
                                    onSave={handleSaveImage}
                                    onClose={() => {
                                        setIsImageEditorOpen(false);
                                        setIsSaveAs(false);
                                    }}
                                    closeAfterSave={true}
                                    annotationsCommon={{
                                        fill: '#ff0000',
                                    }}
                                    Text={{ text: 'Add Text' }}
                                    savingPixelRatio={1}
                                    previewPixelRatio={1}
                                    defaultSavedImageName={isSaveAs ? saveAsName : item.name}
                                />
                            </div>
                        )}

                        {isVideo && (
                            <video src={previewUrl} controls className={styles.previewVideo} />
                        )}
                        {isAudio && (
                            <audio src={previewUrl} controls className={styles.previewAudio} />
                        )}
                        {isPdf && (
                            <iframe src={previewUrl} className={styles.previewIframe} title={item.name} />
                        )}
                        {isText && (
                            <div className={styles.editorWrapper} style={{ width: '100%', height: '500px', border: '1px solid var(--fm-border)' }}>
                                <Editor
                                    height="100%"
                                    defaultLanguage={getMonacoLanguage(ext)}
                                    theme='vs-dark'
                                    value={textContent}
                                    onChange={(val) => setTextContent(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        wordWrap: 'on'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Metadata Section (hidden while image editing or if doing save as) */}
                    {!isImageEditorOpen && !isSaveAs && (
                        <div className={styles.previewInfo} style={{ marginTop: 16 }}>
                            <span className={styles.previewInfoLabel}>Size</span>
                            <span className={styles.previewInfoValue}>{formatFileSize(item.size)}</span>
                            <span className={styles.previewInfoLabel}>Path</span>
                            <span className={styles.previewInfoValue}>{item.path}</span>
                            <span className={styles.previewInfoLabel}>Modified</span>
                            <span className={styles.previewInfoValue}>{formatDate(item.modifiedAt)}</span>
                        </div>
                    )}
                </div>

                {!isImageEditorOpen && (
                    <div className={styles.modalFooter}>

                        {/* Editor Controls */}
                        {isText && !isSaveAs && (
                            <>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={handleSaveText}
                                    disabled={!isDirty || isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button className={styles.btn} onClick={() => {
                                    setSaveAsName(item.name);
                                    setIsSaveAs(true);
                                }}>
                                    Save As...
                                </button>
                            </>
                        )}

                        {isImage && !isSaveAs && (
                            <>
                                <button className={styles.btnPrimary} onClick={() => setIsImageEditorOpen(true)}>
                                    Edit Image
                                </button>
                                <button className={styles.btn} onClick={() => {
                                    setSaveAsName(item.name);
                                    setIsSaveAs(true);
                                }}>
                                    Save As...
                                </button>
                            </>
                        )}

                        {/* Save As Controls */}
                        {isSaveAs && (
                            <>
                                <button className={styles.btn} onClick={() => setIsSaveAs(false)}>
                                    Cancel
                                </button>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={isText ? handleSaveAsText : () => setIsImageEditorOpen(true)}
                                    disabled={isSaving || !saveAsName}
                                >
                                    {isText ? 'Confirm Save As' : 'Edit & Save As'}
                                </button>
                            </>
                        )}

                        <div style={{ flex: 1 }}></div>

                        <button className={styles.btn} onClick={closeModal}>
                            Close
                        </button>
                        {!isSaveAs && (
                            <button
                                className={styles.btnPrimary}
                                onClick={() => downloadFile(item)}
                            >
                                <DownloadIcon size={16} />
                                Download
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
