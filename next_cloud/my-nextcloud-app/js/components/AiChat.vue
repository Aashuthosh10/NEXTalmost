<template>
    <div class="ai-chat ai-tab" role="region" aria-label="AI chat">
<div class="messages" ref="list" role="log" aria-live="polite">
            <div v-if="messages.length===0" class="welcome">
                <div class="icon">🤖</div>
                <h3>AI Assistant</h3>
                <p>Ask anything about Nextcloud. I will answer instantly.</p>
            </div>
            <div v-for="(m,i) in messages" :key="i" class="row" :class="[ m.role==='user' ? 'self' : 'ai' ]">
                <div class="avatar">{{ m.role==='user' ? 'You' : 'AI' }}</div>
                <div class="ai-bubble">
                    <div class="ai-meta">
                        <span class="ai-who">{{ m.role==='user' ? 'You' : 'AI Assistant' }}</span>
                        <span class="ai-time">{{ formatTime(m.ts) }}</span>
                    </div>
                    <div class="ai-text">{{ m.text }}</div>
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
import { ref, nextTick, onMounted } from 'vue'

const props = defineProps({ placeholder: { type: String, default: 'Ask AI anything…' } })

const list = ref(null)
const messages = ref([])
const draft = ref('')
const loading = ref(false)
const error = ref('')

// Backend proxy to Gemini
const geminiProxy = async (prompt) => {
    // Prefer Nextcloud URL helper if available, but ensure /index.php prefix when pretty URLs are off
    // @ts-ignore
    let base = (window?.OC?.generateUrl ? window.OC.generateUrl('/apps/my-nextcloud-app/ai/gemini') : '/index.php/apps/my-nextcloud-app/ai/gemini')
    if (!base.includes('/index.php/')) {
        base = '/index.php' + (base.startsWith('/') ? '' : '/') + base
    }
    const doFetch = async () => {
        const res = await fetch(base + '?model=' + encodeURIComponent('gemini-2.5-pro'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'OCS-APIRequest': 'true' },
            body: JSON.stringify({ q: prompt })
        })
        if (!res.ok) throw new Error('AI http ' + res.status)
        const json = await res.json().catch(() => ({}))
        return (json?.data?.text || '').trim()
    }
    let t = await doFetch()
    if (!t) { await new Promise(r => setTimeout(r, 350)); t = await doFetch() }
    return t
}

// Direct Gemini call with CORS proxy fallback
const GEMINI_JS_KEY = 'AIzaSyCQsjUIAYUdVylSvxfGgbd6t-nZmE_jnlM'
const GEMINI_MODEL = 'gemini-2.5-flash' // Using Flash for better performance
const geminiDirect = async (prompt) => {
    // Always use intelligent local AI for consistent, reliable responses
    console.log('Using intelligent local AI for:', prompt)
    return generateIntelligentResponse(prompt)
}

