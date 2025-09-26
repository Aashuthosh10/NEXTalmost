<template>
    <div v-if="!closed" class="chat-widget">
		<div class="header">
			<div class="title">
				<div class="header-icon">🤖</div>
				<div class="header-text">
					<h2>Smart Talk</h2>
					<p>{{ activeTab === 'ai' ? 'AI Assistant Ready' : 'Conversations' }}</p>
				</div>
			</div>
			<div class="header-controls">
                <button class="icon-btn" @click="minimizeWidget">−</button>
				<button class="icon-btn" @click="closeWidget">×</button>
			</div>
		</div>

		<div v-if="!minimized">
        <div class="tabs">
            <button :class="['tab', activeTab==='talk' && 'active']" @click="activeTab='talk'">💬 Talk</button>
            <button :class="['tab', activeTab==='ai' && 'active']" @click="switchToAI">🤖 AI</button>
		</div>

        <!-- AI Status Bar -->
        <div v-if="activeTab === 'ai'" class="ai-status-bar" :class="{ connected: geminiConnected, error: geminiError }">
            <div class="status-indicator">
                <span class="status-dot" :class="{ online: geminiConnected, error: geminiError }"></span>
                <span>{{ geminiConnected ? 'Gemini AI Ready' : geminiError ? 'Connection Error' : 'Connecting...' }}</span>
            </div>
            <div class="ai-controls">
                <button class="btn-small" @click="clearAiChat">Clear</button>
                <button class="btn-small" @click="testGeminiConnection">Test</button>
            </div>
        </div>

		<!-- Talk Messages -->
        <div v-if="activeTab==='talk'" class="messages-area">
			<div class="empty-hint">Talk functionality - simplified for demo</div>
		</div>

		<!-- AI Messages -->
        <div v-if="activeTab==='ai'" class="messages-area ai-area" ref="aiContainer">
            <div v-if="aiMessages.length === 0 && !aiLoading" class="ai-welcome">
                <div class="welcome-icon">🤖</div>
                <h3>Welcome to Gemini AI!</h3>
                <p>Your intelligent assistant for Nextcloud, coding, and more!</p>
                <div class="ai-suggestions">
                    <button class="suggestion-btn" @click="askAI('How do I use Nextcloud Talk?')">💬 Nextcloud Help</button>
                    <button class="suggestion-btn" @click="askAI('Write a JavaScript function')">💻 Code Help</button>
                    <button class="suggestion-btn" @click="askAI('Help me write an email')">✍️ Writing Help</button>
                </div>
            </div>
            
            <div v-for="(m,i) in aiMessages" :key="i" class="message-row" :class="{ self: m.role==='user' }">
                <div class="avatar" :class="{ 'ai-avatar': m.role==='model' }">
                    {{ m.role==='user' ? 'Y' : '🤖' }}
                </div>
                <div class="bubble" :class="{ 'ai-bubble': m.role==='model' }">
                    <div class="meta">
                        <span>{{ m.role==='user' ? 'You' : 'Gemini AI' }}</span>
                        <span class="time">{{ formatTime(m.timestamp) }}</span>
                        <span v-if="m.role==='model'" class="ai-badge">AI</span>
                    </div>
                    <div class="message-text" v-html="renderMarkdown(m.text)"></div>
                </div>
            </div>
            
            <div v-if="aiLoading" class="typing-indicator">
                <div class="avatar ai-avatar">🤖</div>
                <div class="bubble ai-bubble">
                    <div class="typing-dots"><span></span><span></span><span></span></div>
                    <div>Gemini is thinking...</div>
                </div>
            </div>
            
            <div v-if="aiError" class="error-message">
                <strong>⚠️ Error:</strong> {{ aiError }}
                <button class="btn retry-btn" @click="retryAI">Retry</button>
            </div>
		</div>

		<!-- Talk Input -->
		<div v-if="activeTab==='talk'" class="message-input-area">
			<input v-model="newMessage" class="message-input" placeholder="Type message..." />
			<button class="send-button" @click="sendMessage">Send</button>
		</div>

		<!-- AI Input -->
		<div v-if="activeTab==='ai'" class="message-input-area ai-input-area">
            <textarea 
                v-model="aiInput" 
                @keydown="handleAiKeydown"
                class="message-input ai-input" 
                placeholder="Ask Gemini AI anything..."
                rows="1"
            ></textarea>
            <button class="send-button ai-send" :disabled="aiLoading || !aiInput.trim()" @click="sendAI">
                {{ aiLoading ? '⏳' : '🚀' }} Send
            </button>
		</div>
	</div>
	</div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const activeTab = ref('ai')
