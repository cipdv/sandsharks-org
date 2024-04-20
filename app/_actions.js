"use server";

//database connection
import dbConnection from "@/app/lib/db";
//dependencies
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getSession, encrypt } from "@/app/lib/auth";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Storage } from "@google-cloud/storage";
import path from "path";
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");

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

import fs from "fs";

export async function updateMemberProfile(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to update your profile." };
  }

  const { _id } = session.resultObj;

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

  const result = MemberUpdateFormSchema.safeParse(formDataObj);

  if (!result.success) {
    console.log("failed");
    return {
      message:
        "Failed to update profile: make sure all required fields are completed and try again.",
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

  //upload profile pic to google cloud storage
  const { profilePic } = formDataObj;
  let url;

  if (profilePic) {
    // const storage = new Storage({
    //   projectId: process.env.GCLOUD_PROJECT_ID,
    //   credentials: {
    //     client_email: process.env.GCLOUD_CLIENT_EMAIL,
    //     private_key: process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
    //   },
    // });

    // const privateKey = fs.readFileSync("sandsharks-gcs.json").toString();
    // const base64PrivateKey = Buffer.from(privateKey).toString("base64");

    // console.log(base64PrivateKey);

    const storage = new Storage({
      projectId: process.env.GCLOUD_PROJECT_ID,
      credentials: {
        private_key: process.env.GCLOUD_PRIVATE_KEY,
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
      },
    });

    const buffer = await profilePic.arrayBuffer();

    if (buffer.byteLength > 2000000) {
      // limit file size to 2MB
      return { message: "Profile picture must be less than 2MB" };
    }

    const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);
    const extension = path.extname(profilePic?.name);
    const fileName = `${_id}-${Date.now()}${extension}`; // Generate a unique file name
    const file = bucket.file(fileName);

    // Upload the new file
    await file.save(Buffer.from(buffer), {
      contentType: profilePic.mimetype,
      metadata: {
        cacheControl: "no-cache",
      },
    });
    // Make the file publicly accessible
    // await file.makePublic();

    // Get the public URL for the file
    url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  }

  const dbClient = await dbConnection;
  const db = await dbClient.db("Sandsharks");

  const member = await db
    .collection("members")
    .findOne({ _id: new ObjectId(_id) });

  if (!member) {
    return { message: "Member not found" };
  }

  // Update the member with the profile picture URL and other fields
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
        profilePic: url ? { approved: false, url: url } : undefined,
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
    const members = await db.collection("members").find().toArray();
    return members;
  } catch (error) {
    console.error(error);
  }
}

export async function sendPasswordReset(prevState, formData) {
  const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;
  const to = formData.get("email");

  //check if the email is in the database
  const dbClient = await dbConnection;
  const db = await dbClient.db("Sandsharks");
  const member = await db.collection("members").findOne({ email: to });

  if (!member) {
    return {
      message:
        "If this email is registered, a link to reset your password will be sent to this email address.",
    };
  }

  //assign a token and save to database
  const token = crypto.randomBytes(20).toString("hex");
  const tokenExpires = Date.now() + 3600000; // 1 hour from now  console.log("token", token);
  await db.collection("members").updateOne(
    { email: to },
    {
      $set: { passwordResetToken: token, passwordResetExpires: tokenExpires },
    }
  );
  //send link to change password with token
  const resetURL = `https://sandsharks-org.vercel.app/password-reset/set-new-password/${encodeURIComponent(
    token
  )}`;

  const subject = "Sandsharks password reset request";
  const body = `<div>
    <p>You, or someone, has requested to reset your password for sandsharks.org.</p>
    <p>If this was you, please click the link below to reset your password:</p>
    <a href="${resetURL}">Reset password</a>
    <p>*This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  </div>`;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });
  try {
    const testResult = await transport.verify();
  } catch (error) {
    console.error("error", error);
    return { error: "Something went wrong, please try again." };
  }

  try {
    const sendResult = await transport.sendMail({
      from: SMTP_EMAIL,
      to,
      subject,
      html: body,
    });

    if (sendResult && sendResult.messageId) {
      return {
        message:
          "If this email is registered, a link to reset your password will be sent to this email address.",
      };
    } else {
      // Remove token from database if email sending failed
      await db
        .collection("members")
        .updateOne(
          { email: to },
          { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } }
        );
      return { error: "Failed to send reset link. Please try again." };
    }
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function setNewPassword(prevState, formData) {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const dbClient = await dbConnection;
  const db = await dbClient.db("Sandsharks");
  const member = await db.collection("members").findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!member) {
    return { error: "Password reset token is invalid or has expired." };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await db.collection("members").updateOne(
    { email: member.email },
    {
      $set: { password: hashedPassword },
      $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
    }
  );

  return { message: "Password reset successful." };
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

  const formattedMessage = formData.get("message").replace(/\n/g, "<br />");

  const result = PostFormSchema.safeParse({
    title: formData.get("title"),
    message: formattedMessage,
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

  const { title, message, date, startTime, endTime } = result.data;

  const {
    beginnerClinicOffered,
    beginnerClinicStartTime,
    beginnerClinicEndTime,
    beginnerClinicMessage,
    beginnerClinicCourts,
  } = result.data.beginnerClinic;

  try {
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");

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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
    const posts = await db
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");

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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");

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

  const formattedMessage = formData.get("message").replace(/\n/g, "<br />");

  const result = PostFormSchema.safeParse({
    title: formData.get("title"),
    message: formattedMessage,
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");

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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");

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
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
    const waivers = await db.collection("waivers").find().toArray();
    return waivers;
  } catch (error) {
    console.error(error);
  }
}
