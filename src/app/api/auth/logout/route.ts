import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/server-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(authCookieName);
  return response;
}
