import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { RequestState } from "../../../components/ui/RequestState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { typography } from "../../../theme";
import { getErrorMessage } from "../../../utils/errors";
import { formatDateOnly, humanizeEnum } from "../../../utils/format";
import { useAuth } from "../../auth/AuthProvider";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  notes?: string | null;
  student?: {
    firstName: string;
    lastName: string;
  } | null;
}

function statusTone(status: string) {
  if (status === "PRESENT") return "ok" as const;
  if (status === "LATE") return "warn" as const;
  if (status === "EXCUSED") return "info" as const;
  return "hot" as const;
}

export function AttendanceScreen() {
  const { authorizedRequest, user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await authorizedRequest<AttendanceRecord[]>("/attendance?page=1&pageSize=20");
      setRecords(list);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Attendance data could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  return (
    <GradientLayout
      title="Attendance"
      subtitle={`${user?.firstName || "Parent"} · Last attendance records`}
    >
      {loading && records.length === 0 ? (
        <RequestState title="Attendance" mode="loading" />
      ) : null}

      {error && records.length === 0 ? (
        <RequestState
          title="Attendance"
          mode="error"
          message={error}
          onRetry={() => {
            void loadAttendance();
          }}
        />
      ) : null}

      {!loading && !error && records.length === 0 ? (
        <RequestState
          title="Attendance"
          mode="empty"
          message="No attendance records found."
          onRetry={() => {
            void loadAttendance();
          }}
        />
      ) : null}

      {records.length > 0 ? (
        <SectionCard title="Weekly Timeline" subtitle="Latest lessons">
          {records.map((item) => (
            <InfoRow
              key={item.id}
              title={formatDateOnly(item.date)}
              detail={
                item.student
                  ? `${item.student.firstName} ${item.student.lastName}`
                  : item.notes || "No additional notes."
              }
              badgeText={humanizeEnum(item.status)}
              badgeTone={statusTone(item.status)}
            />
          ))}
        </SectionCard>
      ) : null}

      {error && records.length > 0 ? (
        <Text
          style={{
            color: "#ffe7e7",
            fontSize: typography.bodySM,
            fontFamily: typography.fontBody,
          }}
        >
          Warning: {error}
        </Text>
      ) : null}
    </GradientLayout>
  );
}
