/**
 * a11y-feedback Demo Site Interactive Script
 * Uses the UMD build from the global A11yFeedback namespace
 */

(function () {
  'use strict';

  // Get the library from the global namespace (UMD build)
  const { notify, configureFeedback, enableDebug, getDebugTelemetry } = window.A11yFeedback;

  // State
  let visualModeEnabled = false;
  let announceCount = 0;
  let isSaving = false;

  // DOM Elements
  const visualToggle = document.getElementById('visual-toggle');
  const emailInput = document.getElementById('demo-email');
  const saveStatus = document.getElementById('save-status');
  const announceCountEl = document.getElementById('announce-count');
  const eventLog = document.getElementById('event-log');

  // Enable debug mode to track all events
  enableDebug(true);

  // ==========================================================================
  // Visual Mode Toggle
  // ==========================================================================

  visualToggle.addEventListener('click', function () {
    visualModeEnabled = !visualModeEnabled;
    this.setAttribute('aria-checked', visualModeEnabled.toString());

    configureFeedback({
      visual: visualModeEnabled,
      visualPosition: 'top-right',
      maxVisualItems: 5
    });

    // Announce the change
    if (visualModeEnabled) {
      notify.info('Visual feedback mode enabled. You will now see toast notifications.');
    } else {
      notify.info('Visual feedback mode disabled. Only screen reader announcements active.');
    }

    logEvent('config', `Visual mode ${visualModeEnabled ? 'enabled' : 'disabled'}`);
  });

  // ==========================================================================
  // Basic Notification Buttons
  // ==========================================================================

  document.querySelectorAll('[data-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      const action = this.getAttribute('data-action');
      handleAction(action);
    });
  });

  function handleAction(action) {
    switch (action) {
      case 'success':
        notify.success('Operation completed successfully!');
        logEvent('success', 'Operation completed successfully!');
        incrementCount();
        break;

      case 'error':
        notify.error('Something went wrong. Please try again.');
        logEvent('error', 'Something went wrong. Please try again.');
        incrementCount();
        break;

      case 'warning':
        notify.warning('Your session will expire in 5 minutes.');
        logEvent('warning', 'Your session will expire in 5 minutes.');
        incrementCount();
        break;

      case 'info':
        notify.info('New features are available. Check the changelog.');
        logEvent('info', 'New features are available. Check the changelog.');
        incrementCount();
        break;

      case 'loading':
        notify.loading('Processing your request...');
        logEvent('loading', 'Processing your request...');
        incrementCount();
        break;

      case 'error-focus':
        handleErrorFocus();
        break;

      case 'success-no-focus':
        handleSuccessNoFocus();
        break;

      case 'save-pattern':
        handleSavePattern();
        break;

      case 'dedupe-test':
        handleDedupeTest();
        break;

      case 'force-test':
        handleForceTest();
        break;

      case 'clear-log':
        clearLog();
        break;
    }
  }

  // ==========================================================================
  // Focus Management Demos
  // ==========================================================================

  function handleErrorFocus() {
    // Show error and move focus to the email input
    notify.error('Please enter a valid email address.', {
      focus: '#demo-email',
      explainFocus: true
    });

    // Add error styling to input
    emailInput.classList.add('error');
    emailInput.setAttribute('aria-invalid', 'true');

    logEvent('error', 'Email error with focus → #demo-email');
    incrementCount();

    // Remove error styling after a delay
    setTimeout(function () {
      emailInput.classList.remove('error');
      emailInput.removeAttribute('aria-invalid');
    }, 5000);
  }

  function handleSuccessNoFocus() {
    // This demonstrates that success notifications cannot steal focus
    // Even if focus is specified, it should be blocked
    notify.success('Profile saved successfully!', {
      focus: '#demo-email' // This should be BLOCKED
    });

    logEvent('success', 'Success notification - focus steal blocked (correct behavior)');
    incrementCount();
  }

  // ==========================================================================
  // Loading → Success Pattern
  // ==========================================================================

  function handleSavePattern() {
    if (isSaving) return;

    isSaving = true;

    // Update UI
    saveStatus.innerHTML = '<span class="status-loading">⏳ Saving changes...</span>';

    // Start loading notification
    notify.loading('Saving your changes...', { id: 'save-operation' });
    logEvent('loading', 'Saving your changes... [id: save-operation]');
    incrementCount();

    // Simulate async operation
    setTimeout(function () {
      // Replace loading with success using same ID
      notify.success('Changes saved successfully!', { id: 'save-operation' });
      logEvent('success', 'Changes saved successfully! [id: save-operation] (replaced loading)');
      incrementCount();

      // Update UI
      saveStatus.innerHTML = '<span class="status-success">✓ Saved!</span>';

      // Reset after delay
      setTimeout(function () {
        saveStatus.innerHTML = '<span class="status-idle">Click to start</span>';
        isSaving = false;
      }, 3000);
    }, 2000);
  }

  // ==========================================================================
  // Deduplication Demos
  // ==========================================================================

  function handleDedupeTest() {
    // This will be deduplicated if clicked rapidly
    const result = notify.info('This message is deduplicated when clicked rapidly.');

    if (result && result.announced) {
      logEvent('info', 'Message announced (not deduped)');
      incrementCount();
    } else {
      logEvent('info', 'Message SKIPPED (deduplicated)', true);
    }
  }

  function handleForceTest() {
    // Force bypasses deduplication
    notify.info('This message is always announced!', { force: true });
    logEvent('info', 'Forced announcement (always goes through)');
    incrementCount();
  }

  // ==========================================================================
  // Event Log
  // ==========================================================================

  function logEvent(type, message, skipped) {
    const logEmpty = eventLog.querySelector('.log-empty');
    if (logEmpty) {
      logEmpty.remove();
    }

    const entry = document.createElement('div');
    entry.className = 'log-entry log-entry-' + type;

    const timestamp = new Date().toLocaleTimeString();
    const prefix = skipped ? '[SKIPPED] ' : '';
    const typeLabel = type.toUpperCase().padEnd(8);

    entry.textContent = `[${timestamp}] ${typeLabel} ${prefix}${message}`;

    // Add to top of log
    eventLog.insertBefore(entry, eventLog.firstChild);

    // Keep only last 50 entries
    while (eventLog.children.length > 50) {
      eventLog.removeChild(eventLog.lastChild);
    }
  }

  function clearLog() {
    eventLog.innerHTML = '<div class="log-empty">Events will appear here...</div>';
    announceCount = 0;
    announceCountEl.textContent = '0';
    notify.info('Event log cleared.');
  }

  function incrementCount() {
    announceCount++;
    announceCountEl.textContent = announceCount.toString();
  }

  // ==========================================================================
  // Copy to Clipboard
  // ==========================================================================

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const textToCopy = this.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(
        function () {
          // Show success state
          btn.classList.add('copied');
          const copyText = btn.querySelector('.copy-text');
          if (copyText) {
            copyText.textContent = 'Copied!';
          }

          // Announce to screen readers
          notify.success('Copied to clipboard');

          // Reset after delay
          setTimeout(function () {
            btn.classList.remove('copied');
            if (copyText) {
              copyText.textContent = 'Copy';
            }
          }, 2000);
        },
        function () {
          notify.error('Failed to copy to clipboard');
        }
      );
    });
  });

  // ==========================================================================
  // Smooth Scrolling for Anchor Links
  // ==========================================================================

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Set focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });

  // ==========================================================================
  // Initialize
  // ==========================================================================

  // Log initial state
  logEvent('info', 'Demo initialized. Try the controls above!');

  // Welcome message (delayed to not interfere with page load)
  setTimeout(function () {
    notify.info('Welcome to the a11y-feedback demo! Try the controls to see it in action.', {
      id: 'welcome'
    });
  }, 1000);
})();

