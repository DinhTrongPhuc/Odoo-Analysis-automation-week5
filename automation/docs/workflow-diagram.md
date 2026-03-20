# Sơ đồ luồng tự động hoá — Lỗi đăng nhập (scenarios-01)

**Tuần 5 — Operating Engineer Automation**

---

## Luồng xử lý từ đầu đến cuối

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KÍCH HOẠT                                    │
│                                                                     │
│   Ticket mới được tạo trên Odoo (email từ người dùng)               │
│   → Webhook kích hoạt → WebhookAdapter.onTicketCreated()            │
│                                                                     │
│   HOẶC                                                              │
│                                                                     │
│   SchedulerAdapter chạy mỗi 15 phút                                 │
│   → Tìm các ticket đang chờ chưa được xử lý                         │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│              BƯỚC 1 — PHÁT HIỆN LỖI ĐĂNG NHẬP                       │
│                                                                     │
│   TicketValidator kiểm tra tiêu đề + nội dung ticket:               │
│   "đăng nhập" / "login" / "invalid password" / "lms" / ...          │
│                                                                     │
│   ┌──────────────────┐      ┌──────────────────────────────┐        │
│   │  Không phải lỗi  │      │      Là lỗi đăng nhập        │        │
│   │  đăng nhập       │      │                              │        │
│   │  → BỎ QUA        │      │   → Tiếp tục Bước 2          │        │
│   └──────────────────┘      └──────────────────────────────┘        │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│              BƯỚC 2 — GỬI EMAIL XÁC NHẬN                            │
│                   (SLA: < 30 phút)                                  │
│                                                                     │
│   EmailAdapter.send() → hộp thư người dùng                          │
│                                                                     │
│   Nội dung:                                                         │
│   • Xác nhận đã nhận ticket                                         │
│   • Thời gian phản hồi dự kiến                                      │
│   • Hướng dẫn tự xử lý tạm thời (trình duyệt ẩn danh, đúng URL)     │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│              BƯỚC 3 — KIỂM TRA HỆ THỐNG NHÂN SỰ (Odoo)              │
│                                                                     │
│   OdooAdapter.findByEmail(senderEmail)                              │
│                                                                     │
│   Kiểm tra:                                                         │
│   • hr.employee → trạng thái nhân sự (đang làm / đã nghỉ việc)      │
│   • res.users   → trạng thái tài khoản (hoạt động / bị khoá)        │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
                    ┌────────┴──────────┐
                    │ Tìm thấy nhân sự? │
                    └────────┬──────────┘
            KHÔNG ←──────────┴──────────→ CÓ
               ↓                             ↓
    ┌─────────────────────┐      ┌───────────┴───────────┐
    │ Không tìm thấy      │      │ Trạng thái tài khoản? │
    │ → Leo thang         │      └───────────┬───────────┘
    └─────────────────────┘             ┌─────┴──────┐
                                   HOẠT ĐỘNG     BỊ KHOÁ
                                        ↓              ↓
                               ┌─────────────┐  ┌──────────────────┐
                               │  BƯỚC 4a    │  │ Nhân sự còn      │
                               │  Đặt lại    │  │ đang làm việc?   │
                               │  mật khẩu   │  └────────┬─────────┘
                               └─────────────┘      CÓ ←─┴─→ KHÔNG
                                                    ↓            ↓
                                          ┌──────────────┐  ┌─────────────────┐
                                          │  BƯỚC 4b     │  │  Đã nghỉ việc   │
                                          │  Kích hoạt   │  │  → Leo thang    │
                                          │  lại + Đặt   │  │  KHÔNG kích     │
                                          │  lại mật khẩu│  │  hoạt lại       │
                                          └──────────────┘  └─────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│              BƯỚC 5 — GỬI EMAIL KẾT QUẢ XỬ LÝ                       │
│                                                                     │
│   EmailAdapter.send() → hộp thư người dùng                          │
│                                                                     │
│   Nội dung theo từng trường hợp:                                    │
│   • reset_password       → đã gửi link đặt lại mật khẩu             │
│   • reactivate_and_reset → đã kích hoạt lại tài khoản + link        │
│   • escalate_*           → "team sẽ liên hệ lại sớm nhất"           │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│              BƯỚC 6 — GHI LOG VÀO TICKET ODOO                       │
│                                                                     │
│   ProcessResult được ghi lại:                                       │
│   • Quyết định đã thực hiện                                         │
│   • Tất cả hành động đã thực hiện                                   │
│   • Các email đã gửi                                                │
│   • Cờ leo thang (nếu có)                                           │
│   • Thời gian từng bước                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Bảng quyết định

| Trạng thái tài khoản | Trạng thái nhân sự   | Quyết định             | Hành động                         |
| -------------------- | -------------------- | ---------------------- | --------------------------------- |
| Đang hoạt động       | Bất kỳ               | `reset_password`       | Gửi link đặt lại mật khẩu         |
| Bị khoá              | Đang làm / Nghỉ phép | `reactivate_and_reset` | Kích hoạt lại + đặt lại mật khẩu  |
| Bị khoá              | Đã nghỉ việc         | `escalate_terminated`  | Báo support — KHÔNG kích hoạt lại |
| Không tìm thấy       | —                    | `escalate_not_found`   | Báo support để điều tra thủ công  |

---

## Luồng dữ liệu theo kiến trúc Hexagonal

```
                     ┌──────────────────────────────────────────┐
                     │            DOMAIN CORE (Lõi)             │
                     │                                          │
  WebhookAdapter ──► │  LoginIssueService   AutomationService   │
  SchedulerAdapter──►│  TicketValidator     LoginTicket         │
                     │  Employee            decideAction()      │
                     └──────────────┬───────────────────────────┘
                                    │ gọi qua các port
               ┌────────────────────┼────────────────────┐
               ↓                    ↓                    ↓
      IHRSystemPort           ILMSPort            IEmailPort
      (Port nhân sự)       (Port LMS)          (Port email)
              ↓                    ↓                    ↓
       OdooAdapter           LMSAdapter          EmailAdapter
              ↓                    ↓                    ↓
        Odoo API              LMS REST API       SMTP / SendGrid
```

---

## Lý do chọn hướng Operating Engineer

|                         | Automation (giải pháp này) | Sửa code gốc              |
| ----------------------- | -------------------------- | ------------------------- |
| Thời gian triển khai    | Vài giờ                    | Vài ngày / tuần           |
| Giải quyết ngay lập tức | Có                         | Chỉ sau khi deploy        |
| Xoá nguyên nhân gốc     | Không                      | Có                        |
| Mức độ rủi ro           | Thấp (có bước kiểm tra HR) | Trung bình (cần kiểm thử) |

**Nguyên nhân gốc:** Quy tắc tự động khoá tài khoản sau 30 ngày không hoạt động nằm ở tầng code. Automation này là giải pháp tạm thời trong khi team dev lên lịch sửa vĩnh viễn.

---
