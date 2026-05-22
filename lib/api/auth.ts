export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
}

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
}

export interface AuthData {
  user: AuthUser;
  session: AuthSession;
}

async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  return response.json() as Promise<ApiResponse<T>>;
}

export const authApi = {
  register(input: { email: string; password: string; fullName: string }) {
    return request<AuthData>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string; rememberMe?: boolean }) {
    return request<AuthData>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  logout() {
    return request<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return request<AuthUser & { avatarUrl: string | null; isAdmin: boolean }>(
      "/api/auth/me",
    );
  },

  forgotPassword(input: { email: string }) {
    return request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  resetPassword(input: { password: string }) {
    return request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
