# NestJS Learning Guide — Instagram Clone

> **Goal:** Learn every concept from `nestjs-course-notes.md` by reading and understanding the pre-built Instagram API code.
> Each step maps **course theory → real code in this project**.

---

## Progress Tracker

Mark each item with `[x]` when done. Each step has 3 checkboxes: **Read**, **Understood**, **Task done**.

| Step | Topic | Read | Understood | Task |
|------|-------|------|------------|------|
| 1 | NestJS Core Concepts & Project Structure | `[ ]` | `[ ]` | `[ ]` |
| 2 | Request Handling & HTTP Decorators | `[ ]` | `[ ]` | `[ ]` |
| 3 | Validation & DTOs | `[ ]` | `[ ]` | `[ ]` |
| 4 | Services, Repositories & TypeORM | `[ ]` | `[ ]` | `[ ]` |
| 5 | Dependency Injection & IoC | `[ ]` | `[ ]` | `[ ]` |
| 6 | Cross-Module DI & Module Exports | `[ ]` | `[ ]` | `[ ]` |
| 7 | JWT Authentication (Guards & Hashing) | `[ ]` | `[ ]` | `[ ]` |
| 8 | Custom Decorators & Interceptors | `[ ]` | `[ ]` | `[ ]` |
| 9 | TypeORM Relations (One-to-Many, Many-to-One) | `[ ]` | `[ ]` | `[ ]` |
| 10 | Composite Primary Keys (Many-to-Many) | `[ ]` | `[ ]` | `[ ]` |
| 11 | Self-Referential Relations & QueryBuilder | `[ ]` | `[ ]` | `[ ]` |
| 12 | Many-to-Many with JoinTable (Tags) | `[ ]` | `[ ]` | `[ ]` |
| 13 | Analytics: QueryBuilder Mastery | `[ ]` | `[ ]` | `[ ]` |
| 14 | Unit Testing & E2E Testing | `[ ]` | `[ ]` | `[ ]` |
| 15 | Configuration & Environment Variables | `[ ]` | `[ ]` | `[ ]` |
| 16 | Migrations & Production Deployment | `[ ]` | `[ ]` | `[ ]` |

**Progress:** 0 / 16 steps completed

---

## How to Use This Guide

1. Read the **Theory** section (from course notes)
2. Open the **Files to Read** in your editor
3. Answer the **Understanding Check** questions yourself
4. Try the **Hands-On Task** to reinforce the concept
5. Check off all 3 boxes in the tracker above, then move to the next step

---

## Step 1 — NestJS Core Concepts & Project Structure

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §1 (Introduction), §2 (Project Structure)

### Theory
NestJS apps are built from 5 core building blocks:

| Part | Role | File pattern |
|------|------|-------------|
| **Module** | Groups related code together | `*.module.ts` |
| **Controller** | Handles incoming HTTP requests | `*.controller.ts` |
| **Service** | Business logic & data access | `*.service.ts` |
| **Entity** | Describes a DB table | `*.entity.ts` |
| **DTO** | Describes the shape of request data | `*.dto.ts` |

The **request lifecycle** flows like this:
```
Request → Guard → Interceptor → Pipe (Validation) → Controller → Service → Repository → DB
```

### Files to Read
- `src/main.ts` — entry point, where the app starts
- `src/app.module.ts` — root module that ties everything together
- `src/users/users.module.ts` — a typical feature module

### Understanding Check
- Why does `main.ts` only call `NestFactory.create(AppModule)` and nothing else?
- What does `@Module({ imports, controllers, providers })` do for each property?
- Why is `AppModule` the only module imported into `NestFactory.create()`?

### Hands-On Task
Open `src/users/users.module.ts`. Trace the chain:
1. What does `TypeOrmModule.forFeature([User])` do?
2. Why is `UsersService` in `providers` AND `exports`?
3. Which other modules import `UsersModule`? (check `src/auth/auth.module.ts`)

---

## Step 2 — Request Handling & HTTP Decorators

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §3 (Request Handling & Decorators)

### Theory
Controllers use **decorators** to map HTTP methods and extract data from requests:

```typescript
@Controller('users')        // prefix for all routes in this class
export class UsersController {
  @Get()                    // GET /users
  @Get(':id')               // GET /users/5
  @Post()                   // POST /users
  @Patch(':id')             // PATCH /users/5
  @Delete(':id')            // DELETE /users/5
}
```

Parameter decorators extract data from the request:

| Decorator | Extracts |
|-----------|---------|
| `@Param('id')` | Route param → `/users/:id` |
| `@Body()` | Request body JSON |
| `@Query()` | Query string → `?search=foo` |
| `@Headers()` | HTTP headers |

