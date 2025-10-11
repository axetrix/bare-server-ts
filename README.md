# Training HTTP Server

A comprehensive Express.js HTTP server with user authentication, chirp management, and webhook handling.

## API Documentation

### Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

## Health & Admin

#### Health Check
- **GET** `/api/healthz`
- **Description**: Check if the server is running
- **Response**: `200 OK` with plain text "OK"

#### Admin Metrics
- **GET** `/admin/metrics`
- **Description**: View server metrics (file server hits)
- **Response**: HTML page with visit count

#### Admin Reset (Development Only)
- **POST** `/admin/reset`
- **Description**: Remove all users from the database
- **Auth**: None required
- **Environment**: Development only
- **Response**:
  ```json
  {
    "message": "All users removed successfully"
  }
  ```

## User Management

#### Create User
- **POST** `/api/users`
- **Description**: Register a new user account
- **Auth**: None required
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isChirpyRed": false
  }
  ```

#### Update User
- **PUT** `/api/users`
- **Description**: Update user email and/or password
- **Auth**: JWT token required
- **Request Body**:
  ```json
  {
    "email": "newemail@example.com",
    "password": "newpassword123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "email": "newemail@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isChirpyRed": false
  }
  ```

## Authentication

#### User Login
- **POST** `/api/login`
- **Description**: Authenticate user and receive access tokens
- **Auth**: None required
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "token": "jwt_access_token",
    "refreshToken": "refresh_token",
    "isChirpyRed": false
  }
  ```

#### Refresh Token
- **POST** `/api/refresh`
- **Description**: Get a new access token using refresh token
- **Auth**: Refresh token in Authorization header
- **Response**: `200 OK`
  ```json
  {
    "token": "new_jwt_access_token"
  }
  ```

#### Revoke Token
- **POST** `/api/revoke`
- **Description**: Revoke refresh token (logout)
- **Auth**: Refresh token in Authorization header
- **Response**: `204 No Content`

## Chirps (Posts)

#### Get All Chirps
- **GET** `/api/chirps`
- **Description**: Retrieve all chirps with optional filtering and sorting
- **Auth**: None required
- **Query Parameters**:
  - `authorId` (optional): Filter by author ID
  - `sort` (optional): Sort order, "asc" (default) or "desc"
- **Example**: `/api/chirps?authorId=uuid&sort=desc`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "body": "This is a chirp!",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

#### Create Chirp
- **POST** `/api/chirps`
- **Description**: Create a new chirp (post)
- **Auth**: JWT token required
- **Request Body**:
  ```json
  {
    "body": "This is my new chirp!"
  }
  ```
- **Validation**:
  - Maximum 140 characters
  - Profane words are replaced with "****"
  - Blocked words: "kerfuffle", "sharbert", "fornax"
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "body": "This is my new chirp!",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Get Single Chirp
- **GET** `/api/chirps/:id`
- **Description**: Retrieve a specific chirp by ID
- **Auth**: None required
- **Parameters**:
  - `id`: Chirp ID (UUID)
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "body": "This is a chirp!",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Delete Chirp
- **DELETE** `/api/chirps/:id`
- **Description**: Delete a chirp (only by author)
- **Auth**: JWT token required
- **Parameters**:
  - `id`: Chirp ID (UUID)
- **Authorization**: Only the chirp author can delete their chirp
- **Response**: `204 No Content`

## Webhooks

#### Polka Webhook
- **POST** `/api/polka/webhooks`
- **Description**: Handle webhook events from Polka payment service
- **Auth**: API key in Authorization header (`ApiKey <api_key>`)
- **Request Body**:
  ```json
  {
    "event": "user.upgraded",
    "data": {
      "userId": "uuid"
    }
  }
  ```
- **Response**: `204 No Content`
- **Note**: Only processes "user.upgraded" events, upgrades user to ChirpyRed status

## Static Files

#### App Static Files
- **GET** `/app/*`
- **Description**: Serve static files from the app directory
- **Auth**: None required
- **Note**: Includes middleware to track file server hits

## Error Responses

All endpoints return appropriate HTTP status codes with JSON error responses:

### 400 Bad Request
```json
{
  "error": "Provided data is invalid. Missing body"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "User is not authorized to delete this chirp"
}
```

### 404 Not Found
```json
{
  "error": "Chirp with id uuid not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create chirp"
}
```

## Features

- **JWT Authentication**: Secure token-based authentication
- **Refresh Token System**: Long-lived refresh tokens for seamless re-authentication
- **Content Moderation**: Automatic profanity filtering in chirps
- **User Roles**: ChirpyRed premium user status
- **Webhook Integration**: Payment service integration via webhooks
- **Request Logging**: Comprehensive request/response logging
- **Static File Serving**: Built-in static file server with hit tracking
- **Database Integration**: Full CRUD operations with proper error handling

## Development

The server includes development-only features:
- Admin reset endpoint for clearing all users
- Detailed error logging and response middleware
- File server hit tracking for analytics

## Security Features

- Password hashing using bcrypt
- JWT token validation
- API key authentication for webhooks
- User authorization for resource access
- Input validation and sanitization
- Secure error handling without information leakage
