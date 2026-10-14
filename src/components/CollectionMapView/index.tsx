import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { CollectionMapViewProps } from '../../types/collectionMap'
import styles from './styles.module.css'

export default function CollectionMapView({
  center,
  points,
  ownPoint,
  selectedId,
  onSelect,
}: CollectionMapViewProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markers = useRef(new Map<string, L.Marker>())
  const [tileError, setTileError] = useState(false)
  const tileUrl = import.meta.env.VITE_MAP_TILE_URL as string | undefined
  const attribution = import.meta.env.VITE_MAP_TILE_ATTRIBUTION as string | undefined
  useEffect(() => {
    if (!container.current || !center || !tileUrl || !attribution) return
    setTileError(false)
    const map = L.map(container.current, {
      scrollWheelZoom: false,
      keyboard: true,
      zoomControl: false,
    }).setView([center.latitude, center.longitude], 13)
    mapRef.current = map
    L.control.zoom({ zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar' }).addTo(map)
    // Configuração local confiável; nomes e endereços da API usam textContent.
    const tiles = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map)
    tiles.on('tileerror', () => setTileError(true))
    const visible = [
      ...points.filter((point) => point.id !== ownPoint?.id),
      ...(ownPoint ? [ownPoint] : []),
    ]
    markers.current.clear()
    const bounds = L.latLngBounds([[center.latitude, center.longitude]])
    for (const point of visible) {
      const person = point.marker === 'PERSON'
      const icon = L.divIcon({
        className: `${styles.marker} ${person ? styles.person : ''}`,
        html: person
          ? '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3z"/></svg>'
          : '<span aria-hidden="true">◆</span>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const marker = L.marker([point.coordinates.latitude, point.coordinates.longitude], {
        icon,
        keyboard: true,
        title: point.name,
        alt: `${point.name}: ${person ? 'ponto de coletor' : 'ponto de entrega'}`,
      }).addTo(map)
      const popup = document.createElement('div')
      const name = document.createElement('strong')
      name.textContent = point.name
      const address = document.createElement('p')
      address.textContent = point.address
      popup.append(name, address)
      marker.bindPopup(popup).on('click', () => onSelect(point.id))
      markers.current.set(point.id, marker)
      bounds.extend(marker.getLatLng())
    }
    if (visible.length) map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 })
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      markers.current.clear()
      mapRef.current = null
      map.remove()
    }
  }, [center, points, ownPoint, onSelect, tileUrl, attribution])
  useEffect(() => {
    const marker = selectedId ? markers.current.get(selectedId) : null
    if (marker && mapRef.current) {
      mapRef.current.setView(marker.getLatLng(), 16, { animate: false })
      marker.openPopup()
    }
  }, [selectedId, points, ownPoint])
  const available = Boolean(center && tileUrl && attribution)
  return (
    <section className={styles.wrapper} aria-label="Mapa dos pontos de coleta">
      <div
        className={styles.canvas}
        ref={container}
        aria-label="Mapa interativo; use as setas para mover e mais ou menos para ampliar"
        tabIndex={available ? 0 : undefined}
      />
      {!available && (
        <div className={styles.placeholder}>
          <p>
            O mapa será exibido quando houver uma localização e o serviço cartográfico estiver
            disponível.
          </p>
        </div>
      )}
      {tileError && (
        <p role="status" className={styles.error}>
          Não foi possível carregar parte do mapa. Consulte os pontos na lista abaixo.
        </p>
      )}
      <p className={styles.legend}>
        <span className={styles.yellow}>●</span> Ponto de entrega{' '}
        <span className={styles.blue}>●</span> Ponto de coletor · Marcadores desta página e seu
        ponto autorizado
      </p>
    </section>
  )
}
