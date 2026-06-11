'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFileManager } from '@/context/FileManagerContext';
import { CloseIcon } from '@/components/Icons/Icons';
import stylesModule from './Modals.module.css';
import { modalClassNames } from './modalClassNames';

const styles = Object.keys(stylesModule).length > 0 ? stylesModule : modalClassNames;

export function InputModal() {
    const { state, closeModal, createFolder, renameItem } = useFileManager();
    const isRename = state.activeModal === 'rename';
    const item = state.renameItem;

    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isRename && item) {
            setValue(item.name);
        } else {
            setValue('');
        }
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 100);
    }, [isRename, item]);

    const validate = (name: string) => {
        if (!name.trim()) return 'Name cannot be empty';
        if (/[<>:"/\\|?*]/.test(name)) return 'Name contains invalid characters';
        return '';
    };

    const handleSubmit = async () => {
        const err = validate(value);
        if (err) {
            setError(err);
            return;
        }

        if (isRename && item) {
            await renameItem(item, value.trim());
        } else {
            await createFolder(value.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    };

    return (
        <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>
                        {isRename ? 'Rename' : 'New Folder'}
                    </span>
                    <button className={styles.closeBtn} onClick={closeModal}>
                        <CloseIcon size={18} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            {isRename ? 'New name' : 'Folder name'}
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            className={styles.input}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={isRename ? 'Enter new name' : 'Enter folder name'}
                        />
                        {error && (
                            <span style={{ color: 'var(--fm-danger)', fontSize: 'var(--fm-font-size-xs)' }}>
                                {error}
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btn} onClick={closeModal}>
                        Cancel
                    </button>
                    <button
                        className={styles.btnPrimary}
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                    >
                        {isRename ? 'Rename' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
