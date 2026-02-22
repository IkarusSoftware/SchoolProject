import type {
  UserRole,
  TenantStatus,
  SubscriptionStatus,
  StudentStatus,
  AttendanceStatus,
  MessageType,
  ConversationType,
  Gender,
} from "./enums.js";

// ─── Base Entity ───
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Tenant (School) ───
export interface ITenant extends BaseEntity {
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: TenantStatus;
  settings: Record<string, unknown>;
}

// ─── User ───
export interface IUser extends BaseEntity {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface IUserWithToken {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

// ─── Student ───
export interface IStudent extends BaseEntity {
  firstName: string;
  lastName: string;
  studentNumber: string;
  nationalId?: string;
  dateOfBirth: Date;
  gender: Gender;
  bloodType?: string;
  photo?: string;
  address?: string;
  status: StudentStatus;
  tenantId: string;
  classId?: string;
}

// ─── Class ───
export interface IClass extends BaseEntity {
  name: string;
  gradeLevelId: string;
  advisorTeacherId?: string;
  capacity: number;
  tenantId: string;
}

// ─── Attendance ───
export interface IAttendance extends BaseEntity {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
  tenantId: string;
}

// ─── Conversation ───
export interface IConversation extends BaseEntity {
  type: ConversationType;
  title?: string;
  tenantId: string;
  lastMessageAt?: Date;
}

// ─── Message ───
export interface IMessage extends BaseEntity {
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
}

// ─── API Response Types ───
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// ─── Auth Types ───
export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: {
    platform: string;
    deviceId: string;
    deviceName: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
