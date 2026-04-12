import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StationFilterBar } from './components/stations-filter-bar'
import { StationFormModal } from './components/stations-form-modal'
import { StationsTable } from './components/stations-table'
import { useStations } from './hooks/use-stations'
import type { IStation } from 'types/station'

const LIMIT = 20

export const StationsPage = () => {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
    const [page, setPage] = useState(1)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedStation, setSelectedStation] = useState<IStation | undefined>()

    const queryParams = useMemo(() => ({
        page,
        limit: LIMIT,
        search: search || undefined,
        isActive,
    }), [isActive, page, search])

    const stationsQuery = useStations(queryParams)
    const stations = stationsQuery.data?.result ?? []
    const meta = stationsQuery.data?.meta

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        setPage(1)
    }, [])

    const handleFilterStatus = useCallback((value: boolean | undefined) => {
        setIsActive(value)
        setPage(1)
    }, [])

    const handleEdit = useCallback((station: IStation) => {
        setSelectedStation(station)
        setModalOpen(true)
    }, [])

    const handleAddClick = useCallback(() => {
        setSelectedStation(undefined)
        setModalOpen(true)
    }, [])

    const handleModalClose = useCallback(() => {
        setModalOpen(false)
        setSelectedStation(undefined)
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('stations.page_title')}</h1>
            </div>

            <StationFilterBar
                onSearch={handleSearch}
                onFilterStatus={handleFilterStatus}
                onAddClick={handleAddClick}
            />

            <StationsTable
                stations={stations}
                isLoading={stationsQuery.isLoading}
                isError={stationsQuery.isError}
                errorMessage={stationsQuery.error ? (stationsQuery.error as { localizedMessage?: string; message?: string }).localizedMessage ?? (stationsQuery.error as { message?: string }).message : undefined}
                page={meta?.page ?? page}
                limit={meta?.limit ?? LIMIT}
                totalItems={meta?.totalItems ?? 0}
                totalPages={meta?.totalPages ?? 1}
                onPageChange={setPage}
                onRetry={() => { void stationsQuery.refetch() }}
                onEdit={handleEdit}
            />

            <StationFormModal
                open={modalOpen}
                onClose={handleModalClose}
                station={selectedStation}
            />
        </div>
    )
}

export default StationsPage
