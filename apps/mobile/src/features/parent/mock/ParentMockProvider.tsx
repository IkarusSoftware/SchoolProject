import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  parentAnnouncementsMock,
  parentAttendanceMock,
  parentConversationsMock,
  parentEventsMock,
  parentMealsMock,
  parentMessageThreadMock,
  parentProfileMock,
} from "../../../data/parentMocks";
import type {
  ParentAnnouncement,
  ParentConversation,
  ParentMessageEntry,
  ParentProfile,
  ParentQuickEvent,
  ParentAttendanceRecord,
  ParentMealPlan,
} from "../../../types/parent";

interface ParentMockContextValue {
  profile: ParentProfile;
  events: ParentQuickEvent[];
  announcements: ParentAnnouncement[];
  attendance: ParentAttendanceRecord[];
  meals: ParentMealPlan[];
  conversations: ParentConversation[];
  getThread: (conversationId: string) => ParentMessageEntry[];
  unreadAnnouncementCount: number;
  unreadMessageCount: number;
  attendanceRate: number;
  markAnnouncementRead: (announcementId: string) => void;
  toggleAnnouncementPinned: (announcementId: string) => void;
  markAllAnnouncementsRead: () => void;
  markConversationRead: (conversationId: string) => void;
  markAllConversationsRead: () => void;
  toggleConversationPinned: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
}

const ParentMockContext = createContext<ParentMockContextValue | null>(null);

function byNewest<T extends { lastMessageAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

function makeMessageId() {
  return `msg-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

export function ParentMockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announcements, setAnnouncements] = useState(parentAnnouncementsMock);
  const [conversations, setConversations] = useState(parentConversationsMock);
  const [threads, setThreads] = useState<Record<string, ParentMessageEntry[]>>(() => {
    const grouped: Record<string, ParentMessageEntry[]> = {};
    parentMessageThreadMock.forEach((entry) => {
      if (!grouped[entry.conversationId]) {
        grouped[entry.conversationId] = [];
      }
      grouped[entry.conversationId].push(entry);
    });
    return grouped;
  });

  const markAnnouncementRead = useCallback((announcementId: string) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === announcementId ? { ...item, isRead: true } : item
      )
    );
  }, []);

  const toggleAnnouncementPinned = useCallback((announcementId: string) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === announcementId
          ? { ...item, isPinned: !item.isPinned }
          : item
      )
    );
  }, []);

  const markAllAnnouncementsRead = useCallback(() => {
    setAnnouncements((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }, []);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  }, []);

  const markAllConversationsRead = useCallback(() => {
    setConversations((prev) =>
      prev.map((conversation) => ({ ...conversation, unreadCount: 0 }))
    );
  }, []);

  const toggleConversationPinned = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, isPinned: !conversation.isPinned }
          : conversation
      )
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    const now = new Date().toISOString();

    setThreads((prev) => {
      const existing = prev[conversationId] || [];
      const nextEntry: ParentMessageEntry = {
        id: makeMessageId(),
        conversationId,
        sender: "PARENT",
        content,
        createdAt: now,
      };
      return {
        ...prev,
        [conversationId]: [...existing, nextEntry],
      };
    });

    setConversations((prev) =>
      byNewest(
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                preview: content,
                unreadCount: 0,
                lastMessageAt: now,
              }
            : conversation
        )
      )
    );
  }, []);

  const getThread = useCallback(
    (conversationId: string) => {
      const list = threads[conversationId] || [];
      return [...list].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    },
    [threads]
  );

  const unreadAnnouncementCount = useMemo(
    () => announcements.filter((item) => !item.isRead).length,
    [announcements]
  );

  const unreadMessageCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0
      ),
    [conversations]
  );

  const attendanceRate = useMemo(() => {
    const visible = parentAttendanceMock;
    const attended = visible.filter(
      (item) => item.status === "PRESENT" || item.status === "EXCUSED"
    ).length;
    if (visible.length === 0) return 0;
    return Math.round((attended / visible.length) * 100);
  }, []);

  const value = useMemo<ParentMockContextValue>(
    () => ({
      profile: parentProfileMock,
      events: parentEventsMock,
      announcements: announcements
        .slice()
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
      attendance: parentAttendanceMock,
      meals: parentMealsMock,
      conversations: byNewest(
        conversations.slice().sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return 0;
        })
      ),
      getThread,
      unreadAnnouncementCount,
      unreadMessageCount,
      attendanceRate,
      markAnnouncementRead,
      toggleAnnouncementPinned,
      markAllAnnouncementsRead,
      markConversationRead,
      markAllConversationsRead,
      toggleConversationPinned,
      sendMessage,
    }),
    [
      announcements,
      attendanceRate,
      conversations,
      getThread,
      markAllAnnouncementsRead,
      markAllConversationsRead,
      markAnnouncementRead,
      markConversationRead,
      sendMessage,
      toggleAnnouncementPinned,
      toggleConversationPinned,
      unreadAnnouncementCount,
      unreadMessageCount,
    ]
  );

  return (
    <ParentMockContext.Provider value={value}>
      {children}
    </ParentMockContext.Provider>
  );
}

export function useParentMock() {
  const context = useContext(ParentMockContext);
  if (!context) {
    throw new Error("useParentMock must be used within ParentMockProvider");
  }
  return context;
}
