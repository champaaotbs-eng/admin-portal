/**
 * VietMap Integration for location search and autocomplete
 * API Documentation: https://maps.vietmap.vn/docs/map-api/autocomplete-version/autocomplete-v4/
 * Place API: https://maps.vietmap.vn/docs/map-api/place-v4/
 * Reverse Geocoding: https://maps.vietmap.vn/docs/map-api/reverse-version/reverse-v4/
 * TileMap Styles: https://maps.vietmap.vn/docs/map-api/tilemap/#vietmap-maps-sdk-integration
 */

import { toSnakeCaseNoAccent } from "utils/format"

export interface IVietMapLocation {
    address: string
    provinceName: string
    wardName: string | null
    latitude: number
    longitude: number
    placeId?: string
}

interface IBoundary {
    type: number // 0=city, 1=district, 2=ward
    id: number
    name: string
    prefix: string
    full_name: string
}

interface IEntryPoint {
    ref_id?: string
    name?: string
    latitude?: number
    longitude?: number
    lat?: number
    lng?: number
    lon?: number
}

interface IVietMapAutocompleteResult {
    lat?: number
    lng?: number
    ref_id?: string
    distance?: number
    address?: string
    name?: string
    display?: string
    boundaries?: IBoundary[]
    categories?: unknown[]
    entry_points?: IEntryPoint[]
    data_old?: IVietMapAutocompleteResult | null
    data_new?: IVietMapAutocompleteResult | null
}

interface IVietMapPlaceResult {
    display?: string
    name?: string
    address?: string
    city?: string
    ward?: string
    lat?: number
    lng?: number
}

interface ILocationCandidate {
    address: string
    provinceName: string
    wardName: string | null
    latitude?: number
    longitude?: number
    placeId?: string
}

type TVietMapStyleVariant = 'default' | 'light' | 'dark'

const VIETMAP_API_KEY = import.meta.env.VITE_VIETMAP_API_KEY
const VIETMAP_AUTOCOMPLETE_API = 'https://maps.vietmap.vn/api/autocomplete/v4'
const VIETMAP_REVERSE_API = 'https://maps.vietmap.vn/api/reverse/v4'
const VIETMAP_PLACE_API = 'https://maps.vietmap.vn/api/place/v4'
const VIETMAP_STYLE_PATH_BY_VARIANT: Record<TVietMapStyleVariant, string> = {
    default: 'tm',
    light: 'lm',
    dark: 'dm',
}

const placeCache = new Map<string, IVietMapLocation>()

const parseFiniteNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

const extractAdministrativeNames = (boundaries: IBoundary[] | undefined) => {
    let provinceName = ''
    let wardName: string | null = null

    if (!boundaries || !Array.isArray(boundaries)) {
        return { provinceName, wardName }
    }

    for (const boundary of boundaries) {
        if (boundary.type === 0) {
            provinceName = `${boundary.prefix}-${boundary.name}`
            continue
        }

        if (boundary.type === 2) {
            wardName = `${boundary.prefix}-${boundary.name}`
        }
    }

    return { provinceName, wardName }
}

const parseCoordinatesFromEntryPoint = (entryPoint: IEntryPoint | undefined) => {
    if (!entryPoint) {
        return null
    }

    const latitude = parseFiniteNumber(entryPoint.latitude ?? entryPoint.lat)
    const longitude = parseFiniteNumber(entryPoint.longitude ?? entryPoint.lng ?? entryPoint.lon)

    if (latitude === null || longitude === null) {
        return null
    }

    return { latitude, longitude }
}

const parseCoordinatesFromResult = (result: IVietMapAutocompleteResult) => {
    const fromTopLevel = {
        latitude: parseFiniteNumber(result.lat),
        longitude: parseFiniteNumber(result.lng),
    }

    if (fromTopLevel.latitude !== null && fromTopLevel.longitude !== null) {
        return {
            latitude: fromTopLevel.latitude,
            longitude: fromTopLevel.longitude,
        }
    }

    return parseCoordinatesFromEntryPoint(result.entry_points?.[0])
}

const toLocationCandidate = (result: IVietMapAutocompleteResult): ILocationCandidate | null => {
    const address = (result.display || result.address || result.name || '').trim()

    if (!address) {
        return null
    }

    const { provinceName, wardName } = extractAdministrativeNames(result.boundaries)
    const coordinates = parseCoordinatesFromResult(result)
    return {
        address,
        provinceName,
        wardName,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        placeId: result.ref_id,
    }
}

const buildLocationFromCandidate = (candidate: ILocationCandidate): IVietMapLocation | null => {
    if (
        typeof candidate.latitude !== 'number'
        || typeof candidate.longitude !== 'number'
        || !Number.isFinite(candidate.latitude)
        || !Number.isFinite(candidate.longitude)
    ) {
        return null
    }
    return {
        address: candidate.address,
        provinceName: candidate.provinceName,
        wardName: candidate.wardName,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        placeId: candidate.placeId,
    }
}

const fallbackCoordinateLocation = (latitude: number, longitude: number): IVietMapLocation => ({
    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    provinceName: '',
    wardName: null,
    latitude,
    longitude,
})

export const getVietMapStyleUrl = (variant: TVietMapStyleVariant = 'default'): string | null => {
    if (!VIETMAP_API_KEY) {
        return null
    }

    const stylePath = VIETMAP_STYLE_PATH_BY_VARIANT[variant]
    return `https://maps.vietmap.vn/maps/styles/${stylePath}/style.json?apikey=${encodeURIComponent(VIETMAP_API_KEY)}`
}

