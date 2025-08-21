"use client"

export const isAdminAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("monarca_admin") === "true"
}

export const getAdminUser = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("monarca_admin_user")
}

export const loginAdmin = (username: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("monarca_admin", "true")
  localStorage.setItem("monarca_admin_user", username)
  document.cookie = "monarca_admin=true; path=/; max-age=86400" // 24 hours
}

export const logoutAdmin = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("monarca_admin")
  localStorage.removeItem("monarca_admin_user")
  document.cookie = "monarca_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
}
