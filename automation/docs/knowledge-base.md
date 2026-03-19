# Knowledge Base: Login Issue Automation

**Category:** Technical Support — Automation  
**Applies to:** LMS, TMS, CRM login failures

---

## Chức năng của tự động hóa

Khi có một yêu cầu hỗ trợ mới trong Odoo với các từ khóa liên quan đến đăng nhập, hệ thống tự động hóa sẽ:

1. Gửi email xác nhận cho người dùng trong vòng vài phút (đáp ứng SLA < 30 phút)

2. Kiểm tra hệ thống nhân sự (Odoo) để tìm tài khoản và tình trạng việc làm của nhân viên

3. Thực hiện hành động phù hợp dựa trên kết quả kiểm tra

4. Gửi email giải quyết sự cố cho người dùng

5. Ghi lại tất cả các hành động vào yêu cầu hỗ trợ trong Odoo

---

## Logic quyết định

```
Account active?
  YES → password reset

Account deactivated?
  Employee still active in HR?
    YES → Reactivate account + password reset
    NO  → Escalate to support team (do NOT reactivate)

Employee not found in HR?
  → Escalate to support team
```

---

## Keyword triggers

Hệ thống tự động kích hoạt khi tiêu đề hoặc nội dung phiếu yêu cầu chứa bất kỳ từ nào sau đây:

`đăng nhập` · `login` · `log in` · `invalid username` · `invalid password` · `mật khẩu` · `password` · `không vào được` · `không truy cập` · `lms` · `tài khoản` · `account`

---

## Những trường hợp hệ thống tự động KHÔNG xử lý

- Sự cố hệ thống trên diện rộng (ví dụ: TMS ngừng hoạt động đối với tất cả người dùng) → chuyển tiếp thủ công

- Tài khoản của nhân viên đã nghỉ việc → luôn chuyển tiếp, không bao giờ tự động kích hoạt lại

- Phiếu yêu cầu không tìm thấy email của người dùng trong HR → chuyển tiếp thủ công

---

## Escalation path

Nếu hệ thống tự động chuyển tiếp phiếu yêu cầu, nhóm hỗ trợ sẽ xử lý. Nhận được thông báo qua email với các thông tin sau:

- Mã số vé
- Email người dùng
- Lý do Escalate

Một nhân viên hỗ trợ phải xem xét và xử lý trong khung thời gian SLA thông thường.

---

## Operating Engineer rationale

Nguyên nhân gốc rễ của các lỗi đăng nhập lặp đi lặp lại là do **quy tắc vô hiệu hóa sau 30 ngày không hoạt động** trong mã nguồn. Khắc phục vĩnh viễn lỗi này đòi hỏi nhóm phát triển phải thay đổi mã và trải qua chu kỳ triển khai (từ vài ngày đến vài tuần).

Tự động hóa này là **giải pháp tạm thời của Kỹ sư vận hành**: nó giải quyết các vé ngay lập tức bằng cách sử dụng cùng logic mà một nhân viên hỗ trợ sẽ áp dụng, giúp kéo dài thời gian cho đến khi việc khắc phục vĩnh viễn được lên kế hoạch.

|                              | Automation                   | Code fix                  |
| ---------------------------- | ---------------------------- | ------------------------- |
| Time to implement            | Hours                        | Days/weeks                |
| Resolves tickets immediately | Yes                          | Yes (after deploy)        |
| Removes root cause           | No                           | Yes                       |
| Risk                         | Low (HR check before action) | Medium (requires testing) |
