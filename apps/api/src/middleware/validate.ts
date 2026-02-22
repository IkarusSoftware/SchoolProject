import type { FastifyRequest, FastifyReply } from "fastify";
import type { ZodSchema } from "zod";
import { BadRequestError } from "../utils/errors";

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Fastify preHandler that validates request body/params/query with Zod
 */
export function validate(schemas: ValidationSchemas) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (schemas.body) {
      const result = schemas.body.safeParse(request.body);
      if (!result.success) {
        throw new BadRequestError("Doğrulama hatası", result.error.flatten().fieldErrors);
      }
      (request as any).validatedBody = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(request.params);
      if (!result.success) {
        throw new BadRequestError("Geçersiz parametreler", result.error.flatten().fieldErrors);
      }
      (request as any).validatedParams = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(request.query);
      if (!result.success) {
        throw new BadRequestError("Geçersiz sorgu parametreleri", result.error.flatten().fieldErrors);
      }
      (request as any).validatedQuery = result.data;
    }
  };
}
