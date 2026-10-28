import type { DemoInvitationRecord } from '../../features/invitations/types/adminInvitation'

const future = () => new Date(Date.now() + 86400000).toISOString()
export const demoInvitations: DemoInvitationRecord[] = [
  {
    invitation: {
      id: '50000000-0000-0000-0000-000000000001',
      name: 'Ana Costa',
      email: 'ana.costa@example.test',
      status: 'PENDING',
      expiresAt: future(),
      allowedActions: ['RESEND', 'REVOKE'],
    },
    token: 'local-invitation-pendente-olius',
  },
  {
    invitation: {
      id: '50000000-0000-0000-0000-000000000002',
      name: 'Bruno Oliveira',
      email: 'bruno.oliveira@example.test',
      status: 'ACCEPTED',
      expiresAt: null,
      allowedActions: [],
    },
    token: 'local-invitation-aceito-olius',
  },
  {
    invitation: {
      id: '50000000-0000-0000-0000-000000000003',
      name: 'Carla Lima',
      email: 'carla.lima@example.test',
      status: 'EXPIRED',
      expiresAt: new Date(Date.now() - 86400000).toISOString(),
      allowedActions: ['RESEND'],
    },
    token: 'local-invitation-expirado-olius',
  },
  {
    invitation: {
      id: '50000000-0000-0000-0000-000000000004',
      name: 'Diego Santos',
      email: 'diego.santos@example.test',
      status: 'REVOKED',
      expiresAt: null,
      allowedActions: [],
    },
    token: 'local-invitation-revogado-olius',
  },
]
