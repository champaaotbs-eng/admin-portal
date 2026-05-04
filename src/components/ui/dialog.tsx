import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface DialogProps {
    open: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
}

export const Dialog = ({ open, onClose, title, children, className }: DialogProps) => {
    const { t } = useTranslation()
    const onCloseRef = useRef(onClose)
    useEffect(() => { onCloseRef.current = onClose }, [onClose])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={cn(
                    'relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl',
                    'max-h-[90vh]',
                    className,
                )}
            >
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </div>
        </div>
    )
}
