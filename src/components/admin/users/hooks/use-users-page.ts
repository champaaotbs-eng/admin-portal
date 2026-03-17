import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, Dispatch, SetStateAction } from 'react'
import {
    getAllUsers,
    toggleUserStatus,
    createUser,
    updateUser,
    type CreateUserPayload,
} from '@/services/auth.service'
import { RoleEnum } from 'types/role'
import { type UserFormData } from '../validation-schema'
import type { User } from 'types/user'

export type SortKey = 'name' | 'email' | 'phone' | 'role' | 'isActive'
export type SortDir = 'asc' | 'desc'

interface UseUsersPageProps {
    search: string
    sortKey: SortKey | null
    setSortKey: Dispatch<SetStateAction<SortKey | null>>
    sortDir: SortDir
    setSortDir: Dispatch<SetStateAction<SortDir>>
    dialogMode: 'create' | 'edit' | null
    setDialogMode: Dispatch<SetStateAction<'create' | 'edit' | null>>
    editTarget: User | null
    setEditTarget: Dispatch<SetStateAction<User | null>>
}

export const useUsersPage = ({ search, sortKey, setSortKey, sortDir, setSortDir, dialogMode, setDialogMode, editTarget, setEditTarget }: UseUsersPageProps) => {
    const qc = useQueryClient()

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: getAllUsers,
    })

    const createMutation = useMutation({
        mutationFn: (data: UserFormData) => createUser(data as CreateUserPayload),
        onSuccess: (user) => {
            qc.setQueryData<User[]>(['admin', 'users'], (old = []) => [...old, user])
            closeDialog()
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UserFormData }) =>
            updateUser(id, { name: data.name, email: data.email, phone: data.phone || undefined, role: data.role }),
        onSuccess: (updated) => {
            if (!updated) return
            qc.setQueryData<User[]>(['admin', 'users'], (old = []) =>
                old.map((u) => (u.id === updated.id ? updated : u))
            )
            closeDialog()
        },
    })

    const toggleMutation = useMutation({
        mutationFn: toggleUserStatus,
        onSuccess: (updated) => {
            if (!updated) return
            qc.setQueryData<User[]>(['admin', 'users'], (old = []) =>
                old.map((u) => (u.id === updated.id ? updated : u))
            )
        },
    })

    const openCreate = () => {
        setEditTarget(null)
        setDialogMode('create')
    }

    const openEdit = (u: User) => {
        setEditTarget(u)
        setDialogMode('edit')
    }

    const closeDialog = () => {
        setDialogMode(null)
        setEditTarget(null)
    }

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const handleFormSubmit = (data: UserFormData) => {
        if (dialogMode === 'create') {
            createMutation.mutate(data)
        } else if (editTarget) {
            updateMutation.mutate({ id: editTarget.id, data })
        }
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        let list = q
            ? users.filter(
                (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
            )
            : users

        if (sortKey) {
            list = [...list].sort((a: User, b: User) => {
                const av = String(a[sortKey as keyof User] ?? '')
                const bv = String(b[sortKey as keyof User] ?? '')
                return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
            })
        }
        return list
    }, [users, search, sortKey, sortDir])

    const isSaving = createMutation.isPending || updateMutation.isPending

    const defaultValues: UserFormData = editTarget
        ? {
            name: editTarget.name,
            username: editTarget.username,
            email: editTarget.email,
            phone: editTarget.phone ?? '',
            password: '',
            role: editTarget.role,
        }
        : { name: '', username: '', email: '', phone: '', password: '', role: RoleEnum.CUSTOMER }

    return {
        users,
        isLoading,
        filtered,
        isSaving,
        defaultValues,
        openCreate,
        openEdit,
        closeDialog,
        toggleSort,
        handleFormSubmit,
        toggleMutation,
    }
}
