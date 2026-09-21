# ShajSutro API Documentation

## 1. Overview

The ShajSutro backend provides RESTful API endpoints for authentication, product management, order processing, and administrative operations. JSON is used for request and response bodies.

## 2. Base URL

```text
Development: http://localhost:<PORT>/api
Production:  https://<production-domain>/api
```

Replace `<PORT>` and `<production-domain>` with the actual deployment values.

## 3. Authentication

Protected endpoints use JSON Web Token (JWT) authentication. After a successful login, include the returned token in the request header:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

A missing, invalid, or expired token returns `401 Unauthorized`. Administrative endpoints also require the authenticated user to have the `admin` role.

## 4. Common Response Format

### Successful response

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

### Error response

```json
{
  "success": false,
  "message": "Description of the error"
}
```

## 5. Endpoint Summary

| Endpoint | Method | Authentication | Role | Purpose |
|---|---|---|---|---|
| `/api/health` | GET | Not required | Public | Checks whether the API server is running |
| `/api/auth/register` | POST | Not required | Public | Registers a new customer account |
| `/api/auth/login` | POST | Not required | Public | Authenticates a user and returns a JWT |
| `/api/products` | GET | Not required | Public | Retrieves products with pagination and filtering |
| `/api/admin/products` | POST | Required | Admin | Creates a new product |
| `/api/orders` | POST | Required | Customer | Places a new order |

---

## 6. Endpoint Details

### 6.1 Health Check

Checks whether the backend server is operating correctly.

```http
GET /api/health
```

**Authentication:** Not required  
**Parameters:** None

#### Example request

```http
GET {BASE_URL}/health
```

#### Successful response — `200 OK`

```json
{
  "success": true,
  "message": "ShajSutro API is running",
  "environment": "development"
}
```

### 6.2 User Registration

Creates a customer account and queues an OTP email for email verification.

```http
POST /api/auth/register
```

**Authentication:** Not required

#### Request body

| Field | Type | Required | Description |
|---|---|---:|---|
| `name` | String | Yes | Customer's full name |
| `email` | String | Yes | Valid and unique email address |
| `password` | String | Yes | Account password |

#### Example request

```json
{
  "name": "Test Customer",
  "email": "customer@example.com",
  "password": "SecurePassword123"
}
```

#### Successful response — `201 Created`

```json
{
  "success": true,
  "message": "Account created successfully. Please verify your email.",
  "data": {
    "name": "Test Customer",
    "email": "customer@example.com",
    "isEmailVerified": false
  }
}
```

#### Validation rules

- `name`, `email`, and `password` are required.
- The email address must have a valid format and be unique.
- The password must comply with the application's password policy.
- The account remains unverified until OTP verification is completed.

#### Possible errors

| Status | Meaning |
|---|---|
| `400 Bad Request` | Required information is missing or invalid |
| `409 Conflict` | An account already exists with the email address |
| `500 Internal Server Error` | Registration or email-processing failure |

### 6.3 User Login

Authenticates a registered user and returns a JWT.

```http
POST /api/auth/login
```

**Authentication:** Not required

#### Request body

| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | String | Yes | Registered email address |
| `password` | String | Yes | Account password |

#### Example request

