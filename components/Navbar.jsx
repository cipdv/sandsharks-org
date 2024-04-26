import Link from "next/link";
import { getSession, logout } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/_actions";

const Navbar = async () => {
  const currentUser = await getSession();

  return (
    <div className="flex justify-between items-center pt-4 pb-4 mb-14 pl-6 pr-6 ">
      <Link href="/">
        <h1>Toronto Sandsharks Beach Volleyball</h1>
      </Link>
      {currentUser ? (
        <>
          {currentUser?.resultObj?.memberType === "ultrashark" && (
            <Link href="/dashboard/ultrashark/members" className="mr-2">
              Members
            </Link>
          )}
          <form
            action={async () => {
              "use server";
              await logout();
              redirect("/");
            }}
          >
            <button type="submit" className="btn whitespace-nowrap">
              Sign out
            </button>
          </form>
        </>
      ) : (
        <Link href="/signin">
          <button className="btn whitespace-nowrap">Sign In</button>
        </Link>
      )}
    </div>
  );
};

export default Navbar;
