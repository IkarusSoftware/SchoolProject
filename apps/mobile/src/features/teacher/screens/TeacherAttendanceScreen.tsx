import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { RequestState } from "../../../components/ui/RequestState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { getErrorMessage } from "../../../utils/errors";
import { formatDateOnly, humanizeEnum } from "../../../utils/format";
import { useAuth } from "../../auth/AuthProvider";

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  class: {
    id: string;
    name: string;
  } | null;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  status: string;
}

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

interface SubmitState {
  studentId: string;
  status: AttendanceStatus;
}

type BadgeTone = "info" | "warn" | "hot" | "ok";

function statusTone(status: string | undefined): BadgeTone {
  if (!status) return "info";
  if (status === "PRESENT") return "ok";
  if (status === "LATE") return "warn";
  return "hot";
}

function badgeStyleByTone(tone: BadgeTone, styles: ReturnType<typeof createStyles>) {
  if (tone === "ok") return styles.badgeok;
  if (tone === "warn") return styles.badgewarn;
  if (tone === "hot") return styles.badgehot;
  return styles.badgeinfo;
}

function createStyles() {
  return StyleSheet.create({
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
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    chipButton: {
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 1,
    },
    chipButtonActive: {
      backgroundColor: colors.accentBlue,
      borderColor: colors.accentBlue,
    },
    chipButtonText: {
      color: colors.textPrimary,
      fontSize: typography.bodyXS,
      fontFamily: typography.fontBodyStrong,
    },
    chipButtonTextActive: {
      color: colors.textWhite,
    },
    helperText: {
      color: colors.textMuted,
      fontSize: typography.bodySM,
      fontFamily: typography.fontBodyRegular,
    },
    studentRow: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surfaceSoft,
      padding: spacing.sm + 2,
      gap: spacing.xs,
    },
    studentInfo: {
      gap: 2,
    },
    studentName: {
      color: colors.textPrimary,
      fontSize: typography.bodyMD,
      fontFamily: typography.fontBodyStrong,
    },
    studentMeta: {
      color: colors.textMuted,
      fontSize: typography.bodySM,
      fontFamily: typography.fontBodyRegular,
    },
    actions: {
      flexDirection: "row",
      gap: spacing.xs,
    },
    statusButton: {
      flex: 1,
      minHeight: 34,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surfaceSoft,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xs,
    },
    statusButtonActive: {
      backgroundColor: colors.accentBlue,
      borderColor: colors.accentBlue,
    },
    statusButtonText: {
      color: colors.textPrimary,
      fontSize: typography.bodyXS,
      fontFamily: typography.fontBodyStrong,
    },
    statusButtonTextActive: {
      color: colors.textWhite,
    },
    badgeWrap: {
      alignItems: "flex-end",
    },
    statusBadge: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: typography.bodyXS,
      fontFamily: typography.fontBodyStrong,
    },
    badgeinfo: {
      backgroundColor: colors.badgeInfoBg,
      color: colors.badgeInfoText,
    },
    badgewarn: {
      backgroundColor: colors.badgeWarnBg,
      color: colors.badgeWarnText,
    },
    badgehot: {
      backgroundColor: colors.badgeHotBg,
      color: colors.badgeHotText,
    },
    badgeok: {
      backgroundColor: colors.badgeOkBg,
      color: colors.badgeOkText,
    },
    errorText: {
      color: colors.accentCoral,
      fontSize: typography.bodySM,
      fontFamily: typography.fontBodyRegular,
    },
    successText: {
      color: colors.accentGreen,
      fontSize: typography.bodySM,
      fontFamily: typography.fontBodyRegular,
    },
  });
}

const styles = createStyles();

