# Ajustes locais de DAD em 31/10/2026

Correção dos quatro pontos selecionados na auditoria, sem implementar endpoints ou integrar IA. As
rotas administrativas e os contratos de negócio permanecem os mesmos.

## Separação de responsabilidades

- Dashboard, Relatórios e Planos consultam hooks específicos: useAdminDashboard, useAdminReports e
  usePortalPlans. Consultas canceláveis, erro e recarga são preservados.
- ScheduleDialog e AdminInvitationTable recebem capacidades e links pelo hook/props.
- Os componentes históricos B2B também tiveram a coordenação de serviços extraída para hooks; isso
  não restaura suas rotas nem habilita funcionalidades removidas.
- Nenhuma página ou componente importa diretamente src/services.

## Formulários e login

- Foram associadas explicitamente 31 labels que antes dependiam somente de associação implícita. IDs
  gerados por useId evitam colisões entre instâncias.
- Login tem hook dedicado, validação tipada em src/utils/auth/loginValidation.ts, erros por campo
  com role alert, aria-invalid/aria-describedby e foco no primeiro erro.
- O e-mail perde somente espaços externos. A senha é preservada integralmente; a validação de login
  não exige a política de força usada no cadastro de uma nova senha.
- As entradas dos serviços de login real/local validam também o input antes de encaminhar.
- DemoRequest fica em src/types/mocks/demoRequest.ts; imports dos mocks foram ajustados.

## Verificações

- TypeScript e build de produção concluídos.
- 22 testes passaram, incluindo cinco cenários de validação e redirecionamento do login.
- Navegador em modo local: campos obrigatórios, e-mail inválido, foco, credencial incorreta, login
  bem-sucedido e navegação Dashboard/Relatórios/Perfil/Planos verificados.
- Campos visíveis de Dashboard, Relatórios e Perfil têm labels explícitos e nenhum ID duplicado.
- Teste no navegador bloqueou destinos externos e não chamou a API real.
- Verificador estrutural ampliado: detecta interfaces fora de types, imports diretos de serviços em
  componentes/páginas, labels sem htmlFor e controles sem id ou spread.
- Arquivos de IA preservados em comparação byte a byte com o backup desta etapa.

Essas verificações não substituem auditoria completa WCAG, leitor de tela, Profiler, publicação ou
integração com a Core. O aviso preexistente do PostCSS sobre from permanece. Nenhum commit ou
publicação foi realizado.
