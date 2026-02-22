import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { loginSchema, registerSchema, refreshTokenSchema } from "@edusync/validators";
import { hashPassword, verifyPassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { sendSuccess } from "../../utils/response";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { AUTH } from "@edusync/shared";
import type { TokenPayload } from "@edusync/shared";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // ─── POST /auth/login ───
  app.post(
    "/login",
    { preHandler: [validate({ body: loginSchema })] },
    async (request, reply) => {
      const { email, password, deviceInfo } = (request as any).validatedBody;

      // Find user
      const user = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });

      if (!user) {
        throw new UnauthorizedError("E-posta veya şifre hatalı");
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new UnauthorizedError(
          `Hesabınız kilitlendi. ${AUTH.LOCKOUT_DURATION_MINUTES} dakika sonra tekrar deneyiniz.`
        );
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError("Hesabınız devre dışı bırakılmış");
      }

      // Verify password
      const isValid = await verifyPassword(user.passwordHash, password);

      if (!isValid) {
        // Increment failed login attempts
        const attempts = (user.failedLoginAttempts || 0) + 1;
        const updateData: Record<string, any> = { failedLoginAttempts: attempts };

        if (attempts >= AUTH.MAX_LOGIN_ATTEMPTS) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + AUTH.LOCKOUT_DURATION_MINUTES);
          updateData.lockedUntil = lockUntil;
        }

        await db
          .update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, user.id));

        throw new UnauthorizedError("E-posta veya şifre hatalı");
      }

      // Reset failed attempts on successful login
      await db
        .update(schema.users)
        .set({
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        })
        .where(eq(schema.users.id, user.id));

      // Build token payload
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as any,
        tenantId: user.tenantId || undefined,
        permissions: [], // TODO: load from role_permissions
      };

      // Generate tokens
      const accessToken = await generateAccessToken(tokenPayload);
      const refreshToken = await generateRefreshToken({ userId: user.id });

      // Store refresh token in DB
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + AUTH.REFRESH_TOKEN_EXPIRY_DAYS);

      await db.insert(schema.refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        deviceInfo: deviceInfo || null,
        ipAddress: request.ip,
        expiresAt,
      });

      // Audit log
      await db.insert(schema.auditLogs).values({
        userId: user.id,
        tenantId: user.tenantId,
        action: "LOGIN",
        resource: "auth",
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] || null,
      });

      sendSuccess(reply, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          tenantId: user.tenantId,
        },
        accessToken,
        refreshToken,
      });
    }
  );

  // ─── POST /auth/register ───
  app.post(
    "/register",
    { preHandler: [validate({ body: registerSchema })] },
    async (request, reply) => {
      const data = (request as any).validatedBody;

      // Check if email already exists
      const existing = await db.query.users.findFirst({
        where: and(
          eq(schema.users.email, data.email),
          data.tenantId ? eq(schema.users.tenantId, data.tenantId) : undefined as any
        ),
      });

      if (existing) {
        throw new ConflictError("Bu e-posta adresi zaten kayıtlı");
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user
      const [user] = await db
        .insert(schema.users)
        .values({
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role,
          tenantId: data.tenantId,
          isActive: true,
        })
        .returning({
          id: schema.users.id,
          email: schema.users.email,
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          role: schema.users.role,
          tenantId: schema.users.tenantId,
        });

      sendSuccess(reply, { user }, 201);
    }
  );

  // ─── POST /auth/refresh ───
  app.post(
    "/refresh",
    { preHandler: [validate({ body: refreshTokenSchema })] },
    async (request, reply) => {
      const { refreshToken } = (request as any).validatedBody;

      // Verify the refresh token JWT
      let decoded: { userId: string };
      try {
        decoded = await verifyRefreshToken(refreshToken);
      } catch {
        throw new UnauthorizedError("Geçersiz refresh token");
      }

      // Find token in DB
      const storedToken = await db.query.refreshTokens.findFirst({
        where: and(
          eq(schema.refreshTokens.token, refreshToken),
          eq(schema.refreshTokens.userId, decoded.userId)
        ),
      });

      if (!storedToken || storedToken.revokedAt) {
        throw new UnauthorizedError("Refresh token geçersiz veya iptal edilmiş");
      }

      if (new Date(storedToken.expiresAt) < new Date()) {
        throw new UnauthorizedError("Refresh token süresi dolmuş");
      }

      // Revoke old refresh token (rotation)
      await db
        .update(schema.refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(schema.refreshTokens.id, storedToken.id));

      // Get user
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, decoded.userId),
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError("Kullanıcı bulunamadı veya devre dışı");
      }

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as any,
        tenantId: user.tenantId || undefined,
        permissions: [],
      };

      const newAccessToken = await generateAccessToken(tokenPayload);
      const newRefreshToken = await generateRefreshToken({ userId: user.id });

      // Store new refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + AUTH.REFRESH_TOKEN_EXPIRY_DAYS);

      await db.insert(schema.refreshTokens).values({
        userId: user.id,
        token: newRefreshToken,
        deviceInfo: storedToken.deviceInfo,
        ipAddress: request.ip,
        expiresAt,
      });

      sendSuccess(reply, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    }
  );

  // ─── POST /auth/logout ───
  app.post(
    "/logout",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user!.userId;

      // Revoke all refresh tokens for this user
      await db
        .update(schema.refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(schema.refreshTokens.userId, userId),
            // Only revoke non-revoked tokens
          )
        );

      // Audit log
      await db.insert(schema.auditLogs).values({
        userId,
        tenantId: request.user!.tenantId,
        action: "LOGOUT",
        resource: "auth",
        ipAddress: request.ip,
      });

      sendSuccess(reply, { message: "Başarıyla çıkış yapıldı" });
    }
  );

  // ─── GET /auth/me ───
  app.get(
    "/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, request.user!.userId),
        columns: {
          passwordHash: false,
        },
      });

      if (!user) {
        throw new NotFoundError("Kullanıcı");
      }

      sendSuccess(reply, { user });
    }
  );
}
