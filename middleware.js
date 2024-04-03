import { NextResponse } from "next/server";
import { updateSession } from "@/app/lib/auth";

export async function middleware(request) {
  console.log("middleware ran successfully");

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
