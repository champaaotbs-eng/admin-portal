import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { IAdmin } from 'types/admin'
import { getAllAdmins } from 'services/admins/admin.service'
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
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
    const debouncedSearch = useDebounce(searchText, 300)
    const debouncedStatus = useDebounce(statusFilter, 300)

    const { data, isLoading, isError } = useQuery({
        queryKey: ADMIN_QUERY_KEYS.list(currentPage, pageSize, debouncedSearch, debouncedStatus === 'active' ? true : debouncedStatus === 'inactive' ? false : undefined),
        queryFn: () => getAllAdmins({
            page: currentPage,
            limit: pageSize,
            filters: {
                fullName: debouncedSearch.trim(),
                username: debouncedSearch.trim(),
                isActive: debouncedStatus === 'active' ? true : debouncedStatus === 'inactive' ? false : undefined,
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

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch, pageSize])

    const filteredAdmins = useMemo(() => {
        const normalizedSearch = debouncedSearch.trim().toLowerCase()
        const admins = data?.admins ?? []

        if (!normalizedSearch) return admins

        return admins.filter((admin) => {
            const username = admin.username?.toLowerCase() ?? ''
            const fullName = admin.fullName?.toLowerCase() ?? ''
            return username.includes(normalizedSearch) || fullName.includes(normalizedSearch)
        })
    }, [data?.admins, debouncedSearch])

    const paginatedAdmins = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return filteredAdmins.slice(start, end)
    }, [filteredAdmins, currentPage, pageSize])

    const totalItems = filteredAdmins.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const openDetail = (adminId: string) => setSelectedAdminId(adminId)
    const closeDetail = () => setSelectedAdminId(null)

    return {
        admins: paginatedAdmins,
        meta: {
            page: currentPage,
            limit: pageSize,
            totalItems,
            totalPages,
        },
        isLoading,
        isError,
        currentPage,
        setCurrentPage,
        pageSize,
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        selectedAdminId,
        isDetailOpen: Boolean(selectedAdminId),
        openDetail,
        closeDetail,
    }
}
