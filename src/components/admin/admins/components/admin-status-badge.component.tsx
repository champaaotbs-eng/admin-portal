import { useTranslation } from 'react-i18next'

interface AdminStatusBadgeProps {
    isActive: boolean
}

/**
 * Display admin active/locked status with semantic colors.
 */
export const AdminStatusBadge = ({ isActive }: AdminStatusBadgeProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })

    return (
        <span
            className={[
                'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700',
            ].join(' ')}
        >
            {isActive ? t('status.active') : t('status.inactive')}
        </span>
    )
}