### Files to Read
- `src/users/users.controller.ts` — full CRUD with all decorator types
- `src/auth/auth.controller.ts` — POST routes + custom `@CurrentUser()` decorator
- `src/comments/comments.controller.ts` — nested routes like `/photos/:photoId/comments`
- `src/likes/likes.controller.ts` — controller-level route prefix

### Understanding Check
- In `users.controller.ts`, what does `@Param('id', ParseIntPipe)` do that plain `@Param('id')` doesn't?
- In `comments.controller.ts`, why is `@Controller()` empty but the method decorators have full paths?
- In `likes.controller.ts`, the class has `@Controller('photos/:photoId/likes')` — how does this combine with `@Post()` on the method?

### Hands-On Task
Look at `src/follows/follows.controller.ts`. Map each method to its full HTTP route:
- `follow()` → ?
- `unfollow()` → ?
- `getFollowers()` → ?
- `getFeed()` → ?

---

## Step 3 — Validation & DTOs

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §4 (Validation & DTOs)

### Theory
**DTOs (Data Transfer Objects)** describe the expected shape of incoming data. Combined with `ValidationPipe`, they automatically reject bad requests.

```
POST /auth/signup { username: "ab", password: "123" }
  → ValidationPipe
  → SignUpDto (@MinLength(3) username, @MinLength(6) password)
  → 400 Bad Request ← automatically rejected!
```

The `ValidationPipe` is configured globally in `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // strip unknown properties
  forbidNonWhitelisted: true, // error if unknown properties sent
  transform: true,           // auto-convert types (string "5" → number 5)
}))
```

### Files to Read
- `src/main.ts` — global `ValidationPipe` setup
- `src/auth/dtos/auth.dto.ts` — `SignUpDto` and `SignInDto`
- `src/users/dtos/create-user.dto.ts` — `@IsString`, `@MinLength`
- `src/users/dtos/update-user.dto.ts` — `@IsOptional` for partial updates
- `src/photos/dtos/create-photo.dto.ts` — simple DTO

### Understanding Check
- What is `whitelist: true` protecting against? Give a concrete example.
- Why does `UpdateUserDto` use `@IsOptional()` on every field?
- What happens if you send `{ username: "alice", password: "secret", isAdmin: true }` to `POST /auth/signup`?

### Hands-On Task
Open `src/auth/dtos/auth.dto.ts`. Try to think about what would happen with these requests:
1. `POST /auth/signup { username: "ab", password: "password123" }` — what error?
2. `POST /auth/signup { username: "alice" }` — what error?
3. `POST /auth/signup { username: "alice", password: "secret123", extra: "field" }` — what happens?

---

## Step 4 — Services, Repositories & TypeORM

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §5 (Services & Repositories), §11 (TypeORM Entities), §12 (Repository API)

### Theory
**Entities** describe your database tables using decorators:

```typescript
@Entity('users')         // maps to 'users' table in DB
export class User {
  @PrimaryGeneratedColumn()   // auto-increment id
  id: number;

  @Column({ unique: true })   // NOT NULL UNIQUE column
  username: string;

  @CreateDateColumn()         // auto-set on INSERT
  created_at: Date;
}
```

**Services** use TypeORM's `Repository<T>` to interact with the DB:

| Repository Method | What it does |
|------------------|-------------|
| `repo.create({})` | Creates entity instance (NOT saved yet) |
| `repo.save(entity)` | INSERT or UPDATE (triggers hooks) |
| `repo.findOne({ where: {} })` | SELECT with filter |
| `repo.find({ where: {} })` | SELECT multiple |
| `repo.remove(entity)` | DELETE (triggers hooks) |

> **Key rule:** Always use `save()` and `remove()` (not `insert()`/`update()`/`delete()`) so TypeORM lifecycle hooks fire.

### Files to Read
- `src/users/user.entity.ts` — User entity with all relation decorators
- `src/users/users.service.ts` — full CRUD using Repository API
- `src/photos/photo.entity.ts` — entity with `@Column()`, `@ManyToOne`, `@JoinColumn`
- `src/likes/like.entity.ts` — entity with composite primary key

### Understanding Check
- In `users.service.ts`, why does `create()` call `repo.create()` then `repo.save()` instead of just `repo.save()`?
- In `like.entity.ts`, there is no `@PrimaryGeneratedColumn()`. What prevents duplicate likes?
- In `users.service.ts`, the `update()` method uses `Object.assign(user, attrs)` then `repo.save(user)`. Why not just `repo.update(id, attrs)`?

