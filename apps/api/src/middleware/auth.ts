import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import type { TokenPayload } from "@edusync/shared";
import type { UserRole } from "@edusync/shared";

// Extend FastifyRequest to include user
declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

/**
 * Authentication middleware - verifies JWT access token
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access token gerekli");
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyAccessToken(token);
    request.user = payload;
  } catch (error) {
    throw new UnauthorizedError("Geçersiz veya süresi dolmuş token");
  }
}

/**
 * Role-based authorization middleware factory
 */
export function authorize(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(request.user.role as UserRole)) {
      throw new ForbiddenError("Bu işlem için yetkiniz yok");
    }
  };
}

/**
 * Tenant isolation middleware - ensures user can only access their own tenant's data
 */
export async function tenantGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    throw new UnauthorizedError();
  }

  // Super admin can access all tenants
  if (request.user.role === "SUPER_ADMIN") {
    return;
  }

  // Extract tenantId from route params or query
  const params = request.params as Record<string, string>;
  const query = request.query as Record<string, string>;
  const body = request.body as Record<string, string> | null;

  const requestTenantId =
    params?.tenantId || query?.tenantId || body?.tenantId;

  if (requestTenantId && requestTenantId !== request.user.tenantId) {
    throw new ForbiddenError("Başka bir okula ait verilere erişemezsiniz");
  }
}
