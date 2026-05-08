# Frakktur API Documentation

## Overview

Frakktur API is a RESTful backend service built on PHP that powers the luxury streetwear e-commerce platform. The API manages authentication, product management, shopping cart, wishlist, and administrative functions.

**Base URL:** `{BASE_URL}/auth.php?action={ACTION}`

**Response Format:** JSON

**Authentication:** Session-based (PHP native sessions with httpOnly, secure cookies)

**Session Duration:** 12 hours

---

## Authentication Architecture

The API uses PHP session-based authentication with the following features:
- Session cookies are httpOnly (not accessible from JavaScript) - security
- Cookies are marked as Secure (HTTPS only in production)
- SameSite=Lax policy to prevent CSRF attacks
- Session lifetime: 12 hours
- Session ID stored in PHP `$_SESSION['user_id']`

### Authentication Flow

1. User registers or logs in → `user_id` stored in session
2. Session cookie automatically set in response
3. Subsequent requests include session cookie automatically (credentials: include)
4. Server validates `user_id` in `$_SESSION` for protected endpoints
5. User logs out → session destroyed

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Missing or invalid parameters
- `401 Unauthorized` - User not logged in or invalid session
- `403 Forbidden` - User lacks required permissions (e.g., not admin)
- `404 Not Found` - Requested resource doesn't exist
- `409 Conflict` - Resource already exists (e.g., email already registered)
- `500 Internal Server Error` - Server-side error

---

## Endpoints Summary

**Total: 23 Endpoints**

- **Authentication (4):** register, login, logout, me
- **Products (3):** products_by_category, product_get, search
- **Shopping Cart (4):** cart_get, cart_add, cart_update, cart_remove
- **Wishlist (3):** wishlist_get, wishlist_add, wishlist_remove
- **Orders / Checkout (2):** checkout_place_order, orders_get
- **Admin (7):** admin_options, admin_products_get, admin_product_save, admin_product_delete, admin_assets_list, admin_asset_upload, admin_asset_delete

---

## Detailed Endpoint Documentation

### Authentication Endpoints (4)

#### 1. Register User
- **Method:** POST
- **URL:** `/auth.php?action=register`
- **Auth Required:** No
- **Request Body:**
  - `fullName` (string, 2-120 chars): User's full name
  - `email` (string): Valid email, must be unique
  - `password` (string, 6-72 chars): User password
- **Response:** 201 Created with user object
- **Errors:** 400 (validation), 409 (email exists)

#### 2. Login
- **Method:** POST
- **URL:** `/auth.php?action=login`
- **Auth Required:** No
- **Request Body:**
  - `email` (string): User email
  - `password` (string): User password
- **Response:** 200 OK with user object
- **Errors:** 401 (invalid credentials)

#### 3. Get Current User
- **Method:** GET
- **URL:** `/auth.php?action=me`
- **Auth Required:** Yes
- **Response:** 200 OK with current user object
- **Errors:** 401 (not logged in)

#### 4. Logout
- **Method:** POST
- **URL:** `/auth.php?action=logout`
- **Auth Required:** No
- **Response:** 200 OK with `{ok: true}`
- **Errors:** None

---

### Product Endpoints (3)

#### 5. Get Products by Category
- **Method:** GET
- **URL:** `/auth.php?action=products_by_category&category={categoryKey}`
- **Auth Required:** No
- **Query Parameters:**
  - `category` (required): One of tshirts, hoodies, caps, belts, pants, knitwear, leather-jackets
- **Response:** 200 OK with array of products
- **Errors:** 400 (missing category)

#### 6. Get Single Product
- **Method:** GET
- **URL:** `/auth.php?action=product_get&category={categoryKey}&id={productId}`
- **Auth Required:** No
- **Query Parameters:**
  - `category` (required): Product category
  - `id` (required): Product code
- **Response:** 200 OK with single product
- **Errors:** 400 (missing params), 404 (not found)

#### 7. Search Products
- **Method:** GET
- **URL:** `/auth.php?action=search&q={query}`
- **Auth Required:** No
- **Query Parameters:**
  - `q` (required): Search query
