import { AddStationFormModal } from './add-station-form-modal'
import { EditStationFormModal } from './edit-station-form-modal'
import type { IStation } from 'types/station'

interface IStationFormModalProps {
    open: boolean
    onClose: () => void
    station?: IStation
}

export const StationFormModal = ({ open, onClose, station }: IStationFormModalProps) => {
    const isEditMode = Boolean(station)

    if (isEditMode) {
        return <EditStationFormModal open={open} onClose={onClose} station={station} />
    }

    return <AddStationFormModal open={open} onClose={onClose} />
}
