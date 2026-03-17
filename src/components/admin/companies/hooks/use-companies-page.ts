import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import type { Dispatch, SetStateAction } from 'react'
import {
    getAllCompanies, createCompany, updateCompany, toggleCompanyStatus, deleteCompany,
    type CreateBusCompanyPayload,
    type UpdateBusCompanyPayload,

} from '@/services/company/bus-company.service'
import { type CompanyFormData } from '../validation-schema'
import type { BusCompany } from '@/types'

export type SortKey = 'name' | 'email' | 'serviceFee' | 'status' | 'createdAt'
export type SortDir = 'asc' | 'desc'
export type StatusFilter = 'all' | 'active' | 'inactive'

interface UseCompaniesPageProps {
    search: string
    statusFilter: StatusFilter
    sortKey: SortKey | null
    setSortKey: Dispatch<SetStateAction<SortKey | null>>
    sortDir: SortDir
    setSortDir: Dispatch<SetStateAction<SortDir>>
    page: number
    pageSize: number
    setPage: Dispatch<SetStateAction<number>>
    dialogMode: 'create' | 'edit' | null
    setDialogMode: Dispatch<SetStateAction<'create' | 'edit' | null>>
    editTarget: BusCompany | null
    setEditTarget: Dispatch<SetStateAction<BusCompany | null>>
}

export const useCompaniesPage = ({
    search,
    statusFilter,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    page,
    pageSize,
    setPage,
    dialogMode,
    setDialogMode,
    editTarget,
    setEditTarget,
}: UseCompaniesPageProps) => {
    const qc = useQueryClient()

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['admin', 'companies', { search, statusFilter, sortKey, sortDir, page, pageSize }],
        queryFn: () => getAllCompanies({
            search,
            status: statusFilter,
            sortKey,
            sortDir,
            page,
            limit: pageSize,
        }),
        placeholderData: keepPreviousData,
    })

    const companies = data?.items ?? []
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (d: CompanyFormData) => createCompany({
            name: d.name, email: d.email, phone: d.phone,
            address: d.address, serviceFee: Number(d.serviceFee) || 5,
        } as CreateBusCompanyPayload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'companies'] })
            closeDialog()
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CompanyFormData }) =>
            updateCompany(id, {
                name: data.name, phone: data.phone, email: data.email,
                address: data.address, serviceFee: Number(data.serviceFee) || 5,
            } as UpdateBusCompanyPayload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'companies'] })
            closeDialog()
        },
    })

    const toggleMutation = useMutation({
        mutationFn: (company: BusCompany) => toggleCompanyStatus(company),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'companies'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (companyId: string) => deleteCompany(companyId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'companies'] })
        },
    })

    const closeDialog = () => {
        setDialogMode(null)
        setEditTarget(null)
    }

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
        setPage(1)
    }

    const handleFormSubmit = (data: CompanyFormData) => {
        if (dialogMode === 'create') createMutation.mutate(data)
        else if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    }

    const isSaving = createMutation.isPending || updateMutation.isPending

    const defaultValues: CompanyFormData = editTarget
        ? { name: editTarget.name, email: editTarget.email, phone: editTarget.phone, address: editTarget.address, serviceFee: String(editTarget.serviceFee), ownerUsername: '', ownerPassword: '' }
        : { name: '', email: '', phone: '', address: '', serviceFee: '5', ownerUsername: '', ownerPassword: '' }

    return {
        companies, isLoading, isFetching,
        pagination: {
            page: meta?.page ?? page,
            limit: meta?.limit ?? pageSize,
            totalPages: meta?.totalPages ?? 1,
            totalItems: meta?.totalItems ?? companies.length,
        },
        isSaving,
        defaultValues,
        closeDialog,
        toggleSort,
        handleFormSubmit,
        toggleMutation,
        deleteMutation,
    }
}


