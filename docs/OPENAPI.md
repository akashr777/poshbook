# OpenAPI / Swagger Setup

This backend uses **OpenAPIHono** (`@hono/zod-openapi`) for auto-generated API documentation.

## Architecture

| Layer | Responsibility |
|-------|----------------|
| `src/openapi/schemas.ts` | Zod + OpenAPI metadata (request/response, examples) |
| `src/openapi/definitions.ts` | `createRoute()` definitions per endpoint |
| `src/openapi/bindController.ts` | Maps `c.req.valid()` → `c.req.validated` for existing controllers |
| `src/routes/*.ts` | **OpenAPIHono** routers only — wires middleware + controllers |
| `src/app.ts` | Root **OpenAPIHono** + `app.doc('/openapi.json')` |

Controllers, services, and DB logic are **unchanged**.

## Run & verify

```bash
cd backend
bun run dev
```

1. **OpenAPI JSON** — http://localhost:3000/openapi.json  
   - Must be valid OpenAPI 3.0  
   - Includes `BearerAuth` security scheme  
   - All routes under `/api/*` documented  

2. **Swagger UI** — http://localhost:3000/doc  
   - Click **Authorize** → paste access token: `Bearer <accessToken>`  
   - Try **POST /api/auth/login** (no auth required)  
   - Cookie refresh token is set automatically in browser for `/api/auth/*`  

3. **Login flow in Swagger**
   - Execute `POST /api/auth/login` with example body  
   - Copy `data.accessToken` from response  
   - Authorize with Bearer token  
   - Call protected routes (`GET /api/users/me`, etc.)  

## Fully documented login route (reference)

See `src/openapi/definitions.ts` → `loginRoute`:

- Request body schema + field examples  
- Response `200` / `401` / `429` with schemas and examples  
- Description of cookie + Bearer token behavior  

## Adding a new documented endpoint

1. Add Zod schemas in `src/openapi/schemas.ts` (with `.openapi()` and examples).  
2. Add `createRoute({ ... })` in `src/openapi/definitions.ts`.  
3. Register in the route file:

```ts
router.openapi(myRoute, ...middleware, bindController((c) => myController.handler(c)));
```

4. Restart server and refresh `/doc`.

## Notes

- Validation is performed by OpenAPIHono (replacing `validateRequest` on OpenAPI routes).  
- `defaultHook` in `app.ts` returns `{ error: { message, code, details } }` on validation failure.  
- Protected routes use `security: [{ BearerAuth: [] }]` in route definitions.
