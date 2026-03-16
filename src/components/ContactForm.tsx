import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './animation/MagneticButton';

export default function ContactForm({ lang = 'en' }: { lang?: 'en' | 'ja' }) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [focused, setFocused] = useState<Record<string, boolean>>({});
    const [filled, setFilled] = useState<Record<string, boolean>>({});

    const labelClass = "ui-field-label";
    const fieldClass = "ui-control";
    const buttonClass = "inline-flex w-full items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-8 py-4 text-sm font-semibold tracking-[0.02em] text-[var(--color-primary-foreground)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] disabled:opacity-70 disabled:hover:translate-y-0";

    const texts = {
        en: {
            name: "Name",
            email: "Email",
            subject: "Subject",
            subjects: {
                inquiry: "Job Inquiry",
                collab: "Collaboration",
                general: "General"
            },
            message: "Message",
            send: "Send Message",
            sending: "Sending...",
            success: "Message sent successfully. I'll get back to you soon.",
            error: "Something went wrong. Please try again or email me directly."
        },
        ja: {
            name: "お名前",
            email: "メールアドレス",
            subject: "件名",
            subjects: {
                inquiry: "仕事のご相談",
                collab: "コラボレーション",
                general: "その他のお問い合わせ"
            },
            message: "メッセージ",
            send: "送信する",
            sending: "送信中...",
            success: "メッセージを送信しました。折り返しご連絡いたします。",
            error: "エラーが発生しました。もう一度お試しいただくか、直接メールでご連絡ください。"
        }
    };

    const t = texts[lang];

    const handleFocus = (field: string) => setFocused(p => ({ ...p, [field]: true }));
    const handleBlur = (field: string, value: string) => {
        setFocused(p => ({ ...p, [field]: false }));
        setFilled(p => ({ ...p, [field]: value.length > 0 }));
    };

    const isFloating = (field: string) => focused[field] || filled[field];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        if (data.bot_field) {
            setStatus('success');
            return;
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative rounded-[1.5rem] border border-[var(--color-success)] bg-[var(--color-bg-secondary)] p-8 text-center shadow-[0_24px_64px_-46px_rgba(86,148,159,0.4)] overflow-hidden"
                aria-live="polite"
            >
                {/* Success burst dots */}
                {[...Array(8)].map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * 60;
                    const y = Math.sin(angle) * 60;
                    return (
                        <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                            style={{
                                background: `var(--color-${['pine', 'iris', 'foam', 'love', 'gold', 'pine', 'iris', 'foam'][i]})`,
                            }}
                            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                            animate={{ x, y, scale: 0, opacity: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                        />
                    );
                })}
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                <p className="text-lg font-medium text-[var(--color-text-heading)]">{t.success}</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6" aria-live="polite">
            <input type="text" name="bot_field" className="hidden" aria-hidden="true" tabIndex={-1} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['name', 'email'] as const).map((field, i) => (
                    <motion.div
                        key={field}
                        className="relative space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                        <label
                            htmlFor={field}
                            className={`${labelClass} transition-colors duration-200 ${isFloating(field) ? 'text-[var(--color-accent)]' : ''}`}
                        >
                            {field === 'name' ? t.name : t.email}
                        </label>
                        <input
                            type={field === 'email' ? 'email' : 'text'}
                            id={field}
                            name={field}
                            required
                            readOnly={status === 'submitting'}
                            className={fieldClass}
                            onFocus={() => handleFocus(field)}
                            onBlur={(e) => handleBlur(field, e.target.value)}
                        />
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <label htmlFor="subject" className={labelClass}>{t.subject}</label>
                <div className="relative">
                    <select
                        id="subject"
                        name="subject"
                        required
                        disabled={status === 'submitting'}
                        className={`${fieldClass} appearance-none pr-12`}
                    >
                        <option value="inquiry">{t.subjects.inquiry}</option>
                        <option value="collab">{t.subjects.collab}</option>
                        <option value="general">{t.subjects.general}</option>
                    </select>
                    <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </motion.div>

            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <label
                    htmlFor="message"
                    className={`${labelClass} transition-colors duration-200 ${isFloating('message') ? 'text-[var(--color-accent)]' : ''}`}
                >
                    {t.message}
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    readOnly={status === 'submitting'}
                    className={`${fieldClass} min-h-[11rem] resize-y`}
                    onFocus={() => handleFocus('message')}
                    onBlur={(e) => handleBlur('message', e.target.value)}
                ></textarea>
            </motion.div>

            <AnimatePresence>
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-[1rem] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-4 text-sm font-medium text-[var(--color-error)] shadow-[0_18px_52px_-42px_rgba(180,99,122,0.45)]"
                    >
                        {t.error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <MagneticButton className="w-full">
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className={buttonClass}
                    >
                        {status === 'submitting' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t.sending}
                            </>
                        ) : t.send}
                    </button>
                </MagneticButton>
            </motion.div>
        </form>
    );
}
