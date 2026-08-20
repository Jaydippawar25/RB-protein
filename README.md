# RB_Protein

A production-ready nutrition e-commerce platform for protein and oats,
built with React, Tailwind CSS, and Firebase.

## Stack

- **Frontend**: React 18, React Router DOM, Tailwind CSS, Recharts
- **Backend**: Firebase Authentication, Firestore, Storage, Cloud Functions
- **Auth**: Firebase Auth (email/password + Google), with JWT (Firebase ID
  token) custom-claims for role-based access — see `src/utils/jwt.js`
- **AI**: Cloud Function proxy (`functions/ai.js`) backing a fitness
  chatbot, nutrition recommendations, and product suggestions

## Roles

- **Customer** — browse, wishlist, cart, checkout, track orders, subscribe, macro calculator
- **Seller** — list products (pending admin approval), manage own inventory, view their orders
- **Admin** — user management, seller approval, product moderation, full product/inventory/order management, revenue & sales analytics

## Folder structure

```
rb-protein/
├── src/
│   ├── firebase/          # Firebase SDK init + auth/firestore/storage helpers
│   ├── context/           # AuthContext, CartContext, ThemeContext
│   ├── utils/              # jwt.js, macroCalculator.js, constants.js
│   ├── services/           # productService, orderService, wishlistService,
│   │                       # subscriptionService, aiService
│   ├── components/
│   │   ├── common/         # Navbar, Footer, Loader, ProtectedRoute, ThemeToggle
│   │   ├── product/        # ProductCard, ProductGrid, ProductFilters
│   │   ├── cart/           # CartItem, CartSummary
│   │   ├── chatbot/        # ChatbotWidget (AI fitness assistant)
│   │   └── admin/          # DashboardLayout, StatCard (shared by admin/seller)
│   ├── pages/
│   │   ├── customer/       # Home, ProductListing, ProductDetail, Cart, Checkout,
│   │   │                   # Wishlist, OrderHistory, OrderTracking, Subscriptions,
│   │   │                   # MacroCalculator, Profile
│   │   ├── auth/            # Login, Register
│   │   ├── admin/           # AdminDashboard, UserManagement, SellerApproval,
│   │   │                    # ProductModeration, ProductManagement, InventoryManagement,
│   │   │                    # OrderProcessing, RevenueAnalytics, SalesAnalytics
│   │   └── seller/          # SellerDashboard, SellerProducts, SellerOrders
│   └── routes/AppRoutes.jsx
├── functions/               # Cloud Functions: setUserRole, onUserStatusChange, aiChat
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
└── docs/
    ├── FIRESTORE_SCHEMA.md
    └── DEPLOYMENT.md
```

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Firebase config
npm run dev
```

See **docs/DEPLOYMENT.md** for full Firebase project setup, Cloud Functions
deployment, security rules, and hosting instructions. See
**docs/FIRESTORE_SCHEMA.md** for the full collection/field reference.

## Design

Dark-first "modern fitness brand" theme: near-black surfaces
(`brand-black`/`brand-surface`), a single acid-green accent (`brand-green-500`,
`#39C92E`), Rajdhani display type for headings, Inter for body text. Toggle
light/dark from the navbar; preference persists in `localStorage`.

## Notes on scope

This is a complete, working scaffold — not a toy demo. Auth, cart, wishlist,
checkout (with transactional stock decrement), order tracking, subscriptions,
the macro calculator, and every admin/seller screen are wired to real
Firestore reads/writes. Two things are intentionally left as integration
points rather than fully built out, since they depend on your own accounts:

1. **Payment gateway** — checkout records the order and marks payment
   `pending`; wiring Razorpay/Stripe is a few lines in `Checkout.jsx` plus a
   webhook Cloud Function (documented in DEPLOYMENT.md §9).
2. **LLM provider** — `functions/ai.js` has the full request/response
   contract and prompt templates ready; drop in your Anthropic/OpenAI call
   in `callLLM()`.
