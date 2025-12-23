# @theaccessibleteam/a11y-feedback-vue

Vue 3 composables for [a11y-feedback](https://www.npmjs.com/package/@theaccessibleteam/a11y-feedback) - the accessibility-first feedback library.

## Installation

```bash
npm install @theaccessibleteam/a11y-feedback @theaccessibleteam/a11y-feedback-vue
```

## Quick Start

### Option 1: Using the Composable (Simple)

```vue
<script setup lang="ts">
import { useA11yFeedback } from '@theaccessibleteam/a11y-feedback-vue'
import { configureFeedback } from '@theaccessibleteam/a11y-feedback'

// Configure once at app startup
configureFeedback({ visual: true })

const feedback = useA11yFeedback()

async function handleSave() {
  feedback.loading('Saving...', { id: 'save' })

  try {
    await saveData()
    feedback.success('Saved!', { id: 'save' })
  } catch (e) {
    feedback.error('Failed to save', { id: 'save' })
  }
}
</script>

<template>
  <button @click="handleSave">Save</button>
</template>
```

### Option 2: Using the Plugin (Recommended for Apps)

```ts
// main.ts
import { createApp } from 'vue'
import { a11yFeedbackPlugin } from '@theaccessibleteam/a11y-feedback-vue'
import App from './App.vue'

const app = createApp(App)

app.use(a11yFeedbackPlugin, {
  config: {
    visual: true,
    visualPosition: 'top-right',
  },
  debug: import.meta.env.DEV,
})

app.mount('#app')
```

Then use in components:

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { A11yFeedbackKey } from '@theaccessibleteam/a11y-feedback-vue'

const feedback = inject(A11yFeedbackKey)!

function handleAction() {
  feedback.success('Action completed!')
}
</script>

<template>
  <button @click="handleAction">Do Something</button>
</template>
```

Or with Options API:

```vue
<script lang="ts">
export default {
  methods: {
    handleAction() {
      this.$a11yFeedback.success('Action completed!')
    },
  },
}
</script>
```

## Composables

### `useA11yFeedback()`

Main composable providing all feedback methods.

```ts
const { success, error, warning, info, loading, dismiss, dismissAll } = useA11yFeedback()
```

### `useA11yAnnounce()`

Lightweight composable for screen reader announcements only.

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useA11yAnnounce } from '@theaccessibleteam/a11y-feedback-vue'

const props = defineProps<{ count: number }>()
const { announcePolite, announceAssertive } = useA11yAnnounce()

watch(() => props.count, (newCount) => {
  announcePolite(`Found ${newCount} results`)
})
</script>
```

### `useFeedbackConfig()`

Composable for managing configuration reactively.

```ts
const { config, updateConfig, enableVisual, disableVisual, reset } = useFeedbackConfig()
```

## Plugin API

### `a11yFeedbackPlugin`

| Option | Type | Description |
|--------|------|-------------|
| `config` | `Partial<FeedbackConfig>` | Configuration options |
| `debug` | `boolean` | Enable debug mode |

### Injection Key

Use `A11yFeedbackKey` to inject the feedback instance:

```ts
import { inject } from 'vue'
import { A11yFeedbackKey } from '@theaccessibleteam/a11y-feedback-vue'

const feedback = inject(A11yFeedbackKey)
```

## TypeScript

Full TypeScript support with exported types:

```ts
import type { 
  FeedbackType, 
  FeedbackOptions, 
  FeedbackEvent,
  FeedbackConfig 
} from '@theaccessibleteam/a11y-feedback-vue'
```

## License

MIT

