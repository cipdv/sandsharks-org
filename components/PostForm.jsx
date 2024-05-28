"use client";

import { createNewPost } from "@/app/_actions";
import { useFormState, useFormStatus } from "react-dom";

const initialState = {
  message: "",
  title: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn">
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

const PostForm = () => {
  const [state, formAction] = useFormState(createNewPost, initialState);

  //how do I clear this form after submission?

  return (
    <form action={formAction} className="bg-blue-100 p-4 rounded-md">
      <div className="flex flex-col gap-3 glassmorphism">
        <h1 className="text-2xl font-bold">Create a new post</h1>
        <label>Title</label>
        <input type="text" name="title" />
        <h1>{state?.title}</h1>
        <label>Message</label>
        <textarea className="min-h-[200px] w-full" name="message" />

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-2 w-full">
          <div className="sm:w-4/12">
            <label>Date</label>
            <input type="date" name="date" className="w-full" />
          </div>
          <div className="sm:w-4/12">
            <label>Start Time</label>
            <input type="time" name="startTime" className="w-full" />
          </div>
          <div className="sm:w-4/12">
            <label>End Time</label>
            <input type="time" name="endTime" className="w-full" />
          </div>
        </div>
        <div className="mt-4">
          <input type="checkbox" name="includeButton" />
          <label className="ml-2">Include Button</label>
        </div>
        <div className="mt-4">
          <label>Button option for yes:</label>
          <input type="text" name="buttonOption1" />
        </div>
        <div className="mt-4">
          <label>Button option for no:</label>
          <input type="text" name="buttonOption2" />
        </div>
        <div className="bg-blue-300 rounded-lg p-4 mt-4">
          <div>
            <input type="checkbox" name="beginnerClinicOffered" />
            <label className="ml-2">Beginner Clinic Offered</label>
          </div>
          <div>
            <label>Beginner Clinic Message</label>
            <textarea name="beginnerClinicMessage" className="w-full" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-2 w-full">
            <div className="sm:w-1/2">
              <label>Beginner Clinic Start Time</label>
              <input
                type="time"
                name="beginnerClinicStartTime"
                className="w-full"
              />
            </div>
            <div className="sm:w-1/2">
              <label>Beginner Clinic End Time</label>
              <input
                type="time"
                name="beginnerClinicEndTime"
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label>Court number:</label>
            <input type="text" name="beginnerClinicCourts" />
          </div>
        </div>
        {/* )} */}
        {/* <p aria-live="polite" className="sr-only" role="status">
                        {state?.message}
                    </p> */}
        <h1>{state?.message}</h1>
        <SubmitButton />
      </div>
    </form>
  );
};

export default PostForm;
