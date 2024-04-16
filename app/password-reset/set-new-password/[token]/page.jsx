"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { setNewPassword } from "@/app/actions";
import Link from "next/link";

const initialState = {
  message: "",
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn mt-4">
      {pending ? "Submitting..." : "Set new password"}
    </button>
  );
}

const setNewPasswordPage = ({ params }) => {
  const token = params.token;
  const [state, formAction] = useFormState(setNewPassword, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div>
      <form
        action={formAction}
        className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-3/5 mx-auto"
      >
        <input type="hidden" name="token" value={token && token} />
        <label htmlFor="password">New password</label>
        <div className="flex items-center mb-4">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Must be at least 6 characters long"
            required
            className="block mr-2 flex-grow"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="ml-2"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>
        <label htmlFor="password">Confirm new password</label>
        <div className="flex items-center mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="password"
            name="confirmPassword"
            placeholder="Must be at least 6 characters long"
            required
            className="block mr-2 flex-grow"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="ml-2"
          >
            {showConfirmPassword ? "Hide password" : "Show password"}
          </button>
        </div>
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
            {state?.error?.includes(
              "Password reset token is invalid or has expired"
            ) && (
              <h1>
                <Link href="/password-reset">
                  Click here to send a new token.
                </Link>
              </h1>
            )}
            <SubmitButton />
          </>
        )}
      </form>
    </div>
  );
};

export default setNewPasswordPage;
