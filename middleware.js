import { NextResponse } from "next/server";
import { getSession, updateSession, decrypt } from "@/app/utils/lib";

async function getCurrentUser() {
  const session = await getSession();
  console.log("session", session);
  return session;
}

export async function middleware(request) {
  console.log("middleware ran successfully");

  let currentUser = await getCurrentUser();
  console.log("currentUser", currentUser);
  //   if (
  //     currentUser &&
  //     memberType === "ultrashark" &&
  //     !request.nextUrl.pathname.startsWith("/dashboard/ultrashark")
  //   ) {
  //     return NextResponse.redirect(new URL("/dashboard/ultrashark", request.url));
  //   }

  //   if (
  //     currentUser &&
  //     memberType === "member" &&
  //     !request.nextUrl.pathname.startsWith("/dashboard/member")
  //   ) {
  //     return NextResponse.redirect(new URL("/dashboard/member", request.url));
  //   }

  //   if (
  //     currentUser &&
  //     memberType === "pending" &&
  //     !request.nextUrl.pathname.startsWith("/dashboard/member")
  //   ) {
  //     return NextResponse.redirect(new URL("/dashboard/member", request.url));
  //   }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
