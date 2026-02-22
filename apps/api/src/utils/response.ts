import type { ApiResponse } from "@edusync/shared";
import type { FastifyReply } from "fastify";

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode = 200,
  meta?: ApiResponse["meta"]
): void {
  reply.status(statusCode).send({
    success: true,
    data,
    meta,
  } satisfies ApiResponse<T>);
}

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): void {
  reply.status(statusCode).send({
    success: false,
    error: { code, message, details },
  } satisfies ApiResponse);
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  totalCount: number,
  page: number,
  pageSize: number
): void {
  reply.status(200).send({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  } satisfies ApiResponse<T[]>);
}
