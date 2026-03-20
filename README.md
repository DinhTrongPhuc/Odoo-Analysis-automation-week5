# Tuần 5 — Automation: Xử lý Login Issue (Scenario 1)

> Tự động hoá quy trình xử lý ticket đăng nhập theo **Scenario 1**, áp dụng tư duy **Operating Engineer**.

---

## Automation này đang làm gì?

Automation **polling Odoo định kỳ**, tìm các ticket liên quan đến lỗi đăng nhập và xử lý theo đúng quy trình mà support engineer làm thủ công trong Scenario 1:

```
1. Poll Odoo mỗi 15 phút → tìm ticket mới chứa keyword đăng nhập
2. Gửi email xác nhận cho người dùng ngay lập tức  (SLA < 30 phút)
3. Kiểm tra trạng thái nhân sự + tài khoản qua Odoo HR system
4. Xử lý theo kết quả:
   - Tài khoản active       → gửi link đặt lại mật khẩu
   - Tài khoản bị khoá
     + nhân sự còn làm     → kích hoạt lại + gửi link reset password
     + nhân sự đã nghỉ     → ghi note, leo thang, KHÔNG kích hoạt lại
   - Không tìm thấy nhân sự → ghi note, leo thang support
5. Gửi email kết quả xử lý cho người dùng
6. Chuyển trạng thái ticket → Solved trên Odoo
7. Ghi log toàn bộ hành động vào ticket (internal note)
8. Lưu ticket đã xử lý vào processedTickets.json để tránh xử lý lại
```

---

## Tại sao automation thay vì sửa code?

Nguyên nhân gốc của login issue là **quy tắc tự động khoá tài khoản sau 30 ngày không hoạt động** — nằm ở tầng code, cần dev team sửa và deploy (mất vài ngày đến vài tuần).

Automation này là giải pháp **Operating Engineer**: giải quyết ticket ngay lập tức trong khi chờ fix vĩnh viễn, không cần chờ dev team.

|                        | Automation (giải pháp này)                  | Sửa code gốc              |
| ---------------------- | ------------------------------------------- | ------------------------- |
| Thời gian triển khai   | Vài giờ                                     | Vài ngày / tuần           |
| Giải quyết ticket ngay | Có                                          | Chỉ sau khi deploy        |
| Xoá nguyên nhân gốc    | Không                                       | Có                        |
| Rủi ro                 | Thấp — có bước kiểm tra HR trước khi action | Trung bình — cần kiểm thử |

---

## Automation Flow

```
Poll Odoo Helpdesk tickets
↓
Filter open tickets
↓
Convert HTML description to plain text
↓
TicketValidator detects login issue
↓
Automation Service processes ticket
↓
Add internal note
↓
Resolve ticket
↓
Send email notification
```

---

## Cài đặt và chạy

### Technologies

- Node.js
- TypeScript
- Axios
- Nodemailer
- Dotenv

### Bước 1 — Cài dependencies

```bash
cd automation
npm install
```

### Bước 2 — Tạo file `.env`

```bash
cp .env.sample .env
```

Điền đầy đủ các biến vào `.env`:

```env
# Odoo (bắt buộc)
ODOO_URL=https://your-odoo.mindx.edu.vn/jsonrpc
ODOO_DB=mindx
ODOO_USER=automation@mindx.edu.vn
ODOO_PASS=mat-khau-service-account
ODOO_API_KEY=xxxxxxxxxxxxxxxxx

# LMS — cần để reactivate tài khoản
LMS_BASE_URL=https://lms.mindx.edu.vn

# Email SMTP — cần để gửi email cho người dùng
SMTP_EMAIL=support@mindx.edu.vn
SMTP_PASS=app-password-cua-gmail
```

> **Lưu ý Gmail:** phải dùng **App Password**, không dùng mật khẩu đăng nhập thường.
> Vào: Google Account → Security → 2-Step Verification → App passwords → Tạo mới.

### Bước 3 — Run

```bash
# Development — ts-node tự compile TypeScript, không cần build trước
npx ts-node src/index.ts
```

### Kết quả khi chạy thành công (ví dụ)

```
[INFO] Automation started — polling every 60 second
[INFO] Checking Odoo for new login tickets...
[INFO] Found 2 new login tickets
[INFO] Processing ticket #42 — nguyen.van.a@mindx.edu.vn
[INFO] Sent ACK email to nguyen.van.a@mindx.edu.vn
[INFO] HR check: account=deactivated, employment=active
[INFO] Decision: reactivate_and_reset
[INFO] Account reactivated, password reset link sent
[INFO] Resolution email sent
[INFO] Ticket #42 → Solved
[INFO] Ticket #42 saved to processedTickets.json
```

---

## Cấu trúc dự án

