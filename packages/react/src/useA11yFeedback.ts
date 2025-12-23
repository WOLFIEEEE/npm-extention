/**
 * Main React hook for a11y-feedback
 * Can be used standalone without the provider
 */
import { useCallback, useMemo } from 'react'
import {
  notify,
  dismissVisualFeedback,
  dismissAllVisualFeedback,
  type FeedbackOptions,
  type FeedbackEvent,
} from '@theaccessibleteam/a11y-feedback'

/**
 * Return type for useA11yFeedback hook
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
 * Main hook for sending accessible feedback notifications
 *
 * Can be used without a provider for simple use cases.
 * For app-wide configuration, use with A11yFeedbackProvider.
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const feedback = useA11yFeedback()
 *
 *   const handleSave = async () => {
 *     feedback.loading('Saving...', { id: 'save' })
 *
 *     try {
 *       await saveData()
 *       feedback.success('Saved successfully!', { id: 'save' })
 *     } catch (e) {
 *       feedback.error('Failed to save', { id: 'save', focus: '#save-btn' })
 *     }
 *   }
 *
 *   return <button id="save-btn" onClick={handleSave}>Save</button>
 * }
 * ```
 */
export function useA11yFeedback(): UseA11yFeedbackReturn {
  const success = useCallback(
    (message: string, options?: FeedbackOptions) => notify.success(message, options),
    []
  )

  const error = useCallback(
    (message: string, options?: FeedbackOptions) => notify.error(message, options),
    []
  )

  const warning = useCallback(
    (message: string, options?: FeedbackOptions) => notify.warning(message, options),
    []
  )

  const info = useCallback(
    (message: string, options?: FeedbackOptions) => notify.info(message, options),
    []
  )

  const loading = useCallback(
    (message: string, options?: FeedbackOptions) => notify.loading(message, options),
    []
  )

  const dismiss = useCallback((id: string) => {
    dismissVisualFeedback(id)
  }, [])

  const dismissAll = useCallback(() => {
    dismissAllVisualFeedback()
  }, [])

  return useMemo(
    () => ({
      success,
      error,
      warning,
      info,
      loading,
      dismiss,
      dismissAll,
    }),
    [success, error, warning, info, loading, dismiss, dismissAll]
  )
}

