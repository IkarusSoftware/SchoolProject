import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useToast } from "../../../components/feedback/ToastProvider";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { KpiTile } from "../../../components/ui/KpiTile";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { formatDateOnly, humanizeEnum } from "../../../utils/format";
import { useParentMock } from "../mock/ParentMockProvider";

type PeriodFilter = "LAST_7" | "LAST_30";

function statusTone(status: string) {
  if (status === "PRESENT") return "ok" as const;
  if (status === "LATE") return "warn" as const;
  if (status === "EXCUSED") return "info" as const;
  return "hot" as const;
}

function daysDiffFromNow(dateValue: string) {
  const date = new Date(dateValue);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export function AttendanceScreen() {
  const { showToast } = useToast();
  const { profile, attendance } = useParentMock();
  const [period, setPeriod] = useState<PeriodFilter>("LAST_7");
  const [noteCreated, setNoteCreated] = useState(false);

  const visibleRecords = useMemo(() => {
    const maxDays = period === "LAST_7" ? 7 : 30;
    return attendance.filter((record) => daysDiffFromNow(record.date) <= maxDays);
  }, [attendance, period]);

  const presentCount = visibleRecords.filter((record) => record.status === "PRESENT").length;
  const lateCount = visibleRecords.filter((record) => record.status === "LATE").length;
  const absentCount = visibleRecords.filter((record) => record.status === "ABSENT").length;

  return (
    <GradientLayout
      title="Attendance"
      subtitle={`${profile.childName} - ${profile.className}`}
    >
      <SectionCard title="Period Filter" subtitle="Switch timeline range">
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => {
              setPeriod("LAST_7");
              showToast({ message: "Showing last 7 days.", tone: "info" });
            }}
            style={({ pressed }) => [
              styles.filterButton,
              period === "LAST_7" ? styles.filterButtonActive : null,
              pressed ? styles.filterButtonPressed : null,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                period === "LAST_7" ? styles.filterButtonTextActive : null,
              ]}
            >
              Last 7 days
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setPeriod("LAST_30");
              showToast({ message: "Showing last 30 days.", tone: "info" });
            }}
            style={({ pressed }) => [
              styles.filterButton,
              period === "LAST_30" ? styles.filterButtonActive : null,
              pressed ? styles.filterButtonPressed : null,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                period === "LAST_30" ? styles.filterButtonTextActive : null,
              ]}
            >
              Last 30 days
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => {
            setNoteCreated(true);
            showToast({ message: "Excuse note draft created.", tone: "success" });
          }}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed ? styles.secondaryButtonPressed : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Create excuse note draft</Text>
        </Pressable>
        {noteCreated ? (
          <Text style={styles.successText}>
            Excuse draft is ready. You can submit it from parent office panel.
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Summary"
        subtitle={`${visibleRecords.length} records`}
        animateDelayMs={80}
      >
        <View style={styles.kpiRow}>
          <KpiTile value={String(presentCount)} label="Present" tone="green" />
          <KpiTile value={String(lateCount)} label="Late" tone="orange" />
          <KpiTile value={String(absentCount)} label="Absent" tone="blue" />
        </View>
      </SectionCard>

      <SectionCard title="Timeline" subtitle="Latest entries" animateDelayMs={150}>
        {visibleRecords.length === 0 ? (
          <Text style={styles.emptyText}>No attendance record for selected period.</Text>
        ) : null}
        {visibleRecords.map((record) => (
          <InfoRow
            key={record.id}
            title={`${formatDateOnly(record.date)} - ${record.course}`}
            detail={`${record.teacher}${record.note ? ` - ${record.note}` : ""}`}
            badgeText={humanizeEnum(record.status)}
            badgeTone={statusTone(record.status)}
          />
        ))}
      </SectionCard>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    borderColor: colors.accentBlue,
    backgroundColor: colors.accentBlue,
  },
  filterButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  filterButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  filterButtonTextActive: {
    color: colors.textWhite,
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
  successText: {
    color: colors.accentGreen,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
});
