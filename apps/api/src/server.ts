import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import { env } from "./config/env";
import { AppError } from "./utils/errors";
import { API_PREFIX } from "@edusync/shared";

// Route modules
import { authRoutes } from "./modules/auth/routes";
import { studentRoutes } from "./modules/students/routes";
import { schoolRoutes } from "./modules/schools/routes";
import { attendanceRoutes } from "./modules/attendance/routes";
import { messagingRoutes } from "./modules/messaging/routes";
import { announcementRoutes } from "./modules/announcements/routes";
import { mealRoutes } from "./modules/meals/routes";
import { scheduleRoutes } from "./modules/schedules/routes";

async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
  });

  // ─── Plugins ───
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
  });

  await app.register(cookie);

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // ─── Global Error Handler ───
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    }

    const fastifyError = error as {
      validation?: unknown;
      statusCode?: number;
      message?: string;
    };

    // Fastify validation errors
    if (fastifyError.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Doğrulama hatası",
          details: fastifyError.validation,
        },
      });
    }

    // Rate limit errors
    if (fastifyError.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Çok fazla istek gönderdiniz",
        },
      });
    }

    // Unknown errors
    const statusCode = fastifyError.statusCode || 500;
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          env.NODE_ENV === "production"
            ? "Bir hata oluştu"
            : error instanceof Error
              ? error.message
              : "Bilinmeyen hata",
      },
    });
  });

  // ─── Health Check ───
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  }));

  // ─── API Routes ───
  app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  app.register(studentRoutes, { prefix: `${API_PREFIX}/students` });
  app.register(schoolRoutes, { prefix: `${API_PREFIX}/schools` });
  app.register(attendanceRoutes, { prefix: `${API_PREFIX}/attendance` });
  app.register(messagingRoutes, { prefix: `${API_PREFIX}/messages` });
  app.register(announcementRoutes, { prefix: `${API_PREFIX}/announcements` });
  app.register(mealRoutes, { prefix: `${API_PREFIX}/meals` });
  app.register(scheduleRoutes, { prefix: `${API_PREFIX}/schedules` });

  return app;
}

// ─── Start Server ───
async function start() {
  try {
    const app = await buildApp();

    await app.listen({ port: env.PORT, host: env.HOST });

    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🎓 EduSync API Server                         ║
║                                                  ║
║   Environment: ${env.NODE_ENV.padEnd(33)}║
║   Port:        ${String(env.PORT).padEnd(33)}║
║   API:         ${(API_PREFIX).padEnd(33)}║
║   Health:      /health                           ║
║                                                  ║
╚══════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
