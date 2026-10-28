export interface MapCoordinates {
  latitude: number
  longitude: number
}
export type CollectionPointType = 'PEV' | 'ESTABLISHMENT'
export interface CollectionPoint {
  id: string
  ownerEstablishmentId: string | null
  name: string
  address: string
  coordinates: MapCoordinates
  type: CollectionPointType
  active: true
  approvalStatus: 'APPROVED'
  covered: true
  scheduleLabel: string | null
  openNow: boolean | null
  distanceMeters: number | null
  seal: 'BRONZE' | 'SILVER' | 'GOLD' | null
  sponsored: boolean
  marker: 'POINT' | 'PERSON'
}
export interface MapQuery {
  search: string
  latitude: number | null
  longitude: number | null
  radiusKm: number
  openNow: boolean
  type: 'ALL' | CollectionPointType
  withSeal: boolean
  page: number
  pageSize: number
}
export interface MapCollector {
  status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE'
  active: boolean
  canApply: boolean
  canViewRequests: boolean
  canViewCollections: boolean
  ownPoint: CollectionPoint | null
}
export interface CollectionMapData {
  accountType: 'B2B'
  establishmentId: string
  query: MapQuery
  center: MapCoordinates | null
  coverage: 'COVERED' | 'OUTSIDE' | 'UNKNOWN'
  collector: MapCollector
  items: CollectionPoint[]
  total: number
  totalPages: number
}
export type CollectionMapResponse =
  | { kind: 'ready'; data: CollectionMapData }
  | { kind: 'not-configured' | 'unauthenticated' | 'forbidden' }
export interface CollectorInvitationProps {
  collector: MapCollector | null
}
export interface CollectionMapFiltersProps {
  query: MapQuery
  search: string
  locating: boolean
  onSearch: (value: string) => void
  onSubmit: () => void
  onChange: (patch: Partial<MapQuery>) => void
  onLocate: () => void
}
export interface CollectionMapViewProps {
  center: MapCoordinates | null
  points: CollectionPoint[]
  ownPoint: CollectionPoint | null
  selectedId: string | null
  onSelect: (id: string) => void
}
export interface CollectionPointCardProps {
  point: CollectionPoint
  selected: boolean
  onSelect: (id: string) => void
}
export interface CollectionPointListProps {
  points: CollectionPoint[]
  selectedId: string | null
  onSelect: (id: string) => void
}
export interface CollectionMapPaginationProps {
  page: number
  totalPages: number
  total: number
  onChange: (page: number) => void
}
