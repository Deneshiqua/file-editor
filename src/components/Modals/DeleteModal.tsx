'use client';

import React from 'react';
import { useFileManager } from '@/context/FileManagerContext';
import { CloseIcon, DeleteIcon } from '@/components/Icons/Icons';
import { getFileIcon } from '@/components/Icons/Icons';
import stylesModule from './Modals.module.css';
import { modalClassNames } from './modalClassNames';

const styles = Object.keys(stylesModule).length > 0 ? stylesModule : modalClassNames;

export function DeleteModal() {
    const { state, closeModal, deleteItems } = useFileManager();
    const items = state.selectedItems;

    if (items.length === 0) return null;

    const handleDelete = async () => {
        await deleteItems();
    };

    return (
        <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>Delete Confirmation</span>
                    <button className={styles.closeBtn} onClick={closeModal}>
                        <CloseIcon size={18} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.deleteMessage}>
                        Are you sure you want to delete {items.length === 1 ? 'this item' : `these ${items.length} items`}?
                        This action cannot be undone.
                    </div>
                    <div className={styles.deleteList}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.deleteListItem}>
                                {getFileIcon(item, 16)}
                                <span>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btn} onClick={closeModal}>
                        Cancel
                    </button>
                    <button className={styles.btnDanger} onClick={handleDelete}>
                        <DeleteIcon size={16} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
