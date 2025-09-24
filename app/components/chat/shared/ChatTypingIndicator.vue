<template>
  <div 
    class="flex"
    role="status"
    aria-label="Digitando mensagem"
  >
    <div class="bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
      <div class="flex space-x-1" aria-hidden="true">
        <div 
          class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          v-for="( _, index) in 3"
          :key="index"
          :style="{ animationDelay: `${index * 0.1}s` }"
        ></div>
      </div>
      <span class="sr-only">Digitando...</span>
    </div>
  </div>
</template>