/**
 * Main Vue composable for a11y-feedback
 */
import {
  notify,
  dismissVisualFeedback,
  dismissAllVisualFeedback,
  type FeedbackOptions,
  type FeedbackEvent,
} from '@theaccessibleteam/a11y-feedback'

/**
 * Return type for useA11yFeedback composable
 */
export interface UseA11yFeedbackReturn {
  /** Send a success notification */
  success: (message: string, options?: FeedbackOptions) => Promise<FeedbackEvent>
  /** Send an error notification */
  error: (message: string, options?: FeedbackOptions) => Promise<FeedbackEvent>
  /** Send a warning notification */
  warning: (message: string, options?: FeedbackOptions) => Promise<FeedbackEvent>
  /** Send an info notification */
  info: (message: string, options?: FeedbackOptions) => Promise<FeedbackEvent>
  /** Send a loading notification */
  loading: (message: string, options?: FeedbackOptions) => Promise<FeedbackEvent>
  /** Dismiss a specific visual feedback item */
  dismiss: (id: string) => void
  /** Dismiss all visual feedback items */
  dismissAll: () => void
}

/**
 * Main composable for sending accessible feedback notifications
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useA11yFeedback } from '@theaccessibleteam/a11y-feedback-vue'
 *
 * const feedback = useA11yFeedback()
 *
 * async function handleSave() {
 *   feedback.loading('Saving...', { id: 'save' })
 *
 *   try {
 *     await saveData()
 *     feedback.success('Saved!', { id: 'save' })
 *   } catch (e) {
 *     feedback.error('Failed to save', { id: 'save' })
 *   }
 * }
 * </script>
 *
 * <template>
 *   <button @click="handleSave">Save</button>
 * </template>
 * ```
 */
export function useA11yFeedback(): UseA11yFeedbackReturn {
  const success = (message: string, options?: FeedbackOptions) =>
    notify.success(message, options)

  const error = (message: string, options?: FeedbackOptions) =>
    notify.error(message, options)

  const warning = (message: string, options?: FeedbackOptions) =>
    notify.warning(message, options)

  const info = (message: string, options?: FeedbackOptions) =>
    notify.info(message, options)

  const loading = (message: string, options?: FeedbackOptions) =>
    notify.loading(message, options)

  const dismiss = (id: string) => {
    dismissVisualFeedback(id)
  }

  const dismissAll = () => {
    dismissAllVisualFeedback()
  }

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
  }
}

