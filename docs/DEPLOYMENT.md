# Deployment and production builds

## Environment ownership

| Setting | Lives in | Purpose |
|---|---|---|
| `DATABASE_URL` | API secret store | Pooled PostgreSQL runtime connection |
| `DIRECT_URL` | Migration job secret store | Direct/session database connection for Prisma migrations |
| `JWT_SECRET` | API secret store | At least 32 random bytes, no checked-in value |
| `CORS_ORIGINS` | API runtime | Comma-separated exact allowed browser origins |
| `KHABARFORI_API_URL` | Next.js/Sites server runtime | API origin without `/api/v1` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | API only | Media storage server credentials |
| `SUPABASE_MEDIA_BUCKET` | API runtime | Public cover-image bucket, default `news-covers` |
| `PAYMENT_*` | API secret store | Trusted payment adapter and HMAC secret |
| `IDENTITY_DELIVERY_*` | API secret store | Password-reset delivery adapter |
| `GOOGLE_APPLICATION_CREDENTIALS` | API runtime | Mounted Firebase service-account credential file |
| `API_URL` | Flutter build definition | HTTPS API URL including `/api/v1` |
| `PUBLIC_WEB_URL` | Flutter build definition | Public origin for article sharing |

Do not prefix secrets with `NEXT_PUBLIC_`, put them in Flutter definitions, or commit real `.env` files. The examples are placeholders, not usable production credentials. Node does not load `.env` automatically in the supplied executable; use Docker `env_file`, an environment loader, or your process manager.

## Supabase PostgreSQL

1. Create a Supabase project and a dedicated database role following the official [Prisma integration guide](https://supabase.com/docs/guides/database/prisma).
2. Set runtime `DATABASE_URL` to the pooler connection. The pinned Prisma 6 schema uses `DIRECT_URL` for migration connectivity. Confirm the connection mode and parameters for your project with the [Prisma 6 Supabase guide](https://www.prisma.io/docs/orm/v6/overview/databases/supabase).
3. Run the migration once as a release job: `npm --prefix backend run db:migrate`. Do not run development migration generation on a production database.
4. Run the seed with a unique initial admin identity. It inserts taxonomy, roles and plans idempotently and does not overwrite existing users.
5. Keep Supabase Data API off if unused. Initial migrations enable RLS without end-user policies; production access is through NestJS and the appropriately privileged Prisma role.
6. Set a small pool budget per replica, monitor connections, configure backups and verify restoration. A free-tier project is useful for development but is not a million-user deployment plan.

## Storage

Create `news-covers` for public article covers. Public covers are not suitable for confidential attachments. Only NestJS holds the service key. Clients upload multipart files to `/media`; the API checks permission, size and byte signature and generates a random object key. SVG/HTML and arbitrary MIME types are rejected. Production hardening should add image decoding/re-encoding, decompression-bomb limits, scanning, metadata stripping and asynchronous cleanup.

## Container deployment

`docker compose up --build -d` creates local PostgreSQL, a one-shot migration job, API and Next.js admin. The supplied ports bind to localhost. Place a TLS reverse proxy/load balancer in front for remote use. Do not expose PostgreSQL publicly.

Use managed secret injection rather than a checked-in `.env`. Keep migrations a single coordinated job before application rollout. Set `ENABLE_API_DOCS=false` for an ordinary public deployment. Run the API as non-root, monitor `/api/v1/health`, and configure request/response size limits at the ingress.

The API container currently retains Prisma CLI and development dependencies so its Compose migration and seed commands work. For hardened deployments split a migration image from a pruned API runtime image, build an SBOM and scan/pin base-image digests.

## Next.js

The production build is separate from the Sites Worker build:

```bash
npm ci
node scripts/prepare-next-admin.mjs
npm --prefix apps/admin run build
npm --prefix apps/admin start
```

`production/Dockerfile.admin` packages standalone output. Runtime configuration changes do not require embedding a backend URL into browser JavaScript. The BFF performs same-origin mutation checks and never exposes token pairs in its JSON responses. Deploy behind HTTPS so session cookies are Secure.

The desktop newsroom is the initial screen. A public reader can be opened with `?view=public`; access to backend administrative operations is still enforced independently. UI navigation visibility is not an authorization boundary.

## Android APK and iOS web app

The revised targets are **Flutter Android APK** and **mobile web on iOS**. Native iOS signing and Xcode are no longer required for this delivery.

The Android bootstrap creates the Android runner, adds internet/notification permissions and sets the display name. `mobile/build-apk.sh` checks a real HTTPS NestJS health endpoint before building. The GitHub Actions workflow `android-apk.yaml` produces a downloadable APK artifact after analysis/tests/build succeed. Review artifacts are debug-signed. Release artifacts require the owner's signing secrets and never silently fall back to debug signing. No APK has been built in this environment.

The iPhone web app is served at `/mobile`. It includes a standalone manifest, PNG home-screen icons, mobile bottom navigation and safe-area padding. Add it from Safari using Share → Add to Home Screen. The service worker caches only a generic offline page; account/API/premium content is never cached. Real-device Safari installation and iOS web push have not been validated; web push is not implemented by this change.

See [Persian delivery guide](MOBILE-DELIVERY-FA.md) for exact steps and the current delivery status. See [Flutter Android release documentation](https://docs.flutter.dev/deployment/android) for signing requirements.

## Payment and external social providers

Configure and test a real payment adapter using the API contract. Verify success, failure, duplicate and out-of-order callbacks, currency units and subscription extensions against a provider sandbox. The checkout remains unavailable without configuration.

`SocialProvider` is an extension contract. There is no fabricated Instagram data and no live Instagram integration. Implement a provider using authorized official access, consent and token lifecycle management; persist snapshots separately for reporting.

## Release gates

Run the CI and database integration checks, confirm mobile builds on both platforms, test backups/restores, rotate seed credentials, add phone/email ownership verification, verify payment and notification delivery, and conduct security/load testing against your actual topology. Distributed rate limiting and analytics queues are necessary before horizontal scale.