### Hands-On Task
Open `src/photos/photos.service.ts`. For each method, identify:
1. Which Repository method it calls
2. What it returns
3. What error it throws if the record isn't found

---

## Step 5 — Dependency Injection & IoC

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §6 (DI), §7 (IoC), §9 (DI Container Deep Dive)

### Theory
**Inversion of Control:** classes should NOT create their own dependencies.

```typescript
// BAD — tight coupling
class AuthService {
  private usersService = new UsersService(); // creates its own dependency
}

// GOOD — dependency injected by NestJS
@Injectable()
class AuthService {
  constructor(private readonly usersService: UsersService) {}
  // NestJS creates and injects UsersService automatically
}
```

**How the DI Container works:**
1. At startup, Nest reads all `providers: []` arrays in modules
2. It builds a dependency graph
3. When a class is needed, Nest creates it and injects all its dependencies
4. Instances are **reused** (singleton by default)

**Why this matters for testing:** You can swap `UsersService` for a `FakeUsersService` without changing `AuthService` at all.

### Files to Read
- `src/auth/auth.service.ts` — depends on `UsersService` + `JwtService`
- `src/auth/auth.module.ts` — wires up the DI container for the auth feature
- `src/users/users.module.ts` — `exports: [UsersService]` makes it available to other modules
- `src/auth/auth.service.spec.ts` — **unit test using a fake UsersService**

### Understanding Check
- In `auth.module.ts`, why is `UsersModule` in `imports` rather than `UsersService` in `providers`?
- In `auth.service.spec.ts`, what is `fakeUsersService`? Why is it used instead of the real one?
- If you removed `exports: [UsersService]` from `users.module.ts`, what would break and why?

### Hands-On Task
Read `src/auth/auth.service.spec.ts` carefully. Answer:
1. How does the test create an `AuthService` without a real database?
2. What does `jest.fn()` do? Why is it used on `findByUsername` and `create`?
3. The test `'hashes the password before saving'` uses `mockImplementation`. What is it checking?

---

## Step 6 — Cross-Module DI & Module Exports

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §19 (Modules & Cross-Module DI), §20 (Advanced DI)

### Theory
Each module has its own **DI container**. To share a service between modules:

```
UsersModule
  providers: [UsersService]
  exports:   [UsersService]   ← "I'm sharing this"
                ↓
AuthModule
  imports: [UsersModule]      ← "I want what UsersModule shares"
  providers: [AuthService]    ← AuthService can now inject UsersService
```

This project has a clear dependency graph:
```
AppModule
  ├── UsersModule (exports UsersService)
  │     └── AuthModule (imports UsersModule → uses UsersService)
  ├── PhotosModule
  ├── CommentsModule
  ├── LikesModule
  ├── FollowsModule
  ├── TagsModule
  └── AnalyticsModule
```

### Files to Read
- `src/users/users.module.ts` — `exports: [UsersService]`
- `src/auth/auth.module.ts` — `imports: [UsersModule]`
- `src/follows/follows.module.ts` — imports TWO entities (`Follow` + `Photo`)
- `src/tags/tags.module.ts` — imports `Tag` + `Photo` for cross-entity queries
- `src/app.module.ts` — the root module that imports everything

### Understanding Check
- Why does `FollowsModule` need to import `Photo` entity even though follows don't contain photos?
- `AnalyticsModule` doesn't import any entity via `TypeOrmModule.forFeature()`. How does `AnalyticsService` still access the database?
- What would happen if `UsersModule` didn't export `UsersService` but `AuthModule` still tried to inject it?

### Hands-On Task
Trace the dependency chain for `GET /auth/me`:
1. `AuthController` → needs `AuthService` → provided by `AuthModule`
2. `AuthService` → needs `UsersService` → provided by... where?
3. `JwtStrategy` → needs `UsersService` AND `ConfigService` → where do these come from?

---

## Step 7 — JWT Authentication (Guards & Hashing)

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §15 (Authentication & Hashing), §16 (Guards & Authorization)

### Theory
This project uses **JWT Bearer tokens** instead of cookies (the course uses cookies, but JWT is more modern for APIs).

**Signup flow:**
```
POST /auth/signup { username, password }
  1. Check if username exists → 400 if yes
  2. bcrypt.genSalt(10) → random salt
  3. bcrypt.hash(password, salt) → hashed password
  4. Save user to DB with hashed password
  5. jwtService.sign({ sub: userId, username }) → JWT token
  6. Return { access_token: "eyJ..." }
```

