# Frontend — React / TypeScript / Vite

## Stack

- **Framework:** React 18.3 + TypeScript 5.4
- **Build:** Vite 5.3
- **UI:** Material-UI (MUI) 5 + Emotion
- **Roteamento:** React Router DOM 6
- **HTTP:** Axios 1.7
- **Testes:** Vitest 1.6 + Testing Library + jsdom

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── api/
│   │   ├── auth.ts          # loginUser, registerUser (axios)
│   │   └── authApi.ts       # instância axios com interceptors
│   ├── components/
│   │   ├── AuthLayout.tsx   # layout de autenticação
│   │   └── ProtectedRoute.tsx
│   ├── hooks/
│   │   └── useAuth.ts       # useLogin, useRegister
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── types/
│   │   └── auth.ts          # LoginRequest, RegisterRequest, AuthResponse, User
│   ├── test/
│   │   ├── setup.ts
│   │   ├── __mocks__/authApi.ts
│   │   └── *.test.tsx
│   ├── App.tsx              # roteamento + tema MUI
│   └── main.tsx             # entry point
├── Dockerfile               # multi-stage: Node builder + nginx
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Comandos

```bash
npm run dev        # servidor de desenvolvimento (porta 5173)
npm run build      # tsc + vite build → dist/
npm run preview    # preview do build
npm run test       # vitest run (uma execução)
npm run test:watch # vitest em modo watch
```

## Padrões de Código

- **Hooks customizados** em `src/hooks/` para lógica de negócio (não colocar lógica em páginas)
- **Chamadas API** somente via `src/api/` — nunca fetch direto em componentes
- **Tipos** em `src/types/` — interfaces sempre explícitas para requests/responses
- `ProtectedRoute` envolve qualquer rota que exige autenticação
- Token JWT guardado no `localStorage` (chave: `token`)

## Testes

- Rodar com `npm test` — sem flag `--passWithNoTests` localmente
- Mocks de API em `src/test/__mocks__/authApi.ts`
- Setup global em `src/test/setup.ts` (jest-dom matchers)
- Cobertura não tem threshold definido, mas manter acima de 70%

## Variáveis de Ambiente

| Variável | Padrão dev | Finalidade |
|----------|-----------|-----------|
| `VITE_API_URL` | `http://localhost:3000` | URL base da API backend |

Criar `.env.local` (não commitar):
```
VITE_API_URL=http://localhost:3000
```

## Deploy

- **Produção:** GitHub Pages via workflow `deploy-staging.yml`
- A URL do backend de produção é injetada via secret `KOYEB_BACKEND_URL` no CI
- Dockerfile usa nginx para servir o `dist/` estático

## Regras

- Nunca importar `authApi` e `auth.ts` no mesmo componente — escolher um padrão
- Todos os formulários devem ter validação client-side antes de chamar a API
- Não expor JWT_SECRET ou DATABASE_URL no frontend — essas vars são só do backend
