import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

type ToastTone = "info" | "success" | "warn";

interface ToastInput {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
}

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number;
}

interface ToastContextValue {
  showToast: (input: ToastInput) => void;
}

const toneMap: Record<ToastTone, { bg: string; text: string; border: string }> = {
  info: {
    bg: "#e6f3ff",
    text: "#104f73",
    border: "#bdddf4",
  },
  success: {
    bg: "#dff6ea",
    text: "#0f6f46",
    border: "#b8e8cf",
  },
  warn: {
    bg: "#fff0dc",
    text: "#875008",
    border: "#f2d1a7",
  },
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (!hideTimerRef.current) return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const hideToast = useCallback(
    (id: number) => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 14,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) return;
        setToast((current) => (current?.id === id ? null : current));
      });
    },
    [opacity, translateY]
  );

  const showToast = useCallback(
    ({ message, tone = "info", durationMs = 1800 }: ToastInput) => {
      clearHideTimer();
      const id = Date.now();
      setToast({
        id,
        message,
        tone,
        durationMs,
      });
    },
    [clearHideTimer]
  );

  useEffect(() => {
    if (!toast) return;

    opacity.setValue(0);
    translateY.setValue(14);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    hideTimerRef.current = setTimeout(() => {
      hideToast(toast.id);
    }, toast.durationMs);

    return clearHideTimer;
  }, [clearHideTimer, hideToast, opacity, toast, translateY]);

  useEffect(
    () => () => {
      clearHideTimer();
    },
    [clearHideTimer]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
    }),
    [showToast]
  );

  const toneStyle = toneMap[toast?.tone ?? "info"];

  return (
    <ToastContext.Provider value={contextValue}>
      <View style={styles.root}>
        {children}
        <View pointerEvents="none" style={styles.overlay}>
          {toast ? (
            <Animated.View
              style={[
                styles.toast,
                {
                  opacity,
                  transform: [{ translateY }],
                  backgroundColor: toneStyle.bg,
                  borderColor: toneStyle.border,
                },
              ]}
            >
              <Text style={[styles.toastText, { color: toneStyle.text }]}>
                {toast.message}
              </Text>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: 116,
  },
  toast: {
    minWidth: "72%",
    maxWidth: "96%",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 1,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  toastText: {
    textAlign: "center",
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
});
