export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: unknown = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "No se puede conectar con la API. Comprueba que el backend está arrancado y que CORS está configurado.",
      0
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      response.status === 403
        ? "No tienes permiso para realizar esta acción."
        : data?.error ?? data?.message ?? "Error en la petición";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export function responseData<T>(response: T | { data: T }): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return response.data;
  }
  return response as T;
}
