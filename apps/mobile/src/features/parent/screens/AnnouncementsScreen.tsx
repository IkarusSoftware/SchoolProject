import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useToast } from "../../../components/feedback/ToastProvider";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { formatDateTime, humanizeEnum } from "../../../utils/format";
import { useParentMock } from "../mock/ParentMockProvider";

type AnnouncementFilter = "ALL" | "UNREAD" | "PINNED";

function priorityTone(priority: string) {
  if (priority === "URGENT") return "hot" as const;
  if (priority === "HIGH") return "warn" as const;
  if (priority === "LOW") return "ok" as const;
  return "info" as const;
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active ? styles.filterChipActive : null,
        pressed ? styles.filterChipPressed : null,
      ]}
    >
      <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function AnnouncementsScreen() {
  const { showToast } = useToast();
  const {
    profile,
    announcements,
    markAnnouncementRead,
    toggleAnnouncementPinned,
    markAllAnnouncementsRead,
  } = useParentMock();
  const [filter, setFilter] = useState<AnnouncementFilter>("ALL");
  const [query, setQuery] = useState("");

  const visibleAnnouncements = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return announcements.filter((item) => {
      const filterMatch =
        filter === "ALL"
          ? true
          : filter === "UNREAD"
            ? !item.isRead
            : item.isPinned;
      const queryMatch =
        normalized.length === 0 ||
        `${item.title} ${item.content} ${item.category}`
          .toLowerCase()
          .includes(normalized);
      return filterMatch && queryMatch;
    });
  }, [announcements, filter, query]);

  return (
    <GradientLayout
      title="Announcements"
      subtitle={`${profile.childName} - School feed`}
    >
      <SectionCard title="Controls" subtitle="Filter and search">
        <View style={styles.filterRow}>
          <FilterChip
            label="All"
            active={filter === "ALL"}
            onPress={() => {
              setFilter("ALL");
            }}
          />
          <FilterChip
            label="Unread"
            active={filter === "UNREAD"}
            onPress={() => {
              setFilter("UNREAD");
            }}
          />
          <FilterChip
            label="Pinned"
            active={filter === "PINNED"}
            onPress={() => {
              setFilter("PINNED");
            }}
          />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search announcement..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        <Pressable
          onPress={() => {
            markAllAnnouncementsRead();
            showToast({ message: "All announcements marked as read.", tone: "success" });
          }}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed ? styles.secondaryButtonPressed : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Mark all as read</Text>
        </Pressable>
      </SectionCard>

      <SectionCard
        title="Published Notices"
        subtitle={`${visibleAnnouncements.length} items`}
        animateDelayMs={80}
      >
        {visibleAnnouncements.length === 0 ? (
          <Text style={styles.emptyText}>No announcement matches this filter.</Text>
        ) : null}

        {visibleAnnouncements.map((item) => (
          <View key={item.id} style={styles.announcementCard}>
            <Pressable
              style={({ pressed }) => (pressed ? styles.itemPressed : null)}
              onPress={() => {
                markAnnouncementRead(item.id);
                showToast({ message: "Announcement marked as read.", tone: "success" });
              }}
            >
              <InfoRow
                title={item.title}
                detail={`${item.content} - ${formatDateTime(item.createdAt)}`}
                badgeText={`${humanizeEnum(item.priority)} ${item.isRead ? "- read" : "- unread"}`}
                badgeTone={priorityTone(item.priority)}
              />
            </Pressable>
            <View style={styles.announcementFooter}>
              <Text style={styles.categoryText}>{item.category}</Text>
              <Pressable
                onPress={() => {
                  toggleAnnouncementPinned(item.id);
                  showToast({
                    message: item.isPinned
                      ? "Announcement unpinned."
                      : "Announcement pinned to top.",
                    tone: "info",
                  });
                }}
                style={({ pressed }) => [
                  styles.pinButton,
                  pressed ? styles.pinButtonPressed : null,
                ]}
              >
                <Text style={styles.pinButtonText}>
                  {item.isPinned ? "Unpin" : "Pin"}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </SectionCard>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  filterChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  filterChipActive: {
    borderColor: colors.accentBlue,
    backgroundColor: colors.accentBlue,
  },
  filterChipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
  },
  filterChipTextActive: {
    color: colors.textWhite,
  },
  searchInput: {
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBody,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  secondaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  announcementCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  announcementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyRegular,
  },
  pinButton: {
    borderRadius: radius.pill,
    backgroundColor: "rgba(16,185,129,0.06)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pinButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  pinButtonText: {
    color: colors.accentBlue,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  itemPressed: {
    opacity: 0.92,
  },
});
