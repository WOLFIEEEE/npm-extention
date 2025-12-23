/**
 * Simple composable for screen reader announcements
 */
import { notify, type FeedbackOptions } from '@theaccessibleteam/a11y-feedback'

/**
 * Return type for useA11yAnnounce composable
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
 * Simple composable for making screen reader announcements
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { watch } from 'vue'
 * import { useA11yAnnounce } from '@theaccessibleteam/a11y-feedback-vue'
 *
 * const props = defineProps<{ count: number }>()
 * const { announcePolite } = useA11yAnnounce()
 *
 * watch(() => props.count, (newCount) => {
 *   announcePolite(`Found ${newCount} results`)
 * })
 * </script>
 * ```
 */
export function useA11yAnnounce(): UseA11yAnnounceReturn {
  const announcePolite = async (
    message: string,
    options?: FeedbackOptions
  ): Promise<void> => {
    await notify.info(message, options)
  }

  const announceAssertive = async (
    message: string,
    options?: FeedbackOptions
  ): Promise<void> => {
    await notify.warning(message, options)
  }

  const announce = async (
    message: string,
    politeness: 'polite' | 'assertive',
    options?: FeedbackOptions
  ): Promise<void> => {
    if (politeness === 'assertive') {
      await notify.warning(message, options)
    } else {
      await notify.info(message, options)
    }
  }

  return {
    announcePolite,
    announceAssertive,
    announce,
  }
}

