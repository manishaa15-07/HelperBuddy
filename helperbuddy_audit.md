# HelperBuddy — Complete Repository Audit & Interview Preparation

> **Auditor**: Senior Software Engineer / Technical Interviewer  
> **Repository**: [HelperBuddy](file:///Users/manisha/Desktop/Projects/HelperBuddy)  
> **Verdict**: This is a **home services marketplace** (like UrbanClap/UrbanCompany) — NOT a healthcare app. Built with Next.js (Pages Router), MongoDB, Razorpay, and Resend.

---

## PHASE 1 — REPOSITORY AUDIT (Every Folder Explained)

### Root Structure

```
HelperBuddy/
├── src/
│   ├── app/              ← App Router layout (barely used — only layout.tsx)
│   ├── components/       ← 2 shared components (JsonLd, ScrollToTop)
│   ├── config/           ← SEO config
│   ├── context/          ← CartContext (React Context for cart state)
│   ├── data/             ← ProductData.js (hardcoded product array)
│   ├── hooks/            ← usePageLoad custom hook
│   ├── lib/              ← DB connections (dbConnect.ts + mongodb.ts — BOTH exist)
│   ├── models/           ← 16 Mongoose models (many duplicates: .js AND .ts versions)
│   ├── pages/            ← All routes (Pages Router — the ACTUAL routing)
│   │   ├── api/          ← All API routes (~26 files)
│   │   ├── admin/        ← Admin dashboard pages
│   │   ├── components/   ← Page-level components (homepage, signup, cart, product, etc.)
│   │   ├── product/      ← Product detail page
│   │   └── about/        ← About page
│   └── styles/           ← Global CSS
├── public/               ← Static assets
└── package.json
```

### Folder-by-Folder Breakdown

| Folder | Purpose | Key Files | Communicates With |
|--------|---------|-----------|-------------------|
| [src/models/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models) | Mongoose schemas for MongoDB | 16 files — User, Provider, Service, Booking, Cart, Blog, Comment, Review, Transaction, Income, Mail, ServiceRequest + duplicate .js versions | API routes via `import` |
| [src/pages/api/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api) | Next.js API Routes (serverless functions) | auth.ts, auth/signup.ts, provider.ts, provider/signup.ts, services.ts, booking.ts, cart.ts, razorpay.ts, transaction.ts, blog.ts, comments.ts, mail.ts, income.ts, serviceRequest.ts, reviews/[productId].ts, users.ts, [id].ts, add.ts | Models (Mongoose), lib/mongodb.ts |
| [src/pages/admin/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/admin) | Admin dashboard | login.tsx, page.tsx, AdminLayout.tsx + 6 sub-pages (service-partners, manage-services, referall-wallet, admin-income, blogs, mails) | API routes via fetch calls |
| [src/pages/components/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/components) | UI components embedded in pages | homepage.tsx (25KB!), signup-page/, Cart/, Product/, service-provider/ (11 subdirectories!), About/, blog/, common/ | API routes, CartContext |
| [src/lib/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/lib) | Database connection utilities | **dbConnect.ts** AND **mongodb.ts** — TWO separate connection files doing the same thing | Used by all API routes |
| [src/context/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/context) | React Context providers | CartContext.tsx — manages cart count state | Header component, Cart pages |
| [src/data/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/data) | Static/hardcoded data | ProductData.js — 10KB of hardcoded product JSON | Homepage component |
| [src/config/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/config) | App configuration | seo.config.ts — default SEO metadata | _app.tsx |
| [src/hooks/](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/hooks) | Custom React hooks | usePageLoad.ts — tracks when all images finish loading | Loading screen components |

---

## PHASE 2 — PROJECT ARCHITECTURE

```mermaid
graph TD
    A["User Browser"] --> B["Next.js Frontend<br/>(Pages Router)"]
    B --> C["Next.js API Routes<br/>(/pages/api/*)"]
    C --> D["Mongoose Models<br/>(16 schemas)"]
    D --> E["MongoDB Atlas<br/>(Cluster0)"]
    C --> F["Razorpay SDK"]
    C --> G["Resend Email API"]
    B --> H["React Context<br/>(CartContext)"]
    B --> I["localStorage<br/>(Cart data)"]
```

### Request Lifecycle — User Signup

```
1. User fills form → pages/components/signup-page/signuppage/signup.tsx
2. Frontend calls → POST /api/auth { action: "send", email }
3. auth.ts generates OTP → Resend sends email
4. User enters OTP → POST /api/auth { action: "verify", email, otp }
5. OTP verified → POST /api/auth/signup { name, email, phone, password }
6. signup.ts → connectDB() → bcrypt hash → User.create()
7. Returns { success: true, user }
```

### Request Lifecycle — Service Booking

```
1. User browses services → GET /api/services
2. Adds to cart → POST /api/cart
3. Checkout → POST /api/razorpay (creates Razorpay order)
4. Payment → POST /api/booking (creates Booking record)
5. Transaction → POST /api/transaction (updates wallet + creates record)
```

> [!CAUTION]
> **CRITICAL FINDING**: There is **NO authentication middleware** on any API route. Every single API endpoint is completely open. Anyone can call `GET /api/users` and dump the entire user database including hashed passwords.

---

## PHASE 3 — DATABASE MASTERY

### All Mongoose Schemas

| Model | Fields | Relationships | Issues |
|-------|--------|---------------|--------|
| [User.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/User.ts) | businessName, email, phoneNumber, password, serviceCategories[], createdAt | None (no refs) | Schema says `businessName` but signup sends `name` — **MISMATCH** |
| [provider.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/provider.ts) | name, categories[], owner_name, contact{phone,email}, location{address,city,state,zip_code}, bank_info{...7 fields}, user_info{user_id,username,email,password} | None | **Password stored inside nested object** — unusual and harder to secure |
| [Service.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/Service.ts) | name, description, price, category, available, providerId(→User) | `providerId` refs `User` | Should ref `Provider`, not `User` |
| [ServiceRequest.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/ServiceRequest.ts) | Identical fields to Service.ts | `providerId` refs `User` | Literally a **copy-paste** of Service schema |
| [Booking.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/Booking.ts) | title, client, status, price, startDate, dueDate, completed, completedDate, address, description, userId(→User), serviceId(→Service) | Refs User + Service | Most fields are optional (no `required: true`) |
| [cart.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/cart.ts) | productId(String!), name, description, price, imageUrl | None | **No userId** — cart is shared globally across ALL users! |
| [blog.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/blog.ts) | title, date, excerpt, content, image, author | None | Straightforward |
| [comment.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/comment.ts) | user, avatar, rating, comment, date, likes | None | No ref to Blog or User — orphaned comments |
| [review.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/review.ts) | productId(→service_users), userId(→users), rating(1-5), comment | Refs service_users + users | **Collection name mismatch**: refs `service_users` but no such model exists |
| [Transaction.js](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/Transaction.js) | userId(→User), type(credit/debit), amount, description, date | Refs User | Uses MongoDB transactions (sessions) — good |
| [income.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/income.ts) | name, earnings, productId, customerId, orders, avgOrderValue | None | productId and customerId are plain Strings, not ObjectId refs |
| [mail.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/mail.ts) | type(inbox/sent), subject, sender, recipient, preview, date, isRead, isStarred, priority, orderID, providerId, isAdminSent | None | No refs — all IDs are plain strings |

> [!WARNING]
> **Duplicate Models**: `User.js` AND `User.ts`, `Service.js` AND `Service.ts`, `Booking.js` AND `Booking.ts` all exist simultaneously. This can cause **silent bugs** where the wrong version is imported.

> [!CAUTION]
> **Hardcoded MongoDB URI with plaintext credentials** in both [dbConnect.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/lib/dbConnect.ts#L3) and [mongodb.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/lib/mongodb.ts#L4):
> ```
> mongodb+srv://ashketchup:hNOHeUGfiql0Zb8v@cluster0.w0z87.mongodb.net/...
> ```
> This is committed to Git. **The database password is publicly exposed.**

---

## PHASE 4 — API MASTERY

| Endpoint | Method | Purpose | Auth? | Request Body | Key Issues |
|----------|--------|---------|-------|-------------|------------|
| `/api/auth` | POST | Send/verify OTP via Resend | ❌ | `{email, otp?, action}` | OTP stored in **process memory** — lost on restart, shared across all serverless instances |
| `/api/auth/signup` | POST | Create user account | ❌ | `{name, email, phone, password}` | Sets `_id` to UUID — breaks Mongoose ObjectId convention |
| `/api/provider` | GET/POST | Get/create provider | ❌ | Various | POST doesn't save hashed password (provider.ts L100 — no password in constructor) |
| `/api/provider/signup` | POST | Create provider (detailed) | ❌ | Full provider object | Properly hashes password |
| `/api/services` | GET/POST | List/create services | ❌ | `{name,description,price,category}` | POST accepts raw `req.body` — no validation on POST |
| `/api/[id]` | GET/PUT/DELETE | CRUD single service | ❌ | Varies | No ObjectId validation — crashes on invalid IDs |
| `/api/add` | POST | Create service (duplicate of /services POST) | ❌ | `{name,description,image,price}` | Missing `category` field — validation will fail |
| `/api/booking` | GET/POST | List/create bookings | ❌ | Full booking | `POST` blindly trusts `req.body` — no validation |
| `/api/cart` | GET/POST/DELETE | Cart operations | ❌ | `{productId,name,imageUrl,price,description,category}` | **No user association** — one shared cart for all users |
| `/api/razorpay` | POST | Create Razorpay payment order | ❌ | `{amount, currency}` | Anyone can create payment orders with any amount |
| `/api/transaction` | GET/POST | Transaction management | ❌ | `{userId, amount, type, description}` | Uses Mongoose sessions — good. But no auth — anyone can credit any wallet |
| `/api/blog` | GET/POST/DELETE | Blog CRUD | ❌ | `{title,excerpt,content,image,date}` | No auth — anyone can create/delete blog posts |
| `/api/comments` | GET/POST/DELETE | Comment operations | ❌ | `{commentId}` | Variable named `Booking` but imports Comment model |
| `/api/mail` | GET/POST | Mail system | ❌ | Mail object | Admin check is hardcoded: `sender === "admin@example.com"` |
| `/api/income` | GET | Fetch income data | ❌ | — | GET only |
| `/api/reviews/[productId]` | GET | Fetch product reviews | ❌ | — | Uses `dbConnect` (different from `connectDB`) |
| `/api/serviceRequest` | GET/POST | Service request management | ❌ | Service data | **Hardcoded providerId**: `"65f1234567890123456789ab"` |
| `/api/serviceRequest/accept` | POST | Approve service request | ❌ | `{id}` | Copies ServiceRequest → Service, deletes original |
| `/api/serviceRequest/decline` | DELETE | Reject service request | ❌ | `{id}` | **No response sent after delete** — client hangs |
| `/api/users` | GET/POST | User CRUD | ❌ | User object | **Exposes ALL users** including passwords |
| `/api/sitemap` | GET | Generate XML sitemap | ❌ | — | |
| `/api/service-user` | ? | Service user operations | ❌ | ? | |

> [!CAUTION]
> **ZERO API routes have authentication**. Not a single one checks for JWT, session, or any token. This means:
> - Anyone can read all users, providers, transactions
> - Anyone can create/delete services, blogs, bookings
> - Anyone can credit any user's wallet

---

## PHASE 5 — AUTHENTICATION FLOW

### What Actually Exists

1. **OTP via Email** ([auth.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/auth.ts)):
   - Generates 6-digit OTP
   - Sends via Resend email API
   - Stores in `const otpStore: Record<string, string> = {}` — **in-memory, per-instance**
   - Verifies OTP and sends welcome email

2. **Password Hashing** ([auth/signup.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/auth/signup.ts)):
   - Uses bcryptjs with salt rounds 10
   - Stores hashed password in DB

### What Does NOT Exist

| Feature | Status |
|---------|--------|
| JWT Token Creation | ❌ **DOES NOT EXIST** — `jsonwebtoken` not even in package.json |
| JWT Verification | ❌ |
| JWT Storage | ❌ |
| Protected Routes | ❌ — Every API is public |
| Auth Middleware | ❌ — No middleware folder, no middleware files |
| Session Management | ❌ |
| Logout | ❌ |
| Token Refresh | ❌ |
| Role-Based Access | ❌ |

### Admin "Authentication"

The admin login at [login.tsx](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/admin/login.tsx) is **completely fake**:
```typescript
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/page');  // Just redirects — doesn't check credentials
};
```
Any person can type ANY email/password and get into the admin panel. Or just navigate directly to `/admin/page`.

---

## PHASE 6 — FEATURE BREAKDOWN

| Feature | Frontend | Backend API | Database | Status |
|---------|----------|------------|----------|--------|
| User Signup | signup component → OTP flow | `/api/auth` + `/api/auth/signup` | User model | ✅ Functional (but schema field mismatch) |
| Provider Signup | signup component | `/api/provider/signup` | Provider model | ✅ Functional |
| Service Listing | Homepage → Product cards | `GET /api/services` | Service model | ✅ Functional |
| Service Detail | `/product/[productId]` | `GET /api/[id]` | Service model | ✅ Functional |
| Cart | Cart component + localStorage | `/api/cart` | Cart model | ⚠️ Partially — no user-specific carts |
| Razorpay Payment | Checkout flow | `POST /api/razorpay` | — | ⚠️ Order creation works, no payment verification |
| Booking Creation | — | `POST /api/booking` | Booking model | ⚠️ Works but no auth |
| Admin Dashboard | 6 sub-pages | Various GET APIs | Multiple | ⚠️ No real auth gate |
| Admin: Manage Services | CRUD UI | `/api/[id]`, `/api/services` | Service | ✅ Full CRUD |
| Admin: Service Partners | Accept/decline requests | `/api/serviceRequest/accept\|decline` | ServiceRequest → Service | ⚠️ Decline has no response |
| Admin: Blogs | Create/delete blogs | `/api/blog` | Blog model | ✅ Functional |
| Admin: Mails | Send/view mails | `/api/mail` | Mail model | ✅ Functional |
| Admin: Income | Revenue dashboard + charts | `GET /api/income` | Income model | ⚠️ Read-only, no income creation logic |
| Admin: Referral & Wallet | Transaction management | `/api/transaction` | Transaction + User | ✅ Uses Mongoose sessions |
| Reviews | Display on product page | `GET /api/reviews/[productId]` | Review model | ⚠️ No POST for creating reviews |
| Comments | Like/delete comments | `/api/comments` | Comment model | ✅ Functional |
| SEO | NextSeo + JSON-LD + Sitemap | `/api/sitemap` | — | ✅ Implemented |
| Service Provider Dashboard | 11 sub-sections (sidebar) | Various | — | ⚠️ Large frontend, unclear API integration |

---

## PHASE 7 — TECHNOLOGY CHOICES

| Technology | Why Chosen | Actual Usage | Concern |
|------------|-----------|-------------|---------|
| **Next.js 15** | Full-stack React framework | Pages Router (not App Router despite having `/app` folder) | Both Pages & App Router exist — confusing |
| **MongoDB Atlas** | NoSQL document DB | Mongoose ODM with 16 models | Hardcoded URI in source code |
| **Razorpay** | Indian payment gateway | Order creation only | No payment verification webhook |
| **Resend** | Transactional email | OTP sending + welcome emails | API key in env vars (proper) |
| **bcryptjs** | Password hashing | Signup routes | Salt rounds = 10 (adequate) |
| **Tailwind CSS** | Utility CSS framework | Used everywhere | Fine |
| **Framer Motion** | Animations | Homepage, cards | Fine |
| **Recharts** | Data visualization | Admin income dashboard | Fine |
| **SweetAlert2** | Modal alerts | UI notifications | Fine |
| **react-toastify** | Toast notifications | Feedback messages | Fine |
| **MUI (Material UI)** | Component library | Icons mainly | Large bundle for just icons |
| **next-seo** | SEO optimization | Meta tags, OG tags | Placeholder URLs ("your-domain.com") |
| **uuid** | Unique ID generation | User signup (_id override) | Breaks Mongoose ObjectId pattern |

### What's NOT in the code but might be on resume:

| Technology | In package.json? | Actually Used? |
|-----------|-------------------|---------------|
| JWT | ❌ | ❌ |
| Socket.IO | ❌ | ❌ |
| Firebase | ❌ | ❌ |
| Cloudinary | ❌ | ❌ |
| Redis | ❌ | ❌ |
| Express (standalone) | ✅ in package.json | ❌ Not imported anywhere |

---

## PHASE 8 — RESUME VERIFICATION

> [!IMPORTANT]
> **I cannot verify your resume bullet points** because you haven't provided the actual resume text for HelperBuddy. Based on what the code shows, here is what you CAN and CANNOT claim:

### What You CAN Truthfully Claim

| Claim | Evidence | Confidence |
|-------|----------|------------|
| Built a home services marketplace with Next.js | Entire codebase | 100% |
| Implemented OTP-based email authentication using Resend | [auth.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/auth.ts) | 100% |
| Integrated Razorpay payment gateway | [razorpay.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/razorpay.ts) | 70% (order creation only, no verification) |
| Built admin dashboard with service management, blog, mail, and income tracking | Admin pages | 100% |
| Used MongoDB with Mongoose for data modeling | 16 models | 100% |
| Implemented MongoDB transactions for wallet operations | [transaction.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/transaction.ts) L22-49 | 100% |
| Password hashing with bcryptjs | signup routes | 100% |
| Service provider registration and management | Provider model + signup | 100% |
| SEO optimization with next-seo and XML sitemap | Present | 90% |

### What You CANNOT Claim

| Claim | Reality | Risk |
|-------|---------|------|
| JWT-based authentication | **No JWT exists in the entire codebase** | 🔴 EXTREME |
| Protected/secured API routes | **Every API is wide open** | 🔴 EXTREME |
| Role-based access control | **Admin login is fake** | 🔴 EXTREME |
| User-specific cart system | **Cart is shared globally** (no userId) | 🔴 HIGH |
| Payment verification | **Only order creation, no verification** | 🟡 MEDIUM |
| Real-time features / Socket.IO | **Not present** | 🔴 HIGH |

---

## PHASE 9 — CRITICAL BUGS & SECURITY ISSUES

### 🔴 CRITICAL

1. **Hardcoded DB credentials committed to Git** — [mongodb.ts L4](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/lib/mongodb.ts#L4): username `ashketchup`, password `hNOHeUGfiql0Zb8v` visible in plaintext
2. **Admin login has zero authentication** — [login.tsx L8-11](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/admin/login.tsx#L8-L11): just does `router.push('/admin/page')` regardless of input
3. **All 26 API routes are completely unprotected** — no auth check anywhere
4. **`GET /api/users` exposes all user data** including hashed passwords — [users.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/users.ts)
5. **OTP stored in process memory** — [auth.ts L5](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/auth.ts#L5): `const otpStore: Record<string, string> = {}`. In serverless (Vercel), each invocation can be a different instance. OTP sent by instance A cannot be verified by instance B.

### 🟡 HIGH

6. **Duplicate DB connection files** — `dbConnect.ts` and `mongodb.ts` both exist with hardcoded URIs. Some API routes use one, some use the other.
7. **Duplicate model files** — User.js/User.ts, Service.js/Service.ts, Booking.js/Booking.ts coexist. Risk of importing wrong one.
8. **Cart has no userId** — [cart.ts](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/cart.ts): the `Cart` model has no user reference. All users share one cart.
9. **`serviceRequest/decline.ts` sends no HTTP response** on success — [decline.ts L20-22](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/serviceRequest/decline.ts#L20-L22): deletes the record but never calls `res.status().json()`.
10. **Hardcoded providerId** — [serviceRequest.ts L32](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/serviceRequest.ts#L32): `providerId: "65f1234567890123456789ab"` — a fake ObjectId.
11. **`comments.ts` imports Comment model as `Booking`** — [comments.ts L3](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/comments.ts#L3): confusing variable naming.
12. **provider.ts POST creates provider without hashed password** — [provider.ts L72-101](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/provider.ts#L72-L101): `password` field is missing from the constructor, but schema requires it.
13. **Review model references non-existent collections** — [review.ts L4](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/models/review.ts#L4): refs `service_users` and `users` but actual models are `User` and `Service`.
14. **`provider.ts` has unreachable code** — [provider.ts L123](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/pages/api/provider.ts#L123): `return res.status(405)` after the POST handler's try/catch — dead code.

### 🟠 MEDIUM

15. **Signup creates User with `_id: uuidv4()`** — breaks Mongoose's native ObjectId, causes issues with `findById()` and populate.
16. **User schema says `businessName` but signup sends `name`** — field mismatch between schema and API.
17. **No pagination on any GET endpoint** — `Service.find()`, `User.find()`, `Booking.find()` all return entire collections.
18. **No input sanitization** — all APIs trust `req.body` directly. Mongoose injection possible.
19. **`mongodb.ts` logs "Connected to MongoDB" at import time** — L26: `console.log('Connected to MongoDB')` runs when the module is imported, not when actually connected.
20. **CartContext calls `/api/cart/count`** — [CartContext.tsx L29](file:///Users/manisha/Desktop/Projects/HelperBuddy/src/context/CartContext.tsx#L29): this API endpoint does not exist.

---

## PHASE 10 — INTERVIEW QUESTIONS (100 Repository-Specific Questions)

### Architecture (1-15)
1. Why did you use Pages Router when your project has an `/app` folder? Are you mixing App Router and Pages Router?
2. You have both `dbConnect.ts` and `mongodb.ts`. Why two connection files? Which one is the "real" one?
3. Why did you put components inside `pages/components/` instead of `src/components/`?
4. Your `homepage.tsx` is 25KB. How would you break this down?
5. Why is there a `Service-user.js` model? How is it different from `User.js`?
6. Explain the difference between your `Service` model and `ServiceRequest` model — they have identical schemas.
7. Why does your project have both `.js` and `.ts` versions of User, Service, and Booking models?
8. You have `express` in package.json. Where is it used?
9. Why are page components inside `pages/components/` — doesn't this create API routes for them in Next.js?
10. How does your `CartContext` synchronize with the Cart database model?
11. What happens when `CartContext` calls `/api/cart/count` — does that endpoint exist?
12. Why did you choose Next.js Pages Router over App Router for a new project in 2024-2025?
13. Your `data/ProductData.js` is hardcoded. Why not fetch from the database?
14. How does the service provider dashboard communicate with the backend?
15. Walk me through the complete folder structure and why each directory exists.

### Authentication & Security (16-35)
16. How do you authenticate users after signup? Where is the session/token created?
17. I see no JWT in your codebase despite `jsonwebtoken` not being in package.json. How do you protect routes?
18. Your admin login just does `router.push('/admin/page')`. How is this secure?
19. What prevents me from directly navigating to `/admin/page` without logging in?
20. Your OTP is stored in `const otpStore = {}`. What happens when Vercel spins up a new serverless instance?
21. How does OTP verification work across multiple serverless function invocations?
22. `GET /api/users` returns all users with passwords. How would you fix this?
23. Your MongoDB URI with username/password is hardcoded in source code and committed to Git. What's the risk?
24. How would you implement proper authentication middleware in Next.js API routes?
25. Explain CSRF protection in your application.
26. What prevents someone from calling `POST /api/transaction` with `type: 'credit'` and `amount: 1000000`?
27. How would you rate-limit the OTP sending endpoint?
28. What happens if someone brute-forces OTPs?
29. Your Razorpay endpoint has no signature verification. What's the attack vector?
30. How would you implement role-based access control (admin vs user vs provider)?
31. Where is the Razorpay key_secret stored? Is it secure?
32. What is bcrypt salt and why did you choose 10 rounds?
33. How would you implement password reset functionality?
34. What authentication strategy would you use if rebuilding from scratch?
35. How do you prevent SQL/NoSQL injection in your API routes?

### Database (36-55)
36. Your Cart model has no `userId`. How do multiple users have separate carts?
37. Why does the Booking schema have most fields as optional (no `required: true`)?
38. Your Review model references `service_users` and `users` collections. Do those collections exist?
39. You set `_id: uuidv4()` in User signup. What breaks when you do this with Mongoose?
40. How does `mongoose.populate()` work? Show me where you use it.
41. You use Mongoose sessions in transaction.ts. Explain how MongoDB transactions work.
42. What happens if the session commit fails in your transaction handler?
43. Your Income model has `productId` and `customerId` as plain strings, not ObjectId refs. Why?
44. How do you handle database connection pooling in serverless (Vercel)?
45. What is the global caching pattern in your `mongodb.ts` and why is it needed?
46. The Comment model has no reference to Blog or User. How do you associate comments with blog posts?
47. Why did you choose embedded documents vs referenced documents for the Provider schema?
48. What MongoDB indexes would improve your query performance?
49. How would you handle the 16MB document size limit if a blog post has thousands of comments?
50. Explain the `mongoose.models.X || mongoose.model()` pattern. Why is it necessary in Next.js?
51. Your Mail model stores sender/recipient as strings. Why not ObjectId references?
52. What is the `sparse: true` index and when would you use it?
53. How does your `provider.ts` pre-save hook work?
54. What is the default `_id` type in MongoDB and why did you override it with UUID?
55. If you could redesign the database schema, what would you change?

### API Design (56-70)
56. Why do you have `/api/add`, `/api/services` POST, and `/api/serviceRequest` POST — all creating services?
57. Your `serviceRequest.ts` has a hardcoded `providerId`. How does this work in production?
58. `serviceRequest/decline.ts` doesn't send a response on success. What happens on the client?
59. Why did you use `switch(req.method)` in some routes and `if/else` in others?
60. How would you version your APIs?
61. Your `/api/mail` POST checks `sender === "admin@example.com"`. How is this admin verification?
62. How would you implement pagination for `GET /api/services`?
63. Your booking API calls `.populate("userId serviceId")`. What if the referenced document was deleted?
64. Why doesn't your DELETE `/api/cart` validate the ID before deletion?
65. Explain the service request accept/decline workflow.
66. How would you implement search and filtering for services?
67. What HTTP status codes are you using and are they semantically correct?
68. Your `comments.ts` imports Comment as `Booking`. Explain.
69. How would you handle file uploads (service images)?
70. What happens if two users try to book the same service simultaneously?

### Frontend (71-85)
71. How does your CartContext stay in sync with the database?
72. Your `usePageLoad` hook tracks image loading. Why not use Next.js `Image` component's built-in loading?
73. How does your service provider dashboard manage state?
74. Explain how the homepage renders services — is it SSR, SSG, or CSR?
75. Your product page is `23KB`. How would you optimize it?
76. How does the signup OTP flow work on the frontend?
77. Why are you using both Material UI icons and react-icons?
78. How does the Razorpay checkout flow work on the frontend?
79. What state management solution are you using and why?
80. How do you handle loading and error states?
81. Your header reads cart from localStorage. How does this stay in sync with the MongoDB cart?
82. How would you implement search functionality on the frontend?
83. Explain the admin panel navigation pattern.
84. How do you handle responsive design?
85. What would you use for form validation?

### Payments (86-90)
86. Walk me through the complete Razorpay payment flow — from frontend to database.
87. What happens if payment succeeds on Razorpay but your server crashes before creating the booking?
88. How do you verify that a payment was actually completed vs just an order was created?
89. Where is payment webhook handling?
90. How does the wallet/referral system work?

### Performance & Scalability (91-100)
91. Every GET API fetches ALL records with no pagination. What happens with 100K services?
92. Your homepage component is 25KB of JSX. How does this affect performance?
93. How would you implement caching for frequently accessed services?
94. What happens to OTP verification at scale with multiple serverless instances?
95. How would you implement a proper notification system?
96. If 1000 users add to cart simultaneously, what happens to your shared cart?
97. How would you implement background job processing (e.g., sending batch emails)?
98. What CDN strategy would you use for static assets?
99. How would you monitor API performance in production?
100. If you had to support 100K users, what would you change first?

---

## PHASE 12 — SYSTEM DESIGN AT SCALE

| Users | Bottleneck | Solution |
|-------|-----------|----------|
| 100 | OTP in-memory store fails in serverless | Move OTP to Redis/MongoDB |
| 1,000 | No pagination — full collection scans | Add cursor/offset pagination |
| 10,000 | Shared cart breaks, no auth | Add JWT auth + user-specific carts |
| 100,000 | MongoDB read amplification, no caching | Redis cache, read replicas, connection pooling |
| 1,000,000 | Single MongoDB, no background jobs | Microservices, queue (BullMQ/SQS), CDN, load balancing |

---

## PHASE 15 — IMPROVEMENTS (Ranked)

### 🔴 HIGH PRIORITY (Do before placements)

| # | Improvement | Difficulty | Time | Interview Impact |
|---|-------------|-----------|------|-----------------|
| 1 | **Remove hardcoded DB credentials** — use env vars | Easy | 15 min | CRITICAL — instant reject if seen |
| 2 | **Add JWT authentication** — create middleware, protect routes | Medium | 4-6 hrs | CRITICAL — "how do you auth?" is Q1 in every interview |
| 3 | **Fix admin login** — actual credential verification | Easy | 1 hr | HIGH |
| 4 | **Add userId to Cart** — user-specific carts | Easy | 1 hr | HIGH |
| 5 | **Fix the decline API** — return response | Easy | 5 min | HIGH — shows you test your code |
| 6 | **Delete duplicate .js model files** | Easy | 10 min | MEDIUM |
| 7 | **Fix User schema field mismatch** (businessName vs name) | Easy | 10 min | MEDIUM |

### 🟡 MEDIUM PRIORITY

| # | Improvement | Difficulty | Time | Interview Impact |
|---|-------------|-----------|------|-----------------|
| 8 | Add pagination to all GET APIs | Medium | 2-3 hrs | HIGH |
| 9 | Implement Razorpay payment verification webhook | Medium | 2 hrs | HIGH — payment knowledge is valuable |
| 10 | Move OTP to Redis/DB instead of in-memory | Medium | 2 hrs | HIGH |
| 11 | Add input validation (Zod/Joi) | Medium | 3 hrs | MEDIUM |
| 12 | Fix Review model collection refs | Easy | 15 min | LOW |
| 13 | Add `.select('-password')` to all user queries | Easy | 15 min | HIGH |

### 🟢 LOW PRIORITY

| # | Improvement | Difficulty | Time | Interview Impact |
|---|-------------|-----------|------|-----------------|
| 14 | Implement proper error handling middleware | Medium | 2 hrs | MEDIUM |
| 15 | Add rate limiting | Medium | 1 hr | MEDIUM |
| 16 | Implement search with text indexes | Medium | 2 hrs | MEDIUM |
| 17 | Replace SEO placeholder URLs | Easy | 10 min | LOW |
| 18 | Remove unused `express` dependency | Easy | 5 min | LOW |

---

## PHASE 17 — INTERVIEW CHEAT SHEET (30-Minute Revision Notes)

### 2-Minute Explanation
> "HelperBuddy is a **home services marketplace** — like Urban Company. Users can browse cleaning, repair, and maintenance services, add them to cart, and pay via Razorpay. Service providers register, submit service requests which admins can approve or decline. The admin panel manages services, blogs, mails, income tracking, and referral wallets. Built with **Next.js (Pages Router)**, **MongoDB Atlas** with **Mongoose**, **Razorpay** for payments, **Resend** for transactional emails, and **Tailwind CSS** for styling."

### Tech Stack Quick Reference
- **Frontend**: Next.js 15, React 18, Tailwind CSS, Framer Motion, Recharts, MUI Icons
- **Backend**: Next.js API Routes (serverless), Mongoose ODM
- **Database**: MongoDB Atlas
- **Payments**: Razorpay
- **Email**: Resend (OTP + welcome emails)
- **Auth**: OTP-based email verification + bcrypt password hashing (NO JWT)
- **Deployment**: Vercel (implied by Next.js)

### Key Architecture Decisions to Defend
1. "I chose Next.js API routes over separate Express server for simplicity and deployment — single Vercel deployment"
2. "MongoDB because service data is semi-structured and schema evolves rapidly"
3. "Razorpay because it's the standard Indian payment gateway"
4. "OTP over password-only auth for better security UX"

### Known Weaknesses (Be Honest About)
1. "Auth is partially implemented — OTP and hashing exist but session management needs JWT/NextAuth"
2. "Cart is currently global — needs userId association"
3. "Payment verification webhook is pending"
4. "Admin panel needs proper role-based access control"

### If Asked "What Would You Change?"
1. Use NextAuth.js for authentication
2. Add Redis for OTP storage (serverless-safe)
3. Implement Razorpay webhooks for payment verification
4. Add API middleware for auth + rate limiting
5. User-specific carts
6. Pagination on all list endpoints

---

## PHASE 18 — MOCK INTERVIEW BEGINS

**I am a Senior Engineer at Microsoft.**

"Welcome. I see you've built HelperBuddy — a home services marketplace. Let's start.

**Question 1**: Walk me through what happens when a user signs up on your platform. Start from the button click, go through the frontend, the API call, the database operation, and back to the user. I want to hear about every layer."

*Answer this, and I will score you 1-10, point out weaknesses, give the ideal answer, and then hit you with follow-ups like "Why not NextAuth?", "What happens if the OTP email fails?", "How do you prevent the same OTP from being used twice?"*
