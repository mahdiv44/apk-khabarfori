# Security boundaries

Implemented safeguards:

- bcrypt password hashing (cost 12), minimum password length and UTF-8 bcrypt byte limit.
- Short-lived JWT access tokens with issuer/audience/algorithm/type checks.
- Database token-version revocation on password change/logout/role changes; active-user check.
- Hashed refresh tokens and transactional single-use rotation; hashed, expiring, one-use reset tokens.
- Permission checks in NestJS; public registration cannot assign roles.
- Private drafts hidden with 404, VIP bodies removed server-side, internal directory permission-gated.
- Message ownership isolation and privileged editor replies.
- ValidationPipe whitelisting and rejection of unexpected fields; typed enums and input limits.
- Archive semantics for news deletion and audit records for publication/role changes.
- Prisma parameterization and UUID parsing at record routes; database constraints and unique keys.
- Helmet and configured CORS; per-process request throttling with tighter auth limits.
- HttpOnly/SameSite cookies, HTTPS Secure cookies and same-origin BFF mutation checks.
- Images limited to 5 MiB and checked by byte signature, with random storage keys. Covers are public assets.
- Payment amount/currency snapshots, idempotency keys, HMAC callbacks, independent verification and transactional entitlement activation.
- CSV output quotes fields and prefixes formula-leading values to reduce spreadsheet formula injection.
- RLS enabled without anonymous policies; no Supabase service key in clients.

## Explicit gaps

These controls are not a security certification. Public launch still needs:

- Verified email/phone ownership (registration currently does not send an OTP), abuse monitoring and MFA/step-up authentication for privileged accounts.
- A production recovery-delivery provider with uniform error/timing behavior to avoid identity enumeration.
- Distributed rate limiting and trusted-proxy/IP configuration for the actual ingress. The BFF currently appears as a single client IP to the API; production throttling should use a securely established client identity.
- A refresh-token family/reuse policy if full-session family revocation is required. Tokens are single-use, but concurrent browser refreshes can make one request fail and require retry.
- Durable notification jobs, device-token lifecycle handling and retry/cleanup. The Firebase sender exists as a service but is not a complete queued delivery subsystem.
- Verified image decoding/re-encoding, scanning, retention and orphan cleanup. Signature checks alone do not prove a file is harmless.
- Moderation, comment abuse controls, editorial approval policy, account disable/delete workflows and full audit retention.
- Provider-specific refund/dispute handling, callback replay monitoring, and store purchase integration where needed.
- Operational secrets management, dependency scanning, backup restoration tests, incident response and an external security review.

Never put confidential media in the public cover-image bucket. Never trust a role label in UI state as authorization. Never grant VIP access simply because a browser reports payment success.
