import type { AdminInvitationGateway } from '../types/adminInvitation'
export const adminInvitationGateway: AdminInvitationGateway = {}
export function configureAdminInvitationGateway(gateway: AdminInvitationGateway) {
  Object.assign(adminInvitationGateway, gateway)
}
export let localInvitationPath: (id: string) => string | null = () => null
export function configureLocalInvitationPath(resolve: typeof localInvitationPath) {
  localInvitationPath = resolve
}