**Protected route flow:**
```
GET /auth/me
Authorization: Bearer eyJ...
  → JwtAuthGuard → JwtStrategy.validate()
  → Decodes token → gets { sub: userId }
  → Calls UsersService.findOne(userId)
  → Sets request.user = User entity
  → Controller receives @CurrentUser() user
```

**Guards** return `true` (allow) or `false`/throw (deny):
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
// AuthGuard('jwt') calls JwtStrategy.validate() automatically
```

### Files to Read
- `src/auth/auth.service.ts` — `signup()` and `signin()` with bcrypt
- `src/auth/jwt.strategy.ts` — validates JWT, returns user from DB
- `src/auth/jwt-auth.guard.ts` — the guard that protects routes
- `src/auth/auth.controller.ts` — `@UseGuards(JwtAuthGuard)` on `GET /auth/me`
- `src/photos/photos.controller.ts` — `@UseGuards(JwtAuthGuard)` on POST/DELETE

### Understanding Check
- In `auth.service.ts`, why is `bcrypt.genSalt(10)` called separately instead of just `bcrypt.hash(password, 10)`?
- In `jwt.strategy.ts`, the `validate()` method receives `{ sub, username }`. Where does this payload come from originally?
- In `photos.controller.ts`, `GET /photos` has no guard but `POST /photos` does. What does this mean for unauthenticated users?

### Hands-On Task
Trace what happens when an expired JWT is sent to `GET /auth/me`:
1. Where is `ignoreExpiration: false` set?
2. What does Passport do when the token is expired?
3. What HTTP status code does the client receive?

---

## Step 8 — Custom Decorators & Interceptors (Serialization)

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §14 (Interceptors & Serialization)

### Theory
**The problem:** When you return a `User` entity from a controller, it includes the `password` field. That's a security leak.

**The solution:** A custom `@Serialize(Dto)` decorator + interceptor that transforms the response:

```
Controller returns User entity { id, username, password, created_at }
  → SerializeInterceptor
  → plainToInstance(UserDto, user, { excludeExtraneousValues: true })
  → Only @Expose() fields are included
  → Response: { id, username, created_at }  ← password gone!
```

**`@CurrentUser()` param decorator** reads `request.user` (set by JwtStrategy):
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
me(@CurrentUser() user: User) {  // ← reads request.user
  return user;
}
```

### Files to Read
- `src/interceptors/serialize.interceptor.ts` — the `@Serialize()` decorator + `SerializeInterceptor`
- `src/users/dtos/user.dto.ts` — `@Expose()` fields, `@Exclude()` is implicit
- `src/photos/dtos/photo.dto.ts` — nested DTO with `@Type()`
- `src/auth/decorators/current-user.decorator.ts` — `createParamDecorator`
- `src/users/users.controller.ts` — `@Serialize(UserDto)` on class level

### Understanding Check
- In `serialize.interceptor.ts`, what does `excludeExtraneousValues: true` do? What happens without it?
- In `user.dto.ts`, the `password` field is not listed at all. Why does it get excluded from the response?
- In `users.controller.ts`, `@Serialize(UserDto)` is on the class but `findOne()` has `@Serialize(UserProfileDto)`. Which one wins for `GET /users/:id`?

### Hands-On Task
Open `src/photos/dtos/photo.dto.ts`. The `user` field uses `@Type(() => PhotoUserDto)`.
1. What does `@Type()` do here?
2. If you removed `@Type(() => PhotoUserDto)`, would the nested user object still be serialized correctly?
3. What fields would be in the response for `GET /photos/:id`?

---

## Step 9 — TypeORM Relations (One-to-Many, Many-to-One)

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §13 (Associations / Relations) — Part 1

### Theory
**One-to-Many / Many-to-One** is the most common relation. A User has many Photos; a Photo belongs to one User.

```typescript
// User entity — the "one" side
@OneToMany(() => Photo, (photo) => photo.user)
photos: Photo[];
// Does NOT add a column to users table

// Photo entity — the "many" side
@ManyToOne(() => User, (user) => user.photos, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'user_id' })
user: User;
// ADDS user_id column to photos table
```

> **Critical:** Relations are NOT auto-fetched. You must explicitly request them:
> ```typescript
> repo.findOne({ where: { id }, relations: ['user'] })  // explicit
> ```

### Files to Read
- `src/users/user.entity.ts` — all `@OneToMany` relations
- `src/photos/photo.entity.ts` — `@ManyToOne` to User, `@OneToMany` to Comments/Likes
- `src/comments/comment.entity.ts` — two `@ManyToOne` (User + Photo) = triangle relation
- `src/photos/photos.service.ts` — `relations: ['user']` in findOne/findAll
- `src/comments/comments.service.ts` — `relations: ['user']` when fetching comments

