import { NativeModules, Platform } from "react-native";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function getHostFromScriptUrl(): string | null {
  const scriptURL = NativeModules?.SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) {
    return null;
  }

  try {
    return new URL(scriptURL).hostname;
  } catch {
    // Fallback for non-standard scriptURL values.
    const match = scriptURL.match(/https?:\/\/([^/:]+)/i);
    return match?.[1] ?? null;
  }
}

export function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (explicit) {
    return normalizeBaseUrl(explicit);
  }

  const metroHost = getHostFromScriptUrl();
  if (metroHost) {
    return `http://${metroHost}:4000/api/v1`;
  }

  return Platform.OS === "android"
    ? "http://10.0.2.2:4000/api/v1"
    : "http://localhost:4000/api/v1";
}

export const API_BASE_URL = resolveApiBaseUrl();
