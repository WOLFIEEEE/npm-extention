/**
 * Axe-core helper for accessibility testing
 * Provides configuration and custom matchers for Vitest
 */
import axeCore, { AxeResults, RunOptions, Spec } from 'axe-core'

/**
 * Configure axe-core with default settings
 */
export function configureAxe(options?: Spec) {
  axeCore.configure({
    branding: {
      application: 'a11y-feedback',
    },
    ...options,
  })

  return {
    run: async (
      context: Element | Document = document,
      runOptions?: RunOptions
    ): Promise<AxeResults> => {
      return axeCore.run(context, {
        rules: {
          // Disable rules that don't apply to our context
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
        ...runOptions,
      })
    },
  }
}

/**
 * Format axe violations for readable error messages
 */
function formatViolations(violations: AxeResults['violations']): string {
  if (violations.length === 0) {
    return 'No accessibility violations found'
  }

  return violations
    .map((violation) => {
      const nodeInfo = violation.nodes
        .map((node) => {
          const targetInfo = node.target.join(', ')
          const failureSummary = node.failureSummary || 'Unknown failure'
          return `    - Target: ${targetInfo}\n      ${failureSummary}`
        })
        .join('\n')

      return `
  Rule: ${violation.id}
  Impact: ${violation.impact}
  Description: ${violation.description}
  Help: ${violation.help}
  Help URL: ${violation.helpUrl}
  Nodes affected:
${nodeInfo}`
    })
    .join('\n---\n')
}

/**
 * Custom matcher for Vitest to check for no accessibility violations
 */
export const toHaveNoViolations = {
  toHaveNoViolations(received: AxeResults) {
    const violations = received.violations

    if (violations.length === 0) {
      return {
        pass: true,
        message: () => 'Expected accessibility violations but found none',
      }
    }

    return {
      pass: false,
      message: () =>
        `Expected no accessibility violations but found ${violations.length}:\n${formatViolations(violations)}`,
    }
  },
}

/**
 * Type augmentation for Vitest expect
 */
interface CustomMatchers<R = unknown> {
  toHaveNoViolations(): R
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

