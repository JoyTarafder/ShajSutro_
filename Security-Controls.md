# ShajSutro — Security Controls

## 1. Identity and authentication

- Hash passwords with a maintained password-hashing library and an approved work factor; confirm the actual library and cost in code.
- Enforce email verification before sensitive account actions where required by product policy.
- Use short-lived access tokens or secure sessions with a documented refresh and revocation strategy.
- Invalidate sessions or tokens after password change, account block, or credential compromise.
- Validate Google OAuth tokens through the provider's supported verification mechanism.
- Avoid account-enumeration leaks in registration, login, password reset, and public tracking responses.

## 2. Authorization and tenant-safe access

- Apply authentication, staff-role, module-permission, and root-admin guards as separate concerns.
- Enforce ownership checks on every customer order, invoice, address, and review operation.
- Keep root-admin actions separate from sub-admin actions.
- Default new permissions to deny; grant only modules required for a staff member's job.
- Test IDOR cases with another customer's identifiers and with missing or altered role claims.

## 3. Input, output, and API protection

- Validate body, query, path, and multipart inputs against explicit schemas.
- Allow-list sortable fields and filter operators to prevent query abuse.
- Apply security headers, disable framework fingerprinting, configure strict CORS, and use HTTPS outside local development.
- Rate-limit authentication, OTP, password reset, public tracking, contact, newsletter, and upload routes.
- Use bounded pagination, request-size limits, timeouts, and safe error responses.
- Sanitize or safely render user-generated reviews, messages, and profile fields.

## 4. Commerce and transaction integrity

- Recompute price, discount, delivery fee, tax/VAT, and total on the server.
- Use atomic stock updates or database transactions to prevent overselling.
- Make order creation idempotent and protect against duplicate submissions.
- Validate promo rules on the server and prevent usage-limit races.
- Separate payment intent, submitted transaction ID, verification state, refund state, and fulfillment state.
- Never log passwords, raw tokens, OTPs, payment secrets, or complete sensitive personal data.

## 5. File and storage security

- Allow only required MIME types and extensions for CVs and other uploads.
- Enforce file-size, filename, path, and upload-count limits.
- Generate server-side storage keys; never use user-provided paths.
- Store files outside the public web root or behind authorized download endpoints.
- Scan or quarantine files where the hosting environment supports it.
- Restrict resume access to authorized staff and define deletion/retention rules.

## 6. Data protection and operations

- Store secrets only in environment or secret-management systems; never commit `.env` files.
- Use least-privilege database credentials and separate environments.
- Encrypt transport and use provider encryption at rest where available.
- Maintain audit logs for staff access, permission changes, order state changes, payment verification, account blocks, and destructive actions.
- Monitor authentication anomalies, repeated failures, rate-limit hits, unexpected admin activity, and database errors.
- Maintain dependency updates, vulnerability scanning, backup verification, incident contacts, and a breach-notification procedure.

## 7. Security verification checklist

### Authentication and authorization

- [ ] Every protected route has an authentication test.
- [ ] Every admin route has role and module-permission tests.
- [ ] Customers cannot access another customer's orders, invoices, addresses, reviews, or files.
- [ ] Sessions or tokens are invalidated after password change and account block.

### Validation and API protection

- [ ] Body, query, path, and upload inputs reject invalid values.
- [ ] Pagination and filter parameters are bounded.
- [ ] Rate limits work for login, OTP, reset, tracking, contact, newsletter, and uploads.
- [ ] Responses do not expose stack traces, secrets, passwords, OTPs, or sensitive fields.
- [ ] Security headers, CORS, and HTTPS are verified in the target environment.

### Commerce protection

- [ ] Client-supplied totals are ignored.
- [ ] Stock cannot become negative under concurrent order attempts.
- [ ] Duplicate order submissions are idempotent.
- [ ] Promo-code usage limits cannot be bypassed by races.
- [ ] Payment and fulfillment states are independently auditable.

### Operations

- [ ] Secrets are absent from source control and logs.
- [ ] Database backups are tested through a restore drill.
- [ ] Audit logs cover staff access, permission changes, orders, payments, blocks, and destructive actions.
- [ ] Dependency and vulnerability checks run in CI or release review.
