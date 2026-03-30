import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmationModalProps {
    open: boolean
    title: string
    description?: string
    confirmLabel: string
    cancelLabel?: string
    onConfirm: () => void
    onClose: () => void
    loading?: boolean
    destructive?: boolean
    hideCancel?: boolean
}

export const ConfirmationModal = ({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onClose,
    loading = false,
    destructive = false,
    hideCancel = false,
}: ConfirmationModalProps) => {
    return (
        <Dialog open={open} onClose={onClose} title={title}>
            <div className="space-y-5">
                {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}

                <div className="flex justify-end gap-2">
                    {!hideCancel ? (
                        <Button type="button" variant="outline" onClick={onClose}>
                            {cancelLabel ?? 'Cancel'}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant={destructive ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
