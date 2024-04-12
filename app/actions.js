"use server";

//database connection
import { dbConnection } from "@/app/lib/db";
//dependencies
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getSession, encrypt } from "@/app/lib/auth";
//zod schemas
import {
  MemberSchema,
  MemberUpdateFormSchema,
} from "@/app/schemas/memberSchema";
import { PostFormSchema } from "@/app/schemas/postFormSchema";

///////////////////////////////////////////////
//-----------------MEMBERS-------------------//
///////////////////////////////////////////////

export const getCurrentUser = async () => {
  const session = await getSession();
  if (session) {
    const _id = new ObjectId(session.resultObj._id);
    const db = await dbConnection();
    const currentUser = await db.collection("members").findOne({ _id });
    delete currentUser?.password;
    return currentUser;
  }
  return null;
};

export async function registerNewMember(prevState, formData) {
  // Convert the form data to an object
  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.emailNotifications = formDataObj.emailNotifications === "on";
  formDataObj.profilePublic = formDataObj.profilePublic === "on";

  // Normalize the email address
  formDataObj.email = formDataObj.email.toLowerCase().trim();

  // Capitalize the first letter of the first name and preferred name
  formDataObj.firstName =
    formDataObj.firstName.charAt(0).toUpperCase() +
    formDataObj.firstName.slice(1);
  formDataObj.preferredName =
    formDataObj.preferredName.charAt(0).toUpperCase() +
    formDataObj.preferredName.slice(1);

  // Validate the form data
  const result = MemberSchema.safeParse(formDataObj);

  if (result.error) {
    // Find the error related to the password length
    const passwordError = result.error.issues.find(
      (issue) =>
        issue.path[0] === "password" &&
        issue.type === "string" &&
        issue.minimum === 6
    );

    const confirmPasswordError = result.error.issues.find(
      (issue) =>
        issue.path[0] === "confirmPassword" &&
        issue.type === "string" &&
        issue.minimum === 6
    );

    // If the error exists, return a custom message
    if (passwordError) {
      return { password: "^ Password must be at least 6 characters long" };
    }

    if (confirmPasswordError) {
      return {
        confirmPassword:
          "^ Passwords must be at least 6 characters long and match",
      };
    }

    const emailError = result.error.issues.find((issue) => {
      return (
        issue.path[0] === "email" &&
        issue.validation === "email" &&
        issue.code === "invalid_string"
      );
    });

    if (emailError) {
      return { email: "^ Please enter a valid email address" };
    }

    if (!result.success) {
      return {
        message:
          "Failed to register: make sure all required fields are completed and try again",
      };
    }
  }

  const {
    firstName,
    lastName,
    preferredName,
    pronouns,
    email,
    emailNotifications,
    password,
    confirmPassword,
    profilePublic,
  } = result.data;

  //check if passwords match
  if (password !== confirmPassword) {
    return { confirmPassword: "^ Passwords do not match" };
  }

  try {
    const db = await dbConnection();

    //check if user already exists
    const memberExists = await db
      .collection("members")
      .findOne({ email: email });

    if (memberExists) {
      return { email: "^ This email is already registered" };
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newMember = {
      firstName,
      lastName,
      preferredName,
      pronouns,
      email,
      emailNotifications,
      memberType: "pending",
      password: hashedPassword,
      createdAt: new Date(),
      profilePublic,
    };

    await db.collection("members").insertOne(newMember);

    //remove password from the object
    let resultObj = { ...newMember };
    delete resultObj.password;

    // Create the session
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    const session = await encrypt({ resultObj, expires });

    // Save the session in a cookie
    cookies().set("session", session, { expires, httpOnly: true });
  } catch (error) {
    console.log(error);
    return {
      message:
        "Failed to register: make sure all required fields are completed and try again",
    };
  }
  revalidatePath("/");
  redirect("/");
}

export async function updateMemberProfile(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to update your profile" };
  }

  const { _id } = session.resultObj;

  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.emailNotifications = formDataObj.emailNotifications === "on";
  formDataObj.profilePublic = formDataObj.profilePublic === "on";

  const result = MemberUpdateFormSchema.safeParse(formDataObj);

  if (!result.success) {
    console.log("failed");
    return {
      message:
        "Failed to update profile: make sure all required fields are completed and try again",
    };
  }

  const {
    firstName,
    lastName,
    preferredName,
    pronouns,
    email,
    emailNotifications,
    about,
    profilePublic,
  } = result.data;

  const db = await dbConnection();

  const member = await db
    .collection("members")
    .findOne({ _id: new ObjectId(_id) });

  if (!member) {
    return { message: "Member not found" };
  }

  await db.collection("members").updateOne(
    { _id: new ObjectId(_id) },
    {
      $set: {
        firstName,
        lastName,
        preferredName,
        pronouns,
        email,
        emailNotifications,
        about,
        profilePublic,
      },
    }
  );

  revalidatePath("/dashboard/member");
  redirect("/");
}

