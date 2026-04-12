import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'components/shared/hooks/use-debounce'
import type { ICompany } from 'types/company'
import { BusCompanyStatus } from 'types/company'
import { getAllCompanies } from 'services/admins/company.service'
import { COMPANY_QUERY_KEYS } from '../constants/company-query-keys.constant'

/**
 * Manage paginated company list, filters, and detail modal state.
 */
export const useCompanyList = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState<BusCompanyStatus | ''>('')
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const debouncedSearch = useDebounce(searchText, 300)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch, statusFilter])

    const filters = useMemo(
        () => ({
            ...(debouncedSearch ? { name: debouncedSearch } : {}),
            ...(statusFilter ? { status: statusFilter } : {}),
        }),
        [debouncedSearch, statusFilter],
    )

    const { data, isLoading, isError } = useQuery({
        queryKey: COMPANY_QUERY_KEYS.list(currentPage, pageSize, filters),
        queryFn: () => getAllCompanies({ page: currentPage, limit: pageSize, filters }),
        select: (response) => response.data,
        placeholderData: keepPreviousData,
    })

    const openDetail = (id: string) => {
        setSelectedCompanyId(id)
        setIsDetailOpen(true)
    }

    const closeDetail = () => {
        setIsDetailOpen(false)
        setSelectedCompanyId(null)
    }

    return {
        companies: data?.result ?? [],
        meta: data?.meta ?? { page: currentPage, limit: pageSize, totalItems: 0, totalPages: 1 },
        isLoading,
        isError,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        selectedCompanyId,
        isDetailOpen,
        openDetail,
        closeDetail,
    }
}