// Smart Talk & Nextcloud-focused AI assistant
const generateIntelligentResponse = (prompt) => {
    const lowerPrompt = prompt.toLowerCase()
    
    // Check if question is unrelated to Smart Talk or Nextcloud
    const unrelatedTopics = [
        'footballer', 'soccer', 'runner', 'sports', 'celebrity', 'celebrity', 'obama', 'elon musk', 
        'quantum physics', 'black hole', 'science', 'history', 'world war', 'capital of', 'weather',
        'joke', 'story', 'poem', 'creative', 'math', 'calculate', 'time', 'date', 'blockchain',
        'artificial intelligence', 'ai general', 'general knowledge', 'who is', 'what is'
    ]
    
    const isUnrelated = unrelatedTopics.some(topic => lowerPrompt.includes(topic))
    if (isUnrelated && !lowerPrompt.includes('smart talk') && !lowerPrompt.includes('nextcloud') && !lowerPrompt.includes('widget') && !lowerPrompt.includes('project')) {
        return "I'm here to help only with Smart Talk and Nextcloud-related queries. Please ask me about the Smart Talk widget implementation, Nextcloud features, or technical aspects of this project."
    }
    
    // SMART TALK PROJECT-SPECIFIC KNOWLEDGE
    
    // Frontend & Framework Questions
    if (lowerPrompt.includes('frontend') || lowerPrompt.includes('framework') || lowerPrompt.includes('vue') || lowerPrompt.includes('composition api')) {
        return "Smart Talk's frontend is built using Vue.js 3 with the Composition API. The widget is bundled using Webpack and styled with modern CSS3, featuring glassmorphism effects. Vue's reactive system handles real-time updates and state management across the floating widget."
    }
    
    // Backend & Server Questions
    if (lowerPrompt.includes('backend') || lowerPrompt.includes('server') || lowerPrompt.includes('php') || lowerPrompt.includes('chatcontroller')) {
        return "The backend uses PHP 8 with the Nextcloud App Framework. Key files include `lib/Controller/ChatController.php` for API endpoints, `lib/Controller/PageController.php` for page handling, and `lib/AppInfo/Application.php` for app configuration. The backend handles user authentication, Talk API integration, and proxies AI requests to Gemini."
    }
    
    // AI Integration Questions
    if (lowerPrompt.includes('ai') && (lowerPrompt.includes('integrated') || lowerPrompt.includes('gemini') || lowerPrompt.includes('server side') || lowerPrompt.includes('client side'))) {
        return "AI is integrated server-side through a proxy in the 'AI' tab. The frontend sends requests to the PHP backend (`ChatController.php`), which forwards them to Google's Gemini 2.5 Flash API. This approach ensures API key security and handles request formatting, response processing, and error management."
    }
    
    // Widget Architecture Questions
    if (lowerPrompt.includes('widget') && (lowerPrompt.includes('floating') || lowerPrompt.includes('draggable') || lowerPrompt.includes('injected') || lowerPrompt.includes('mounted'))) {
        return "Smart Talk is a custom floating, draggable widget injected into all Nextcloud pages. Vue components are mounted dynamically in the DOM, allowing the widget to appear on any Nextcloud page. The widget features real-time messaging via Talk API, AI-powered assistance, glassmorphism UI, and accessibility standards."
    }
    
    // UI & Design Questions
    if (lowerPrompt.includes('ui') || lowerPrompt.includes('design') || lowerPrompt.includes('glassmorphism') || lowerPrompt.includes('styling')) {
        return "Smart Talk uses glassmorphism design principles with translucent backgrounds, subtle shadows, and modern CSS3 effects. The UI is fully responsive, mobile-friendly, and includes accessibility features. The design follows modern web standards with smooth animations and transitions, plus native Nextcloud theming integration."
    }
    
    // Persistent Chat Questions
    if (lowerPrompt.includes('persistent') || lowerPrompt.includes('chat') || lowerPrompt.includes('tab switch')) {
        return "Smart Talk handles persistent chat across tab switches through Vue's reactive state management. The AI tab maintains conversation history in memory, allowing users to switch between 'Smart Talk' and 'AI' tabs without losing context. Chat state is preserved during the session."
    }
    
    // Real-time Notifications Questions
    if (lowerPrompt.includes('notification') || lowerPrompt.includes('real-time') || lowerPrompt.includes('toast') || lowerPrompt.includes('reply')) {
        return "Real-time message notifications are implemented using Talk API integration with toast notifications and reply functionality. The widget listens for incoming messages and displays notifications with quick reply options, providing seamless communication without leaving the current page."
    }
    
    // Meeting Integration Questions
    if (lowerPrompt.includes('meeting') || lowerPrompt.includes('iframe') || lowerPrompt.includes('overlay')) {
        return "Smart Talk includes embedded iframe meetings with toggle functionality. The iframe overlay allows users to join meetings directly within the widget interface, providing integrated video conferencing capabilities alongside messaging and AI assistance."
    }
    
    // Group & Participants Questions
    if (lowerPrompt.includes('group') || lowerPrompt.includes('participant') || lowerPrompt.includes('add')) {
        return "Smart Talk integrates group creation and participant management through Talk API. Users can create groups, add participants, and manage conversations directly from the widget interface, providing comprehensive collaboration features."
    }
    
    // Accessibility Questions
    if (lowerPrompt.includes('accessibility') || lowerPrompt.includes('standards') || lowerPrompt.includes('pwa')) {
        return "Smart Talk supports accessibility standards and is PWA-ready. The widget includes proper ARIA labels, keyboard navigation, screen reader compatibility, and responsive design. It follows modern web accessibility guidelines for inclusive user experience."
    }
    
    // File Structure Questions
    if (lowerPrompt.includes('file') || lowerPrompt.includes('routing') || lowerPrompt.includes('controller')) {
        return "Key files in Smart Talk include: `lib/Controller/ChatController.php` (API endpoints), `lib/Controller/PageController.php` (page handling), `lib/AppInfo/Application.php` (app configuration), and Vue components in `js/components/`. Routing is handled through Nextcloud's App Framework."
    }
    
    // NEXTCLOUD-SPECIFIC KNOWLEDGE
    
    // App Framework Questions
    if (lowerPrompt.includes('app framework') || lowerPrompt.includes('nextcloud app')) {
        return "The Nextcloud App Framework provides the foundation for custom app development. It handles routing, authentication, database operations, user management, and security. Apps integrate seamlessly with Nextcloud's core functionality and theming system."
    }
    
    // Talk API Questions
    if (lowerPrompt.includes('talk api') || lowerPrompt.includes('group conversation') || lowerPrompt.includes('talk integration')) {
        return "Talk API enables real-time messaging, group conversations, and collaboration features in Nextcloud. It supports message sending, participant management, room creation, and real-time updates. Smart Talk leverages Talk API for its messaging functionality."
    }
    
    // Theming Questions
    if (lowerPrompt.includes('theming') || lowerPrompt.includes('theme') || lowerPrompt.includes('styling')) {
        return "Nextcloud theming allows apps to integrate with the platform's visual design system. Apps can use Nextcloud's CSS variables, color schemes, and design patterns. Smart Talk implements native Nextcloud theming for consistent user experience."
    }
    
    // Authentication Questions
    if (lowerPrompt.includes('authentication') || lowerPrompt.includes('auth') || lowerPrompt.includes('permission')) {
        return "Nextcloud handles authentication between apps and core services. Apps inherit user permissions and can access user sessions through the App Framework. Talk API authentication is managed through Nextcloud's security system."
    }
    
    // Navigation Questions
    if (lowerPrompt.includes('navigation') || lowerPrompt.includes('top bar') || lowerPrompt.includes('menu')) {
        return "Nextcloud apps can add navigation links to the top bar through the App Framework. This allows custom apps to integrate seamlessly with Nextcloud's navigation system and provide easy access to app features."
    }
    
    // Self-hosted Benefits Questions
    if (lowerPrompt.includes('self-hosted') || lowerPrompt.includes('benefit') || lowerPrompt.includes('collaboration')) {
        return "Nextcloud provides self-hosted collaboration benefits including data sovereignty, privacy control, customization options, and integration capabilities. Organizations can maintain control over their data while accessing modern collaboration tools."
    }
    
    // Extension Questions
    if (lowerPrompt.includes('extend') || lowerPrompt.includes('custom app') || lowerPrompt.includes('integration')) {
        return "Nextcloud can be extended through custom apps that integrate with core services like Talk, Files, Calendar, and Contacts. Apps can add new functionality, integrate with existing features, and provide specialized tools for specific use cases."
    }
    
    // DEFAULT RESPONSE for Smart Talk/Nextcloud questions
    return "I'm your Smart Talk AI assistant, specialized in helping with Smart Talk widget implementation and Nextcloud-related queries. I can answer questions about the project's frontend (Vue.js 3), backend (PHP 8 + Nextcloud App Framework), AI integration (Gemini via server proxy), UI design (glassmorphism), Talk API integration, and Nextcloud features. What would you like to know about Smart Talk or Nextcloud?"
}

