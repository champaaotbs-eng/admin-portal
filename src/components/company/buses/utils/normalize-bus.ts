import { EBusType } from 'types/bus'
import type { IBus } from 'types/bus'
import {
    normalizeSeatLayoutDetail,
} from 'components/company/seat-layouts/utils/normalize-seat-layout'

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

const parseText = (value: unknown): string => {
    if (typeof value === 'string') {
        return value
    }

    if (typeof value === 'number') {
        return String(value)
    }

    return ''
}

const parseBusType = (value: unknown): EBusType => {
    const raw = parseText(value).toUpperCase()

    if (raw === EBusType.SLEEPER) {
        return EBusType.SLEEPER
    }

    if (raw === EBusType.LIMOUSINE || raw === 'VIP') {
        return EBusType.LIMOUSINE
    }

    return EBusType.SEAT
}

export const normalizeBusDetail = (payload: unknown): IBus | null => {
    const detail = readOne<unknown>(payload)

    if (!detail || typeof detail !== 'object') {
        return null
    }

    const source = detail as Record<string, unknown>
    const busId = parseText(source.busId ?? source.bus_id ?? source.id)

    if (!busId) {
        return null
    }

    const seatLayoutId = parseText(source.seatLayoutId ?? source.seat_layout_id ?? source.layoutId ?? source.layout_id)
    const seatLayout = source.seatLayout ?? source.seat_layout

    return {
        busId,
        companyId: parseText(source.companyId ?? source.company_id ?? source.busCompanyId ?? source.bus_company_id),
        busType: parseBusType(source.busType ?? source.bus_type ?? source.type),
        busCode: parseText(source.busCode ?? source.bus_code ?? source.code),
        busName: parseText(source.busName ?? source.bus_name ?? source.name),
        seatLayoutId: seatLayoutId || undefined,
        seatLayout: seatLayout
            ? normalizeSeatLayoutDetail({
                ...((seatLayout as Record<string, unknown>) ?? {}),
                seatLayoutId,
            }) ?? undefined
            : undefined,
        description: parseText(source.description),
        licensePlate: parseText(source.licensePlate ?? source.license_plate ?? source.plate),
        createdAt: parseText(source.createdAt ?? source.created_at),
        updatedAt: parseText(source.updatedAt ?? source.updated_at),
    }
}

export const normalizeBusList = (payload: unknown): IBus[] => {
    return readRows<unknown>(payload)
        .map((bus) => normalizeBusDetail(bus))
        .filter((bus): bus is IBus => Boolean(bus))
}
