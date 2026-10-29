> Histórico do frontend anterior. Para o escopo vigente ADMIN, consulte [portal-administrativo.md](portal-administrativo.md), o plano web e as referências de 20/10/2026.

# Assistente IA — preparação da integração

Referência de tarefa: `86e1unynx`, seguindo o ID de telas já usado no projeto. Implementação histórica B2B preservada em `src/features/ai`. O portal ADMIN atual não registra a rota `/ia` nem apresenta acesso ao assistente. Uma eventual ativação exige definição do público, contrato e autenticação compatíveis com a Core.

Esta entrega prepara a interface e o contrato do cliente. Não contém respostas simuladas nem conexão com um provedor de IA. Sem `VITE_AI_API_URL`, o usuário pode preencher a pergunta e escolher sugestões, mas o envio permanece desabilitado.

## Contrato proposto para homologação

`VITE_AI_API_URL` deverá apontar para o backend do Olius, nunca diretamente para um provedor com chave secreta no navegador. O serviço está preparado para sessão por cookie (`credentials: include`). Backend valida sessão, vínculo empresarial, permissões, limites e propriedade da conversa em toda consulta.

```text
POST {VITE_AI_API_URL}
Content-Type: application/json
Idempotency-Key: requestId
Body: { message: string, conversationId: string | null, requestId: string }
Response: { conversationId: string, message: { id: string, role: "assistant", content: string } }
```

- Pergunta: 1–2.000 caracteres após limpeza de controles e espaços nas extremidades.
- Resposta: texto simples, até 20.000 caracteres. Nenhum HTML da API é interpretado.
- Backend deve aplicar idempotência, decidir o provedor/modelo e proteger credenciais. Cancelar a consulta no navegador não garante cancelar processamento/cobrança no servidor.
- `401`: sessão expirada; `403`: acesso negado; `429`: limite de consultas. A página apresenta a mensagem e mantém a pergunta para correção/nova tentativa.
- Histórico somente em memória, até 20 pares de mensagens. Nova conversa limpa a interface; não exclui histórico remoto. IDs da conversa e mensagens precisam ser válidos e consistentes.
- O assistente é somente consultivo: este contrato não permite confirmar coletas, cadastrar dados ou executar operações.
- Estados: indisponível, vazio, consultando, resposta recebida e erro. A consulta é cancelada ao sair da rota ou clicar em cancelar.

Pendentes: homologar contrato, autenticação real, backend de IA, política de histórico remoto e regras de uso. Não foi executada auditoria completa de acessibilidade nem teste de integração com IA real.