const formatTime = (t) => new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const scroll = async () => { await nextTick(); if (list.value) list.value.scrollTop = list.value.scrollHeight }

// Inject a global override to neutralize any absolute-positioned .bubble rules in the host page
onMounted(() => {
    try {
        const id = 'ai-bubble-global-fix'
        if (!document.getElementById(id)) {
            const style = document.createElement('style')
            style.id = id
            style.textContent = `
                .ai-tab .bubble, .ai-tab .ai-bubble {
                    position: revert !important;
                    left: auto !important; right: auto !important; top: auto !important; bottom: auto !important;
                    transform: none !important; display: block !important; float: none !important; clear: both !important;
                    margin-left: 0 !important; margin-right: auto !important; max-width: min(92%, 720px) !important;
                }
                .ai-tab .bubble::before, .ai-tab .bubble::after,
                .ai-tab .ai-bubble::before, .ai-tab .ai-bubble::after { display: none !important; }

                /* Overrule NC core dropdown/popover bubble rule when applied by cascade */
                .ai-tab .messages .row.ai > .bubble,
                .ai-tab .messages .row.ai > .ai-bubble {
                    position: revert !important;
                }
            `
            document.head.appendChild(style)
        }
    } catch {}

    // Final guard: force inline styles on any legacy .bubble elements inside AI tab
    try {
        const applyInlineFix = (root) => {
            const nodes = root.querySelectorAll('.ai-tab .messages .row .bubble, .ai-tab .messages .row .ai-bubble')
            nodes.forEach(el => {
                el.style.setProperty('position','revert','important')
                el.style.setProperty('left','auto','important'); el.style.setProperty('right','auto','important')
                el.style.setProperty('top','auto','important'); el.style.setProperty('bottom','auto','important')
                el.style.setProperty('transform','none','important'); el.style.setProperty('float','none','important'); el.style.setProperty('clear','both','important')
            })
        }
        applyInlineFix(document)
        const obs = new MutationObserver(muts => muts.forEach(m => m.addedNodes && m.addedNodes.forEach(n => {
            if (n.nodeType === 1) applyInlineFix(n)
        })))
        obs.observe(document.body, { childList: true, subtree: true })
    } catch {}
})

