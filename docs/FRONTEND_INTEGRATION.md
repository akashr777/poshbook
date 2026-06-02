# Frontend Integration Guide

This backend uses **access tokens in JSON** and **refresh tokens in httpOnly cookies**.

## Requirements

- Set `withCredentials: true` on HTTP client (cookies cross-origin).
- Backend `CORS_ORIGIN` must match your frontend URL.
- `CORS_ALLOW_CREDENTIALS=true`.

## Login flow

```ts
// POST /api/auth/login
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await res.json();
// data.accessToken -> store in memory (preferred) or sessionStorage
// refresh token is set automatically as httpOnly cookie
localStorage.setItem('accessToken', data.accessToken);
```

## Token refresh flow

Call before access token expires (or on 401):

```ts
async function refreshAccessToken() {
  const res = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });

  if (!res.ok) throw new Error('Session expired');

  const { data } = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}
```

## Logout flow

```ts
await fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
localStorage.removeItem('accessToken');
```

## Axios interceptor example

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = api
        .post('/api/auth/refresh')
        .then((res) => {
          const token = res.data.data.accessToken;
          localStorage.setItem('accessToken', token);
          return token;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

export default api;
```

## Protected route example (React)

```tsx
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const user = JSON.parse(localStorage.getItem('user') ?? 'null');
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
```

## Password reset (frontend pages)

1. **Forgot password page** → `POST /api/auth/forgot-password` with `{ email }`.
2. User opens email link: `${FRONTEND_URL}/reset-password?token=...`
3. **Reset page** → `POST /api/auth/reset-password` with `{ token, password }`.

## Change password (authenticated)

```ts
await api.post('/api/auth/change-password', {
  currentPassword: 'OldPass123!',
  newPassword: 'NewPass456!'
});
// User must login again (refresh cookie cleared)
```

## API response shape

Success:

```json
{ "data": { ... } }
```

Error:

```json
{ "error": { "message": "...", "code": "ERROR_CODE" } }
```
