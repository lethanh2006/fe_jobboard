# JobBoard Frontend

Base frontend dùng Next.js App Router, TypeScript và Tailwind CSS.

## Chạy local

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Ứng dụng chạy tại <http://localhost:3000>. Biến
`NEXT_PUBLIC_API_URL=http://localhost:5000/api` đã được chuẩn bị trong
`.env.example` để kết nối với JobBoard API.

Chạy backend tại cổng `5000` trước frontend để dùng đầy đủ tìm kiếm, ứng tuyển
và dashboard. Nếu backend tạm thời không hoạt động, các trang đọc sẽ tự dùng dữ
liệu demo; các thao tác ghi sẽ hiển thị lỗi kết nối rõ ràng.

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
- Không gian ứng viên gồm lịch sử/trạng thái ứng tuyển và form cập nhật hồ sơ,
  kỹ năng, khoảng lương mong muốn.
- Dashboard nhà tuyển dụng gọi API để tạo/đăng/đóng tin và cập nhật trạng thái
  ứng viên; thay đổi được giữ trong phiên chạy backend.
- Trang đăng nhập responsive đã chuẩn bị luồng redirect; thao tác xác thực sẽ
  được nối với Identity/JWT khi backend có endpoint.
- Component dùng chung cho header, footer, thẻ việc làm và icon.
- API client tập trung tại `src/lib/api.ts`, chịu trách nhiệm mapping enum và
  contract C# sang model hiển thị TypeScript. Component không phụ thuộc trực
  tiếp cấu trúc JSON của backend.
