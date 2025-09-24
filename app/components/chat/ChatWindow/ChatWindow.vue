<template>
  <main 
    class="xl:col-span-8"
    role="main"
    aria-label="Janela de conversa"
  >
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-12rem)] flex flex-col">
      <!-- Chat Header -->
      <ChatWindowHeader 
        v-if="selectedChat" 
        :chat="selectedChat" 
      />

      <!-- Messages Area -->
      <ChatMessageArea 
        :selected-chat="selectedChat"
        class="flex-1"
      />

      <!-- Message Input -->
      <ChatMessageInput
        v-if="selectedChat"
        :disabled="!selectedChat"
        @send-message="handleSendMessage"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Chat } from '@/types/chat'
import ChatWindowHeader from '~/components/chat/ChatWindow/ChatWindowHeader.vue';
import ChatMessageArea from '~/components/chat/ChatWindow/ChatMessageArea.vue';
import ChatMessageInput from '~/components/chat/ChatWindow/ChatMessageInput.vue';

interface Props {
  selectedChat: Chat | null
}

interface Emits {
  sendMessage: [message: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSendMessage = (message: string) => {
  emit('sendMessage', message)
}
</script>