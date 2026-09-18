# ShajSutro — UI/UX Design Specification

## 1. Design principles

- **Clarity over decoration:** show price, availability, delivery estimate, payment status, and next action prominently.
- **Mobile-first commerce:** design narrow screens first, then enhance for tablet and desktop.
- **Trust through evidence:** use verified reviews, transparent fees, clear status labels, and consistent confirmation states.
- **Progressive disclosure:** keep the primary action visible while placing secondary details in expandable sections.
- **Operational density:** allow admin users to scan, filter, review, and act without unnecessary navigation.
- **Accessible by default:** provide keyboard navigation, visible focus, sufficient contrast, semantic labels, and reduced-motion support.

## 2. Information architecture

### Storefront

- Home
- Shop / category listing
- Search results
- Product detail
- Cart
- Checkout
- Order confirmation
- Track order
- Account
  - Profile
  - Addresses
  - Orders
  - Wishlist
- Careers
- Contact / support

### Admin

- Dashboard
- Products
- Categories
- Orders
- Customers
- Promo codes
- Messages
- Notifications
- Job applications
- Subscribers
- Staff and permissions
- Settings

## 3. Key user flows

### Purchase flow

1. Landing page or search.
2. Browse or filter a category.
3. Open product detail and select a variant.
4. Add to cart.
5. Review cart and validate promo code.
6. Enter contact and address information.
7. Select delivery and payment method.
8. Review server-validated totals.
9. Confirm order and receive the order identifier.

### Order-operator flow

1. Open dashboard notification or order queue.
2. Filter by payment state, fulfillment state, or date.
3. Open order detail.
4. Verify address, items, stock, and payment evidence.
5. Confirm, hold, cancel, or request clarification.
6. Transition status.
7. Trigger configured customer notification.
8. Review the audit history.

## 4. Screen specifications

| Screen | Primary elements | Critical states |
|---|---|---|
| Home | Header, search, categories, promotion, featured products | Loading, empty, unavailable promotion |
| Product listing | Filter drawer, sort, product grid, pagination/load more | No results, slow network, invalid filter |
| Product detail | Gallery, price, variants, stock, delivery summary, CTA, reviews | Out of stock, invalid variant, empty reviews |
| Cart | Items, quantity controls, subtotal, promo, delivery estimate, checkout CTA | Empty cart, stale item, stock changed |
| Checkout | Contact, address, location, payment, summary, consent | Validation error, payment pending, duplicate submit |
| Order detail | Timeline, items, address, payment summary, invoice action | Cancelled, refunded, verification pending |
| Admin dashboard | KPI cards, trends, low-stock table, order queue | No data, limited permissions |
| Admin order detail | Customer, items, payment, fulfillment controls, audit history | Invalid transition, missing evidence |
| Admin product editor | Identity, media, category, price, variants, inventory, visibility | Unsaved changes, validation error |

## 5. Component and visual system

- Use neutral surfaces with one strong brand accent and semantic colors for success, warning, danger, and information.
- Use a consistent 4px or 8px spacing scale, predictable card radius, and restrained shadows.
- Define typography levels for display, page heading, section heading, body, metadata, and caption.
- Preserve product-image aspect ratios and avoid layout shift.
- Combine status colors with text or icons; never use color alone.
- Use one primary action per context: Add to cart, Continue checkout, Confirm order, or Update status.
- Make tables support alignment, row hover, filter state, pagination, and responsive overflow.
- Require explicit confirmation for destructive actions and explain the consequence.

## 6. Interaction and content rules

- Show inline validation beside the relevant field and summarize errors at the top of long forms.
- Preserve user input after recoverable errors.
- Disable duplicate submissions while requests are pending.
- Use skeleton loading for predictable regions and clear empty states for zero records.
- Confirm irreversible or high-impact actions with a modal that names the object and action.
- Use Bangla-friendly address labels and copy where appropriate while keeping technical admin terminology consistent.

## 7. UX quality gates

- Keyboard-only completion of search, product selection, cart, checkout, and admin status updates.
- Responsive review at 360px, 768px, 1024px, and wide desktop widths.
- No critical flow depends on hover, color perception, or a specific pointer device.
- Loading, empty, success, error, and permission-denied states exist for every critical screen.
- Replace placeholder screenshots with real UI evidence before final report submission.
