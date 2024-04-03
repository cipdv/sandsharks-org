'use client'

import { updateMemberProfile } from '@/app/actions';
import { useFormState, useFormStatus } from "react-dom";

const initialState = {
    message: '',
    firstName: '',
    preferredName: '',
    lastName: '',
    email: '',
    pronouns: '',
    emailNotifications: undefined,
    aboutMe: '',
    profilePic: '',
}

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
        <button type="submit" aria-disabled={pending} className='btn w-2/5 '>
            {pending ? 'Submitting...' : 'Update Profile'}
        </button>
    );
}

const MemberProfile = ({user}) => {

    const [state, formAction] = useFormState(updateMemberProfile, initialState);

    //how do I clear this form after submission?

    return (
        <form action={formAction} className="flex flex-col gap-4 bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-3/5 mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col gap-3 glassmorphism mt-4 w-full lg:w-1/2">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text" 
                        id="firstName"
                        name="firstName"
                        placeholder='Your legal first name'
                        required
                        defaultValue={user?.firstName}
                    />
                    
                    <label htmlFor="preferredName">Preferred Name</label>
                    <input
                        type="text"
                        id="preferredName"
                        name="preferredName"
                        placeholder='This is the name other members will see on the website'
                        defaultValue={user?.preferredName}
                    />
                    {/* {errors.firstName && <p className="text-red-500">{errors?.firstName?.message}</p>} */}
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder='Your legal last name'
                        required
                        defaultValue={user?.lastName}
                    />
                    {/* {errors.lastName && <p className="text-red-500">{errors?.lastName?.message}</p>} */}
                    
                    <label htmlFor="pronouns">Pronouns</label>
                    <select
                        id="pronouns"
                        name="pronouns"
                        required
                        defaultValue={user?.pronouns}
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
                        defaultValue={user?.email}
                    />
                    {state?.email && <p className="text-red-500">{state?.email}</p>}
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            name="emailNotifications" 
                            defaultChecked={user?.emailNotifications}
                        />
                        <label className="ml-2">Check here if you want to receive email notifications when updates are posted</label>
                    </div>       
                        {/* )} */}
                        {/* <p aria-live="polite" className="sr-only" role="status">
                            {state?.message}
                        </p> */}    
                </div>
                <div className="flex flex-col gap-3 glassmorphism mt-4 w-full lg:w-1/2">
            <label htmlFor="aboutMe">About Me</label>
            <textarea
                id="aboutMe"
                name="aboutMe"
                rows="10"
                cols="30"
                placeholder='Tell us something about yourself'
                defaultValue={user?.aboutMe}
            />

            <div>
                <label htmlFor="profilePic">Profile Picture</label>
                <input
                    type="file"
                    id="profilePic"
                    name="profilePic"
                    accept="image/*"
                    
                />
            </div>   
        </div>

            </div>
            <div className="w-full">
                <SubmitButton />
            </div>
        </form>
        )
}


export default MemberProfile