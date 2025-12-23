# @theaccessibleteam/a11y-feedback-react

React bindings for [a11y-feedback](https://www.npmjs.com/package/@theaccessibleteam/a11y-feedback) - the accessibility-first feedback library.

## Installation

```bash
npm install @theaccessibleteam/a11y-feedback @theaccessibleteam/a11y-feedback-react
```

## Quick Start

### Option 1: Using the Hook (Simple)

```tsx
import { useA11yFeedback } from '@theaccessibleteam/a11y-feedback-react'
import { configureFeedback } from '@theaccessibleteam/a11y-feedback'

// Configure once at app startup
configureFeedback({ visual: true })

function SaveButton() {
  const feedback = useA11yFeedback()

  const handleSave = async () => {
    feedback.loading('Saving...', { id: 'save' })

    try {
      await saveData()
      feedback.success('Saved!', { id: 'save' })
    } catch (e) {
      feedback.error('Failed to save', { id: 'save', focus: '#save-btn' })
    }
  }

  return <button id="save-btn" onClick={handleSave}>Save</button>
}
```

### Option 2: Using the Provider (Recommended for Apps)

```tsx
import { A11yFeedbackProvider, useA11yFeedbackContext } from '@theaccessibleteam/a11y-feedback-react'

function App() {
  return (
    <A11yFeedbackProvider config={{ visual: true }} debug>
      <MyApp />
    </A11yFeedbackProvider>
  )
}

function MyComponent() {
  const { success, error } = useA11yFeedbackContext()

  const handleAction = async () => {
    try {
      await performAction()
      success('Action completed!')
    } catch (e) {
      error('Action failed')
    }
  }

  return <button onClick={handleAction}>Do Something</button>
}
```

## Hooks

### `useA11yFeedback()`

Main hook providing all feedback methods. Can be used without a provider.

```tsx
const { success, error, warning, info, loading, dismiss, dismissAll } = useA11yFeedback()
```

### `useA11yAnnounce()`

Lightweight hook for screen reader announcements only.

```tsx
const { announcePolite, announceAssertive } = useA11yAnnounce()

// Polite announcements wait for current speech to finish
announcePolite('Results updated')

// Assertive announcements interrupt immediately
announceAssertive('Error: Please fix the form')
```

### `useFeedbackConfig()`

Hook for managing configuration reactively.

```tsx
const { config, updateConfig, enableVisual, disableVisual } = useFeedbackConfig()
```

### `useA11yFeedbackContext()`

Access the provider context. Must be used inside `A11yFeedbackProvider`.

```tsx
const ctx = useA11yFeedbackContext()
```

## API

### `A11yFeedbackProvider`

| Prop | Type | Description |
|------|------|-------------|
| `config` | `Partial<FeedbackConfig>` | Configuration options |
| `debug` | `boolean` | Enable debug mode |
| `children` | `ReactNode` | Child components |

### `useA11yFeedback()` Return

| Method | Description |
|--------|-------------|
| `success(message, options?)` | Send success notification |
| `error(message, options?)` | Send error notification |
| `warning(message, options?)` | Send warning notification |
| `info(message, options?)` | Send info notification |
| `loading(message, options?)` | Send loading notification |
| `dismiss(id)` | Dismiss specific notification |
| `dismissAll()` | Dismiss all notifications |

## TypeScript

Full TypeScript support with exported types:

```tsx
import type { 
  FeedbackType, 
  FeedbackOptions, 
  FeedbackEvent,
  FeedbackConfig 
} from '@theaccessibleteam/a11y-feedback-react'
```

## License

MIT

