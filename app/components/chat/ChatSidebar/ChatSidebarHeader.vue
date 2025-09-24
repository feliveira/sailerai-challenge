<template>
  <header class="p-4 border-b border-gray-200">
    <button
      :disabled="disabled" 
      class="disabled:from-gray-400 disabled:to-gray-600 w-full flex items-center justify-center px-4 py-3 border bg-gradient-to-br from-blue-400 to-blue-600 border-gray-300 rounded-lg hover:from-blue-400 hover:to-blue-800 transition-colors delay-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      @click="$emit('newChat')"
      aria-label="Iniciar nova conversa"
    >
      <Plus class="h-5 w-5 text-gray-50" aria-hidden="true" />
      <span class="sr-only">Nova conversa</span>
    </button>
  </header>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

defineProps<{
  disabled?: boolean
}>()

defineEmits<{
  newChat: []
}>()
</script>