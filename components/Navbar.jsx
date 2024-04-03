import Link from "next/link";
import { getSession, logout } from "@/lib/auth";
import { redirect } from "next/navigation";

const Navbar = async () => {
  const session = await getSession();

  return (
    <div className="flex justify-between items-center pt-4 pb-4 mb-14 ">
      <Link href="/">
        <h1>Toronto Sandsharks Beach Volleyball Club</h1>
      </Link>
      {session ? (
        <form
          action={async () => {
            "use server";
            await logout();
            redirect("/");
          }}
        >
          <button type="submit" className="btn">
            Sign out
          </button>
        </form>
      ) : (
        <Link href="/signin">
          <button className="btn">Sign In</button>
        </Link>
      )}
    </div>
  );
};

export default Navbar;