- **Response:** 200 OK with array of matching products
- **Errors:** None

---

### Shopping Cart Endpoints (4)

#### 8. Get Cart
- **Method:** GET
- **URL:** `/auth.php?action=cart_get`
- **Auth Required:** Yes
- **Response:** 200 OK with array of cart items
- **Errors:** 401 (not logged in)

#### 9. Add to Cart
- **Method:** POST
- **URL:** `/auth.php?action=cart_add`
- **Auth Required:** Yes
- **Request Body:**
  - `categoryKey` (string): Product category
  - `productCode` (string): Product ID
  - `size` (string): Size code
  - `quantity` (number): Quantity > 0
- **Response:** 200 OK with `{ok: true}`
- **Errors:** 400 (invalid), 401 (not logged in), 404 (not found)

#### 10. Update Cart Item
- **Method:** POST
- **URL:** `/auth.php?action=cart_update`
- **Auth Required:** Yes
- **Request Body:**
  - `key` (string): Format `{categoryKey}:{productCode}:{size}`
  - `quantity` (number): New quantity
- **Response:** 200 OK
- **Errors:** 400 (invalid key), 401 (not logged in)

#### 11. Remove from Cart
- **Method:** POST
- **URL:** `/auth.php?action=cart_remove`
- **Auth Required:** Yes
- **Request Body:**
  - `key` (string): Cart item key
- **Response:** 200 OK
- **Errors:** 400 (invalid key), 401 (not logged in)

---

### Wishlist Endpoints (3)

#### 12. Get Wishlist
- **Method:** GET
- **URL:** `/auth.php?action=wishlist_get`
- **Auth Required:** Yes
- **Response:** 200 OK with array of wishlist items
- **Errors:** 401 (not logged in)

#### 13. Add to Wishlist
- **Method:** POST
- **URL:** `/auth.php?action=wishlist_add`
- **Auth Required:** Yes
- **Request Body:**
  - `categoryKey` (string): Product category
  - `productCode` (string): Product ID
- **Response:** 200 OK with `{ok: true}`
- **Errors:** 400 (invalid), 401 (not logged in), 404 (not found)

#### 14. Remove from Wishlist
- **Method:** POST
- **URL:** `/auth.php?action=wishlist_remove`
- **Auth Required:** Yes
- **Request Body:**
  - `key` (string): Wishlist item key
- **Response:** 200 OK
- **Errors:** 400 (invalid key), 401 (not logged in)

---

### Orders / Checkout Endpoints (2)

#### 15. Place Order
- **Method:** POST
- **URL:** `/auth.php?action=checkout_place_order`
- **Auth Required:** No
- **Request Body:**
  - `email` (string): Contact email
  - `firstName` (string): Customer first name
  - `lastName` (string): Customer last name
  - `street` (string): Street address
  - `city` (string): City
  - `postalCode` (string): Postal code
  - `country` (string): Country
  - `paymentMethod` (string): `bank_transfer`, `credit_card`, or `cash_on_delivery`
  - `items` (array): Required for guest checkout, containing cart items with `categoryKey`, `productCode`, `size`, `quantity`
- **Behavior:**
  - Logged-in users are checked out from the DB cart and the order is attached to their account.
  - Guest users are saved as anonymous orders with a generated label.
  - Shipping is a fixed `€11.99`.
  - The order number is a unique 8-digit number.
- **Response:**
  - Logged-in: `200 OK` with `order` object and confirmation message
  - Guest: `200 OK` with confirmation message only

#### 16. Get Order History
- **Method:** GET
- **URL:** `/auth.php?action=orders_get`
- **Auth Required:** Yes
- **Response:** `200 OK` with `orders` array containing full order history, line items, shipping address, payment method, subtotal, shipping, and total
- **Errors:** `401` if not signed in

---

### Admin Endpoints (7)

