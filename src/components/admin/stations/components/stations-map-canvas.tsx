import { useCallback, useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { reverseOpenStreetMapLocation } from 'lib/openstreetmap'
import type { IOpenStreetMapLocation } from 'lib/openstreetmap'
import type { LatLngExpression, Marker as LeafletMarker } from 'leaflet'

interface IStationMapCanvasProps {
    latitude: number
    longitude: number
    onSelectLocation: (location: IOpenStreetMapLocation) => void
}

const DEFAULT_CENTER: LatLngExpression = [16.047079, 108.20623]

const createMarkerIcon = () =>
    L.divIcon({
        className: '',
        html: `
            <div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4 fill-current">
                    <path d="M12 2c-4.2 0-7.5 3.4-7.5 7.5 0 5.5 7.5 12.5 7.5 12.5s7.5-7 7.5-12.5C19.5 5.4 16.2 2 12 2zm0 10.1c-1.4 0-2.6-1.2-2.6-2.6S10.6 7 12 7s2.6 1.2 2.6 2.6-1.2 2.5-2.6 2.5z" />
                </svg>
            </div>
        `,
        iconAnchor: [18, 36],
        iconSize: [36, 36],
    })

function MapViewportController({ latitude, longitude }: { latitude: number; longitude: number }) {
    const map = useMap()

    useEffect(() => {
        map.invalidateSize()
        map.setView(latitude !== 0 || longitude !== 0 ? [latitude, longitude] : DEFAULT_CENTER, latitude !== 0 || longitude !== 0 ? 15 : 6)
    }, [latitude, longitude, map])

    return null
}

function MapInteractionLayer({
    latitude,
    longitude,
    onSelectLocation,
}: {
    latitude: number
    longitude: number
    onSelectLocation: (location: IOpenStreetMapLocation) => void
}) {
    const markerRef = useRef<LeafletMarker | null>(null)
    const hasCoordinates = latitude !== 0 || longitude !== 0
    const markerIcon = useMemo(() => createMarkerIcon(), [])

    const pickCoordinates = useCallback(async (nextLatitude: number, nextLongitude: number) => {
        const resolvedLocation = await reverseOpenStreetMapLocation(nextLatitude, nextLongitude)

        onSelectLocation(
            resolvedLocation ?? {
                address: `${nextLatitude.toFixed(6)}, ${nextLongitude.toFixed(6)}`,
                provinceName: '',
                wardName: null,
                latitude: nextLatitude,
                longitude: nextLongitude,
            },
        )
    }, [onSelectLocation])

    useMapEvents({
        click: (event) => {
            void pickCoordinates(event.latlng.lat, event.latlng.lng)
        },
    })

    return hasCoordinates ? (
        <Marker
            ref={markerRef}
            draggable
            icon={markerIcon}
            position={[latitude, longitude]}
            eventHandlers={{
                dragend: () => {
                    const marker = markerRef.current

                    if (!marker) {
                        return
                    }

                    const position = marker.getLatLng()
                    void pickCoordinates(position.lat, position.lng)
                },
            }}
        />
    ) : null
}

export const StationMapCanvas = ({ latitude, longitude, onSelectLocation }: IStationMapCanvasProps) => {
    const hasCoordinates = latitude !== 0 || longitude !== 0
    const center = useMemo<LatLngExpression>(() => (hasCoordinates ? [latitude, longitude] : DEFAULT_CENTER), [hasCoordinates, latitude, longitude])

    return (
        <MapContainer className="h-full w-full" center={center} zoom={hasCoordinates ? 15 : 6} scrollWheelZoom>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewportController latitude={latitude} longitude={longitude} />
            <MapInteractionLayer latitude={latitude} longitude={longitude} onSelectLocation={onSelectLocation} />
        </MapContainer>
    )
}