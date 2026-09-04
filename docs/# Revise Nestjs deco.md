# Revise Nestjs deco

- Class
- Method & params
- Property

# For revise full flow decorator nestjs

**Ví dụ đơn giản — chỉ 1 method + 1 DTO**

```typescript
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  comment_text: string;
}

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() body: CreateCommentDto) {
    return this.commentsService.create(body.comment_text);
  }
}
```

## Compile ra JavaScript

```javascript
'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    /* ... */
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };

// ===== CreateCommentDto =====
class CreateCommentDto {}
__decorate(
  [IsString(), IsNotEmpty(), __metadata('design:type', String)],
  CreateCommentDto.prototype,
  'comment_text',
  void 0,
);

// ===== CommentsController =====
class CommentsController {
  constructor(commentsService) {
    this.commentsService = commentsService;
  }

  create(body) {
    return this.commentsService.create(body.comment_text);
  }
}
__decorate(
  [
    Post(),
    __param(0, Body()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [CreateCommentDto]),
    __metadata('design:returntype', void 0),
  ],
  CommentsController.prototype,
  'create',
  null,
);

CommentsController = __decorate(
  [Controller('comments'), __metadata('design:paramtypes', [CommentsService])],
  CommentsController,
);
```

## Full flow — 3 giai đoạn thời gian

```
┌────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN A — MODULE LOAD (chạy 1 lần, khi file được import)      │
└────────────────────────────────────────────────────────────────┘

  A1. CreateCommentDto được định nghĩa (class rỗng, chưa có gì đặc biệt)

  A2. __decorate chạy cho property "comment_text":
      @IsString()    → ghi rule { property:'comment_text', type:'isString' }
      @IsNotEmpty()  → ghi rule { property:'comment_text', type:'isNotEmpty' }
      → lưu vào: Reflect metadata gắn trên CreateCommentDto.prototype
      → comment_text VẪN CHƯA CÓ GIÁ TRỊ nào — chỉ là khai báo kiểu

  A3. CommentsController được định nghĩa (method create() vẫn nguyên bản)

  A4. __decorate chạy cho method "create":
      __param(0, Body())
        → gọi Body()(CommentsController.prototype, 'create', 0)
        → ghi: routeArgs[0] = { index:0, source:'body' }

      __metadata("design:paramtypes", [CreateCommentDto])
        → TS TỰ ĐỘNG chèn — ghi: tham số index 0 của create() có type = CreateCommentDto
        → GHÉP với routeArgs[0] ở trên → giờ đủ 2 mảnh: "lấy từ body" + "type là gì"

      Post()
        → ghi: { method:'POST', path:'' }

  A5. __decorate chạy cho class CommentsController:
      Controller('comments') → ghi: { prefix: 'comments' }

  ✅ Kết thúc Giai đoạn A: KHÔNG có logic nào chạy thật —
     chỉ có 3 "kho metadata" được điền: DTO rules, routeArgs, path/method/prefix


┌────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN B — APP BOOTSTRAP (NestFactory.create())                │
└────────────────────────────────────────────────────────────────┘

  B1. app.useGlobalPipes(new ValidationPipe({ whitelist:true, transform:true }))
      → globalValidationPipe được tạo, sẵn sàng dùng ở Giai đoạn C

  B2. RouterExplorer quét CommentsController:
      prefix = 'comments'
      method 'create': httpMethod='POST', path='', argsMeta=[{index:0, source:'body', metatype:CreateCommentDto}]

  B3. RouterExplorer sinh 1 closure handler:

      function handler(req, res) {
        const body = globalValidationPipe.transform(req.body, { metatype: CreateCommentDto });
        const result = instance.create(body);
        res.json(result);
      }

  B4. Đăng ký thật với Express:
      app.post('/comments', handler)
      (Express không biết gì về Nest — chỉ nhận 1 callback bình thường)


┌────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN C — REQUEST THẬT                                       │
└────────────────────────────────────────────────────────────────┘

  POST /comments
  Body: { "comment_text": "" }

  C1. Express khớp route → gọi handler(req, res) (sinh ở Bước B3)

  C2. Bên trong handler:
      globalValidationPipe.transform(req.body, { metatype: CreateCommentDto })
        ↓
      (a) const instance = Object.assign(new CreateCommentDto(), req.body)
          → ĐẾN ĐÂY comment_text MỚI THỰC SỰ CÓ GIÁ TRỊ: ""

      (b) Tra lại rule đã ghi từ Bước A2:
          - isString:    typeof "" === 'string'  → PASS
          - isNotEmpty:  "" === ''                → FAIL

      (c) throw new Error("comment_text should not be empty")

  C3. handler bắt lỗi → res.status(400).json({ message: "..." })

  ⛔ create() KHÔNG BAO GIỜ ĐƯỢC GỌI — lỗi xảy ra TRƯỚC khi tới
     dòng "const result = instance.create(body)"
```

## Nếu body hợp lệ (`comment_text: "nice"`) — nhánh thành công

```
  C2(a) instance = CreateCommentDto { comment_text: 'nice' }
  C2(b) isString PASS, isNotEmpty PASS → không throw
        → globalValidationPipe.transform() RETURN instance đã validate

  C1(tiếp) handler:
      const result = instance.create(body)   // body = CreateCommentDto{comment_text:'nice'}
        → this.commentsService.create('nice')
      res.json(result)
```

## Sơ đồ tóm gọn — nối 2 mảnh metadata thành 1 flow

```
@IsString() / @IsNotEmpty()          @Body()
       │                                │
       ▼                                ▼
 ghi rule lên               ghi "lấy từ req.body, index 0"
 CreateCommentDto.prototype        │
       │                           ▼
       │                  design:paramtypes (TS tự chèn)
       │                  ghi "type của index 0 = CreateCommentDto"
       │                           │
       └─────────────┬─────────────┘
                      ▼
         ValidationPipe.transform(req.body, {metatype: CreateCommentDto})
                      │
          tạo instance CÓ GIÁ TRỊ THẬT → tra rule → so sánh → throw hoặc pass
```

## Tóm gọn nguyên lý

> `@IsString()`/`@IsNotEmpty()` (property decorator) và `@Body()` (parameter decorator) **không hề biết đến nhau** lúc chúng chạy ở Giai đoạn A — chúng ghi metadata vào 2 nơi khác nhau, thời điểm khác nhau về mặt logic. Mảnh ghép nối chúng lại là `design:paramtypes` — dòng TS tự động sinh, cho `ValidationPipe` biết "tham số body có type CreateCommentDto", để nó biết **tra rule ở đâu**. Toàn bộ việc so sánh giá trị thật với rule chỉ xảy ra ở Giai đoạn C — khi request thật tới, cách xa thời điểm decorator chạy hàng chục, hàng trăm request khác nhau.
