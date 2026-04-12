import type { IGooglePlaceParsed } from 'types/location'

export const parsePlaceResult = (place: google.maps.places.PlaceResult): IGooglePlaceParsed | null => {
    if (!place.geometry?.location || !place.address_components) {
        return null
    }

    const getAddressPart = (types: string[]): string | null => {
        for (const type of types) {
            const component = place.address_components?.find((item) => item.types.includes(type))
            if (component) {
                return component.long_name
            }
        }

        return null
    }

    const provinceName = getAddressPart(['administrative_area_level_1'])

    if (!provinceName) {
        return null
    }

    return {
        address: place.formatted_address ?? '',
        provinceName,
        wardName: getAddressPart(['administrative_area_level_3', 'sublocality_level_1', 'sublocality']),
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id ?? '',
    }
}
