# HelperBuddy — Interview Preparation

---

## STEP 2: PROJECT EXPLANATIONS

### Professional Summary
> HelperBuddy is a full-stack home services marketplace built with **Next.js 15, MongoDB Atlas, and Razorpay**. It implements a three-role system (Customer, Service Provider, Admin) with OTP-based authentication, a service approval workflow, shopping cart with payment integration, wallet/referral system, and a comprehensive admin dashboard with analytics. The platform enables customers to discover, book, and pay for home services while giving providers a self-service portal to list services and track income.

### Beginner-Friendly Explanation
> Think of it like **Urban Company** but simpler. People can go to our website, find home services like cleaning or plumbing, add them to a cart, and pay online. Service providers can sign up, list what they offer, and the admin approves it. There's also a wallet system where users can get referral bonuses.

### HR Explanation
> I built a marketplace connecting homeowners with service providers. It handles the complete lifecycle — from service discovery to booking and payment. I worked with a modern tech stack including React, Next.js, and MongoDB, and implemented features like secure authentication, payment processing with Razorpay, and an admin dashboard with revenue analytics.

### Technical Explanation
> It's a Next.js Pages Router application with TypeScript, using Mongoose ODM to interact with MongoDB Atlas. The API layer uses Next.js API routes implementing RESTful patterns. Authentication uses a custom OTP flow via the Resend email service with bcrypt password hashing. Payment is handled through Razorpay's order creation API. State management uses React Context for the cart. The admin panel is a sidebar-navigated SPA with CRUD for services, a service approval workflow (ServiceRequest → Service promotion), wallet management with MongoDB transactions for atomicity, and Recharts-based analytics dashboards.

---

## TIMED INTRODUCTIONS

### 30-Second Intro
> "I built HelperBuddy, a home services marketplace using Next.js, MongoDB, and Razorpay. It has three user roles — customers browse and book services, providers submit service listings, and admins manage everything through a dashboard. Key features include OTP authentication, a shopping cart with payment integration, a wallet system with referral bonuses, and a blog. I handled the full stack — from database schema design to API development to the frontend UI."

### 1-Minute Intro
> "HelperBuddy is a full-stack home services marketplace I built using Next.js 15 with the Pages Router, MongoDB Atlas with Mongoose, and Razorpay for payments. The platform has three roles: customers, service providers, and admins.
>
> Customers can search for services, add them to a cart with automatic 10% discounts, and pay via Razorpay. Service providers go through a separate registration flow where they submit their business info, bank details, and service categories. When providers list a new service, it goes into a 'ServiceRequest' staging table — the admin then approves or rejects it.
>
> The admin panel has six modules: service partner management, service CRUD, a wallet/referral system with MongoDB transactions for atomicity, revenue analytics using Recharts, a blog CMS, and an internal mail system.
>
> I implemented OTP-based authentication using the Resend email API with bcrypt hashing, and used React Context for global cart state management. The app is SEO-optimized with next-seo, JSON-LD structured data, and a dynamic sitemap."

