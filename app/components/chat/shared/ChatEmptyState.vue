<template>
  <div 
    class="p-8 text-center"
    :class="containerClasses"
    role="status"
    :aria-label="ariaLabel"
  >
    <component 
      :is="iconComponent"
      class="text-gray-300 mx-auto mb-4"
      :class="iconClasses"
      aria-hidden="true"
    />
    <h2 
      v-if="title" 
      class="text-lg font-medium text-gray-700 mb-2"
    >
      {{ title }}
    </h2>
    <p class="text-gray-500" :class="messageClasses">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'

interface Props {
  icon?: string
  title?: string
  message: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'MessageCircle',
  size: 'md'
})

const iconComponent = computed(() => {
  const icons = {
    MessageCircle
  }
  return icons[props.icon as keyof typeof icons] || MessageCircle
})

const containerClasses = computed(() => {
  return props.size === 'lg' ? 'h-full flex flex-col items-center justify-center text-gray-500' : ''
})

const iconClasses = computed(() => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }
  return sizes[props.size]
})

const messageClasses = computed(() => {
  return props.size === 'lg' ? 'text-center max-w-md' : ''
})

const ariaLabel = computed(() => {
  return props.title ? `${props.title}: ${props.message}` : props.message
})
</script>