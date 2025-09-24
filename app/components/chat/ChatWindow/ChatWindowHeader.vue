<template>
  <header 
    class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl"
    role="banner"
  >
    <div class="flex items-center space-x-3">
      <ChatAvatar 
        name="Customer 1" 
        :status="chat.status"
        size="md"
      />
      
      <div>
        <h2 class="font-medium text-gray-900" id="chat-title">
          Customer 1
        </h2>
        <p 
          class="text-sm text-gray-500 flex items-center"
          :aria-label="`Status atual: ${chat.statusText}`"
        >
          {{ chat.statusText }}
        </p>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Chat } from '@/types/chat'
import ChatAvatar from '~/components/chat/shared/ChatAvatar.vue';

interface Props {
  chat: Chat
}

defineProps<Props>()
</script>