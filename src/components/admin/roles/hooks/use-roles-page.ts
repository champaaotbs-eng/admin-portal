import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, Dispatch, SetStateAction } from 'react'
import {
    getAllRoles, createRole, updateRole, updateRolePermissions, ALL_PERMISSIONS, type Role,
} from '@/services/roles.service'
import { type RoleFormData } from '../validation-schema'

interface UseRolesPageProps {
    search: string
    selectedRole: Role | null
    setSelectedRole: Dispatch<SetStateAction<Role | null>>
    pendingPerms: Set<string> | null
    setPendingPerms: Dispatch<SetStateAction<Set<string> | null>>
    dialogMode: 'create' | 'edit' | null
    setDialogMode: Dispatch<SetStateAction<'create' | 'edit' | null>>
    editTarget: Role | null
    setEditTarget: Dispatch<SetStateAction<Role | null>>
}

export const useRolesPage = ({ search, selectedRole, setSelectedRole, pendingPerms, setPendingPerms, dialogMode, setDialogMode, editTarget, setEditTarget }: UseRolesPageProps) => {
    const qc = useQueryClient()

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['admin', 'roles'],
        queryFn: getAllRoles,
    })

    const createMutation = useMutation({
        mutationFn: createRole,
        onSuccess: (role) => {
            qc.setQueryData<Role[]>(['admin', 'roles'], (old = []) => [...old, role])
            closeDialog()
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: RoleFormData }) =>
            updateRole(id, { name: data.name, description: data.description ?? '' }),
        onSuccess: (updated) => {
            if (!updated) return
            qc.setQueryData<Role[]>(['admin', 'roles'], (old = []) =>
                old.map(r => r.id === updated.id ? updated : r))
            closeDialog()
        },
    })

    const permMutation = useMutation({
        mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
            updateRolePermissions(roleId, permissions),
        onSuccess: (updated) => {
            if (!updated) return
            qc.setQueryData<Role[]>(['admin', 'roles'], (old = []) =>
                old.map(r => r.id === updated.id ? updated : r))
            setSelectedRole(updated)
            setPendingPerms(null)
        },
    })

    const selectRole = (role: Role) => {
        setSelectedRole(role)
        setPendingPerms(new Set(role.permissions))
    }

    const togglePermission = (key: string) => {
        setPendingPerms(prev => {
            if (!prev) return prev
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const savePermissions = () => {
        if (!selectedRole || !pendingPerms) return
        permMutation.mutate({ roleId: selectedRole.id, permissions: Array.from(pendingPerms) })
    }

    const openCreate = () => {
        setEditTarget(null)
        setDialogMode('create')
    }

    const openEdit = (role: Role, e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation()
        setEditTarget(role)
        setDialogMode('edit')
    }

    const closeDialog = () => {
        setDialogMode(null)
        setEditTarget(null)
    }

    const handleFormSubmit = (data: RoleFormData) => {
        if (dialogMode === 'create') {
            createMutation.mutate({ name: data.name, description: data.description ?? '' })
        } else if (editTarget) {
            updateMutation.mutate({ id: editTarget.id, data })
        }
    }

    const filteredRoles = useMemo(() => {
        const q = search.toLowerCase()
        return q ? roles.filter(r =>
            r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
        ) : roles
    }, [roles, search])

    const permissionsByModule = useMemo(() => {
        const map = new Map<string, typeof ALL_PERMISSIONS>()
        for (const p of ALL_PERMISSIONS) {
            if (!map.has(p.module)) map.set(p.module, [])
            map.get(p.module)!.push(p)
        }
        return map
    }, [])

    const hasUnsavedChanges =
        pendingPerms !== null &&
        selectedRole !== null &&
        JSON.stringify([...pendingPerms].sort()) !== JSON.stringify([...selectedRole.permissions].sort())

    const isSaving = createMutation.isPending || updateMutation.isPending

    const defaultValues: RoleFormData = editTarget
        ? { name: editTarget.name, description: editTarget.description }
        : { name: '', description: '' }

    return {
        roles, isLoading,
        filteredRoles, permissionsByModule,
        hasUnsavedChanges, isSaving, defaultValues,
        selectRole, togglePermission, savePermissions,
        openCreate, openEdit, closeDialog, handleFormSubmit,
        permMutation,
    }
}
