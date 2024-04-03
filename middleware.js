import { NextResponse } from "next/server";
import { getSession, updateSession, decrypt } from "@/app/utils/lib";

export async function middleware(request) {
  console.log("middleware ran successfully");

  let currentUser = await getSession(request);
  console.log("currentUser", currentUser);

  //   const memberType = currentUserObj?.resultObj?.memberType;

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
