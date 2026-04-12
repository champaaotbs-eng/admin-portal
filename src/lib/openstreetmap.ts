export interface IOpenStreetMapLocation {
    address: string
    provinceName: string
    wardName: string | null
    latitude: number
    longitude: number
}

interface INominatimLocation {
    display_name?: string
    lat?: string
    lon?: string
    address?: Record<string, string | undefined>
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

const getAddressPart = (address: Record<string, string | undefined> | undefined, keys: string[]) => {
    if (!address) {
        return null
    }

    for (const key of keys) {
        const value = address[key]

        if (value) {
            return value
        }
    }

    return null
}

const fallbackProvinceFromDisplayName = (displayName: string | undefined) => {
    if (!displayName) {
        return null
    }

    const parts = displayName
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)

    if (parts.length === 0) {
        return null
    }

    return parts[parts.length - 1]
}

const parseLocation = (location: INominatimLocation | undefined): IOpenStreetMapLocation | null => {
    if (!location?.lat || !location.lon) {
        return null
    }

    const latitude = Number(location.lat)
    const longitude = Number(location.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null
    }

    const provinceName = getAddressPart(location.address, [
        'state',
        'province',
        'region',
        'county',
        'state_district',
        'city',
        'town',
        'municipality',
    ]) ?? fallbackProvinceFromDisplayName(location.display_name)

    if (!provinceName) {
        return null
    }

    return {
        address: location.display_name ?? '',
        provinceName,
        wardName: getAddressPart(location.address, [
            'administrative_area_level_3',
            'borough',
            'city_district',
            'suburb',
            'quarter',
            'neighbourhood',
            'town',
            'village',
            'hamlet',
            'municipality',
        ]),
        latitude,
        longitude,
    }
}

const buildSearchParams = (query: string, limit: number) => {
    const searchParams = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        'accept-language': 'vi',
        limit: String(limit),
        countrycodes: 'vn',
        q: query,
    })

    return searchParams.toString()
}

const buildReverseParams = (latitude: number, longitude: number) => {
    const searchParams = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        'accept-language': 'vi',
        lat: String(latitude),
        lon: String(longitude),
    })

    return searchParams.toString()
}

export const searchOpenStreetMapLocation = async (query: string): Promise<IOpenStreetMapLocation | null> => {
    const [firstResult] = await searchOpenStreetMapLocations(query, 1)
    return firstResult ?? null
}

export const searchOpenStreetMapLocations = async (query: string, limit: number = 5): Promise<IOpenStreetMapLocation[]> => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
        return []
    }

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${buildSearchParams(trimmedQuery, limit)}`)

    if (!response.ok) {
        return []
    }

    const results = (await response.json()) as INominatimLocation[]
    return results
        .map((location) => parseLocation(location))
        .filter((location): location is IOpenStreetMapLocation => Boolean(location))
}

export const reverseOpenStreetMapLocation = async (latitude: number, longitude: number): Promise<IOpenStreetMapLocation | null> => {
    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${buildReverseParams(latitude, longitude)}`)

    if (!response.ok) {
        return null
    }

    const result = (await response.json()) as INominatimLocation
    return parseLocation(result)
}