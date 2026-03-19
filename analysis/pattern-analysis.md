# Pattern Analysis — Week 5

**Period:** Week 4 sample data  
**Total tickets analyzed:** 131

---

## 1. Data overview

| Priority  | Count   | % of total |
| --------- | ------- | ---------- |
| High      | 42      | 32%        |
| Urgent    | 40      | 31%        |
| Low       | 40      | 31%        |
| Medium    | 9       | 7%         |
| **Total** | **131** | **100%**   |

> **Lưu ý:** ~8 phiếu yêu cầu là phiếu yêu cầu thử nghiệm nội bộ (chủ đề: "Kiểm tra kỹ thuật", "KIỂM TRA", "Phiếu yêu cầu thử nghiệm khi gửi cc email", v.v.) và đã được loại trừ khỏi phân tích mẫu bên dưới, còn lại **123 phiếu yêu cầu thực tế**.

---

## 2. Category breakdown

Các Ticket yêu cầu được nhóm thành 5 danh mục dựa trên từ khóa chủ đề:

| #   | Category                  | Ticket count | % of real tickets |
| --- | ------------------------- | ------------ | ----------------- |
| 1   | TMS / Attendance errors   | ~25          | 20%               |
| 2   | Account / Password issues | ~18          | 15%               |
| 3   | Enroll / LMS issues       | ~18          | 15%               |
| 4   | CRM / Lead management     | ~15          | 12%               |
| 5   | Accounting / Payment      | ~12          | 10%               |
| 6   | Other / Misc              | ~35          | 28%               |

---

## 3. Top 5 vấn đề

### Issue 1 — TMS crash / attendance not displaying (~25 tickets, 20%)

**Mẫu:** Nhiều BU ở các tỉnh khác nhau (Quảng Ninh, Tỉnh Nam 2, Tô Ký, Hà Nam Nghi...) báo cáo TMS không tải, điểm danh không hiển thị hoặc không thể xử lý yêu cầu chuyển ca — tất cả trong cùng một khoảng thời gian (từ ngày 31).

**Sample tickets:**

- `[Tỉnh Nam 2] LỖI TMS TỪ NGÀY 31. KHÔNG HIỆN THÔNG TIN`
- `[Tô Ký] TMS lỗi không vào tạo bù công được`
- `TMS không hiển thị công cần duyệt`
- `Hệ thống TMS không hiển thị công`
- `Lỗi TMS I4081 - Lỗi khi yêu cầu bù công`

**Impact:** ~25 vé, nhiều chi nhánh bị ảnh hưởng đồng thời, tính cấp bách cao trong việc xử lý bảng lương.

**Root cause hypothesis:** Một thay đổi triển khai hoặc cấu hình vào ngày 31 đã làm hỏng mô-đun chấm công TMS — đây là vấn đề hệ thống, không phải vấn đề của từng người dùng.

**Why NOT automating this:** Nguyên nhân gốc cần nhóm phát triển khắc phục. Tự động hóa không thể giải quyết sự cố hệ thống trên diện rộng.

---

### Issue 2 — Account deactivation / login issues (~18 tickets, 15%)

**Pattern:** Người dùng (giáo viên, nhân viên BU) không thể đăng nhập. Tài khoản bị vô hiệu hóa sau 30 ngày không hoạt động do quy tắc hệ thống. Khắc phục thủ công: kiểm tra trạng thái nhân sự → kích hoạt lại nếu vẫn còn làm việc → đặt lại mật khẩu. Mất 5-10 phút cho mỗi phiếu.

**Sample tickets:**

- `BU KHÔNG ĐĂNG NHẬP VÀO TMS ĐƯỢC`
- `Fwd: LỖI ĐĂNG NHẬP VÀO HỆ THỐNG NỘI BỘ`
- `LỖI ĐĂNG NHẬP HỆ THỐNG NỘI BỘ`
- `Re: Không đăng nhập được CRM`
- `MindX user activation`
- `CẤP LẠI MẬT KHẢU MAIL`

**Impact:** ~18 yêu cầu mỗi chu kỳ, mỗi yêu cầu 5–10 phút = **90–180 phút làm việc thủ công mỗi tuần** có thể hoàn toàn tự động.

