<template>
    <div v-if="isLoading" class="flex items-center space-x-2 p-4">
        <Loader2 class="animate-spin w-6 h-6 text-gray-400" />
        <span class="text-sm text-gray-500">Loading Chats...</span>
    </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

defineProps<{
    isLoading: boolean;
}>();
</script>
