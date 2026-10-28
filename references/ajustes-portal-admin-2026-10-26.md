# Ajustes de interface solicitados em 26/10/2026

Esta referência registra o pedido direto do usuário e complementa o catálogo administrativo e as decisões de 20/10. Para a navegação e apresentação, este pedido mais recente prevalece sobre a distribuição anterior de módulos.

## Navegação e telas

- Lateral: Visão geral, Operação, Motorista, Ranking e Relatórios. Configurações e Administração ficam na parte inferior.
- Removidos da interface: cadastros de estabelecimentos/cidadãos/PEVs, área Comercial, assinaturas/financeiro e certificados. As regras de negócio históricas não autorizam restaurar esses acessos.
- Motorista tem página própria e conserva cadastro/edição validados.
- Visão geral: solicitações pendentes, visitas de hoje e visitas restantes no mês corrente. Os dois últimos indicadores são uma fotografia atual; filtros de período afetam os gráficos. Retirados busca, coletas realizadas, litros B2B/PEV e os gráficos por situação/motorista.
- Ranking usa pontos oficiais do domínio; os pontos de demonstração são fictícios. Não calcular classificação por litros.
- Planos fica em Configurações, com cartões e destaque central inspirados na imagem enviada. Não disponibiliza contratação, assinatura ou movimentação financeira.

## Agenda

Calendário mensal e lista das visitas do dia, com horários, múltiplos atendimentos e aviso de sobreposição quando existem horários/intervalos comparáveis. Duração ausente permanece desconhecida. A consulta cobre todo o intervalo visível, inclusive dias adjacentes: não usar apenas a primeira página de solicitações. O adaptador informa total e completude. Reagendamento exige horário exato, data do acordo, motivo e revisão atual, preservando histórico; organização de rotas continua externa ao portal.

## Perfil, apresentação e acessibilidade

Perfil contém imagem, nome, e-mail e telefone, com validação de arquivo e campos. Troca de senha tem senha atual, nova senha, confirmação e alternância de visibilidade. Escritas reais dependem dos endpoints autorizados ainda ausentes do contrato verificado. Não inventar endpoints nem armazenar senhas/tokens nas preferências locais.

Tema claro/escuro, alto contraste, restauração de preferências e leitura por voz opcional são locais, versionados e independentes dos dados operacionais. Leitura oferece iniciar, pausar/continuar e parar, é encerrada na troca de rota e não lê os valores de formulários. A disponibilidade depende do suporte do navegador.

## Notificações e preparação da API

Portas tipadas em `src/types/portal.ts`, acesso em `src/services/portalService.ts` e seleção de adaptador em `portalGateway.ts`. Categorias, paginação, total de não lidas global, leitura individual/em lote, remoção das lidas e assinatura opcional de mudanças estão separados da apresentação. Consultas são canceláveis, repetidas ao retomar a aba e atualizadas a cada 60 segundos enquanto visível. Os contratos de endpoints, autorização, retenção, eventos e transporte em tempo real ainda precisam ser confirmados com o backend.

Em produção, portas operacionais sem implementação exibem integração pendente; somente endpoints previamente verificados são usados. O frontend não estabelece autorização real com dados locais.

## Demonstração local

`VITE_LOCAL_ADMIN_DEMO=true` é permitido somente em localhost/127.0.0.1/[::1]. Credencial fictícia: `admin@olius.test` / `OliusTeste123!`. Todas as chamadas reais à Core são bloqueadas nesse modo.

Fixtures compartilhadas ficam em `src/data/demoPortalStore.ts`; adaptadores de demonstração são separados dos de produção. Há motoristas, solicitações, três visitas no mesmo dia, sobreposição, notificações e planos. Edições, aprovações, reagendamentos e avisos mudam em memória; recarregar restaura os dados iniciais. Perfil/senha alterados também são temporários. As preferências visuais ficam no navegador até restauração.

Volumes confirmados de demonstração possuem campo próprio, separado do estimado. Gráficos agregam o período completo selecionado usando apenas registros confirmados, sem depender da página de uma tabela. Preços mensais/anuais e benefícios dos planos são ilustrativos e não constituem uma oferta comercial.

## Referências visuais consultadas

- Imagem de planos fornecida no pedido: três cartões, com plano central em destaque.
- Figma Olius — Geral, arquivo `yBZd5MfeNRhxzkBHXEJutl`: página `1:3`, notificações `1427:426` e configurações `1394:484`. Referência de agrupamento, avatar, filtros arredondados e uso de amarelo, adaptada ao portal web ADMIN. Não houve conversão para B2C.

## Limites de verificação

Compilação TypeScript/Vite e inspeção manual da prévia local. Não equivalem a integração ponta a ponta com a API, auditoria completa de acessibilidade ou homologação comercial. Nenhum commit ou publicação foi solicitado.
