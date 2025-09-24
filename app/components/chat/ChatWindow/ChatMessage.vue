<template>
  <div 
    class="flex mb-4"
    :class="{ 'justify-end': isAgent }"
    role="article"
    :aria-label="`Mensagem de ${senderLabel} às ${message.time}`"
  >
    <div 
      class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm"
      :class="messageClasses"
    >
      <!-- Text Message -->
      <div v-if="messageType === 'text'">
        <p class="text-sm">{{ message.content }}</p>
      </div>

      <!-- Audio Message -->
      <div v-else-if="messageType === 'audio'" class="space-y-2">
        <div class="flex items-center space-x-2">
          <button 
            @click="toggleAudio"
            class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            :class="audioButtonClasses"
            :disabled="isLoading"
          >
            <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else-if="!isPlaying" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <!-- Waveform visualization -->
              <div class="flex items-center space-x-1 flex-1">
                <div 
                  v-for="i in 20" 
                  :key="i"
                  class="w-1 bg-current rounded-full transition-all duration-150"
                  :class="audioWaveClasses"
                  :style="{ 
                    height: isPlaying && (i % 3 === currentWaveIndex % 3) ? '16px' : `${4 + Math.random() * 8}px`,
                    opacity: isPlaying ? (i <= (currentTime / duration) * 20 ? 1 : 0.3) : 0.5
                  }"
                ></div>
              </div>
              
              <span class="text-xs opacity-70 whitespace-nowrap">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </span>
            </div>
          </div>
        </div>
        
        <audio 
          ref="audioRef"
          :src="message.content"
          @loadedmetadata="onAudioLoaded"
          @timeupdate="onTimeUpdate"
          @ended="onAudioEnded"
          @loadstart="isLoading = true"
          @canplay="isLoading = false"
          preload="metadata"
        ></audio>
      </div>

      <div v-else class="space-y-2">
        <p class="text-sm">{{ message.content }}</p>
        <a 
          :href="message.content" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-xs underline opacity-70 hover:opacity-100 transition-opacity"
        >
          Abrir link
        </a>
      </div>

      <time 
        class="text-xs mt-2 opacity-70 block"
        :class="timeClasses"
        :datetime="message.isoTime"
        :title="message.fullTime"
      >
        {{ message.time }}
      </time>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { Message } from '@/types/chat'

interface Props {
  message: Message
}

const props = defineProps<Props>()

// Audio controls
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentWaveIndex = ref(0)
let waveInterval: ReturnType<typeof setInterval> | null = null

// Image controls
const showImageModal = ref(false)
const imageError = ref(false)

// Message type detection
const messageType = computed(() => {
  const content = props.message.content.toLowerCase()
  if (content.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/)) return 'audio'
  if (content.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/)) return 'image'
  if (content.startsWith('http')) return 'url'
  return 'text'
})

// User type detection
const isAgent = computed(() => props.message.user_id.includes('agent'))
const isBot = computed(() => props.message.user_id.includes('bot'))
const isUser = computed(() => props.message.user_id.includes('customer'))

const senderLabel = computed(() => {
  if (isAgent.value) return 'agente'
  if (isBot.value) return 'assistente'
  if (isUser.value) return 'usuário'
  return 'desconhecido'
})

const messageClasses = computed(() => {
  if (isAgent.value) return 'bg-green-600 text-white ml-auto'
  if (isUser.value) return 'bg-white text-gray-800 border border-gray-200'
  if (isBot.value) return 'bg-blue-600 text-white'
  return 'bg-gray-100 text-gray-800'
})

const timeClasses = computed(() => {
  if (isAgent.value) return 'text-green-100'
  if (isUser.value) return 'text-gray-500'
  if (isBot.value) return 'text-blue-100'
  return 'text-gray-500'
})

const audioButtonClasses = computed(() => {
  if (isAgent.value) return 'bg-green-500 hover:bg-green-400 text-white'
  if (isUser.value) return 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  if (isBot.value) return 'bg-blue-500 hover:bg-blue-400 text-white'
  return 'bg-gray-200 hover:bg-gray-300 text-gray-700'
})

const audioWaveClasses = computed(() => {
  if (isAgent.value) return 'text-green-200'
  if (isUser.value) return 'text-gray-400'
  if (isBot.value) return 'text-blue-200'
  return 'text-gray-400'
})

// Audio functions
const toggleAudio = () => {
  if (!audioRef.value) return
  
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
    if (waveInterval) {
      clearInterval(waveInterval)
      waveInterval = null
    }
  } else {
    audioRef.value.play()
    isPlaying.value = true
    // Animate wave visualization
    waveInterval = setInterval(() => {
      currentWaveIndex.value = (currentWaveIndex.value + 1) % 20
    }, 150)
  }
}

const onAudioLoaded = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
  isLoading.value = false
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

const onAudioEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  if (waveInterval) {
    clearInterval(waveInterval)
    waveInterval = null
  }
}

const formatTime = (time: number): string => {
  if (!time || !isFinite(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Cleanup
onUnmounted(() => {
  if (waveInterval) {
    clearInterval(waveInterval)
  }
})
</script>