export function TeacherAttendanceScreen() {
  const { authorizedRequest, user } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<SubmitState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const refreshing = loading && students.length > 0;

  const classOptions = useMemo(() => {
    const classMap = new Map<string, string>();
    students.forEach((student) => {
      if (student.class?.id) {
        classMap.set(student.class.id, student.class.name);
      }
    });

    return Array.from(classMap, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const classMatch =
        selectedClassId === "ALL" || student.class?.id === selectedClassId;
      const searchable = `${student.firstName} ${student.lastName} ${
        student.class?.name || ""
      }`.toLowerCase();
      const queryMatch =
        normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      return classMatch && queryMatch;
    });
  }, [searchQuery, selectedClassId, students]);

  useEffect(() => {
    if (
      selectedClassId !== "ALL" &&
      !classOptions.some((classOption) => classOption.id === selectedClassId)
    ) {
      setSelectedClassId("ALL");
    }
  }, [classOptions, selectedClassId]);

  const loadScreenData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [studentRows, attendanceRows] = await Promise.all([
        authorizedRequest<StudentRow[]>("/students?page=1&pageSize=50"),
        authorizedRequest<AttendanceRecord[]>(`/attendance?page=1&pageSize=200&date=${today}`),
      ]);

      const map: Record<string, string> = {};
      attendanceRows.forEach((record) => {
        map[record.studentId] = record.status;
      });

      setStudents(studentRows);
      setAttendanceMap(map);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Teacher attendance could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest, today]);

  useEffect(() => {
    void loadScreenData();
  }, [loadScreenData]);

  const markAttendance = useCallback(
    async (student: StudentRow, status: AttendanceStatus) => {
      setSubmitting({ studentId: student.id, status });
      setSubmitError(null);
      setSubmitSuccess(null);

      try {
        await authorizedRequest("/attendance", {
          method: "POST",
          body: JSON.stringify({
            studentId: student.id,
            classId: student.class?.id,
            date: today,
            status,
          }),
        });

        setAttendanceMap((prev) => ({ ...prev, [student.id]: status }));
        setSubmitSuccess(
          `${student.firstName} ${student.lastName} marked as ${humanizeEnum(status)}.`
        );
      } catch (requestError) {
        setSubmitError(getErrorMessage(requestError, "Attendance update failed."));
      } finally {
        setSubmitting(null);
      }
    },
    [authorizedRequest, today]
  );

  return (
    <GradientLayout
      title="Roll Call"
      subtitle={`${user?.firstName || "Teacher"} - ${formatDateOnly(today)}`}
      refreshing={refreshing}
      onRefresh={() => {
        void loadScreenData();
      }}
    >
      {loading && students.length === 0 ? <RequestState title="Attendance" mode="loading" /> : null}

      {error && students.length === 0 ? (
        <RequestState
          title="Attendance"
          mode="error"
          message={error}
          onRetry={() => {
            void loadScreenData();
          }}
        />
      ) : null}

      {!loading && !error && students.length === 0 ? (
        <RequestState
          title="Attendance"
          mode="empty"
          message="No students available for this teacher."
          onRetry={() => {
            void loadScreenData();
          }}
        />
      ) : null}

      {students.length > 0 ? (
        <SectionCard title="Filters" subtitle="Class and student name">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search student..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />

          <View style={styles.chipWrap}>
            <Pressable
              style={[
                styles.chipButton,
                selectedClassId === "ALL" ? styles.chipButtonActive : null,
              ]}
              onPress={() => {
                setSelectedClassId("ALL");
              }}
            >
              <Text
                style={[
                  styles.chipButtonText,
                  selectedClassId === "ALL" ? styles.chipButtonTextActive : null,
                ]}
              >
                All Classes
              </Text>
            </Pressable>
            {classOptions.map((classOption) => {
              const selected = selectedClassId === classOption.id;
              return (
                <Pressable
                  key={classOption.id}
                  style={[styles.chipButton, selected ? styles.chipButtonActive : null]}
                  onPress={() => {
                    setSelectedClassId(classOption.id);
                  }}
                >
                  <Text
                    style={[
                      styles.chipButtonText,
                      selected ? styles.chipButtonTextActive : null,
                    ]}
                  >
                    {classOption.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.helperText}>
            Showing {filteredStudents.length} of {students.length} students
          </Text>
        </SectionCard>
      ) : null}

      {submitError ? (
        <SectionCard title="Update Error">
          <Text style={styles.errorText}>{submitError}</Text>
        </SectionCard>
      ) : null}

      {submitSuccess ? (
        <SectionCard title="Update Status">
          <Text style={styles.successText}>{submitSuccess}</Text>
        </SectionCard>
      ) : null}

      {students.length > 0 ? (
        <SectionCard title="Student List" subtitle="Tap a status to mark today">
          {filteredStudents.length === 0 ? (
            <Text style={styles.helperText}>No students match this filter.</Text>
          ) : null}

          {filteredStudents.map((student) => {
            const activeStatus = attendanceMap[student.id];
            const isBusy = submitting?.studentId === student.id;
            const tone = statusTone(activeStatus);

            return (
              <View key={student.id} style={styles.studentRow}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={styles.studentMeta}>
                    {student.class?.name || "No class"} - {humanizeEnum(activeStatus || "PENDING")}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {(["PRESENT", "ABSENT", "LATE"] as const).map((status) => {
                    const selected = activeStatus === status;
                    return (
                      <Pressable
                        key={status}
                        style={[styles.statusButton, selected ? styles.statusButtonActive : null]}
                        disabled={Boolean(submitting)}
                        onPress={() => {
                          void markAttendance(student, status);
                        }}
                      >
                        {isBusy && submitting?.status === status ? (
                          <ActivityIndicator size="small" color={colors.textWhite} />
                        ) : (
                          <Text
                            style={[
                              styles.statusButtonText,
                              selected ? styles.statusButtonTextActive : null,
                            ]}
                          >
                            {humanizeEnum(status)}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.badgeWrap}>
                  <Text style={[styles.statusBadge, badgeStyleByTone(tone, styles)]}>
                    {humanizeEnum(activeStatus || "PENDING")}
                  </Text>
                </View>
              </View>
            );
          })}
        </SectionCard>
      ) : null}
    </GradientLayout>
  );
}
