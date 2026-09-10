# Validation report

This report distinguishes authored tests from tests actually executed in the build environment.

## Executed successfully

- NestJS/Prisma client generation and TypeScript backend build.
- Standalone Next.js application's TypeScript check, including shared UI and production API proxy.
- 20 security/domain/proxy tests: role boundaries, paid expiry, leap-year/month-end extension, identity normalization, strict DTO validation, missing/revoked sessions, permission enforcement, hidden drafts, VIP body redaction, bounded public list projection, employee publishing restrictions, image signatures, disabled payment configuration and forged callback rejection.
- Prisma generated an initial PostgreSQL SQL migration (including subsequent reviewed SQL constraints/RLS additions).

- Cloudflare-compatible Worker production build completed successfully.
- All 9 web/PWA/component/style tests passed. Server-rendered shared components passed Persian language, RTL, product identity, dashboard, sample-mode and mobile reader assertions. Manifest icon files, service-worker scope and shared official channel configuration were checked. This is component server rendering and configuration testing, not a live browser or phone installation test.

## Not executed here

- PostgreSQL migration application and full HTTP/database integration suite: no PostgreSQL server or Docker executable is available in this environment.
- Full native Next.js production build: the local runtime fails with `ENOENT: uv_resident_set_memory` because process memory information is unavailable. Next.js TypeScript validation passed; CI and the supplied Docker setup are the reproducible full-build paths. Do not treat these as already executed.
- Flutter analysis, unit tests, Android and iOS builds: Flutter SDK, Android tooling and Xcode are not installed here.
- Provider sandbox payments, Supabase media upload and FCM delivery: no credentials/providers supplied.
- Browser visual/end-to-end tests, accessibility audit and load testing: not executed.
- GitHub CI: authored, not dispatched/executed from this environment.

## Reproduce unit tests

`cd backend && npm ci && npm test`

For environments where the tsx CLI cannot create a temporary IPC socket, the test command uses `node --import tsx --test test/*.test.ts`.

## Database integration

Use an isolated disposable PostgreSQL database. Configure `DATABASE_URL`, `DIRECT_URL`, a test `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Apply the migration and seed, build/start the API, then run `node backend/test/integration.mjs` (or from backend, `node test/integration.mjs`). It creates test identities/articles and must not point to production.

Coverage: rejected role injection, restricted employee/analytics access, editor-only creation/publication, draft non-disclosure, premium body redaction, locked-comment denial, refresh token single-use rotation and logout revocation.

## Launch acceptance scenarios

1. All six roles: verify actual permissions and ensure UI navigation cannot circumvent API guards.
2. Employee creates draft → submits review → editor publishes → anonymous reader sees summary/article.
3. Admin uploads JPEG/PNG/WebP; reject wrong MIME, SVG and >5 MiB files.
4. Unsubscribed reader sees VIP preview; verified payment activates access; expiration removes it.
5. Duplicate payment callbacks and simultaneous checkouts create no duplicate subscription or lost extension.
6. Own bookmarks/messages/notifications are isolated from another user's account.
7. Password reset cannot be reused and old access/refresh tokens stop working.
8. Real-device mobile login, refresh, share, upload-dependent reading and FCM behavior under offline/background conditions.
9. Verify Persian RTL layouts on small screens, keyboard-only operation and enlarged text.
10. Validate backup restoration, readiness checks, graceful termination and pool capacity at target traffic.
