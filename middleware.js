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
  
    if (!currentUser && !['/', '/signin', '/signup'].includes(request.nextUrl.pathname)) {       
         return NextResponse.redirect(new URL("/signin", request.url));
    }

    // if (
    //   currentUser &&
    //   memberType === "ultrashark" &&
    //   !request.nextUrl.pathname.startsWith("/dashboard/ultrashark")
    // ) {
    //   return NextResponse.redirect(new URL("/dashboard/ultrashark", request.url));
    // }
  
    // if (
    //   currentUser &&
    //   memberType === "member" &&
    //   !request.nextUrl.pathname.startsWith("/dashboard/member")
    // ) {
    //   return NextResponse.redirect(new URL("/dashboard/member", request.url));
    // }
  
    // if (
    //   currentUser &&
    //   memberType === "pending" &&
    //   !request.nextUrl.pathname.startsWith("/dashboard/member")
    // ) {
    //   return NextResponse.redirect(new URL("/dashboard/member", request.url));
    // }
  
    return await updateSession(request);
  }
  
  export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
  };

//good to know: middleware can get ip address from request.headers.get('x-real-ip')