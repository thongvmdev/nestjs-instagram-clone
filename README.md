# Instagram API

A REST API for an Instagram-like social platform built with [NestJS](https://nestjs.com/), TypeORM, and MySQL. Features user authentication (JWT), photos, comments, likes, follows, hashtags, and analytics.

## Tech Stack

- **Framework:** NestJS 11
- **Database:** MySQL 8 + TypeORM
- **Auth:** JWT (passport-jwt), bcrypt
- **Validation:** class-validator, class-transformer

## Prerequisites

- Node.js 18+
- pnpm 10+
- MySQL 8+

## Environment Setup

Create a `.env` file in the project root:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=instagram_clone
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

Create the `instagram_clone` database in MySQL. TypeORM will synchronize schema when `NODE_ENV` is not `production`.

## Installation

```bash
pnpm install
```

## Running the App

```bash
# development (watch mode)
pnpm run start:dev

# production build
pnpm run build
pnpm run start:prod
```

Default port: `3000` (or `process.env.PORT`).

## API Endpoints

### Auth

| Method | Endpoint        | Auth | Description                    |
|--------|-----------------|------|--------------------------------|
| POST   | `/auth/signup`  | No   | Create account → `{ access_token, user }` |
| POST   | `/auth/signin`  | No   | Sign in → `{ access_token }`   |
| GET    | `/auth/me`      | Yes  | Current user profile           |

### Users

| Method | Endpoint     | Auth | Description          |
|--------|--------------|------|----------------------|
| GET    | `/users`     | No   | List users           |
| GET    | `/users/:id` | No   | User profile         |
| PATCH  | `/users/:id` | Yes  | Update user          |
| DELETE | `/users/:id` | Yes  | Delete user          |

### Photos

| Method | Endpoint       | Auth | Description          |
|--------|----------------|------|----------------------|
| POST   | `/photos`      | Yes  | Create photo         |
| GET    | `/photos`      | No   | List photos          |
| GET    | `/photos/:id`  | No   | Get photo            |
| DELETE | `/photos/:id`  | Yes  | Delete photo (owner) |

### Comments

| Method | Endpoint                     | Auth | Description          |
|--------|------------------------------|------|----------------------|
| POST   | `/photos/:photoId/comments`  | Yes  | Add comment          |
| GET    | `/photos/:photoId/comments`  | No   | Comments for photo   |
| DELETE | `/comments/:id`              | Yes  | Delete comment       |

### Likes

| Method | Endpoint                      | Auth | Description        |
|--------|-------------------------------|------|--------------------|
| POST   | `/photos/:photoId/likes`      | Yes  | Like photo         |
| DELETE | `/photos/:photoId/likes`      | Yes  | Remove like        |
| GET    | `/photos/:photoId/likes/count`| No   | Like count         |

### Follows

| Method | Endpoint              | Auth | Description       |
|--------|-----------------------|------|-------------------|
| POST   | `/follows/:userId`    | Yes  | Follow user       |
| DELETE | `/follows/:userId`    | Yes  | Unfollow user     |
| GET    | `/users/:id/followers`| No   | User's followers  |
| GET    | `/users/:id/following`| No   | User's following  |
| GET    | `/feed`               | Yes  | Feed (followed)   |

### Tags

| Method | Endpoint                  | Auth | Description          |
|--------|---------------------------|------|----------------------|
| POST   | `/photos/:photoId/tags`   | Yes  | Add tag to photo     |
| GET    | `/tags/:name/photos`      | No   | Photos by tag        |
| GET    | `/tags/trending`          | No   | Top 5 trending tags  |

### Analytics

| Method | Endpoint                         | Auth | Description              |
|--------|----------------------------------|------|--------------------------|
| GET    | `/analytics/oldest-users`        | No   | 5 oldest accounts        |
| GET    | `/analytics/popular-signup-day`  | No   | Most popular signup day  |
| GET    | `/analytics/inactive-users`      | No   | Users with no photos     |
| GET    | `/analytics/most-liked-photo`    | No   | Photo with most likes    |
| GET    | `/analytics/avg-posts-per-user`  | No   | Avg posts per user       |
| GET    | `/analytics/top-hashtags`        | No   | Top 5 hashtags           |
| GET    | `/analytics/bot-accounts`        | No   | Users who liked all photos |

**Protected routes:** Use `Authorization: Bearer <access_token>` header.

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── auth/           # JWT auth, signup/signin
├── users/          # Users CRUD, profiles
├── photos/        # Photos, relations
├── comments/      # Comments on photos
├── likes/         # Like/unlike photos
├── follows/       # Follow/unfollow, feed
├── tags/          # Hashtags, trending
├── analytics/     # SQL analytics queries
├── interceptors/ # Serialize (DTO) interceptor
└── ...
```

## Testing

```bash
# unit tests
pnpm run test

# e2e tests (uses .env.test)
pnpm run test:e2e

# coverage
pnpm run test:cov
```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `pnpm run build`      | Compile NestJS           |
| `pnpm run start:dev`  | Development with watch   |
| `pnpm run lint`       | ESLint + fix             |
| `pnpm run format`     | Prettier format          |

## License

UNLICENSED
