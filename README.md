# 🛍️ Panchmukhi Balaji Handloom — Full Stack E-Commerce

> **Premium Rajasthani Handloom E-Commerce Website**  
> Built with Next.js 15 · TypeScript · Firebase · Tailwind CSS · Framer Motion

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Firebase-11-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Vercel-Ready-black?logo=vercel" />
</p>

---

## ✨ Features

- 🎨 **Luxury UI** — Deep crimson + antique gold premium design
- 🔐 **Firebase Auth** — Email/password + Google OAuth
- 🛒 **Realtime Cart** — Synced across devices via Firestore
- 💬 **WhatsApp Orders** — Auto-generates & opens WhatsApp with order details
- 📦 **Order Tracking** — Full timeline with live status
- 👑 **Admin Dashboard** — Complete CRUD for products, orders, banners, coupons
- 🎟️ **Coupon System** — Percentage & fixed discounts with rules
- ⭐ **Reviews & Ratings** — With admin moderation & reply system
- 🌙 **Dark/Light Mode** — System-aware theme switching
- 📱 **PWA Ready** — Installable on mobile
- 🔍 **SEO Optimized** — Dynamic metadata, OG tags, sitemap.xml
- 🛡️ **Firestore Security Rules** — Row-level security for all collections

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth group: login, register, forgot-password
│   ├── admin/              # Admin panel (dashboard, products, orders...)
│   ├── product/[id]/       # Product detail page
│   ├── profile/            # User profile, orders, addresses
│   ├── shop/               # Shop with filters & search
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout + WhatsApp order
│   ├── wishlist/           # Saved products
│   ├── track-order/        # Order tracking page
│   ├── layout.tsx          # Root layout with all providers
│   ├── page.tsx            # Homepage
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # SEO robots
├── components/
│   ├── admin/              # Admin UI components
│   ├── auth/               # ProtectedRoute wrapper
│   ├── home/               # Homepage sections
│   ├── layout/             # Navbar, Footer
│   ├── product/            # ProductCard, Details, Reviews, QuickView
│   ├── profile/            # ProfileSidebar
│   └── ui/                 # Skeletons, shared UI
├── context/                # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── WishlistContext.tsx
├── lib/
│   ├── firebase/           # config, auth, firestore, storage
│   ├── validations/        # Zod schemas
│   └── utils.ts            # Helpers, formatters
├── styles/
│   └── globals.css         # Tailwind + custom design tokens
└── types/
    └── index.ts            # All TypeScript interfaces
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1 — Install Node.js

