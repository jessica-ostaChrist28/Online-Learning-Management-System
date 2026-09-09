# Online Learning Management System (LMS)

Project:
P06 – Online Learning Management System

Team:
- JOHN JOBY C
- JESSICA JOHN OSTA
- JOBIN JOSEPH ALOUR
- JOEL S DANIEL

## Current Architecture & Technology Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- express-validator

## Implemented Modules

### 1. User Registration & Authentication
- **User Model**: Name, email, password (bcrypt hashed), role.
- **Registration (`POST /api/auth/register`)**: Validates input, ensures unique email, hashes password, and creates the user.
- **Login (`POST /api/auth/login`)**: Verifies credentials and issues a JWT token.
- **JWT**: Tokens are signed and verified securely.
- **Role-Based Access Control (RBAC)**: Middleware validates JWTs (`protect`) and enforces role-based restrictions (`requireRole`). Supported roles: `student`, `instructor`, `admin`.

*(Note: Additional features such as courses, enrollment, etc., are pending implementation.)*

## Setup Prerequisites
- Node.js (v14 or higher recommended)
- MongoDB running locally or MongoDB Atlas URI

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your real MongoDB URI, PORT, and JWT secrets.

## How to Run

To run the development server with auto-reloading:
```bash
npm run dev
```

To run normally:
```bash
npm start
```

## Health-check Endpoint

You can verify the API is running by hitting the health-check endpoint:
```http
GET /api/health
```
**Response**:
```json
{
  "success": true,
  "message": "LMS Backend API is running"
}
```

## Postman Testing

A Postman collection is available in the `postman/` directory. Import `LMS_Step2.postman_collection.json` into Postman to test:
- User Registration (including validation and duplicate checks)
- User Login (automatically stores the JWT as a `studentToken` environment variable)
- RBAC Test Endpoints (`/api/test/student`, `/api/test/admin`)
