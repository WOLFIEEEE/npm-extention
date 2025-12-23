/**
 * Simple hook for screen reader announcements
 */
import { useCallback, useMemo } from 'react'
import { notify, type FeedbackOptions } from '@theaccessibleteam/a11y-feedback'

/**
 * Return type for useA11yAnnounce hook
 */
export interface UseA11yAnnounceReturn {
  /**
   * Announce a message politely (for non-urgent updates)
   * Screen reader will wait for current speech to finish
   */
  announcePolite: (message: string, options?: FeedbackOptions) => Promise<void>
  /**
   * Announce a message assertively (for urgent updates)
   * Screen reader will interrupt current speech
   */
  announceAssertive: (message: string, options?: FeedbackOptions) => Promise<void>
  /**
   * Announce with custom options
   */
  announce: (
    message: string,
    politeness: 'polite' | 'assertive',
    options?: FeedbackOptions
  ) => Promise<void>
}

/**
 * Simple hook for making screen reader announcements
 *
 * This is a lightweight alternative to useA11yFeedback when you only
 * need to announce messages without visual feedback or complex options.
 *
 * @example
 * ```tsx
 * function SearchResults({ count }: { count: number }) {
 *   const { announcePolite } = useA11yAnnounce()
 *
 *   useEffect(() => {
 *     announcePolite(`Found ${count} results`)
 *   }, [count, announcePolite])
 *
 *   return <div>{count} results found</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Timer({ secondsLeft }: { secondsLeft: number }) {
 *   const { announceAssertive } = useA11yAnnounce()
 *
 *   useEffect(() => {
 *     if (secondsLeft <= 10) {
 *       announceAssertive(`${secondsLeft} seconds remaining`)
 *     }
 *   }, [secondsLeft, announceAssertive])
 *
 *   return <div>{secondsLeft}s</div>
 * }
 * ```
 */
export function useA11yAnnounce(): UseA11yAnnounceReturn {
  const announcePolite = useCallback(
    async (message: string, options?: FeedbackOptions) => {
      await notify.info(message, options)
    },
    []
  )

  const announceAssertive = useCallback(
    async (message: string, options?: FeedbackOptions) => {
      await notify.warning(message, options)
    },
    []
  )

  const announce = useCallback(
    async (
      message: string,
      politeness: 'polite' | 'assertive',
      options?: FeedbackOptions
    ) => {
      if (politeness === 'assertive') {
        await notify.warning(message, options)
      } else {
        await notify.info(message, options)
      }
    },
    []
  )

  return useMemo(
    () => ({
      announcePolite,
      announceAssertive,
      announce,
    }),
    [announcePolite, announceAssertive, announce]
  )
}

