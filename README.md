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
npm test
npm run build
```

`npm test` chạy bằng bộ chạy test có sẵn của Node (không thêm dependency) cho các hàm bảo mật như kiểm tra origin.

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
- Ứng viên lưu/bỏ lưu việc làm ngay trên thẻ ở danh sách và trang chi tiết (khách được dẫn tới đăng nhập
  rồi quay lại); trang `/ung-vien/viec-lam-da-luu` liệt kê tin đã lưu, báo rõ tin đã đóng/hết hạn/không còn
  công khai và luôn cho bỏ lưu. Trạng thái lưu của cả trang kết quả lấy bằng một request.
- Không gian ứng viên được bảo vệ theo role: lịch sử/trạng thái ứng tuyển, mức
  hoàn thiện hồ sơ, gợi ý việc làm theo độ phù hợp, và cập nhật hồ sơ, kỹ năng
  (nhập tự do), khoảng lương mong muốn qua API.
- CV ứng viên: trang `/ung-vien/ho-so` tải lên, thay hoặc xóa một CV (PDF, DOC, DOCX, tối đa
  5 MB; kiểm tra phía trình duyệt rồi BE kiểm tra lại nội dung tệp). Trang chi tiết việc làm cho
  biết đơn sẽ đính kèm CV nào hoặc nhắc tải CV; CV được chốt vào đơn lúc ứng tuyển nên đổi/xóa CV
  sau đó không ảnh hưởng đơn cũ. Nhà tuyển dụng tải CV ngay trong ngăn hồ sơ ứng viên, chỉ với đơn
  gửi tới công ty của mình.
- Dashboard nhà tuyển dụng: soạn/sửa tin đầy đủ (lĩnh vực, cấp bậc, hình thức,
  lương, hạn nộp, mô tả/yêu cầu/quyền lợi, kỹ năng), đăng/đóng tin, lọc và sắp
  xếp ứng viên theo độ phù hợp, xem hồ sơ ứng viên trong ngăn bên và đổi trạng
  thái đơn.
- Trang đăng nhập gọi API JWT thật, hỗ trợ redirect an toàn, refresh token xoay
  vòng, cookie `HttpOnly` và đăng xuất có thu hồi phiên phía server.
- Giới hạn tần suất: các route đăng nhập/đăng ký/quên và đặt lại mật khẩu và proxy `/api/backend/*` chuyển tiếp
  `X-Forwarded-For` của người dùng để BE đếm theo từng client thay vì theo máy chủ frontend (BE chỉ tin header này khi
  `TRUST_PROXY` cho phép). Lỗi 429 của BE (quá nhiều lần thử, đăng nhập sai nhiều lần) hiển thị nguyên thông báo tiếng
  Việt kèm thời gian chờ trong các biểu mẫu.
- Trang `/dang-ky/nha-tuyen-dung` tạo công ty cùng tài khoản nhà tuyển dụng; trang
  `/nha-tuyen-dung/cong-ty` sửa hồ sơ công ty (đổi tên sẽ làm mới phiên đăng nhập)
  và `/cong-ty/[id]` là trang công khai liệt kê các vị trí đang tuyển. Menu đầu trang
  hiển thị theo vai trò.
- Trang `/quan-tri` (chỉ quản trị viên): tổng quan số liệu, danh sách tin/công ty/tài
  khoản có lọc và phân trang, gỡ/khôi phục tin (bắt buộc nhập lý do), khóa/mở khóa
  công ty và tài khoản, và nhật ký thao tác. Nhà tuyển dụng thấy lý do khi tin bị gỡ.
- Trang `/thong-bao` cho mọi tài khoản đã đăng nhập: danh sách mới nhất trước, phân
  trang 20 mục, lọc chưa đọc, đánh dấu từng mục hoặc tất cả đã đọc. Mở thông báo sẽ
  đánh dấu đã đọc và chuyển đến việc làm, đơn ứng tuyển hoặc màn hình quản lý;
  thông báo đơn mới mở thẳng hồ sơ ứng viên của đúng công ty.
- Chuông thông báo trên cả desktop/mobile hiển thị số chưa đọc, cập nhật mỗi 60
  giây khi tab đang hiển thị, khi quay lại cửa sổ và sau thao tác đánh dấu đã đọc.
  Khi tải lỗi, hộp thông báo hiển thị nút thử lại; không thay bằng dữ liệu demo.
- Trang `/dang-ky` tạo tài khoản ứng viên thật, kiểm tra xác nhận mật khẩu, tự
  đăng nhập và chuyển thẳng tới hồ sơ mới sau khi đăng ký thành công.
- Trang `/tai-khoan/doi-mat-khau` xác minh mật khẩu hiện tại, áp dụng chính sách
  mật khẩu mạnh, thu hồi các phiên cũ và yêu cầu đăng nhập lại sau khi đổi.
- Quên mật khẩu: `/quen-mat-khau` nhận email và luôn báo "đã gửi" dù email có đăng ký hay không (BE không
  tiết lộ tài khoản nào tồn tại), có nút gửi lại sau 60 giây. Liên kết trong email mở `/dat-lai-mat-khau?token=...`
  để chọn mật khẩu mới; liên kết sai, đã dùng hoặc hết hạn hiện màn hình "đã hết hiệu lực" kèm đường yêu cầu liên
  kết mới. Trang đặt lại đặt `referrer: no-referrer` và `noindex` vì token nằm trên URL; thành công thì xóa cookie phiên
  cũ và chuyển về đăng nhập. Khi chạy local với `EMAIL_PROVIDER=Log`, liên kết được in trong log của BE.
- Component dùng chung cho header, footer, thẻ việc làm và icon.
- API client tập trung tại `src/lib/api.ts`, chịu trách nhiệm mapping enum và
  contract C# sang model hiển thị TypeScript. `src/lib/server-auth.ts` bảo vệ
  Server Component và không để access token đi xuống component phía trình duyệt.
