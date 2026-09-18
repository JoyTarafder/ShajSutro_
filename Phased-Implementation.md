# ShajSutro — Phased Implementation Plan

## Phase 0 — Verification and scope lock

**Objective:** Replace README assumptions with evidence from the repository and runtime.

**Deliverables:**

- Verified feature inventory and route inventory.
- Confirmed payment flow, deployment state, storage strategy, mail provider, Redis status, and virtual try-on status.
- Data model and API contract baseline.
- Risk register and decision log.
- Definition of done for MVP.

**Exit criteria:** Every production claim is classified as implemented, partial, planned, or unverified.

## Phase 1 — Foundations and design system

**Objective:** Establish maintainable project and UX foundations.

**Deliverables:**

- Repository conventions, environment templates, linting, formatting, and CI checks.
- Shared UI primitives, typography, color tokens, spacing, buttons, forms, tables, modals, alerts, and status badges.
- Responsive storefront and admin shells.
- API error contract, request IDs, logging baseline, and health checks.
- Authentication, role model, and permission-matrix design.

**Exit criteria:** Critical screens can be implemented consistently from the component system and CI passes on a clean checkout.

## Phase 2 — Catalog and customer discovery

**Objective:** Make the storefront browseable and trustworthy.

**Deliverables:**

- Categories, product listing, search/filter/sort, product detail, variant selection, stock display, and related products.
- Admin product and category management.
- Image validation and media handling.
- Mobile, tablet, and desktop responsive behavior.
- Automated tests for catalog permissions and product visibility.

**Exit criteria:** An operator can publish a product and a customer can discover it without manual database changes.

## Phase 3 — Cart, checkout, and orders

**Objective:** Deliver a secure end-to-end purchase workflow.

**Deliverables:**

- Cart persistence and validation.
- Checkout address and Bangladesh location data.
- Delivery-rate calculation.
- Promo validation.
- Server-side total calculation and stock reservation.
- Order creation, confirmation, customer order history, and admin order queue.
- Confirmed payment-state workflow: COD, manual transaction verification, or a gateway.

**Exit criteria:** Tampered client totals fail safely, duplicate submissions do not create duplicate orders, and valid orders are visible to both customer and operator.

## Phase 4 — Account, communication, and trust features

**Objective:** Complete the customer lifecycle and operational communication.

**Deliverables:**

- Email verification, login, password reset, profile, addresses, and account blocking.
- Order tracking and status timeline.
- Reviews with ownership and moderation rules.
- Invoice generation only after verifying the actual implementation.
- Contact, notification, subscriber, and configured email workflows.

**Exit criteria:** Customers can recover access, see the correct order state, and receive only communications supported by configured integrations.

## Phase 5 — Operations, analytics, and hardening

**Objective:** Improve operator efficiency and production readiness.

**Deliverables:**

- Admin dashboards based on verified data definitions.
- Promotions, applications, messages, subscribers, and staff permission workflows.
- Audit logs, alerting, performance checks, backup, and restore drill.
- Security test suite, dependency review, accessibility review, and usability test.
- Deployment runbook and rollback plan.

**Exit criteria:** Security, reliability, performance, accessibility, and operational checklists are signed off with evidence.

## Phase 6 — Post-MVP enhancements

**Objective:** Add capabilities only after core commerce is stable.

**Candidate enhancements:**

- Live payment gateway integration.
- Courier and shipment integrations.
- Redis caching and invalidation strategy.
- Object storage and image transformation pipeline.
- Advanced analytics and event tracking.
- Virtual try-on after feasibility, privacy, and performance validation.
- Customer segmentation, recommendations, and omnichannel support.

## Delivery governance

- Track each feature with owner, priority, dependency, acceptance criteria, test evidence, and release status.
- Demo completed work using real UI and API evidence rather than placeholder screenshots.
- Maintain a decision log for payment, deployment, storage, pricing, delivery, retention, and privacy.
- Use feature flags for incomplete integrations.
- Do not mark a capability production-ready until its happy path, failure path, authorization path, and operational recovery path are tested.

## Recommended first backlog

1. Verify the repository and runtime.
2. Confirm data models and route contracts.
3. Establish environment and CI checks.
4. Implement design tokens and shared UI primitives.
5. Implement catalog read and admin catalog write flows.
6. Implement cart and checkout server recalculation.
7. Implement order queue and status history.
8. Confirm and implement the real payment workflow.
9. Add authentication, account-recovery, and permission tests.
10. Run security, accessibility, performance, backup, and deployment-readiness reviews.
