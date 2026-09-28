# JobBoard Frontend

Base frontend dùng Next.js App Router, TypeScript và Tailwind CSS.

## Chạy local

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Ứng dụng chạy tại <http://localhost:3000>. Biến
`BACKEND_API_URL=http://localhost:5000/api` đã được chuẩn bị trong `.env.example`
để các Server Component và route proxy kết nối với JobBoard API.

Chạy backend tại cổng `5000` trước frontend để dùng đăng nhập, ứng tuyển, hồ sơ
và dashboard. Danh sách/chi tiết việc làm công khai có dữ liệu demo dự phòng;
các khu vực tài khoản yêu cầu API và phiên đăng nhập hợp lệ.

Tài khoản demo:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Ứng viên | `candidate@jobboard.vn` | `JobBoard@123` |
| Nhà tuyển dụng | `employer@jobboard.vn` | `JobBoard@123` |

Access token và refresh token chỉ được giữ trong cookie `HttpOnly`, không đưa
vào `localStorage`. Các thao tác client đi qua `/api/backend/*`; route proxy mới
gắn bearer token khi gọi BE, tự xoay phiên khi access token hết hạn và thử lại
request đúng một lần. Những request ghi từ origin khác bị từ chối.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm run build
```

## Phạm vi hiện tại

- Trang chủ responsive với tìm kiếm nhanh, lĩnh vực nổi bật và danh sách việc
  làm tuyển chọn.
- Trang `/viec-lam` hỗ trợ tìm theo từ khóa/địa điểm, lọc lĩnh vực, cấp bậc,
  mức lương, sắp xếp và phân trang trên client.
- Trang `/viec-lam/[id]` hiển thị mô tả, yêu cầu, quyền lợi, tổng quan, việc
  liên quan và gửi đơn ứng tuyển thật tới backend.
- Không gian ứng viên được bảo vệ theo role, đọc lịch sử/trạng thái ứng tuyển và
  cập nhật hồ sơ, kỹ năng, khoảng lương mong muốn qua API.
- Dashboard nhà tuyển dụng gọi API để tạo/đăng/đóng tin và cập nhật trạng thái
  ứng viên; thay đổi được giữ trong phiên chạy backend.
- Trang đăng nhập gọi API JWT thật, hỗ trợ redirect an toàn, refresh token xoay
  vòng, cookie `HttpOnly` và đăng xuất có thu hồi phiên phía server.
- Trang `/dang-ky` tạo tài khoản ứng viên thật, kiểm tra xác nhận mật khẩu, tự
  đăng nhập và chuyển thẳng tới hồ sơ mới sau khi đăng ký thành công.
- Component dùng chung cho header, footer, thẻ việc làm và icon.
- API client tập trung tại `src/lib/api.ts`, chịu trách nhiệm mapping enum và
  contract C# sang model hiển thị TypeScript. `src/lib/server-auth.ts` bảo vệ
  Server Component và không để access token đi xuống component phía trình duyệt.
