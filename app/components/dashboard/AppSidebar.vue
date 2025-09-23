<template>
  <div>
    <!-- Mobile Layout -->
    <template v-if="isMobile">
      <!-- Mobile Top Navbar -->
      <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 text-white shadow-lg mb-16">
        <div class="flex h-full items-center justify-between px-4">
          <!-- Brand with Logo -->
          <div class="flex items-center space-x-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Bot class="h-5 w-5" />
            </div>
            <h1 class="text-lg font-semibold">{{ brandName }}</h1>
          </div>
          
          <!-- Menu Toggle Button -->
          <button
            @click="toggle"
            class="relative z-50 rounded-lg p-2 text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'text-white bg-slate-800': isOpen }"
          >
            <div class="relative flex items-center justify-center h-6 w-6">
              <!-- Hamburger Menu Icon -->
              <span 
                class="absolute block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out"
                :class="isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'"
              ></span>
              <span 
                class="absolute block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out"
                :class="isOpen ? 'opacity-0' : ''"
              ></span>
              <span 
                class="absolute block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out"
                :class="isOpen ? '-rotate-45' : 'translate-y-1.5'"
              ></span>
            </div>
          </button>
        </div>
      </header>

      <!-- Mobile Backdrop Overlay -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        leave-active-class="transition-opacity duration-200 ease-in"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          @click="toggle"
          class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      </Transition>

      <!-- Mobile Sliding Menu Panel -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        leave-active-class="transition-transform duration-200 ease-in"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="isOpen"
          class="fixed top-16 right-0 bottom-0 z-50 w-80 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 text-white shadow-2xl"
        >
          <!-- Mobile Navigation -->
          <nav class="flex-1 overflow-y-auto p-4">
            <ul class="space-y-2">
              <li v-for="item in menuItems" :key="item.path">
                <NuxtLink
                  :to="item.path"
                  @click="toggle"
                  class="group flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 relative overflow-hidden"
                  :class="isActiveRoute(item.path) 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95'"
                >
                  <div 
                    v-if="!isActiveRoute(item.path)"
                    class="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  ></div>
                  
                  <!-- Icon -->
                  <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200"
                       :class="isActiveRoute(item.path) ? 'bg-white/20' : 'group-hover:bg-slate-700'">
                    <component
                      :is="item.icon"
                      class="h-5 w-5 transition-colors duration-200"
                    />
                  </div>
                  
                  <!-- Label -->
                  <span class="relative z-10 font-medium">{{ item.label }}</span>
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </aside>
      </Transition>

      <div class="pt-16" />
    </template>

    <template v-else>
      <aside
        class="fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white shadow-xl transition-all duration-300 ease-in-out border-r border-slate-700"
        :class="[ isOpen ? 'w-64' : 'w-16' ]"
      >
        <!-- Header with toggle button -->
        <div class="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <div class="flex items-center space-x-3 overflow-hidden">
            <!-- Logo -->
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Bot class="h-5 w-5" />
            </div>
            <!-- Brand name with fade animation -->
            <Transition
              name="fade-slide"
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="opacity-0 translate-x-4"
              enter-to-class="opacity-100 translate-x-0"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 translate-x-4"
            >
              <h1 v-if="isOpen" class="text-lg font-semibold">
                {{ brandName }}
              </h1>
            </Transition>
          </div>
          
          <!-- Toggle button -->
          <button
            @click="toggle"
            class="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white"
            :class="{ 'rotate-180': !isOpen }"
          >
            <ChevronLeft class="h-5 w-5 transition-transform duration-300" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-3 py-4">
          <ul class="space-y-1">
            <li v-for="item in menuItems" :key="item.path">
              <NuxtLink
                :to="item.path"
                class="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative"
                :class="isActiveRoute(item.path) ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
              >
                <!-- Icon -->
                <component
                  :is="item.icon"
                  class="h-5 w-5 flex-shrink-0 transition-colors duration-200"
                  :class="{ 'mr-3': isOpen }"
                />
                
                <!-- Label with slide animation -->
                <Transition
                  name="fade-slide"
                  enter-active-class="transition-all duration-300 ease-out delay-75"
                  leave-active-class="transition-all duration-200 ease-in"
                  enter-from-class="opacity-0 translate-x-4"
                  enter-to-class="opacity-100 translate-x-0"
                  leave-from-class="opacity-100 translate-x-0"
                  leave-to-class="opacity-0 translate-x-4"
                >
                  <span v-if="isOpen" class="truncate">
                    {{ item.label }}
                  </span>
                </Transition>

                <!-- Tooltip for collapsed state -->
                <div
                  v-if="!isOpen"
                  class="absolute left-full ml-2 hidden rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block whitespace-nowrap"
                  style="z-index: 1000"
                >
                  {{ item.label }}
                  <div class="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                </div>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Bot, ChevronLeft, MessageCircle } from 'lucide-vue-next'
import { useSidebar } from '~/composables/useSidebar'
import { useRoute } from 'vue-router'

interface MenuItem {
  path: string
  label: string
  icon: any
}

interface Props {
  brandName?: string
  menuItems?: MenuItem[]
  showStats?: boolean
}

withDefaults(defineProps<Props>(), {
  brandName: 'AiBot',
  showStats: true,
  menuItems: () => [
    { path: '/dashboard/chats', label: 'Chats', icon: MessageCircle },
  ]
})

const { isOpen, toggle } = useSidebar()
const route = useRoute()

// Mobile detection
const isMobile = ref(false)

const isActiveRoute = (path: string): boolean => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})
</script>