#### 17. Get Admin Options
- **Method:** GET
- **URL:** `/auth.php?action=admin_options`
- **Auth Required:** Yes + Admin
- **Response:** 200 OK with descriptions and sustainability options
- **Errors:** 401 (not logged in), 403 (not admin)

#### 18. Get All Admin Products
- **Method:** GET
- **URL:** `/auth.php?action=admin_products_get`
- **Auth Required:** Yes + Admin
- **Response:** 200 OK with all products including stock details
- **Errors:** 401 (not logged in), 403 (not admin)

#### 19. Save/Update Admin Product
- **Method:** POST
- **URL:** `/auth.php?action=admin_product_save`
- **Auth Required:** Yes + Admin
- **Request Body:**
  - `categoryKey` (string): Product category
  - `id` (string): Product code
  - `name` (string): Product name
  - `description` (string): Product description
  - `material` (string): Material info
  - `sustainability` (string): Sustainability info
  - `imageKey` (string): Image path
  - `isActive` (boolean): Active status
  - `priceCents` (number): Price in cents
  - `sizeStocks` (object): Size-stock mapping
  - `dbId` (number, optional): For updates
- **Response:** 200 OK with product ID and code
- **Errors:** 400 (validation), 401 (not logged in), 403 (not admin)

#### 20. Delete Admin Product
- **Method:** POST
- **URL:** `/auth.php?action=admin_product_delete`
- **Auth Required:** Yes + Admin
- **Request Body:**
  - `id` (string): Product code
- **Response:** 200 OK
- **Errors:** 400 (missing id), 401 (not logged in), 403 (not admin)

#### 21. Get Admin Assets List
- **Method:** GET
- **URL:** `/auth.php?action=admin_assets_list&category={categoryKey|all}`
- **Auth Required:** Yes + Admin
- **Query Parameters:**
  - `category` (optional): Filter by category or 'all'
- **Response:** 200 OK with array of asset objects
- **Errors:** 401 (not logged in), 403 (not admin)

#### 22. Upload Admin Asset
- **Method:** POST
- **URL:** `/auth.php?action=admin_asset_upload`
- **Auth Required:** Yes + Admin
- **Form Data:**
  - `image` (file): Image file (jpg, jpeg, png, webp, gif)
  - `category` (string): Category key
- **Response:** 200 OK with imageKey
- **Errors:** 400 (validation), 401 (not logged in), 403 (not admin), 500 (upload error)

#### 23. Delete Admin Asset
- **Method:** POST
- **URL:** `/auth.php?action=admin_asset_delete`
- **Auth Required:** Yes + Admin
- **Request Body:**
  - `imageKey` (string): Image path
- **Response:** 200 OK with delete confirmation
- **Errors:** 400 (validation), 401 (not logged in), 403 (not admin), 500 (delete error)

---

## Database Schema

### Core Tables

**users:** User accounts with authentication
**categories:** Product categories
**products:** Product information
**product_sizes:** Size availability and stock per product
**cart_items:** User shopping cart items
**wishlist_items:** User wishlist items

---

## Frontend Integration

The React frontend integrates via dedicated client libraries:
- `src/lib/auth.ts` - Authentication
- `src/lib/productsApi.ts` - Product management
- `src/lib/cart.ts` - Cart operations
- `src/lib/wishlist.ts` - Wishlist operations

---

## Performance & Caching

- **Response Cache:** 30 seconds TTL
- **In-Flight Deduplication:** Merges duplicate concurrent requests
- **Category Cache:** Caches products by category
- **Session Cache:** 15 seconds TTL

---

## Security

- Session cookies: httpOnly, Secure (HTTPS in production), SameSite=Lax
- Passwords: bcrypt hashing, minimum 6 characters
- Admin access: Requires is_admin flag in database
- Input validation: Regex email validation, prepared statements (PDO) throughout

---

## Deployment Notes

1. Admin credentials are hardcoded in auth.php (keep out of Git)
2. MySQL 5.7+ required
3. SSL/TLS highly recommended for production
4. Session directory must be writable on server

---

**Total Endpoints:** 23
**Last Updated:** 2025
**Version:** 1.0.0
