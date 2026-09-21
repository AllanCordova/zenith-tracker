# Parecer de Código — Tarefa 9

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- A frase `Os dados não passaram` está duplicada em `apps/web/repositories/auth.ts` (`REGISTER_PAYLOAD_REFUSED`) e em `apps/web/app/cadastro/page.tsx` (`DADOS_NAO_PASSARAM`), e a página decide o 400 comparando `error.message`. Se uma das cópias mudar, o 400 cai na mensagem de conexão. Não é furo de camada — o fetch continua no repositório — mas o protocolo é frágil.
- Os casos do Vitest (`cadastro.test.tsx`) injetam `register.mockRejectedValue(new Error("Os dados não passaram"))` e não exercitam o `if (response.status === 400)` de `repositories/auth.ts`. A cobertura real desse mapeamento fica só no e2e da API. O padrão bate com o texto da tarefa; só não segura uma regressão só de front no repositório.

## Observações fora do escopo deste diff

- `login()` em `apps/web/repositories/auth.ts` ainda devolve `envelope.data` em qualquer status; o cadastro agora trata 400 por throw e o 409/“e-mail já existe” segue o caminho antigo (`!accessToken`). Vale uma Issue de manutenção para um único contrato de erro no repositório de auth, sem misturar isso nesta tarefa.
