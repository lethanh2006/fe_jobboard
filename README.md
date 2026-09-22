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

Hiện tại chỉ có root layout và trang chủ tối thiểu. Chưa có route, component,
type, API client hay nghiệp vụ JobBoard mẫu.
