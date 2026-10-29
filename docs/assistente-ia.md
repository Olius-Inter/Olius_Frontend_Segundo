# Assistente Olius

Interface administrativa em /assistente, inspirada nas referências enviadas em 28/10/2026.

Inclui três perguntas sugeridas (preenchem o campo sem enviar), caixa de texto compacta, contador de caracteres e botão de envio. A atualização posterior removeu imagens e anexos. Sem áudio ou exportação.

A porta interna AssistantGateway.send recebe somente message, com AbortSignal. Um adaptador futuro deve ser registrado por app usando features/ai/api.ts e implementar o contrato HTTP autorizado. Não existe endpoint inventado, resposta simulada ou persistência local. Sem adaptador, o envio informa indisponibilidade e preserva o rascunho. Mensagens ficam somente na memória da página.

O backend deverá autenticar o ADMIN, limitar contexto à empresa autorizada e definir DTO, limites, transporte e política de retenção antes da integração real.
