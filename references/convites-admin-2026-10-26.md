# Convites de administradores — 26/10/2026

Pedido mais recente do usuário: trocar o cadastro direto de administrador pelo convite; modal com nome/e-mail e Enviar convite; lista com nome/e-mail/situação e ações Reenviar/Revogar conforme permitido; página pública de aceite com senha e confirmação. A confirmação é validada exclusivamente no frontend. O DTO de aceite contém somente token e password.

Esta decisão prevalece sobre o cadastro direto com senha presente no catálogo anterior. Continuam válidos o perfil ADMIN da única operadora, o layout fixo, os popups e o retorno à listagem após mutações concluídas. Não criar commits.

## Referências técnicas revalidadas

- DB_Segundo/main: `PostgreSQL/access_control/API_DATABASE_CONTRACT.md`, seção Administradores por convite (blob `ed64840c162eea957b79dfd203a7982eda8bccba`), e `PostgreSQL/01_structure.sql` (`69a1779298d8f0fa58a03d6d5cbb6a975720bc95`). O banco já define emissão, revogação e aceite; convite de 24 horas, uso único, e-mail normalizado em minúsculas. Reenvio cria novo convite e revoga o anterior; o link antigo deixa de autorizar o aceite. O usuário ADMIN só é criado no aceite e não é autenticado automaticamente.
- API_Olius/main: árvore `b3680124356b993f01bae20c79bb7211886b38b7`, sem controller/DTO de convites. `UserAdministrationController.java` ainda oferece cadastro direto com senha (`e385c6b82238715a7cdd0d5e7520e723a97ee811`). A existência das funções SQL não confirma endpoints HTTP nem envio de e-mail. O frontend retirou a chamada e a interface de criação direta de ADMIN.

## Interface e portas internas

- Administração → Contas possui `AdminInvitations`, `AdminInvitationForm` e `AdminInvitationTable`, com CSS Modules e hooks separados.
- Tipos e portas em `src/types/adminInvitation.ts`; seleção de adaptador em `src/services/adminInvitationGateway.ts`; validação e serviços com Promise/try-catch em `src/services/adminInvitationService.ts`.
- Metadados da lista são selecionados explicitamente; hashes, senha e tokens não fazem parte da listagem real. Situações PENDING/ACCEPTED/EXPIRED/REVOKED são um modelo interno a ser normalizado pelo adaptador a partir dos campos aprovados do servidor, não um ENUM HTTP presumido.
- Reenviar/Revogar depende tanto da operação disponível quanto de `allowedActions` do registro autorizado pelo backend. O servidor revalida estado e permissão durante a ação. A revogação usa confirmação em modal. Sucesso fecha o modal e atualiza a lista; erro mantém os dados preenchidos.
- `/convites/aceitar` fica fora de `AuthScope` e de `AdminRoute`: não exige login nem tenta renovar sessão para abrir o formulário.
- A página aceita token por query ou fragmento, guarda em memória e remove da URL atual. Não armazenar tokens/senhas em storage ou logs. `Referrer-Policy` por meta é no-referrer.
- Inspeção prévia do convite é uma porta opcional: quando disponível, mostra dados autorizados e impede formulário para convite expirado/revogado/aceito. A integração de aceite não exige inventar um endpoint adicional de inspeção. O backend sempre valida token/validade/uso único no aceite.
- Senha usa a política de força já aplicada pela Core. A igualdade da confirmação é conferida antes de chamar o serviço. `acceptAdminInvitation` projeta explicitamente `{ token, password }`, sem confirmação, nome, e-mail, autor ou perfil.

## Integração ainda necessária

Definir controllers/DTOs e transporte HTTP de listar, emitir, reenviar, revogar e aceitar. Ações administrativas usam sessão ADMIN ativa; aceite usa o token público e não depende de Bearer/refresh do convidado. Não reutilizar automaticamente o transporte autenticado para o aceite. Confirmar protocolo de CSRF/CORS, rate limit, respostas de erro e regras de metadados públicos com a Core.

A Core deverá gerar o segredo seguro, aplicar os hashes de token e senha no servidor, chamar as funções autorizadas, efetivar a transação e então enviar o e-mail. Em falha de envio após commit, orientar reenvio com novo segredo, sem presumir atomicidade com o provedor de e-mail. Não expor bootstrap em endpoint público nem conceder ADMIN por parâmetros do cliente.

## Dados locais

A flag local já autorizada seleciona fixtures com pendente, aceito, expirado e revogado, ações dinâmicas e prazo de 24 horas. O link Abrir aceite existe exclusivamente para essas fixtures; não expor token real na listagem. Os dados são mantidos em memória e recarregar restaura o conjunto inicial; links criados após carregar só funcionam enquanto esse conjunto continua em memória. Nenhum e-mail é enviado, nenhuma conta real é criada e o aceite local não provisiona credenciais de login. Sem adaptador real, a UI sinaliza integração pendente e não chama URLs presumidas.
