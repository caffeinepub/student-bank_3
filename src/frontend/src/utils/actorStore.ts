/**
 * Module-level actor store so mutations can always access the latest actor
 * without stale closure issues.
 */
import type { backendInterface } from "../backend";

let _actor: backendInterface | null = null;
let _retryCallbacks: Array<() => void> = [];

export function setGlobalActor(actor: backendInterface | null) {
  _actor = actor;
  if (actor) {
    // Notify anyone waiting for the actor to be ready
    const callbacks = _retryCallbacks.splice(0);
    for (const cb of callbacks) cb();
  }
}

export function getGlobalActor(): backendInterface | null {
  return _actor;
}

/**
 * Force-clear the actor so it gets re-initialized on next access.
 * Useful as a recovery mechanism when the actor is in a bad state.
 */
export function forceRetryActor() {
  _actor = null;
}

/**
 * Wait up to ~10 seconds for the actor to be ready.
 * This handles the case where a user submits a form while the actor
 * is still initializing in the background.
 */
export async function waitForGlobalActor(
  maxAttempts = 20,
  delayMs = 500,
): Promise<backendInterface> {
  for (let i = 0; i < maxAttempts; i++) {
    if (_actor) return _actor;
    await new Promise<void>((res) => setTimeout(res, delayMs));
  }
  throw new Error("Actor तयार होऊ शकला नाही — कृपया page reload करा");
}