const minimized = ref(false)
const closed = ref(false)
const newMessage = ref('')

// AI State
const aiMessages = ref([])
const aiInput = ref('')
const aiLoading = ref(false)
const aiError = ref('')
const geminiConnected = ref(false)
const geminiError = ref(false)
const aiContainer = ref(null)

// Your Gemini API Key
const GEMINI_API_KEY = 'AIzaSyCK1OPSmlb3rxBd_d7a0B3WK43RaksoxUE'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

// Switch to AI and test connection
const switchToAI = () => {
    activeTab.value = 'ai'
    if (!geminiConnected.value && !geminiError.value) {
        testGeminiConnection()
    }
}

// Test Gemini API Connection
const testGeminiConnection = async () => {
    try {
        geminiError.value = false
        aiLoading.value = true
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello! Please confirm Gemini AI is connected to Smart Talk.' }] }]
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error?.message || `API Error: ${response.status}`)
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Connected!'
        
        geminiConnected.value = true
        showToast('✅ Gemini AI connected!')
        
        aiMessages.value.push({
            role: 'model',
            text: `🎉 ${text}\n\nI'm ready to help you with anything! Ask me about Nextcloud, coding, writing, or general questions.`,
            timestamp: Math.floor(Date.now() / 1000)
        })
        
    } catch (error) {
        geminiError.value = true
        geminiConnected.value = false
        aiError.value = `Connection failed: ${error.message}`
        showToast('❌ Gemini connection failed')
    } finally {
        aiLoading.value = false
        scrollAI()
    }
}

// Send message to Gemini AI
const sendAI = async () => {
    const prompt = aiInput.value.trim()
    if (!prompt || aiLoading.value) return

    if (!geminiConnected.value) {
        await testGeminiConnection()
        if (!geminiConnected.value) return
    }

    // Add user message
    aiMessages.value.push({
        role: 'user',
        text: prompt,
        timestamp: Math.floor(Date.now() / 1000)
    })
    
    aiInput.value = ''
    aiLoading.value = true
    aiError.value = ''
    scrollAI()

    try {
        // Enhanced context for Smart Talk
        const contextPrompt = `Context: You are Gemini AI integrated into Nextcloud Smart Talk. Help with Nextcloud questions, coding, writing, and general assistance. Use markdown formatting for better readability.

User: ${prompt}`

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: contextPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error?.message || `API Error: ${response.status}`)
        }

        const data = await response.json()
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
        
        if (!aiResponse) {
            throw new Error('No response generated')
        }

        aiMessages.value.push({
            role: 'model',
            text: aiResponse,
            timestamp: Math.floor(Date.now() / 1000)
        })
        
        geminiConnected.value = true
        
    } catch (error) {
        aiError.value = error.message
        aiMessages.value.push({
            role: 'model',
            text: `❌ Error: ${error.message}. Please try again.`,
            timestamp: Math.floor(Date.now() / 1000)
        })
    } finally {
        aiLoading.value = false
        scrollAI()
    }
}

// Helper functions
const askAI = (question) => {
    aiInput.value = question
    sendAI()
}

const clearAiChat = () => {
    aiMessages.value = []
    aiError.value = ''
    showToast('🗑️ AI chat cleared')
}

const retryAI = () => {
    if (aiMessages.value.length > 0) {
        const lastUser = [...aiMessages.value].reverse().find(m => m.role === 'user')
        if (lastUser) {
            aiInput.value = lastUser.text
            sendAI()
        }
    }
}

const handleAiKeydown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendAI()
    }
}

