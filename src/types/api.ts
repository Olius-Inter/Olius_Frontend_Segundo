export type ResourceState<T> =
  | { phase: 'loading' }
  | { phase: 'ready'; data: T }
  | { phase: 'error'; message: string }

export interface AbortableResourceResult<T> {
  state: ResourceState<T>
  reload: () => void
}
