# 👑 MONARCA - Luxury Jewelry E-Commerce

A modern, full-stack e-commerce platform for luxury jewelry built with Next.js, Supabase, and TypeScript.

![Built with Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- 🛍️ **Product Catalog** with categories, images, and variants
- 🎨 **Admin Dashboard** for managing products, categories, and customers
- 📦 **Inventory Management** with stock tracking
- 🖼️ **Image Upload** with automatic WebP compression
- 🔐 **Authentication** via Supabase Auth
- 📊 **Unit-based Pricing** for products sold by measurement
- 🎯 **Advanced Filtering** by category, price, material, and more
- 📱 **Responsive Design** optimized for all devices

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Docker Desktop** (for Supabase local development)
- **Supabase CLI** installed globally

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd monarca-next-js
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

#### 4. Start Supabase Locally

Make sure Docker Desktop is running, then:

```bash
supabase start
```

This will start all Supabase services locally. You'll see output with URLs and keys.

#### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update `.env.local` with your local Supabase credentials from step 4:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_step_4
```

#### 6. Apply Database Migrations

```bash
supabase db reset
```

This will:
- Create all necessary tables
- Set up Row Level Security (RLS) policies  
- Insert default categories
- Create storage buckets

#### 7. Create an Admin User

1. Go to Supabase Studio: http://localhost:54323
2. Navigate to **Authentication** > **Users** > **Add User**
3. Create a user with email/password
4. Copy the user's UUID
5. Go to **SQL Editor** and run:

```sql
INSERT INTO profiles (id, role, full_name)
VALUES ('YOUR_USER_UUID', 'admin', 'Admin User')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

#### 8. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
monarca-next-js/
├── app/                      # Next.js 14 App Router
│   ├── admin/               # Admin dashboard pages
│   ├── products/            # Product pages
│   ├── error.tsx            # Global error handler
│   └── not-found.tsx        # 404 page
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui components
│   └── product-filters.tsx  # Product filtering
├── hooks/                   # Custom React hooks
│   ├── use-products.ts
│   ├── use-categories.ts
│   └── use-toast.ts
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase client
│   ├── image-upload.ts     # Image compression
│   └── types/              # TypeScript types
├── supabase/
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## 🗄️ Database Schema

### Main Tables

- **products** - Product catalog with images, pricing, and attributes
- **categories** - Product categories with hierarchy
- **profiles** - User profiles and roles
- **orders** - Customer orders
- **order_items** - Order line items

See [`database-setup.md`](.gemini/antigravity/brain/305efab8-b778-4488-b15d-acfad86e0066/database-setup.md) for detailed schema information.

## 🔑 Key Features Explained

### Admin Panel

Access at `/admin/login` with your admin credentials:

- **Products Management**: Create, edit, delete products with multiple images
- **Categories Management**: Organize products into categories
- **Customer Management**: View customer profiles and orders
- **Stock Management**: Track inventory and toggle availability

### Image Upload

All images are automatically:
- Compressed to WebP format
- Optimized to max 500KB
- Stored in Supabase Storage

### Unit-Based Pricing

Products can be sold by:
- Fixed price (default)
- Per unit (meter, yard, foot, centimeter)

Perfect for ribbons, fabrics, and other materials sold by measurement.

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Reset Supabase database
supabase db reset

# View Supabase Studio
# Open http://localhost:54323

# Stop Supabase
supabase stop
```

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/Password authentication
- Role-based access control (admin/customer)
- Row Level Security (RLS) policies

## 📝 Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🐛 Troubleshooting

### "Infinite recursion detected in policy"

Run `supabase db reset` to apply the latest RLS policies.

### Images not loading

Make sure the storage bucket is created:
```sql
SELECT * FROM storage.buckets WHERE id = 'product-images';
```

### Can't create products

1. Make sure you're logged in as admin
2. Check your profile has `role = 'admin'`
3. Verify RLS policies are applied

## 📚 Additional Documentation

- [Database Setup Guide](.gemini/antigravity/brain/305efab8-b778-4488-b15d-acfad86e0066/database-setup.md)
- [Task Progress](.gemini/antigravity/brain/305efab8-b778-4488-b15d-acfad86e0066/task.md)

## 🤝 Contributing

This is a private project. For questions or support, contact the development team.

## 📄 License

All rights reserved © MONARCA 2024
