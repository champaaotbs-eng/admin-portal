import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
    getAllUsers,
    toggleUserStatus,
    createUser,
    updateUser,
    type CreateUserPayload,
} from '@/services/auth.service'
import { getAllRoles } from 'services/admins/roles.service'
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

    const { data: roles = [] } = useQuery({
        queryKey: ['admin', 'roles'],
        queryFn: getAllRoles,
    })

    const createMutation = useMutation({
        mutationFn: (data: UserFormData) => createUser(data as CreateUserPayload),
        onSuccess: (user) => {
            qc.setQueryData<User[]>(['admin', 'users'], (old = []) => [...old, user])
            void qc.invalidateQueries({ queryKey: ['admin', 'roles', 'usage'] })
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
            void qc.invalidateQueries({ queryKey: ['admin', 'roles', 'usage'] })
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
        const roleNameMap = new Map<string, string>()
        roles.forEach((role) => {
            roleNameMap.set(String(role.id), role.name)
            roleNameMap.set(role.key, role.name)
        })

        let list = q
            ? users.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    (roleNameMap.get(String(u.role)) ?? '').toLowerCase().includes(q),
            )
            : users

        if (sortKey) {
            list = [...list].sort((a: User, b: User) => {
                if (sortKey === 'role') {
                    const roleA = roleNameMap.get(String(a.role)) ?? String(a.role)
                    const roleB = roleNameMap.get(String(b.role)) ?? String(b.role)
                    return sortDir === 'asc' ? roleA.localeCompare(roleB) : roleB.localeCompare(roleA)
                }
                const av = String(a[sortKey as keyof User] ?? '')
                const bv = String(b[sortKey as keyof User] ?? '')
                return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
            })
        }
        return list
    }, [users, search, roles, sortKey, sortDir])

    const roleNameMap = useMemo(() => {
        const map = new Map<string, string>()
        roles.forEach((role) => {
            map.set(String(role.id), role.name)
            map.set(role.key, role.name)
        })
        return map
    }, [roles])

    const roleOptions = useMemo(
        () => roles.map((role) => ({ value: String(role.id), label: role.name })),
        [roles],
    )

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
        : {
            name: '',
            username: '',
            email: '',
            phone: '',
            password: '',
            role: roleOptions[0]?.value ?? '',
        }

    return {
        users,
        roles,
        isLoading,
        filtered,
        roleNameMap,
        roleOptions,
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
