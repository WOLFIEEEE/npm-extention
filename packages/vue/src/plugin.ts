/**
 * Vue plugin for a11y-feedback
 */
import type { App, InjectionKey } from 'vue'
import {
  configureFeedback,
  resetConfig,
  enableFeedbackDebug,
  disableFeedbackDebug,
  dismissAllVisualFeedback,
  type FeedbackConfig,
} from '@theaccessibleteam/a11y-feedback'
import { useA11yFeedback, type UseA11yFeedbackReturn } from './useA11yFeedback'

/**
 * Plugin options
 */
export interface A11yFeedbackPluginOptions {
  /** Configuration options */
  config?: Partial<FeedbackConfig>
  /** Enable debug mode */
  debug?: boolean
}

/**
 * Injection key for the feedback instance
 */
export const A11yFeedbackKey: InjectionKey<UseA11yFeedbackReturn> =
  Symbol('a11y-feedback')

/**
 * Vue plugin for a11y-feedback
 *
 * @example
 * ```ts
 * // main.ts
 * import { createApp } from 'vue'
 * import { a11yFeedbackPlugin } from '@theaccessibleteam/a11y-feedback-vue'
 * import App from './App.vue'
 *
 * const app = createApp(App)
 *
 * app.use(a11yFeedbackPlugin, {
 *   config: {
 *     visual: true,
 *     visualPosition: 'top-right',
 *   },
 *   debug: import.meta.env.DEV,
 * })
 *
 * app.mount('#app')
 * ```
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { inject } from 'vue'
 * import { A11yFeedbackKey } from '@theaccessibleteam/a11y-feedback-vue'
 *
 * const feedback = inject(A11yFeedbackKey)!
 *
 * function handleClick() {
 *   feedback.success('Action completed!')
 * }
 * </script>
 * ```
 */
export const a11yFeedbackPlugin = {
  install(app: App, options: A11yFeedbackPluginOptions = {}) {
    const { config, debug = false } = options

    // Initialize configuration
    if (config) {
      configureFeedback(config)
    }

    // Enable debug mode if requested
    if (debug) {
      enableFeedbackDebug()
    }

    // Create the feedback instance
    const feedback = useA11yFeedback()

    // Provide the instance
    app.provide(A11yFeedbackKey, feedback)

    // Add global property for Options API
    app.config.globalProperties.$a11yFeedback = feedback

    // Cleanup on app unmount
    app.unmount = ((originalUnmount) => {
      return function (this: App) {
        resetConfig()
        disableFeedbackDebug()
        dismissAllVisualFeedback()
        return originalUnmount.call(this)
      }
    })(app.unmount)
  },
}

// Type augmentation for globalProperties
declare module 'vue' {
  interface ComponentCustomProperties {
    $a11yFeedback: UseA11yFeedbackReturn
  }
}

