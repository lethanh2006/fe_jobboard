/**
 * Chuẩn hóa chuỗi để so khớp không phân biệt hoa thường và dấu tiếng Việt
 * (giống `foldText` của backend). Chỉ dùng cho dữ liệu dự phòng khi API không khả dụng.
 */
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
