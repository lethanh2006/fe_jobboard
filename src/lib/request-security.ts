/**
 * Chặn CSRF cho yêu cầu ghi (POST/PUT/DELETE...): chỉ nhận yêu cầu phát ra từ chính trang web này.
 *
 * Origin được so với host mà trình duyệt thực sự gọi tới (X-Forwarded-Host rồi Host), KHÔNG dùng
 * `request.url`: ở bản standalone/Docker `request.url` mang địa chỉ bind của server (vd 0.0.0.0:3000)
 * nên mọi yêu cầu từ trình duyệt đều bị từ chối. Chỉ so host, không so scheme, vì reverse proxy kết
 * thúc TLS có thể không báo giao thức; Sec-Fetch-Site và cookie SameSite=Lax vẫn chặn yêu cầu chéo site.
 */
export function isTrustedMutation(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === requestHost(request);
  } catch {
    return false;
  }
}

function requestHost(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return forwardedHost || request.headers.get("host") || new URL(request.url).host;
}
