<template>
  <div>
    <div class="search">
      <input class="input" style="color: azure;" v-model="query" placeholder="Search words or definitions" />
    </div>

    <div class="list">
      <div v-for="(w, i) in results" :key="w.id">
        <WordItem :word="w" @open="open" />
        <div class="divider" v-if="i < results.length - 1"></div>
      </div>
    </div>

    <WordModal v-if="selected" :word="selected" @close="selected = null" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '~/composables/useWords'
import WordItem from '~/components/WordItem.vue'
import WordModal from '~/components/WordModal.vue'
import { onMounted, onBeforeUnmount } from 'vue'

const { results, query } = useWords()
const selected = ref<null | any>(null)

function open(w: any) {
  selected.value = w
}

// use a named handler so removeEventListener can remove it -- but prefer
// parent-local events. We'll listen for Escape via a handler that sets selected to null.
function onKeyClose(e: KeyboardEvent) {
  if (e.key === 'Escape') selected.value = null
}

onMounted(() => {
  // only attach global handler on client
  window.addEventListener('keydown', onKeyClose)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyClose)
})
</script>

<style scoped>
.list {
  display: block;
}

.divider {
  height: 1px;
  background: var(--card-border, #e6e6e6);
  border-radius: 1px;
}
</style>
