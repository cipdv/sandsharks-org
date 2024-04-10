"use client";

import { login } from "@/app/lib/auth";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

const initialState = {
  email: "",
  password: "",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn mt-4">
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

const SignInForm = () => {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form
      action={formAction}
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
      {state?.email && (
        <p className="text-red-500 text-lg text-bold">{state?.email}</p>
      )}
      {state?.password && (
        <p className="text-red-500 text-lg text-bold">{state?.password}</p>
      )}
      {state?.message && (
        <p className="text-red-500 text-lg text-bold">{state?.message}</p>
      )}
      <SubmitButton />
      <h2 className="mt-4">
        <Link href="/signup">
          Haven't signed up yet? Click here to sign up.
        </Link>
      </h2>
    </form>
  );
};

export default SignInForm;

// "use client";

// import { login } from "@/app/lib/auth";
// import Link from "next/link";

// const SignInForm = () => {
//   return (
//     <div>
//       <form
//         action={async (formData) => {
//           "use server";
//           await login(formData);
//         }}
//         className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-3/5 mx-auto"
//       >
//         <input
//           type="email"
//           placeholder="Email"
//           name="email"
//           required
//           className="block mb-4"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           name="password"
//           required
//           className="block"
//         />
//         {/* <input type="hidden" name="csrfToken" value={csrfToken} /> */}
//         <button type="submit" className="btn mt-4">
//           Sign in
//         </button>
//         <h2 className="mt-4">
//           <Link href="/signup">
//             Haven't signed up yet? Click here to sign up.
//           </Link>
//         </h2>
//       </form>
//     </div>
//   );
// };

// export default SignInForm;
