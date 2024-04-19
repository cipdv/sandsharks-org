"use client";
import { useFormState, useFormStatus } from "react-dom";
import { sendPasswordReset } from "@/app/_actions";
import Link from "next/link";

const initialState = {
  message: "",
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn mt-4">
      {pending ? "Submitting..." : "Send Reset Email"}
    </button>
  );
}

const passwordResetPage = () => {
  const [state, formAction] = useFormState(sendPasswordReset, initialState);
  return (
    <div>
      <form
        action={formAction}
        className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-3/5 mx-auto"
      >
        <label>Enter the email you registered with:</label>
        <input
          type="email"
          placeholder="Email"
          name="email"
          required
          className="block mt-4 mb-4"
        />
        {state?.message ? (
          <>
            <h1 className="text-red-500 ">{state?.message} </h1>
            <h1>
              <Link href="/signin">Click here to sign in.</Link>
            </h1>
          </>
        ) : (
          <>
            {state?.error && <h1 className="text-red-500 ">{state?.error} </h1>}
            <SubmitButton />
          </>
        )}
      </form>
    </div>
  );
};

export default passwordResetPage;
