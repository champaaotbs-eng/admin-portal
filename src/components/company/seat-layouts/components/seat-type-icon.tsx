import { Armchair, BedSingle, Crown } from 'lucide-react'
import { ESeatType } from 'types/seat-layout'

interface SeatTypeIconProps {
    seatType: ESeatType
    className?: string
}

const seatTypeIcons = {
    [ESeatType.STANDARD]: Armchair,
    [ESeatType.VIP]: Crown,
    [ESeatType.BED]: BedSingle,
} as const

export const SeatTypeIcon = ({ seatType, className }: SeatTypeIconProps) => {
    const IconComponent = seatTypeIcons[seatType]
    return <IconComponent className={className} />
}