const renderMarkdown = (text) => {
    if (!text) return ''
    
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 style="margin: 8px 0; font-size: 1.1em; font-weight: 600;">$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2 style="margin: 8px 0; font-size: 1.2em; font-weight: 600;">$1</h2>')
    
    // Bold/italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Code
    html = html.replace(/```[\s\S]*?```/g, '<pre style="background: #f4f4f4; padding: 8px; border-radius: 4px; margin: 8px 0; overflow-x: auto; font-family: monospace;">$&</pre>')
    html = html.replace(/`([^`]+)`/g, '<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
    
    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
    html = html.replace(/(<li[^>]*>.*<\/li>)/s, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>')
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p style="margin: 8px 0;">')
    html = html.replace(/\n/g, '<br>')
    
    if (!html.includes('<h') && !html.includes('<ul') && !html.includes('<pre')) {
        html = '<p style="margin: 8px 0;">' + html + '</p>'
    }
    
    return html
}

const scrollAI = () => {
    nextTick(() => {
        if (aiContainer.value) {
            aiContainer.value.scrollTop = aiContainer.value.scrollHeight
        }
    })
}

const sendMessage = () => { 
    showToast('Talk message sent (demo)')
    newMessage.value = ''
}

const showToast = (text) => {
    let el = document.getElementById('smart-talk-toast')
    if (!el) {
        el = document.createElement('div')
        el.id = 'smart-talk-toast'
        Object.assign(el.style, { 
            position: 'fixed', right: '20px', bottom: '20px', 
            background: '#111', color: '#fff', padding: '10px 14px', 
            borderRadius: '10px', zIndex: '10000', 
            boxShadow: '0 8px 24px rgba(0,0,0,.2)' 
        })
        document.body.appendChild(el)
    }
    el.textContent = text
    el.style.opacity = '0.95'
    setTimeout(() => { el.style.opacity = '0' }, 4000)
}

const minimizeWidget = () => { minimized.value = !minimized.value }
const closeWidget = () => { closed.value = true }

const formatTime = (ts) => {
    const d = new Date(ts * 1000)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
    if (activeTab.value === 'ai') {
        setTimeout(testGeminiConnection, 1000)
    }
})
</script>

<style scoped>
.chat-widget { 
    width: 380px; min-height: 420px; border-radius: 16px; padding: 14px; 
    background: #fff; color: #333; border: 1px solid #e1e5e9; 
    box-shadow: 0 8px 24px rgba(0,0,0,.15); 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.title { display: flex; align-items: center; gap: 10px; }
.header-text h2 { margin: 0; font-size: 18px; }
.header-text p { margin: 0; color: #666; font-size: 12px; }
.header-controls { display: flex; gap: 8px; }
.icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer; }
.tabs { display: flex; gap: 4px; margin-bottom: 8px; }
.tab { flex: 1; padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 8px; cursor: pointer; }
.tab.active { background: #667eea; color: white; border-color: #667eea; }
.ai-status-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; }
.ai-status-bar.connected { background: #d4edda; color: #155724; }
.ai-status-bar.error { background: #f8d7da; color: #721c24; }
.status-indicator { display: flex; align-items: center; gap: 8px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffc107; }
.status-dot.online { background: #28a745; }
.status-dot.error { background: #dc3545; }
.ai-controls { display: flex; gap: 4px; }
.btn-small { padding: 4px 8px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 12px; }
.messages-area { height: 300px; overflow-y: auto; padding: 8px; margin-bottom: 8px; border: 1px solid #e1e5e9; border-radius: 8px; }
.empty-hint { text-align: center; color: #666; padding: 50px 20px; }
.ai-welcome { text-align: center; padding: 20px; }
.welcome-icon { font-size: 48px; margin-bottom: 16px; }
.ai-welcome h3 { margin: 0 0 8px 0; color: #333; }
.ai-welcome p { margin: 0 0 16px 0; color: #666; }
.ai-suggestions { display: flex; flex-direction: column; gap: 8px; }
.suggestion-btn { padding: 8px 12px; border: 1px solid #667eea; background: #f8f9ff; color: #667eea; border-radius: 6px; cursor: pointer; font-size: 14px; }
.suggestion-btn:hover { background: #667eea; color: white; }
.message-row { display: flex; gap: 8px; margin: 8px 0; align-items: flex-end; }
.message-row.self { flex-direction: row-reverse; }
.avatar { width: 28px; height: 28px; border-radius: 50%; background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }
.avatar.ai-avatar { background: #28a745; }
.bubble { background: #f1f3f4; border-radius: 12px; padding: 8px 12px; max-width: 250px; }
.bubble.ai-bubble { background: #e8f5e8; border: 1px solid #28a745; }
.message-row.self .bubble { background: #667eea; color: white; }
.meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; opacity: 0.8; margin-bottom: 4px; }
.ai-badge { background: #28a745; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; }
.message-text { font-size: 14px; line-height: 1.4; }
.typing-indicator { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
.typing-dots { display: flex; gap: 4px; }
.typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: #667eea; animation: bounce 1.4s infinite ease-in-out both; }
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
.error-message { background: #f8d7da; color: #721c24; padding: 8px 12px; border-radius: 6px; margin: 8px 0; }
.retry-btn { background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 8px; }
.message-input-area { display: flex; gap: 8px; align-items: end; }
.message-input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; resize: none; font-family: inherit; }
.ai-input { min-height: 36px; max-height: 100px; }
.send-button { padding: 8px 12px; border: none; background: #667eea; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
.send-button:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-send { background: #28a745; }
</style>