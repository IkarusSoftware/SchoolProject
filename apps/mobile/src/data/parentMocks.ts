import type {
  ParentAnnouncement,
  ParentAttendanceRecord,
  ParentConversation,
  ParentMealPlan,
  ParentMessageEntry,
  ParentProfile,
  ParentQuickEvent,
} from "../types/parent";

export const parentProfileMock: ParentProfile = {
  parentName: "Mehmet Demir",
  relationship: "Father",
  childName: "Ali Demir",
  className: "5-A",
  studentNumber: "2025001",
  academicYear: "2025-2026",
  schoolName: "Demo Ozel Okulu",
};

export const parentEventsMock: ParentQuickEvent[] = [
  {
    id: "evt-1",
    title: "Parent meeting with class teacher",
    startsAt: "2026-02-24T16:00:00.000Z",
    location: "Classroom 5-A",
  },
  {
    id: "evt-2",
    title: "Museum trip departure",
    startsAt: "2026-02-26T08:10:00.000Z",
    location: "School gate",
  },
  {
    id: "evt-3",
    title: "Science fair workshop",
    startsAt: "2026-03-01T11:30:00.000Z",
    location: "Multipurpose hall",
  },
];

export const parentAnnouncementsMock: ParentAnnouncement[] = [
  {
    id: "ann-1",
    title: "Museum trip approval form reminder",
    content: "Signed approval forms should be delivered before Wednesday.",
    category: "Trips",
    priority: "HIGH",
    createdAt: "2026-02-23T09:20:00.000Z",
    isRead: false,
    isPinned: true,
  },
  {
    id: "ann-2",
    title: "Mock exam calendar published",
    content: "March mock exam calendar is available in school portal.",
    category: "Academic",
    priority: "NORMAL",
    createdAt: "2026-02-22T15:45:00.000Z",
    isRead: false,
    isPinned: false,
  },
  {
    id: "ann-3",
    title: "PTA meeting time updated",
    content: "The meeting now starts at 18:30 in conference room A.",
    category: "Meetings",
    priority: "URGENT",
    createdAt: "2026-02-21T08:10:00.000Z",
    isRead: true,
    isPinned: false,
  },
  {
    id: "ann-4",
    title: "Library week activity sign-up",
    content: "Students can sign up for storytelling sessions this Friday.",
    category: "Activities",
    priority: "LOW",
    createdAt: "2026-02-20T12:05:00.000Z",
    isRead: true,
    isPinned: false,
  },
];

export const parentAttendanceMock: ParentAttendanceRecord[] = [
  {
    id: "att-1",
    date: "2026-02-23",
    status: "PRESENT",
    course: "Mathematics",
    teacher: "Ayse Kaya",
  },
  {
    id: "att-2",
    date: "2026-02-22",
    status: "PRESENT",
    course: "Science",
    teacher: "Ayse Kaya",
  },
  {
    id: "att-3",
    date: "2026-02-21",
    status: "LATE",
    course: "Turkish",
    teacher: "Murat Sener",
    note: "Arrived 12 minutes late due to traffic.",
  },
  {
    id: "att-4",
    date: "2026-02-20",
    status: "EXCUSED",
    course: "Physical Education",
    teacher: "Banu Oz",
    note: "Excused with doctor note.",
  },
  {
    id: "att-5",
    date: "2026-02-19",
    status: "PRESENT",
    course: "Social Studies",
    teacher: "Aylin Karaca",
  },
];

export const parentMealsMock: ParentMealPlan[] = [
  {
    id: "meal-1",
    date: "2026-02-23",
    dayLabel: "Monday",
    mealType: "LUNCH",
    menuItems: ["Lentil soup", "Chicken saute", "Bulgur pilaf", "Yogurt"],
    calories: 620,
    allergens: ["Milk"],
  },
  {
    id: "meal-2",
    date: "2026-02-24",
    dayLabel: "Tuesday",
    mealType: "LUNCH",
    menuItems: ["Tomato soup", "Meatballs", "Rice", "Seasonal fruit"],
    calories: 680,
    allergens: [],
  },
  {
    id: "meal-3",
    date: "2026-02-25",
    dayLabel: "Wednesday",
    mealType: "LUNCH",
    menuItems: ["Yayla soup", "Chickpeas", "Pasta", "Ayran"],
    calories: 640,
    allergens: ["Milk", "Gluten"],
  },
];

export const parentConversationsMock: ParentConversation[] = [
  {
    id: "conv-1",
    participant: "Class Teacher",
    participantRole: "Teacher",
    preview: "Ali participated actively in science class today.",
    unreadCount: 2,
    isPinned: true,
    isOnline: true,
    lastMessageAt: "2026-02-23T13:35:00.000Z",
  },
  {
    id: "conv-2",
    participant: "Vice Principal",
    participantRole: "Administration",
    preview: "Club activity starts at 14:00 tomorrow.",
    unreadCount: 0,
    isPinned: false,
    isOnline: false,
    lastMessageAt: "2026-02-22T17:15:00.000Z",
  },
  {
    id: "conv-3",
    participant: "Guidance Office",
    participantRole: "Guidance",
    preview: "Monthly parent consultation slots are available.",
    unreadCount: 1,
    isPinned: false,
    isOnline: false,
    lastMessageAt: "2026-02-21T10:10:00.000Z",
  },
];

export const parentMessageThreadMock: ParentMessageEntry[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    sender: "SCHOOL",
    content: "Ali participated actively in science class today.",
    createdAt: "2026-02-23T13:20:00.000Z",
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    sender: "PARENT",
    content: "Thank you. We reviewed the homework together in the evening.",
    createdAt: "2026-02-23T13:28:00.000Z",
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    sender: "SCHOOL",
    content: "Great. Please also check tomorrow's project materials.",
    createdAt: "2026-02-23T13:35:00.000Z",
  },
  {
    id: "msg-4",
    conversationId: "conv-2",
    sender: "SCHOOL",
    content: "Club activity starts at 14:00 tomorrow.",
    createdAt: "2026-02-22T17:15:00.000Z",
  },
  {
    id: "msg-5",
    conversationId: "conv-3",
    sender: "SCHOOL",
    content: "Monthly parent consultation slots are available.",
    createdAt: "2026-02-21T10:10:00.000Z",
  },
];
