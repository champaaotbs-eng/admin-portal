import { useTranslation } from 'react-i18next'

interface RoleStatusBadgeProps {
    isActive: boolean
}

/**
 * Role status pill badge.
 */
export const RoleStatusBadge = ({ isActive }: RoleStatusBadgeProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles.status' })

    return (
        <span
            className={[
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
            ].join(' ')}
        >
            {isActive ? t('active') : t('inactive')}
        </span>
    )
}
