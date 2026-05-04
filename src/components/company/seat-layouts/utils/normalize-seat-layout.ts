import { ESeatType } from 'types/seat-layout'
import type { ISeat, ISeatLayout } from 'types/seat-layout'

const readRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if (!payload || typeof payload !== 'object') {
        return []
    }

    const source = payload as Record<string, unknown>

    if (Array.isArray(source.result)) {
        return source.result as T[]
    }

    if (Array.isArray(source.data)) {
        return source.data as T[]
    }

    if (source.data && typeof source.data === 'object') {
        const nested = source.data as Record<string, unknown>

        if (Array.isArray(nested.result)) {
            return nested.result as T[]
        }

        if (Array.isArray(nested.data)) {
            return nested.data as T[]
        }
    }

    return []
}

const readOne = <T,>(payload: unknown): T | null => {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const source = payload as Record<string, unknown>

    if (source.data && typeof source.data === 'object') {
        const nested = source.data as Record<string, unknown>

        if (nested.result && typeof nested.result === 'object') {
            return nested.result as T
        }

        return source.data as T
    }

    if (source.result && typeof source.result === 'object') {
        return source.result as T
    }

    return payload as T
}

const parseNumber = (value: unknown, fallback = 0): number => {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
        return parsed
    }

    return fallback
}

const parseText = (value: unknown): string => {
    if (typeof value === 'string') {
        return value
    }

    if (typeof value === 'number') {
        return String(value)
    }

    return ''
}

const parseSeatType = (value: unknown): ESeatType => {
    const raw = parseText(value).toUpperCase()

    if (raw === ESeatType.VIP) {
        return ESeatType.VIP
    }

    if (raw === ESeatType.BED || raw === 'SLEEPER') {
        return ESeatType.BED
    }

    return ESeatType.STANDARD
}

const mapSeat = (payload: unknown, layoutId: string): ISeat | null => {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const source = payload as Record<string, unknown>

    const seatId = parseText(source.seatId ?? source.seat_id ?? source.id)
    const seatCode = parseText(source.seatCode ?? source.seat_code)
    const row = parseNumber(source.row, 0)
    const col = parseNumber(source.col ?? source.column, 0)
    const floor = parseNumber(source.floor, 1)

    if (row < 1 || col < 1 || seatCode.trim().length === 0) {
        return null
    }

    return {
        seatId,
        layoutId,
        seatCode,
        row,
        col,
        floor: floor > 0 ? floor : 1,
        seatType: parseSeatType(source.seatType ?? source.seat_type),
    }
}

export const mapSeatLayout = (payload: unknown): ISeatLayout | null => {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const source = payload as Record<string, unknown>
    const seatLayoutId = parseText(source.seatLayoutId ?? source.seat_layout_id ?? source.id)

    if (!seatLayoutId) {
        return null
    }

    const seats = readRows<unknown>(source.seats)
        .map((seat) => mapSeat(seat, seatLayoutId))
        .filter((seat): seat is ISeat => Boolean(seat))

    return {
        seatLayoutId,
        busCompanyId: parseText(
            source.busCompanyId
            ?? source.bus_company_id
            ?? source.companyId
            ?? source.company_id,
        ),
        name: parseText(source.name),
        numberRows: parseNumber(source.numberRows ?? source.number_rows ?? source.rows, 0),
        numberCols: parseNumber(source.numberCols ?? source.number_cols ?? source.columns, 0),
        numberFloors: parseNumber(source.numberFloors ?? source.number_floors ?? source.floors, 1),
        createdAt: parseText(source.createdAt ?? source.created_at) as unknown as Date,
        updatedAt: parseText(source.updatedAt ?? source.updated_at) as unknown as Date,
        seats,
    }
}

export const normalizeSeatLayoutList = (payload: unknown): ISeatLayout[] => {
    return readRows<unknown>(payload)
        .map((layout) => mapSeatLayout(layout))
        .filter((layout): layout is ISeatLayout => Boolean(layout))
}

export const normalizeSeatLayoutDetail = (payload: unknown): ISeatLayout | null => {
    const detail = readOne<unknown>(payload)

    if (!detail) {
        return null
    }

    return mapSeatLayout(detail)
}
