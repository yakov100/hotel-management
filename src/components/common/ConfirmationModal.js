import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'האם אתה בטוח?',
    message = '',
    confirmText = 'אישור',
    cancelText = 'ביטול',
    confirmVariant = 'primary',
    icon = null,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="flex flex-col items-center text-center">
                {icon ? (
                    <div className="mb-4 text-4xl">{icon}</div>
                ) : (
                    <div className="mb-4 text-4xl text-accent-400">
                        <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                        </svg>
                    </div>
                )}
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                {message && <p className="text-gray-600 mb-6 text-base">{message}</p>}
                <div className="flex gap-3 w-full justify-center">
                    <Button variant={confirmVariant} onClick={onConfirm} className="flex-1">
                        {confirmText}
                    </Button>
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        {cancelText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
} 