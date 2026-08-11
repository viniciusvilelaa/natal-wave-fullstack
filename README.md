# Natal Wave

Aplicação mobile de previsão marítima para surfistas, permitindo que usuários consultem condições de ondas, salvem praias favoritas, configurem alertas personalizados e acompanhem o histórico de buscas em tempo real.

---

## Tecnologias Utilizadas

### Backend
- Node.js
- TypeScript
- Express (framework HTTP)
- Prisma 7 (ORM)
- PostgreSQL (banco de dados)
- Zod (validação de schema e variáveis de ambiente)
- JWT + Refresh Token opaco (autenticação)
- bcrypt (hash de senha)
- crypto / SHA-256 (hash de refresh token)
- Stormglass API (dados marítimos e de ondas)
- tsx watch (servidor de desenvolvimento)

### Mobile
- React Native
- Expo (managed workflow)
- TypeScript
- React Navigation (gerenciamento de rotas)
- TanStack Query (gerenciamento e cache de dados da API)
- victory-native ou react-native-gifted-charts (gráficos)
- expo-secure-store (armazenamento seguro de tokens)
- expo-notifications (notificações push)

---

## Funcionalidades

- Autenticação Segura: Registro e login utilizando JWT de curta duração (access token) e refresh token opaco de longa duração, com rotação e revogação. O refresh token bruto é armazenado no dispositivo via `expo-secure-store`.
- Praias Favoritas: Lista curada de praias marcadas pelo usuário como favoritas.
- Histórico de Buscas: Registro das buscas realizadas, com deduplicação automática (upsert/contador).
- Alertas de Condições: Configuração de alertas para notificar o usuário quando as condições de onda (altura, período, direção do swell) atingirem os parâmetros desejados.
- Notificações Push: Envio de notificações via Expo Push Notification Service, com suporte a múltiplos dispositivos por usuário.
- Previsão de Ondas: Consulta de dados marítimos (altura de onda, período de swell, direção, vento) via integração com a Stormglass API, com cache local de 3 horas por praia.

---

## Arquitetura do Projeto

O backend segue uma arquitetura em camadas (controller / service / repository), organizada por domínio:

```text
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Registro, login, refresh e revogação de tokens
│   │   ├── locations/     # Praias favoritas
│   │   ├── weather/       # Integração com Stormglass e cache de previsão
│   │   └── beaches/       # Dados das praias (swell, vento, tipo de fundo)
│   ├── middlewares/       # Autenticação, tratamento de erros, etc.
│   ├── config/            # Configurações gerais
│   └── utils/             # Funções utilitárias (hash, jwt, geo, etc.)
├── prisma/
│   └── schema.prisma
└── prisma.config.ts
```

---

## Integração com Backend e Autenticação

Este aplicativo mobile foi desenvolvido para se conectar de forma integrada à API do Natal Wave.

### Comunicação com a API
Toda a comunicação é realizada através de requisições HTTP autenticadas via header `Authorization: Bearer <access_token>`. Como o React Native/Expo não possui suporte nativo a cookie jars, a autenticação por cookies HttpOnly não é utilizada neste projeto.

### Fluxo de Autenticação
- O login e o registro enviam as credenciais do usuário para a API.
- O servidor responde com um access token JWT (15 minutos de duração) e um refresh token opaco (30 dias de duração).
- O refresh token é armazenado hasheado (SHA-256) no banco de dados e, em texto puro, no dispositivo via `expo-secure-store`.
- Quando o access token expira, o app utiliza o refresh token para obter um novo par de tokens, com rotação automática do refresh token anterior.
- Rotas protegidas são verificadas a partir da presença e validade do access token armazenado localmente.

---

## Execução Local

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente necessárias (incluindo `STORMGLASS_API_KEY` e as credenciais do banco de dados PostgreSQL).
3. Inicie o servidor de desenvolvimento do backend:
   ```bash
   npm run dev
   ```
4. Inicie o aplicativo mobile com Expo:
   ```bash
   npx expo start
   ```

---

## Status do Projeto

Em desenvolvimento ativo