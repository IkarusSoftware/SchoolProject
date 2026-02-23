export type BadgeTone = "info" | "warn" | "hot" | "ok";

export interface AnnouncementItem {
  id: string;
  title: string;
  time: string;
  priority: string;
  tone: BadgeTone;
}

export interface MealItem {
  id: string;
  day: string;
  menu: string;
}

export interface MessageItem {
  id: string;
  from: string;
  text: string;
  unread: boolean;
}

export interface AttendanceItem {
  id: string;
  date: string;
  status: "Present" | "Late" | "Absent";
}

