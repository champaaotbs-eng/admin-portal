export interface IPagination<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface IRequestPagination {
    page?: number
    limit?: number
}
