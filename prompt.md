Absolutely. Here is a practical **Product Requirements Document (PRD)** for a **Mini Stationery Store** using **Next.js + Supabase**, designed to be small enough for a student project but structured like a real e-commerce system.

# Product Requirements Document (PRD)

## Mini Stationery Store

**Version:** 1.0
**Platform:** Web Application
**Frontend:** Next.js
**Backend / Database:** Supabase
**Authentication:** Supabase Auth
**Storage:** Supabase Storage
**Primary Users:** Customers and Store Admin

---

## 1. Product Overview

The **Mini Stationery Store** is a web-based e-commerce application that allows customers to browse stationery products, search and filter products, add items to a shopping cart, place orders, and view their order history.

Store administrators can manage products, categories, inventory, and customer orders through an admin dashboard.

The system is intended for a **small stationery business** selling products such as:

* Pens
* Pencils
* Notebooks
* Erasers
* Rulers
* Markers
* Highlighters
* Paper
* Folders
* School supplies
* Office supplies

### Main Goal

Provide a simple online shopping experience while allowing the store owner to efficiently manage products, stock, and orders.

---

# 2. Objectives

### Customer Objectives

1. Browse available stationery products.
2. Search for products quickly.
3. Filter products by category and price.
4. View detailed product information.
5. Add products to a shopping cart.
6. Modify cart quantities.
7. Place orders.
8. View order status.
9. View previous orders.
10. Manage their account information.

### Admin Objectives

1. Add new products.
2. Edit product information.
3. Delete or deactivate products.
4. Manage product categories.
5. Update product stock.
6. View customer orders.
7. Update order status.
8. Monitor low-stock products.
9. Manage customer accounts if necessary.

---

# 3. Target Users

## 3.1 Customer

A customer can:

* Register/login
* Browse products
* Search products
* Filter products
* View product details
* Add products to cart
* Checkout
* View orders
* Update profile

## 3.2 Administrator

An administrator can:

* Manage products
* Manage categories
* Manage inventory
* Manage orders
* View basic sales information

---

# 4. Core Features

## 4.1 Home Page

The homepage should contain:

* Store name/logo
* Navigation bar
* Search bar
* Product categories
* Featured products
* New products
* Shopping cart icon
* Login/account button

### Example Navigation

```text
Home | Products | Categories | About | Contact | 🛒 Cart | Account
```

---

# 5. Product Management

Each product should contain:

| Field          | Description           |
| -------------- | --------------------- |
| Product ID     | Unique identifier     |
| Product Name   | Name of stationery    |
| Description    | Product details       |
| Price          | Selling price         |
| Stock Quantity | Available quantity    |
| Category       | Product category      |
| Image          | Product image         |
| Status         | Active/Inactive       |
| Created At     | Creation timestamp    |
| Updated At     | Last update timestamp |

### Example

```text
Product:
Premium Gel Pen

Category:
Pens

Price:
1,500 MMK

Stock:
50

Description:
0.5mm smooth-writing gel pen
```

---

# 6. Product Browsing

Customers should be able to:

* View all products
* View products by category
* Search by product name
* Filter by price
* Sort by price
* Sort by newest products
* View product details

### Search Example

```text
Search: "blue pen"

Results:
--------------------------------
Blue Gel Pen       1,000 MMK
Blue Ballpoint     700 MMK
Premium Blue Pen   1,500 MMK
--------------------------------
```

---

# 7. Shopping Cart

Customers can add products to their cart.

The cart should display:

| Product  | Price | Quantity | Subtotal |
| -------- | ----: | -------: | -------: |
| Gel Pen  | 1,000 |        2 |    2,000 |
| Notebook | 2,500 |        1 |    2,500 |

**Total: 4,500 MMK**

Customers should be able to:

* Increase quantity
* Decrease quantity
* Remove products
* Clear cart
* Continue shopping
* Proceed to checkout

---

# 8. Checkout

The checkout page should collect:

### Customer Information

* Full name
* Phone number
* Delivery address

### Order Information

* Products
* Quantities
* Prices
* Total amount

### Payment Method

For the MVP, keep payment simple:

```text
Cash on Delivery
```

Optionally, the system can later support:

* KBZPay
* WavePay
* Bank transfer
* Online payment gateway

