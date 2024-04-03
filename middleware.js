import { NextResponse } from "next/server";
import { updateSession } from "./app/utils/lib";
import { decrypt } from "./app/utils/lib";

export async function middleware(request) {
  console.log("middleware ran successfully");

  const currentUser = request.cookies.get("session")?.value;
  let currentUserObj = null;
  if (currentUser) {
    currentUserObj = await decrypt(currentUser);
  }

  let memberType = currentUserObj?.resultObj?.memberType;

  // if (currentUser && !request.nextUrl.pathname.startsWith('/dashboard')) {
  //     return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  if (
    currentUser &&
    memberType === "ultrashark" &&
    !request.nextUrl.pathname.startsWith("/dashboard/ultrashark")
  ) {
    return NextResponse.redirect(new URL("/dashboard/ultrashark", request.url));
  }

  if (
    currentUser &&
    memberType === "member" &&
    !request.nextUrl.pathname.startsWith("/dashboard/member")
  ) {
    return NextResponse.redirect(new URL("/dashboard/member", request.url));
  }

  if (
    currentUser &&
    memberType === "pending" &&
    !request.nextUrl.pathname.startsWith("/dashboard/member")
  ) {
    return NextResponse.redirect(new URL("/dashboard/member", request.url));
  }

  if (
    !currentUser &&
    !request.nextUrl.pathname.startsWith("/signin") &&
    request.nextUrl.pathname !== "/" &&
    request.nextUrl.pathname !== "/signup"
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
