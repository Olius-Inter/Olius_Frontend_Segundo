# Convenções do projeto Olius

- Antes de alterar qualquer módulo, consulte `references/regras-atualizadas-2026-10-20.md`, `references/OLIUS Funcionalidades do Administrador.docx`, `docs/plano-web-administrativo.md` e `docs/portal-administrativo.md`. Revalide banco e API quando o contrato mudar.
- O portal é exclusivo de ADMIN da empresa operadora. Não restaurar ofertas/disputa entre coletores, conversão de perfil ou registro operacional pelo ADMIN com base no plano histórico de QR.
- Preserve páginas/componentes em pastas com `index.tsx`, CSS Modules, tipos em `features/<funcionalidade>/types` ou `shared/types`, hooks separados e acesso HTTP pelas camadas `api`. Não usar `any`.
- Preserve Prettier/EditorConfig, com indentação de 2 espaços.
- Integre somente endpoints/DTOs verificados. Porta interna não equivale a endpoint existente. Sem integração, mostre o estado pendente; não simule persistência nem autorização.
- Não criar commits ou publicar alterações sem pedido explícito do usuário.
- Consulte também `references/ajustes-portal-admin-2026-10-26.md`: navegação simplificada, configurações, agenda e mocks locais autorizados. Essa decisão mais recente prevalece sobre a distribuição anterior de módulos na interface.
- A atualização mais recente é `references/fluxos-listagens-e-databricks-2026-10-26.md`: Ranking removido, detalhes em popup, retorno às listas após mutações, avisos locais ocultos e relatórios preparados para Databricks. Ela prevalece sobre o pedido anterior do mesmo dia.
- Para administração de contas, consulte `references/convites-admin-2026-10-26.md`: cadastro direto de ADMIN foi substituído por convite; a confirmação de senha nunca integra o payload de aceite. Banco já possui o fluxo, mas a Core consultada ainda não oferece os endpoints de convites.

- Arquitetura modular vigente: consultar `docs/arquitetura-frontend.md`. `app` conecta módulos e mocks; `features` não importa `app`; `shared` não importa `features` nem `app`. Entre funcionalidades, use as interfaces públicas `index.ts`, `api.ts` e `contracts.ts`.

- Para solicitações e agenda, a decisão mais recente é `references/solicitacoes-agenda-2026-10-28.md`: contato externo, um único horário programado, botões de aprovação/rejeição, recuperação de rejeitadas e sem motivo/data do acordo no formulário. Contrato real de recuperação e simplificação ainda pendente no backend.

- Escopo mais recente do web: `references/escopo-web-b2b-2026-10-28.md`. Não reintroduzir entregas B2C, cidadãos ou filtros de público cidadão no portal. O contrato de identidade pode reconhecer perfis externos somente para recusá-los.

- A fila vigente está em `references/fila-solicitacoes-2026-10-28.md`: somente pendentes, cartões apenas com nome/endereço e sem ações diretas; histórico de rejeitadas permanece separado.