**Root cause:** Quy tắc vô hiệu hóa không hoạt động trong 30 ngày trong cơ sở mã (yêu cầu nhóm nhà phát triển phải thay đổi để khắc phục vĩnh viễn).

**Automation fit:** Phù hợp tốt — mẫu rõ ràng, logic quyết định mang tính xác định (kiểm tra nhân sự → quyết định hành động), có thể khắc phục lặp lại.

---

### Issue 3 — Enroll errors (~18 tickets, 15%)

**Pattern:** Nhân viên BU không thể đăng ký sinh viên vào lớp học, nhận được các đăng ký trùng lặp hoặc không thể tìm thấy lớp học để đăng ký.

**Sample tickets:**

- `KHÔNG THỂ ENROLL HỌC VIÊN`
- `LỖI ENROLL HỌC VIÊN VÀO LỚP HDT-JSB75`
- `LỖI TÌM LỚP ENROLL HỌC VIÊN VÀO LỚP`
- `REQUEST FIX ENROLLMENT - HỌC VIÊN BỊ ENROLL TRÙNG LỚP`

**Impact:** ~18 vé, ảnh hưởng trực tiếp đến lịch học và trải nghiệm của sinh viên.

**Root cause:** Có thể là sự cố về quyền/vai trò đối với tài khoản BU hoặc lỗi LMS khi tìm kiếm lớp học.

---

### Issue 4 — CRM / Lead status issues (~15 tickets, 12%)

**Pattern:** Nhân viên không thể thay đổi trạng thái khách hàng tiềm năng, nút gọi CRM không hoạt động, tin nhắn không gửi được.

**Sample tickets:**

- `CRM không bấm gọi được`
- `Nhờ team hỗ trợ chuyển trạng thái lead`
- `LEAD CRM ĐÃ ADD PATMENT VẪN NẰM Ở L5A`
- `CRM lại không gửi được tin nhắn`

**Impact:** ~15 vé, ảnh hưởng đến quy trình bán hàng và theo dõi khách hàng.

---

### Issue 5 — Accounting / Payment (~12 tickets, 10%)

**Pattern:** Nhân viên không thể xác nhận giao dịch, hủy đơn hàng hoặc số tiền hiển thị không chính xác.

**Sample tickets:**

- `NHỜ KẾ TOÁN HỦY CF GIAO DỊCH 1TR TRÊN LEAD L6X`
- `Lỗi Add payment`
- `Lead kế toán báo không Confirmed được`
- `số tiền trên hợp đồng hiển thị sai`

**Impact:** ~12 vé, rủi ro về độ chính xác tài chính.

---

## 4. Automation candidate selection

| Issue           | Volume  | Repeatable fix | Root cause fixable by automation | Selected |
| --------------- | ------- | -------------- | -------------------------------- | -------- |
| TMS crash       | #1 (25) | No             | No — systemic bug                | ✗        |
| Account / Login | #2 (18) | Yes            | No — code rule                   | **✓**    |
| Enroll errors   | #3 (18) | Partially      | Unclear                          | ✗        |
| CRM issues      | #4 (15) | Partially      | No                               | ✗        |
| Accounting      | #5 (12) | No             | No                               | ✗        |

**Selected: Issue 2 — Account deactivation / Login issue**

**Lý do:**

- Mẫu rõ ràng, có thể lặp lại — cùng một nguyên nhân gốc mỗi lần
- Khắc phục thủ công được xác định rõ: kiểm tra HR → kích hoạt lại nếu đang hoạt động → đặt lại mật khẩu
- Giá trị tự động hóa cao: tiết kiệm tương đối nhiều thời gian
- Phù hợp hoàn hảo với Kỹ sư vận hành: nguyên nhân gốc yêu cầu thay đổi mã (nhóm phát triển), nhưng giải pháp tạm thời có thể được tự động hóa ngay lập tức
- Rủi ro thấp: tự động hóa chỉ kích hoạt lại tài khoản cho những nhân viên được xác nhận đang hoạt động trong hệ thống HR

---
