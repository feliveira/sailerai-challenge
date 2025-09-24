<template>
  <div 
    class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
    role="log"
    aria-live="polite"
    aria-label="Mensagens da conversa"
    ref="messagesContainer"
  >
    <!-- Empty State -->
    <ChatEmptyState 
      v-if="!selectedChat"
      icon="MessageCircle"
      title="Selecione uma conversa"
      message="Escolha uma conversa da lista ao lado para ver as mensagens e continuar o atendimento."
    />
    
    <!-- Messages -->
    <div v-else>
      <ChatMessage
        v-for="message in selectedChat.messages"
        :key="message.id"
        :message="message"
        class="mb-4"
      />
      
      <!-- Typing Indicator -->
      <ChatTypingIndicator 
        v-if="selectedChat.status === 'typing'" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '@/types/chat'
import ChatEmptyState from '~/components/chat/shared/ChatEmptyState.vue';
import ChatMessage from '~/components/chat/ChatWindow/ChatMessage.vue';
import ChatTypingIndicator from '~/components/chat/shared/ChatTypingIndicator.vue';

interface Props {
  selectedChat: Chat | null
}

const props = defineProps<Props>()
const messagesContainer = ref<HTMLElement>()

// Auto-scroll to bottom when new messages arrive
watch(() => props.selectedChat?.messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })
</script>