### Understanding Check
- In `photo.entity.ts`, there is both a `user: User` relation AND a `user_id: number` column. Why have both? When would you use `user_id` directly instead of `user`?
- The `@JoinColumn({ name: 'user_id' })` on `Photo` — what does this do to the database?
- In `comments.service.ts`, `findByPhoto()` fetches with `relations: ['user']` but not `relations: ['photo']`. Why is `photo` not needed here?

### Hands-On Task
Look at `src/comments/comment.entity.ts`. This is the "triangle" relation:
```
User ──── Comment ──── Photo
```
1. Draw the database schema: which table has which foreign keys?
2. In `comments.service.ts`, when creating a comment, you pass `user_id` and `photo_id` directly. Why not pass the full `user` and `photo` objects?
3. What does `onDelete: 'CASCADE'` mean? What happens to comments when a photo is deleted?

---

## Step 10 — Composite Primary Keys (Many-to-Many via Junction Table)

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §13 (Associations / Relations) — Part 2

### Theory
For **Many-to-Many** relationships where the junction table has no extra attributes, use a **composite primary key** instead of an auto-increment ID.

```typescript
@Entity('likes')
export class Like {
  @PrimaryColumn()   // part 1 of composite PK
  user_id: number;

  @PrimaryColumn()   // part 2 of composite PK
  photo_id: number;
}
// The DB enforces: (user_id=1, photo_id=5) can only exist ONCE
// This prevents duplicate likes at the database level
```

### Files to Read
- `src/likes/like.entity.ts` — composite PK with `@PrimaryColumn()`
- `src/likes/likes.service.ts` — `ConflictException` for duplicate likes
- `src/follows/follow.entity.ts` — same pattern for follows
- `src/follows/follows.service.ts` — self-follow prevention + `ConflictException`

### Understanding Check
- In `likes.service.ts`, the `like()` method first checks if a like exists, then throws `ConflictException`. But the composite PK would also prevent duplicates at the DB level. Why check in the service too?
- In `follows.service.ts`, there's a check `if (followerId === followeeId)`. What would happen at the DB level without this check?
- What is the difference between `@PrimaryColumn()` and `@PrimaryGeneratedColumn()`?

### Hands-On Task
Compare `like.entity.ts` and `follow.entity.ts`:
1. Both use composite PKs — what are the two columns in each?
2. Both have `@ManyToOne` relations — what entities do they point to?
3. `follow.entity.ts` has TWO `@ManyToOne` relations pointing to the SAME `User` entity. How does TypeORM know which is which?

---

## Step 11 — Self-Referential Relations & Complex QueryBuilder

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §13 (Associations / Relations) — Part 3

### Theory
The **Follows** system is a **self-referential Many-to-Many** — the `users` table references itself:

```
users table
  id=1 (Alice)
  id=2 (Bob)
  id=3 (Charlie)

follows table
  follower_id=1, followee_id=2  → Alice follows Bob
  follower_id=3, followee_id=1  → Charlie follows Alice
```

The `User` entity has TWO `@OneToMany` relations to `Follow`:
```typescript
@OneToMany(() => Follow, (follow) => follow.follower)
following: Follow[];  // follows where I am the follower

@OneToMany(() => Follow, (follow) => follow.followee)
followers: Follow[];  // follows where I am the followee
```

**QueryBuilder** is used for complex queries that can't be expressed with simple `find()`:
```typescript
// Feed: get photos from users I follow
photosRepository
  .createQueryBuilder('photo')
  .innerJoin('follows', 'f', 'f.followee_id = photo.user_id')
  .where('f.follower_id = :userId', { userId })
  .orderBy('photo.created_at', 'DESC')
  .getMany()
```

### Files to Read
- `src/follows/follow.entity.ts` — self-referential with named relations
- `src/users/user.entity.ts` — `following` and `followers` `@OneToMany`
- `src/follows/follows.service.ts` — `getFeed()` using QueryBuilder with JOIN

### Understanding Check
- In `user.entity.ts`, `following` and `followers` both point to `Follow`. How does TypeORM distinguish them?
- In `follows.service.ts` `getFeed()`, the join is `'f.followee_id = photo.user_id'`. Explain this in plain English: "Get photos where..."
- Why does `getFeed()` use `innerJoin` (not `leftJoin`)? What would change if you used `leftJoin`?

