import type { IRoute, IRouteStop, EStopType } from './route'
import type { ESeatType } from './seat-layout'

export interface ITripLocation {
    stationId: string
    label: string
    address: string
    latitude: number
    longitude: number
}

export interface ITrip {
    tripId: string
    routeId: string
    route?: IRoute
    fromLocationName?: string
    toLocationName?: string
    fromLocation?: ITripLocation
    toLocation?: ITripLocation
    busVersionId?: string
    busCompanyId: string
    busCompanyName?: string
    busName?: string
    busLicensePlate?: string
    driverPhone?: string
    departureTime: string
    arrivalTime: string
    basePrice: number
    status: ETripStatus
    hasBookings?: boolean
    isPublished: boolean
    cancelReason?: string | null
    createdAt: string
    updatedAt?: string
    tripStops?: ITripStop[]
    seatAvailability?: ISeatAvailability[]
}

export interface ITripStop {
    tripStopId: string
    tripId?: string
    stopId: string
    routeStopId?: string
    routeStop?: IRouteStop
    locationId?: string
    locationName?: string
    locationAddress?: string
    stopOrder?: number
    sortOrder?: number
    stopType: EStopType
    pickupTime?: string | null
    dropoffTime?: string | null
    note?: string | null
}

export interface ISeatBookingInfo {
    seatId: string
    bookingCode: string
    passengerName?: string
    passengerEmail?: string
    passengerPhone?: string
}

export interface ISeatAvailability {
    seatId: string
    seatCode: string
    seatType: ESeatType
    row: number
    col: number
    floor: number
    price: number
    isAvailable: boolean
    booking?: ISeatBookingInfo | null
}

export enum ETripStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum ETripDisplayStatus {
    SCHEDULED = 'SCHEDULED',
    ON_WAY = 'ON_WAY',
    COMPLETED = 'COMPLETED',
}

export function getTripDisplayStatus(trip: Pick<ITrip, 'status' | 'departureTime' | 'arrivalTime'>): ETripDisplayStatus | ETripStatus.INACTIVE {
    if (trip.status === ETripStatus.INACTIVE) return ETripStatus.INACTIVE
    const now = Date.now()
    const dep = new Date(trip.departureTime).getTime()
    const arr = new Date(trip.arrivalTime).getTime()
    if (now < dep) return ETripDisplayStatus.SCHEDULED
    if (now <= arr) return ETripDisplayStatus.ON_WAY
    return ETripDisplayStatus.COMPLETED
}
