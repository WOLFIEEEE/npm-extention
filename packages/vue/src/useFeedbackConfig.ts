/**
 * Composable for managing a11y-feedback configuration
 */
import { ref, readonly, onMounted, type Ref, type DeepReadonly } from 'vue'
import {
  configureFeedback,
  getConfig,
  resetConfig,
  type FeedbackConfig,
} from '@theaccessibleteam/a11y-feedback'

/**
 * Return type for useFeedbackConfig composable
 */
export interface UseFeedbackConfigReturn {
  /** Current configuration (reactive, readonly) */
  config: DeepReadonly<Ref<FeedbackConfig>>
  /** Update configuration (merges with existing) */
  updateConfig: (updates: Partial<FeedbackConfig>) => void
  /** Reset configuration to defaults */
  reset: () => void
  /** Enable visual feedback */
  enableVisual: () => void
  /** Disable visual feedback */
  disableVisual: () => void
}

/**
 * Composable for managing a11y-feedback configuration
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useFeedbackConfig } from '@theaccessibleteam/a11y-feedback-vue'
 *
 * const { config, updateConfig, enableVisual, disableVisual } = useFeedbackConfig()
 * </script>
 *
 * <template>
 *   <div>
 *     <label>
 *       <input
 *         type="checkbox"
 *         :checked="config.visual"
 *         @change="$event.target.checked ? enableVisual() : disableVisual()"
 *       />
 *       Show visual notifications
 *     </label>
 *
 *     <select
 *       :value="config.visualPosition"
 *       @change="updateConfig({ visualPosition: $event.target.value })"
 *     >
 *       <option value="top-right">Top Right</option>
 *       <option value="bottom-right">Bottom Right</option>
 *     </select>
 *   </div>
 * </template>
 * ```
 */
export function useFeedbackConfig(): UseFeedbackConfigReturn {
  const config = ref<FeedbackConfig>(getConfig())

  const syncConfig = () => {
    config.value = getConfig()
  }

  const updateConfig = (updates: Partial<FeedbackConfig>) => {
    configureFeedback(updates)
    syncConfig()
  }

  const reset = () => {
    resetConfig()
    syncConfig()
  }

  const enableVisual = () => {
    updateConfig({ visual: true })
  }

  const disableVisual = () => {
    updateConfig({ visual: false })
  }

  onMounted(() => {
    syncConfig()
  })

  return {
    config: readonly(config),
    updateConfig,
    reset,
    enableVisual,
    disableVisual,
  }
}

