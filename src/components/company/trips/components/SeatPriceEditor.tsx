import { useTranslation } from 'react-i18next'
import type { ISeat } from 'types/seat-layout'

interface SeatPriceItem {
    seatId: string
    seatCode: string
    price: number
}

interface SeatPriceEditorProps {
    seats: ISeat[]
    basePrice: number
    value: SeatPriceItem[]
    onChange: (prices: SeatPriceItem[]) => void
}

export function SeatPriceEditor({ seats, basePrice, value, onChange }: SeatPriceEditorProps) {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.trips' })

    const getPrice = (seatId: string) => {
        const found = value.find(v => v.seatId === seatId)
        return found !== undefined ? found.price : basePrice
    }

    const setPrice = (seat: ISeat, price: number) => {
        const next = value.filter(v => v.seatId !== seat.seatId)
        if (price !== basePrice) {
            next.push({ seatId: seat.seatId, seatCode: seat.seatCode, price })
        }
        onChange(next)
    }

    const normalizeNumberInput = (raw: string) => {
        if (!raw) return ''
        return raw.replace(/^0+(?=\d)/, '')
    }

    const applyNormalizedInput = (raw: string) => {
        const normalized = normalizeNumberInput(raw)
        return normalized === '' ? '' : normalized
    }

    // Group by floor
    const floors = Array.from(new Set(seats.map(s => s.floor))).sort()

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t('form.seat_prices', 'Seat Prices')}</label>
                <span className="text-xs text-muted-foreground">
                    {t('form.seat_prices_hint', 'Leave at base price or set custom price per seat')}
                </span>
            </div>
            {floors.map(floor => {
                const floorSeats = seats.filter(s => s.floor === floor).sort((a, b) => a.row - b.row || a.col - b.col)
                return (
                    <div key={floor} className="rounded-md border border-border p-3 space-y-2">
                        {floors.length > 1 && (
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                                {t('form.floor', 'Floor')} {floor}
                            </p>
                        )}
                        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                            {floorSeats.map(seat => (
                                <div key={seat.seatId} className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-center">{seat.seatCode}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={getPrice(seat.seatId)}
                                        onInput={e => {
                                            const el = e.currentTarget
                                            const normalized = applyNormalizedInput(el.value)
                                            if (normalized !== el.value) {
                                                el.value = normalized
                                            }
                                        }}
                                        onChange={e => {
                                            const normalized = applyNormalizedInput(e.target.value)
                                            setPrice(seat, normalized === '' ? 0 : Number(normalized))
                                        }}
                                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
