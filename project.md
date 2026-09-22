# Natal Wave — Arquitetura e Decisões de Projeto

> Documento de referência técnica e de negócio para o Natal Wave, app de previsão de condições de surf e mar para o litoral brasileiro (foco no Rio Grande do Norte).

## Visão geral

- Projeto solo, desenvolvido por Vinicius.
- Monorepo contendo API REST em Node.js/TypeScript (backend) e app mobile em React Native/Expo (frontend).
- Objetivo central: validar a ideia rapidamente com um MVP enxuto, evitando over-engineering.
- Ordem de desenvolvimento: backend primeiro, completo; mobile começa só depois.

## Convenção de linguagem

- Todo artefato de código (código, comentários, nomes de variáveis, mensagens de erro/validação) é escrito em inglês.
- A conversa com o Claude segue em português.

## Stack tecnológica

### Backend
- Node.js + TypeScript
- Express
- Prisma ORM (v7), com driver adapter `PrismaPg`
- PostgreSQL
- Zod (validação)
- Autenticação: JWT (access token stateless de curta duração) + refresh token opaco persistido no banco, com rotação
- bcrypt (hash de senha) e SHA-256 via módulo `crypto` (hash de refresh token)
- Stormglass API (dados de previsão marítima)

### Mobile (planejado)
- React Native + Expo (managed workflow)
- React Navigation
- TanStack Query
- Biblioteca de gráficos: `victory-native` ou `react-native-gifted-charts`
- `expo-secure-store`, `expo-notifications`
- Expo Application Services (EAS) para builds

### Infraestrutura
- Docker Compose para PostgreSQL local
- `.env` com variáveis `POSTGRES_*`; `.env.example` versionado no Git
- `tsx watch` como servidor de desenvolvimento
- Deploy: self-hosted em servidor Linux pessoal via Cloudflare Tunnel
- Provedor de PostgreSQL hospedado em avaliação (Supabase, Neon ou Railway)

## Arquitetura e padrões

- Arquitetura em camadas estrita: **routes → controller → service → repository**, com responsabilidades bem definidas por camada.
- Validação via middleware Zod: `validate(schema)`, `validateQuery(schema)`, `validateParams(schema)`, aplicados no nível de rota, antes do controller.
- Tratamento de erros centralizado: classe `ApiError(statusCode, message)`, lançada na camada de service e capturada pelo `errorMiddleware`.
- Operações administrativas (escrita de praias) protegidas por middleware de header estático `x-admin-key` — sem sistema de roles no MVP, já que só Vinicius gerencia dados de praia (não há campo `role` no model `User`).
- Decisões arquiteturais relevantes são documentadas como ADRs quando o trade-off é significativo.
- Variáveis de ambiente validadas via `env.ts` baseado em Zod; `.env.example` mantido para onboarding/documentação.

## Autenticação e segurança

- Access token JWT stateless de curta duração + refresh token opaco persistido, com rotação a cada uso.
- Detecção de reuso de refresh token é tratada como sinal de comprometimento e dispara revogação total da sessão.
- Refresh tokens armazenados apenas como hash (SHA-256), nunca em texto puro.
- Senhas com bcrypt, `SALT_ROUNDS=10`.
- Mensagens de erro idênticas para usuário inexistente e senha incorreta, prevenindo ataques de enumeração.
- Tokens enviados via header `Authorization: Bearer`, não por cookies.
- Suporte a OAuth (Google e Apple) planejado: enum `AuthProvider` (`LOCAL`, `GOOGLE`, `APPLE`); variáveis `GOOGLE_CLIENT_ID` e `APPLE_CLIENT_ID` já previstas como opcionais, ainda não necessárias na fase atual.

## Modelo de dados (schema finalizado)

- **User**
- **Beach**
- **Favorite** (chave primária composta)
- **SearchHistory** (upsert-based, com `searchCount` e `lastSearchedAt`)
- **RefreshToken** (armazenado só como hash; rotação rastreada via `revokedAt` e `replacedByToken`)
- **Alert**
- **PushToken** (por dispositivo, iOS e Android)
- **ForecastCache** (JSON por praia, TTL de 3 horas)

## Regras de negócio

- Exclusão (hard delete) de praia é bloqueada com `409 Conflict` se existirem registros de `Favorite` ou `Alert` associados.
- `SearchHistory` e `ForecastCache` podem ser apagados em cascata livremente, por serem dados não críticos.
- `updateBeach` usa padrão find-then-update (duas queries) em vez de update único com tratamento do código de erro `P2025` — mais legível e consistente com o estilo do projeto; a validação de `data` vazio fica na camada do schema Zod, não duplicada no service.

## Busca por proximidade (nearby search)

- Implementada com fórmula de Haversine em memória — adequada para a escala atual.
- Resultados vazios são esperados e aceitáveis quando não há praias dentro do raio de busca.
- Caminho de migração para PostGIS documentado, para o caso de escala nacional no futuro.

## Considerações sobre Prisma v7

- Configuração do datasource mantida explícita em `prisma.config.ts` (não em `schema.prisma`).
- Uso do driver adapter `PrismaPg`.
- `provider = "postgresql"` mantido explícito no schema para suportar arrays de enum (ex: `CardinalDirection[]`).

## Princípio norteador

- Evitar over-engineering no MVP: sem PostGIS por enquanto, sem compressão ou Swagger prematuros.
- A camada de repository chegou a ser mesclada ao service no início do design e depois foi expandida para a estrutura completa de quatro camadas, conforme a necessidade real do projeto.

## Estado atual do backend

**Concluído:**
- Módulo de autenticação completo: registro, login, refresh (com rotação e detecção de reuso), logout.

**Em andamento:**
- Módulo de praias parcialmente implementado:
- Schemas Zod: `createBeachSchema`, `updateBeachSchema`, `beachIdParamSchema`, `searchBeachQuerySchema`, `nearbyBeachQuerySchema`
- Métodos de repository: create, findById, findByNameAndCity, findMany (com paginação), findAll, update, countDependents, delete
- Lógica de service incluindo Haversine em memória para busca por proximidade
- Rotas administrativas de escrita protegidas pelo middleware `x-admin-key`

**Planejado / no horizonte:**
- Finalizar rotas e controller restantes do módulo de praias
- Módulo de forecast/cache (integração com Stormglass API + camada de cache)
- Módulos de Favoritos e Alertas
- Sistema de push notification (disparo de alertas via cron, usando Expo Push Notification Service)
- Início do desenvolvimento mobile após conclusão do backend, com configuração das credenciais OAuth nessa fase
- Possível migração de Haversine para PostGIS caso o catálogo de praias escale nacionalmente

---
*Documento gerado a partir do histórico de decisões do projeto Natal Wave.*