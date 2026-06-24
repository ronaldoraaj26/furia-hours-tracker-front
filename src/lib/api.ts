const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const getAuthToken = () => localStorage.getItem("furia_auth_token");

export const setAuthToken = (token: string | null, expiresAt?: string | null) => {
  if (token) {
    localStorage.setItem("furia_auth_token", token);
    if (expiresAt) {
      localStorage.setItem("furia_auth_expires_at", expiresAt);
    } else {
      localStorage.removeItem("furia_auth_expires_at");
    }
    return;
  }

  localStorage.removeItem("furia_auth_token");
  localStorage.removeItem("furia_auth_expires_at");
};

export const clearAuth = () => {
  localStorage.removeItem("furia_auth_token");
  localStorage.removeItem("furia_auth_expires_at");
};

const resolveUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
};

const readPayload = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers);
  const token = getAuthToken();

  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Token ${token}`);
  }

  const response = await fetch(resolveUrl(path), {
    credentials: "include",
    ...init,
    headers,
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    const fallbackMessage = response.status === 401
      ? "Sua sessão expirou. Faça login novamente."
      : response.status === 403
        ? "Você não tem permissão para realizar esta ação."
        : response.status === 400
          ? "Os dados enviados estão inválidos."
          : "Falha na requisição";

    const message =
      typeof payload === "string"
        ? payload
        : (payload as { detail?: string; message?: string; error?: string; non_field_errors?: string[] }).detail ??
          (payload as { detail?: string; message?: string; error?: string; non_field_errors?: string[] }).message ??
          (payload as { detail?: string; message?: string; error?: string; non_field_errors?: string[] }).error ??
          (payload as { detail?: string; message?: string; error?: string; non_field_errors?: string[] }).non_field_errors?.[0] ??
          fallbackMessage;

    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
};

