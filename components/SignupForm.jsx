'use client'

import { registerNewMember } from '@/app/actions';
import { useFormState, useFormStatus } from "react-dom";

const initialState = {
    message: '',
    firstName: '',
    preferredName: '',
    lastName: '',
    email: '',
    pronouns: '',
    password: '',
    confirmPassword: '',
    emailNotifications: undefined,
}

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <button type="submit" aria-disabled={pending}>
        {pending ? 'Submitting...' : 'Sign up'}
      </button>
    );
}

const SignupForm = () => {

    const [state, formAction] = useFormState(registerNewMember, initialState);

    //how do I clear this form after submission?

    return (
        <form action={formAction} className="bg-blue-100 p-4 rounded-md">  
            <div className="flex flex-col gap-3 glassmorphism">
                <label htmlFor="firstName">First Name</label>
                <input
                    type="text" 
                    id="firstName"
                    name="firstName"
                    placeholder='Your legal first name'
                    required
                />
                
                <label htmlFor="preferredName">Preferred Name</label>
                <input
                    type="text"
                    id="preferredName"
                    name="preferredName"
                    placeholder='This is the name other members will see on the website'
                />
                {/* {errors.firstName && <p className="text-red-500">{errors?.firstName?.message}</p>} */}
                <label htmlFor="lastName">Last Name</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder='Your legal last name'
                    required
                />
                {/* {errors.lastName && <p className="text-red-500">{errors?.lastName?.message}</p>} */}
                
                <label htmlFor="pronouns">Pronouns</label>
                <select
                    id="pronouns"
                    name="pronouns"
                    defaultValue={""}
                    required
                >
                    <option value="" disabled="disabled">Select</option>
                    <option value="they/them">They/them</option>
                    <option value="she/her">She/her</option>
                    <option value="he/him">He/him</option>
                    <option value="other">Other</option>
                </select>
                {/* {errors.pronouns && <p className="text-red-500">{errors?.pronouns?.message}</p>} */}
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder='This email will be your login as well as for email updates if you opt in'
                    required
                />
                {state?.email && <p className="text-red-500">{state?.email}</p>}
                <div className="flex items-center">
                    <input type="checkbox" name="emailNotifications" />
                    <label className="ml-2">Check here if you want to receive email notifications when updates are posted</label>
                </div>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder='Must be at least 6 characters long'
                    required
                />
                {/* {errors.password && <p className="text-red-500">{errors?.password?.message}</p>} */}
                <label htmlFor="password">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder='Must match the password above'    
                    required           
                />
                {state?.confirmPassword && <p className="text-red-500">{state?.confirmPassword}</p>}        
                    {/* )} */}
                    {/* <p aria-live="polite" className="sr-only" role="status">
                        {state?.message}
                    </p> */}
                    <h1>{state?.message}</h1>
                    <SubmitButton />
                </div>
            </form>
        )
}


export default SignupForm