import { API, JwtResponse, MeResponse } from '../config/api'

// ── Helpers localStorage ──────────────────────────────────────────────────────

function saveSession(data: JwtResponse) {
  localStorage.setItem('authToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('user_id', String(data.userId))
  localStorage.setItem('user_email', data.email)
  localStorage.setItem('user_roles', JSON.stringify(data.roles))
  localStorage.setItem('user_name', data.email.split('@')[0]) // fallback hasta tener endpoint de perfil
}

function clearSession() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
  localStorage.removeItem('user_roles')
  localStorage.removeItem('user_name')
}

// ── Auth API calls ────────────────────────────────────────────────────────────

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
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No hay refresh token')
  const response = await API.auth.refresh(refreshToken)
  localStorage.setItem('authToken', response.data.accessToken)
  localStorage.setItem('refreshToken', response.data.refreshToken)
}

export async function apiGoogleLogin(credential: string): Promise<JwtResponse> {
  const response = await API.auth.googleLogin(credential)
  saveSession(response.data)
  return response.data
}
