# TypeScript Decorators > A Complete Visual Guide

> **Prerequisites:** Enable decorators in your `tsconfig.json`:
>
> ```json
> { "experimentalDecorators": true }
> ```

Decorators are one of TypeScript's most powerful features — they let you attach behavior and metadata to classes, methods, properties, and parameters **without touching their implementation**. This guide walks through all four types with clear examples and full execution timelines.

---

## The Big Picture

Every decorator runs **at class definition time**, not at runtime. Think of them as labels you stick on code that other systems read later.

| Decorator Type | Placed On                   | Receives                                |
| -------------- | --------------------------- | --------------------------------------- |
| Class          | `@ClassLogger class Foo {}` | `constructor`                           |
| Property       | `@Log name: string`         | `prototype` + property name             |
| Method         | `@Log getUser() {}`         | `prototype` + method name + descriptor  |
| Parameter      | `getUser(@Log id: number)`  | `prototype` + method name + param index |

---

## 1. Class Decorator

A class decorator runs the moment the **class is defined**.

```ts
function ClassLogger(constructor: Function) {
  console.log('Class name:', constructor.name);
}

@ClassLogger
class UserService {}
```

**Output:**

```
Class name: UserService
```

**What TypeScript does internally:**

```ts
ClassLogger(UserService);
```

The decorator receives the **class constructor itself** — you can use this to modify the class, add static methods, or store metadata.

**Real-world use:** `@Injectable()`, `@Controller()`, `@Module()` in NestJS all work this way.

---

## 2. Property Decorator

A property decorator runs when a **property is declared** inside a class.

```ts
function LogProperty(target: any, propertyName: string) {
  console.log('Property:', propertyName);
}

class User {
  @LogProperty
  name: string;

  @LogProperty
  age: number;
}
```

**Output:**

```
Property: name
Property: age
```

**What TypeScript does internally:**

```ts
LogProperty(User.prototype, 'name');
LogProperty(User.prototype, 'age');
```

> Notice: this runs even if you never call `new User()`.

### Practical Example — `@IsRequired` Validator

Property decorators shine when used to **build a blueprint** that another function reads later.

```ts
import 'reflect-metadata';

// Step 1: Decorator stores metadata
function IsRequired(target: any, propertyName: string) {
  const existing = Reflect.getMetadata('required_fields', target) || [];
  Reflect.defineMetadata(
    'required_fields',
    [...existing, propertyName],
    target,
  );
}

// Step 2: Class uses the decorator
class CreateUserDto {
  @IsRequired
  name: string;

  @IsRequired
  email: string;

  age: number; // not required
}

// Step 3: Validator reads the metadata at runtime
function validate(obj: object): string[] {
  const errors: string[] = [];
  const required =
    Reflect.getMetadata('required_fields', Object.getPrototypeOf(obj)) || [];

  for (const field of required) {
    if (!obj[field]) errors.push(`${field} is required`);
  }

  return errors;
}

// Step 4: Runtime usage
const dto = new CreateUserDto();
dto.name = 'James';
// dto.email is missing

console.log(validate(dto)); // ['email is required']
```

**Full flow:**

```
── App loads ──────────────────────────────────────────

  @IsRequired on 'name'  → metadata: ['name']
  @IsRequired on 'email' → metadata: ['name', 'email']
  (no instance created yet)

── Request arrives ────────────────────────────────────

  new CreateUserDto() → { name: 'James', age: 25 }

── validate(dto) ──────────────────────────────────────

  read metadata → ['name', 'email']
  check 'name'  = 'James'     ✓
  check 'email' = undefined   ✗ → error

  returns: ['email is required']
```

**Key insight:** The decorator never touches values. It only writes a blueprint. The validator reads that blueprint later.

---

## 3. Method Decorator

A method decorator runs when a **method is defined**. Unlike property decorators, it receives a `PropertyDescriptor` — which means you can **replace the method itself**.