```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

#### Successful response — `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<JWT_TOKEN>",
  "data": {
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Validation rules

- Both `email` and `password` are required.
- The email address must belong to an existing account.
- The supplied password must match the stored password.
- Protected actions require a valid, non-expired JWT.

#### Possible errors

| Status | Meaning |
|---|---|
| `400 Bad Request` | Email or password is missing |
| `401 Unauthorized` | Invalid login credentials |
| `403 Forbidden` | Account is inactive or restricted |
| `500 Internal Server Error` | Authentication service failure |

### 6.4 Retrieve Products

Returns a paginated product list and supports filtering, searching, and sorting.

```http
GET /api/products
```

**Authentication:** Not required

#### Query parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `page` | Number | No | Page number; default is `1` |
| `limit` | Number | No | Number of products per page |
| `category` | String | No | Filters products by category |
| `search` | String | No | Searches by product name or keyword |
| `sort` | String | No | Determines the sorting field |
| `order` | String | No | Sorting direction: `asc` or `desc` |

#### Example request

```http
GET {BASE_URL}/products?category=clothing&page=1&limit=10&sort=price&order=asc
```

#### Successful response — `200 OK`

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "PRODUCT_ID",
      "name": "Sample Product",
      "category": "Clothing",
      "price": 1500,
      "stock": 20
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

#### Validation rules

- `page` and `limit` must be positive integers.
- The requested category must be valid when provided.
- The sorting field and direction must be supported by the API.

#### Possible errors

| Status | Meaning |
|---|---|
| `400 Bad Request` | Invalid pagination, filter, or sorting value |
| `404 Not Found` | Requested product or category was not found |
| `500 Internal Server Error` | Product retrieval failure |

### 6.5 Create Product

Creates a product in the catalogue. This endpoint is restricted to administrators.

```http
POST /api/admin/products
```

**Authentication:** Required  
**Role:** Admin

#### Request body

| Field | Type | Required | Description |
|---|---|---:|---|
| `name` | String | Yes | Product name |
| `description` | String | Yes | Product description |
| `price` | Number | Yes | Product price |
| `category` | String | Yes | Product category identifier |
| `stock` | Number | Yes | Available quantity |
| `sizes` | Array | No | Available product sizes |
| `colours` | Array | No | Available product colours |
| `images` | Array | No | Product image references |

#### Example request

```json
{
  "name": "Men's Casual Shirt",
  "description": "Comfortable cotton casual shirt",
  "price": 1800,
  "category": "CATEGORY_ID",
  "stock": 25,
  "sizes": ["M", "L", "XL"],
  "colours": ["Black", "Blue"]
}
```

#### Successful response — `201 Created`

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "PRODUCT_ID",
    "name": "Men's Casual Shirt",
    "price": 1800,
    "stock": 25
  }
}
```

#### Validation rules

- Name, description, price, category, and stock are required.
- Price cannot be negative.
- Stock must be a non-negative integer.
- The category identifier must be valid.
- Uploaded files must follow the accepted image format and size rules.

#### Possible errors

| Status | Meaning |
|---|---|
| `400 Bad Request` | Product information is missing or invalid |
| `401 Unauthorized` | No token was provided or the token is invalid |
| `403 Forbidden` | The authenticated user is not an administrator |
| `404 Not Found` | The specified category does not exist |
| `500 Internal Server Error` | Product creation failure |

Example response when no token is provided:

```json
{
  "success": false,
  "message": "Not authorized – no token provided"
}
```

### 6.6 Place Order

Creates an order from a valid cart and delivery address.

```http
POST /api/orders
```

**Authentication:** Required  
**Role:** Customer or authorised account holder

#### Request body

| Field | Type | Required | Description |
|---|---|---:|---|
| `items` | Array | Yes | Products, quantities, sizes, and colours |
| `shippingAddress` | Object | Yes | Customer's delivery address |
| `paymentMethod` | String | Yes | Selected payment method |
| `couponCode` | String | No | Promotional code |
| `transactionId` | String | Conditional | Required for applicable mobile payments |

#### Example request

```json
{
  "items": [
    {
      "product": "PRODUCT_ID",
      "quantity": 2,
      "size": "L",
      "colour": "Black"
    }
  ],
  "shippingAddress": {
    "name": "Test Customer",
    "phone": "01XXXXXXXXX",
    "district": "Dhaka",
    "address": "Bashundhara, Dhaka"
  },
  "paymentMethod": "Cash on Delivery"
}
```

#### Successful response — `201 Created`

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "ORDER_ID",
    "status": "Pending",
    "paymentStatus": "Pending",
    "totalAmount": 3600
  }
}
```

#### Validation rules

- The cart must contain at least one valid product.
- Product quantities must be positive integers and cannot exceed available stock.
- Required delivery-address fields must be supplied.
- The payment method must be supported.
- Mobile-payment information is subject to manual verification.
- Coupon codes must be valid, active, and within their usage period.

#### Possible errors

| Status | Meaning |
|---|---|
| `400 Bad Request` | Invalid cart, address, payment information, or coupon |
| `401 Unauthorized` | Authentication is missing or invalid |
| `404 Not Found` | A selected product was not found |
| `409 Conflict` | Requested stock is unavailable |
| `500 Internal Server Error` | Order-processing failure |

## 7. HTTP Status Codes

| Status code | Description |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | A new account, product, or order was created |
| `400 Bad Request` | Invalid or incomplete request data |
| `401 Unauthorized` | Authentication token is missing, invalid, or expired |
| `403 Forbidden` | The user does not have the required permission |
| `404 Not Found` | The requested resource does not exist |
| `409 Conflict` | Duplicate data or a stock conflict occurred |
| `429 Too Many Requests` | The rate limit was exceeded |
| `500 Internal Server Error` | An unexpected server-side error occurred |

## 8. Roles and Permissions

| Role | Permissions |
|---|---|
| Public visitor | View and search products, register, and log in |
| Customer | Manage cart and wishlist, place orders, and view personal orders |
| Admin | Manage products, categories, orders, promo codes, careers, and administrative information |

Role-based access control is applied after JWT verification. An authenticated customer attempting to access an administrator endpoint should receive `403 Forbidden`.

## 9. Pagination, Filtering, and Sorting

Product-list endpoints use pagination to prevent excessively large responses. A typical request is:

```http
GET /api/products?page=1&limit=10&category=clothing&sort=price&order=asc
```

The response should include the current page, page size, total number of records, and total number of pages. Filtering can use category and search parameters, while sorting can use supported fields such as price, creation date, or product name.

## 10. Rate Limiting

A production deployment should apply rate limiting, particularly to authentication and OTP endpoints, to prevent brute-force attacks and service abuse. When the limit is exceeded, the API should return `429 Too Many Requests`:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

> **Implementation note:** If rate limiting is not configured in the current version, document it as a production recommendation, especially for login, registration, OTP, and password-reset endpoints.
