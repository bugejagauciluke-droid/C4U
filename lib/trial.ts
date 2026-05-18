/**
 * Trial management utilities.
 *
 * Trial is double-locked:
 *   1. Clerk privateMetadata.trialStartedAt  — account-tied (server)
 *   2. localStorage "c4u_trial_start"        — device-tied  (client)
 *
 * Both must be clear for a fresh trial. This prevents:
 *   - Clearing cookies and signing up again (metadata persists on Clerk)
 *   - Using a second account on same device (localStorage persists)
 */

export const TRIAL_DAYS = 7;
export const TRIAL_LS_KEY = "c4u_trial_start";

/** Returns ISO string of trial start, or null if no trial on this device. */
export function getDeviceTrialStart(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TRIAL_LS_KEY);
}

/** Marks trial started on this device (called when checkout session is created). */
export function markDeviceTrialStarted(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(TRIAL_LS_KEY)) {
    localStorage.setItem(TRIAL_LS_KEY, new Date().toISOString());
  }
}

/** Returns true if the device-local trial has expired or was already used. */
export function isDeviceTrialUsed(): boolean {
  const start = getDeviceTrialStart();
  if (!start) return false;
  const days = (Date.now() - new Date(start).getTime()) / 86_400_000;
  return days >= TRIAL_DAYS;
}

/** How many trial days remain on this device (0 if expired/unused). */
export function deviceTrialDaysRemaining(): number {
  const start = getDeviceTrialStart();
  if (!start) return TRIAL_DAYS;
  const used = (Date.now() - new Date(start).getTime()) / 86_400_000;
  return Math.max(0, Math.ceil(TRIAL_DAYS - used));
}

/**
 * Server-side: returns true if this account has already used its trial.
 * Call inside API routes / server components after reading Clerk privateMetadata.
 */
export function accountTrialUsed(trialStartedAt?: string): boolean {
  if (!trialStartedAt) return false;
  const days = (Date.now() - new Date(trialStartedAt).getTime()) / 86_400_000;
  return days >= TRIAL_DAYS;
}
