import { NextResponse } from "next/server";
import {
  getSession,
  updateSession,
  decrypt,
  verifyAuth,
} from "@/app/utils/lib";

export async function middleware(request) {
  console.log("middleware ran successfully");

  const token = request.cookies.get("session")?.value;
  console.log("token", token);

  const verifiedToken =
    token &&
    (await decrypt(token).catch((err) => {
      console.log(err);
    }));

  //   if (request.nextUrl.pathname.startsWith("/signin") && !verifiedToken) {
  //     return;
  //   }

  //   if (request.url.includes("/signin") && verifiedToken) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }

  if (
    verifiedToken &&
    verifiedToken?.resultObj?.memberType === "ultrashark" &&
    !request.nextUrl.pathname.startsWith("/dashboard/ultrashark")
  ) {
    return NextResponse.redirect(new URL("/dashboard/ultrashark", request.url));
  }

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