```
automation/
├── src/
│   ├── index.ts                         # Entrypoint: khởi động scheduler, bắt đầu polling
│   │
│   ├── domain/                          # Business logic — không phụ thuộc bên ngoài
│   │   ├── entities/
│   │   │   ├── Ticket.ts          # Kiểu dữ liệu ticket
│   │   │   └── employee.ts              # Kiểu dữ liệu nhân sự + hàm decideAction()
│   │   ├── services/
│   │   │   └── LoginAutomationService.ts   # Điều phối toàn bộ luồng xử lý
│   │   └── validators/
│   │       └── TicketValidator.ts      # Phát hiện login issue qua keyword + danh sách keyword
│   │
│   ├── ports/
│   │   ├── inbound/                     # Interface nhận trigger từ ngoài vào
│   │   └── outbound/                    # Interface gọi ra hệ thống bên ngoài
│   │
│   ├── adapters/
│   │   ├── primary/
│   │   │   └── WebhookAdapter.ts       # Nhận webhook từ Odoo
│   │   └── secondary/
│   │       ├── OdooAdapter.ts          # Odoo API: HR check, ghi note, chuyển Solved
│   │       ├── LMSAdapter.ts           # LMS API: reactivate + reset password
│   │       └── EmailAdapter.ts         # SMTP: gửi email xác nhận + kết quả
│   │
│   ├── utils/                           # Logger, TicketTracker
│   └── storage/
│       └── processedTickets.json        # Danh sách ticket đã xử lý — tránh trùng lặp
│
├── docs/
│   ├── workflow-diagram.md              # Sơ đồ luồng xử lý chi tiết
│   └── knowledge-base.md               # Logic, keyword, escalation path
│
├── Logs/             # Ghi Automation log / Error Automation log
│
│
├── data/         # data sample week 4, được xử lý và tổng hợp với Pivot Table excel để làm dữ liệu phân tích Analysis
│
├── reports/          # chứa screenshot kết quả chạy automation
│
├── .env.sample               # Template biến môi trường
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Kiến trúc Hexagonal (Ports & Adapters)

Domain core không phụ thuộc bất kỳ thư viện hay API bên ngoài. Mọi kết nối ra ngoài đều qua port interface:

```
SchedulerAdapter (polling 15 phút)
         ↓
  [Domain Core]
  AutomationService
    → LoginIssueService   — phân tích, tạo email
    → TicketValidator     — phát hiện login issue
    → decideAction()      — quyết định hành động
         ↓
  [Secondary Adapters]
  OdooAdapter   → Odoo API    kiểm tra HR, ghi note, chuyển ticket → Solved
  LMSAdapter    → LMS API     reactivate tài khoản, gửi link reset password
  EmailAdapter  → SMTP        gửi email xác nhận + kết quả cho người dùng
```

---

## Bảng quyết định (Scenario 1)

| Trạng thái tài khoản | Trạng thái nhân sự   | Hành động tự động                | Kết quả ticket |
| -------------------- | -------------------- | -------------------------------- | -------------- |
| Active               | Bất kỳ               | Gửi link đặt lại mật khẩu        | → Solved       |
| Deactivated          | Đang làm / Nghỉ phép | Kích hoạt lại + gửi link reset   | → Solved       |
| Deactivated          | Đã nghỉ việc         | Ghi note escalation, báo support | Giữ nguyên     |
| Không tìm thấy       | —                    | Ghi note escalation, báo support | Giữ nguyên     |

---

## Biến môi trường

| Biến           | Mục đích                 | Ghi chú                           |
| -------------- | ------------------------ | --------------------------------- |
| `ODOO_URL`     | URL Odoo JSON-RPC        |                                   |
| `ODOO_DB`      | Tên database Odoo        |                                   |
| `ODOO_USER`    | Username service account | Không dùng tài khoản admin        |
| `ODOO_PASS`    | Password service account |                                   |
| `LMS_BASE_URL` | Base URL của LMS         | Nếu không set, reactivate sẽ fail |
| `SMTP_EMAIL`   | Email gửi đi             | Gmail hoặc SMTP relay             |
| `SMTP_PASS`    | Mật khẩu SMTP            | Gmail cần App Password            |

---

## Các lỗi thường gặp

**`tickets is not iterable` hoặc `Odoo did not return tickets`**
Kiểm tra `ODOO_URL` có kết thúc đúng bằng `/jsonrpc` chưa và credentials còn hợp lệ.

**`Invalid URL` khi gọi LMS**
`LMS_BASE_URL` chưa được set trong `.env` hoặc tên biến sai. Kiểm tra lại đúng chính xác `LMS_BASE_URL`.

**SMTP lỗi `535-5.7.8 Username and Password not accepted`**
Gmail yêu cầu App Password. Bật 2-Step Verification → Google Account → Security → App passwords → Tạo mới.

**`Cannot read properties of undefined`**
Odoo trả về cấu trúc không như mong đợi. Kiểm tra field list trong query và đảm bảo các field đó tồn tại trên Odoo instance của bạn.

---

## Ghi chú bảo mật

- Không commit file `.env` lên Git — đã có trong `.gitignore`
- Dùng **service account riêng** cho automation, không dùng tài khoản admin
- Service account chỉ cần quyền tối thiểu: đọc `hr.employee` và `res.users`, ghi `helpdesk.ticket`

---

## improvements (future work)

- Các cải tiến khả thi cho hệ thống tự động hóa:
- Phân loại vé dựa trên AI
- Hỗ trợ nhiều loại sự cố
- Bảng điều khiển phân tích tự động hóa
- Lưu trữ theo dõi vé liên tục
- Phát hiện từ khóa nâng cao
