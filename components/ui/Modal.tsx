
import React, { useEffect, useRef } from 'react';
import { CloseIcon } from './Icons';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './Card';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    'aria-labelledby': string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className, ...props }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog) {
            if (isOpen) {
                dialog.showModal();
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
                
                // Move focus to first focusable element
                const firstFocusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
                if (firstFocusable) firstFocusable.focus();
                
            } else {
                dialog.close();
                document.body.style.overflow = '';
            }
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const dialog = dialogRef.current;
        dialog?.addEventListener('keydown', handleKeyDown);

        return () => {
            dialog?.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        if (event.target === dialogRef.current) {
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClick={handleBackdropClick}
            onClose={onClose}
            className="p-0 bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm rounded-lg shadow-xl max-w-lg w-full m-auto"
            aria-modal="true"
            {...props}
        >
            <div className="w-full h-full flex items-center justify-center p-4">
                <Card className={`w-full animate-fadeIn max-h-[90vh] overflow-y-auto ${className}`}>{children}</Card>
            </div>
        </dialog>
    );
};

const ModalHeader: React.FC<{ children: React.ReactNode; onClose: () => void; id: string }> = ({
    children,
    onClose,
    id,
}) => (
    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-2">
        <CardTitle id={id}>{children}</CardTitle>
        <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
            autoFocus
        >
            <CloseIcon className="w-5 h-5" />
        </button>
    </CardHeader>
);

const ModalContent = CardContent;
const ModalFooter = CardFooter;

export { Modal, ModalHeader, ModalContent, ModalFooter };
