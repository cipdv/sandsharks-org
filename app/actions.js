"use server";

//database connection
// import { connectToDb } from "@/app/lib/database";
//dependencies
import { ObjectId } from 'mongodb';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, encrypt } from "@/app/lib/auth";
//mongoose models
import Member from "@/app/models/memberModel";
import Post from "@/app/models/postModel";
import Waiver from "@/app/models/waiverModel";
//zod schemas
import { MemberSchema } from "@/app/schemas/memberSchema";
import { PostFormSchema } from "@/app/schemas/postFormSchema";
import { dbConnection } from "@/app/lib/db";

export const createNewPost = async (prevState, formData) => {
  //only ultrashark and supersharks can create new posts

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
    },
  });

  if (!result.success) {
    return { message: "Failed to create post" };
  }

  const {
    title,
    message,
    date,
    startTime,
    endTime,
    beginnerClinicOffered,
    beginnerClinicStartTime,
    beginnerClinicEndTime,
  } = result.data;

  try {
    const db = await dbConnection();

    const post = {
      title,
      message,
      date,
      startTime,
      endTime,
      beginnerClinic: {
        offered: beginnerClinicOffered,
        startTime: beginnerClinicStartTime,
        endTime: beginnerClinicEndTime,
      },
      replies: [],
      createdAt: new Date(),
    };

    await db.collection('posts').insertOne(post);

    revalidatePath("/dashboard");
    return { message: `Added post: ${title}` };
  } catch (e) {
    console.error(e);
    return { message: "Failed to create post" };
  }
};

export const getAllPosts = async () => {
  //must be logged in to get all posts

  try {
    const db = await dbConnection();
    const posts = await db.collection('posts').find().sort({ createdAt: -1 }).limit(10).toArray();
    return posts;
  } catch (error) {
    console.error(error);
  }
};

export async function registerNewMember(prevState, formData) {
  // Convert the form data to an object
  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.emailNotifications = formDataObj.emailNotifications === "on";

  // Validate the form data
  const result = MemberSchema.safeParse(formDataObj);

  if (!result.success) {
    return {
      message:
        "Failed to register: make sure all required fields are completed and try again",
    };
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
  } = result.data;

  //check if passwords match
  if (password !== confirmPassword) {
    return { confirmPassword: "Passwords do not match" };
  }

  try {
    const db = await dbConnection();

    //check if user already exists
    const memberExists = await db.collection('members').findOne({ email: email });

    if (memberExists) {
      return { email: "This email is already registered" };
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
      waiver: false,
      createdAt: new Date(),
    };

    await db.collection('members').insertOne(newMember);

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

    await db.collection('waivers').insertOne(waiver);

    revalidatePath("/dashboard/member");

    return { message: "Waiver confirmed" };
  } catch (error) {
    console.error(error);
  }

  redirect("/dashboard/member");
}

export async function getWaivers() {
  try {
    const db = await dbConnection();
    const waivers = await db.collection('waivers').find().toArray();
    return waivers;
  } catch (error) {
    console.error(error);
  }
}

