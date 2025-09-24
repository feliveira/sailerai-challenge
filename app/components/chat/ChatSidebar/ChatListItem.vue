<template>
  <div 
    class="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 focus:outline-none focus:bg-gray-50"
    :class="{ 
      'bg-blue-50 border-r-4 border-r-blue-500': isSelected,
      'hover:bg-blue-25': !isSelected
    }"
    role="option"
    tabindex="0"
    @click="$emit('select')"
    @keydown.enter="$emit('select')"
    @keydown.space.prevent="$emit('select')"
    :aria-selected="isSelected"
  >
    <div class="flex items-start space-x-3">
      <!-- Avatar -->
      <ChatAvatar 
        name="Customer 1" 
        :status="chat.status"
        size="lg"
      />
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <p class="font-medium text-gray-900 truncate" title="Customer 1">
            Customer 1 
          </p>
          <time 
            class="text-xs text-gray-500"
            :datetime="chat.isoTime"
            :title="chat.fullTime"
          >
            {{ chat.time }}
          </time>
        </div>
        
        <p class="text-sm text-gray-500 truncate mt-1" :title="chat.lastMessage">
          {{ chat.lastMessage }}
        </p>
        
        <div class="flex items-center justify-between mt-2">
          <ChatStatus :status="chat.status ?? 'offline'" :text="chat.status ?? 'offline'" />
          
          <ChatUnreadBadge 
            v-if="chat.unreadCount" 
            :count="chat.unreadCount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '@/types/chat'
import ChatAvatar from '~/components/chat/shared/ChatAvatar.vue';
import ChatStatus from '~/components/chat/shared/ChatStatus.vue';
import ChatUnreadBadge from '~/components/chat/shared/ChatUnreadBadge.vue';

interface Props {
  chat: Chat
  isSelected: boolean
}


interface Emits {
  select: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>