/**
 * Event emitter system for a11y-feedback
 * Allows external systems to react to feedback events
 * @module modules/events
 */

import type { FeedbackEvent } from '../types'

/**
 * Event types emitted by the feedback system
 */
export type FeedbackEventType =
  | 'announced'
  | 'queued'
  | 'replaced'
  | 'deduped'
  | 'dismissed'
  | 'focusMoved'
  | 'visualShown'
  | 'visualDismissed'
  | 'configChanged'

/**
 * Payload for different event types
 */
export interface FeedbackEventPayloads {
  announced: {
    event: FeedbackEvent
    region: 'polite' | 'assertive'
  }
  queued: {
    event: FeedbackEvent
    queuePosition: number
  }
  replaced: {
    newEvent: FeedbackEvent
    previousEvent: FeedbackEvent
  }
  deduped: {
    event: FeedbackEvent
    reason: 'duplicate' | 'rate-limited'
  }
  dismissed: {
    event: FeedbackEvent
    reason: 'user' | 'timeout' | 'replaced' | 'programmatic'
  }
  focusMoved: {
    event: FeedbackEvent
    target: string
    elementName: string | null
  }
  visualShown: {
    event: FeedbackEvent
    container: HTMLElement
  }
  visualDismissed: {
    eventId: string
    reason: 'user' | 'timeout' | 'replaced' | 'programmatic'
  }
  configChanged: {
    previousConfig: Record<string, unknown>
    newConfig: Record<string, unknown>
    changedKeys: string[]
  }
}

/**
 * Event listener callback type
 */
export type FeedbackEventListener<T extends FeedbackEventType> = (
  payload: FeedbackEventPayloads[T]
) => void

/**
 * Wildcard listener for all events
 */
export type FeedbackWildcardListener = (
  type: FeedbackEventType,
  payload: FeedbackEventPayloads[FeedbackEventType]
) => void

/**
 * Internal storage for event listeners
 */
const listeners: Map<FeedbackEventType | '*', Set<FeedbackEventListener<FeedbackEventType> | FeedbackWildcardListener>> = new Map()

/**
 * Subscribe to a specific feedback event type
 *
 * @param type - Event type to listen for
 * @param listener - Callback function
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * import { onFeedback } from '@theaccessibleteam/a11y-feedback'
 *
 * // Listen for announcements
 * const unsubscribe = onFeedback('announced', ({ event, region }) => {
 *   console.log(`Announced: ${event.message} to ${region} region`)
 *   analytics.track('feedback_announced', { type: event.type })
 * })
 *
 * // Later: stop listening
 * unsubscribe()
 * ```
 */
export function onFeedback<T extends FeedbackEventType>(
  type: T,
  listener: FeedbackEventListener<T>
): () => void {
  if (!listeners.has(type)) {
    listeners.set(type, new Set())
  }

  const typeListeners = listeners.get(type)!
  typeListeners.add(listener as FeedbackEventListener<FeedbackEventType>)

  return () => {
    typeListeners.delete(listener as FeedbackEventListener<FeedbackEventType>)
  }
}

/**
 * Subscribe to all feedback events
 *
 * @param listener - Callback function receiving event type and payload
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * import { onAnyFeedback } from '@theaccessibleteam/a11y-feedback'
 *
 * const unsubscribe = onAnyFeedback((type, payload) => {
 *   console.log(`Event: ${type}`, payload)
 * })
 * ```
 */
export function onAnyFeedback(listener: FeedbackWildcardListener): () => void {
  if (!listeners.has('*')) {
    listeners.set('*', new Set())
  }

  const wildcardListeners = listeners.get('*')!
  wildcardListeners.add(listener)

  return () => {
    wildcardListeners.delete(listener)
  }
}

/**
 * Remove all listeners for a specific event type
 *
 * @param type - Event type to clear, or undefined to clear all
 */
export function offFeedback(type?: FeedbackEventType): void {
  if (type === undefined) {
    listeners.clear()
  } else {
    listeners.delete(type)
  }
}

/**
 * Emit a feedback event to all registered listeners
 *
 * @param type - Event type
 * @param payload - Event payload
 *
 * @internal
 */
export function emitFeedbackEvent<T extends FeedbackEventType>(
  type: T,
  payload: FeedbackEventPayloads[T]
): void {
  // Notify type-specific listeners
  const typeListeners = listeners.get(type)
  if (typeListeners) {
    typeListeners.forEach((listener) => {
      try {
        (listener as FeedbackEventListener<T>)(payload)
      } catch (error) {
        console.error(`[a11y-feedback] Event listener error for "${type}":`, error)
      }
    })
  }

  // Notify wildcard listeners
  const wildcardListeners = listeners.get('*')
  if (wildcardListeners) {
    wildcardListeners.forEach((listener) => {
      try {
        (listener as FeedbackWildcardListener)(type, payload as FeedbackEventPayloads[FeedbackEventType])
      } catch (error) {
        console.error(`[a11y-feedback] Wildcard listener error:`, error)
      }
    })
  }
}

/**
 * Create a one-time event listener
 *
 * @param type - Event type to listen for
 * @param listener - Callback function
 * @returns Unsubscribe function (can be called early to cancel)
 *
 * @example
 * ```ts
 * import { onceFeedback } from '@theaccessibleteam/a11y-feedback'
 *
 * onceFeedback('announced', ({ event }) => {
 *   console.log('First announcement:', event.message)
 * })
 * ```
 */
export function onceFeedback<T extends FeedbackEventType>(
  type: T,
  listener: FeedbackEventListener<T>
): () => void {
  const unsubscribe = onFeedback(type, (payload) => {
    unsubscribe()
    listener(payload)
  })

  return unsubscribe
}

/**
 * Get the number of listeners for an event type
 *
 * @param type - Event type, or '*' for wildcard, or undefined for total
 * @returns Number of listeners
 */
export function getListenerCount(type?: FeedbackEventType | '*'): number {
  if (type === undefined) {
    let total = 0
    listeners.forEach((set) => {
      total += set.size
    })
    return total
  }

  return listeners.get(type)?.size ?? 0
}

/**
 * Check if there are any listeners for an event type
 *
 * @param type - Event type to check
 * @returns Whether listeners exist
 */
export function hasListeners(type: FeedbackEventType): boolean {
  const typeHasListeners = (listeners.get(type)?.size ?? 0) > 0
  const hasWildcard = (listeners.get('*')?.size ?? 0) > 0
  return typeHasListeners || hasWildcard
}

/**
 * Reset the event system (for testing)
 *
 * @internal
 */
export function resetEventSystem(): void {
  listeners.clear()
}

