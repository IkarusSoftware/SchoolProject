export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Geçersiz istek", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Yetkilendirme gerekli") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Bu işlem için yetkiniz yok") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Kaynak", message?: string) {
    super(message || `${resource} bulunamadı`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Bu kayıt zaten mevcut") {
    super(message, 409, "CONFLICT");
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Çok fazla istek gönderdiniz, lütfen bekleyin") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

export class InternalError extends AppError {
  constructor(message = "Sunucu hatası") {
    super(message, 500, "INTERNAL_ERROR");
  }
}
