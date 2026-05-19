/**
 * Query keys for role related data.
 */
export const ROLE_QUERY_KEYS = {
    all: ['roles'] as const,
    list: (
        page: number,
        limit: number,
        searchText: string,
        statusFilter: 'all' | 'active' | 'inactive',
        scope: 'system' | 'company',
        companyId?: string,
    ) => ['roles', 'list', scope, page, limit, searchText.trim(), statusFilter, companyId ?? 'all'] as const,
    detail: (id: string) => ['roles', id] as const,
}
