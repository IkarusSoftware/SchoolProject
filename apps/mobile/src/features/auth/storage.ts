import * as SecureStore from "expo-secure-store";
import type { AuthTokens, AuthUser } from "./types";

const TOKENS_KEY = "edusync_mobile_tokens";
const USER_KEY = "edusync_mobile_user";

export interface StoredSession {
  tokens: AuthTokens | null;
  user: AuthUser | null;
}

export async function loadSession(): Promise<StoredSession> {
  const [tokensRaw, userRaw] = await Promise.all([
    SecureStore.getItemAsync(TOKENS_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  const tokens = tokensRaw ? (JSON.parse(tokensRaw) as AuthTokens) : null;
  const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;

  return { tokens, user };
}

export async function saveSession(
  tokens: AuthTokens,
  user: AuthUser | null
): Promise<void> {
  await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
  if (user) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

export async function saveUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKENS_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

