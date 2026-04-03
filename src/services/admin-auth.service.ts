const ADMIN_AUTH_STORAGE_KEY = 'sibradanca.admin.basic'

export type AdminCredentials = {
  username: string
  password: string
}

export function saveAdminCredentials({ username, password }: AdminCredentials) {
  const token = window.btoa(`${username}:${password}`)
  window.sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, token)
}

export function getAdminAuthToken() {
  return window.sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY)
}

export function hasAdminSession() {
  return Boolean(getAdminAuthToken())
}

export function clearAdminCredentials() {
  window.sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
}

export function getAdminAuthHeader() {
  const token = getAdminAuthToken()
  return token ? `Basic ${token}` : null
}
