/**
 * Query keys for role related data.
 */
export const ROLE_QUERY_KEYS = {
    all: ['roles'] as const,
    list: (page: number, limit: number, searchText: string, statusFilter: 'all' | 'active' | 'inactive') =>
        ['roles', 'list', page, limit, searchText.trim(), statusFilter] as const,
    detail: (id: string) => ['roles', id] as const,
}
