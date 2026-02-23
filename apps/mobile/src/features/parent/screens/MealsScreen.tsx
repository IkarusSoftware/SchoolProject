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

interface MealItem {
  id: string;
  name: string;
}

interface MealMenu {
  id: string;
  date: string;
  mealType: string;
  items: MealItem[];
}

export function MealsScreen() {
  const { authorizedRequest, user } = useAuth();
  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await authorizedRequest<MealMenu[]>("/meals?page=1&pageSize=20");
      setMenus(list);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Meals could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    void loadMeals();
  }, [loadMeals]);

  return (
    <GradientLayout title="Meals" subtitle={`${user?.firstName || "Parent"} · Weekly kitchen plan`}>
      {loading && menus.length === 0 ? <RequestState title="Meals" mode="loading" /> : null}

      {error && menus.length === 0 ? (
        <RequestState
          title="Meals"
          mode="error"
          message={error}
          onRetry={() => {
            void loadMeals();
          }}
        />
      ) : null}

      {!loading && !error && menus.length === 0 ? (
        <RequestState
          title="Meals"
          mode="empty"
          message="No meal menus published."
          onRetry={() => {
            void loadMeals();
          }}
        />
      ) : null}

      {menus.length > 0 ? (
        <SectionCard title="Menu Calendar" subtitle="Breakfast, lunch, dinner, snack">
          {menus.map((item) => (
            <InfoRow
              key={item.id}
              title={`${formatDateOnly(item.date)} · ${humanizeEnum(item.mealType)}`}
              detail={item.items.length > 0 ? item.items.map((menuItem) => menuItem.name).join(" · ") : "No items"}
            />
          ))}
        </SectionCard>
      ) : null}

      {error && menus.length > 0 ? (
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
