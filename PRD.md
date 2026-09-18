# ShajSutro — Product Requirements Document

## 1. Product definition

ShajSutro is a Bangladesh-focused fashion and lifestyle commerce platform with two connected experiences:

- A customer storefront for product discovery, shopping, checkout, order tracking, account management, reviews, and support.
- An admin operations suite for catalog, inventory, orders, promotions, customers, applications, messages, notifications, and analytics.

The initial product should be treated as a modular monolith: Next.js 14 App Router and React 18 on the frontend, with a Node.js 20 / Express 4 backend and MongoDB Atlas through Mongoose. Redis, external payment gateways, object storage, and virtual try-on are optional integrations until verified.

## 2. Problem statement

Customers need a trustworthy, localized way to browse fashion products, understand delivery costs, place orders, submit Bangladesh-compatible payment information, and track fulfillment. Operators need a single workspace to maintain the catalog, validate orders, manage stock, respond to customers, and monitor business performance.

## 3. Goals

- Make product discovery fast, clear, and mobile-first.
- Support Bangladesh-specific divisions, districts, upazilas, addresses, and delivery pricing.
- Prevent client-side price or stock manipulation through server-side recalculation.
- Give operators reliable catalog, inventory, order, promotion, and customer workflows.
- Provide auditable authentication, authorization, order-status, and payment-verification events.
- Establish a measurable foundation for future omnichannel and analytics capabilities.

## 4. Non-goals for the first production milestone

- Microservice decomposition.
- Native mobile applications.
- Automated warehouse or courier integrations.
- Live payment-gateway settlement unless verified end to end.
- AI-based virtual try-on without defined assets, privacy handling, and performance budgets.
- Advanced real-time analytics unsupported by available event data.

## 5. Personas

| Persona | Need | Success signal |
|---|---|---|
| Guest shopper | Find a suitable product and understand delivery cost | Reaches a product or checkout without confusion |
| Registered customer | Reorder, manage addresses, and track orders | Completes repeat purchase with fewer steps |
| Catalog operator | Maintain accurate products and variants | Product changes publish without engineering help |
| Order operator | Verify, process, and communicate order state | Orders move through the lifecycle with an audit trail |
| Root administrator | Control staff access and business configuration | Permissions remain least-privilege and reviewable |
| Applicant/support visitor | Submit an application or inquiry | Submission receives confirmation and internal status |

## 6. MVP functional requirements

### Customer storefront

- Browse visible products by category, search term, price, color, size, badge, and sort order.
- View product details, images, variants, stock, description, ratings, reviews, and related items.
- Add, update, and remove cart items; persist the cart across reloads.
- Save wishlist items if supported by the actual data model.
- Apply and remove promo codes with server-side validation.
- Complete checkout with contact information, Bangladesh administrative location, address, payment method, and order review.
- Support COD and verified mobile-banking transaction submission if confirmed as the real business flow.
- View confirmation, order history, order detail, status timeline, and invoice where available.
- Track an order through a protected public lookup using an order identifier and a second verification value.
- Register, verify email, log in, reset password, update profile, and manage saved addresses.
- Submit inquiries, newsletter subscriptions, and job applications where enabled.

### Admin operations

- Dashboard with orders, sales, revenue, low-stock items, and top products.
- Catalog management for products, images, variants, prices, stock, categories, and visibility.
- Category management for names, slugs, descriptions, hierarchy, icons, and visibility.
- Order search, filtering, payment verification, status updates, invoices, and notes.
- Promotion management for percentage or fixed discounts, expiry, minimum spend, maximum discount, and usage limits.
- User inspection, account blocking/unblocking, and root-admin/sub-admin permissions.
- Message and notification triage.
- Application and subscriber management where enabled.

## 7. Core business rules

- Product price, discount, shipping fee, and stock are recalculated from server-side records during order creation.
- An order cannot be accepted if requested quantity exceeds verified stock.
- A promo code must satisfy active state, date window, minimum order, usage limit, and discount constraints.
- Customers can access only their own protected orders, invoices, addresses, and profile data.
- Admin order transitions validate the current state and record actor, timestamp, previous state, and new state.
- Payment status and transaction identifiers are separate from fulfillment status.
- Public tracking responses return only the minimum necessary information.

## 8. Order state model

`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered`

Alternative terminal states: `Cancelled`, `Refunded`, or `Failed` where supported by the verified payment and fulfillment process.

Every transition should validate the previous state, record an audit event, and trigger only configured notifications.

## 9. Success metrics

- Product-list-to-product-detail click-through rate.
- Add-to-cart rate and checkout completion rate.
- Checkout validation failure rate.
- Order confirmation and cancellation rate.
- Median API response time for catalog and checkout endpoints.
- Stock discrepancy rate.
- Time from order placement to confirmation.
- Admin task completion time.
- Authentication failure, lockout, and suspicious-request rates.

## 10. MVP acceptance criteria

- A customer can discover a product, add a valid variant, submit checkout, and receive a durable order record.
- The backend ignores client-provided totals and derives the final amount from database records.
- An operator can move an order through valid states and see its complete history.
- Unauthorized users cannot access admin routes, another customer's orders, or sensitive fields.
- Product, category, order, and user workflows work on mobile and desktop layouts.
- Critical flows have automated API tests and a documented manual verification checklist.

## 11. Open decisions

- Is payment COD-only, manual mobile-banking verification, or connected to a live gateway?
- Is the application deployed, and which frontend, backend, database, storage, and mail environments are real?
- Are Redis, PDF invoices, Google OAuth, CV storage, and virtual try-on implemented and tested?
- Are prices inclusive or exclusive of VAT?
- What is the authoritative shipping-rate table?
- What are the retention and deletion rules for customer data, transactions, messages, and resumes?
