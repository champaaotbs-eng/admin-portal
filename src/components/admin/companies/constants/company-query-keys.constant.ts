/**
 * Query keys for bus company management.
 */
export const COMPANY_QUERY_KEYS = {
    all: ['companies'] as const,
    list: (page: number, limit: number, filters: object) => ['companies', 'list', { page, limit, filters }] as const,
    detail: (id: string) => ['companies', id] as const,
}