---

# 9. Order Management

After checkout, the system creates an order.

### Order Status

```text
Pending
   ↓
Confirmed
   ↓
Processing
   ↓
Shipped
   ↓
Delivered
```

The customer can view:

```text
Order #ORD-00125

Date: 27 Sep 2026

Status: Processing

Items:
- Notebook × 2
- Blue Pen × 3

Total: 7,500 MMK
```

---

# 10. Customer Account

Customers should have an account page containing:

### Profile

* Name
* Email
* Phone
* Address

### Orders

```text
My Orders

ORD-00125    Processing
ORD-00112    Delivered
ORD-00098    Delivered
```

---

# 11. Authentication

Use **Supabase Auth**.

### Supported Authentication

For the MVP:

* Email + password
* Logout
* Password reset

Optional:

* Google OAuth

### User Roles

```text
User
 ├── Customer
 └── Admin
```

The user's role can be stored in the database.

---

# 12. Admin Dashboard

The admin dashboard should provide:

```text
Admin Dashboard

-----------------------------------
Products        125
Orders           38
Customers       214
Low Stock        12
-----------------------------------
```

### Admin Sections

```text
Dashboard
Products
Categories
Orders
Customers
Inventory
Settings
```

---

# 13. Admin Product Management

Admin can:

### Create

```text
Add Product

Product Name
Description
Category
Price
Stock
Image
[Save Product]
```

### Update

Admin can modify:

* Name
* Description
* Price
* Category
* Stock
* Image
* Status

### Delete

Instead of permanently deleting products, preferably use:

```text
Active / Inactive
```

This preserves historical order information.

---

# 14. Inventory Management

The system should track product stock.

Example:

```text
Product          Stock       Status

Blue Pen           50        In Stock
Notebook            5        Low Stock
Pencil              0        Out of Stock
```

### Stock Rules

```text
stock > 10
→ In Stock

1–10
→ Low Stock

0
→ Out of Stock
```

The system must prevent customers from ordering more than the available stock.

---

# 15. Categories

Example categories:

```text
Pens
Pencils
Notebooks
Paper
Markers
Erasers
Rulers
Folders
School Supplies
Office Supplies
```

Admin can:

* Create category
* Edit category
* Deactivate category

---

# 16. Database Design

Supabase PostgreSQL can contain the following tables:

```text
profiles
categories
products
cart_items
orders
order_items
```

### Relationship

```text
profiles
   │
   │ 1
   │
   ├──────────< orders
   │              │
   │              │ 1
   │              │
   │              └──────< order_items
   │                           │
   │                           │
   │                           v
   │                       products
   │                           │
   │                           │
   └──────< cart_items >───────┘
               
categories
     │
     │ 1
     └──────< products
```

---

# 17. Database Schema

## `profiles`

```text
id
email
full_name
phone
address
role
created_at
updated_at
```

`id` references Supabase Auth user ID.

---

## `categories`

```text
id
name
description
is_active
created_at
```

---

## `products`

```text
id
category_id
name
description
price
stock_quantity
image_url
is_active
created_at
updated_at
```

Relationship:

```text
categories.id
      ↓
products.category_id
```

---

## `cart_items`

```text
id
user_id
product_id
quantity
created_at
updated_at
```

---

## `orders`

```text
id
user_id
total_amount
status
customer_name
phone
delivery_address
payment_method
created_at
updated_at
```

---

## `order_items`

```text
id
order_id
product_id
product_name
price
quantity
subtotal
```

Notice that `product_name` and `price` are stored here as a **snapshot** of the product at the time of purchase. This prevents historical orders from changing if the product's current price/name changes later.

---

# 18. Technology Stack

## Frontend

**Next.js**

Recommended:

```text
Next.js
TypeScript
React
Tailwind CSS
```

### UI

```text
Tailwind CSS
shadcn/ui
Lucide Icons
```

---

## Backend

Use **Supabase** for:

```text
Supabase PostgreSQL
Supabase Auth
Supabase Storage
Supabase Row Level Security
```

You don't need to create a separate Express.js backend for the MVP.

---

# 19. Architecture

```text
                 Customer
                    │
                    ▼
              Next.js App
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   Server Components       Client Components
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
             Supabase Client
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    PostgreSQL     Auth       Storage
    Database                Product Images
```

