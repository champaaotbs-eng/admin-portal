import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MOCK_ADMINS } from '@/data/mock-extended'

interface UseAdminAccountsTabProps {
    search: string
}

export const useAdminAccountsTab = ({ search }: UseAdminAccountsTabProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return q ? MOCK_ADMINS.filter(a =>
            a.fullName.toLowerCase().includes(q) || a.username.toLowerCase().includes(q)
        ) : MOCK_ADMINS
    }, [search])

    return { t, filtered }
}
