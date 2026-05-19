import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { IAdmin } from 'types/admin'
import { getAllAdmins } from 'services/admins/admin.service'
import { getAllAdminBusCompanies } from 'services/admins/bus-company.service'
import { useDebounce } from 'components/shared/hooks/use-debounce'
import { ADMIN_QUERY_KEYS } from '../constants/admin-query-keys.constant'

interface PaginationMeta {
    page: number
    limit: number
    totalItems: number
    totalPages: number
}

const DEFAULT_META: PaginationMeta = {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
}

/**
 * Manage admin list state, search, pagination, and detail modal state.
 */
export const useAdminList = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [companyFilter, setCompanyFilter] = useState('')
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
    const debouncedSearch = useDebounce(searchText, 300)
    const debouncedStatus = useDebounce(statusFilter, 300)
    const debouncedCompanyFilter = useDebounce(companyFilter, 300)

    const { data, isLoading, isError } = useQuery({
        queryKey: ADMIN_QUERY_KEYS.list(
            currentPage,
            pageSize,
            debouncedSearch,
            debouncedStatus === 'active' ? true : debouncedStatus === 'inactive' ? false : undefined,
            debouncedCompanyFilter || undefined,
        ),
        queryFn: () => getAllAdmins({
            page: currentPage,
            limit: pageSize,
            filters: {
                fullName: debouncedSearch.trim(),
                username: debouncedSearch.trim(),
                isActive: debouncedStatus === 'active' ? true : debouncedStatus === 'inactive' ? false : undefined,
                busCompanyId: debouncedCompanyFilter || undefined,
            }
        }),
        placeholderData: (previousData) => previousData,
        select: (response) => {
            const payload = response.data as {
                meta?: PaginationMeta
                result?: IAdmin[]
            }

            const admins = payload.result ?? []
            return {
                admins,
                meta: payload.meta ?? {
                    ...DEFAULT_META,
                    totalItems: admins.length,
                    totalPages: Math.max(1, Math.ceil(admins.length / pageSize)),
                },
            }
        },
    })
    const companyOptionsQuery = useQuery({
        queryKey: ['admin-company-options'],
        queryFn: () => getAllAdminBusCompanies(),
        select: (response) => response.data ?? [],
    })

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch, debouncedStatus, debouncedCompanyFilter, pageSize])

    const meta = data?.meta ?? DEFAULT_META
    const totalPages = meta.totalPages
    const companyNameById = useMemo(
        () => new Map((companyOptionsQuery.data ?? []).map((company) => [company.busCompanyId, company.name])),
        [companyOptionsQuery.data],
    )
    const admins = useMemo(
        () => (data?.admins ?? []).map((admin) => ({
            ...admin,
            companyName: admin.busCompanyId ? companyNameById.get(admin.busCompanyId) ?? admin.busCompanyId : null,
        })),
        [companyNameById, data?.admins],
    )

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const openDetail = (adminId: string) => setSelectedAdminId(adminId)
    const closeDetail = () => setSelectedAdminId(null)

    return {
        admins,
        meta,
        isLoading: isLoading || companyOptionsQuery.isLoading,
        isError,
        currentPage,
        setCurrentPage,
        pageSize,
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        companyFilter,
        setCompanyFilter,
        companies: companyOptionsQuery.data ?? [],
        selectedAdminId,
        isDetailOpen: Boolean(selectedAdminId),
        openDetail,
        closeDetail,
    }
}