```ts
function LogMethod(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor,
) {
  console.log('Method:', methodName);
}

class UserService {
  @LogMethod
  getUser() {
    return 'user';
  }
}
```

**Output:**

```
Method: getUser
```

### Wrapping a Method

The real power comes from wrapping the original method:

```ts
function LogExecution(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`[LOG] Calling ${methodName} with`, args);
    const start = Date.now();
    const result = originalMethod.apply(this, args);
    console.log(`[LOG] ${methodName} finished in ${Date.now() - start}ms`);
    return result;
  };
}

class PaymentService {
  @LogExecution
  processPayment(amount: number) {
    console.log('Processing payment...');
    return amount * 0.9;
  }
}

const service = new PaymentService();
service.processPayment(100);
```

**Output:**

```
[LOG] Calling processPayment with [100]
Processing payment...
[LOG] processPayment finished in 1ms
```

---

## 4. Parameter Decorator

A parameter decorator runs when a **parameter inside a method is defined**.

```ts
function LogParameter(target: any, methodName: string, index: number) {
  console.log(`Parameter index ${index} in method ${methodName}`);
}

class UserService {
  getUser(@LogParameter id: number) {
    return id;
  }
}
```

**Output:**

```
Parameter index 0 in method getUser
```

**What TypeScript does internally:**

```ts
LogParameter(UserService.prototype, 'getUser', 0);
```

### Practical Example — `@Positive` Validator

Parameter decorators work best when **paired with a method decorator**. The parameter decorator stores metadata, the method decorator enforces it.

```ts
const positiveParams = new Map<string, number[]>();

// Parameter decorator — stores which parameter indexes must be positive
function Positive(target: any, methodName: string, index: number) {
  const key = `${target.constructor.name}_${methodName}`;
  if (!positiveParams.has(key)) positiveParams.set(key, []);
  positiveParams.get(key)!.push(index);
}

// Method decorator — wraps the method to enforce the rule
function ValidateParams(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const key = `${target.constructor.name}_${methodName}`;
    const indexes = positiveParams.get(key) || [];

    for (const i of indexes) {
      if (args[i] <= 0)
        throw new Error(`Argument at index ${i} must be positive`);
    }

    return original.apply(this, args);
  };
}

class PaymentService {
  @ValidateParams
  processPayment(
    userId: string,
    @Positive amount: number,
    @Positive tax: number,
  ) {
    console.log('Payment processed:', userId, amount, tax);
  }
}

const service = new PaymentService();
service.processPayment('user1', 100, 20); // ✓
service.processPayment('user2', -50, 10); // ✗ throws
```

**Full execution timeline:**

```
── FILE LOADS ─────────────────────────────────────────────────

  class PaymentService defined
    │
    ├── @Positive(amount) → store index 1  →  map: { processPayment: [1] }
    ├── @Positive(tax)    → store index 2  →  map: { processPayment: [1, 2] }
    └── @ValidateParams   → wrap method with validator

── RUNTIME ────────────────────────────────────────────────────

  new PaymentService()
    └── (nothing, decorators already ran)

  service.processPayment('user1', 100, 20)
    └── wrapper runs
        ├── read metadata → validate indexes [1, 2]
        ├── args[1] = 100  ✓
        ├── args[2] = 20   ✓
        └── call original → "Payment processed: user1 100 20"

  service.processPayment('user2', -50, 10)
    └── wrapper runs
        ├── read metadata → validate indexes [1, 2]
        ├── args[1] = -50  ✗
        └── throw Error: "Argument at index 1 must be positive"
```

---

## Key Takeaway

Decorators always follow the same two-phase pattern:

```
PHASE 1 — Class definition (decorators run)
  → Store metadata / wrap methods

PHASE 2 — Runtime (instances created, methods called)
  → Read metadata / enforce rules
```

The decorator itself never does the real work — it just sets up the rules. The real work happens later when the metadata is read by a validator, framework, or wrapper function.

---
