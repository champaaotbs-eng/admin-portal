import { useAuthStore } from '@/store/auth.store'

export const usePermission = () => {
    const { admin } = useAuthStore()
    const hasReadAccess = (module: string) => admin?.permissions?.find((perm) => perm.module === module && perm.read)
    const hasWriteAccess = (module: string) => admin?.permissions?.find((perm) => perm.module === module && perm.write)

    return { hasReadAccess, hasWriteAccess }
}
