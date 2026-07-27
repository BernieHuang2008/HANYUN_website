# Backend API

## Auth

### `POST /api/login`
- Request: `{ "studentNo": string, "password": string(md5) }`
- Response:
  - `success: true` with `user`:
    - `id`
    - `username` (雅号)
    - `role`
    - `avatar`
    - `bio`（小传）
    - `createdAt`

## Members

### `GET /api/members`
- Returns homepage pinned members (同袍名录展示区)
- Includes HTTP cache headers (`ETag`, `Cache-Control`) and supports `304 Not Modified`

### `POST /api/members` (admin)
- Request: `{ "memberIds": string[] }`
- Saves pinned member ID order for homepage display

### `GET /api/members/all`
- Returns all registered members ordered by registration time (newest first)
- Includes HTTP cache headers (`ETag`, `Cache-Control`) and supports `304 Not Modified`

## Profile

### `PUT /api/user/profile`
- Auth: requires `hanyun_uid` + `hanyun_token` cookies
- Request:
  - `nickname` (required, max 30)
  - `avatar` (URL string)
  - `bio`（小传, max 250）
- Response: updated `user` payload

### `PUT /api/user/username`
- Legacy endpoint kept for compatibility, updates nickname only
