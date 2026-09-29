/**
 * Live demo simulator.
 *
 * Phase 1 provides the togglable start/stop scaffold only. The stage-advancing
 * logic (occasionally moving trucks forward and updating bays) is implemented in
 * Phase 6 so the board looks real-time during the walkthrough.
 */
export interface Simulator {
  start(): void
  stop(): void
  isRunning(): boolean
}

export function createSimulator(tick: () => void, intervalMs = 4000): Simulator {
  let handle: ReturnType<typeof setInterval> | null = null

  return {
    start() {
      if (handle) return
      handle = setInterval(tick, intervalMs)
    },
    stop() {
      if (!handle) return
      clearInterval(handle)
      handle = null
    },
    isRunning() {
      return handle !== null
    },
  }
}
