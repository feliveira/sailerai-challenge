<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AppSidebar />
    <Toaster position="top-right" />

    
    <!-- Main Content Area -->
    <div 
      class="transition-all duration-300 ease-in-out min-h-screen"
      :class="[
        isOpen ? 'lg:ml-64' : 'lg:ml-16',
        'ml-0'
      ]"
    >
      <main class="flex-1">
        <div class="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
    
    <!-- Mobile Overlay -->
    <Transition
      name="fade"
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen && isMobile"
        @click="close"
        class="fixed inset-0 z-20 bg-black/50 lg:hidden"
        aria-hidden="true"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import AppSidebar from '~/components/dashboard/AppSidebar.vue'


const { isOpen, close } = useSidebar()
const route = useRoute()

const isMobile = ref(false)

const pageTitle = computed(() => {
  if (route.meta?.title) return route.meta.title
  
  // Generate title from route path
  const pathSegments = route.path.split('/').filter(Boolean)
  const lastSegment = pathSegments[pathSegments.length - 1]
  
  const titleMap: Record<string, string> = {
    'chats': 'Chats',
  }
  
  return lastSegment && titleMap[lastSegment] ? titleMap[lastSegment] : 'Dashboard'
})

// Mobile detection with proper cleanup
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
    
    // Auto-close sidebar on mobile when route changes
    if (isMobile.value && typeof window !== 'undefined') {
      close()
    }
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})

// Close mobile menu when route changes
watch(() => route.path, () => {
  if (isMobile.value) {
    close()
  }
})

// Set page title for SEO
useHead({
  title: () => `${pageTitle.value} - AiBot`,
  meta: [
    {
      name: 'description',
      content: 'Painel de controle do AiBot - Gerencie suas conversas e interações com leads de forma eficiente.'
    }
  ]
})
</script>

<style scoped>
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: #f1f5f9;
}

main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>