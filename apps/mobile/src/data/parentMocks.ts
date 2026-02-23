import type {
  AnnouncementItem,
  AttendanceItem,
  MealItem,
  MessageItem,
} from "../types/parent";

export const parentProfile = {
  fullName: "Ali Demir",
  className: "5-A",
  year: "2025-2026",
};

export const announcementItems: AnnouncementItem[] = [
  {
    id: "a1",
    title: "Friday museum trip approval form",
    time: "Today 10:20",
    priority: "High",
    tone: "warn",
  },
  {
    id: "a2",
    title: "March mock exam calendar",
    time: "Yesterday 17:45",
    priority: "Normal",
    tone: "info",
  },
  {
    id: "a3",
    title: "Parent meeting time update",
    time: "Yesterday 09:00",
    priority: "Urgent",
    tone: "hot",
  },
];

export const mealItems: MealItem[] = [
  {
    id: "m1",
    day: "Monday",
    menu: "Soup · Meatballs · Rice · Ayran",
  },
  {
    id: "m2",
    day: "Tuesday",
    menu: "Tomato soup · Chicken saute · Pasta · Fruit",
  },
  {
    id: "m3",
    day: "Wednesday",
    menu: "Lentil soup · Chickpeas · Bulgur · Yogurt",
  },
];

export const messageItems: MessageItem[] = [
  {
    id: "msg1",
    from: "Class Teacher",
    text: "Ali was very active during science class.",
    unread: true,
  },
  {
    id: "msg2",
    from: "Vice Principal",
    text: "Club activity starts tomorrow at 14:00.",
    unread: false,
  },
  {
    id: "msg3",
    from: "Guidance Office",
    text: "Monthly parent slots are available.",
    unread: false,
  },
];

export const attendanceItems: AttendanceItem[] = [
  { id: "at1", date: "2026-02-23", status: "Present" },
  { id: "at2", date: "2026-02-22", status: "Present" },
  { id: "at3", date: "2026-02-21", status: "Late" },
  { id: "at4", date: "2026-02-20", status: "Present" },
];

