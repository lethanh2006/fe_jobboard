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
`.env.example` để bạn dùng khi tự triển khai API client.

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
- Trang `/viec-lam/[id]` hiển thị mô tả, yêu cầu, quyền lợi, tổng quan và các
  công việc liên quan; các route chi tiết được prerender bằng static params.
- Không gian ứng viên gồm lịch sử/trạng thái ứng tuyển và form cập nhật hồ sơ,
  kỹ năng, khoảng lương mong muốn.
- Dashboard nhà tuyển dụng cho phép tạo bản nháp, đóng tin và cập nhật trạng
  thái ứng viên ngay trên bản demo.
- Trang đăng nhập responsive đã chuẩn bị luồng redirect; thao tác xác thực sẽ
  được nối với Identity/JWT khi backend có endpoint.
- Component dùng chung cho header, footer, thẻ việc làm và icon.
- Kiểu dữ liệu Job/JobApplication cùng dữ liệu demo tách khỏi component. Dữ liệu
  demo sẽ được thay bởi API client khi backend mở các HTTP endpoint tương ứng.
