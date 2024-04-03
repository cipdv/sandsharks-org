

export async function middleware(request) {
  console.log("middleware ran successfully");
return
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
