"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateMemberProfile } from "@/app/_actions";
import Image from "next/image";

const initialState = {
  message: "",
  firstName: "",
  lastName: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn mt-4">
      {pending ? "Updating..." : "Update profile"}
    </button>
  );
}

const MemberProfile = ({ user }) => {
  const [aboutCount, setAboutCount] = useState(
    user?.about ? user.about.length : 0
  );

  const handleAboutChange = (event) => {
    setAboutCount(event.target.value.length);
  };
  const [state, formAction] = useFormState(updateMemberProfile, initialState);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (user?.profilePic?.url) {
      setSelectedImage(user?.profilePic?.url);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-3/5 mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="flex flex-col gap-3 glassmorphism mt-4 w-full lg:w-1/2">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Your legal first name"
            required
            defaultValue={user?.firstName}
          />
          {/* {errors.firstName && <p className="text-red-500">{errors?.firstName?.message}</p>} */}
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Your legal last name"
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
            <option value="" disabled="disabled">
              Select
            </option>
            <option value="they/them">They/them</option>
            <option value="she/her">She/her</option>
            <option value="he/him">He/him</option>
            <option value="other">Other</option>
          </select>
          {/* {errors.pronouns && <p className="text-red-500">{errors?.pronouns?.message}</p>} */}
          <label htmlFor="email">Email</label>
          <p className="text-sm text-gray-600 mt-[-8px]">
            This email is used for logging in, changing it will change your
            login
          </p>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="This email is used as your login - changing it will change your login"
            required
            defaultValue={user?.email}
          />
        </div>
        <div className="flex flex-col gap-3 glassmorphism mt-4 w-full lg:w-1/2">
          <div className="flex items-center justify-between">
            <label htmlFor="aboutMe" className="mr-2">
              About Me
            </label>
            <p className="text-sm">{500 - aboutCount} characters remaining</p>
          </div>
          <textarea
            id="about"
            name="about"
            rows="10"
            cols="30"
            placeholder="Tell us something about yourself"
            defaultValue={user?.about}
            maxLength="500"
            onChange={handleAboutChange}
            className="p-2"
          />
          <div>
            <label htmlFor="profilePic" className="block">
              Profile Picture
            </label>
            {selectedImage && (
              <Image
                className="mt-4 rounded-md"
                src={selectedImage}
                alt="Selected"
                width={150}
                height={150}
              />
            )}

            {user.profilePic.status === "disapproved" && (
              <h1>
                Your profile photo was disapproved, please read our photo
                guidelines and submit a new photo.
              </h1>
            )}

            {user.profilePic.status === "pending" && (
              <h1>Your profile photo is pending approval.</h1>
            )}

            <input
              type="file"
              id="profilePic"
              name="profilePic"
              accept="image/*"
              onChange={handleImageChange}
              className="block mt-4"
            />
          </div>
        </div>
      </div>
      {state?.message && (
        <p className="text-red-500 text-lg text-bold">{state?.message}</p>
      )}
      <SubmitButton />
    </form>
  );
};

export default MemberProfile;
