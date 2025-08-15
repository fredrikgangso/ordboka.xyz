<template>
  <div class="item" @click="$emit('open', word)">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div class="word">{{ word.word }}</div>
        <div class="small" v-if="word.ordklasse">{{ word.ordklasse }}</div>
      </div>
      <div class="small" style="opacity:0.6">Details</div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ word: { id: string; word: string; definition?: string; definitions?: string[]; ordklasse?: string } }>()
</script>
