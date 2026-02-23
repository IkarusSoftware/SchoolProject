import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { KpiTile } from "../../../components/ui/KpiTile";
import { RequestState } from "../../../components/ui/RequestState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { getErrorMessage } from "../../../utils/errors";
import { formatDateOnly, formatDateTime, humanizeEnum } from "../../../utils/format";
import { useAuth } from "../../auth/AuthProvider";

interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  student: {
    firstName: string;
    lastName: string;
  } | null;
}

interface ConversationParticipant {
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ConversationItem {
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
  attendance: AttendanceRecord[];
  conversations: ConversationItem[];
}

function statusTone(status: string) {
  if (status === "PRESENT") return "ok" as const;
  if (status === "LATE") return "warn" as const;
  if (status === "EXCUSED") return "info" as const;
  return "hot" as const;
}

function conversationTitle(item: ConversationItem): string {
  if (item.title && item.title.trim().length > 0) return item.title;
  if (item.otherParticipants.length === 0) return "Conversation";
  return item.otherParticipants
    .map((participant) => `${participant.user.firstName} ${participant.user.lastName}`)
    .join(", ");
}

export function TeacherDashboardScreen() {
  const { authorizedRequest, signOut } = useAuth();
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshing = loading && state !== null;

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const [me, attendance, conversations] = await Promise.all([
        authorizedRequest<{ user: DashboardUser }>("/auth/me"),
        authorizedRequest<AttendanceRecord[]>(`/attendance?page=1&pageSize=30&date=${today}`),
        authorizedRequest<ConversationItem[]>("/messages/conversations"),
      ]);

      setState({
        user: me.user,
        attendance,
        conversations,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Teacher dashboard could not be loaded."));
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
        presentCount: "0",
        absentCount: "0",
        unreadCount: "0",
      };
    }

    const presentCount = state.attendance.filter((record) => record.status === "PRESENT").length;
    const absentCount = state.attendance.filter((record) => record.status === "ABSENT").length;
    const unreadCount = state.conversations.filter((conversation) => {
      if (!conversation.lastMessage) return false;
      if (conversation.lastMessage.senderId === state.user.id) return false;
      if (!conversation.lastReadAt) return true;
      return (
        new Date(conversation.lastMessage.createdAt).getTime() >
        new Date(conversation.lastReadAt).getTime()
      );
    }).length;

    return {
      presentCount: String(presentCount),
      absentCount: String(absentCount),
      unreadCount: String(unreadCount),
    };
  }, [state]);

  if (loading && !state) {
    return (
      <GradientLayout title="Teacher Panel" subtitle="Loading dashboard...">
        <RequestState title="Dashboard" mode="loading" />
      </GradientLayout>
    );
  }

  if (error && !state) {
    return (
      <GradientLayout title="Teacher Panel" subtitle="Could not reach API">
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
      <GradientLayout title="Teacher Panel" subtitle="No profile data">
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
      title="Teacher Panel"
      subtitle={`${state.user.firstName} ${state.user.lastName} - ${humanizeEnum(state.user.role)}`}
      refreshing={refreshing}
      onRefresh={() => {
        void loadDashboard();
      }}
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

      <SectionCard
        title="Today Snapshot"
        subtitle={formatDateOnly(new Date().toISOString())}
        rightLabel="Online"
      >
        <View style={styles.kpiRow}>
          <KpiTile value={metrics.presentCount} label="Present" tone="green" />
          <KpiTile value={metrics.absentCount} label="Absent" tone="orange" />
          <KpiTile value={metrics.unreadCount} label="Unread msgs" tone="blue" />
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

      <SectionCard title="Latest Attendance" subtitle="Recent records" animateDelayMs={80}>
        {state.attendance.length === 0 ? (
          <Text style={styles.emptyText}>No attendance records for today.</Text>
        ) : null}
        {state.attendance.slice(0, 4).map((item) => (
          <InfoRow
            key={item.id}
            title={item.student ? `${item.student.firstName} ${item.student.lastName}` : "Student"}
            detail={formatDateOnly(item.date)}
            badgeText={humanizeEnum(item.status)}
            badgeTone={statusTone(item.status)}
          />
        ))}
      </SectionCard>

      <SectionCard
        title="Recent Messages"
        subtitle="Conversation updates"
        animateDelayMs={140}
      >
        {state.conversations.length === 0 ? (
          <Text style={styles.emptyText}>No conversations yet.</Text>
        ) : null}
        {state.conversations.slice(0, 3).map((item) => (
          <InfoRow
            key={item.id}
            title={conversationTitle(item)}
            detail={
              item.lastMessage
                ? `${item.lastMessage.content} - ${formatDateTime(item.lastMessage.createdAt)}`
                : "No messages yet"
            }
          />
        ))}
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
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surfaceSoft,
  },
  signOutText: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
});
