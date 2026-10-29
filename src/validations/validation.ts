import z from "zod";

export const contactEmailSchema = z
  .string()
  .email('Please enter a valid email address.');

export const contactNumberSchema = z
  .string()
  .regex(/^(\+91[-\s]?[6-9]\d{9}|0[6-9]\d{9}|[6-9]\d{9})$/, 'Please enter a valid contact number: can start with +91, +91-, +91␣, 0, or directly with 10 digits.');

export const nameSchema = (field: string) =>
  z
    .string()
    .min(3, `${field} must be at least 3 characters long.`)
    .max(50, `${field} must be at most 50 characters long.`)
    .regex(/^[A-Za-z\s]+$/, `${field} can only contain letters and spaces.`);


export const firstNameSchema = z
  .string()
  .min(3, "First name must be at least 3 characters long")
  .max(50, "First name must be at most 50 characters long")
  .regex(/^[A-Za-z\s]+$/, "First name can only contain letters and spaces")
 .regex(/^[A-Z][a-zA-Z\s]*$/, "First name must start with a capital letter");

export const lastNameSchema = z
  .string()
  .min(3, "Last name must be at least 3 characters long")
  .max(50, "Last name must be at most 50 characters long")
  .regex(/^[A-Za-z\s]+$/, "Last name can only contain letters and spaces")
 .regex(/^[A-Z][a-zA-Z\s]*$/, "Last name must start with a capital letter");


// password rule
export const loginPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(20, "Password must not exceed 20 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character");

  export const signInSchema = z.object({
    email: contactEmailSchema,
    password: loginPasswordSchema,
  });

export const signUpSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: contactEmailSchema,
    password: loginPasswordSchema,
    userRole: z.string().min(1, "Role is required"),
    contactNumber: contactNumberSchema,
    // confirmPassword: z.string(),
  })

export type SignUpPayload = z.infer<typeof signUpSchema>;
