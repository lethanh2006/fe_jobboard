import "server-only";

/**
 * Frontend gọi BE từ server nên BE chỉ thấy địa chỉ của máy chủ này. Chuyển tiếp X-Forwarded-For
 * (Next tự điền từ socket khi không có reverse proxy phía trước) để BE giới hạn tần suất theo từng
 * người dùng chứ không theo cả frontend; BE chỉ tin header này khi TRUST_PROXY cho phép.
 */
export function clientForwardingHeaders(request: Request): Record<string, string> {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor ? { "X-Forwarded-For": forwardedFor } : {};
}
