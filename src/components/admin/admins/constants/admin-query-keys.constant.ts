/**
 * Query keys for admin management.
 */
export const ADMIN_QUERY_KEYS = {
    all: ['admins'] as const,
    list: (page: number, limit: number, search: string, isActive: boolean | undefined) => ['admins', 'list', page, limit, search.trim(), isActive] as const,
    detail: (id: string) => ['admins', id] as const,
}
