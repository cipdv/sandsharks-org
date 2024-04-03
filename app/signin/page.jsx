import { login } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const signInPage = () => {
  return (
    <div>
      <form
        action={async (formData) => {
          "use server";
          await login(formData);
          redirect("/dashboard");
        }}
        className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-3/5 mx-auto"
      >
        <input
          type="email"
          placeholder="Email"
          name="email"
          required
          className="block mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
          className="block"
        />
        {/* <input type="hidden" name="csrfToken" value={csrfToken} /> */}
        <button type="submit" className="btn mt-4">
          Sign in
        </button>
        <h2 className="mt-4">
          <Link href="/signup">
            Haven't signed up yet? Click here to sign-up.
          </Link>
        </h2>
      </form>
    </div>
  );
};

export default signInPage;
