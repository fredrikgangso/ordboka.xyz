<template>
    <client-only>
        <teleport to="body">
            <div class="modal-backdrop" @click.self="$emit('close')">
                <div class="modal-card" role="dialog" aria-modal="true">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div>
                            <div class="word">{{ word.word }}</div>
                            <div class="small" v-if="word.ordklasse">{{ word.ordklasse }}</div>
                        </div>
                        <button @click="$emit('close')">Close</button>
                    </div>
                    <div class="meta" style="margin-top:12px" v-if="word.tilleggsinformasjon">{{
                        word.tilleggsinformasjon }}
                    </div>
                    <div style="margin-top:12px">
                        <div v-for="(d, i) in (word.definitions || [word.definition])" :key="i" style="margin-top:8px">
                            {{ d
                            }}</div>
                    </div>
                </div>
            </div>
        </teleport>
    </client-only>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, defineEmits } from 'vue'
defineProps<{ word: any }>()
const emit = defineEmits<{
    (e: 'close'): void
}>()

// Save previous body styles so we can restore them when modal closes
let prevBodyOverflow: string | null = null
let prevBodyPosition: string | null = null
let prevBodyTop: string | null = null
let prevBodyWidth: string | null = null
let scrollY = 0

function lockBodyScroll() {
    // only access window/document on client inside lifecycle hooks
    scrollY = window.scrollY || window.pageYOffset || 0
    prevBodyOverflow = document.body.style.overflow
    prevBodyPosition = document.body.style.position
    prevBodyTop = document.body.style.top
    prevBodyWidth = document.body.style.width

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
}

function unlockBodyScroll() {
    // restore previous inline styles
    document.body.style.overflow = prevBodyOverflow ?? ''
    document.body.style.position = prevBodyPosition ?? ''
    document.body.style.top = prevBodyTop ?? ''
    document.body.style.width = prevBodyWidth ?? ''

    // restore scroll position
    window.scrollTo(0, scrollY)
}

const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        // emit close event to parent
        emit('close')
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKey)
    lockBodyScroll()
})
onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey)
    unlockBodyScroll()
})
</script>
