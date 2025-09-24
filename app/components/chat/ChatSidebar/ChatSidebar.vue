<template>
  <aside 
    class="xl:col-span-4"
    role="complementary"
    aria-label="Lista de conversas"
  >
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-12rem)]">
      <!-- Search Header -->
      <ChatSidebarHeader :disabled="chats.length > 0" @new-chat="$emit('newChat')" />
      
      <!-- Chat List -->
      <div 
        class="divide-y divide-gray-100 overflow-y-auto h-full"
        role="listbox"
        aria-label="Conversas disponíveis"
      >
        <ChatListItem
          v-for="chat in chats"
          :key="chat.chat_id"
          :chat="chat"
          :is-selected="selectedChatId === chat.chat_id"
          @select="$emit('selectChat', chat)"
        />

        <ChatLoadingState 
        :is-loading="isLoading"
        />
        
        <!-- Empty State -->
        <ChatEmptyState 
          v-if="chats.length === 0 && !isLoading" 
          message="Nenhuma conversa encontrada"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Chat } from '@/types/chat'
import ChatLoadingState from '~/components/chat/shared/ChatLoadingState.vue'
import ChatEmptyState from '~/components/chat/shared/ChatEmptyState.vue'
import ChatListItem from '~/components/chat/ChatSidebar/ChatListItem.vue'
import ChatSidebarHeader from '~/components/chat/ChatSidebar/ChatSidebarHeader.vue'

interface Props {
  chats: Chat[]
  selectedChatId: string | null
  isLoading: boolean
}

interface Emits {
  selectChat: [chat: Chat]
  newChat: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>