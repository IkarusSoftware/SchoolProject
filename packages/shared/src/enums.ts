// ─── User Roles ───
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SCHOOL_OWNER = "SCHOOL_OWNER",
  PRINCIPAL = "PRINCIPAL",
  VICE_PRINCIPAL = "VICE_PRINCIPAL",
  TEACHER = "TEACHER",
  PARENT = "PARENT",
  DRIVER = "DRIVER",
  STAFF = "STAFF",
}

// ─── Tenant (School) Status ───
export enum TenantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  TRIAL = "TRIAL",
  PENDING = "PENDING",
}

// ─── Subscription Status ───
export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  TRIAL = "TRIAL",
  PAST_DUE = "PAST_DUE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

// ─── Subscription Plan ───
export enum SubscriptionPlan {
  STARTER = "STARTER",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
  CUSTOM = "CUSTOM",
}

// ─── Student Status ───
export enum StudentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  GRADUATED = "GRADUATED",
  TRANSFERRED = "TRANSFERRED",
  SUSPENDED = "SUSPENDED",
}

// ─── Attendance Status ───
export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
  HALF_DAY = "HALF_DAY",
}

// ─── Message Type ───
export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  VOICE = "VOICE",
  SYSTEM = "SYSTEM",
}

// ─── Conversation Type ───
export enum ConversationType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
  CLASS_GROUP = "CLASS_GROUP",
}

// ─── Announcement Priority ───
export enum AnnouncementPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

// ─── Meal Type ───
export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SNACK = "SNACK",
}

// ─── Gender ───
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

// ─── Grade Category Type ───
export enum GradeCategoryType {
  EXAM = "EXAM",
  QUIZ = "QUIZ",
  HOMEWORK = "HOMEWORK",
  PROJECT = "PROJECT",
  ORAL = "ORAL",
  PARTICIPATION = "PARTICIPATION",
}

// ─── Permission Actions ───
export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage", // full CRUD
  EXPORT = "export",
}

// ─── Permission Resources ───
export enum PermissionResource {
  STUDENTS = "students",
  TEACHERS = "teachers",
  PARENTS = "parents",
  CLASSES = "classes",
  GRADES = "grades",
  ATTENDANCE = "attendance",
  MESSAGES = "messages",
  ANNOUNCEMENTS = "announcements",
  MEALS = "meals",
  TRANSPORT = "transport",
  FINANCE = "finance",
  REPORTS = "reports",
  SETTINGS = "settings",
  USERS = "users",
  SUBSCRIPTIONS = "subscriptions",
  TENANTS = "tenants",
}
