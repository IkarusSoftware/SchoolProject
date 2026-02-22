import * as jose from "jose";
import { env } from "../config/env";
import type { TokenPayload } from "@edusync/shared";

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setIssuer("edusync")
    .setSubject(payload.userId)
    .sign(accessSecret);
}

export async function generateRefreshToken(payload: { userId: string }): Promise<string> {
  return new jose.SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setIssuer("edusync")
    .setSubject(payload.userId)
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jose.jwtVerify(token, accessSecret, {
    issuer: "edusync",
  });
  return payload as unknown as TokenPayload;
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string }> {
  const { payload } = await jose.jwtVerify(token, refreshSecret, {
    issuer: "edusync",
  });
  return { userId: payload.sub as string };
}
