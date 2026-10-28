export type AdminResult<T> = { kind: 'ready'; data: T } | { kind: 'unavailable'; message: string }
