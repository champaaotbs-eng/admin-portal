import { useQuery } from '@tanstack/react-query'
import { getCompanyById } from 'services/admins/company.service'
import { COMPANY_QUERY_KEYS } from '../constants/company-query-keys.constant'

/**
 * Fetch company details for detail modal or edit page.
 */
export const useCompanyDetail = (companyId: string | null) => {
    const { data: company, isLoading, isError, refetch } = useQuery({
        queryKey: COMPANY_QUERY_KEYS.detail(companyId ?? ''),
        queryFn: async () => {
            const response = await getCompanyById(companyId as string)
            return response.data
        },
        enabled: Boolean(companyId),
        staleTime: 30_000,
    })

    return { company, isLoading, isError, refetch }
}
