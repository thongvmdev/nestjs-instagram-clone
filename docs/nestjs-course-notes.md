# NestJS Course Notes
> By Stephen Grider

---

## Table of Contents

1. [Introduction to NestJS](#1-introduction-to-nestjs)
2. [Project Structure & Conventions](#2-project-structure--conventions)
3. [Request Handling & Decorators](#3-request-handling--decorators)
4. [Validation & DTOs](#4-validation--dtos)
5. [Repositories & Services](#5-repositories--services)
6. [Dependency Injection](#6-dependency-injection)
7. [Inversion of Control](#7-inversion-of-control)
8. [Messages App (First Project)](#8-messages-app-first-project)
9. [DI Container Deep Dive](#9-di-container-deep-dive)
10. [Used Car Pricing API — Overview](#10-used-car-pricing-api--overview)
11. [TypeORM & Entities](#11-typeorm--entities)
12. [TypeORM Repository API](#12-typeorm-repository-api)
13. [Associations / Relations](#13-associations--relations)
14. [Interceptors & Serialization](#14-interceptors--serialization)
15. [Authentication — Cookies & Hashing](#15-authentication--cookies--hashing)
16. [Guards & Authorization](#16-guards--authorization)
17. [Unit & E2E Testing](#17-unit--e2e-testing)
18. [Configuration & Environment Variables](#18-configuration--environment-variables)
19. [Modules & Cross-Module DI](#19-modules--cross-module-di)
20. [Advanced DI (Optional)](#20-advanced-di-optional)
21. [Migrations & Deployment](#21-migrations--deployment)

---

## 1. Introduction to NestJS

### Why NestJS?
- Clear design patterns
- Great integration for popular packages (`@nestjs/typeorm`, `@nestjs/passport`, `@nestjs/mongoose`, etc.)
- Great documentation — [docs.nestjs.com](https://docs.nestjs.com)
- Easy testing + code reuse through **dependency injection**

### Getting Help
- Udemy Q&A Discussion
- Discord (link in next lecture)
- DM via Udemy

### Prerequisites
- Familiarity with Node.js
- TypeScript (check appendix if unfamiliar)

### NestJS 3rd-Party Package Integrations

| NestJS Package | Wraps |
|---|---|
| `@nestjs/typeorm` | `typeorm` |
| `@nestjs/elasticsearch` | `elasticsearch` |
| `@nestjs/mongoose` | `mongoose` |
| `@nestjs/passport` | `passport` |

### Core Parts of a Nest App

| Part | Role |
|---|---|
| **Controllers** | Handles incoming requests |
| **Services** | Handles data access and business logic |
| **Modules** | Groups together code |
| **Pipes** | Validates incoming data |
| **Filters** | Handles errors that occur during request handling |
| **Guards** | Handles authentication |
| **Interceptors** | Adds extra logic to incoming requests or outgoing responses |
| **Repositories** | Handles data stored in a DB |

### Request Lifecycle (Labeled)

```
Request
  → Pipe       (Validate data)
  → Guard      (Make sure user is authenticated)
  → Controller (Route the request to a function)
  → Service    (Run business logic)
  → Repository (Access a database)
→ Response
```

### Key Dependencies

| Package | Purpose |
|---|---|
| `@nestjs/core` | Contains vast majority of functions/classes needed from Nest |
| `@nestjs/platform-express` | Lets Nest use Express JS for handling HTTP requests |
| `reflect-metadata` | Helps make decorators work |

### Getting Started
1. Install dependencies
2. Set up TypeScript compiler settings
3. Create a Nest module and controller
4. Start the app

---

## 2. Project Structure & Conventions

### File Conventions
- One class per file (some exceptions)
- Filename template: `name.type_of_thing.ts`
  - e.g. `app.controller.ts`, `app.module.ts`
- Class names should include the kind of thing being created
- Name of class and name of file should always match up

### Typical File Structure

```
main.ts            → function bootstrap()
app.controller.ts  → class AppController {}
app.module.ts      → class AppModule {}
```

---

## 3. Request Handling & Decorators

### How a Basic Controller Works

```
Request: GET '/'
  → AppController → greeting() → returns 'hi there'
→ Response
```

**Decorators explanation:**
- `@Controller()` — Tells Nest we are about to define a controller
- `@Get('/')` — Tells Nest to run this method anytime someone makes a GET request to `localhost:3000/`
- Return value — Tells Nest to send the value back as the response

### HTTP Method Decorators

| Decorator | Purpose |
|---|---|
| `@Get()` | Handle incoming GET requests |
| `@Post()` | Handle incoming POST requests |
| `@Patch()` | Handle incoming PATCH requests |
| `@Put()` | Handle incoming PUT requests |
| `@Delete()` | Handle incoming DELETE requests |

### Controller Route Options

**Option 1 — Route in method decorator:**
```typescript
@Controller()
export class MessagesController {
  @Get('/messages')   listMessages()
  @Post('/messages')  createMessage()
  @Get('/messages/:id') getMessage()
}
```

**Option 2 — Route prefix in class decorator:**
```typescript
@Controller('/messages')
export class MessagesController {
  @Get()        listMessages()
  @Post()       createMessage()
  @Get('/:id')  getMessage()
}
```

### Parameter Decorators

| Decorator | Extracts |
|---|---|
| `@Body()` | Get the full body of an incoming request |
| `@Body('name')` | Get a single property from the body |
| `@Query()` | Get the full query string |
| `@Query('name')` | Get a single property from the query string |
| `@Headers()` | Get the request headers |
| `@Param('id')` | Get a route parameter |

### Anatomy of an HTTP Request

```
POST  /messages/5?validate=true  HTTP/1.1
Host: localhost:3000                          ← Headers
Content-Type: application/json
{ "content": "hi there" }                    ← Body

Mapped to decorators:
  @Param('id')   → 5
  @Query()       → { validate: 'true' }
  @Headers()     → { Host, Content-Type, ... }
  @Body()        → { content: 'hi there' }
```

### Decorator Types (TypeScript)

Decorators are **functions intended to modify a class, property, method, accessor, or argument.**

| Decorator Target | Called With |
|---|---|
| Class | The class |
| Property | Class + property name |
| Method | Class + method name + property descriptor |
| Argument | Class + method name + index of argument |

### API Testing Tools
- **Postman** — Easy to use, requires separate download + signup
- **VSCode REST Client Extension** — Easy to use, requires VSCode only

---

## 4. Validation & DTOs

### Built-in Exception Responses

| Exception | Status Code |
|---|---|
| `BadRequestException` | 400 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `NotAcceptableException` | 406 |
| `InternalServerErrorException` | 500 |

### ValidationPipe

Nest has a built-in `ValidationPipe` that makes validation super easy.

```
POST /messages
{ "content": "hi there" }
  → ValidationPipe
  → Controller Route Handler
```

The pipe works by:
1. Using `class-transformer` to turn the body into an instance of the DTO class
2. Using `class-validator` to validate the instance
3. If there are validation errors → respond immediately with error
4. Otherwise → provide the validated body to the request handler

### Setting Up Automatic Validation (4 Steps)

1. **Create a DTO class** that describes the properties the request body should have
2. **Tell Nest to use global validation**
3. **Add validation rules** to the DTO class
4. **Apply the DTO class** to the request handler

```typescript
// dto/create-message.dto.ts
class CreateMessageDto {
  message: string
}
```

### Key Libraries
- [`github.com/typestack/class-validator`](https://github.com/typestack/class-validator)
- [`github.com/typestack/class-transformer`](https://github.com/typestack/class-transformer)

### TypeScript vs JavaScript

```typescript
// TypeScript world:
addMessage(@Body() body: AddMessageDto) {}

// JavaScript world (after compilation):
addMessage(body) {}
```

> **Important:** Types are stripped away when TS is compiled to JS. Nest uses `reflect-metadata` to work around this.

### Whitelist / Extra Properties

**Problem with extra properties:**
```
Request: { email: 'a@a.com', password: undefined }  → Bug!
```

- `CreateUserDto` — validates `email` and `password`
- `BulkCreateUserDto` — validates only `email`, password remains `undefined` → security bug
- Always use `whitelist: true` with `ValidationPipe` to strip extra properties

---

## 5. Repositories & Services

### Repositories
- Class that has methods to **directly interact with a database**
- Usually a TypeORM repository, Mongoose/Mongo collection, or similar
- Stores exactly **one type** of record
- Common methods: `findOne()`, `findAll()`, `update()`, `remove()`

### Services
- Class that has methods to directly interact with a database _(in simple apps)_
- Can have methods to modify data in **any way imaginable**
- Wrap up business logic and govern access to data
- Uses **dependency injection**
- Many apps end up with majority of code in services

### Services vs Repositories

| | Service | Repository |
|---|---|---|
| Purpose | Business logic | Storage/data access |
| Place in stack | #1 for business logic | #1 for storage-related logic |
| Uses | One or more repositories | TypeORM entity, Mongoose schema, etc. |
| Method names | Often similar to repo | findOne, findAll, create |

> **Gotcha:** In simple apps, services and repositories will look almost identical. The official Nest docs don't really mention something called "repositories."

### Example Service/Repository Pair

```
MessagesService       MessageRepository
  findOne(id)           findOne(id)
  findAll()             findAll()
  create(message)       create(message)
```

This similarity is **common and OK!**

---

## 6. Dependency Injection

### What is DI?

> The DI system automatically figures out class dependencies and manages them for you.

**Key points:**
- Many classes depend on other classes to work correctly
- The DI system assumes the **Inversion of Control** principle is good
- Nest's DI system is not perfect — limited by TypeScript
- Most useful when it comes to **unit testing**

### Setting Up Dependency Injection (4 Steps)

1. **Determine** the dependent class and the provider class
2. **Mark the provider class** with the `@Injectable()` decorator
3. **Add the provider class** to the module's list of `providers`
4. **Add a constructor** to the dependent class that requests the provider

```
Provider  → MessagesService
Dependent → MessagesController
```

### DI Container Flow

```
1. At startup → register all classes with the container
2. Container figures out what dependencies each class has
3. We ask the container to create an instance of a class
4. Container creates all required dependencies and gives us the instance
5. Container holds onto created dependency instances and reuses them if needed
```

**In Practice:**
- Use `@Injectable()` decorator on each class
- Add them to the module's list of providers
- Nest automatically creates controller instances

### DI Container Example

```
Nest DI Container
  ┌─────────────────────┬──────────────────────────┐
  │ Class               │ Dependency               │
  ├─────────────────────┼──────────────────────────┤
  │ MessagesService     │ MessagesRepo             │
  │ MessagesController  │ MessagesService          │
  └─────────────────────┴──────────────────────────┘

  → Creates: messagesRepo instance
  → Creates: messagesService instance (using messagesRepo)
  → Creates: messagesController instance (using messagesService)
```

### Why DI Makes Testing Easy

```
In Production:
  MessagesService ← MessagesRepository (writes to disk, slower)

While Testing:
  MessagesService ← FakeRepository (doesn't write to disk, runs fast!)
```

---

## 7. Inversion of Control

### The Principle

> **Classes should NOT create instances of their dependencies on their own.**

### Bad → Better → Best

| Approach | Description | Code |
|---|---|---|
| **Bad** | Tight coupling — MessagesService creates its own copy of MessagesRepository | `this.repo = new MessagesRepository()` |
| **Better** | Still tight coupling, but we can configure MessagesRepository | Pass repo as constructor arg |
| **Best** | Notification and Sender completely decoupled — uses interfaces | Constructor accepts interface, not concrete class |

> **Note:** Due to limitations in TypeScript, Nest assumes you are using the "Better" method. (But you can trick Nest and TS into using "Best" with interfaces.)

### Why Use DI in General

- Huge code decoupling
- Swap out major parts of functionality
- Testing is easy!

### Why Use DI with Nest (in reality)

- ~~Huge code decoupling~~ (Nest's DI is class-based, not interface-based)
- ~~Swap out major parts of functionality~~
- **Testing is easy!** ✓

### Scaling Problem (Why Not Manual Instantiation)

Imagine an e-commerce app with notification classes. If you need to send notifications via Email, Text, Twitter, TikTok, Instagram, Facebook...

```
# different notifications × # different delivery mechanisms = # classes
```

This becomes unmanageable without DI.

---

## 8. Messages App (First Project)

### App Goal
> Store and retrieve messages stored in a plain JSON file

### API Routes

| Method | Route | Body | Description |
|---|---|---|---|
| GET | `/messages` | — | Return a list of all messages |
| POST | `/messages` | `{ message: string }` | Create and store a new message |
| GET | `/messages/:id` | — | Retrieve a message with the given ID |

### App Architecture

```
Request
  → Pipe (ValidationPipe)
  → MessagesController
  → MessagesService
  → MessagesRepository
  → messages.json
→ Response
```

### Generating a Controller

```bash
nest generate controller messages/messages --flat
```

| Flag | Meaning |
|---|---|
| `controller` | Type of class to generate |
| `messages/messages` | Place file in `messages/` folder, call class `messages` |
| `--flat` | Don't create an extra folder called `controllers` |

### POST Request Flow (with Validation)

```
User sends POST to '/'
  → Does body have a 'message' property?
  ├── No  → Return an error
  └── Yes → Read messages.json
           → Generate a random ID
           → Add the new message to the list
           → Write the file back to disk
```

---

## 9. DI Container Deep Dive

### Services vs Repositories (Side-by-Side)

| | Services | Repositories |
|---|---|---|
| Focus | Business logic | Storage/data logic |
| Uses | One or more repositories | TypeORM entity, Mongoose schema |
| Method style | Various | findOne, save, create, remove |

### IoC Principle Revisited

> Classes should not create instances of its dependencies on its own.

**Bad:**
```typescript
// MessagesService creates its own copy of MessagesRepository
class MessagesService {
  repo = new MessagesRepository();
}
```

**Better:**
```typescript
class MessagesService {
  constructor(repo: MessagesRepository) {
    this.repo = repo;
  }
}
```

**Best:**
```typescript
class MessagesService {
  constructor(repo: MessagesRepoInterface) { // accepts interface
    this.repo = repo;
  }
}
```

---

## 10. Used Car Pricing API — Overview

### App Features
- Users sign up with email/password
- Users get an **estimate** for how much their car is worth (make/model/year/mileage)
- Users can **report** what they sold their vehicles for
- **Admins** have to approve reported sales

### API Routes

| Method | Route | Body / QS | Description |
|---|---|---|---|
| POST | `/auth/signup` | `{ email, password }` | Create a new user and sign in |
| POST | `/auth/signin` | `{ email, password }` | Sign in as an existing user |
| GET | `/reports` | QS: make, model, year, mileage, lng, lat | Get an estimate for car value |
| POST | `/reports` | `{ make, model, year, mileage, lng, lat, price }` | Report how much a vehicle sold for |
| PATCH | `/reports/:id` | `{ approved }` | Approve or reject a report |

### Module Structure

```
AppModule
  ├── UsersModule
  │     ├── UsersController
  │     ├── UsersService
  │     └── UsersRepository (User Entity)
  └── ReportsModule
        ├── ReportsController
        ├── ReportsService
        └── ReportsRepository (Report Entity)
```

### ORM Choice

| Phase | Database | ORM |
|---|---|---|
| Development | SQLite | TypeORM |
| Production | Postgres | TypeORM |

> Nest works fine with any ORM, but works well out of the box with **TypeORM** and **Mongoose**.

---

## 11. TypeORM & Entities

### What is an Entity?

```
class User              TypeORM               Database
  id: number    ─────────────────────→    Table of users
  email: string   (reads Entity class)    id | email | password
  password: string
```

### Entity Decorators

```typescript
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;
}
```

### Creating an Entity (3 Steps)

1. **Create an entity file** — a class listing all properties
2. **Connect the entity to its parent module** — this creates a repository
3. **Connect the entity to the root connection** (in `AppModule`)

### App Module Structure

```
AppModule
  ├── Connection to SQLite DB
  ├── UsersModule
  │     ├── User Entity     (lists properties a User has — no functionality)
  │     └── Users Repository (methods to find, update, delete, create a User)
  └── ReportsModule
        ├── Report Entity   (lists properties a Report has — no functionality)
        └── Reports Repository (methods to find, update, delete, create a Report)
```

### TypeORM in Practice

```typescript
// TypeOrmModule.forRoot config
{
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [User, Report],
  synchronize: true,  // auto-syncs schema in development
}
```

### Working with Records

```
'b@b.com', 'a'
  → this.repo.create()  → User Entity Instance { email, password }
  → this.repo.save()    → Persisted to DB
```

### Users Repository API

| Method | Behavior |
|---|---|
| `create(User)` | Creates, but does **not** save, a User entity |
| `save(User)` without ID | Creates a new record |
| `save(User)` with ID | Updates existing record |
| `findOne(User)` | Find a user with the given filter criteria |
| `remove(User)` | Remove a user |

### `save()` vs `insert()` / `update()`

| Method | Hooks Executed? |
|---|---|
| `save(Entity)` | ✅ Yes |
| `insert()` / `update()` | ❌ No |

> **Best practice:** Use `save()` and `remove()` (with entity instances) so that lifecycle hooks are triggered.

### Validation with DTOs

```
Request { email: 'a@a.com', password: 'a' }
  → ValidationPipe
  → CreateUserDto (@IsEmail email, @IsString password)
  → Service
  → Repository
  → User Entity
```

> **Note:** The User Entity may have more properties (e.g. `admin: boolean`) than the DTO — this is intentional and expected.

### Extra CRUD Routes (for learning TypeORM)

| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Create a new user |
| GET | `/auth/:id` | Find a user with given id |
| PATCH | `/auth/:id` | Update a user with given id |
| DELETE | `/auth/:id` | Delete user with given id |
| GET | `/auth?email=...` | Find all users with given email |

> *(Not needed for the real app — added to better understand TypeORM)*

---

## 12. TypeORM Repository API

```
typeorm.io/#/repository-api
```

| Method | Description |
|---|---|
| `create()` | Makes a new instance of an entity, but does **not** persist it to the DB |
| `save()` | Adds or updates a record to the DB |
| `find()` | Runs a query and returns a list of entities |
| `findOne()` | Run a query, returning the first record matching the search criteria |
| `remove()` | Remove a record from the DB |
| `createQueryBuilder()` | Returns a query builder for complex queries |

### Error Handling

```typescript
// GET /auth/:id, PATCH /auth/:id, DELETE /auth/:id
if (user not found) → throw new NotFoundException()
```

### HTTP Exceptions (All Assume HTTP Context)

- `NotFoundException`
- `ForbiddenException`
- `UnauthorizedException`
- `BadRequestException`

> **Problem:** If you have both HTTP and WebSocket/gRPC controllers calling the same service, `NotFoundException` (HTTP-specific) won't make sense for the WebSocket controller.

---

## 13. Associations / Relations

### SQL Relationship Types

| Type | Examples |
|---|---|
| One-to-One | Country → Capital, Passport → Person |
| One-to-Many / Many-to-One | Customers → Orders, Car → Parts, Country → Cities |
| Many-to-Many | Trains ↔ Riders, Classes ↔ Students |

### Our App: User ↔ Report

```
User id=1
  ├── Report id=1
  ├── Report id=2
  └── Report id=3

User id=2
  ├── Report id=4
  └── Report id=5
```

→ **A User has many Reports** (One-to-Many)
→ **A Report has one User** (Many-to-One)

### TypeORM Decorators

```typescript
class User {
  @OneToMany(() => Report, report => report.user)
  reports: Report[];
  // Function that returns the target entity
  // Given a user, here's how to get their reports
}

class Report {
  @ManyToOne(() => User, user => user.reports)
  user: User;
  // Function that returns the target entity
  // Given a report, here's how to get a user
}
```

### Database Impact

| Decorator | Changes DB? |
|---|---|
| `@OneToMany()` on User | Does **not** change the Users table |
| `@ManyToOne()` on Report | **Changes** the Reports table (adds `userId` column) |

> **Important:** Associations are **not automatically fetched** when you fetch a record.

### Setting Up Associations (4 Steps)

1. **Figure out** what kind of association you are modeling
2. **Add the appropriate decorators** to related entities
3. **Associate the records** when one is created
4. **Apply a serializer** to limit info shared

### Creating a Report with Associated User

```
POST /reports
Cookie: asdfj14
{ year: 1950, mileage: 1551, price: 5523, make, model, lng, lat }
  → @CurrentUser() Decorator      → user entity instance
  → @Body() CreateReportDto       → Validated CreateReportDto
  → Report Entity Instance { lng, lat, price, ..., user }
  → Reports Repo.save()
```

### Price Estimate Algorithm

Find reports for the same make/model that are:
- Within ±5 degrees of given longitude/latitude
- Within 3 years of given year
- Ordered by closest mileage
- Take the top 3 closest reports and average their value

### Query Builder API

```
typeorm.io/#/select-query-builder
```

| Method | Purpose |
|---|---|
| `.where()` | Filter out some rows |
| `.andWhere()` | Add another 'where' filter |
| `.orderBy()` | Order rows by some criteria |
| `.select()` | Pull out specific data from filtered/sorted rows |
| `.getOne()` / `.getRawOne()` | Execute query, return one result |
| `.getMany()` / `.getRawMany()` | Execute query, return many results |

---

## 14. Interceptors & Serialization

### The Problem

```
GET /auth/2
  → UsersController.findUser()
  → UsersService.findOne()
  → User Entity Instance (contains password, admin fields, etc.)
  → Sent back as-is to the client ← problem!
```

### Solution: Custom Interceptor + DTO

```
GET /auth/2
  → UsersController.findUser()
  → UsersService.findOne()
  → User Entity Instance
  → Custom Interceptor (uses UserDto to serialize)
  → User DTO instance (only safe fields)
→ Response
```

### Different DTOs for Different Contexts

```
GET /admin/users/2 → FullUserDto   (id, email, age, name — more fields)
GET /users/2       → PartialUserDto (id, email — fewer fields)
```

### Custom Interceptor Class

```typescript
class CustomInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // 'intercept' is called automatically
    // context → information on the incoming request
    // next    → kind of a reference to the request handler in our controller
  }
}
```

### Interceptor Scope

Interceptors can be applied to:
- A **single handler**
- **All handlers** in a controller
- **Globally** (recommended for current user interceptor)

### Nest's Recommended Approach (ClassSerializerInterceptor)

```
User Entity Instance
  → ClassSerializerInterceptor
  → Turns instance into plain object based on @Expose/@Exclude decorators
→ Response
```

> **Downside:** Not flexible enough for multiple representations of the same entity.

---

## 15. Authentication — Cookies & Hashing

### Auth System Features

| Feature | Tool |
|---|---|
| Sign up | Handler + UsersService |
| Sign in | Handler + AuthService |
| Sign out | Handler |
| Return current user | Handler + Interceptor + Decorator |
| Reject unauthenticated requests | Guard |
| Tell handler who the current user is | Interceptor + Decorator |

### Cookie-Based Auth Flow

```
Client                      Server
  POST /auth/signup
  { email, password }
                    ──────→ 1. Check if email already in use → error if yes
                            2. Encrypt the user's password
                            3. Store the new user record
                            4. Send back a cookie with user's id
  Cookie: userId=50 ←──────

  (Browser auto-stores cookie and attaches to future requests)

  POST /reports
  Cookie: userId=50
                    ──────→ 1. Look at cookie, make sure it hasn't been tampered
                            2. Look at userId in cookie to figure out who is requesting
```

### cookie-session Library

```
GET /auth/colors/blue
Cookie: ey4ji1p45152
                          ↓
  Cookie-Session decodes the cookie string → { userId: 12 }
                          ↓
  We access session with a decorator
                          ↓
  We add/remove/change properties on session object: { color: 'blue' }
                          ↓
  Cookie-Session sees updated session → encrypts it → string
                          ↓
  Set-Cookie: ey6ak025k66  ← sent back in response headers
```

### Auth Service Architecture

**Option 1 (Bad):** Add `signup()` and `signin()` directly to `UsersService`
```
UsersService { create, findOne, find, update, remove, signup, signin, setPreferences, resetPassword... }
```
→ Becomes too large

**Option 2 (Good):** Create a separate `AuthService`
```
UsersModule
  ├── UsersController
  ├── UsersService  { create, findOne, find, update, remove }
  ├── AuthService   { signup, signin }
  └── UsersRepository
```

### Password Hashing

**Why hash?** Storing plain text passwords is dangerous.

**Hashing properties:**
- Very small changes to input result in a completely different hash
- Hashing **cannot be reversed** — you can't get the input from the output

```
Signup Flow:
  "mypassword"
    → Hashing Function
    → "ab2ca334..."
    → Stored in DB

Signin Flow:
  Provided password
    → Hash it
    → Compare with stored hash
```

### Rainbow Table Attack

A pre-computed table of `password → hash` mappings. If an attacker gets your DB, they can look up hashes to find passwords.

**Defense: Salting**

```
Signup with Salt:
  User's Password: "mypassword"
  Random Salt:     "a1d01"
  Combined:        "mypassworda1d01"
    → Hashing Function
    → "010066d.a1d01"  (stored as "hash.salt")

Signin with Salt:
  1. Find user by email → retrieve "salt.hash"
  2. Combine provided password + stored salt
  3. Hash the combination
  4. Compare with stored hash
```

---

## 16. Guards & Authorization

### Authentication vs Authorization

| | Who |
|---|---|
| **Authentication** | Figure out **who** is making a request |
| **Authorization** | Figure out if the person making the request is **allowed** to make it |

### AuthGuard

```typescript
class AuthGuard {
  canActivate(): boolean {
    // Return truthy if user can access this route
    // Return false if not
  }
}
```

### Admin Guard Example

```
PATCH /reports/:id
{ approved: true }
  → AdminGuard (Is request.currentUser an administrator?)
  → Route Handler
```

### Setting Admin via Signup (Development Only)

```
SignupHandler
  CreateUserDto { email, password, admin: true }
  → User Entity { email, password, admin: true }

Note: Not appropriate for production apps
```

### Request Lifecycle with Auth

```
Request
  → Middlewares          (e.g. cookie-session — decodes cookie)
  → Guards               (e.g. AdminGuard — checks permissions)
  → Interceptors         (e.g. CurrentUser — attaches user to request)
  → Request Handler
→ Response
```

### CurrentUser Decorator + Interceptor

**Problem:** Param decorators exist *outside* the DI system, so a custom decorator can't directly get an instance of `UsersService`.

**Solution:** Make a `CurrentUserInterceptor` that fetches the current user and stores it on the request object. Then the `@CurrentUser()` decorator reads from the request.

```
CurrentUserInterceptor (Global)
  ├── Reads session.userId
  ├── Calls UsersService.findOne(userId)
  └── Sets request.currentUser = user
→ @CurrentUser() decorator reads request.currentUser
```

---

## 17. Unit & E2E Testing

### Types of Tests

| Type | Description |
|---|---|
| **Unit Testing** | Make sure individual methods on a class work correctly |
| **Integration (E2E) Testing** | Test the full flow of a feature |

### Unit Testing with Fake Services

```
class AuthService
  signup()
  signin()
  ↳ needs UsersService { find(), create() }

For testing:
  class FakeUsersService { find(), create() }
  → Inject into AuthService instead of real UsersService
```

### DI Container When Testing

```
Real App DI Container:
  Users Service     → Users Repo
  Auth Service      → Users Service

Testing DI Container:
  Auth Service      → { find, create }  (fake/mock)
```

### Jest Mock Functions

```
Jest Mock Function
  - Created by Jest
  - Records how often it is called and the arguments it receives
  - Use when testing something that just calls another method
```

### E2E Testing Architecture

```
Test
  → Test Runner
  → Creates new copy of entire Nest app
  → Listens on a randomly assigned port
  → Receives requests from the test
  → SQLite DB (isolated per test)
```

### Database Isolation for E2E Tests

**Problem:** Tests share the same database, causing interference.

**Solution:** Each test creates a new app instance and wipes the DB.

```
Test #1: it('handles a request to signup')
  → App Instance #1 → SQLite DB (wiped before test)

Test #2: it('handles a request to signin')
  → App Instance #2 → SQLite DB (fresh, wiped before test)
```

### Middleware & Pipes in E2E Tests

**Problem:** `cookie-session` and `ValidationPipe` are set up in `main.ts`, not in the `AppModule`, so the E2E test doesn't automatically include them.

**Solution:** Move middleware/pipe setup into the `AppModule` itself (or apply them in the test setup).

```
App Module
  ├── Users Module
  ├── Reports Module
  └── [cookie-session, ValidationPipe applied here]

Our E2E Test uses AppModule directly → gets all middleware
```

### Development vs Testing DBs

```
Development Mode → db.sqlite       (persistent data)
Testing Mode     → test.sqlite     (wiped before each test run)
```

---

## 18. Configuration & Environment Variables

### The Challenge

```
AppModule TypeOrmModule config:
{
  type: 'sqlite',
  entities: [User, Report],
  database: 'db.sqlite',    ← want different values for dev/test/prod
  synchronize: true,
}
```

### Nest's Approach (ConfigService)

```
App Module DI Container
  ConfigService  ←────────────────  TypeOrmModule
                                     (depends on ConfigService)
```

> **Personal Opinion:** Nest's recommended way of handling env config is incredibly over-the-top complicated.

### dotenv Approach

```
.env file:        DB_NAME = 'db.sqlite'
.test.env file:   DB_NAME = 'test.sqlite'

dotenv reads the file → { DB_NAME: 'db.sqlite', DB_PASSWORD: 'asdf' }
→ process.env.DB_NAME available throughout the app
```

### Conflicting Advice

| Source | Says |
|---|---|
| Nest Docs | Multiple .env files (with different names) are OK |
| dotenv Docs | Never create more than one .env file |

> **Questions to consider:**
> - How does a `.env` file get created in a production environment?
> - How can we have different config in a local environment?

---

## 19. Modules & Cross-Module DI

### Why Use Modules?

- Forces you to think about how your app is structured → better code reuse
- Different modules can be given different configuration
- Avoids setting up all DI bindings in a single file

### Module Properties

```typescript
@Module({
  imports:     [],  // List of modules that are needed
  controllers: [],  // List of controllers defined in this module
  providers:   [],  // List of classes that can be used with the DI system
  exports:     [],  // List of classes to make available to other modules
})
```

### Computer Example Architecture

```
Computer Module
  ├── Computer Controller  → run()
  ├── CPU Module
  │     └── CPU Service    → compute()
  ├── Disk Module
  │     └── Disk Service   → getData()
  └── Power Module
        └── Power Service  → supplyPower()
```

### DI Inside a Module

```
Power Module
  ├── PowerService   → supplyPower()
  └── RegulatorService → regulatePower()
     ↳ needs PowerService

Steps:
  1. Add @Injectable() to PowerService
  2. Add PowerService to PowerModule's list of providers
  3. Define constructor on RegulatorService with PowerService parameter
```

### DI Between Modules (Sharing Services)

```
CpuService needs PowerService (from PowerModule)

Steps:
  1. Add PowerService to PowerModule's list of exports
  2. Import PowerModule into CpuModule
  3. Define constructor on CpuService with PowerService parameter
```

```
Power Module
  providers: [PowerService]
  exports:   [PowerService]   ← makes available to other modules

CPU Module
  imports: [PowerModule]      ← gains access to PowerService
  providers: [CpuService]
```

### Nest Official Note

> *"We want to emphasize that modules are **strongly** recommended as an effective way to organize your components."*
> — Nest Official Docs

### Module File Naming Convention

```
cpu.module.ts
cpu.service.ts
power.module.ts
power.service.ts
```

> **Note:** Modules might not be a good tool for code reuse **between projects**, but they're great for organizing code within a project.

---

## 20. Advanced DI (Optional)

> **Disclaimer:** These are optional videos. Goal is to help you better understand DI. Not necessarily recommended for your own projects.

### Goal #1 — Break File Imports Between Modules

```
cpu.module.ts     →  cpu.service.ts
power.module.ts   →  power.service.ts

Goal: cpu.service.ts should NOT import from power.service.ts directly
Solution: Use interfaces (.interface.ts files) to decouple
```

### DI Container Internals

```
Power Module
  providers: [PowerService]      ← registered in DI container
  exports:   [PowerService]      ← accessible by other containers

CPU Module
  imports: [PowerModule]
  providers: [CpuService, PowerService]
  DI Container: 
    CpuService  → PowerService
    PowerService (imported from PowerModule)
```

### Exports = Classes usable in other containers

```
Power Module DI Container
  List of classes → [PowerService]
  exports         → [PowerService]  ← "Classes that can be used in other containers"

CPU Module DI Container
  List of classes → [CpuService, PowerService]
  + Everything listed as an export from PowerModule
```

---

## 21. Migrations & Deployment

### Dev/Test vs Production

```
Dev/Test Environment:
  Our App → SQLite DB
  Config: Connect to SQLite, Cookie Key

Production Environment:
  Our App → Postgres DB
  Config: Connect to Postgres, Cookie Key
```

### `synchronize: true` — Good for Dev, Dangerous for Prod

```
During development:
  TypeORM reads User Entity class
  → Automatically updates DB schema to match
  → Very convenient!

Before first production deploy:
  → Set synchronize: false
  → NEVER use synchronize: true in production again
```

> **Warning:** `synchronize: true` can **drop data** if you remove a column from your entity.

### Migrations

```
Migration File
  up()   → Describe how to 'update' the structure of our DB
           e.g. Add table 'users', add columns 'email', 'password'
  down() → Describe how to undo the steps in 'up()'
           e.g. Delete the table called 'users'
```

### Multiple Migration Files

```
Migration File #1
  up()   → Add table 'users' with email + password columns
  down() → Delete table 'users'

Migration File #2
  up()   → Add table 'reports' with price, lat, lng, ... columns
  down() → Delete table 'reports'
```

### Running Migrations During Development

```
1. Stop the development server
2. Use the TypeORM CLI to generate an empty migration file
3. Add code to change the DB in the migration file
4. Use the TypeORM CLI to apply the migration to the DB
5. DB is updated! Restart the development server
```

> **Note:** TypeORM CLI executes *only* entity files + the migration file, then connects to the DB and makes changes. **Nothing related to Nest gets executed!**

### TypeORM CLI Configuration

```
typeorm.io/#/using-ormconfig
typeorm.io/#/using-cli
```

```
Our App During Dev:
  TypeORM  → ormconfig.js file → TypeORM CLI

Our App During Testing:
  TypeORM (separate config, no ormconfig)
```

### Deployment to Heroku

```
Your Computer
  Git Repo (Nest App)
    → push to →
  Heroku
    Nest App → Postgres DB
    Connection: process.env.DATABASE_URL
```

---

*End of Notes*
