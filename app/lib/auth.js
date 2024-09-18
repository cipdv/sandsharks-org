// "use server";

// import { SignJWT, jwtVerify } from "jose";
// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import dbConnection from "@/app/lib/db";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { loginSchema } from "@/app/schemas/memberSchema";

// const secretKey = process.env.SECRET_KEY;
// const key = new TextEncoder().encode(secretKey);

// export async function encrypt(payload) {
//   return await new SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("30 days")
//     .sign(key);
// }

// export async function decrypt(input) {
//   const { payload } = await jwtVerify(input, key, {
//     algorithms: ["HS256"],
//   });
//   return payload;
// }

// export async function login(prevState, formData) {
//   // Convert the form data to an object
//   const formDataObj = Object.fromEntries(formData.entries());
//   formDataObj.rememberMe = formDataObj.rememberMe === "on";

//   // Normalize the email address
//   formDataObj.email = formDataObj.email.toLowerCase().trim();

//   // Validate the form data
//   const { success, data, error } = loginSchema.safeParse(formDataObj);

//   if (!success) {
//     return { message: error.message };
//   }

//   const user = data;

//   const dbClient = await dbConnection;
//   const db = await dbClient.db("Sandsharks");
//   const result = await db.collection("members").findOne({ email: user.email });

//   if (!result) {
//     return { message: "Invalid credentials" };
//   }
//   const passwordsMatch = await bcrypt.compare(user.password, result.password);
//   if (!passwordsMatch) {
//     return { message: "Invalid credentials" };
//   }

//   //remove password from the object
//   let resultObj = { ...result };
//   delete resultObj.password;

//   // Create the session
//   // const expires = user.rememberMe
//   //   ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
//   //   : new Date(Date.now() + 10 * 60 * 1000);
//   const expires = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
//   const session = await encrypt({ resultObj, expires });

//   // Save the session in a cookie
//   cookies().set("session", session, { expires, httpOnly: true });

//   revalidatePath("/dashboard");
//   redirect("/dashboard");
// }

// // export async function login(formData) {
// //   // Validate form data
// //   const { success, data, error } = loginSchema.safeParse({
// //     email: formData.get("email")
// //       ? formData.get("email").toLowerCase().trim()
// //       : "",
// //     password: formData.get("password") || "",
// //     rememberMe: formData.get("rememberMe") === "on",
// //   });

// //   if (!success) {
// //     console.log("no success", error);
// //     return new NextResponse(400, { error: error.message });
// //   }

// //   const user = data;
// //   console.log("user", user);

// //   const db = await dbConnection();
// //   const result = await db.collection("members").findOne({ email: user.email });

// //   if (!result) {
// //     return new NextResponse(400, { error: "invalid credentials" });
// //   }
// //   const passwordsMatch = await bcrypt.compare(user.password, result.password);
// //   if (!passwordsMatch) {
// //     return new NextResponse(400, { error: "invalid credentials" });
// //   }

// //   //remove password from the object
// //   let resultObj = { ...result };
// //   delete resultObj.password;

// //   // Create the session
// //   const expires = user.rememberMe
// //     ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
// //     : new Date(Date.now() + 10 * 60 * 1000);
// //   const session = await encrypt({ resultObj, expires });

// //   // Save the session in a cookie
// //   cookies().set("session", session, { expires, httpOnly: true });

// //   revalidatePath("/dashboard");
// //   redirect("/dashboard");
// // }

// export async function logout() {
//   // Destroy the session
//   cookies().set("session", "", { expires: new Date(0) });
// }

// export async function getSession() {
//   const session = cookies().get("session")?.value;
//   if (!session) return null;
//   return await decrypt(session);
// }

// export async function updateSession(request) {
//   const session = request.cookies.get("session")?.value;
//   if (!session) return;

//   // Refresh the session so it doesn't expire
//   const parsed = await decrypt(session);
//   parsed.expires = new Date(Date.now() + 10 * 60 * 1000);
//   const res = NextResponse.next();
//   res.cookies.set({
//     name: "session",
//     value: await encrypt(parsed),
//     httpOnly: true,
//     expires: parsed.expires,
//   });
//   return res;
// }

// export const getJwtSecretKey = () => {
//   const secret = process.env.JWT_SECRET;
//   if (!secret) {
//     throw new Error("JWT_SECRET is not defined");
//   }
//   return secret;
// };

// export const verifyAuth = async (token) => {
//   try {
//     const verified = await jwtVerify(
//       token,
//       new TextEncoder().encode(getJwtSecretKey())
//     );
//     return verified.payload;
//   } catch (error) {
//     throw new Error("Invalid token");
//   }
// };

"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnection from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema } from "@/app/schemas/memberSchema";

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30 days")
    .sign(key);
}

export async function decrypt(input) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(prevState, formData) {
  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.rememberMe = formDataObj.rememberMe === "on";

  formDataObj.email = formDataObj.email.toLowerCase().trim();

  const { success, data, error } = loginSchema.safeParse(formDataObj);

  if (!success) {
    return { message: error.message };
  }

  const user = data;

  const dbClient = await dbConnection;
  const db = await dbClient.db("Sandsharks");
  const result = await db.collection("members").findOne({ email: user.email });

  if (!result) {
    return { message: "Invalid credentials" };
  }
  const passwordsMatch = await bcrypt.compare(user.password, result.password);
  if (!passwordsMatch) {
    return { message: "Invalid credentials" };
  }

  let resultObj = { ...result };
  delete resultObj.password;

  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await encrypt({ resultObj, expires });

  cookies().set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logout() {
  cookies().set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res;
}

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

export const verifyAuth = async (token) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
