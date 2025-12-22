/**
 * Integration tests for a11y-feedback
 * Tests the full library workflow end-to-end
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  notify,
  resetConfig,
  enableFeedbackDebug,
  disableFeedbackDebug,
  getFeedbackLog,
  clearFeedbackLog,
  getFeedbackStats,
  FEEDBACK_SEMANTICS,
} from '../src/index'
import { destroyRegions, getRegion, areRegionsInitialized } from '../src/modules/regions'
import { resetAnnouncerState } from '../src/modules/announcer'
import { resetDedupe } from '../src/modules/dedupe'
import { resetVisual } from '../src/modules/visual'

describe('Integration Tests', () => {
  beforeEach(() => {
    resetConfig()
    destroyRegions()
    resetAnnouncerState()
    resetDedupe()
    resetVisual()
    clearFeedbackLog()
    disableFeedbackDebug()
    document.body.innerHTML = ''
  })

  describe('Full notification lifecycle', () => {
    it('should complete full success notification lifecycle', async () => {
      const event = await notify.success('Operation completed')

      expect(event.type).toBe('success')
      expect(event.message).toBe('Operation completed')
      expect(event.role).toBe('status')
      expect(event.ariaLive).toBe('polite')
      expect(event.deduped).toBe(false)
      expect(areRegionsInitialized()).toBe(true)
    })

    it('should complete full error notification lifecycle with focus', async () => {
      document.body.innerHTML = '<input id="email" type="email" aria-label="Email address" />'

      const event = await notify.error('Invalid email format', {
        focus: '#email',
        explainFocus: true,
      })

      expect(event.type).toBe('error')
      expect(event.role).toBe('alert')
      expect(event.ariaLive).toBe('assertive')
      expect(document.activeElement?.id).toBe('email')
    })

    it('should handle loading to success replacement', async () => {
      const loadingEvent = await notify.loading('Saving...', { id: 'save-status' })
      expect(loadingEvent.type).toBe('loading')
      expect(loadingEvent.id).toBe('save-status')

      const successEvent = await notify.success('Saved successfully', { id: 'save-status' })
      expect(successEvent.type).toBe('success')
      expect(successEvent.id).toBe('save-status')
      expect(successEvent.replaced).toBe(true)
    })
  })

  describe('Debug and telemetry integration', () => {
    it('should track all events in debug mode', async () => {
      enableFeedbackDebug()

      await notify.success('Success event')
      await notify.error('Error event')
      await notify.warning('Warning event')

      const log = getFeedbackLog()
      expect(log.length).toBe(3)

      const stats = getFeedbackStats()
      expect(stats.total).toBe(3)
      expect(stats.byType['success']).toBe(1)
      expect(stats.byType['error']).toBe(1)
      expect(stats.byType['warning']).toBe(1)
    })

    it('should track deduped events', async () => {
      enableFeedbackDebug()

      await notify.info('Same message')
      await notify.info('Same message') // Should be deduped

      const log = getFeedbackLog()
      const dedupedEvents = log.filter((entry) => entry.event.deduped)
      expect(dedupedEvents.length).toBe(1)
    })
  })

  describe('Focus safety rules integration', () => {
    beforeEach(() => {
      document.body.innerHTML = '<button id="test-btn">Test Button</button>'
    })

    it('should NOT move focus for success type', async () => {
      const initialFocus = document.activeElement

      await notify.success('Success!', { focus: '#test-btn' })

      expect(document.activeElement).toBe(initialFocus)
    })

    it('should NOT move focus for info type', async () => {
      const initialFocus = document.activeElement

      await notify.info('Info!', { focus: '#test-btn' })

      expect(document.activeElement).toBe(initialFocus)
    })

    it('should NOT move focus for loading type', async () => {
      const initialFocus = document.activeElement

      await notify.loading('Loading...', { focus: '#test-btn' })

      expect(document.activeElement).toBe(initialFocus)
    })

    it('should move focus for error type', async () => {
      await notify.error('Error!', { focus: '#test-btn' })

      expect(document.activeElement?.id).toBe('test-btn')
    })

    it('should move focus for warning type', async () => {
      await notify.warning('Warning!', { focus: '#test-btn' })

      expect(document.activeElement?.id).toBe('test-btn')
    })
  })

  describe('Semantic mappings validation', () => {
    it('should have correct semantics for all types', () => {
      // Success
      expect(FEEDBACK_SEMANTICS.success.role).toBe('status')
      expect(FEEDBACK_SEMANTICS.success.ariaLive).toBe('polite')
      expect(FEEDBACK_SEMANTICS.success.canMoveFocus).toBe(false)

      // Error
      expect(FEEDBACK_SEMANTICS.error.role).toBe('alert')
      expect(FEEDBACK_SEMANTICS.error.ariaLive).toBe('assertive')
      expect(FEEDBACK_SEMANTICS.error.canMoveFocus).toBe(true)
      expect(FEEDBACK_SEMANTICS.error.autoDismiss).toBe(false)

      // Warning
      expect(FEEDBACK_SEMANTICS.warning.role).toBe('alert')
      expect(FEEDBACK_SEMANTICS.warning.ariaLive).toBe('assertive')
      expect(FEEDBACK_SEMANTICS.warning.canMoveFocus).toBe(true)

      // Info
      expect(FEEDBACK_SEMANTICS.info.role).toBe('status')
      expect(FEEDBACK_SEMANTICS.info.ariaLive).toBe('polite')
      expect(FEEDBACK_SEMANTICS.info.canMoveFocus).toBe(false)

      // Loading
      expect(FEEDBACK_SEMANTICS.loading.role).toBe('status')
      expect(FEEDBACK_SEMANTICS.loading.ariaLive).toBe('polite')
      expect(FEEDBACK_SEMANTICS.loading.canMoveFocus).toBe(false)
      expect(FEEDBACK_SEMANTICS.loading.autoDismiss).toBe(false)
    })
  })

  describe('Live region content verification', () => {
    it('should inject content into polite region for polite types', async () => {
      await notify.success('Polite message')
      await new Promise((resolve) => setTimeout(resolve, 200))

      const region = getRegion('polite')
      expect(region?.textContent).toContain('Polite message')
    })

    it('should inject content into assertive region for assertive types', async () => {
      await notify.error('Assertive message')
      await new Promise((resolve) => setTimeout(resolve, 200))

      const region = getRegion('assertive')
      expect(region?.textContent).toContain('Assertive message')
    })
  })

  describe('Force re-announcement', () => {
    it('should re-announce with force option', async () => {
      enableFeedbackDebug()

      await notify.success('Same message')
      await notify.success('Same message', { force: true })

      const log = getFeedbackLog()
      const announcedEvents = log.filter((entry) => entry.action === 'announced')
      expect(announcedEvents.length).toBe(2)
    })
  })
})
