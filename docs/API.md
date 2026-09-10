# KhabarFori REST API

Base URL: `https://YOUR_API/api/v1`. JSON unless uploading media. Authentication: `Authorization: Bearer <accessToken>`. Errors use HTTP status and a JSON `message`; validation errors may contain an array of messages. IDs are UUIDs except stable VIP plan identifiers.

Access tokens last 15 minutes. Refresh tokens are random, hashed at rest, rotate on use and expire after 30 days. Logging out or changing a password revokes the user's existing access-token version and refresh sessions.

| Method / path | Access | Behavior |
|---|---|---|
| POST `/auth/register` | Public, rate-limited | `{identifier,name,password}`; email or E.164 phone |
| POST `/auth/login` | Public, rate-limited | `{identifier,password}`; returns token pair |
| POST `/auth/refresh` | Refresh token | `{refreshToken}`; one-time rotation |
| POST `/auth/logout` | Signed in | Revoke all sessions for current user |
| POST `/auth/password` | Signed in | `{currentPassword,newPassword}` |
| POST `/auth/forgot-password` | Public, rate-limited | `{identifier}`; requires delivery adapter |
| POST `/auth/reset-password` | Reset token | `{token,password}` |
| GET/PATCH `/profile` | Signed in | Read account / update `{name}` |
| GET `/news` | Public | Summary list, cursor pagination |
| GET `/news/:id` | Public or authorized editor | Full public content; locked VIP preview without entitlement |
| POST `/news` | `news:write` | Create article; publication additionally requires `news:publish` |
| PATCH `/news/:id` | `news:write` + ownership/editor rules | Replace editable article fields |
| DELETE `/news/:id` | `news:publish` | Archive article |
| POST `/news/:id/views` | Signed in, readable article | Count at most once per user/article/hour |
| GET/POST `/news/:id/comments` | Signed in, readable article | Latest comments / `{body}` |
| POST/DELETE `/news/:id/reactions` | Signed in | Idempotent like/unlike |
| GET `/bookmarks` | Signed in | Current user's saved published summaries |
| POST/DELETE `/bookmarks/:id` | Signed in | Save/remove |
| GET `/home` | Public | Featured/latest/VIP previews, bookmark-category personalization, trending tags, announcements |
| GET `/workspace` | Public with optional identity | UI aggregate; internal sections are permission-filtered |
| GET `/users` | `users:read` | Latest 100 identities, no password hashes |
| PATCH `/users/:id/roles` | `users:manage` | `{roles:[...]}`; cannot alter own roles or remove final admin |
| GET `/employees` | `employees:read` | Internal directory |
| POST/PATCH `/employees[/id]` | `employees:write` | Create/update employee |
| DELETE `/employees/:id` | `employees:write` | Delete directory entry |
| GET `/messages` | Signed in | Own messages or authorized editorial inbox |
| POST `/messages` | `messages:write` | `{subject,body,type}` |
| PATCH `/messages/:id` | `messages:reply` | `{reply,status}` |
| GET `/subscriptions/plans` | Public | Active plans; amounts in IRR |
| POST `/subscriptions/checkout` | Signed in | `{planId}` plus `Idempotency-Key` |
| POST `/subscriptions/webhook` | Signed provider callback | Raw-body HMAC + independent verification |
| GET `/subscriptions/status` | Signed in | Current active subscription or null |
| GET `/subscriptions/payments` | Signed in | Own payment history |
| GET `/notifications` | Signed in | Own latest 100 notifications |
| POST `/notifications/read` | Signed in | Mark own notifications read |
| POST `/notifications/devices` | Signed in | `{token}` FCM registration |
| POST `/media` | `news:write` | Multipart `file`; JPEG/PNG/WebP, at most 5 MiB |
| GET `/analytics` | `analytics:read` | Aggregate users, activity, views, VIP count, comments, reactions and popular news |
| GET `/social` | `analytics:read` | Explicit disconnected state until a provider is implemented |
| GET `/health` | Public | Database readiness probe |

## News request

```json
{
  "title": "عنوان خبر",
  "description": "خلاصه خبر برای نمایش در فهرست",
  "content": "متن کامل خبر",
  "category": "اقتصاد",
  "status": "DRAFT",
  "vip": false,
  "tags": ["اقتصاد دیجیتال"],
  "kind": "NEWS"
}
```

Required title 3–200 characters; description 3–500; content 3–100,000; up to 20 tags of 60 characters. Optional `coverImage` must point to the configured Supabase storage origin. Kinds: NEWS, EXPERT_OPINION, EDITOR_NOTE, EXCLUSIVE. Non-NEWS analysis kinds are always premium.

`GET /news` supports `limit` (1–100), `cursor`, `category`, `q`, `vip=true`, `internal=true`. Internal mode is ignored without relevant permissions. Response: `{items: [...], nextCursor: string|null}`. For subsequent pages send the returned cursor with unchanged filters.

Message types: MESSAGE, IDEA, REPORT, REVIEW. Statuses: NEW, REVIEWING, COMPLETED. News statuses: DRAFT, REVIEW, PUBLISHED; deletion sets ARCHIVED.

## Payment adapter contract

The configured trusted service must implement:

- `POST /checkout`: input `{paymentId,amount,currency,idempotencyKey,callbackUrl}`; output `{reference,url}`. URL must be HTTPS. Reusing the same idempotency key must return the same provider checkout.
- `POST /verify`: input `{reference,paymentId}`; output `{status:"paid",reference,amount,currency,transactionId}` only after settlement verification.
- Callback to `/subscriptions/webhook`: JSON `{reference}` with header `X-Payment-Signature` = hex HMAC-SHA256 of the exact raw body using `PAYMENT_WEBHOOK_SECRET`.
- Authorization from KhabarFori to the adapter: `Bearer PAYMENT_API_KEY`.

The included adapter is a provider boundary, not a live integration with a named bank or payment processor. Refunds, disputes, tax invoices and store-managed in-app subscriptions require additional provider-specific workflows.

## Identity delivery contract

`IDENTITY_DELIVERY_URL` receives `{recipient,template:"password-reset",token}` with a server-to-server bearer credential. Deliver the token privately as an expiring reset link/code. Do not log it. Phone/email registration currently accepts an identifier and password but does **not** verify identifier ownership. Add OTP/email confirmation before public launch; do not describe registration as phone-verified.

## OpenAPI

`docs/openapi.json` contains the checked-in endpoint contract. Set `ENABLE_API_DOCS=true` for NestJS Swagger route discovery at `/docs` in development. Do not publicly expose development docs unless intended.

Reference implementation guidance: [NestJS authentication](https://docs.nestjs.com/security/authentication), [authorization](https://docs.nestjs.com/security/authorization), and [rate limiting](https://docs.nestjs.com/security/rate-limiting).