1. Visit [nodejs.org](https://nodejs.org)
2. Download the **LTS version** (e.g. v22)
3. Run the installer, click Next → Next → Install
4. Verify: open Terminal and type `node --version`

---

### Step 2 — Install VS Code

1. Visit [code.visualstudio.com](https://code.visualstudio.com)
2. Download for your OS and install
3. Recommended extensions:
   - **ES7+ React/Redux/React-Native snippets**
   - **Tailwind CSS IntelliSense**
   - **Prettier – Code formatter**
   - **GitLens**

---

### Step 3 — Clone or Download the Project

**Option A — Clone with Git:**
```bash
git clone https://github.com/YOUR_USERNAME/panchmukhi-balaji-handloom.git
cd panchmukhi-balaji-handloom
```

**Option B — Download ZIP:**
- Download the project ZIP
- Extract it
- Open the folder in VS Code

---

### Step 4 — Install Dependencies

Open Terminal in VS Code (`Ctrl + ~`) and run:

```bash
npm install
```

This installs all packages listed in `package.json`. Wait for it to complete.

---

### Step 5 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Project name: `panchmukhi-balaji-handloom`
4. **Disable** Google Analytics (optional)
5. Click **"Create project"**

---

### Step 6 — Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select server location: **`asia-south1 (Mumbai)`**
5. Click **"Enable"**

---

### Step 7 — Enable Email/Password Authentication

1. Click **"Authentication"** in left sidebar
2. Click **"Get Started"**
3. Click **"Email/Password"** under Native providers
4. Toggle **"Email/Password"** to **Enabled**
5. Click **"Save"**

---

### Step 8 — Enable Google Login

1. Still in Authentication → Sign-in method
2. Click **"Google"**
3. Toggle to **Enabled**
4. Enter your **Project support email**
5. Click **"Save"**

---

### Step 9 — Create Firebase Storage

1. Click **"Storage"** in left sidebar
2. Click **"Get started"**
3. Choose **"Start in production mode"**
4. Select location: **`asia-south1`**
5. Click **"Done"**

---

### Step 10 — Get Firebase Configuration

1. In Firebase Console, click the **gear icon ⚙️** → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click **"</> Web"** icon to add a web app
4. App nickname: `PBH Web`
5. Click **"Register app"**
6. You'll see the `firebaseConfig` object — **copy all values**

---

### Step 11 — Setup Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in VS Code and fill in your Firebase values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
   NEXT_PUBLIC_ADMIN_EMAILS=youremail@gmail.com
   ```

> ⚠️ **IMPORTANT:** Never commit `.env.local` to GitHub! It's already in `.gitignore`.

---

### Step 12 — Run the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Panchmukhi Balaji Handloom homepage! 🎉

---

### Step 13 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Panchmukhi Balaji Handloom E-Commerce"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

### Step 14 — Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js

---

### Step 15 — Deploy on Vercel

1. In the Vercel import screen, click **"Environment Variables"**
2. Add all variables from your `.env.local` file:
   - Click **"Add"** for each variable
   - Paste key and value
3. Click **"Deploy"**
4. Wait ~2 minutes — your site is live! 🚀

> Your site URL will be: `https://your-project.vercel.app`

---

### Step 16 — Setup Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **"Settings"** → **"Domains"**
2. Click **"Add"** and enter your domain (e.g. `panchmukhibalajihandloom.com`)
3. Update your domain's DNS settings:
   - Add an **A record** pointing to `76.76.21.21`
   - Or add a **CNAME** pointing to `cname.vercel-dns.com`
4. Wait for DNS propagation (up to 24 hours)

---

### Step 17 — Create First Admin

1. Go to your site and **Register** a new account with the email you put in `NEXT_PUBLIC_ADMIN_EMAILS`
2. Verify your email
3. Log in — you'll see the "Admin Dashboard" option in your profile menu

---

### Step 18 — Apply Firestore Security Rules

1. In Firebase Console → Firestore → **"Rules"** tab
2. Copy the contents of `firestore.rules` in your project
3. Paste it into the Rules editor
4. Click **"Publish"**

---

### Step 19 — Apply Firestore Indexes

1. In Firebase Console → Firestore → **"Indexes"** tab
2. Click **"Import JSON"** (or use Firebase CLI):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:indexes
   ```

---

### Step 20 — Upload First Product

1. Go to your site → login as admin → **Admin Dashboard**
2. Click **"Products"** in sidebar
3. Click **"Add Product"**
4. Fill in:
   - **Name:** Rajasthani Cotton Handloom Saree
   - **Description:** Detailed description
   - **Price:** 1499
   - **MRP:** 1999
   - **Stock:** 50
   - **SKU:** PBH-SAREE-001
   - **Category:** (create one first in Categories)
   - Upload product images
5. Toggle **"Active"** and **"New Arrival"**
6. Click **"Create Product"**

---

### Step 21 — Upload Banner

1. Go to Admin → **"Banners"**
2. Click **"Add Banner"**
3. Upload a high-quality hero image (1920×600px recommended)
4. Set type to **"Hero"**
5. Add title, subtitle, and link
6. Click **"Save Banner"**

---

### Step 22 — Test WhatsApp Order

1. Browse shop and add products to cart
2. Go to Checkout
3. Fill in your details
4. Select **"Order via WhatsApp"**
5. Click **"Place Order on WhatsApp"**
6. WhatsApp should open with a pre-filled order message

> Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to your actual WhatsApp number (e.g. `919876543210`)

---

### Step 23 — Test Order Tracking

1. Place a test order (take note of the order number)
2. Go to **Track Order** page
3. Enter the order number and phone number
4. You should see the order status timeline

---

## ✅ Production Checklist

Before going live, verify these:

- [ ] All environment variables set in Vercel
- [ ] Firestore security rules published
- [ ] Firestore indexes deployed
- [ ] Firebase Auth: Email & Google enabled
- [ ] Storage rules published
- [ ] At least one category created
- [ ] At least one product uploaded
- [ ] Hero banner uploaded
- [ ] WhatsApp number configured
- [ ] Admin email set in env vars
- [ ] Custom domain connected (optional)
- [ ] Test full order flow: browse → cart → checkout → WhatsApp
- [ ] Test admin: create/edit/delete product
- [ ] Test order status update from admin panel
- [ ] Dark mode and light mode both work
- [ ] Site loads fast on mobile

---

## 🔒 Backup Firestore Data

### Manual Backup (Firebase Console)
1. Firebase Console → Firestore → **"Import/Export"**
2. Click **"Export"**
3. Choose a Google Cloud Storage bucket
4. Click **"Export"**

### Automatic Backup (Cloud Scheduler)
```bash
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y-%m-%d)
```

Set this up in Google Cloud Scheduler to run daily.

---

## 🔮 Future Update Guide

### Adding New Features

1. **New Page:** Create file in `src/app/new-page/page.tsx`
2. **New Component:** Add to relevant folder in `src/components/`
3. **New Firebase Collection:** Add type in `src/types/index.ts` + functions in `src/lib/firebase/firestore.ts` + update `firestore.rules`
4. **New Admin Section:** Add route in `src/app/admin/` + link in `AdminSidebar.tsx`

### Updating Dependencies
```bash
# Check outdated packages
npm outdated

# Update specific package
npm update next

# Update all (careful — test after!)
npx npm-check-updates -u && npm install
```

### Deploying Updates
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
# Vercel auto-deploys on push to main! ✨
```

---

## 🛠️ Tech Stack Reference

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | Framework | 15.x |
| TypeScript | Type Safety | 5.7 |
| Tailwind CSS | Styling | 3.4 |
| Framer Motion | Animations | 11.x |
| Firebase Auth | Authentication | 11.x |
| Firebase Firestore | Database | 11.x |
| Firebase Storage | File Storage | 11.x |
| React Hook Form | Forms | 7.x |
| Zod | Validation | 3.x |
| React Hot Toast | Notifications | 2.x |
| next-themes | Dark Mode | 0.4 |
| Lucide React | Icons | 0.4 |
| clsx + tailwind-merge | Class Utils | latest |

---

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Crimson | `#8B1A1A` | Primary CTA, buttons |
| Gold | `#D4AF37` | Accents, highlights |
| Ivory | `#FFF8EE` | Light backgrounds |
| Ebony | `#1A0A00` | Dark backgrounds |
| Mahogany | `#2D1B00` | Card backgrounds |
| Copper | `#C9956C` | Secondary accents |

### Fonts
| Name | Usage |
|------|-------|
| Playfair Display | Headings, titles |
| Plus Jakarta Sans | Body text |
| Outfit | Labels, prices, UI |

---

## 📞 Support & Contact

**Store:** Panchmukhi Balaji Handloom  
**Address:** Panchori Road, Poonasar, Rajasthan, India  
**WhatsApp:** Set in `NEXT_PUBLIC_WHATSAPP_NUMBER`

---

## 📄 License

This project is private and proprietary.  
© 2025 Panchmukhi Balaji Handloom, Poonasar, Rajasthan. All rights reserved.
