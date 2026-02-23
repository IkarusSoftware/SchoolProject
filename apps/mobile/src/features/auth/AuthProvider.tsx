import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { clearSession, loadSession, saveSession, saveUser } from "./storage";
import type { AuthStatus, AuthTokens, AuthUser } from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:4000/api/v1"
    : "http://localhost:4000/api/v1");

type AuthorizedRequest = <T>(
  path: string,
  init?: RequestInit
) => Promise<T>;

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  authorizedRequest: AuthorizedRequest;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success || payload.data === undefined) {
    const message =
      payload?.error?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload?.error?.code);
  }

  return payload.data;
}

function normalizeUser(input: AuthUser): AuthUser {
  return {
    id: input.id,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    avatar: input.avatar ?? null,
    tenantId: input.tenantId ?? null,
  };
}

interface LoginData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface RefreshData {
  accessToken: string;
  refreshToken: string;
}

interface MeData {
  user: AuthUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const tokensRef = useRef<AuthTokens | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthTokens | null> | null>(null);

  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  const signOut = useCallback(async (): Promise<void> => {
    const activeToken = tokensRef.current?.accessToken;
    if (activeToken) {
      try {
        await requestJson<{ message: string }>(
          "/auth/logout",
          { method: "POST" },
          activeToken
        );
      } catch {
        // ignore logout network errors during local cleanup
      }
    }

    await clearSession();
    tokensRef.current = null;
    setTokens(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshTokens = useCallback(async (): Promise<AuthTokens | null> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const activeTokens = tokensRef.current;
    if (!activeTokens?.refreshToken) {
      return null;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const refreshData = await requestJson<RefreshData>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken: activeTokens.refreshToken }),
        });

        const nextTokens: AuthTokens = {
          accessToken: refreshData.accessToken,
          refreshToken: refreshData.refreshToken,
        };

        tokensRef.current = nextTokens;
        setTokens(nextTokens);
        await saveSession(nextTokens, user);
        return nextTokens;
      } catch {
        await clearSession();
        tokensRef.current = null;
        setTokens(null);
        setUser(null);
        setStatus("unauthenticated");
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [user]);

  const authorizedRequest = useCallback<AuthorizedRequest>(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const activeTokens = tokensRef.current;
      if (!activeTokens?.accessToken) {
        throw new ApiError("Not authenticated", 401, "UNAUTHORIZED");
      }

      try {
        return await requestJson<T>(path, init, activeTokens.accessToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }

        const refreshed = await refreshTokens();
        if (!refreshed?.accessToken) {
          throw error;
        }

        return requestJson<T>(path, init, refreshed.accessToken);
      }
    },
    [refreshTokens]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      const loginData = await requestJson<LoginData>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const nextUser = normalizeUser(loginData.user);
      const nextTokens: AuthTokens = {
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
      };

      tokensRef.current = nextTokens;
      setTokens(nextTokens);
      setUser(nextUser);
      setStatus("authenticated");
      await saveSession(nextTokens, nextUser);
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const session = await loadSession();
      if (!mounted) return;

      if (!session.tokens) {
        setStatus("unauthenticated");
        return;
      }

      tokensRef.current = session.tokens;
      setTokens(session.tokens);
      if (session.user) {
        setUser(normalizeUser(session.user));
      }

      try {
        const me = await requestJson<MeData>(
          "/auth/me",
          {},
          session.tokens.accessToken
        );
        if (!mounted) return;
        const normalizedUser = normalizeUser(me.user);
        setUser(normalizedUser);
        setStatus("authenticated");
        await saveSession(session.tokens, normalizedUser);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshed = await refreshTokens();
          if (!mounted) return;

          if (!refreshed) {
            setStatus("unauthenticated");
            return;
          }

          try {
            const me = await requestJson<MeData>(
              "/auth/me",
              {},
              refreshed.accessToken
            );
            if (!mounted) return;
            const normalizedUser = normalizeUser(me.user);
            setUser(normalizedUser);
            setStatus("authenticated");
            await saveUser(normalizedUser);
          } catch {
            if (!mounted) return;
            await clearSession();
            tokensRef.current = null;
            setTokens(null);
            setUser(null);
            setStatus("unauthenticated");
          }
        } else {
          if (!mounted) return;
          await clearSession();
          tokensRef.current = null;
          setTokens(null);
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [refreshTokens]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn,
      signOut,
      authorizedRequest,
    }),
    [authorizedRequest, signIn, signOut, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export type { AuthorizedRequest, ApiError };

