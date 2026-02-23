import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useToast } from "../../../components/feedback/ToastProvider";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { formatDateOnly, humanizeEnum } from "../../../utils/format";
import { useParentMock } from "../mock/ParentMockProvider";

export function MealsScreen() {
  const { showToast } = useToast();
  const { profile, meals } = useParentMock();
  const [selectedMealId, setSelectedMealId] = useState(meals[0]?.id ?? "");
  const [reminderSet, setReminderSet] = useState(false);

  const selectedMeal = useMemo(
    () => meals.find((meal) => meal.id === selectedMealId) ?? meals[0],
    [meals, selectedMealId]
  );

  return (
    <GradientLayout
      title="Meals"
      subtitle={`${profile.childName} - Weekly plan`}
    >
      <SectionCard title="Day Selector" subtitle="Choose a day">
        <View style={styles.dayChipRow}>
          {meals.map((meal) => {
            const selected = selectedMeal?.id === meal.id;
            return (
              <Pressable
                key={meal.id}
                style={({ pressed }) => [
                  styles.dayChip,
                  selected ? styles.dayChipActive : null,
                  pressed ? styles.dayChipPressed : null,
                ]}
                onPress={() => {
                  setSelectedMealId(meal.id);
                  showToast({ message: `${meal.dayLabel} menu selected.`, tone: "info" });
                }}
              >
                <Text style={[styles.dayChipText, selected ? styles.dayChipTextActive : null]}>
                  {meal.dayLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      {selectedMeal ? (
        <SectionCard
          title={`${selectedMeal.dayLabel} Menu`}
          subtitle={`${formatDateOnly(selectedMeal.date)} - ${humanizeEnum(selectedMeal.mealType)}`}
          rightLabel={`${selectedMeal.calories} kcal`}
          animateDelayMs={90}
        >
          {selectedMeal.menuItems.map((item, index) => (
            <InfoRow
              key={`${selectedMeal.id}-${item}`}
              title={`Item ${index + 1}`}
              detail={item}
            />
          ))}

          <View style={styles.allergenRow}>
            <Text style={styles.allergenTitle}>Allergens:</Text>
            <Text style={styles.allergenValue}>
              {selectedMeal.allergens.length > 0
                ? selectedMeal.allergens.join(", ")
                : "No listed allergen"}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.reminderButton,
              pressed ? styles.reminderButtonPressed : null,
            ]}
            onPress={() => {
              setReminderSet(true);
              showToast({ message: "Meal reminder enabled.", tone: "success" });
            }}
          >
            <Text style={styles.reminderButtonText}>
              {reminderSet ? "Menu reminder set" : "Set meal reminder"}
            </Text>
          </Pressable>
        </SectionCard>
      ) : (
        <SectionCard title="Menu">
          <Text style={styles.emptyText}>No menu data available.</Text>
        </SectionCard>
      )}
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  dayChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  dayChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#bdd3e4",
    backgroundColor: "#eff8ff",
    paddingHorizontal: spacing.sm + 3,
    paddingVertical: spacing.xs + 2,
  },
  dayChipActive: {
    borderColor: colors.accentBlue,
    backgroundColor: colors.accentBlue,
  },
  dayChipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  dayChipText: {
    color: colors.textPrimary,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
  },
  dayChipTextActive: {
    color: colors.textWhite,
  },
  allergenRow: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#d2e1ed",
    backgroundColor: "#f8fcff",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  allergenTitle: {
    color: colors.textMuted,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyRegular,
  },
  allergenValue: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  reminderButton: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#bbd3e5",
    backgroundColor: "#eff8ff",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  reminderButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  reminderButtonText: {
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
