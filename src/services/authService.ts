import { API } from '../config/api'

const jsonHeaders = { 'Content-Type': 'application/json' }

function authHeaders() {
  const token = localStorage.getItem('access_token')
  return { ...jsonHeaders, Authorization: `Bearer ${token}` }
}

export async function apiRegister(data: {
  name: string
  email: string
  password: string
}) {
  const res = await fetch(API.auth.register, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Error al registrar')
  return json
}

// ← captchaToken agregado aquí
export async function apiLogin(data: {
  email: string
  password: string
  captchaToken?: string
}) {
  const res = await fetch(API.auth.login, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Credenciales inválidas')
  if (json.accessToken) {
    localStorage.setItem('access_token',  json.accessToken)
    localStorage.setItem('refresh_token', json.refreshToken)
    localStorage.setItem('user_id',       json.userId)
    localStorage.setItem('user_email',    json.email)
    localStorage.setItem('user_roles',    JSON.stringify(json.roles))
  }
  return json
}

export async function apiLogout() {
  await fetch(API.auth.logout, {
    method: 'POST',
    headers: authHeaders()
  })
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
  localStorage.removeItem('user_roles')
}

export async function apiGetMe() {
  const res = await fetch(API.auth.me, {
    headers: authHeaders()
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'No autorizado')
  return json
}

export async function apiForgotPassword(email: string, captchaToken?: string) {
  const res = await fetch(API.auth.forgotPassword, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, captchaToken })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Error al enviar correo')
  return json
}

export async function apiResetPassword(data: {
  token: string
  newPassword: string
  captchaToken?: string
}) {
  const res = await fetch(API.auth.resetPassword, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Error al restablecer contraseña')
  return json
}

export async function apiRefreshToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) throw new Error('No hay refresh token')
  const res = await fetch(API.auth.refresh, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ refresh_token: refreshToken })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Sesión expirada')
  if (json.accessToken) {
    localStorage.setItem('access_token', json.accessToken)
  }
  return json
}
