import {
  pgTable,
  pgSchema,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Schema ───
export const edusync = pgSchema("edusync");

// ═══════════════════════════════════════
// TENANTS (Schools)
// ═══════════════════════════════════════
export const tenants = edusync.table(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    logo: text("logo"),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    district: varchar("district", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 255 }),
    taxNumber: varchar("tax_number", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    settings: jsonb("settings").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tenants_slug_idx").on(table.slug),
    index("tenants_status_idx").on(table.status),
  ]
);

// ═══════════════════════════════════════
// SUBSCRIPTION PLANS
// ═══════════════════════════════════════
export const subscriptionPlans = edusync.table("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  monthlyPrice: integer("monthly_price").notNull(), // kuruş cinsinden
  yearlyPrice: integer("yearly_price").notNull(),
  maxStudents: integer("max_students").notNull(),
  maxTeachers: integer("max_teachers").notNull(),
  maxStorageMB: integer("max_storage_mb").notNull(),
  features: jsonb("features").default([]),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════
// SUBSCRIPTIONS
// ═══════════════════════════════════════
export const subscriptions = edusync.table(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id),
    status: varchar("status", { length: 20 }).notNull().default("TRIAL"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    autoRenew: boolean("auto_renew").default(true),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelReason: text("cancel_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("subscriptions_tenant_idx").on(table.tenantId),
    index("subscriptions_status_idx").on(table.status),
  ]
);

// ═══════════════════════════════════════
// USERS
// ═══════════════════════════════════════
export const users = edusync.table(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    avatar: text("avatar"),
    role: varchar("role", { length: 30 }).notNull(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    emailVerified: boolean("email_verified").default(false),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    failedLoginAttempts: integer("failed_login_attempts").default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_tenant_idx").on(table.email, table.tenantId),
    index("users_tenant_idx").on(table.tenantId),
    index("users_role_idx").on(table.role),
  ]
);

// ═══════════════════════════════════════
// REFRESH TOKENS
// ═══════════════════════════════════════
export const refreshTokens = edusync.table(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    deviceInfo: jsonb("device_info"),
    ipAddress: varchar("ip_address", { length: 50 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("refresh_tokens_user_idx").on(table.userId),
    index("refresh_tokens_token_idx").on(table.token),
  ]
);

// ═══════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════
export const auditLogs = edusync.table(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    tenantId: uuid("tenant_id").references(() => tenants.id),
    action: varchar("action", { length: 100 }).notNull(),
    resource: varchar("resource", { length: 100 }).notNull(),
    resourceId: varchar("resource_id", { length: 100 }),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_user_idx").on(table.userId),
    index("audit_logs_tenant_idx").on(table.tenantId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_idx").on(table.createdAt),
  ]
);

// ═══════════════════════════════════════
// ACADEMIC YEARS
// ═══════════════════════════════════════
export const academicYears = edusync.table(
  "academic_years",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 20 }).notNull(), // "2025-2026"
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    isCurrent: boolean("is_current").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("academic_years_tenant_idx").on(table.tenantId)]
);

// ═══════════════════════════════════════
// GRADE LEVELS (1. sınıf, 2. sınıf...)
// ═══════════════════════════════════════
export const gradeLevels = edusync.table(
  "grade_levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(), // "1. Sınıf"
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("grade_levels_tenant_idx").on(table.tenantId)]
);

// ═══════════════════════════════════════
// CLASSES (5-A, 5-B...)
// ═══════════════════════════════════════
export const classes = edusync.table(
  "classes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    gradeLevelId: uuid("grade_level_id")
      .notNull()
      .references(() => gradeLevels.id),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    name: varchar("name", { length: 50 }).notNull(), // "5-A"
    advisorTeacherId: uuid("advisor_teacher_id").references(() => users.id),
    capacity: integer("capacity").default(30),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("classes_tenant_idx").on(table.tenantId),
    index("classes_grade_level_idx").on(table.gradeLevelId),
    index("classes_academic_year_idx").on(table.academicYearId),
  ]
);

// ═══════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════
export const students = edusync.table(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentNumber: varchar("student_number", { length: 20 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    nationalId: varchar("national_id", { length: 11 }),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }).notNull(),
    gender: varchar("gender", { length: 10 }).notNull(),
    bloodType: varchar("blood_type", { length: 5 }),
    photo: text("photo"),
    address: text("address"),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    classId: uuid("class_id").references(() => classes.id),
    healthNotes: text("health_notes"),
    allergies: jsonb("allergies").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("students_tenant_idx").on(table.tenantId),
    index("students_class_idx").on(table.classId),
    index("students_status_idx").on(table.status),
    uniqueIndex("students_number_tenant_idx").on(table.studentNumber, table.tenantId),
  ]
);

// ═══════════════════════════════════════
// STUDENT-PARENT RELATIONSHIP
// ═══════════════════════════════════════
export const studentParents = edusync.table(
  "student_parents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relation: varchar("relation", { length: 20 }).notNull(), // MOTHER, FATHER, GUARDIAN
    isPrimary: boolean("is_primary").default(false),
    isEmergencyContact: boolean("is_emergency_contact").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("student_parents_student_idx").on(table.studentId),
    index("student_parents_parent_idx").on(table.parentId),
    uniqueIndex("student_parents_unique_idx").on(table.studentId, table.parentId),
  ]
);

// ═══════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  subscriptions: many(subscriptions),
  students: many(students),
  classes: many(classes),
  academicYears: many(academicYears),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  refreshTokens: many(refreshTokens),
  studentParents: many(studentParents),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  tenant: one(tenants, { fields: [students.tenantId], references: [tenants.id] }),
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  parents: many(studentParents),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  tenant: one(tenants, { fields: [classes.tenantId], references: [tenants.id] }),
  gradeLevel: one(gradeLevels, { fields: [classes.gradeLevelId], references: [gradeLevels.id] }),
  academicYear: one(academicYears, { fields: [classes.academicYearId], references: [academicYears.id] }),
  advisor: one(users, { fields: [classes.advisorTeacherId], references: [users.id] }),
  students: many(students),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  tenant: one(tenants, { fields: [subscriptions.tenantId], references: [tenants.id] }),
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}));

export const studentParentsRelations = relations(studentParents, ({ one }) => ({
  student: one(students, { fields: [studentParents.studentId], references: [students.id] }),
  parent: one(users, { fields: [studentParents.parentId], references: [users.id] }),
}));
