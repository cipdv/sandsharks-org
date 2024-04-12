import { updateSession, decrypt } from "@/app/lib/cookieFunctions";
import { NextResponse } from "next/server";

export async function middleware(request) {
  console.log("middleware ran successfully");

  const currentUser = request.cookies.get("session")?.value;

  let currentUserObj = null;
  if (currentUser) {
    currentUserObj = await decrypt(currentUser);
  }

  const memberType = currentUserObj?.resultObj?.memberType;

  if (
    !currentUser &&
    !["/", "/signin", "/signup", "/password-reset"].includes(
      request.nextUrl.pathname
    )
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const dashboardPaths = {
    ultrashark: "/dashboard/ultrashark",
    supershark: "/dashboard/ultrashark",
    member: "/dashboard/member",
    pending: "/dashboard/member",
  };

  if (
    currentUser &&
    !request.nextUrl.pathname.startsWith(dashboardPaths[memberType])
  ) {
    return NextResponse.redirect(
      new URL(dashboardPaths[memberType], request.url)
    );
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

//good to know: middleware can get ip address from request.headers.get('x-real-ip')