export async function approveMemberProfile(memberId) {
  const session = await getSession();
  if (session?.resultObj?.memberType !== "ultrashark") {
    return { message: "You must be logged in to approve a member" };
  }

  try {
    const db = await dbConnection();
    await db
      .collection("members")
      .updateOne(
        { _id: new ObjectId(memberId) },
        { $set: { memberType: "member" } }
      );

    revalidatePath("/dashboard/ultrashark/members");
    return { message: "Member approved" };
  } catch (error) {
    console.error(error);
  }
}

export async function deactivateMemberProfile(memberId) {
  const session = await getSession();
  if (session?.resultObj?.memberType !== "ultrashark") {
    return { message: "You must be logged in to deactivate a member" };
  }

  try {
    const db = await dbConnection();
    await db
      .collection("members")
      .updateOne(
        { _id: new ObjectId(memberId) },
        { $set: { memberType: "pending" } }
      );

    //send an email to the member that their profile has been deactived, give a reason why?

    revalidatePath("/dashboard/ultrashark/members");
    return { message: "Member deactivated" };
  } catch (error) {
    console.error(error);
  }
}

export async function deleteMemberProfile(memberId) {
  const session = await getSession();
  if (session?.resultObj?.memberType !== "ultrashark") {
    return { message: "You must be logged in to delete a member" };
  }

  try {
    const db = await dbConnection();
    await db.collection("members").deleteOne({ _id: new ObjectId(memberId) });

    revalidatePath("/dashboard/ultrashark/members");
    return { message: "Member deleted" };
  } catch (error) {
    console.error(error);
  }
}

export async function getAllMembers() {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to get members list" };
  }

  try {
    const db = await dbConnection();
    const members = await db.collection("members").find().toArray();
    return members;
  } catch (error) {
    console.error(error);
  }
}

export async function sendPasswordReset(prevState, formData) {
  const email = formData.get("email");
  console.log(email);
  if (email) {
    return {
      message:
        "If this email is registered, a link to reset your password will be sent to your email.",
    };
  }
  //send email with password reset link if there is an email, return message "if email exists, we will send a password reset link to it"

  // try {
  //   const db = await dbConnection();
  //   const member = await db.collection("members").findOne({ email });
  // } catch (error) {
  //   console.error(error);
  // }
}

///////////////////////////////////////////////
//-------------------POSTS-------------------//
///////////////////////////////////////////////

export const createNewPost = async (prevState, formData) => {
  //only ultrashark and supersharks can create new posts

  const session = await getSession();
  if (
    session?.resultObj?.memberType !== "ultrashark" &&
    session?.resultObj?.memberType !== "supershark"
  ) {
    return { message: "You must be logged in a supershark to create a post" };
  }
  const user =
    session?.resultObj?.preferredName || session?.resultObj?.firstName;

  const result = PostFormSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    beginnerClinic: {
      beginnerClinicOffered: formData.get("beginnerClinicOffered")
        ? true
        : false,
      beginnerClinicStartTime: formData.get("beginnerClinicStartTime"),
      beginnerClinicEndTime: formData.get("beginnerClinicEndTime"),
      beginnerClinicMessage: formData.get("beginnerClinicMessage"),
      beginnerClinicCourts: formData.get("beginnerClinicCourts"),
    },
  });

  if (!result.success) {
    return { message: "Failed to create post" };
  }

  console.log(result.data);

  const { title, message, date, startTime, endTime } = result.data;

  const {
    beginnerClinicOffered,
    beginnerClinicStartTime,
    beginnerClinicEndTime,
    beginnerClinicMessage,
    beginnerClinicCourts,
  } = result.data.beginnerClinic;

  try {
    const db = await dbConnection();

    const post = {
      title,
      message,
      date,
      startTime,
      endTime,
      beginnerClinic: {
        beginnerClinicOffered: beginnerClinicOffered,
        beginnerClinicStartTime: beginnerClinicStartTime,
        beginnerClinicEndTime: beginnerClinicEndTime,
        beginnerClinicMessage: beginnerClinicMessage,
        beginnerClinicCourts: beginnerClinicCourts,
      },
      replies: [],
      createdAt: new Date(),
      postedBy: user,
    };

    await db.collection("posts").insertOne(post);

    revalidatePath("/dashboard");
    return { message: `Added post: ${title}` };
  } catch (e) {
    console.error(e);
    return { message: "Failed to create post" };
  }
};

export const getAllPosts = async () => {
  //must be logged in to get all posts
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to see posts" };
  }

  try {
    const db = await dbConnection();
    const posts = await db
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    return posts;
  } catch (error) {
    console.error(error);
  }
};

