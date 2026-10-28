export const DEFAULT_FAILURE_RATE = 0.2

export function getFailureRate(): number {
  const raw = process.env.NEXT_PUBLIC_FAILURE_RATE
  if (raw === undefined || raw === "") return DEFAULT_FAILURE_RATE
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return DEFAULT_FAILURE_RATE
  return Math.min(1, Math.max(0, parsed))
}

export function shouldSimulateFailure(rate: number = getFailureRate(), random: () => number = Math.random): boolean {
  return random() < rate
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
