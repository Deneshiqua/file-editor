'use client';

import type { FileCategory, FileItem, FileManagerAdapter } from '@/types';
import React, { useState } from 'react';

import { DemoNav } from '@/components/DemoNav/DemoNav';
import { FileManager } from '@/components/FileManager/FileManager';
import { RestAdapter } from '@/adapters/RestAdapter';
import { SupabaseAdapter } from '@/adapters/SupabaseAdapter';
import styles from './page.module.css';

const adapter: FileManagerAdapter = (() => {
    const adapterType = process.env.NEXT_PUBLIC_FILE_MANAGER_TYPE || 'local';

    if (adapterType === 'supabase') {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'file-manager';

        if (supabaseUrl && supabaseKey) {
            return new SupabaseAdapter({
                url: supabaseUrl,
                anonKey: supabaseKey,
                bucketName: bucketName,
            });
        }
    }

    return new RestAdapter('/api/files');
})();

export default function FormDemoPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
    const [showFileManager, setShowFileManager] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<FileCategory>('all');

    const categories: Array<{ id: FileCategory; label: string; icon: string }> = [
        { id: 'all', label: 'All Files', icon: '📁' },
        { id: 'documents', label: 'Documents', icon: '📄' },
        { id: 'images', label: 'Images', icon: '🖼️' },
        { id: 'media', label: 'Media', icon: '🎵' },
        { id: 'other', label: 'Other', icon: '📦' },
    ];

    const handleFileSelect = (files: FileItem[]) => {
        // Sadece dosyaları al, klasörleri filtrele
        const onlyFiles = files.filter(f => !f.isDirectory);
        setSelectedFiles(onlyFiles);
        setShowFileManager(false);
    };

    const openFileManager = (category: FileCategory) => {
        setSelectedCategory(category);
        setShowFileManager(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Form Data:', formData);
        console.log('Selected Files:', selectedFiles);

        alert(`Form submitted!\n\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}\nFiles: ${selectedFiles.length} file(s) selected`);
    };

    const removeFile = (fileId: string) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    return (
        <div className={styles.container}>
            <DemoNav />
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Form Integration Demo</h1>
                    <p className={styles.subtitle}>
                        File Manager&apos;i formlarda file-picker olarak kullanma ornegi
                    </p>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.formCard}>
                    <h2 className={styles.cardTitle}>Contact Form</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="name">
                                Name <span className={styles.required}>*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={styles.input}
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="email">
                                Email <span className={styles.required}>*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="message">
                                Message
                            </label>
                            <textarea
                                id="message"
                                className={styles.textarea}
                                placeholder="Enter your message..."
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Attachments
                            </label>
                            <div className={styles.categoryButtons}>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={styles.categoryBtn}
                                        onClick={() => openFileManager(cat.id)}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className={styles.fileList}>
                                    {selectedFiles.map((file) => (
                                        <div key={file.id} className={styles.fileItem}>
                                            <span className={styles.fileName}>
                                                📄 {file.name}
                                            </span>
                                            <button
                                                type="button"
                                                className={styles.removeBtn}
                                                onClick={() => removeFile(file.id)}
                                                title="Remove file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitBtn}>
                                Submit Form
                            </button>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setFormData({ name: '', email: '', message: '' });
                                    setSelectedFiles([]);
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>

                <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>💡 How It Works</h3>
                    <ul className={styles.infoList}>
                        <li>Click &ldquo;Select Files from Manager&rdquo; button</li>
                        <li>File Manager opens in selection mode</li>
                        <li>Select one or multiple files</li>
                        <li>Click &ldquo;Select&rdquo; button to confirm</li>
                        <li>Selected files appear in the form</li>
                        <li>Submit the form with attachments</li>
                    </ul>

                    <div className={styles.codeExample}>
                        <h4 className={styles.codeTitle}>Usage Example:</h4>
                        <pre className={styles.code}>
                            {`<FileManager
  adapter={adapter}
  config={{
    selectionMode: true,
    multiSelect: true,
    onFileSelect: (files) => {
      setSelectedFiles(files);
    }
  }}
/>`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* File Manager Modal */}
            {showFileManager && (
                <div className={styles.modal}>
                    <div className={styles.modalOverlay} onClick={() => setShowFileManager(false)} />
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Select Files</h2>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowFileManager(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <FileManager
                                adapter={adapter}
                                config={{
                                    theme: 'dark',
                                    viewMode: 'grid',
                                    showSidebar: true,
                                    showStatusBar: true,
                                    initialCategory: selectedCategory,
                                    showBreadcrumb: true,
                                    height: '600px',
                                    selectionMode: true,
                                    multiSelect: true,
                                    onFileSelect: handleFileSelect,
                                    hideSystemFiles: true,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