### Hands-On Task
Read `src/follows/follows.service.ts` `getFeed()` carefully:
```typescript
.innerJoin('follows', 'f', 'f.followee_id = photo.user_id')
.where('f.follower_id = :userId', { userId })
```
Translate this to SQL mentally:
```sql
SELECT photo.*
FROM photos photo
INNER JOIN follows f ON f.followee_id = photo.user_id
WHERE f.follower_id = ?
```
1. If I (userId=1) follow Alice (id=2) and Bob (id=3), what photos appear in my feed?
2. What does `.limit(50)` do? Why is this important for a feed?

---

## Step 12 — Many-to-Many with JoinTable (Tags)

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §13 (Associations / Relations) — Part 4

### Theory
TypeORM's `@ManyToMany` + `@JoinTable` automatically manages a junction table:

```typescript
// Photo entity — owns the junction table
@ManyToMany(() => Tag, (tag) => tag.photos)
@JoinTable({
  name: 'photo_tags',
  joinColumn: { name: 'photo_id' },
  inverseJoinColumn: { name: 'tag_id' },
})
tags: Tag[];

// Tag entity — the inverse side
@ManyToMany(() => Photo, (photo) => photo.tags)
photos: Photo[];
```

The `@JoinTable()` decorator goes on ONE side only (the "owner"). TypeORM creates the `photo_tags` junction table automatically.

**Find-or-create pattern** avoids duplicate tags:
```typescript
let tag = await tagsRepo.findOne({ where: { tag_name } });
if (!tag) {
  tag = await tagsRepo.save(tagsRepo.create({ tag_name }));
}
```

### Files to Read
- `src/photos/photo.entity.ts` — `@ManyToMany` + `@JoinTable` (owner side)
- `src/tags/tag.entity.ts` — `@ManyToMany` (inverse side, no `@JoinTable`)
- `src/tags/tags.service.ts` — `findOrCreate()`, `addTagToPhoto()`, `getTrending()`

### Understanding Check
- Why does `@JoinTable()` only appear in `photo.entity.ts` and not in `tag.entity.ts`?
- In `tags.service.ts` `addTagToPhoto()`, why do we fetch the photo with `relations: ['tags']` before adding a new tag?
- In `getTrending()`, the query uses `innerJoin('photo_tags', 'pt', ...)` — but `photo_tags` is not an entity class. How does TypeORM know what table to join?

### Hands-On Task
Read `src/tags/tags.service.ts` `getTrending()`:
```typescript
tagsRepository.createQueryBuilder('tag')
  .innerJoin('photo_tags', 'pt', 'pt.tag_id = tag.id')
  .select('tag.tag_name', 'tag_name')
  .addSelect('COUNT(pt.photo_id)', 'count')
  .groupBy('tag.id')
  .orderBy('count', 'DESC')
  .limit(5)
  .getRawMany()
```
Translate to SQL:
```sql
SELECT tag.tag_name, COUNT(pt.photo_id) AS count
FROM tags tag
INNER JOIN photo_tags pt ON pt.tag_id = tag.id
GROUP BY tag.id
ORDER BY count DESC
LIMIT 5;
```
Compare this to Challenge 6 in `docs/instagram-database-clone.md`. They're the same query!

---

## Step 13 — Analytics: QueryBuilder Mastery

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §13 (QueryBuilder: `.where`, `.having`, `.groupBy`, `.orderBy`, `.getRawMany`)

### Theory
The **Analytics module** translates the 7 SQL challenges from `docs/instagram-database-clone.md` into TypeORM QueryBuilder calls.

Key QueryBuilder methods:

| Method | SQL equivalent |
|--------|---------------|
| `.select('col', 'alias')` | `SELECT col AS alias` |
| `.addSelect('COUNT(*)', 'n')` | `, COUNT(*) AS n` |
| `.from('table', 'alias')` | `FROM table alias` |
| `.innerJoin(...)` | `INNER JOIN ...` |
| `.leftJoin(...)` | `LEFT JOIN ...` |
| `.where('col = :val', { val })` | `WHERE col = ?` |
| `.groupBy('col')` | `GROUP BY col` |
| `.having('COUNT(*) = :n', { n })` | `HAVING COUNT(*) = ?` |
| `.orderBy('col', 'DESC')` | `ORDER BY col DESC` |
| `.limit(5)` | `LIMIT 5` |
| `.getRawMany()` | Execute → return raw rows |

### Files to Read
- `src/analytics/analytics.service.ts` — all 7 challenge queries
- `docs/instagram-database-clone.md` — the original SQL challenges (Part: SQL Challenge Questions)

### Understanding Check — Match Each Method to Its SQL Challenge

