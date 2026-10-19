export const IDLE_TIMEOUT_MS = 10 * 60 * 1000
const REPORT_INTERVAL_MS = 10_000
interface IdleCallbacks {
  expire: () => void
  report: (idleMs: number) => void
  publish: (at: number) => void
}

// No background request counts as activity. All deadlines use wall time so a
// suspended computer or a throttled tab expires when it resumes.
export class IdleSession {
  private lastActivity: number
  private reported: number
  private published: number
  private lastReport = -Infinity
  private lastPublish = -Infinity
  private ended = false
  private readonly now: () => number
  private readonly callbacks: IdleCallbacks

  constructor(remainingMs: number, now: () => number, callbacks: IdleCallbacks) {
    this.now = now
    this.callbacks = callbacks
    this.lastActivity = now() - IDLE_TIMEOUT_MS + Math.max(0, Math.min(IDLE_TIMEOUT_MS, remainingMs))
    this.reported = this.published = this.lastActivity
  }

  check() {
    if (!this.ended && this.now() - this.lastActivity >= IDLE_TIMEOUT_MS) {
      this.ended = true
      this.callbacks.expire()
    }
    return !this.ended
  }

  activity() {
    if (!this.check()) return
    this.lastActivity = this.now()
    this.tick()
  }

  // Only events for this same session are passed here by the browser adapter.
  receive(at: number) {
    if (!Number.isFinite(at) || at > this.now() || at <= this.lastActivity || this.ended) return
    this.lastActivity = at
    this.published = at
    this.tick()
  }

  tick() {
    if (!this.check()) return
    const now = this.now()
    if (this.lastActivity > this.published && now - this.lastPublish >= 1000) {
      this.published = this.lastActivity
      this.lastPublish = now
      this.callbacks.publish(this.lastActivity)
    }
    if (this.lastActivity > this.reported && now - this.lastReport >= REPORT_INTERVAL_MS) {
      this.reported = this.lastActivity
      this.lastReport = now
      this.callbacks.report(Math.max(0, now - this.lastActivity))
    }
  }
}
