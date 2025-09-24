<template>
  <div 
    class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
    :aria-label="`${count} mensagens não lidas`"
    role="status"
  >
    {{ displayCount }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  count: number
}

const props = defineProps<Props>()

const displayCount = computed(() => {
  return props.count > 99 ? '99+' : props.count.toString()
})
</script>