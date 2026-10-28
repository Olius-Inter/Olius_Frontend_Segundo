import type { PortalGateway } from './portalGatewayTypes'
import { brasiliaDate } from '../../shared/lib/date'
import { addDemoNotification } from './demoPortalStore'
import { demoPortal } from './demoPortalStore'

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const clone = <T>(data: T): T => structuredClone(data)
export function createMockPortalGateway(): PortalGateway {
  return {
    profile: {
      get: async (signal) => {
        signal.throwIfAborted()
        return clone(demoPortal.profile)
      },
      save: async (input, signal) => {
        signal.throwIfAborted()
        let avatarUrl = input.removeAvatar ? null : demoPortal.profile.avatarUrl
        if (input.avatar)
          avatarUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
            reader.readAsDataURL(input.avatar as File)
          })
        signal.throwIfAborted()
        demoPortal.profile = {
          ...demoPortal.profile,
          name: input.name.trim(),
          email: input.email.trim(),
          telephone: input.telephone.trim(),
          avatarUrl,
        }
        return clone(demoPortal.profile)
      },
      password: async (input, signal) => {
        signal.throwIfAborted()
        if (input.current !== demoPortal.password) throw new Error('A senha atual está incorreta.')
        demoPortal.password = input.next
      },
    },
    notifications: {
      list: async (query, signal) => {
        signal.throwIfAborted()
        const all = demoPortal.notifications.filter(
          (n) =>
            (query.category === 'ALL' || n.category === query.category) &&
            (!query.unreadOnly || !n.read),
        )
        return clone({
          items: all.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
          total: all.length,
          unreadTotal: demoPortal.notifications.filter((n) => !n.read).length,
          totalPages: Math.ceil(all.length / query.pageSize),
        })
      },
      read: async (id, signal) => {
        signal.throwIfAborted()
        demoPortal.notifications.forEach((n) => {
          if (id === 'ALL' || n.id === id) n.read = true
        })
        emit()
      },
      clearRead: async (signal) => {
        signal.throwIfAborted()
        demoPortal.notifications = demoPortal.notifications.filter((n) => !n.read)
        emit()
      },
      subscribe: (listener) => {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
    },
    calendar: {
      list: async (query, signal) => {
        signal.throwIfAborted()
        const events = demoPortal.requests
          .filter(
            (r) =>
              r.status === 'APPROVED' &&
              r.scheduledAt &&
              brasiliaDate(r.scheduledAt) >= query.from &&
              brasiliaDate(r.scheduledAt) <= query.to,
          )
          .map((r) => ({
            id: r.id,
            requestId: r.id,
            title: r.name,
            address: r.address,
            startsAt: r.scheduledAt as string,
            endsAt: r.endsAt,
            revision: r.revision,
            completed: r.completed,
            canReschedule: !r.completed,
          }))
        return clone({ events, complete: true, total: events.length })
      },
      reschedule: async (event, input, signal) => {
        signal.throwIfAborted()
        const request = demoPortal.requests.find((r) => r.id === event.requestId)
        if (!request || request.status !== 'APPROVED' || request.completed)
          throw new Error('Esta visita não pode ser reagendada.')
        if (request.revision !== input.expectedRevision)
          throw new Error('A revisão mudou. Feche e atualize a agenda antes de tentar novamente.')
        const previous = request.scheduledAt
        request.scheduledAt = input.startsAt
        request.endsAt = null
        request.revision++
        request.history.push({
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          author: 'Administrador Olius',
          description: `Reagendamento: ${previous} → ${input.startsAt}. Combinado em: ${input.agreedAt}. Motivo: ${input.reason}`,
        })
        addDemoNotification('Visita reagendada', request.name, '/operacao/agenda')
        emit()
      },
    },
    plans: {
      list: async (signal) => {
        signal.throwIfAborted()
        return clone(demoPortal.plans)
      },
    },
  }
}
