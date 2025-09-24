<template>
  <div 
    class="p-4 border-t border-gray-200 bg-white rounded-b-xl"
    role="region"
    aria-label="Enviar mensagem"
  >
    <form @submit.prevent="handleSubmit" class="flex space-x-3">
      <label for="message-input" class="sr-only">
        Digite sua mensagem
      </label>
      <input
        id="message-input"
        v-model="messageText"
        type="text"
        placeholder="Digite sua mensagem..."
        class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :disabled="disabled"
        maxlength="1000"
        aria-describedby="message-help"
      />
      <span id="message-help" class="sr-only">
        Pressione Enter para enviar ou clique no botão enviar
      </span>
      
      <button 
        type="submit"
        class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="disabled || !messageText.trim()"
        aria-label="Enviar mensagem"
      >
        <Send class="h-4 w-4" aria-hidden="true" />
        <span class="hidden sm:inline">Enviar</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Send } from 'lucide-vue-next'

interface Props {
  disabled?: boolean
}

interface Emits {
  sendMessage: [message: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const messageText = ref('')

const handleSubmit = () => {
  if (!messageText.value.trim()) return
  
  emit('sendMessage', messageText.value.trim())
  messageText.value = ''
}
</script>