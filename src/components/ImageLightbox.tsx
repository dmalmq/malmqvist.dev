import { useEffect, useState } from 'react';

export default function ImageLightbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState('');

    useEffect(() => {
        const handleOpen = (e: any) => {
            setImgSrc(e.detail?.src || '');
            setIsOpen(true);
            document.body.style.overflow = 'hidden';
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };

        window.addEventListener('open-lightbox', handleOpen);
        document.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('open-lightbox', handleOpen);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const close = () => {
        setIsOpen(false);
        setTimeout(() => setImgSrc(''), 300); // Wait for transition
        document.body.style.overflow = '';
    };

    if (!isOpen && !imgSrc) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg-primary)]/95 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={close}
            aria-modal="true"
            role="dialog"
        >
            <button
                onClick={close}
                className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                aria-label="Close fullscreen image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
            </button>

            <div className="w-full max-w-6xl max-h-[90vh] p-4 flex items-center justify-center transform transition-transform duration-300 scale-95 origin-center" style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }} onClick={e => e.stopPropagation()}>
                {imgSrc && (
                    <img
                        src={imgSrc}
                        alt="Fullscreen view"
                        className="max-w-full max-h-[85vh] object-contain rounded-[4px] shadow-2xl border border-[var(--color-border)]"
                    />
                )}
            </div>
        </div>
    );
}
