import api from "../config/api";

// ── Tipos (sin cambios) ───────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  photoUrl: string | null;
  provider: "LOCAL" | "GOOGLE";
  hasPassword: boolean;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  maxFolders: number;
  maxTags: number;
  maxFavorites: number;
}

export interface UsersPage {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UserLimits {
  maxFolders: number;
  maxTags: number;
  maxFavorites: number;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type UserProfileResponse = UserResponse;

// ── Perfil propio ─────────────────────────────────────────────────────────────

export async function apiGetMe(): Promise<UserResponse> {
  const res = await api.get<UserResponse>("/api/users/me"); // ✅ /api/
  return res.data;
}

export async function apiUpdateProfile(
  data: UpdateProfilePayload,
): Promise<UserResponse> {
  const res = await api.put<UserResponse>("/api/users/me", data); // ✅
  return res.data;
}

export async function apiChangePassword(
  data: ChangePasswordPayload,
): Promise<void> {
  await api.put("/api/users/me/password", data); // ✅
}

// ── Panel admin ───────────────────────────────────────────────────────────────

export async function apiGetAllUsers(
  params: { page?: number; size?: number; search?: string } = {},
): Promise<UsersPage> {
  const res = await api.get<UsersPage>("/api/users", { params }); // ✅
  return res.data;
}

export async function apiUpdateRole(
  id: number,
  role: "USER" | "ADMIN",
): Promise<UserResponse> {
  const res = await api.put<UserResponse>(`/api/users/${id}/role`, null, {
    params: { role },
  });
  return res.data;
}

export async function apiToggleStatus(id: number): Promise<UserResponse> {
  const res = await api.put<UserResponse>(`/api/users/${id}/status`);
  return res.data;
}

export async function apiDeleteUser(id: number): Promise<void> {
  await api.delete(`/api/users/${id}`);
}

// ── Límites ───────────────────────────────────────────────────────────────────

export async function apiGetLimits(id: number): Promise<UserLimits> {
  const res = await api.get<UserLimits>(`/api/users/${id}/limits`);
  return res.data;
}

export async function apiUpdateLimits(
  id: number,
  limits: UserLimits,
): Promise<UserResponse> {
  const res = await api.put<UserResponse>(`/api/users/${id}/limits`, limits);
  return res.data;
}
