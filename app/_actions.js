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
import { v2 as cloudinary } from "cloudinary";

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

  // Normalize the email address
  formDataObj.email = formDataObj.email.toLowerCase().trim();

  // Capitalize the first letter of the first name and preferred name
  formDataObj.firstName =
    formDataObj.firstName.charAt(0).toUpperCase() +
    formDataObj.firstName.slice(1);

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

  const { firstName, lastName, pronouns, email, password, confirmPassword } =
    result.data;

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

    // if (formDataObj?.newToBeach === "on") {
    //   // send email to email

    //   const subject = "Welcome to Sandsharks!";
    //   const body = `<div>
    //   <h1>Hi ${firstName},</h1>
    //   <h2>Welcome to Sandsharks!</h2>
    //   <p>We are excited to have you join our community.</p>
    //   <p>
    //     My name is Cip, I run the league and I'm here to help you get started.
    //   </p>
    //   <p>
    //     Now that you’re signed up, you can login at sandsharks.ca to check the
    //     weekly updates to see when we’ll be playing. Once you login, you'll need to accept the waiver and agree to the code of conduct to continue.
    //   </p>
    //   <br />
    //   <p>
    //     <b>
    //       If you have experience playing beach volleyball or indoor volleyball
    //       at a competitive level
    //     </b>
    //     , check the website on Wednesdays to see the updates for when we’ll be
    //     playing that week. If you plan on coming, please click the “I’ll be
    //     there!” button, it helps me know how much equipment to bring to the
    //     beach, and please click the “I can no longer make it” button if you
    //     change your mind.
    //   </p>
    //   <p>
    //     The start and end times are posted on the website, and I update the
    //     court numbers we’ll be playing on when I arrive at the beach on game day
    //     (check the top of the wooden posts for the numbers). You can drop by
    //     anytime we’re playing and ask for Cip (pronounced Kip). I’m always
    //     around, but might be playing a game or filling up a water bottle, so
    //     just wait until we can meet before jumping into any games. I’ll show you
    //     how to use the sign-up sheets to get started playing games with us. You
    //     can stay for as long as you’d like and play as many games as you can fit
    //     in.
    //   </p>
    //   <p>
    //     There’s no need to bring a partner because you’ll be playing with a
    //     different person every game, but feel welcome to bring a friend, just
    //     make sure they have also signed up on the website, completed the waiver,
    //     and have RSVP’d to the weekly post.
    //   </p>
    //   <p>
    //     If you have only played indoor volleyball,
    //     <a href="https://www.youtube.com/watch?v=FzO7EvB7mDE">
    //       here’s a great video
    //     </a>
    //     that explains all the unique rules of 2v2 beach volleyball. The complete
    //     rules of 2v2 beach volleyball are posted on
    //     <a href="https://www.sandsharks.ca/member/rules">
    //       sandsharks.ca/member/rules
    //     </a>
    //     .
    //   </p>
    //   <br />
    //   <p>
    //     <b>
    //     If you do not have any experience playing beach volleyball or have
    //     limited experience playing indoor volleyball at a recreational level
    //     </b>,
    //     have no fear, I run free clinics on most weekends to help beginner
    //     players learn how to play the game. I would like you to start with the
    //     beginner clinic before jumping into playing games with the group, and
    //     once I see that you can consistently serve, pass, set, and attack the
    //     ball, then you can join in with the rest of the group.
    //   </p>
    //   <p>
    //     Check the website on Wednesdays to see the updates for when we’ll be
    //     playing that week. If I’m running a clinic that weekend, it will be
    //     posted with the start and end times. If you plan on coming, please click
    //     the “Yas, plz help me!” button. There is limited space for new players
    //     in the clinic, so if you can no longer make it, please click the “I
    //     can’t make it anymore” button so that someone else can take that spot.
    //     Feel free to bring a friend, just make sure they have also signed up on
    //     the website, completed the waiver, and have RSVP’d to the weekly post.
    //   </p>
    //   <br />
    //   <p>
    //     If you have any questions, feel free to email me at
    //     <a href="mailto:sandsharks.org@gmail.com">sandsharks.org@gmail.com</a>.
    //   </p>
    //   <p>I’m looking forward to welcoming you into the group!</p>
    //   <p>See you on the sand,</p>
    //   <p>Cip</p>
    //   <p>sandsharks.org@gmail.com</p>
    // </div>`;

    //   const transport = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //       user: process.env.SMTP_EMAIL,
    //       pass: process.env.SMTP_PASSWORD,
    //     },
    //   });

    //   try {
    //     const testResult = await transport.verify();
    //   } catch (error) {
    //     console.error("error", error);
    //     return { error: "Something went wrong, please try again." };
    //   }

    //   try {
    //     const sendResult = await transport.sendMail({
    //       from: process.env.SMTP_EMAIL,
    //       to: email,
    //       subject,
    //       html: body,
    //     });

    //     if (sendResult && sendResult.messageId) {
    //       console.log(`Email sent to ${email}`);
    //     } else {
    //       return { error: "Failed to send welcome email" };
    //     }
    //   } catch (error) {
    //     console.log(error);
    //     return { error: "Something went wrong. Please try again." };
    //   }
    // }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newMember = {
      firstName,
      lastName,
      pronouns,
      email,
      memberType: "pending",
      password: hashedPassword,
      createdAt: new Date(),
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
    return { message: "You must be logged in to update your profile." };
  }

  const { _id } = session.resultObj;

  const formDataObj = Object.fromEntries(formData.entries());
  console.log("formDataObj", formDataObj);

  // Normalize the email address
  formDataObj.email = formDataObj.email.toLowerCase().trim();

  // Capitalize the first letter of the first name and preferred name
  formDataObj.firstName =
    formDataObj.firstName.charAt(0).toUpperCase() +
    formDataObj.firstName.slice(1);

  const result = MemberUpdateFormSchema.safeParse(formDataObj);

  if (!result.success) {
    let message =
      "Failed to update profile: make sure all required fields are completed and try again.";

    const profilePicError = result.error.errors.find(
      (error) => error.path[0] === "profilePic" && error.code === "custom"
    );

    if (profilePicError) {
      message = profilePicError.message;
    }

    return { message };
  }

  const { firstName, lastName, pronouns, email, about } = result.data;

  //upload profile pic to google cloud storage

  let { profilePic } = formDataObj;

  const dbClient = await dbConnection;
  const db = await dbClient.db("Sandsharks");

  const member = await db
    .collection("members")
    .findOne({ _id: new ObjectId(_id) });

  if (!member) {
    return { message: "Member not found" };
  }

  let updatedProfilePic = member.profilePic; // get existingProfilePic from the member object

  let url;

  if (profilePic?.size > 0) {
    const buffer = await profilePic.arrayBuffer();
    if (buffer.byteLength > 2000000) {
      // limit file size to 2MB
      return { message: "Profile picture must be less than 2MB" };
    }

    // Convert ArrayBuffer to data URL
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUrl,
        { public_id: `${_id}-${Date.now()}`, resource_type: "auto" },
        function (error, result) {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    url = result.secure_url;
    updatedProfilePic = { status: "pending", url: url };
  }

  // Update the member with the profile picture URL and other fields
  await db.collection("members").updateOne(
    { _id: new ObjectId(_id) },
    {
      $set: {
        firstName,
        lastName,
        pronouns,
        email,
        about,
        profilePic: updatedProfilePic,
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

export async function approveMemberPhoto(memberId) {
  const session = await getSession();
  if (session?.resultObj?.memberType !== "ultrashark") {
    return { message: "You must be logged in to approve a photo" };
  }

  try {
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
    await db
      .collection("members")
      .updateOne(
        { _id: new ObjectId(memberId) },
        { $set: { "profilePic.status": "approved" } }
      );

    revalidatePath("/dashboard/ultrashark/members");
    return { message: "Photo approved" };
  } catch (error) {
    console.error(error);
  }
}

export async function disapproveMemberPhoto(memberId) {
  const session = await getSession();
  if (session?.resultObj?.memberType !== "ultrashark") {
    return { message: "You must be logged in to disapprove a photo" };
  }

  try {
    const dbClient = await dbConnection;
    const db = await dbClient.db("Sandsharks");
    await db
      .collection("members")
      .updateOne(
        { _id: new ObjectId(memberId) },
        { $set: { "profilePic.status": "disapproved" } }
      );

    revalidatePath("/dashboard/ultrashark/members");
    return { message: "Photo disapproved" };
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
          "If this email is registered, a link to reset your password will be sent to this email address. Check your junkmail and spam folders.",
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
  const user = session?.resultObj?.firstName;

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
  const { email, firstName, lastName, _id } = member;

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
              name: firstName,
              email,
              userId: _id.toString(),
              pic:
                member?.profilePic?.status === "approved"
                  ? member.profilePic.url
                  : null,
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
              pic:
                member?.profilePic?.status === "approved"
                  ? member.profilePic.url
                  : null,
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