export async function replyToPost(postId) {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to RSVP" };
  }

  const member = await getCurrentUser();
  const { email, firstName, lastName, preferredName, _id } = member;

  try {
    const db = await dbConnection();

    //check if user has already replied
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return { message: "Post not found" };
    }
    const hasReplied = post.replies.some(
      (reply) => reply.userId === _id.toString()
    );

    if (hasReplied) {
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { replies: { userId: _id.toString() } } }
        );
    } else {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(postId) },
        {
          $push: {
            replies: {
              name: preferredName || firstName,
              email,
              userId: _id.toString(),
              createdAt: new Date(),
            },
          },
        }
      );
    }

    revalidatePath("/dashboard");
    return { message: "RSVP confirmed" };
  } catch (error) {
    console.error(error);
  }
}

export async function replyToBeginnerClinic(postId) {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to RSVP" };
  }

  const member = await getCurrentUser();
  const { email, firstName, lastName, preferredName, _id } = member;

  try {
    const db = await dbConnection();

    //check if user has already replied
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return { message: "Post not found" };
    }
    const hasReplied = post?.beginnerClinic?.beginnerClinicReplies?.some(
      (reply) => reply.userId === _id.toString()
    );

    if (hasReplied) {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(postId) },
        {
          $pull: {
            "beginnerClinic.beginnerClinicReplies": {
              userId: _id.toString(),
            },
          },
        }
      );
    } else {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(postId) },
        {
          $push: {
            "beginnerClinic.beginnerClinicReplies": {
              name: preferredName || firstName,
              email,
              userId: _id.toString(),
              createdAt: new Date(),
            },
          },
        }
      );
    }

    revalidatePath("/dashboard");
    return { message: "RSVP confirmed" };
  } catch (error) {
    console.error(error);
  }
}

export async function updatePost(prevState, formData) {
  const session = await getSession();
  if (session?.resultObj?.memberType !== "ultrashark") {
    return { message: "You must be logged in as ultrashark to update a post" };
  }

  const result = PostFormSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    beginnerClinic: {
      beginnerClinicOffered: formData.get("beginnerClinicOffered")
        ? true
        : false,
      beginnerClinicStartTime: formData.get("beginnerClinicStartTime"),
      beginnerClinicEndTime: formData.get("beginnerClinicEndTime"),
      beginnerClinicMessage: formData.get("beginnerClinicMessage"),
      beginnerClinicCourts: formData.get("beginnerClinicCourts"),
    },
    courts: formData.get("courts"),
  });

  if (!result.success) {
    console.log(result.error);
    return { message: "Failed to update post" };
  }

  const postId = formData.get("postId");

  const user =
    session?.resultObj?.preferredName || session?.resultObj?.firstName;

  const { title, message, date, startTime, endTime, courts } = result.data;

  const {
    beginnerClinicOffered,
    beginnerClinicStartTime,
    beginnerClinicEndTime,
    beginnerClinicMessage,
    beginnerClinicCourts,
  } = result.data.beginnerClinic;

  try {
    const db = await dbConnection();

    await db.collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          title,
          message,
          date,
          startTime,
          endTime,
          "beginnerClinic.beginnerClinicOffered": beginnerClinicOffered,
          "beginnerClinic.beginnerClinicStartTime": beginnerClinicStartTime,
          "beginnerClinic.beginnerClinicEndTime": beginnerClinicEndTime,
          "beginnerClinic.beginnerClinicMessage": beginnerClinicMessage,
          "beginnerClinic.beginnerClinicCourts": beginnerClinicCourts,
          courts,
          postedBy: user,
        },
      }
    );

    revalidatePath("/dashboard/ultrashark/posts");
    return { message: "Post updated" };
  } catch (error) {
    console.error(error);
  }
}

export async function deletePost(postId) {
  const session = await getSession();
  if (session?.resultObj?.memberType !== "ultrashark") {
    return { message: "You must be logged in as ultrashark to delete a post" };
  }

  try {
    const db = await dbConnection();
    await db.collection("posts").deleteOne({ _id: new ObjectId(postId) });

    revalidatePath("/dashboard/ultrashark/posts");
    return { message: "Post deleted" };
  } catch (error) {
    console.error(error);
  }
}

///////////////////////////////////////////////
//-----------------WAIVERS-------------------//
///////////////////////////////////////////////

export async function confirmWaiver(formData) {
  const member = await getSession();
  if (!member) {
    return { message: "You must be logged in to confirm the waiver" };
  }

  const { email, firstName, lastName, _id } = member.resultObj;

  try {
    const db = await dbConnection();

    const waiver = {
      memberId: _id,
      email,
      firstName,
      lastName,
      createdAt: new Date(),
    };

    await db.collection("waivers").insertOne(waiver);

    revalidatePath("/dashboard/member");

    return { message: "Waiver confirmed" };
  } catch (error) {
    console.error(error);
  }

  redirect("/dashboard/member");
}

export async function getWaivers() {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in" };
  }

  try {
    const db = await dbConnection();
    const waivers = await db.collection("waivers").find().toArray();
    return waivers;
  } catch (error) {
    console.error(error);
  }
}
