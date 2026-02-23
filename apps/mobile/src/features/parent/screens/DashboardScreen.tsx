import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { KpiTile } from "../../../components/ui/KpiTile";
import { RequestState } from "../../../components/ui/RequestState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { getErrorMessage } from "../../../utils/errors";
import { formatDateTime, humanizeEnum } from "../../../utils/format";
import { useAuth } from "../../auth/AuthProvider";

interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface DashboardAnnouncement {
  id: string;
  title: string;
  priority: string;
  createdAt: string;
}

interface DashboardAttendanceRecord {
  id: string;
  status: string;
}

interface ConversationParticipant {
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface DashboardConversation {
  id: string;
  title?: string | null;
  lastReadAt?: string | null;
  otherParticipants: ConversationParticipant[];
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
}

interface DashboardState {
  user: DashboardUser;
  announcements: DashboardAnnouncement[];
  attendance: DashboardAttendanceRecord[];
  conversations: DashboardConversation[];
}

function priorityTone(priority: string) {
  if (priority === "URGENT") return "hot" as const;
  if (priority === "HIGH") return "warn" as const;
  if (priority === "LOW") return "ok" as const;
  return "info" as const;
}

function conversationTitle(item: DashboardConversation): string {
  if (item.title && item.title.trim().length > 0) {
    return item.title;
  }

  if (item.otherParticipants.length > 0) {
    return item.otherParticipants
      .map((participant) => `${participant.user.firstName} ${participant.user.lastName}`)
      .join(", ");
  }

  return "Conversation";
}

export function DashboardScreen() {
  const { authorizedRequest, signOut } = useAuth();
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [me, announcements, attendance, conversations] = await Promise.all([
        authorizedRequest<{ user: DashboardUser }>("/auth/me"),
        authorizedRequest<DashboardAnnouncement[]>(
          "/announcements?page=1&pageSize=3&isPublished=true"
        ),
        authorizedRequest<DashboardAttendanceRecord[]>("/attendance?page=1&pageSize=20"),
        authorizedRequest<DashboardConversation[]>("/messages/conversations"),
      ]);

      setState({
        user: me.user,
        announcements,
        attendance,
        conversations,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Dashboard data could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    if (!state) {
      return {
        attendanceRate: "-",
        newNotices: "0",
        unreadMessages: "0",
      };
    }

    const presentCount = state.attendance.filter((record) => record.status === "PRESENT").length;
    const attendanceRate =
      state.attendance.length > 0
        ? `${Math.round((presentCount / state.attendance.length) * 100)}%`
        : "-";

    const unreadMessages = state.conversations.filter((conversation) => {
      if (!conversation.lastMessage) return false;
      if (conversation.lastMessage.senderId === state.user.id) return false;
      if (!conversation.lastReadAt) return true;
      return (
        new Date(conversation.lastMessage.createdAt).getTime() >
        new Date(conversation.lastReadAt).getTime()
      );
    }).length;

    return {
      attendanceRate,
      newNotices: String(state.announcements.length),
      unreadMessages: String(unreadMessages),
    };
  }, [state]);

  if (loading && !state) {
    return (
      <GradientLayout title="Parent Panel" subtitle="Loading dashboard...">
        <RequestState title="Dashboard" mode="loading" />
      </GradientLayout>
    );
  }

  if (error && !state) {
    return (
      <GradientLayout title="Parent Panel" subtitle="Could not reach API">
        <RequestState
          title="Dashboard"
          mode="error"
          message={error}
          onRetry={() => {
            void loadDashboard();
          }}
        />
      </GradientLayout>
    );
  }

  if (!state) {
    return (
      <GradientLayout title="Parent Panel" subtitle="No profile data">
        <RequestState
          title="Dashboard"
          mode="empty"
          message="No user data returned from /auth/me."
          onRetry={() => {
            void loadDashboard();
          }}
        />
      </GradientLayout>
    );
  }

  return (
    <GradientLayout
      title="Parent Panel"
      subtitle={`${state.user.firstName} ${state.user.lastName} · ${humanizeEnum(state.user.role)}`}
    >
      {error ? (
        <RequestState
          title="Sync Warning"
          mode="error"
          message={error}
          onRetry={() => {
            void loadDashboard();
          }}
        />
      ) : null}

      <SectionCard title="Daily Pulse" subtitle="Live status" rightLabel="Online">
        <View style={styles.kpiRow}>
          <KpiTile value={metrics.attendanceRate} label="Attendance" tone="blue" />
          <KpiTile value={metrics.newNotices} label="Notices" tone="green" />
          <KpiTile value={metrics.unreadMessages} label="Unread msgs" tone="orange" />
        </View>

        <Pressable
          style={styles.signOutButton}
          onPress={() => {
            void signOut();
          }}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Latest Announcements" rightLabel="View all">
        {state.announcements.length === 0 ? (
          <Text style={styles.emptyText}>No announcements yet.</Text>
        ) : null}

        {state.announcements.slice(0, 2).map((item) => (
          <InfoRow
            key={item.id}
            title={item.title}
            detail={formatDateTime(item.createdAt)}
            badgeText={humanizeEnum(item.priority)}
            badgeTone={priorityTone(item.priority)}
          />
        ))}
      </SectionCard>

      <SectionCard title="Recent Messages">
        {state.conversations.length === 0 ? (
          <Text style={styles.emptyText}>No conversations yet.</Text>
        ) : null}

        {state.conversations.slice(0, 2).map((item) => {
          const hasUnread =
            Boolean(item.lastMessage) &&
            item.lastMessage?.senderId !== state.user.id &&
            (!item.lastReadAt ||
              new Date(item.lastMessage.createdAt).getTime() >
                new Date(item.lastReadAt).getTime());

          return (
            <InfoRow
              key={item.id}
              title={conversationTitle(item)}
              detail={item.lastMessage?.content || "No messages yet"}
              badgeText={hasUnread ? "New" : undefined}
              badgeTone={hasUnread ? "ok" : "info"}
            />
          );
        })}
      </SectionCard>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  signOutButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#bfd8eb",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: "#f4fafe",
  },
  signOutText: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontDisplay,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
});
