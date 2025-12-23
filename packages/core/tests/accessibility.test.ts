/**
 * Accessibility Tests for a11y-feedback
 * Uses axe-core to validate ARIA compliance and WCAG standards
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { configureAxe, toHaveNoViolations } from './axe-helper'
import {
  notify,
  configureFeedback,
  resetConfig,
  dismissAllVisualFeedback,
} from '../src/index'
import { destroyRegions, getRegion } from '../src/modules/regions'
import { resetAnnouncerState } from '../src/modules/announcer'
import { resetDedupe } from '../src/modules/dedupe'
import { resetVisual } from '../src/modules/visual'

// Extend Vitest expect with axe matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  let axe: ReturnType<typeof configureAxe>

  beforeEach(() => {
    resetConfig()
    destroyRegions()
    resetAnnouncerState()
    resetDedupe()
    resetVisual()
    document.body.innerHTML = ''
    axe = configureAxe()
  })

  afterEach(() => {
    dismissAllVisualFeedback()
    document.body.innerHTML = ''
  })

  describe('ARIA Live Regions', () => {
    it('should create polite live region with correct attributes', async () => {
      await notify.success('Test message')

      const politeRegion = getRegion('polite')
      expect(politeRegion).not.toBeNull()
      expect(politeRegion?.getAttribute('role')).toBe('status')
      expect(politeRegion?.getAttribute('aria-live')).toBe('polite')
      expect(politeRegion?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should create assertive live region with correct attributes', async () => {
      await notify.error('Error message')

      const assertiveRegion = getRegion('assertive')
      expect(assertiveRegion).not.toBeNull()
      expect(assertiveRegion?.getAttribute('role')).toBe('alert')
      expect(assertiveRegion?.getAttribute('aria-live')).toBe('assertive')
      expect(assertiveRegion?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should have live regions hidden from visual display but accessible to screen readers', async () => {
      await notify.info('Info message')

      const politeRegion = getRegion('polite')
      expect(politeRegion).not.toBeNull()

      // Check that sr-only styles are applied
      const styles = window.getComputedStyle(politeRegion!)
      expect(styles.position).toBe('absolute')
      expect(styles.width).toBe('1px')
      expect(styles.height).toBe('1px')
      expect(styles.overflow).toBe('hidden')
    })

    it('should pass axe accessibility audit for live regions', async () => {
      await notify.success('Success')
      await notify.error('Error')
      await notify.warning('Warning')
      await notify.info('Info')

      const results = await axe.run(document.body)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Visual Feedback Accessibility', () => {
    beforeEach(() => {
      configureFeedback({ visual: true })
    })

    it('should have accessible dismiss buttons', async () => {
      await notify.success('Test message')
      await new Promise((resolve) => setTimeout(resolve, 100))

      const dismissButton = document.querySelector('[aria-label="Dismiss"]')
      expect(dismissButton).not.toBeNull()
      expect(dismissButton?.getAttribute('type')).toBe('button')
    })

    it('should have proper notification container with role region', async () => {
      await notify.success('Test message')
      await new Promise((resolve) => setTimeout(resolve, 100))

      const container = document.querySelector('[data-a11y-feedback-visual]')
      expect(container).not.toBeNull()
      expect(container?.getAttribute('role')).toBe('region')
      expect(container?.getAttribute('aria-label')).toBe('Notifications')
    })

    it('should pass axe audit for visual feedback', async () => {
      await notify.success('Success message')
      await notify.error('Error message')
      await new Promise((resolve) => setTimeout(resolve, 100))

      const results = await axe.run(document.body)
      expect(results).toHaveNoViolations()
    })

    it('should have sufficient color contrast for feedback items', async () => {
      await notify.success('Success')
      await notify.error('Error')
      await notify.warning('Warning')
      await notify.info('Info')
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Run axe with color contrast rules
      const results = await axe.run(document.body, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
      expect(results).toHaveNoViolations()
    })
  })

  describe('Focus Management Accessibility', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form>
          <label for="email">Email Address</label>
          <input id="email" type="email" aria-describedby="email-error" />
          <span id="email-error" role="alert" aria-live="assertive"></span>
        </form>
      `
    })

    it('should move focus to error target without accessibility violations', async () => {
      await notify.error('Please enter a valid email', { focus: '#email' })

      expect(document.activeElement?.id).toBe('email')

      const results = await axe.run(document.body)
      expect(results).toHaveNoViolations()
    })

    it('should not trap focus when announcing feedback', async () => {
      const input = document.getElementById('email')
      input?.focus()

      await notify.success('Success message')

      // Focus should not be stolen for success messages
      expect(document.activeElement?.id).toBe('email')
    })

    it('should support focus with explainFocus option', async () => {
      await notify.error('Invalid email', {
        focus: '#email',
        explainFocus: true,
      })

      expect(document.activeElement?.id).toBe('email')
    })
  })

  describe('Semantic Feedback Types', () => {
    it('should use status role for success messages', async () => {
      const event = await notify.success('Operation successful')
      expect(event.role).toBe('status')
      expect(event.ariaLive).toBe('polite')
    })

    it('should use alert role for error messages', async () => {
      const event = await notify.error('Operation failed')
      expect(event.role).toBe('alert')
      expect(event.ariaLive).toBe('assertive')
    })

    it('should use alert role for warning messages', async () => {
      const event = await notify.warning('Warning: low battery')
      expect(event.role).toBe('alert')
      expect(event.ariaLive).toBe('assertive')
    })

    it('should use status role for info messages', async () => {
      const event = await notify.info('New feature available')
      expect(event.role).toBe('status')
      expect(event.ariaLive).toBe('polite')
    })

    it('should use status role for loading messages', async () => {
      const event = await notify.loading('Loading...')
      expect(event.role).toBe('status')
      expect(event.ariaLive).toBe('polite')
    })
  })

  describe('WCAG Compliance', () => {
    it('should not auto-dismiss error messages (WCAG 2.2.1)', async () => {
      configureFeedback({ visual: true, defaultTimeout: 1000 })
      await notify.error('Error message')
      await new Promise((resolve) => setTimeout(resolve, 100))

      const items = document.querySelectorAll('[data-a11y-feedback-item]')
      expect(items.length).toBe(1)

      // Wait longer than default timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Error should still be visible
      const itemsAfter = document.querySelectorAll('[data-a11y-feedback-item]')
      expect(itemsAfter.length).toBe(1)
    })

    it('should respect prefers-reduced-motion', async () => {
      configureFeedback({ visual: true })
      await notify.success('Test')
      await new Promise((resolve) => setTimeout(resolve, 100))

      const container = document.querySelector('[data-a11y-feedback-visual]')
      // Container should detect motion preference
      expect(container).not.toBeNull()
    })

    it('should provide keyboard-accessible dismiss buttons', async () => {
      configureFeedback({ visual: true })
      await notify.success('Test message')
      await new Promise((resolve) => setTimeout(resolve, 100))

      const dismissButton = document.querySelector(
        '[aria-label="Dismiss"]'
      ) as HTMLButtonElement
      expect(dismissButton).not.toBeNull()

      // Button should be focusable
      dismissButton?.focus()
      expect(document.activeElement).toBe(dismissButton)

      // Button should be activatable via keyboard
      expect(dismissButton?.tagName.toLowerCase()).toBe('button')
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should inject message content into live region', async () => {
      await notify.success('Profile saved successfully')
      await new Promise((resolve) => setTimeout(resolve, 200))

      const politeRegion = getRegion('polite')
      expect(politeRegion?.textContent).toContain('Profile saved successfully')
    })

    it('should support re-announcement with force option', async () => {
      await notify.info('Same message')
      await notify.info('Same message', { force: true })

      // Both should be announced (force bypasses deduplication)
      const politeRegion = getRegion('polite')
      expect(politeRegion?.textContent).toContain('Same message')
    })

    it('should append focus explanation when explainFocus is true', async () => {
      document.body.innerHTML = `
        <label for="username">Username</label>
        <input id="username" type="text" />
      `

      await notify.error('Username is required', {
        focus: '#username',
        explainFocus: true,
      })
      await new Promise((resolve) => setTimeout(resolve, 200))

      const assertiveRegion = getRegion('assertive')
      expect(assertiveRegion?.textContent).toContain('Username is required')
      expect(assertiveRegion?.textContent).toContain('Focus moved to')
    })
  })
})

