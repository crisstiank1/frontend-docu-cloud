import { reactive, toRefs } from 'vue'

export type AuditAction = 'upload' | 'download' | 'delete' | 'share' | 'revoke' | 'edit' | 'login' | 'logout' | 'user_created' | 'user_deleted' | 'user_role_changed' | 'view' | 'user_profile_updated' | 'user_password_changed'

export interface AuditLog {
  id: string
  action: AuditAction
  userId: number
  userName: string
  userEmail: string
  documentId?: string
  documentName?: string
  details?: Record<string, any>
  timestamp: string
}

const AUDIT_LOG_KEY = 'docucloud_audit_log_v1'
const MAX_AUDIT_LOGS = 500 // ✅ Límite máximo de entradas

function loadAuditLog(): AuditLog[] {
  try { const raw = localStorage.getItem(AUDIT_LOG_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

function saveAuditLog(logs: AuditLog[]) {
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs))
}

const state = reactive<{
  logs: AuditLog[]
  filter: { action?: AuditAction; userId?: string; documentId?: string; startDate?: string; endDate?: string }
}>({
  logs: loadAuditLog(),
  filter: {}
})

export function useAuditLog() {
  function addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
    state.logs.unshift(newLog)

    // ✅ Limitar entradas para no saturar localStorage
    if (state.logs.length > MAX_AUDIT_LOGS) {
      state.logs = state.logs.slice(0, MAX_AUDIT_LOGS)
    }

    saveAuditLog(state.logs)
    return newLog
  }

  function getFilteredLogs(): AuditLog[] {
    let logs = [...state.logs]

    if (state.filter.action) {
      logs = logs.filter(l => l.action === state.filter.action)
    }
    if (state.filter.userId) {
      logs = logs.filter(l => String(l.userId) === state.filter.userId)
    }
    if (state.filter.documentId) {
      logs = logs.filter(l => l.documentId === state.filter.documentId)
    }
    if (state.filter.startDate) {
      const start = new Date(state.filter.startDate).getTime()
      logs = logs.filter(l => new Date(l.timestamp).getTime() >= start)
    }
    if (state.filter.endDate) {
      const end = new Date(state.filter.endDate).getTime()
      logs = logs.filter(l => new Date(l.timestamp).getTime() <= end)
    }

    return logs
  }

  function clearLogs(): void {
    state.logs = []
    saveAuditLog([])
  }

  return { ...toRefs(state), addLog, getFilteredLogs, clearLogs }
}
