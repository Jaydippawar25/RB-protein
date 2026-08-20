# RB_Protein — Firestore Schema

Firestore is schemaless, but the app assumes the shapes below. Timestamps are
Firestore `serverTimestamp()` values unless noted. Money fields are numbers in INR (₹).

---

## `users/{uid}`
Mirrors the Firebase Auth user. Document ID = Firebase Auth UID.

| Field | Type | Notes |
|---|---|---|
| uid | string | matches Auth UID |
| name | string | |
| email | string | |
| role | `'customer' \| 'seller' \| 'admin'` | source of truth is the JWT custom claim; kept in sync by Cloud Functions |
| status | `'active' \| 'pending_approval' \| 'suspended' \| 'rejected'` | sellers start `pending_approval` |
| photoURL | string | |
| phone | string | |
| addresses | array\<object\> | saved shipping addresses |
| createdAt / updatedAt | timestamp | |

## `products/{productId}`

| Field | Type | Notes |
|---|---|---|
| name | string | |
| slug | string | |
| category | `'protein' \| 'oats' \| 'accessories'` | |
| brand | string | |
| sellerId | string | uid of the seller who listed it (empty for admin-owned catalog) |
| price | number | selling price |
| mrp | number | strike-through price |
| stock | number | decremented atomically on order placement |
| images | array\<string\> | Storage download URLs |
| macros | object | `{ calories, protein, carbs, fat, fiber }` per serving |
| flavors | array\<string\> | |
| sizes | array\<string\> | |
| rating | number | denormalized average, recomputed on new review |
| reviewCount | number | |
| status | `'pending' \| 'approved' \| 'rejected'` | moderation state |
| tags | array\<string\> | used by client-side search |
| description | string | |
| createdAt / updatedAt | timestamp | |

## `orders/{orderId}`
Document ID convention: `${userId}_${timestamp}` (see `orderService.placeOrder`).

| Field | Type | Notes |
|---|---|---|
| userId | string | |
| items | array\<object\> | `{ productId, name, price, qty, variant }` |
| subtotal / shipping / tax / total | number | |
| address | object | `{ line1, city, state, pincode, phone }` |
| paymentMethod | `'card' \| 'upi' \| 'cod'` | |
| paymentStatus | `'pending' \| 'paid' \| 'failed'` | updated by payment webhook (Cloud Function) |
| status | `'placed' \| 'confirmed' \| 'packed' \| 'shipped' \| 'out_for_delivery' \| 'delivered' \| 'cancelled'` | |
| trackingEvents | array\<object\> | `{ status, timestamp, note }`, appended on each status change |
| createdAt / updatedAt | timestamp | |

Stock is decremented **transactionally** inside `placeOrder` so concurrent checkouts can't oversell.

## `cart/{uid}`
One document per user (guests use `localStorage` instead).

| Field | Type |
|---|---|
| items | array\<object\> — `{ productId, name, price, image, qty, variant }` |
| updatedAt | timestamp |

## `wishlist/{uid}`
One document per user.

| Field | Type |
|---|---|
| productIds | array\<string\> |

## `subscriptions/{subscriptionId}`

| Field | Type | Notes |
|---|---|---|
| userId | string | |
| planId | `'starter' \| 'athlete' \| 'elite'` | |
| planName | string | |
| productIds | array\<string\> | curated items for the plan |
| frequency | `'weekly' \| 'biweekly' \| 'monthly'` | |
| price | number | |
| status | `'active' \| 'paused' \| 'cancelled'` | |
| nextDeliveryDate | timestamp \| null | |
| createdAt | timestamp | |

## `reviews/{reviewId}`

| Field | Type | Notes |
|---|---|---|
| productId | string | |
| userId | string | |
| userName | string | denormalized for display |
| rating | number | 1-5 |
| comment | string | |
| createdAt | timestamp | |

A Firestore trigger (add if needed) can recompute `products/{id}.rating` and
`.reviewCount` whenever a review is written.

---

## Recommended composite indexes

Firestore prompts you to create these the first time each query runs in
production. Create them proactively with `firebase deploy --only firestore:indexes`,
or click the console error link. Expect indexes for:

- `products`: `status ASC, category ASC, price ASC`
- `products`: `status ASC, createdAt DESC`
- `orders`: `userId ASC, createdAt DESC`
- `orders`: `status ASC, createdAt DESC`

## Scaling notes

- **Search**: Firestore has no native full-text search. `productService.listProducts`
  does a client-side substring filter — fine for small/medium catalogs. At
  scale, sync `products` into Algolia or Typesense via a Cloud Function `onWrite` trigger.
- **Analytics**: `AdminDashboard` / `RevenueAnalytics` aggregate raw `orders`
  documents on read. Past a few thousand orders, replace this with a scheduled
  Cloud Function that pre-aggregates into a `dailyStats/{date}` collection.
