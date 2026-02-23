import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useToast } from "../../../components/feedback/ToastProvider";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { KpiTile } from "../../../components/ui/KpiTile";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { formatDateTime } from "../../../utils/format";
import { useAuth } from "../../auth/AuthProvider";
import { useParentMock } from "../mock/ParentMockProvider";

function announcementTone(priority: string) {
  if (priority === "URGENT") return "hot" as const;
  if (priority === "HIGH") return "warn" as const;
  if (priority === "LOW") return "ok" as const;
  return "info" as const;
}

function ActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        pressed ? styles.actionButtonPressed : null,
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

export function DashboardScreen() {
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const {
    profile,
    events,
    announcements,
    conversations,
    unreadAnnouncementCount,
    unreadMessageCount,
    attendanceRate,
    markAllAnnouncementsRead,
    markAllConversationsRead,
    markAnnouncementRead,
    markConversationRead,
  } = useParentMock();
  const [reminderSent, setReminderSent] = useState(false);

  const pinnedAnnouncement = useMemo(
    () => announcements.find((item) => item.isPinned) ?? announcements[0],
    [announcements]
  );
  const latestMessages = useMemo(() => conversations.slice(0, 2), [conversations]);
  const nextEvents = useMemo(() => events.slice(0, 2), [events]);

  return (
    <GradientLayout
      title="Parent Studio"
      subtitle={`${profile.parentName} - ${profile.childName} - ${profile.className}`}
    >
      <SectionCard
        title="Student Snapshot"
        subtitle={profile.schoolName}
        rightLabel={profile.academicYear}
      >
        <View style={styles.snapshotGrid}>
          <View style={styles.snapshotTile}>
            <Text style={styles.snapshotLabel}>Student</Text>
            <Text style={styles.snapshotValue}>{profile.childName}</Text>
          </View>
          <View style={styles.snapshotTile}>
            <Text style={styles.snapshotLabel}>Class</Text>
            <Text style={styles.snapshotValue}>{profile.className}</Text>
          </View>
          <View style={styles.snapshotTile}>
            <Text style={styles.snapshotLabel}>Number</Text>
            <Text style={styles.snapshotValue}>{profile.studentNumber}</Text>
          </View>
          <View style={styles.snapshotTile}>
            <Text style={styles.snapshotLabel}>Guardian</Text>
            <Text style={styles.snapshotValue}>{profile.relationship}</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard
        title="Live Metrics"
        subtitle="Daily overview"
        rightLabel="Mock mode"
        animateDelayMs={60}
      >
        <View style={styles.kpiRow}>
          <KpiTile value={`${attendanceRate}%`} label="Attendance" tone="blue" />
          <KpiTile value={String(unreadAnnouncementCount)} label="Unread notices" tone="orange" />
          <KpiTile value={String(unreadMessageCount)} label="Unread msgs" tone="green" />
        </View>
        <View style={styles.actionRow}>
          <ActionButton
            label="Read All Notices"
            onPress={() => {
              markAllAnnouncementsRead();
              showToast({ message: "All announcements marked as read.", tone: "success" });
            }}
          />
          <ActionButton
            label="Clear Inbox"
            onPress={() => {
              markAllConversationsRead();
              showToast({ message: "All conversations marked as read.", tone: "success" });
            }}
          />
        </View>
        <View style={styles.actionRow}>
          <ActionButton
            label={reminderSent ? "Reminder Sent" : "Send Daily Reminder"}
            onPress={() => {
              setReminderSent(true);
              showToast({ message: "Daily reminder is now active.", tone: "info" });
            }}
          />
          <ActionButton
            label="Sign out"
            onPress={() => {
              showToast({ message: "Signing out...", tone: "warn", durationMs: 700 });
              void signOut();
            }}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Spotlight Announcement"
        subtitle="Tap to mark as read"
        animateDelayMs={120}
      >
        {pinnedAnnouncement ? (
          <Pressable
            style={({ pressed }) => (pressed ? styles.itemPressed : null)}
            onPress={() => {
              markAnnouncementRead(pinnedAnnouncement.id);
              showToast({ message: "Announcement marked as read.", tone: "success" });
            }}
          >
            <InfoRow
              title={pinnedAnnouncement.title}
              detail={pinnedAnnouncement.content}
              badgeText={pinnedAnnouncement.isRead ? "Read" : "Unread"}
              badgeTone={announcementTone(pinnedAnnouncement.priority)}
            />
          </Pressable>
        ) : (
          <Text style={styles.emptyText}>No announcement available.</Text>
        )}
      </SectionCard>

      <SectionCard title="Recent Messages" subtitle="Tap to mark read" animateDelayMs={180}>
        {latestMessages.length === 0 ? (
          <Text style={styles.emptyText}>No conversation yet.</Text>
        ) : null}
        {latestMessages.map((conversation) => (
          <Pressable
            key={conversation.id}
            style={({ pressed }) => (pressed ? styles.itemPressed : null)}
            onPress={() => {
              markConversationRead(conversation.id);
              showToast({ message: `Marked ${conversation.participant} thread as read.`, tone: "success" });
            }}
          >
            <InfoRow
              title={conversation.participant}
              detail={conversation.preview}
              badgeText={
                conversation.unreadCount > 0
                  ? `${conversation.unreadCount} new`
                  : undefined
              }
              badgeTone={conversation.unreadCount > 0 ? "ok" : "info"}
            />
          </Pressable>
        ))}
      </SectionCard>

      <SectionCard title="Upcoming Events" subtitle="This week" animateDelayMs={240}>
        {nextEvents.length === 0 ? (
          <Text style={styles.emptyText}>No event available.</Text>
        ) : null}
        {nextEvents.map((event) => (
          <InfoRow
            key={event.id}
            title={event.title}
            detail={`${formatDateTime(event.startsAt)} - ${event.location}`}
            badgeText="Scheduled"
            badgeTone="info"
          />
        ))}
      </SectionCard>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  snapshotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  snapshotTile: {
    width: "47.8%",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.sm + 3,
    paddingVertical: spacing.sm + 2,
  },
  snapshotLabel: {
    color: colors.textMuted,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyRegular,
  },
  snapshotValue: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBodyStrong,
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm + 1,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  itemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
