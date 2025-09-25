<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-3xl font-bold text-gray-900">
        Chats em andamento
      </h1>
      <p class="text-gray-600 mt-2">
        Veja as conversas entre o AiBot e os seus leads ao vivo.
      </p>

      <div class="flex gap-2 mt-2">
        <button @click="switchSender('customer_1')"
          class="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs hover:bg-blue-200">
          👤 Customer 1
          <span v-if="messageSender === 'customer_1'">✅</span>
        </button>
        <button @click="switchSender('agent_daniel')"
          class="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs hover:bg-purple-200">
          👨‍💻 Agent Daniel
          <span v-if="messageSender === 'agent_daniel'">✅</span>
        </button>

      </div>
    </header>

    <!-- Main Content -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <ChatSidebar :key="chats.toString()" :chats="chats" :selected-chat-id="selectedChat?.chat_id || null"
        :isLoading="isLoading" @select-chat="selectChat" @new-chat="handleNewChat" />

      <ChatWindow :key="selectedChat?.toString() ?? 'no-chat'" :selected-chat="selectedChat"
        @send-message="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useChatOperations } from '~/composables/useChatOperations'
import { useWebSocketChat } from '~/composables/useWebSocketChat'
import type { Chat, Message } from '~/types/chat'
import type { WebSocketEvent, WebSocketMessage, WebSocketPresence } from '~/composables/useWebSocketChat'
import ChatSidebar from '~/components/chat/ChatSidebar/ChatSidebar.vue'
import ChatWindow from '~/components/chat/ChatWindow/ChatWindow.vue'
import { toast } from 'vue-sonner'
import 'vue-sonner/style.css'

definePageMeta({
  title: 'Chats',
  subtitle: 'Gerencie suas conversas em tempo real',
  layout: 'dashboard'
})

const api = useApi()
const {
  connect,
  disconnectAll
} = useWebSocketChat()

const selectedChat = ref<Chat | null>(null)
const chats = ref<Chat[]>([])
const messageSender = ref<'customer_1' | 'agent_daniel'>('agent_daniel')
const isLoading = ref(true)

onMounted(() => {
  getChats()
})

onUnmounted(() => {
  disconnectAll()
})

const getChats = async () => {

  isLoading.value = true

  try {
    const data = await useChatOperations().fetchChats() as Chat[]
    chats.value = data.map((chat: any) => ({
      ...chat,
    }))

    // Connect to all chats and load their messages
    await Promise.allSettled(chats.value.map(async (chat) => {
      try {

        await Promise.all([
          connectToChat(chat.chat_id),
          loadChatMessages(chat.chat_id)
        ])

      } catch (error) {
        console.error(`Failed to process chat ${chat.chat_id.slice(-6)}`, error)
      }
    }))

  } catch (error) {
    console.error('Failed to fetch chats', error)
  } finally {
    isLoading.value = false
  }
}

const loadChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const messages: Message[] = await useChatOperations().fetchMessages(chatId) as Message[]
    const processedMessages = messages.map((msg) => ({
      id: msg.id,
      user_id: msg.user_id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      sender: msg.user_id.includes('bot') ? 'bot' : 'user',
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isoTime: msg.timestamp,
      fullTime: new Date(msg.timestamp).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    chats.value = chats.value.map(chat =>
      chat.chat_id === chatId
        ? {
          ...chat,
          messages: processedMessages,
          lastMessage: processedMessages.slice(-1)[0]?.content || '',
          time: processedMessages.slice(-1)[0]?.time || '',
          isoTime: processedMessages.slice(-1)[0]?.isoTime || '',
          fullTime: processedMessages.slice(-1)[0]?.fullTime || ''
        }
        : chat
    )

    return processedMessages
  } catch (error) {
    console.error(`Failed to load messages for chat ${chatId.slice(-6)}`, error)
    return []
  }
}

const connectToChat = async (chatId: string) => {
  try {
    const socket = await connect(chatId)

    socket.onmessage = (event) => {

      try {
        const wsEvent: WebSocketEvent = JSON.parse(event.data)
        handleWebSocketEvent(chatId, wsEvent)
      } catch (parseError) {
        console.error(`Failed to parse WebSocket message for chat`, parseError)
      }
    }

  } catch (error) {
    console.error('error', `Failed to connect to WebSocket for chat`, error)
  }
}

const handleNewChat = async () => {
  try {
    const data = await api<Chat>('/chats', {
      method: 'POST',
      body: { participants: ['customer_1', 'agent_daniel'] }
    })

    const newChat = {
      ...data,
    }

    chats.value.push(newChat)

    // Connect and load messages for the new chat
    await Promise.all([
      connectToChat(data.chat_id),
      loadChatMessages(data.chat_id)
    ])

    toast.success('Chat criado com sucesso!')

  } catch (error) {
    console.error('error', 'Failed to create new chat', error)
  }
}

const handleWebSocketEvent = (chatId: string, event: WebSocketEvent) => {
  switch (event.event) {
    case 'message_received':
      handleNewMessage(chatId, event.data as WebSocketMessage)
      break
    case 'presence_updated':
      handlePresenceUpdate(chatId, event.data as WebSocketPresence)
      break
  }
}

const switchSender = (sender: 'customer_1' | 'agent_daniel') => {
  messageSender.value = sender
  selectedChat.value = null
}

const handleNewMessage = (chatId: string, messageData: WebSocketMessage) => {
  const newMessage: Message = {
    id: messageData.id,
    content: messageData.content,
    user_id: messageData.user_id,
    type: messageData.type,
    time: new Date(messageData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isoTime: messageData.timestamp,
    timestamp: messageData.timestamp,
    fullTime: new Date(messageData.timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const chat = chats.value.find(c => c.chat_id === chatId)
  if (chat) {
    if (!chat.messages) {
      chat.messages = []
    }
    chat.messages.push(newMessage)
    chat.lastMessage = newMessage.content
    chat.time = newMessage?.time ?? ''
    chat.isoTime = newMessage.isoTime
    chat.fullTime = newMessage.fullTime

    // Increment unread count if not the selected chat
    if (selectedChat.value?.chat_id !== chatId) {
      chat.unreadCount = (chat.unreadCount || 0) + 1
    }
  }

  // Update selected chat if it's the same
  if (selectedChat.value?.chat_id === chatId) {
    selectedChat.value = { ...selectedChat.value, messages: chat?.messages || [] }
  }
}

const handlePresenceUpdate = (chatId: string, presenceData: WebSocketPresence) => {
  chats.value = chats.value.map(chat =>
    chat.chat_id === chatId
      ? {
        ...chat,
        status: presenceData.status,
      }
      : chat
  )

  if (selectedChat.value?.chat_id === chatId) {
    selectedChat.value = {
      ...selectedChat.value,
      status: presenceData.status,
    }
  }
}

const sendMessage = async (messageText: string) => {
  if (!selectedChat.value) {
    return
  }

  try {
    await api(`/chats/${selectedChat.value.chat_id}/messages`, {
      method: 'POST',
      body: {
        user_id: messageSender.value,
        type: 'text',
        content: messageText
      }
    })

  } catch (error) {
    toast.error('Erro ao enviar mensagem, por favor tente novamente.')
  }
}

const selectChat = (chat: Chat) => {
  selectedChat.value = {
    ...chat,
    messages: chat.messages || []
  }
  chat.unreadCount = 0

  markChatAsRead(chat.chat_id)
}

const markChatAsRead = async (chatId: string) => {
  try {
    await api(`/chats/${chatId}/read`, {
      method: 'POST',
      body: {
        user_id: messageSender.value
      }
    })

  } catch (error) {
    console.error('error', `Failed to mark chat as read`, error)
  }
}
</script>