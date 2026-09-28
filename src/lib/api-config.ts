const configuredApiUrl =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export const backendApiUrl = configuredApiUrl.replace(/\/$/, "");
