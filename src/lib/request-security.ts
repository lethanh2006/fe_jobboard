export function isTrustedMutation(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  return (!origin || origin === requestUrl.origin) &&
    (!fetchSite || fetchSite === "same-origin" || fetchSite === "none");
}