### 3-Minute Detailed Explanation
> "Let me walk you through HelperBuddy in detail.
>
> **Architecture**: It's a Next.js 15 monolith using the Pages Router. The frontend and backend live together — React pages in `src/pages/` and API routes in `src/pages/api/`. MongoDB Atlas is the database, connected via Mongoose with a global connection caching pattern to handle serverless environments.
>
> **Authentication**: I built a custom OTP system. When a user signs up, we send a 6-digit OTP via the Resend email API, verify it server-side using an in-memory store, hash the password with bcrypt (salt rounds 10 for users, 12 for providers), generate a UUID for the user ID, and create the account. Providers have a richer signup with bank info, location, and service categories.
>
> **Core Workflow**: The service lifecycle has a key pattern — providers submit a ServiceRequest, which is essentially a staging table. The admin panel shows these pending requests and can accept or decline. Accepting copies the data to the Service collection and deletes the request. This gives the platform quality control.
>
> **Cart & Payments**: The cart uses MongoDB for persistence — items are stored with a unique productId constraint to prevent duplicates. The cart page calculates a 10% discount, and checkout redirects to an address form passing the total as a query parameter. Razorpay integration creates an order server-side, converting amounts to paise.
>
> **Wallet System**: This was technically interesting because I used MongoDB sessions and transactions. When adding funds, we start a session, create a Transaction document, and atomically update the user's walletBalance using `$inc`. If anything fails, the transaction aborts. The admin can add funds and generate referral codes.
>
> **Admin Panel**: It's a sidebar-navigated dashboard with six sections. The layout component conditionally renders — checking if the route is admin, service page, or regular — and wraps content accordingly. Manage Services has full CRUD with modals. The income dashboard uses Recharts for line charts showing revenue trends and user growth.
>
> **SEO**: I implemented comprehensive SEO — DefaultSeo at the app level, page-specific NextSeo, JSON-LD structured data for services, a dynamic XML sitemap, and proper meta tags in a custom Document.
>
> **State Management**: I chose React Context over Redux for the cart because the state shape is simple — just a count and update functions. The CartProvider wraps the app in the layout and exposes increment/decrement methods.
>
> **What I'd improve**: Move OTP storage from in-memory to Redis for production scalability, add JWT-based session management, implement proper admin authentication (currently it's just a redirect), add rate limiting to APIs, and implement proper error boundaries."

---

## STEP 5: STAR METHOD ANSWERS

### 1. Biggest Challenge — MongoDB Transaction for Wallet System

**Situation**: The wallet system needed atomic operations — when adding funds, both the Transaction record and the User's balance had to update together, or neither should.

**Task**: Implement an atomic credit/debit system that wouldn't leave the database in an inconsistent state if one operation failed.

**Action**: I used `mongoose.startSession()` and `session.startTransaction()` to wrap both operations. I created the Transaction document and used `$inc` to atomically update the user's walletBalance, both within the same session. I also implemented proper error handling with `session.abortTransaction()` in the catch block and `session.endSession()` in the finally block.

**Result**: The wallet system works reliably with full ACID compliance. No orphaned transactions or balance mismatches. This pattern also made it easy to add the admin "Add Funds" feature later.

### 2. Difficult Bug Fixed — Service Request Approval Data Loss

**Situation**: When the admin accepted a service request, the service would sometimes appear incomplete — missing fields like category or providerId.

**Task**: Ensure all data from ServiceRequest transfers correctly to the Service collection during approval.

**Action**: I traced the issue to the accept API where I was manually mapping fields instead of spreading the document. I refactored `api/serviceRequest/accept.ts` to explicitly copy every field (name, description, price, category, available, providerId) from the found ServiceRequest to the new Service document, then delete the request only after successful creation.

**Result**: Zero data loss during approval. The two-step approach (create then delete) ensures we never lose the original request if Service creation fails.

### 3. Feature Implementation — Service Provider Registration

**Situation**: The platform needed a separate, more complex registration for service providers compared to regular users.

**Task**: Build a provider registration system that captures business details, bank information, location, and service categories while maintaining security.

**Action**: I designed the Provider schema with nested objects (contact, location, bank_info, user_info), implemented a dedicated `/api/provider/signup` endpoint with comprehensive validation, used bcrypt with higher salt rounds (12 vs 10 for users) for stronger security, added a pre-save hook that auto-sets username to business name, and implemented duplicate detection checking both contact.email and user_info.email.

**Result**: Providers can register with full business details in a single flow. The schema design supports future features like multi-category providers and branch offices.

### 4. Optimization — MongoDB Connection Caching

**Situation**: In development, every API request was creating a new MongoDB connection, leading to connection pool exhaustion and "MongoError: topology was destroyed" errors.

**Task**: Implement a connection strategy suitable for Next.js serverless API routes.

