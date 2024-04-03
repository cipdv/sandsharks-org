import { NextResponse } from "next/server";
import { updateSession } from "@/lib/auth";

export async function middleware(request) {
  console.log("middleware ran successfully");

  const currentUser = request.cookies.get("session")?.value;

  if (
    currentUser &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !currentUser &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
