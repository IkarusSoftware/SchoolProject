// ─── Auth Constants ───
export const AUTH = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
  OTP_EXPIRY_MINUTES: 5,
  OTP_LENGTH: 6,
} as const;

// ─── Pagination ───
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ─── File Upload ───
export const UPLOAD = {
  MAX_FILE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  AVATAR_MAX_SIZE_MB: 2,
  AVATAR_DIMENSIONS: { width: 400, height: 400 },
} as const;

// ─── Subscription Limits ───
export const PLAN_LIMITS = {
  STARTER: {
    maxStudents: 100,
    maxTeachers: 15,
    maxStorageGB: 5,
    features: ["messaging", "grades", "attendance", "meals", "announcements", "schedule"],
  },
  PROFESSIONAL: {
    maxStudents: 500,
    maxTeachers: 50,
    maxStorageGB: 25,
    features: [
      "messaging", "grades", "attendance", "meals", "announcements", "schedule",
      "transport", "finance_advanced", "reports_advanced", "digital_portfolio",
    ],
  },
  ENTERPRISE: {
    maxStudents: 2000,
    maxTeachers: 200,
    maxStorageGB: 100,
    features: [
      "messaging", "grades", "attendance", "meals", "announcements", "schedule",
      "transport", "finance_full", "reports_full", "digital_portfolio",
      "ai_features", "api_access", "custom_reports",
    ],
  },
  CUSTOM: {
    maxStudents: Infinity,
    maxTeachers: Infinity,
    maxStorageGB: Infinity,
    features: ["all"],
  },
} as const;

// ─── API Versions ───
export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

// ─── WebSocket Events ───
export const WS_EVENTS = {
  // Messages
  MESSAGE_NEW: "message:new",
  MESSAGE_READ: "message:read",
  MESSAGE_TYPING: "message:typing",
  // Announcements
  ANNOUNCEMENT_NEW: "announcement:new",
  // Attendance
  ATTENDANCE_UPDATED: "attendance:updated",
  // Grades
  GRADE_PUBLISHED: "grade:published",
  // Transport
  TRANSPORT_LOCATION: "transport:location",
  TRANSPORT_BOARDING: "transport:boarding",
  // General
  NOTIFICATION: "notification:push",
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
} as const;
