/**
 * @theaccessibleteam/a11y-feedback-vue
 * Vue composables for the a11y-feedback accessibility library
 */

export { useA11yFeedback } from './useA11yFeedback'
export { useA11yAnnounce } from './useA11yAnnounce'
export { useFeedbackConfig } from './useFeedbackConfig'
export { a11yFeedbackPlugin } from './plugin'

// Re-export core types for convenience
export type {
  FeedbackType,
  FeedbackOptions,
  FeedbackEvent,
  FeedbackConfig,
} from '@theaccessibleteam/a11y-feedback'

