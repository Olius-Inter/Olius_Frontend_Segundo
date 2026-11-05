# Integração real de convites ADMIN

O adaptador `coreAdminInvitationGateway` é registrado quando a API está configurada e a demonstração
local está desativada. Usa Bearer e o transporte de sessão existente nas ações ADMIN.

- Listar: GET /api/v1/admin/invitations?page=0&size=10. Converte paginação da tela (base um) e
  totalElements; AVAILABLE vira PENDING.
- Criar: POST /api/v1/admin/invitations com name e email.
- Reenviar: consulta GET /api/v1/admin/invitations/{id} e emite novo POST com o mesmo nome/e-mail. A
  API invalida o convite anterior. Nenhum retry automático de emissão.
- Revogar: POST /api/v1/admin/invitations/{id}/revocation (204), seguido de consulta para confirmar
  o estado. Não simula uma revogação caso a confirmação falhe.
- Aceitar: POST /api/v1/auth/admin-invitations/acceptance com token e password (204). Público, sem
  cookies, Bearer ou refresh. Confirmação de senha nunca é transmitida. Não existe endpoint público
  de prévia; o formulário permite definir a senha e o servidor verifica validade, expiração e uso
  único ao enviar. Sucesso direciona ao login.

## Configuração da API hospedada

Configurar o provedor SMTP no ambiente da API, nunca em VITE\_\*:

```env
OLIUS_ADMIN_INVITATION_EMAIL_ENABLED=true
OLIUS_ADMIN_INVITATION_ACCEPTANCE_URL=https://portal.example.com/convites/aceitar
OLIUS_MAIL_HOST=servidor-smtp-do-provedor
OLIUS_MAIL_PORT=587
OLIUS_MAIL_FROM=remetente-autorizado
OLIUS_MAIL_USERNAME=usuario-smtp
OLIUS_MAIL_PASSWORD=segredo-smtp
```

O envio usa SMTP autenticado com STARTTLS. Sem serviço habilitado, a API retorna 503 sem emitir.
Falha de entrega após commit pode deixar o convite registrado: consultar a lista antes de reenviar.
O e-mail contém token em fragmento; a listagem não expõe token e o aceite o mantém só em memória.

## Validação no ambiente publicado

Após publicar o código, entrar com ADMIN real, listar, convidar um endereço controlado, verificar
recebimento do e-mail e abrir o link em sessão sem login. Aceitar e autenticar com a nova conta;
conferir a lista como ACCEPTED. Em convites separados, validar revogação e reenvio, inclusive recusa
do link antigo. Essas operações reais não são executadas pelos testes.
