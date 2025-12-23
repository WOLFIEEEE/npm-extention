/**
 * @theaccessibleteam/a11y-feedback-react
 * React bindings for the a11y-feedback accessibility library
 */

export { A11yFeedbackProvider, useA11yFeedbackContext } from './provider'
export { useA11yFeedback } from './useA11yFeedback'
export { useA11yAnnounce } from './useA11yAnnounce'
export { useFeedbackConfig } from './useFeedbackConfig'

// Re-export core types for convenience
export type {
  FeedbackType,
  FeedbackOptions,
  FeedbackEvent,
  FeedbackConfig,
} from '@theaccessibleteam/a11y-feedback'