| Analytics endpoint | SQL Challenge # |
|-------------------|----------------|
| `getOldestUsers()` | Challenge ? |
| `getPopularSignupDay()` | Challenge ? |
| `getInactiveUsers()` | Challenge ? |
| `getMostLikedPhoto()` | Challenge ? |
| `getAvgPostsPerUser()` | Challenge ? |
| `getTopHashtags()` | Challenge ? |
| `getBotAccounts()` | Challenge ? |

### Hands-On Task
Open `src/analytics/analytics.service.ts` and `docs/instagram-database-clone.md` side by side.

For `getBotAccounts()`:
```typescript
dataSource.query(`
  SELECT u.id, u.username, COUNT(l.photo_id) AS like_count
  FROM users u
  INNER JOIN likes l ON l.user_id = u.id
  GROUP BY u.id
  HAVING like_count = (SELECT COUNT(*) FROM photos)
`)
```
Compare to Challenge 7 in the docs. They're identical SQL!

Now try to rewrite `getInactiveUsers()` using raw SQL instead of QueryBuilder. Then compare.

---

## Step 14 — Unit Testing & E2E Testing

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §17 (Unit & E2E Testing)

### Theory
**Unit tests** test a single class in isolation. Dependencies are replaced with fakes:

```typescript
// Real app:
AuthService ← UsersService (hits the DB)

// Unit test:
AuthService ← FakeUsersService (returns hardcoded data, no DB)
```

**E2E tests** test the full HTTP flow:
```
Test → HTTP request → NestJS app → DB → HTTP response → Assert
```

**Jest mock functions** (`jest.fn()`) record calls and can return custom values:
```typescript
const findByUsername = jest.fn().mockResolvedValue(null); // returns null
const create = jest.fn().mockResolvedValue({ id: 1, username: 'alice' });
```

### Files to Read
- `src/auth/auth.service.spec.ts` — unit tests with fake UsersService
- `test/auth.e2e-spec.ts` — E2E tests for the full auth flow

### Understanding Check
- In `auth.service.spec.ts`, `fakeUsersService` is typed as `Partial<UsersService>`. Why `Partial`?
- The test `'throws if username is already taken'` sets `findByUsername` to return a user. What is it simulating?
- In `test/auth.e2e-spec.ts`, why is `beforeAll` used instead of `beforeEach`? What would happen if each test created a new app?

### Hands-On Task
Read the unit test for `'hashes the password before saving'`:
```typescript
(fakeUsersService.create as jest.Mock).mockImplementation(
  (username: string, password: string) => {
    expect(password).not.toBe('password123');
    expect(password.length).toBeGreaterThan(20);
    return Promise.resolve({ ...mockUser, username, password });
  },
);
```
1. What is this test verifying?
2. Why does it check `password.length > 20` instead of checking the exact hash?
3. Can you write a new unit test for `signin()` that verifies it returns an `access_token`?

---

## Step 15 — Configuration & Environment Variables

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §18 (Configuration & Environment Variables)

### Theory
`ConfigModule` + `ConfigService` lets you read environment variables safely:

```typescript
// app.module.ts
ConfigModule.forRoot({ isGlobal: true })  // reads .env file

// Any service/module
constructor(private configService: ConfigService) {}
const secret = configService.get<string>('JWT_SECRET', 'fallback');
```

**Environment-based behavior:**
```
NODE_ENV=development → synchronize: true  (auto-create tables)
NODE_ENV=production  → synchronize: false (use migrations)
```

### Files to Read
- `.env` — development environment variables
- `.env.test` — test environment variables
- `src/app.module.ts` — `TypeOrmModule.forRootAsync()` using `ConfigService`
- `src/auth/auth.module.ts` — `JwtModule.registerAsync()` using `ConfigService`
- `src/auth/jwt.strategy.ts` — `configService.get('JWT_SECRET')`

### Understanding Check
- In `app.module.ts`, why is `TypeOrmModule.forRootAsync()` used instead of `TypeOrmModule.forRoot()`?
- What does `isGlobal: true` in `ConfigModule.forRoot()` do? What would you need to do without it?
- The `synchronize` flag is `configService.get('NODE_ENV') !== 'production'`. What are the three possible states (dev/test/prod) and what does `synchronize` equal in each?

### Hands-On Task
Open `.env` and `.env.test`. Compare the two files:
1. What is different between them?
2. What would happen if you ran E2E tests against the development database?
3. How would you add a new environment variable `MAX_PHOTO_SIZE=10mb`? Where would you add it and how would you read it in a service?

---

## Step 16 — Migrations & Production Deployment

