import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gói gọn server và chỉ các dependency cần dùng để image Docker nhỏ và khởi động nhanh.
  output: "standalone",
};

export default nextConfig;