export const getVietMapPlaceLocation = async (
    refId: string,
    fallback?: Omit<ILocationCandidate, 'placeId'>,
): Promise<IVietMapLocation | null> => {
    const normalizedRefId = refId.trim()

    if (!normalizedRefId) {
        return null
    }

    const cachedLocation = placeCache.get(normalizedRefId)

    if (cachedLocation) {
        return cachedLocation
    }

    if (!VIETMAP_API_KEY) {
        return null
    }

    try {
        const params = new URLSearchParams({
            apikey: VIETMAP_API_KEY,
            refid: normalizedRefId,
        })

        const response = await fetch(`${VIETMAP_PLACE_API}?${params.toString()}`)

        if (!response.ok) {
            return null
        }

        const payload = (await response.json()) as IVietMapPlaceResult
        const latitude = parseFiniteNumber(payload.lat)
        const longitude = parseFiniteNumber(payload.lng)

        if (latitude === null || longitude === null) {
            return null
        }

        const location: IVietMapLocation = {
            address: (payload.display || payload.address || fallback?.address || '').trim(),
            provinceName: (payload.city || fallback?.provinceName || '').trim(),
            wardName: (payload.ward || fallback?.wardName || null),
            latitude,
            longitude,
            placeId: normalizedRefId,
        }

        placeCache.set(normalizedRefId, location)
        return location
    } catch (error) {
        console.error('VietMap place error:', error)
        return null
    }
}

/**
 * Search for locations using VietMap Autocomplete v4 API
 * Uses Place v4 for reliable latitude/longitude by ref_id.
 */
export const searchVietMapLocations = async (query: string, limit: number = 6): Promise<IVietMapLocation[]> => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery || !VIETMAP_API_KEY) {
        return []
    }

    try {
        const params = new URLSearchParams({
            apikey: VIETMAP_API_KEY,
            text: trimmedQuery,
            display_type: '5',
            limit: String(limit),
        })

        const response = await fetch(`${VIETMAP_AUTOCOMPLETE_API}?${params.toString()}`)

        if (!response.ok) {
            console.warn(`VietMap autocomplete returned status ${response.status}`)
            return []
        }

        const results = (await response.json()) as IVietMapAutocompleteResult[]

        if (!Array.isArray(results)) {
            console.warn('VietMap autocomplete response is not an array')
            return []
        }

        const candidates = results
            .map((result) => toLocationCandidate(result))
            .filter((candidate): candidate is ILocationCandidate => Boolean(candidate))

        const resolvedLocations = await Promise.all(
            candidates.map(async (candidate) => {
                if (candidate.placeId) {
                    const placeLocation = await getVietMapPlaceLocation(candidate.placeId, {
                        address: candidate.address,
                        provinceName: candidate.provinceName,
                        wardName: candidate.wardName,
                        latitude: candidate.latitude,
                        longitude: candidate.longitude,
                    })

                    if (placeLocation) {
                        console.log('Resolved place location for candidate', {
                            ...placeLocation,
                            provinceName: candidate.provinceName || placeLocation.provinceName,
                            wardName: candidate.wardName || placeLocation.wardName,
                        })
                        return {
                            ...placeLocation,
                            provinceName: candidate.provinceName || placeLocation.provinceName,
                            wardName: candidate.wardName || placeLocation.wardName,
                        }
                    }
                }

                return buildLocationFromCandidate(candidate)
            }),
        )

        return resolvedLocations.filter((location): location is IVietMapLocation => Boolean(location))
    } catch (error) {
        console.error('VietMap autocomplete error:', error)
        return []
    }
}

/**
 * Search for a single location using VietMap
 */
export const searchVietMapLocation = async (query: string): Promise<IVietMapLocation | null> => {
    const [firstResult] = await searchVietMapLocations(query, 1)
    return firstResult ?? null
}

/**
 * Reverse geocode coordinates to get location details using VietMap Reverse v4 API
 * Falls back to simple coordinate formatting if API unavailable or fails
 */
export const reverseVietMapLocation = async (
    latitude: number,
    longitude: number,
): Promise<IVietMapLocation | null> => {
    try {
        if (!VIETMAP_API_KEY) {
            // No API key configured, return fallback
            return {
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                provinceName: '',
                wardName: null,
                latitude,
                longitude,
            }
        }

        // VietMap reverse geocoding API v4
        const params = new URLSearchParams({
            apikey: VIETMAP_API_KEY,
            lat: String(latitude),
            lng: String(longitude),
            display_type: '5',
        })

        const response = await fetch(`${VIETMAP_REVERSE_API}?${params.toString()}`)

        if (!response.ok) {
            console.warn(`VietMap reverse geocoding returned status ${response.status}`)
            return fallbackCoordinateLocation(latitude, longitude)
        }

        const payload = (await response.json()) as IVietMapAutocompleteResult[] | IVietMapAutocompleteResult
        const result = Array.isArray(payload) ? payload[0] : payload

        if (!result) {
            return fallbackCoordinateLocation(latitude, longitude)
        }

        const candidate = toLocationCandidate(result)

        if (!candidate) {
            return fallbackCoordinateLocation(latitude, longitude)
        }

        const directLocation = buildLocationFromCandidate(candidate)

        if (directLocation) {
            return directLocation
        }

        if (candidate.placeId) {
            const placeLocation = await getVietMapPlaceLocation(candidate.placeId, {
                address: candidate.address,
                provinceName: candidate.provinceName,
                wardName: candidate.wardName,
                latitude,
                longitude,
            })

            if (placeLocation) {
                return placeLocation
            }
        }

        return {
            address: candidate.address,
            provinceName: candidate.provinceName,
            wardName: candidate.wardName,
            latitude,
            longitude,
        }
    } catch (error) {
        console.error('VietMap reverse geocoding error:', error)
        return fallbackCoordinateLocation(latitude, longitude)
    }
}
