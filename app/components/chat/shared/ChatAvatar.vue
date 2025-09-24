<template>
  <div class="relative">
    <div 
      class="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center"
      :class="sizeClasses"
      :aria-label="`Avatar de ${name}`"
    >
      <User 
        class="text-white" 
        :class="iconSizeClasses"
        aria-hidden="true"
      />
    </div>
    
    <!-- Status Indicator -->
    <div 
      v-if="status === 'online'"
      class="absolute bg-green-500 border-2 border-white rounded-full"
      :class="statusSizeClasses"
      aria-label="Online"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next'
import type { ChatStatus } from '@/types/chat'

interface Props {
  name: string
  status?: ChatStatus
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }
  return sizes[props.size]
})

const iconSizeClasses = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }
  return sizes[props.size]
})

const statusSizeClasses = computed(() => {
  const positions = {
    sm: '-bottom-0.5 -right-0.5 w-2.5 h-2.5',
    md: '-bottom-0.5 -right-0.5 w-3 h-3',
    lg: '-bottom-0.5 -right-0.5 w-4 h-4'
  }
  return positions[props.size]
})
</script>