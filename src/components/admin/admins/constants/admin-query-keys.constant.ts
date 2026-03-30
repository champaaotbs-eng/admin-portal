/**
 * Query keys for admin management.
 */
export const ADMIN_QUERY_KEYS = {
    all: ['admins'] as const,
    list: (page: number, limit: number, search: string) => ['admins', 'list', page, limit, search.trim()] as const,
    detail: (id: string) => ['admins', id] as const,
}
