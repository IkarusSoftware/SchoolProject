export type BadgeTone = "info" | "warn" | "hot" | "ok";

export type ParentPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ParentAttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface ParentProfile {
  parentName: string;
  relationship: string;
  childName: string;
  className: string;
  studentNumber: string;
  academicYear: string;
  schoolName: string;
}

export interface ParentQuickEvent {
  id: string;
  title: string;
  startsAt: string;
  location: string;
}

export interface ParentAnnouncement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: ParentPriority;
  createdAt: string;
  isRead: boolean;
  isPinned: boolean;
}

export interface ParentMealPlan {
  id: string;
  date: string;
  dayLabel: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  menuItems: string[];
  calories: number;
  allergens: string[];
}

export interface ParentConversation {
  id: string;
  participant: string;
  participantRole: string;
  preview: string;
  unreadCount: number;
  isPinned: boolean;
  isOnline: boolean;
  lastMessageAt: string;
}

export interface ParentMessageEntry {
  id: string;
  conversationId: string;
  sender: "PARENT" | "SCHOOL";
  content: string;
  createdAt: string;
}

export interface ParentAttendanceRecord {
  id: string;
  date: string;
  status: ParentAttendanceStatus;
  course: string;
  teacher: string;
  note?: string;
}
