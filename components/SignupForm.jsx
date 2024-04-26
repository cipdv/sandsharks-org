"use client";

import React, { useState } from "react";
import { registerNewMember } from "@/app/_actions";
import { useFormState, useFormStatus } from "react-dom";

const initialState = {
  message: "",
  firstName: "",
  lastName: "",
  email: "",
  pronouns: "",
  password: "",
  confirmPassword: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn w-2/5 ">
      {pending ? "Submitting..." : "Sign up"}
    </button>
  );
}

const SignupForm = () => {
  const [state, formAction] = useFormState(registerNewMember, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form
      action={formAction}
      className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-2/5 mx-auto"
    >
      <h1 className="text-2xl font-bold">Become a Sandsharks Member</h1>
      <div className="flex flex-col gap-3 glassmorphism mt-4">
        <h1>Personal information</h1>
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          placeholder="The name you go by"
          required
        />
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          placeholder="Last name"
          required
        />
        <label htmlFor="pronouns">Pronouns</label>
        <select id="pronouns" name="pronouns" defaultValue={""} required>
          <option value="" disabled="disabled">
            Select
          </option>
          <option value="they/them">They/them</option>
          <option value="she/her">She/her</option>
          <option value="he/him">He/him</option>
          <option value="other">Other</option>
        </select>
        <h1>Login information</h1>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Will be used as login"
          required
        />
        {state?.email && (
          <p className="text-red-500 text-lg text-bold">{state?.email}</p>
        )}
        <label htmlFor="password">Password</label>
        <div className="flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="6 characters minimum"
            required
            className="block mr-2 flex-grow"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="ml-2"
          >
            {showPassword ? (
              <img src="/images/icons8-hide-16.png" alt="Hide password" />
            ) : (
              <img src="/images/icons8-eye-16.png" alt="Show password" />
            )}
          </button>
        </div>
        {state?.password && (
          <p className="text-red-500 text-lg text-bold">{state?.password}</p>
        )}
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="flex items-center mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
            required
            className="block mr-2 flex-grow"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="ml-2"
          >
            {showConfirmPassword ? (
              <img src="/images/icons8-hide-16.png" alt="Hide password" />
            ) : (
              <img src="/images/icons8-eye-16.png" alt="Show password" />
            )}
          </button>
        </div>
        {state?.confirmPassword && (
          <p className="text-red-500 text-lg text-bold">
            {state?.confirmPassword}
          </p>
        )}
        {/* <div>
          <input type="checkbox" name="newToBeach" id="newToBeach" />
          <label className="ml-2" htmlFor="newToBeach">
            I'm new to beach volleyball
          </label>
        </div> */}
        <p className="text-red-500 text-lg text-bold">{state?.message}</p>
        <SubmitButton />
      </div>
    </form>
  );
};

export default SignupForm;

// import { registerNewMember } from "@/app/actions";
// import { useFormState, useFormStatus } from "react-dom";

// const initialState = {
//   message: "",
//   firstName: "",
//   preferredName: "",
//   lastName: "",
//   email: "",
//   pronouns: "",
//   password: "",
//   confirmPassword: "",
//   emailNotifications: undefined,
//   profilePublic: undefined,
// };

// function SubmitButton() {
//   const { pending } = useFormStatus();

//   return (
//     <button type="submit" aria-disabled={pending} className="btn w-2/5 ">
//       {pending ? "Submitting..." : "Sign up"}
//     </button>
//   );
// }

// const SignupForm = () => {
//   const [state, formAction] = useFormState(registerNewMember, initialState);

//   //how do I clear this form after submission?

//   return (
//     <form
//       action={formAction}
//       className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-3/5 mx-auto"
//     >
//       <h1 className="text-2xl font-bold">Become a Sandsharks Member</h1>
//       <div className="flex flex-col gap-3 glassmorphism mt-4">
//         <h1>Personal information</h1>
//         <label htmlFor="firstName">First Name</label>
//         <input
//           type="text"
//           id="firstName"
//           name="firstName"
//           placeholder="Your legal first name"
//           required
//         />

//         <label htmlFor="preferredName">Preferred Name</label>
//         <input
//           type="text"
//           id="preferredName"
//           name="preferredName"
//           placeholder="This is the name other members will see on the website"
//         />
//         {/* {errors.firstName && <p className="text-red-500">{errors?.firstName?.message}</p>} */}
//         <label htmlFor="lastName">Last Name</label>
//         <input
//           type="text"
//           id="lastName"
//           name="lastName"
//           placeholder="Your legal last name"
//           required
//         />
//         {/* {errors.lastName && <p className="text-red-500">{errors?.lastName?.message}</p>} */}

//         <label htmlFor="pronouns">Pronouns</label>
//         <select id="pronouns" name="pronouns" defaultValue={""} required>
//           <option value="" disabled="disabled">
//             Select
//           </option>
//           <option value="they/them">They/them</option>
//           <option value="she/her">She/her</option>
//           <option value="he/him">He/him</option>
//           <option value="other">Other</option>
//         </select>
//         <div className="flex items-center">
//           <input type="checkbox" name="profilePublic" />
//           <label className="ml-2">
//             Check here if you are comfortable with your preferred name and
//             pronouns being visible in our members section
//           </label>
//         </div>
//         <h1>Login information</h1>
//         {/* {errors.pronouns && <p className="text-red-500">{errors?.pronouns?.message}</p>} */}
//         <label htmlFor="email">Email</label>
//         <input
//           type="email"
//           id="email"
//           name="email"
//           placeholder="This email will be your login as well as for email updates if you opt in"
//           required
//         />
//         {state?.email && (
//           <p className="text-red-500 text-lg text-bold">{state?.email}</p>
//         )}
//         <div className="flex items-center">
//           <input type="checkbox" name="emailNotifications" />
//           <label className="ml-2">
//             Check here if you want to receive email notifications when updates
//             are posted
//           </label>
//         </div>
//         <label htmlFor="password">Password</label>
//         <input
//           type="password"
//           id="password"
//           name="password"
//           placeholder="Must be at least 6 characters long"
//           required
//         />
//         {state?.password && (
//           <p className="text-red-500 text-lg text-bold">{state?.password}</p>
//         )}
//         <label htmlFor="password">Confirm Password</label>
//         <input
//           type="password"
//           id="confirmPassword"
//           name="confirmPassword"
//           placeholder="Must match the password above"
//           required
//         />
//         {state?.confirmPassword && (
//           <p className="text-red-500 text-lg text-bold">
//             {state?.confirmPassword}
//           </p>
//         )}
//         {/* )} */}
//         {/* <p aria-live="polite" className="sr-only" role="status">
//                         {state?.message}
//                     </p> */}
//         <p className="text-red-500 text-lg text-bold">{state?.message}</p>
//         <SubmitButton />
//       </div>
//     </form>
//   );
// };

// export default SignupForm;
