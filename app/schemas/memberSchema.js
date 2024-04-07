import { z } from "zod";

export const MemberSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
  emailNotifications: z.boolean(),
  firstName: z.string().min(1, "First name is required"),
  preferredName: z.string(),
  lastName: z.string().min(1, "Last name is required"),
  pronouns: z.string().min(1, "Pronouns are required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          message: "The passwords did not match",
        });
      }
    }),
  about: z.string().optional(),
  profilePublic: z.boolean(),
  profilePic: z
    .object({
      picApproved: z.boolean().default(false),
      image: z.string(),
    })
    .optional(),
});

export const MemberUpdateFormSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
  emailNotifications: z.boolean(),
  firstName: z.string().min(1, "First name is required"),
  preferredName: z.string(),
  lastName: z.string().min(1, "Last name is required"),
  pronouns: z.string().min(1, "Pronouns are required"),
  about: z.string().optional(),
  profilePublic: z.boolean(),
  profilePic: z
    .object({
      picApproved: z.boolean().default(false),
      image: z.string(),
    })
    .optional(),
});
