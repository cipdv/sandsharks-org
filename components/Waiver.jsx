'use client'

import { confirmWaiver } from "@/app/actions"
import { useFormState, useFormStatus } from "react-dom";

const initialState = {
    message: '',
}

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <button className="btn mt-4" type="submit" aria-disabled={pending}>
        {pending ? 'Submitting...' : 'I agree'}
      </button>
    );
  }

const Waiver = () => {

    const [state, formAction] = useFormState(confirmWaiver, initialState);


    return (
        <form action={formAction} className="bg-blue-100 p-4 rounded-md">  
            {state?.message && <h1>{state?.message}</h1>}
            <h1 className="mb-8 text-3xl font-bold">To continue, please read and agree to the liability waiver and code of conduct:</h1>
            <div>
                <h2 className="mt-4 font-bold">Code of Conduct</h2>
                <p className="mt-4">
                    Sandsharks is organized to be fun, safe, and welcoming to all LGBTQ+ people. We will not tolerate discrimination, 
                    hate speech, verbal or physical harrassment of any kind. Our goal is to have fun in a friendly competitive setting. 
                </p>
                <br />
                <p>
                    To be a Sandshark, read this oath and keep it in mind while playing with us:
                </p>
                <ul className="mt-4 font-bold ml-4 space-y-2">
                    <li>I will treat all members of the group with respect and kindness.</li>
                    <li>I will be welcoming to new players of all skill levels and help them in any way that I can to be part of the group.</li>
                    <li>I will be careful with my language and comments to avoid making others feel uncomfortable or unwelcome.</li>
                    <li>I will play to have fun and do my best to keep my cool during games.</li>
                </ul>
                <br />
                <p>
                    If you feel that someone is making you uncomfortable with their words or actions, you don't need to put up with it; 
                    please let Cip know either in person or by <a href='mailto:info@sandsharks.org' className='text-blue-700 hover:text-blue-500'>email</a>. 
                </p>
            </div>
            <div>
                <h2 className="mt-4 font-bold">Liability Waiver</h2>
                <p className="mt-4">
                    By clicking agree, <b>I hereby release and forever discharge Toronto SandSharks, its players, organizers, and
                    agents, from all liabilities, actions, cause of actions, claims, demands for damages, loss or personal injuries, </b>
                    however so arising and including, but not limited to injuries arising from the negligence of Toronto
                    SandSharks, its players, organizers, and agents which hereto may have been or may hereafter be
                    sustained by me in consequence of my participation.
                </p>
                <br />
                <p>
                    I acknowledge that no warranties or conditions are made, expressed or implied, that activities have been,
                    are, or will be conducted so as to prevent or minimize the risk of personal injury. I acknowledge that I am
                    solely responsible for inspecting and clearing my own court and surrounding area of potential
                    hazards, securing my own belongings, and preventing injury to myself and to others. I acknowledge
                    that Toronto SandSharks makes no representation whatsoever as to the competence or ability of its players
                    to participate in the league activities in a safe manner. 
                </p>
                <br />
                <p>
                    I further acknowledge that I voluntarily assume all
                    risk of personal injury from participation, and that I have
                    taken appropriate measures to make myself aware of all risks involved in the performance of such activities
                    prior to signing this Waiver. I fully understand, having read the above, that the nature and effect of this
                    document is to release Toronto SandSharks, its players, organizers, and agents, from all liability.
                </p>
            </div>
            <SubmitButton />
        </form>
      )
}

export default Waiver