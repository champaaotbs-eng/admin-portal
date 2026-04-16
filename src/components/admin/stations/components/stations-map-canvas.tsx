import { useCallback, useEffect, useRef } from 'react'
import maplibregl, { type LngLatLike, type Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getVietMapStyleUrl, reverseVietMapLocation } from 'lib/vietmap'
import type { IVietMapLocation } from 'lib/vietmap'
import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css'

interface IStationMapCanvasProps {
    latitude: number
    longitude: number
    onSelectLocation: (location: IVietMapLocation) => void
}

const DEFAULT_CENTER = {
    latitude: 16.047079,
    longitude: 108.20623,
}

const DEFAULT_ZOOM = 6
const SELECTED_ZOOM = 15

interface IStyleSource {
    tiles?: string[]
}

interface IStylePayload {
    sources?: Record<string, IStyleSource>
}

const FALLBACK_STYLE: StyleSpecification = {
    version: 8,
    sources: {
        osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
        },
    },
    layers: [
        {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
        },
    ],
}

const resolveProbeTileUrl = (payload: IStylePayload): string | null => {
    if (!payload.sources) {
        return null
    }

    for (const source of Object.values(payload.sources)) {
        if (!source.tiles || source.tiles.length === 0) {
            continue
        }

        const template = source.tiles[0]
        return template
            .replace('{z}', '0')
            .replace('{x}', '0')
            .replace('{y}', '0')
    }

    return null
}

const probeVietMapStyle = async (styleUrl: string): Promise<boolean> => {
    try {
        const styleResponse = await fetch(styleUrl, { cache: 'no-store' })

        if (!styleResponse.ok) {
            return false
        }

        const stylePayload = (await styleResponse.json()) as IStylePayload
        const tileProbeUrl = resolveProbeTileUrl(stylePayload)

        if (!tileProbeUrl) {
            return false
        }

        const tileResponse = await fetch(tileProbeUrl, { cache: 'no-store' })
        return tileResponse.ok
    } catch {
        return false
    }
}

export const StationMapCanvas = ({ latitude, longitude, onSelectLocation }: IStationMapCanvasProps) => {
    const hasCoordinates = latitude !== 0 || longitude !== 0
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<MapLibreMap | null>(null)
    const markerRef = useRef<maplibregl.Marker | null>(null)
    const initialLatitudeRef = useRef(latitude)
    const initialLongitudeRef = useRef(longitude)
    const initialHasCoordinatesRef = useRef(hasCoordinates)
    const onSelectLocationRef = useRef(onSelectLocation)
    const syncMapWithSelectionRef = useRef<() => void>(() => { })
    const didFallbackRef = useRef(false)

    useEffect(() => {
        onSelectLocationRef.current = onSelectLocation
    }, [onSelectLocation])

    const pickCoordinates = useCallback(async (nextLatitude: number, nextLongitude: number) => {
        const resolvedLocation = await reverseVietMapLocation(nextLatitude, nextLongitude)

        onSelectLocationRef.current(
            resolvedLocation ?? {
                address: `${nextLatitude.toFixed(6)}, ${nextLongitude.toFixed(6)}`,
                provinceName: '',
                wardName: null,
                latitude: nextLatitude,
                longitude: nextLongitude,
            },
        )
    }, [])

    const setMarkerPosition = useCallback((nextLatitude: number, nextLongitude: number) => {
        const map = mapRef.current

        if (!map) {
            return
        }

        if (!markerRef.current) {
            const marker = new maplibregl.Marker({ draggable: true })
                .setLngLat([nextLongitude, nextLatitude])
                .addTo(map)

            marker.on('dragend', () => {
                const markerLngLat = marker.getLngLat()
                void pickCoordinates(markerLngLat.lat, markerLngLat.lng)
            })

            markerRef.current = marker
            return
        }

        markerRef.current.setLngLat([nextLongitude, nextLatitude])
    }, [pickCoordinates])

    const syncMapWithSelection = useCallback(() => {
        const map = mapRef.current

        if (!map) {
            return
        }

        requestAnimationFrame(() => {
            map.resize()
        })

        const center: LngLatLike = hasCoordinates
            ? [longitude, latitude]
            : [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude]

        map.easeTo({
            center,
            zoom: hasCoordinates ? SELECTED_ZOOM : DEFAULT_ZOOM,
            duration: 250,
        })

        if (!hasCoordinates) {
            if (markerRef.current) {
                markerRef.current.remove()
                markerRef.current = null
            }

            return
        }

        setMarkerPosition(latitude, longitude)
    }, [hasCoordinates, latitude, longitude, setMarkerPosition])

    syncMapWithSelectionRef.current = syncMapWithSelection

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return
        }

        let isDisposed = false
        let clickHandler: ((event: maplibregl.MapMouseEvent) => void) | null = null
        let errorHandler: ((event: maplibregl.ErrorEvent) => void) | null = null

        const initializeMap = async () => {
            const center: LngLatLike = initialHasCoordinatesRef.current
                ? [initialLongitudeRef.current, initialLatitudeRef.current]
                : [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude]

            const vectorStyleUrl = getVietMapStyleUrl('default')

            let style: string | StyleSpecification = FALLBACK_STYLE
            didFallbackRef.current = true

            if (vectorStyleUrl) {
                const canUseVectorStyle = await probeVietMapStyle(vectorStyleUrl)

                if (canUseVectorStyle) {
                    style = vectorStyleUrl
                    didFallbackRef.current = false
                }
            }

            if (isDisposed || !containerRef.current) {
                return
            }

            const map = new maplibregl.Map({
                container: containerRef.current,
                style,
                center,
                zoom: initialHasCoordinatesRef.current ? SELECTED_ZOOM : DEFAULT_ZOOM,
            })

            map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

            errorHandler = (event: maplibregl.ErrorEvent) => {
                if (didFallbackRef.current) {
                    return
                }

                const message = String(event?.error?.message ?? '')

                // Some API keys can read style.json but are locked on vector tile endpoints (HTTP 423).
                // If that happens, switch to raster fallback so station selection keeps working.
                if (message.includes('423') || message.toLowerCase().includes('locked')) {
                    didFallbackRef.current = true
                    map.setStyle(FALLBACK_STYLE)
                }
            }

            clickHandler = (event: maplibregl.MapMouseEvent) => {
                setMarkerPosition(event.lngLat.lat, event.lngLat.lng)
                void pickCoordinates(event.lngLat.lat, event.lngLat.lng)
            }

            map.on('click', clickHandler)
            map.on('error', errorHandler)
            mapRef.current = map
            syncMapWithSelectionRef.current()
        }

        void initializeMap()

        return () => {
            isDisposed = true

            const map = mapRef.current

            if (map && clickHandler) {
                map.off('click', clickHandler)
            }

            if (map && errorHandler) {
                map.off('error', errorHandler)
            }

            if (markerRef.current) {
                markerRef.current.remove()
                markerRef.current = null
            }

            if (map) {
                map.remove()
                mapRef.current = null
            }
        }
    }, [pickCoordinates, setMarkerPosition])

    useEffect(() => {
        syncMapWithSelection()
    }, [syncMapWithSelection])

    return <div ref={containerRef} className="h-full w-full" />
}