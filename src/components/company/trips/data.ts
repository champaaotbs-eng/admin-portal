export const STATUS_VARIANTS: Record<string, 'secondary' | 'success' | 'destructive' | 'warning'> = {
    scheduled: 'secondary',
    active: 'warning',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'destructive',
}
