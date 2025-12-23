/**
 * a11y-feedback v2.0 Demo Site Interactive Script
 * Comprehensive demo with all v2.0 features
 */

(function () {
  'use strict';

  // Get the library from the global namespace (UMD build)
  const { 
    notify, 
    configureFeedback, 
    enableFeedbackDebug, 
    onFeedback,
    onAnyFeedback,
    confirm,
    prompt,
    createTemplate
  } = window.A11yFeedback;

  // State
  let visualModeEnabled = false;
  let soundEnabled = false;
  let announceCount = 0;
  let isSaving = false;
  let isUploading = false;

  // DOM Elements
  const visualToggle = document.getElementById('visual-toggle');
  const soundToggle = document.getElementById('sound-toggle');
  const saveStatus = document.getElementById('save-status');
  const progressStatus = document.getElementById('progress-status');
  const dialogResult = document.getElementById('dialog-result');
  const announceCountEl = document.getElementById('announce-count');
  const srTimeline = document.getElementById('sr-timeline');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const playgroundCode = document.getElementById('playground-code');
  const playgroundLog = document.getElementById('playground-log');
  const validationForm = document.getElementById('validation-form');

  // Enable debug mode
  enableFeedbackDebug();

  // ==========================================================================
  // Screen Reader Simulation Panel
  // ==========================================================================

  function addSREntry(message, type, politeness) {
    const srEmpty = srTimeline.querySelector('.sr-empty');
    if (srEmpty) {
      srEmpty.remove();
    }

    const entry = document.createElement('div');
    entry.className = 'sr-entry';
    entry.innerHTML = `
      <span class="sr-entry-time">${new Date().toLocaleTimeString()}</span>
      <div class="sr-entry-content">
        <span class="sr-entry-type sr-entry-type-${politeness}">${politeness}</span>
        <span class="sr-entry-message">${escapeHtml(message)}</span>
      </div>
    `;

    srTimeline.insertBefore(entry, srTimeline.firstChild);

    // Limit entries
    while (srTimeline.children.length > 20) {
      srTimeline.removeChild(srTimeline.lastChild);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Clear SR panel button
  document.querySelector('.sr-panel-clear')?.addEventListener('click', function() {
    srTimeline.innerHTML = '<div class="sr-empty">Announcements will appear here as you interact...</div>';
  });

  // Subscribe to all feedback events
  onAnyFeedback(function(type, payload) {
    if (type === 'announced') {
      const event = payload.event;
      const politeness = event.ariaLive === 'assertive' ? 'assertive' : 'polite';
      addSREntry(event.message, event.type, politeness);
    }
  });

  // ==========================================================================
  // Mobile Navigation
  // ==========================================================================

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', (!isExpanded).toString());
      mobileNav.hidden = isExpanded;
    });

    // Close mobile nav when clicking a link
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });

    // Close on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !mobileNav.hidden) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        mobileMenuBtn.focus();
      }
    });
  }

  // ==========================================================================
  // Toggle Buttons
  // ==========================================================================

  visualToggle?.addEventListener('click', function () {
    visualModeEnabled = !visualModeEnabled;
    this.setAttribute('aria-checked', visualModeEnabled.toString());

    configureFeedback({
      visual: visualModeEnabled,
      visualPosition: 'top-right',
      maxVisualItems: 5
    });

    if (visualModeEnabled) {
      notify.info('Visual feedback mode enabled. Toast notifications will now appear.');
    } else {
      notify.info('Visual feedback mode disabled. Only screen reader announcements active.');
    }
  });

  soundToggle?.addEventListener('click', function () {
    soundEnabled = !soundEnabled;
    this.setAttribute('aria-checked', soundEnabled.toString());

    configureFeedback({
      enableSound: soundEnabled
    });

    if (soundEnabled) {
      notify.info('Sound effects enabled.');
    } else {
      notify.info('Sound effects disabled.');
    }
  });

  // ==========================================================================
  // Framework Tabs
  // ==========================================================================

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('aria-controls');
      
      // Update buttons
      tabButtons.forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // Update panels
      tabPanels.forEach(function(panel) {
        panel.classList.remove('active');
        panel.hidden = true;
      });
      
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.hidden = false;
      }
    });

    // Keyboard navigation for tabs
    btn.addEventListener('keydown', function(e) {
      let newIndex;
      const currentIndex = Array.from(tabButtons).indexOf(this);

      if (e.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft') {
        newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = tabButtons.length - 1;
      }

      if (newIndex !== undefined) {
        e.preventDefault();
        tabButtons[newIndex].click();
        tabButtons[newIndex].focus();
      }
    });
  });

  // ==========================================================================
  // All Demo Button Actions
  // ==========================================================================

  document.querySelectorAll('[data-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      const action = this.getAttribute('data-action');
      handleAction(action);
    });
  });

  function handleAction(action) {
    switch (action) {
      // Basic notifications
      case 'success':
        notify.success('Operation completed successfully!');
        incrementCount();
        break;

      case 'error':
        notify.error('Something went wrong. Please try again.');
        incrementCount();
        break;

      case 'warning':
        notify.warning('Your session will expire in 5 minutes.');
        incrementCount();
        break;

      case 'info':
        notify.info('New features are available. Check the changelog.');
        incrementCount();
        break;

      case 'loading':
        notify.loading('Processing your request...');
        incrementCount();
        break;

      // v2.0 Action Buttons
      case 'action-buttons':
        handleActionButtons();
        break;

      case 'action-undo':
        handleUndoAction();
        break;

      // v2.0 Progress Notifications
      case 'progress-upload':
        handleProgressUpload();
        break;

      case 'progress-download':
        handleProgressDownload();
        break;

      // v2.0 Dialogs
      case 'confirm-dialog':
        handleConfirmDialog();
        break;

      case 'prompt-dialog':
        handlePromptDialog();
        break;

      // v2.0 Rich Content
      case 'rich-icon':
        handleRichIcon();
        break;

      case 'rich-html':
        handleRichHtml();
        break;

      case 'rich-styled':
        handleRichStyled();
        break;

      // v2.0 Templates
      case 'template-save':
        handleTemplateSave();
        break;

      case 'template-network':
        handleTemplateNetwork();
        break;

      case 'template-welcome':
        handleTemplateWelcome();
        break;

      // Loading patterns
      case 'save-pattern':
        handleSavePattern(true);
        break;

      case 'save-error':
        handleSavePattern(false);
        break;

      // Deduplication
      case 'dedupe-test':
        handleDedupeTest();
        break;

      case 'force-test':
        handleForceTest();
        break;
    }
  }

  // ==========================================================================
  // v2.0 Action Buttons Demo
  // ==========================================================================

  function handleActionButtons() {
    notify.info('You have a new message from John', {
      actions: [
        { 
          label: 'View Message', 
          onClick: function() { 
            notify.success('Opening message...');
          }
        },
        { 
          label: 'Mark as Read', 
          variant: 'secondary',
          onClick: function() { 
            notify.success('Message marked as read');
          }
        }
      ]
    });
    incrementCount();
  }

  function handleUndoAction() {
    notify.warning('Item deleted', {
      actions: [
        { 
          label: 'Undo', 
          onClick: function() { 
            notify.success('Item restored!');
          }
        }
      ],
      timeout: 5000
    });
    incrementCount();
  }

  // ==========================================================================
  // v2.0 Progress Notifications Demo
  // ==========================================================================

  function handleProgressUpload() {
    if (isUploading) return;
    isUploading = true;

    progressStatus.innerHTML = '<span class="status-loading">📤 Uploading file...</span>';
    
    let progress = 0;
    notify.loading('Uploading file... 0%', { 
      id: 'upload-demo',
      progress: { value: 0, max: 100 }
    });
    incrementCount();

    const interval = setInterval(function() {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        notify.success('File uploaded successfully!', { id: 'upload-demo' });
        progressStatus.innerHTML = '<span class="status-success">✓ Upload complete!</span>';
        incrementCount();
        
        setTimeout(function() {
          progressStatus.innerHTML = '<span class="status-idle">Click to start a progress demo</span>';
          isUploading = false;
        }, 3000);
      } else {
        notify.loading(`Uploading file... ${Math.round(progress)}%`, { 
          id: 'upload-demo',
          progress: { value: Math.round(progress), max: 100 }
        });
      }
    }, 500);
  }

  function handleProgressDownload() {
    if (isUploading) return;
    isUploading = true;

    progressStatus.innerHTML = '<span class="status-loading">📥 Downloading file...</span>';
    
    let progress = 0;
    notify.loading('Downloading... 0%', { 
      id: 'download-demo',
      progress: { value: 0, max: 100 }
    });
    incrementCount();

    const interval = setInterval(function() {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        notify.success('Download complete!', { id: 'download-demo' });
        progressStatus.innerHTML = '<span class="status-success">✓ Download complete!</span>';
        incrementCount();
        
        setTimeout(function() {
          progressStatus.innerHTML = '<span class="status-idle">Click to start a progress demo</span>';
          isUploading = false;
        }, 3000);
      } else {
        notify.loading(`Downloading... ${Math.round(progress)}%`, { 
          id: 'download-demo',
          progress: { value: Math.round(progress), max: 100 }
        });
      }
    }, 300);
  }

  // ==========================================================================
  // v2.0 Dialogs Demo
  // ==========================================================================

  async function handleConfirmDialog() {
    dialogResult.innerHTML = '<span class="status-loading">Waiting for user response...</span>';
    
    try {
      const result = await confirm('Are you sure you want to delete this item? This action cannot be undone.');
      
      if (result) {
        dialogResult.innerHTML = '<span class="status-success">✓ User confirmed the action</span>';
        notify.success('Item deleted successfully!');
      } else {
        dialogResult.innerHTML = '<span class="status-idle">✕ User cancelled the action</span>';
        notify.info('Deletion cancelled');
      }
    } catch (e) {
      dialogResult.innerHTML = '<span class="status-error">Dialog was dismissed</span>';
    }
    
    incrementCount();
  }

  async function handlePromptDialog() {
    dialogResult.innerHTML = '<span class="status-loading">Waiting for user input...</span>';
    
    try {
      const result = await prompt('What would you like to name this file?');
      
      if (result && result.value) {
        dialogResult.innerHTML = `<span class="status-success">✓ User entered: "${escapeHtml(result.value)}"</span>`;
        notify.success(`File renamed to "${result.value}"`);
      } else {
        dialogResult.innerHTML = '<span class="status-idle">✕ User cancelled or provided no input</span>';
        notify.info('Rename cancelled');
      }
    } catch (e) {
      dialogResult.innerHTML = '<span class="status-error">Dialog was dismissed</span>';
    }
    
    incrementCount();
  }

  // ==========================================================================
  // v2.0 Rich Content Demo
  // ==========================================================================

  function handleRichIcon() {
    notify.success('Task completed!', {
      richContent: {
        icon: '⭐',
        iconColor: '#fbbf24'
      }
    });
    incrementCount();
  }

  function handleRichHtml() {
    notify.info('Check out our documentation', {
      richContent: {
        html: 'Visit our <a href="https://github.com/WOLFIEEEE/a11y-feedback" target="_blank">GitHub page</a> for more details.'
      }
    });
    incrementCount();
  }

  function handleRichStyled() {
    notify.warning('Important update available', {
      richContent: {
        icon: '🎯',
        title: 'Version 2.0 Released!',
        subtitle: 'Includes action buttons, progress, and more'
      }
    });
    incrementCount();
  }

  // ==========================================================================
  // v2.0 Templates Demo
  // ==========================================================================

  // Create reusable templates
  const saveTemplate = createTemplate ? createTemplate({
    type: 'success',
    messageTemplate: 'Successfully saved {item}!',
    options: {
      timeout: 3000
    }
  }) : null;

  const networkErrorTemplate = createTemplate ? createTemplate({
    type: 'error',
    messageTemplate: 'Network error: {error}',
    options: {
      actions: [
        { label: 'Retry', onClick: function() { notify.info('Retrying...'); } }
      ]
    }
  }) : null;

  const welcomeTemplate = createTemplate ? createTemplate({
    type: 'info',
    messageTemplate: 'Welcome back, {name}!',
    options: {
      richContent: {
        icon: '👋'
      }
    }
  }) : null;

  function handleTemplateSave() {
    if (saveTemplate) {
      saveTemplate.show({ item: 'document' });
    } else {
      notify.success('Successfully saved document!');
    }
    incrementCount();
  }

  function handleTemplateNetwork() {
    if (networkErrorTemplate) {
      networkErrorTemplate.show({ error: 'Connection timeout' });
    } else {
      notify.error('Network error: Connection timeout');
    }
    incrementCount();
  }

  function handleTemplateWelcome() {
    if (welcomeTemplate) {
      welcomeTemplate.show({ name: 'Developer' });
    } else {
      notify.info('Welcome back, Developer!');
    }
    incrementCount();
  }

  // ==========================================================================
  // Form Validation Demo
  // ==========================================================================

  if (validationForm) {
    validationForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      
      // Clear previous errors
      this.querySelectorAll('.form-error').forEach(function(el) { el.textContent = ''; });
      this.querySelectorAll('.form-input').forEach(function(el) {
        el.classList.remove('error');
        el.removeAttribute('aria-invalid');
      });

      // Validate fields
      const name = document.getElementById('form-name');
      const email = document.getElementById('form-email');
      const password = document.getElementById('form-password');
      const confirmEl = document.getElementById('form-confirm');
      const terms = document.getElementById('form-terms');

      let firstError = null;
      let errors = [];

      // Name validation
      if (!name.value.trim()) {
        setFieldError(name, 'name-error', 'Name is required');
        if (!firstError) firstError = name;
        errors.push('Name is required');
      } else if (name.value.trim().length < 2) {
        setFieldError(name, 'name-error', 'Name must be at least 2 characters');
        if (!firstError) firstError = name;
        errors.push('Name must be at least 2 characters');
      }

      // Email validation
      if (!email.value.trim()) {
        setFieldError(email, 'email-error', 'Email is required');
        if (!firstError) firstError = email;
        errors.push('Email is required');
      } else if (!email.value.includes('@') || !email.value.includes('.')) {
        setFieldError(email, 'email-error', 'Please enter a valid email address');
        if (!firstError) firstError = email;
        errors.push('Please enter a valid email address');
      }

      // Password validation
      if (!password.value) {
        setFieldError(password, 'password-error', 'Password is required');
        if (!firstError) firstError = password;
        errors.push('Password is required');
      } else if (password.value.length < 8) {
        setFieldError(password, 'password-error', 'Password must be at least 8 characters');
        if (!firstError) firstError = password;
        errors.push('Password must be at least 8 characters');
      }

      // Confirm password
      if (password.value && password.value !== confirmEl.value) {
        setFieldError(confirmEl, 'confirm-error', 'Passwords do not match');
        if (!firstError) firstError = confirmEl;
        errors.push('Passwords do not match');
      }

      // Terms checkbox
      if (!terms.checked) {
        document.getElementById('terms-error').textContent = 'You must agree to the Terms of Service';
        if (!firstError) firstError = terms;
        errors.push('You must agree to the Terms of Service');
      }

      // If errors, announce and focus first error
      if (errors.length > 0) {
        notify.error('Please fix ' + errors.length + ' error' + (errors.length > 1 ? 's' : '') + ': ' + errors[0], {
          focus: '#' + firstError.id,
          explainFocus: true
        });
        return;
      }

      // Show loading state
      btnText.hidden = true;
      btnLoading.hidden = false;
      submitBtn.disabled = true;

      notify.loading('Creating your account...', { id: 'form-submit' });

      // Simulate API call
      await new Promise(function(resolve) { setTimeout(resolve, 2000); });

      // Success
      notify.success('Account created successfully! Welcome aboard.', { id: 'form-submit' });
      
      btnText.hidden = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;
      
      // Reset form
      validationForm.reset();
    });

    validationForm.addEventListener('reset', function() {
      this.querySelectorAll('.form-error').forEach(function(el) { el.textContent = ''; });
      this.querySelectorAll('.form-input').forEach(function(el) {
        el.classList.remove('error');
        el.removeAttribute('aria-invalid');
      });
      notify.info('Form has been reset.');
    });
  }

  function setFieldError(field, errorId, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    document.getElementById(errorId).textContent = message;
  }

  // ==========================================================================
  // Loading → Success Pattern
  // ==========================================================================

  function handleSavePattern(shouldSucceed) {
    if (isSaving) return;

    isSaving = true;

    saveStatus.innerHTML = '<span class="status-loading">⏳ Saving changes...</span>';

    notify.loading('Saving your changes...', { id: 'save-operation' });
    incrementCount();

    setTimeout(function () {
      if (shouldSucceed) {
        notify.success('Changes saved successfully!', { id: 'save-operation' });
        saveStatus.innerHTML = '<span class="status-success">✓ Saved!</span>';
      } else {
        notify.error('Failed to save changes. Please try again.', { id: 'save-operation' });
        saveStatus.innerHTML = '<span class="status-error">✕ Save failed</span>';
      }
      incrementCount();

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
    notify.info('This message is deduplicated when clicked rapidly.');
    incrementCount();
  }

  function handleForceTest() {
    notify.info('This message is always announced!', { force: true });
    incrementCount();
  }

  // ==========================================================================
  // API Playground
  // ==========================================================================

  const runCodeBtn = document.getElementById('run-code');
  const clearOutputBtn = document.getElementById('clear-output');

  if (runCodeBtn && playgroundCode && playgroundLog) {
    runCodeBtn.addEventListener('click', function() {
      const code = playgroundCode.value;
      
      // Clear previous output
      playgroundLog.innerHTML = '';
      
      // Log function for output
      var logToPlayground = function(message, type) {
        type = type || 'info';
        const entry = document.createElement('div');
        entry.className = 'log-entry log-entry-' + type;
        entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
        playgroundLog.appendChild(entry);
        playgroundLog.scrollTop = playgroundLog.scrollHeight;
      };

      // Override console.log temporarily
      const originalLog = console.log;
      console.log = function() {
        const args = Array.prototype.slice.call(arguments);
        logToPlayground(args.join(' '), 'info');
        originalLog.apply(console, args);
      };

      try {
        // Execute the code with all v2.0 APIs available
        const func = new Function('notify', 'configureFeedback', 'onFeedback', 'confirm', 'prompt', 'createTemplate', code);
        func(notify, configureFeedback, onFeedback, confirm, prompt, createTemplate);
        logToPlayground('Code executed successfully', 'success');
      } catch (error) {
        logToPlayground('Error: ' + error.message, 'error');
      }

      // Restore console.log
      console.log = originalLog;
    });

    clearOutputBtn?.addEventListener('click', function() {
      playgroundLog.innerHTML = '<div class="log-entry log-entry-info">[Ready] Click "Run Code" to execute</div>';
    });
  }

  // Example code snippets - updated for v2.0
  const examples = {
    basic: '// Basic notifications\nnotify.success(\'Profile saved successfully!\')\nnotify.info(\'New message received\')\nnotify.warning(\'Low storage space\')\nnotify.error(\'Connection lost\')',

    actions: '// Notifications with action buttons (v2.0)\nnotify.info(\'New comment on your post\', {\n  actions: [\n    { \n      label: \'View\', \n      onClick: () => console.log(\'Opening post...\') \n    },\n    { \n      label: \'Dismiss\', \n      variant: \'secondary\' \n    }\n  ]\n})\n\n// Undo action pattern\nnotify.warning(\'Message deleted\', {\n  actions: [\n    { label: \'Undo\', onClick: () => notify.success(\'Restored!\') }\n  ],\n  timeout: 5000\n})',

    progress: '// Progress notifications (v2.0)\nlet progress = 0\nnotify.loading(\'Uploading... 0%\', { \n  id: \'upload\',\n  progress: { value: 0, max: 100 }\n})\n\n// Simulate progress\nconst interval = setInterval(() => {\n  progress += 20\n  if (progress >= 100) {\n    clearInterval(interval)\n    notify.success(\'Upload complete!\', { id: \'upload\' })\n  } else {\n    notify.loading(`Uploading... ${progress}%`, { \n      id: \'upload\',\n      progress: { value: progress, max: 100 }\n    })\n  }\n}, 500)',

    dialogs: '// Promise-based dialogs (v2.0)\n(async () => {\n  // Confirm dialog\n  const confirmed = await confirm(\'Delete this file?\')\n  console.log(\'User confirmed:\', confirmed)\n\n  // Prompt dialog\n  const result = await prompt(\'Enter new filename:\')\n  if (result && result.value) {\n    console.log(\'User entered:\', result.value)\n    notify.success(`Renamed to ${result.value}`)\n  }\n})()',

    templates: '// Notification templates (v2.0)\nconst errorTemplate = createTemplate({\n  type: \'error\',\n  messageTemplate: \'Failed to {action}: {reason}\',\n  options: {\n    actions: [\n      { label: \'Retry\', onClick: () => console.log(\'Retrying...\') }\n    ]\n  }\n})\n\n// Use the template\nerrorTemplate.show({ \n  action: \'save document\', \n  reason: \'network timeout\' \n})',

    events: '// Listen to feedback events\nonFeedback(\'announced\', ({ event, region }) => {\n  console.log(`Announced to ${region}: ${event.message}`)\n})\n\n// Trigger some notifications\nnotify.success(\'This will be logged\')\nnotify.error(\'This too!\')'
  };

  document.querySelectorAll('.example-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const exampleName = this.getAttribute('data-example');
      if (examples[exampleName] && playgroundCode) {
        playgroundCode.value = examples[exampleName];
      }
    });
  });

  // ==========================================================================
  // Copy to Clipboard
  // ==========================================================================

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const textToCopy = this.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(
        function () {
          btn.classList.add('copied');
          const copyText = btn.querySelector('.copy-text');
          if (copyText) {
            copyText.textContent = 'Copied!';
          }

          notify.success('Copied to clipboard');

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
        
        // Close mobile nav if open
        if (mobileNav && !mobileNav.hidden) {
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
          mobileNav.hidden = true;
        }
        
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
  // Utility
  // ==========================================================================

  function incrementCount() {
    announceCount++;
    if (announceCountEl) {
      announceCountEl.textContent = announceCount.toString();
    }
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  // Welcome message (delayed)
  setTimeout(function () {
    notify.info('Welcome to the a11y-feedback v2.0 demo! Try the new features below.', {
      id: 'welcome'
    });
  }, 500);
})();
