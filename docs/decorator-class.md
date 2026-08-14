# TypeScript Decorator > Từ Cơ Chế Cốt Lõi Đến Ứng Dụng Trong NestJS

## Mở đầu

Nếu bạn đã từng dùng Angular hoặc NestJS, chắc chắn bạn quen mắt với những đoạn code như `@Injectable()`, `@Controller()`, `@Component()`. Chúng trông như "magic", nhưng thực chất decorator chỉ là **syntactic sugar** cho một cơ chế rất đơn giản: **gọi hàm và gắn metadata lên class**. Bài viết này tổng hợp lại toàn bộ hành trình tìm hiểu decorator — từ khái niệm, cách hoạt động thật bên dưới, đến cách NestJS dùng nó để xây dựng cả hệ thống DI và routing.

---

## 1. Decorator là gì?

Decorator là một loại hàm đặc biệt, cho phép gắn thêm **hành vi** hoặc **metadata** vào class, method, property, mà không cần sửa trực tiếp logic bên trong. Cú pháp dùng dấu `@` đặt trước thứ cần decorate:

```typescript
@Component({ selector: 'app-root' })
class AppComponent {
  @Input() name: string;
}
```

### Vấn đề nó giải quyết

Trước decorator, muốn thêm hành vi chung (logging, validation, DI...) cho nhiều class, bạn phải lặp code, hoặc viết wrapper rối rắm tách rời khỏi định nghĩa gốc. Decorator giải quyết bằng cách tách rõ:

- **Logic nghiệp vụ** — nằm trong method/class.
- **Cross-cutting concerns** (logging, DI, validation...) — nằm trong decorator, khai báo ngay tại chỗ.

Đây là ý tưởng của **Aspect-Oriented Programming (AOP)**.

---

## 2. Class Decorator hoạt động như thế nào?

### Ví dụ đơn giản nhất

```typescript
function ClassLogger(constructor: Function) {
  console.log('Class name:', constructor.name);
}

@ClassLogger
class UserService {}
```

**Output:** `Class name: UserService`

### Flow chạy thật

1. **Compile-time**: TypeScript chuyển `@ClassLogger` thành lệnh gọi hàm bình thường: `ClassLogger(UserService)`.
2. **Runtime**: Class được định nghĩa xong → decorator chạy **ngay lập tức**, **1 lần duy nhất** — không phải lúc `new UserService()`.
3. Tham số `constructor` chính là **class/constructor function**, không phải instance.

Điểm mấu chốt cần nhớ:

| Điều                | Giải thích                                                             |
| ------------------- | ---------------------------------------------------------------------- |
| Chạy khi nào?       | Ngay khi class được định nghĩa (module load), **không phải** lúc `new` |
| Tham số là gì?      | Class chính nó, không phải instance                                    |
| Chạy bao nhiêu lần? | Chỉ 1 lần, dù sau đó `new` bao nhiêu instance                          |

### Decorator có thể return class mới

```typescript
function WithTimestamp<T extends { new (...args: any[]): {} }>(Base: T) {
  return class extends Base {
    createdAt = new Date();
  };
}

@WithTimestamp
class Product {
  name = 'Book';
}
```

Một điểm dễ nhầm: `createdAt = new Date()` **không chạy ngay** lúc decorator thực thi — nó chỉ là **định nghĩa field**. `new Date()` chỉ thực sự được gọi khi bạn `new Product()`, và mỗi lần `new` sẽ cho ra giá trị `Date` khác nhau.

```typescript
const p1 = new Product(); // createdAt = Date A
const p2 = new Product(); // createdAt = Date B (khác A)
```

→ **Nguyên tắc chung**: decorator quyết định _hình dạng/cấu trúc_ của class, còn _giá trị field instance_ luôn tính lại mỗi lần `new`.

---

## 3. TS transpile ra JS thật như thế nào?

Nhiều tài liệu (và cả bài viết trước của mình) hay đơn giản hoá thành `ClassLogger(UserService)`. Thực tế, `tsc` sinh ra một helper `__decorate`:

```javascript
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
            r = (c < 3 ? d(r) : ...) || r;
    return r;
};

let UserController = class UserController {
    findAll() { return ['Alice', 'Bob']; }
};
UserController = __decorate([
    Controller('users')
], UserController);
```

Vì sao cần `__decorate` thay vì gọi trực tiếp?

- Hỗ trợ **nhiều decorator xếp chồng** (`@A @B @C class X {}`) — chạy theo thứ tự **dưới lên trên**, giống composition `A(B(C(X)))`.
- Xử lý **return value**: nếu decorator return class mới → gán lại; nếu không return (như `@Controller()`) → giữ nguyên class gốc (`|| r`).
- Class được viết lại thành **class expression** gán vào `let` (thay vì `class` declaration) để có thể re-assign sau khi decorator chạy.

---

## 4. Class Decorator trong NestJS: dùng để làm gì?