- [ ] Read theory
- [ ] Open and read the files
- [ ] Answer Understanding Check questions
- [ ] Complete Hands-On Task

**Course Notes:** §21 (Migrations & Deployment)

### Theory
`synchronize: true` is **dangerous in production** — it can drop columns and lose data.

**Migrations** are the safe alternative:
```
Migration File
  up()   → ALTER TABLE users ADD COLUMN bio VARCHAR(255)
  down() → ALTER TABLE users DROP COLUMN bio
```

Each migration is a versioned file. TypeORM runs them in order and tracks which have run.

```
Development flow:
  1. Change entity (add @Column() bio)
  2. typeorm migration:generate → creates migration file
  3. typeorm migration:run → applies to DB
  4. Commit migration file to git

Production deploy:
  1. Push code
  2. Run: typeorm migration:run
  3. Start app (synchronize: false)
```

### What to Do
This project currently uses `synchronize: true` for development (appropriate for learning). To prepare for production:

1. Set `synchronize: false` in `app.module.ts`
2. Create a `data-source.ts` file for TypeORM CLI
3. Generate migrations: `npx typeorm migration:generate src/migrations/InitialSchema -d data-source.ts`
4. Run migrations: `npx typeorm migration:run -d data-source.ts`

### Files to Read
- `src/app.module.ts` — the `synchronize` flag
- `docs/nestjs-course-notes.md` §21 — migration concepts

### Understanding Check
- Why is `synchronize: true` dangerous in production but fine in development?
- What is the difference between `migration:generate` and `migration:create`?
- If you add a new `@Column() bio: string` to the User entity with `synchronize: false`, what happens when you start the app?

---

## Summary: Course Concepts → Project Files

| Course Section | Key Concept | Where in Project |
|---------------|-------------|-----------------|
| §1 Intro | Core parts of Nest | `src/app.module.ts`, `src/main.ts` |
| §2 Structure | File naming conventions | All `*.module.ts`, `*.service.ts`, `*.controller.ts` |
| §3 Request Handling | HTTP decorators | `src/users/users.controller.ts` |
| §4 Validation | DTOs + ValidationPipe | `src/users/dtos/`, `src/auth/dtos/`, `src/main.ts` |
| §5 Services | Repository pattern | `src/users/users.service.ts` |
| §6 DI | `@Injectable()` + providers | `src/auth/auth.module.ts` |
| §7 IoC | Constructor injection | `src/auth/auth.service.ts` |
| §9 DI Container | Module providers/exports | `src/users/users.module.ts` |
| §11 TypeORM Entities | `@Entity`, `@Column` | `src/users/user.entity.ts` |
| §12 Repository API | `find`, `save`, `remove` | `src/users/users.service.ts` |
| §13 Relations | One-to-Many, Many-to-Many | `src/photos/photo.entity.ts`, `src/tags/tag.entity.ts` |
| §13 QueryBuilder | Complex queries | `src/analytics/analytics.service.ts`, `src/follows/follows.service.ts` |
| §14 Interceptors | `@Serialize()`, `@CurrentUser()` | `src/interceptors/serialize.interceptor.ts`, `src/auth/decorators/` |
| §15 Auth/Hashing | bcrypt + JWT | `src/auth/auth.service.ts` |
| §16 Guards | `JwtAuthGuard` | `src/auth/jwt-auth.guard.ts`, `src/auth/jwt.strategy.ts` |
| §17 Testing | Unit + E2E | `src/auth/auth.service.spec.ts`, `test/auth.e2e-spec.ts` |
| §18 Config | `ConfigModule` + `.env` | `src/app.module.ts`, `.env` |
| §19 Modules | Cross-module DI | `src/auth/auth.module.ts` imports `UsersModule` |
| §20 Advanced DI | DI container internals | `src/follows/follows.module.ts` (multi-entity) |
| §21 Migrations | `synchronize` flag | `src/app.module.ts` |

---

## Recommended Learning Order

```
Day 1:  Steps 1–3   (Structure, Controllers, Validation)
Day 2:  Steps 4–5   (TypeORM, DI)
Day 3:  Steps 6–7   (Modules, JWT Auth)
Day 4:  Steps 8–9   (Interceptors, Relations)
Day 5:  Steps 10–12 (Composite PKs, Self-referential, ManyToMany)
Day 6:  Steps 13–14 (Analytics QueryBuilder, Testing)
Day 7:  Steps 15–16 (Config, Migrations)
```

Each day: read the theory, open the files, answer the questions, do the hands-on task. The code is already written — your job is to **understand why** every line is there.
