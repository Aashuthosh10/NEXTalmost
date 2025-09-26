<template>
    <div class="ai-chat" role="region" aria-label="AI chat">
        <div class="messages" ref="list">
            <div v-if="messages.length===0" class="welcome">
                <div class="icon">🤖</div>
                <h3>AI Assistant</h3>
                <p>Ask anything about Nextcloud. I will answer instantly.</p>
            </div>
            <div v-for="(m,i) in messages" :key="i" class="row" :class="[ m.role==='user' ? 'self' : 'ai' ]">
                <div class="avatar">{{ m.role==='user' ? 'You' : 'AI' }}</div>
                <div class="bubble">
                    <div class="meta">
                        <span class="who">{{ m.role==='user' ? 'You' : 'AI Assistant' }}</span>
                        <span class="time">{{ formatTime(m.ts) }}</span>
                    </div>
                    <div class="text">{{ m.text }}</div>
                </div>
            </div>
            <div v-if="loading" class="loading">AI is thinking…</div>
            <div v-if="error" class="error">{{ error }}</div>
        </div>
        <div class="input">
            <input v-model="draft" @keyup.enter="send" :disabled="loading" :placeholder="placeholder" />
            <button class="send" :disabled="loading || !draft.trim()" @click="send">Send</button>
        </div>
    </div>
</template>
<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({ placeholder: { type: String, default: 'Ask AI anything…' } })

const list = ref(null)
const messages = ref([])
const draft = ref('')
const loading = ref(false)
const error = ref('')

const AI_FAQ = [
    { q: 'what is nextcloud', a: 'Nextcloud is a self-hosted platform for files and collaboration.' },
    { q: 'share a file', a: 'Open a file → sidebar → Share → add users or create a link.' },
    { q: 'talk', a: 'Use the Talk app for group chats, voice and video meetings.' },
    { q: 'dark mode', a: 'Settings → Appearance → choose Dark theme or follow system.' },
    { q: 'apps', a: 'Admins can enable apps from the Apps section to extend features.' },
    { q: 'what is earth', a: 'Earth is the third planet from the Sun, uniquely supporting life. It has land, oceans, atmosphere, and diverse ecosystems. Humans, animals, and plants coexist within complex environments. Earth’s rotation causes day and night, while its revolution around the Sun creates seasons. It sustains civilizations, cultures, and countless natural resources.' },
    { q: 'usain', a: 'Usain Bolt is a retired Jamaican sprinter, widely regarded as the fastest man in history. He holds world records in the 100m, 200m, and 4x100m relay. Bolt won eight Olympic gold medals and eleven World Championship titles, becoming a global icon for speed, athletic excellence, and charismatic personality.' }
]

const bestAnswer = (question) => {
    const q = (question || '').toLowerCase()
    let best = '', score = 0
    for (const item of AI_FAQ) {
        const hay = (item.q + ' ' + item.a).toLowerCase()
        let s = 0
        for (const token of q.split(/\W+/).filter(Boolean)) if (hay.includes(token)) s++
        if (s > score) { score = s; best = item.a }
    }
    return score ? best : 'I do not have an exact match. Try another Nextcloud question.'
}

const formatTime = (t) => new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const scroll = async () => { await nextTick(); if (list.value) list.value.scrollTop = list.value.scrollHeight }

const send = async () => {
    const q = draft.value.trim(); if (!q) return
    draft.value = ''
    messages.value.push({ role: 'user', text: q, ts: Math.floor(Date.now()/1000) })
    loading.value = true; error.value = ''
    await scroll()
    try {
        const a = bestAnswer(q)
        messages.value.push({ role: 'model', text: a, ts: Math.floor(Date.now()/1000) })
    } catch (e) {
        error.value = e?.message || 'AI error'
    } finally {
        loading.value = false
        scroll()
    }
}
</script>
<style scoped>
.ai-chat { display:flex; flex-direction:column; min-height:320px }
.messages { flex:1; overflow:auto; padding-right:6px }
.welcome { text-align:center; color: var(--color-text-maxcontrast); padding: 40px 20px }
.welcome .icon { font-size:48px; margin-bottom: 12px }
.row { display:flex; gap:8px; margin:8px 0; align-items:flex-end; width:100% }
.row.ai { flex-direction: row; justify-content:flex-start }
.row.self { flex-direction: row-reverse; justify-content:flex-end }
.avatar { width:28px; height:28px; border-radius:50%; background: var(--color-primary); color: var(--color-primary-text); display:flex; align-items:center; justify-content:center; font-weight:700 }
.bubble { background: var(--color-main-background, #1f1f1f); color: var(--color-main-text, #fff); border:1px solid var(--color-border, rgba(255,255,255,.12)); border-radius: var(--border-radius-large, 12px); padding:10px; max-width:280px; display:inline-block; min-width:120px; filter: drop-shadow(0 1px 3px var(--color-box-shadow, rgba(0,0,0,.3))); margin-top:-5px }
.row.ai .bubble { margin-right: auto }
.row.self .bubble { margin-left: auto }
.row.self .bubble { background: var(--color-primary); color: var(--color-primary-text); border-color: var(--color-primary) }
.meta { display:flex; justify-content:space-between; font-size:11px; opacity:.8; margin-bottom:4px }
.text { white-space: pre-wrap }
.loading { text-align:center; color: var(--color-text-maxcontrast); padding: 8px 0 }
.error { text-align:center; color: var(--color-error); padding: 8px 0 }
.input { display:flex; gap:8px; margin-top:10px }
.input input { flex:1; padding:10px; border-radius:10px; border:1px solid var(--color-border); background: var(--color-background-darker); color: var(--color-main-text) }
.send { padding:8px 12px; border-radius:10px; border:none; background: var(--color-primary); color: var(--color-primary-text); cursor:pointer }
</style>

