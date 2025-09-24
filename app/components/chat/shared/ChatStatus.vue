<template>
  <span 
    :key="status"
    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    :class="statusClasses"
    :aria-label="`Status: ${text}`"
  >
    <div 
      class="w-1.5 h-1.5 rounded-full mr-1"
      :class="dotClasses"
      aria-hidden="true"
    ></div>
    {{ text }}
  </span>
</template>

<script setup lang="ts">
import type { ChatStatus } from '@/types/chat'

interface Props {
  status: ChatStatus
  text: string
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  const classes = {
    online: 'bg-green-100 text-green-800',
    typing: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-gray-100 text-gray-800'
  }
  return classes[props.status]
})

const dotClasses = computed(() => {
  const classes = {
    online: 'bg-green-500',
    typing: 'bg-yellow-500',
    offline: 'bg-gray-500'
  }
  return classes[props.status]
})
</script>