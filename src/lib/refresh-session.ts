import "server-only";

import { cookies } from "next/headers";
import { backendApiUrl } from "@/lib/api-config";
import { refreshTokenCookieName } from "@/lib/auth-cookies";
import type { LoginResponse } from "@/types/auth";

const refreshReuseWindowMs = 5_000;
const refreshRequests = new Map<
  string,
  { expiresAt: number; promise: Promise<LoginResponse | null> }
>();

export async function refreshSession(): Promise<LoginResponse | null> {
  const refreshToken = (await cookies()).get(refreshTokenCookieName)?.value;
  if (!refreshToken) {
    return null;
  }

  const now = Date.now();
  const currentRequest = refreshRequests.get(refreshToken);
  if (currentRequest && currentRequest.expiresAt > now) {
    return currentRequest.promise;
  }

  for (const [token, request] of refreshRequests) {
    if (request.expiresAt <= now) {
      refreshRequests.delete(token);
    }
  }

  const promise = requestRefresh(refreshToken);
  refreshRequests.set(refreshToken, {
    expiresAt: now + refreshReuseWindowMs,
    promise,
  });
  return promise;
}

async function requestRefresh(refreshToken: string): Promise<LoginResponse | null> {
  try {
    const response = await fetch(`${backendApiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    return response.ok ? (await response.json()) as LoginResponse : null;
  } catch {
    return null;
  }
}