export async function replyToPost(postId) {
    const member = await getSession();
    if (!member) {
        return { message: "You must be logged in to RSVP" };
    }

    const { email, firstName, lastName, preferredName, _id } = member.resultObj;

    try {
        const db = await dbConnection();

        //check if user has already replied
        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return { message: "Post not found" };
        }
        const hasReplied = post.replies.some((reply) => reply.userId === _id);

        if (hasReplied) {
            await db.collection('posts').updateOne(
                { _id: new ObjectId(postId) },
                { $pull: { replies: { userId: _id } } }
            );
        } else {
            await db.collection('posts').updateOne(
                { _id: new ObjectId(postId) },
                {
                    $push: {
                        replies: {
                            name: preferredName || firstName,
                            email,
                            userId: _id,
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

export async function updateMemberProfile(formData) {
  const member = await getSession();
  if (!member) {
    return { message: "You must be logged in to update your profile" };
  }

  const { _id } = member.resultObj;

  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.emailNotifications = formDataObj.emailNotifications === "on";

  const result = MemberSchema.safeParse(formDataObj);

  if (!result.success) {
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
  } = result.data;

  try {
    const db = await dbConnection();

    const member = await db.collection('members').findOne({ _id: new ObjectId(_id) });
    if (!member) {
      return { message: "Member not found" };
    }

    await db.collection('members').updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          firstName,
          lastName,
          preferredName,
          pronouns,
          email,
          emailNotifications,
        },
      }
    );

    revalidatePath("/dashboard/member");
    return { message: "Profile updated" };
  } catch (error) {
    console.error(error);
  }
}

// "use server";

// //database connection
// import { connectToDb } from "@/app/lib/database";
// //dependencies
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import bcrypt from "bcryptjs";
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { getSession, encrypt } from "@/app/lib/auth";
// //mongoose models
// import Member from "@/app/models/memberModel";
// import Post from "@/app/models/postModel";
// import Waiver from "@/app/models/waiverModel";
// //zod schemas
// import { MemberSchema } from "@/app/schemas/memberSchema";
// import { PostFormSchema } from "@/app/schemas/postFormSchema";

// export const createNewPost = async (prevState, formData) => {
//   //only ultrashark and supersharks can create new posts

//   const result = PostFormSchema.safeParse({
//     title: formData.get("title"),
//     message: formData.get("message"),
//     date: formData.get("date"),
//     startTime: formData.get("startTime"),
//     endTime: formData.get("endTime"),
//     beginnerClinic: {
//       beginnerClinicOffered: formData.get("beginnerClinicOffered")
//         ? true
//         : false,
//       beginnerClinicStartTime: formData.get("beginnerClinicStartTime"),
//       beginnerClinicEndTime: formData.get("beginnerClinicEndTime"),
//     },
//   });

//   if (!result.success) {
//     return { message: "Failed to create post" };
//   }

//   const {
//     title,
//     message,
//     date,
//     startTime,
//     endTime,
//     beginnerClinicOffered,
//     beginnerClinicStartTime,
//     beginnerClinicEndTime,
//   } = result.data;

//   try {
//     await connectToDb();

//     const post = new Post({
//       title,
//       message,
//       date,
//       startTime,
//       endTime,
//       beginnerClinic: {
//         offered: beginnerClinicOffered,
//         startTime: beginnerClinicStartTime,
//         endTime: beginnerClinicEndTime,
//       },
//       replies: [],
//       createdAt: new Date(),
//     });

//     await post.save();

//     revalidatePath("/dashboard");
//     return { message: `Added post: ${title}` };
//   } catch (e) {
//     console.error(e);
//     return { message: "Failed to create post" };
//   }
// };

// export const getAllPosts = async () => {
//   //must be logged in to get all posts

//   try {
//     await connectToDb();
//     const posts = await Post.find().sort({ createdAt: -1 }).limit(10);
//     return posts;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export async function registerNewMember(prevState, formData) {
//   // Convert the form data to an object
//   const formDataObj = Object.fromEntries(formData.entries());
//   formDataObj.emailNotifications = formDataObj.emailNotifications === "on";

//   // Validate the form data
//   const result = MemberSchema.safeParse(formDataObj);

//   if (!result.success) {
//     return {
//       message:
//         "Failed to register: make sure all required fields are completed and try again",
//     };
//   }

//   const {
//     firstName,
//     lastName,
//     preferredName,
//     pronouns,
//     email,
//     emailNotifications,
//     password,
//     confirmPassword,
//   } = result.data;

//   //check if passwords match
//   if (password !== confirmPassword) {
//     return { confirmPassword: "Passwords do not match" };
//   }

//   try {
//     await connectToDb();

//     //check if user already exists
//     const memberExists = await Member.findOne({ email: email });

//     if (memberExists) {
//       return { email: "This email is already registered" };
//     }

//     //hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     //create new user
//     const newMember = new Member({
//       firstName,
//       lastName,
//       preferredName,
//       pronouns,
//       email,
//       emailNotifications,
//       memberType: "pending",
//       password: hashedPassword,
//       waiver: false,
//       createdAt: new Date(),
//     });

//     await newMember.save();

//     //remove password from the object
//     let resultObj = newMember.toObject();
//     delete resultObj.password;

//     // Create the session
//     const expires = new Date(Date.now() + 10 * 60 * 1000);
//     const session = await encrypt({ resultObj, expires });

//     // Save the session in a cookie
//     cookies().set("session", session, { expires, httpOnly: true });
//   } catch (error) {
//     console.log(error);
//     return {
//       message:
//         "Failed to register: make sure all required fields are completed and try again",
//     };
//   }
//   revalidatePath("/");
//   redirect("/");
// }

// export async function confirmWaiver(formData) {
//   const member = await getSession();
//   if (!member) {
//     return { message: "You must be logged in to confirm the waiver" };
//   }

//   const { email, firstName, lastName, _id } = member.resultObj;

//   try {
//     await connectToDb();

//     const waiver = new Waiver({
//       memberId: _id,
//       email,
//       firstName,
//       lastName,
//       createdAt: new Date(),
//     });

//     await waiver.save();

//     revalidatePath("/dashboard/member");

//     return { message: "Waiver confirmed" };
//   } catch (error) {
//     console.error(error);
//   }

//   redirect("/dashboard/member");
// }

// export async function getWaivers() {
//   try {
//     await connectToDb();
//     const waivers = await Waiver.find();
//     return waivers;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function replyToPost(postId) {
//   const member = await getSession();
//   if (!member) {
//     return { message: "You must be logged in to RSVP" };
//   }

//   const { email, firstName, lastName, preferredName, _id } = member.resultObj;

//   //check if user has already replied
//   const post = await Post.findById(postId);
//   if (!post) {
//     return { message: "Post not found" };
//   }
//   const hasReplied = post?.replies?.some((reply) => reply.userId === _id);

//   try {
//     await connectToDb();

//     if (hasReplied) {
//       post.replies = post.replies.filter((reply) => reply.userId !== _id);
//     } else {
//       post.replies.push({
//         name: preferredName || firstName,
//         email,
//         userId: _id,
//         createdAt: new Date(),
//       });
//     }

//     await post.save();

//     revalidatePath("/dashboard");
//     return { message: "RSVP confirmed" };
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function updateMemberProfile(formData) {
//   const member = await getSession();
//   if (!member) {
//     return { message: "You must be logged in to update your profile" };
//   }

//   const { _id } = member.resultObj;

//   const formDataObj = Object.fromEntries(formData.entries());
//   formDataObj.emailNotifications = formDataObj.emailNotifications === "on";

//   const result = MemberSchema.safeParse(formDataObj);

//   if (!result.success) {
//     return {
//       message:
//         "Failed to update profile: make sure all required fields are completed and try again",
//     };
//   }

//   const {
//     firstName,
//     lastName,
//     preferredName,
//     pronouns,
//     email,
//     emailNotifications,
//   } = result.data;

//   try {
//     await connectToDb();

//     const member = await Member.findById(_id);
//     if (!member) {
//       return { message: "Member not found" };
//     }

//     member.firstName = firstName;
//     member.lastName = lastName;
//     member.preferredName = preferredName;
//     member.pronouns = pronouns;
//     member.email = email;
//     member.emailNotifications = emailNotifications;

//     await member.save();

//     revalidatePath("/dashboard/member");
//     return { message: "Profile updated" };
//   } catch (error) {
//     console.error(error);
//   }
// }