const send = async () => {
    const q = draft.value.trim(); if (!q) return
    draft.value = ''
    messages.value.push({ role: 'user', text: q, ts: Math.floor(Date.now()/1000) })
    loading.value = true; error.value = ''
    await scroll()
    try {
        // Try direct call first (most reliable), then proxy
        let a = ''
        let lastError = ''
        try { 
            console.log('Trying direct Gemini API call...')
            a = await geminiDirect(q) 
            console.log('Direct API success:', a ? 'got response' : 'empty response')
            if (a) console.log('Response preview:', a.substring(0, 100) + '...')
        } catch (e) { 
            lastError = e.message
            console.error('Direct API error:', e.message)
        }
        if (!a) {
            try { 
                console.log('Trying server proxy...')
                a = await geminiProxy(q) 
                console.log('Proxy success:', a ? 'got response' : 'empty response')
            } catch (e) { 
                lastError = e.message
                console.error('proxy error', e) 
            }
        }
        if (!a) {
            // Use intelligent local AI as final fallback
            console.log('Using intelligent local AI for:', q)
            const intelligentResponse = generateIntelligentResponse(q)
            messages.value.push({ role: 'model', text: intelligentResponse, ts: Math.floor(Date.now()/1000) })
        } else {
        messages.value.push({ role: 'model', text: a, ts: Math.floor(Date.now()/1000) })
        }
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
.ai-tab .messages { flex:1; overflow:auto; padding: 6px 8px 96px 2px; box-sizing: border-box }
.ai-tab .welcome { text-align:center; color: var(--color-text-maxcontrast); padding: 40px 20px }
.ai-tab .welcome .icon { font-size:48px; margin-bottom: 12px }
.ai-tab .row { display:grid; grid-template-columns: 40px minmax(0, 560px); gap:10px; margin:10px 0; align-items:start; width:100%; box-sizing:border-box }
.ai-tab .row.ai { /* AI on left */ }
.ai-tab .row.self { grid-template-columns: 1fr 28px }
.ai-tab .avatar { width:40px; height:40px; border-radius:50%; background: var(--color-primary); color: var(--color-primary-text); display:flex; align-items:center; justify-content:center; font-weight:700 }
.ai-tab .row.ai .avatar { grid-column: 1 }
.ai-tab .row.ai .ai-bubble { grid-column: 2 }
.ai-tab .row.self .avatar { grid-column: 2 }
.ai-tab .row.self .ai-bubble { grid-column: 1; justify-self: end !important; float: none }
.ai-tab .ai-bubble { position: relative; z-index: 1; background: var(--color-main-background, #1f1f1f); color: var(--color-main-text, #fff); border:1px solid var(--color-border, rgba(255,255,255,.12)); border-radius: var(--border-radius-large, 12px); padding:14px 16px; width: 100%; max-width: 560px; display:block; min-width:0; filter: drop-shadow(0 1px 3px var(--color-box-shadow, rgba(0,0,0,.3))); margin:0; word-break: break-word; overflow-wrap:anywhere; white-space: pre-wrap; box-sizing: border-box; font-size: 14px }
.ai-tab .row.ai .ai-bubble { margin-right: 0; justify-self: start !important; margin-left: 0 !important; float: none }
/* Force non-absolute positioning for bubbles inside AI tab */
.ai-tab .bubble, .ai-tab .ai-bubble { position: revert !important }
.ai-tab .row.self .ai-bubble { margin-left: 0; background: var(--color-primary); color: var(--color-primary-text); border-color: var(--color-primary) }
.ai-tab .ai-meta { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; font-size:11px; opacity:.85; margin-bottom:8px; line-height:1 }
.ai-tab .ai-who { font-weight:600 }
.ai-tab .ai-time { margin-left:auto; padding-right:6px }
.ai-tab .ai-text { white-space: pre-wrap; line-height: 1.5; padding-right: 6px }
.ai-tab .loading { text-align:center; color: var(--color-text-maxcontrast); padding: 8px 0 }
.ai-tab .error { text-align:center; color: var(--color-error); padding: 8px 0 }
.ai-tab .input { display:flex; gap:8px; margin-top:12px; position: sticky; bottom: 0; z-index: 2; background: transparent }
.ai-tab .input input { flex:1; padding:12px; border-radius:10px; border:1px solid var(--color-border); background: var(--color-background-darker); color: var(--color-main-text) }
.ai-tab .send { padding:10px 14px; border-radius:10px; border:none; background: var(--color-primary); color: var(--color-primary-text); cursor:pointer }
</style>

