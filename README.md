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

- Trang chủ responsive với tìm kiếm nhanh, lĩnh vực đang tuyển (số tin lấy từ
  API) và danh sách việc làm nổi bật.
- Trang `/viec-lam` tìm kiếm ở phía server: từ khóa/địa điểm (không phân biệt
  dấu tiếng Việt), lĩnh vực, cấp bậc, mức lương, sắp xếp và phân trang đều nằm
  trên URL nên chia sẻ và quay lại được. Ứng viên đăng nhập thấy độ phù hợp
  trên từng thẻ. Khi API không khả dụng, danh sách lọc trên dữ liệu mẫu.
- Trang `/viec-lam/[id]` hiển thị mô tả, yêu cầu, quyền lợi, tổng quan, việc
  tương tự, độ phù hợp (kỹ năng khớp/thiếu) của ứng viên, trạng thái đã đóng/hết
  hạn/đã ứng tuyển và gửi đơn ứng tuyển thật tới backend.
- Không gian ứng viên được bảo vệ theo role: lịch sử/trạng thái ứng tuyển, mức
  hoàn thiện hồ sơ, gợi ý việc làm theo độ phù hợp, và cập nhật hồ sơ, kỹ năng
  (nhập tự do), khoảng lương mong muốn qua API.
- Dashboard nhà tuyển dụng: soạn/sửa tin đầy đủ (lĩnh vực, cấp bậc, hình thức,
  lương, hạn nộp, mô tả/yêu cầu/quyền lợi, kỹ năng), đăng/đóng tin, lọc và sắp
  xếp ứng viên theo độ phù hợp, xem hồ sơ ứng viên trong ngăn bên và đổi trạng
  thái đơn.
- Trang đăng nhập gọi API JWT thật, hỗ trợ redirect an toàn, refresh token xoay
  vòng, cookie `HttpOnly` và đăng xuất có thu hồi phiên phía server.
- Trang `/dang-ky/nha-tuyen-dung` tạo công ty cùng tài khoản nhà tuyển dụng; trang
  `/nha-tuyen-dung/cong-ty` sửa hồ sơ công ty (đổi tên sẽ làm mới phiên đăng nhập)
  và `/cong-ty/[id]` là trang công khai liệt kê các vị trí đang tuyển. Menu đầu trang
  hiển thị theo vai trò.
- Trang `/dang-ky` tạo tài khoản ứng viên thật, kiểm tra xác nhận mật khẩu, tự
  đăng nhập và chuyển thẳng tới hồ sơ mới sau khi đăng ký thành công.
- Trang `/tai-khoan/doi-mat-khau` xác minh mật khẩu hiện tại, áp dụng chính sách
  mật khẩu mạnh, thu hồi các phiên cũ và yêu cầu đăng nhập lại sau khi đổi.
- Component dùng chung cho header, footer, thẻ việc làm và icon.
- API client tập trung tại `src/lib/api.ts`, chịu trách nhiệm mapping enum và
  contract C# sang model hiển thị TypeScript. `src/lib/server-auth.ts` bảo vệ
  Server Component và không để access token đi xuống component phía trình duyệt.