**Action**: I implemented the global caching pattern in `lib/mongodb.ts` — storing the connection promise on `(global as any).mongoose`. On each request, it checks if a connection already exists before creating a new one. I also removed deprecated Mongoose options (`useNewUrlParser`, `useUnifiedTopology`).

**Result**: Connection count dropped from 50+ in development to just 1 persistent connection. No more topology errors. Hot module reload no longer causes connection leaks.

### 5. Problem Solving — Cart Duplicate Prevention

**Situation**: Users could add the same service to the cart multiple times, creating duplicate entries and incorrect totals.

**Task**: Prevent duplicate items while maintaining a smooth user experience.

**Action**: In the Cart schema, I made `productId` unique. In `api/cart.ts`, before creating a new cart item, I check for an existing item with `Cart.findOne({ productId })`. If it exists, I return the existing item. The ProductCard component uses the CartContext to track the global count and shows appropriate feedback via toast notifications.

**Result**: Users get immediate feedback ("Service added!") without duplicates. The cart count in the header stays accurate across all pages.

---

## STEP 7: LAST-MINUTE REVISION NOTES

### Critical Architecture Points
1. **Pages Router, not App Router** — uses `src/pages/` for routing, `getServerSideProps` for SSR
2. **Two DB connection files** — `lib/mongodb.ts` (cached, primary) and `lib/dbConnect.ts` (legacy)
3. **Mixed TS/JS** — models have both `.ts` and `.js` versions (technical debt)
4. **No middleware** — no auth middleware; admin login has no real validation
5. **Cart is global** — not user-specific (no userId in Cart model)
6. **OTP in memory** — `otpStore` is a plain object, lost on server restart

### Important API Patterns
- All APIs follow `connectDB()` → method check → try/catch → response pattern
- Standard response format: `{ success: boolean, data/error }`
- `mongoose.models.X || mongoose.model("X", Schema)` prevents model re-registration
- Transaction API uses MongoDB sessions for atomicity

### Top 20 Quick-Fire Q&A

1. **Why Next.js?** — Full-stack in one project, API routes, SSR for SEO, file-based routing
2. **Why MongoDB?** — Flexible schema for services/providers with nested objects, easy horizontal scaling
3. **Why not JWT?** — Scope limitation; OTP-only auth was MVP choice. JWT would be the production improvement
4. **Why Context over Redux?** — Simple state (cart count); Redux is overkill for this scale
5. **How do you prevent duplicate cart items?** — `productId: unique` constraint + `findOne` check before insert
6. **How does service approval work?** — ServiceRequest → Admin accepts → copied to Service → request deleted
7. **How is the password stored?** — bcrypt hash, salt rounds 10 (user) / 12 (provider)
8. **Why two salt round values?** — Provider accounts are higher-value targets; stronger hashing warranted
9. **How does the wallet stay consistent?** — MongoDB transactions with sessions, `$inc` atomic operator
10. **What happens if Razorpay fails?** — Error caught server-side, 500 returned; no partial booking created
11. **How do you handle DB connections in serverless?** — Global cache on `(global as any).mongoose`
12. **What's the image strategy?** — Next.js `<Image>` with `remotePatterns: hostname: '**'` (any HTTPS source)
13. **How does the admin panel route?** — Layout checks `router.pathname.startsWith('/admin')`, renders sidebar
14. **What's the blog limit?** — Max 10 blogs, enforced in frontend before API call
15. **How is SEO implemented?** — DefaultSeo + page-level NextSeo + JSON-LD + dynamic sitemap
16. **What ORM do you use?** — Mongoose (ODM, not ORM — document-oriented)
17. **How do reviews work?** — Currently hardcoded on product page; Review model exists but fetching is commented out
18. **What design pattern does the admin use?** — Container/Layout pattern with conditional rendering based on route
19. **How do you handle loading states?** — `useState(true)` for `isLoading`, conditional rendering
20. **What's the deployment target?** — Vercel (Next.js native; config supports it out of box)