---

# 20. Suggested Next.js Structure

```text
stationery-store/
│
├── app/
│   ├── page.tsx
│   │
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── cart/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── account/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   └── admin/
│       ├── page.tsx
│       ├── products/
│       ├── categories/
│       ├── orders/
│       └── customers/
│
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── SearchBar.tsx
│   ├── CartItem.tsx
│   └── OrderStatus.tsx
│
├── lib/
│   ├── supabase/
│   └── utils.ts
│
├── types/
│   └── database.ts
│
└── public/
```

---

# 21. Security Requirements

Supabase **Row Level Security (RLS)** should be enabled.

### Customers

Customers can:

* Read active products
* Read categories
* Manage their own cart
* Create their own orders
* Read their own orders
* Update their own profile

### Admin

Admins can:

* Create/update products
* Manage categories
* View all orders
* Update order status
* Manage inventory

Customers must **not** be able to access admin pages or modify another user's data.

---

# 22. Important Business Rules

### Product

```text
Inactive product
→ Cannot be purchased
```

### Stock

```text
Requested quantity > stock
→ Reject order
```

### Order

Once an order is placed:

```text
Cart
 ↓
Checkout
 ↓
Create Order
 ↓
Create Order Items
 ↓
Reduce Stock
 ↓
Clear Cart
```

These operations should ideally be handled atomically, such as through a Supabase/PostgreSQL database function, to avoid inconsistent inventory.

---

# 23. MVP Scope

For a **mini project**, I recommend limiting the first version to:

### Must Have

* [x] Homepage
* [x] Product listing
* [x] Product details
* [x] Search
* [x] Categories
* [x] Shopping cart
* [x] Login/Register
* [x] Checkout
* [x] Cash on Delivery
* [x] Order history
* [x] Admin dashboard
* [x] Product CRUD
* [x] Category management
* [x] Stock management
* [x] Order management

### Can Add Later

* [ ] Online payment
* [ ] Product reviews
* [ ] Wishlist
* [ ] Discount coupons
* [ ] Delivery tracking
* [ ] Notifications
* [ ] Sales analytics
* [ ] Recommendation system

---

# 24. Non-Functional Requirements

### Performance

* Product pages should load quickly.
* Images should be optimized.
* Use Next.js image optimization.
* Use pagination for large product lists.

### Security

* Supabase RLS must be enabled.
* Passwords handled by Supabase Auth.
* Admin routes must be protected.
* Users cannot modify another user's orders.

### Usability

* Responsive design
* Mobile-friendly navigation
* Clear product prices
* Clear stock status
* Simple checkout process

### Reliability

The system should prevent:

* Ordering unavailable products
* Negative stock
* Unauthorized admin access
* Duplicate/inconsistent orders

---

# 25. Future Version

The system can later become a more complete stationery e-commerce platform:

```text
                    Mini Stationery Store
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
     Customer              Admin              Future
        │                    │                    │
   Products             Inventory             Payments
   Cart                 Orders                Reviews
   Checkout             Analytics             Wishlist
   Orders               Customers             Coupons
```

---

## 26. Recommended MVP User Flow

### Customer

```text
Home
 ↓
Browse Products
 ↓
Search / Filter
 ↓
Product Details
 ↓
Add to Cart
 ↓
Cart
 ↓
Checkout
 ↓
Login/Register
 ↓
Enter Delivery Information
 ↓
Place Order
 ↓
Order Confirmation
 ↓
Track Order
```

### Admin

```text
Login
 ↓
Admin Dashboard
 ↓
Manage Products
 ↓
Manage Inventory
 ↓
View Orders
 ↓
Update Order Status
```

---

## 27. Final Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Framework        | **Next.js**             |
| Language         | **TypeScript**          |
| UI               | **React**               |
| Styling          | **Tailwind CSS**        |
| Components       | **shadcn/ui**           |
| Database         | **Supabase PostgreSQL** |
| Authentication   | **Supabase Auth**       |
| Image Storage    | **Supabase Storage**    |
| Authorization    | **Supabase RLS**        |
| Deployment       | **Vercel**              |
| Database Hosting | **Supabase**            |
| Version Control  | **Git + GitHub**        |