Khác với `WithTimestamp` (sửa hình dạng class), các decorator của NestJS chủ yếu **không** return class mới — chúng chỉ **gắn metadata** lên class, để đọc lại sau.

| Decorator               | Vai trò                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `@Injectable()`         | Đánh dấu class có thể inject vào constructor của class khác (DI)   |
| `@Controller('users')`  | Đánh dấu class là controller, gắn route prefix                     |
| `@Module({...})`        | Khai báo imports/controllers/providers — "bản đồ" cho DI container |
| `@Catch(HttpException)` | Đánh dấu class là exception filter, bắt loại lỗi nào               |

`@Controller()` cụ thể là một **Class Decorator Factory** — vì nó nhận tham số (`prefix`), nên phải trả về decorator thật:

```typescript
function Controller(prefix: string): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('path', prefix, target);
  };
}
```

So với class decorator thường (`@ClassLogger`, không nhận tham số), factory phải "gọi" trước (`@Controller('users')`) rồi TypeScript mới áp dụng decorator trả về lên class.

### Tự viết lại logic tương tự `@Controller()`

```typescript
const controllerMetadata = new Map<Function, { prefix: string }>();

function Controller(prefix: string = '') {
  return function (target: Function) {
    controllerMetadata.set(target, { prefix });
  };
}

@Controller('users')
class UserController {
  findAll() {
    return ['Alice', 'Bob'];
  }
}

// "Framework" đọc lại metadata (mô phỏng NestJS bootstrap)
function bootstrap(controllers: Function[]) {
  controllers.forEach((ControllerClass) => {
    const meta = controllerMetadata.get(ControllerClass);
    console.log(`Route base path: /${meta?.prefix}`);
    const instance = new (ControllerClass as any)();
    console.log(instance.findAll());
  });
}
```

NestJS thật chỉ khác ở "kho lưu metadata": dùng `Reflect.defineMetadata`/`getMetadata` (thư viện `reflect-metadata`) thay cho `Map` tự viết, và có `NestFactory` phức tạp hơn để tự scan + tạo instance theo dependency graph.

---

## 5. Flow đầy đủ: từ decorator đến route Express thật

```
1. MODULE LOAD (import time)
   @Controller('users') chạy → Reflect.defineMetadata(...)
   → metadata "dán" lên class (nằm trong WeakMap nội bộ của reflect-metadata,
     không phải property thông thường trên class)
         ↓
2. NestFactory.create(AppModule)
   - Đọc @Module() metadata
   - Quét controllers[], providers[]
   - Với mỗi @Injectable(): tạo instance theo DI graph
     (dùng design:paramtypes để biết constructor cần dependency gì)
         ↓
3. NestJS Router Explorer
   - Đọc metadata 'path' trên từng Controller
   - Đọc metadata trên từng method (@Get(), @Post()...)
   - Ghép prefix + method path → full route
         ↓
4. Register vào HTTP Adapter (Express/Fastify)
   app.get('/users', handler)
         ↓
5. app.listen(3000) → server sẵn sàng nhận request
```

Vài điểm dễ hiểu nhầm cần lưu ý:

- **Metadata không map trực tiếp 1 bước sang Express.** NestJS có lớp trung gian riêng (Router Explorer, DI Container) — đây cũng là lý do NestJS đổi được sang Fastify mà code người dùng viết không cần đổi.
- **2 thời điểm khác nhau**: decorator chạy lúc _import_ (có thể rất sớm), còn việc map sang route thật chỉ xảy ra khi `NestFactory.create()` được gọi.

---

## Tổng kết

| Khái niệm           | Ý chính                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Decorator           | Hàm gắn thêm hành vi/metadata vào class mà không sửa trực tiếp logic bên trong                                                         |
| Class Decorator     | Nhận `target` là chính class (constructor function), chạy 1 lần lúc class được định nghĩa                                              |
| Decorator Factory   | Decorator có tham số (`@Controller('users')`) — hàm ngoài trả về decorator thật                                                        |
| Return class mới    | Có thể mở rộng hành vi thật (`WithTimestamp`) — field instance vẫn tính lại mỗi lần `new`                                              |
| Chỉ gắn metadata    | Cách NestJS dùng phổ biến nhất (`@Injectable`, `@Controller`, `@Module`) — không đổi hình dạng class, chỉ lưu thông tin để đọc lại sau |
| `__decorate` helper | Cách `tsc` thực sự transpile decorator, hỗ trợ nhiều decorator xếp chồng và xử lý return value                                         |
| NestJS bootstrap    | Không map metadata → Express trực tiếp, mà qua lớp DI Container + Router Explorer trung gian                                           |

Hiểu được cơ chế này giúp bạn không còn thấy `@Injectable()` hay `@Controller()` là "magic" nữa — chúng chỉ là những function chạy đúng lúc, gắn đúng thông tin, để framework đọc lại và tự động hoá phần còn lại.
