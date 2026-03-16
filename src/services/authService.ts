import { API, JwtResponse, MeResponse } from '../config/api'
import { STORAGE_KEYS } from '@/config/storageKeys'

// Solo guardamos tokens, el resto lo da apiGetMe()
function saveSession(data: JwtResponse) {
  // Limpiar datos de sesión anterior antes de guardar la nueva
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
  localStorage.removeItem('user_roles')
  localStorage.removeItem('user_name')
  // Guardar nueva sesión
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function apiLogin(data: {
  email: string
  password: string
  recaptchaToken?: string
}): Promise<JwtResponse> {
  const response = await API.auth.login({
    email: data.email,
    password: data.password,
    recaptchaToken: data.recaptchaToken
  })
  saveSession(response.data)
  return response.data
}

export async function apiRegister(data: {
  name?: string
  email: string
  password: string
  recaptchaToken?: string
}): Promise<{ message: string }> {
  const response = await API.auth.register({
    email: data.email,
    password: data.password,
    name: data.name,
    recaptchaToken: data.recaptchaToken
  })
  return response.data
}

export async function apiLogout(): Promise<void> {
  try {
    await API.auth.logout()
  } finally {
    clearSession()
  }
}

export async function apiGetMe(): Promise<MeResponse> {
  const response = await API.auth.me()
  return response.data
}

export async function apiForgotPassword(
  email: string,
  recaptchaToken?: string
): Promise<{ message: string }> {
  const response = await API.auth.forgotPassword({ email, recaptchaToken })
  return response.data
}

export async function apiResetPassword(data: {
  token: string
  newPassword: string
}): Promise<{ message: string }> {
  const response = await API.auth.resetPassword({
    token: data.token,
    newPassword: data.newPassword
  })
  return response.data
}

export async function apiRefreshToken(): Promise<void> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) throw new Error("No hay refresh token");
  const response = await API.auth.refresh(refreshToken);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
}

export function saveOAuthSession(accessToken: string, refreshToken?: string): void {
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
  localStorage.removeItem('user_roles')
  localStorage.removeItem('user_name')
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
}


