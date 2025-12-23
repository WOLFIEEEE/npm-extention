/**
 * Hook for managing a11y-feedback configuration
 */
import { useCallback, useEffect, useState } from 'react'
import {
  configureFeedback,
  getConfig,
  resetConfig,
  type FeedbackConfig,
} from '@theaccessibleteam/a11y-feedback'

/**
 * Return type for useFeedbackConfig hook
 */
export interface UseFeedbackConfigReturn {
  /** Current configuration */
  config: FeedbackConfig
  /** Update configuration (merges with existing) */
  updateConfig: (updates: Partial<FeedbackConfig>) => void
  /** Reset configuration to defaults */
  resetConfig: () => void
  /** Enable visual feedback */
  enableVisual: () => void
  /** Disable visual feedback */
  disableVisual: () => void
}

/**
 * Hook for managing a11y-feedback configuration
 *
 * Provides reactive access to the configuration and methods to update it.
 *
 * @example
 * ```tsx
 * function SettingsPanel() {
 *   const { config, updateConfig, enableVisual, disableVisual } = useFeedbackConfig()
 *
 *   return (
 *     <div>
 *       <label>
 *         <input
 *           type="checkbox"
 *           checked={config.visual}
 *           onChange={(e) =>
 *             e.target.checked ? enableVisual() : disableVisual()
 *           }
 *         />
 *         Show visual notifications
 *       </label>
 *
 *       <select
 *         value={config.visualPosition}
 *         onChange={(e) =>
 *           updateConfig({ visualPosition: e.target.value as any })
 *         }
 *       >
 *         <option value="top-right">Top Right</option>
 *         <option value="bottom-right">Bottom Right</option>
 *       </select>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFeedbackConfig(): UseFeedbackConfigReturn {
  const [config, setConfig] = useState<FeedbackConfig>(() => getConfig())

  // Sync local state with global config
  const syncConfig = useCallback(() => {
    setConfig(getConfig())
  }, [])

  const updateConfig = useCallback(
    (updates: Partial<FeedbackConfig>) => {
      configureFeedback(updates)
      syncConfig()
    },
    [syncConfig]
  )

  const reset = useCallback(() => {
    resetConfig()
    syncConfig()
  }, [syncConfig])

  const enableVisual = useCallback(() => {
    updateConfig({ visual: true })
  }, [updateConfig])

  const disableVisual = useCallback(() => {
    updateConfig({ visual: false })
  }, [updateConfig])

  // Initial sync
  useEffect(() => {
    syncConfig()
  }, [syncConfig])

  return {
    config,
    updateConfig,
    resetConfig: reset,
    enableVisual,
    disableVisual,
  }
}

