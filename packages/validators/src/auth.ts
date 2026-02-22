import { z } from "zod";

// ─── Login ───
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
  deviceInfo: z
    .object({
      platform: z.string(),
      deviceId: z.string(),
      deviceName: z.string(),
    })
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Register ───
export const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır").max(50),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır").max(50),
  phone: z
    .string()
    .regex(/^(\+90|0)?[0-9]{10}$/, "Geçerli bir telefon numarası giriniz")
    .optional(),
  role: z.enum([
    "SCHOOL_OWNER",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "TEACHER",
    "PARENT",
    "DRIVER",
    "STAFF",
  ]),
  tenantId: z.string().uuid().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Refresh Token ───
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token gereklidir"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ─── Change Password ───
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
    newPassword: z
      .string()
      .min(8, "Yeni şifre en az 8 karakter olmalıdır")
      .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
      .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
      .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─── Forgot Password ───
export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ─── Reset Password ───
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
      .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
      .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
