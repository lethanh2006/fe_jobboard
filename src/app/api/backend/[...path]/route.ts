import { cookies } from "next/headers";
import { backendApiUrl } from "@/lib/api-config";
import { authCookieName } from "@/lib/server-auth";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetPath = path.map(encodeURIComponent).join("/");
  const targetUrl = `${backendApiUrl}/${targetPath}${incomingUrl.search}`;
  const accessToken = (await cookies()).get(authCookieName)?.value;
  const headers = new Headers({ Accept: "application/json" });
  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return Response.json(
      {
        title: "Không thể kết nối",
        detail: "JobBoard API đang tạm thời không khả dụng.",
      },
      { status: 503 },
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
