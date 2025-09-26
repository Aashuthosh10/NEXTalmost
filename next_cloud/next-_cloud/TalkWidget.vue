<template>
  <div class="smart-talk-widget" :class="{ 'enlarged': isEnlargedView }">
    <!-- 🌟 Enhanced Header with Meeting Controls -->
    <div class="widget-header">
      <div class="header-left">
        <div class="header-icon">🎯</div>
        <div class="header-text">
          <h2>Smart Talk</h2>
          <p>{{ selectedRoomName || 'Chat & Meetings Ready' }}</p>
        </div>
      </div>
      <div class="header-right">
        <div v-if="isLoading" class="loading-spinner">⏳</div>
        <button @click="toggleEnlargedView" class="enlarge-btn" title="Toggle Enlarged View">
          {{ isEnlargedView ? '🔲' : '🔍' }}
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
      <button 
        @click="activeTab = 'chat'" 
        :class="{ active: activeTab === 'chat' }"
        class="tab-btn"
      >
        💬 Chat
      </button>
      <button 
        @click="activeTab = 'meeting'" 
        :class="{ active: activeTab === 'meeting' }"
        class="tab-btn"
      >
        🎥 Meeting
      </button>
      <button 
        @click="activeTab = 'ai'" 
        :class="{ active: activeTab === 'ai' }"
        class="tab-btn"
      >
        🤖 Gemini AI
      </button>
    </div>

    <!-- Chat Tab Content -->
    <div v-show="activeTab === 'chat'" class="tab-content">
      <!-- 🚨 Error Message - Big and Clear -->
      <div v-if="error" class="error-box">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error }}</div>
      </div>

      <!-- 📱 Messages Area - Like a Phone -->
      <div class="messages-area" ref="messagesContainer">
      <!-- Empty State - Super Friendly -->
      <div v-if="messages.length === 0 && !isLoading" class="empty-state">
        <div class="empty-icon">👋</div>
        <h3>Hello! 👋</h3>
        <p>No messages yet.<br>Be the first to say something! 😊</p>
      </div>
      
      <!-- Messages - Like Text Messages -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-wrapper"
      >
        <!-- Message Bubble -->
        <div class="message-bubble">
          <div class="message-header">
            <div class="user-avatar">{{ getInitials(message.actorDisplayName) }}</div>
            <div class="user-info">
              <div class="user-name">{{ message.actorDisplayName }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          <div class="message-text">{{ message.message }}</div>
          
          <!-- Reaction Button - Big and Obvious -->
          <button
            @click="toggleReaction(message.id)"
            class="reaction-btn"
            :title="'Tap to react 😊'"
          >
            <span class="reaction-icon">😊</span>
            <span class="reaction-text">React</span>
          </button>
        </div>

        <!-- Reactions Display - Visual and Clear -->
        <div v-if="message.reactions && message.reactions.length > 0" class="reactions-display">
          <div
            v-for="reaction in message.reactions"
            :key="`${reaction.emoji}-${reaction.actorId}`"
            class="reaction-badge"
          >
            <span class="reaction-emoji">{{ reaction.emoji }}</span>
            <span class="reaction-count">{{ reaction.count }}</span>
          </div>
        </div>
      </div>
    </div>

      <!-- ✍️ Message Input - Like a Phone Keyboard -->
      <div class="message-input-area">
        <div class="input-wrapper">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type your message here... ✍️"
            class="message-input"
            :disabled="isLoading"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || isLoading"
            class="send-button"
            :class="{ 'disabled': !newMessage.trim() || isLoading }"
          >
            <span class="send-icon">📤</span>
            <span class="send-text">Send</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Meeting Tab Content -->
    <div v-show="activeTab === 'meeting'" class="tab-content">
      <div v-if="!isMeetingActive" class="meeting-setup">
        <div class="meeting-header">
          <h3>📹 Start Meeting</h3>
          <p class="meeting-subtitle">Select members and configure your meeting</p>
        </div>
        
        <!-- Member Selection -->
        <div class="member-selection">
          <h4>👥 Select Members to Invite</h4>
          <div class="members-grid">
            <label v-for="member in availableMembers" :key="member.id" class="member-item">
              <input 
                type="checkbox" 
                :value="member.id" 
                v-model="selectedMembers"
                class="member-checkbox"
              >
              <div class="member-card">
                <div class="member-avatar">{{ member.name.charAt(0) }}</div>
                <span class="member-name">{{ member.name }}</span>
                <div class="member-status" :class="member.status">{{ member.status }}</div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- Meeting Options -->
        <div class="meeting-options">
          <h4>⚙️ Meeting Settings</h4>
          <div class="options-grid">
            <label class="option-item">
              <input type="checkbox" v-model="meetingSettings.video" class="option-checkbox">
              <span class="option-label">📹 Enable Video</span>
            </label>
            <label class="option-item">
              <input type="checkbox" v-model="meetingSettings.audio" class="option-checkbox">
              <span class="option-label">🎤 Enable Audio</span>
            </label>
            <label class="option-item">
              <input type="checkbox" v-model="meetingSettings.screenShare" class="option-checkbox">
              <span class="option-label">🖥️ Screen Share</span>
            </label>
            <label class="option-item">
              <input type="checkbox" v-model="meetingSettings.enlargeOnStart" class="option-checkbox">
              <span class="option-label">🔍 Enlarge on Start</span>
            </label>
          </div>
        </div>
        
        <!-- Start Meeting Button -->
        <div class="meeting-actions">
          <button 
            @click="startMeeting" 
            :disabled="selectedMembers.length === 0"
            class="start-meeting-btn"
            :class="{ disabled: selectedMembers.length === 0 }"
          >
            🚀 Start Meeting ({{ selectedMembers.length }} members)
          </button>
        </div>
      </div>
      
      <!-- Active Meeting Interface -->
      <div v-else class="meeting-interface">
        <div class="meeting-header-active">
          <h3>📹 Meeting in Progress</h3>
          <div class="meeting-participants">{{ activeMeetingMembers.length }} participants</div>
        </div>
        
        <div class="video-grid">
          <div class="main-video">
            <div class="video-placeholder">
              📹 Your Video
            </div>
            <div class="video-controls">
              <span class="video-label">You</span>
            </div>
          </div>
          
          <div class="participants-grid">
            <div 
              v-for="member in activeMeetingMembers" 
              :key="member.id"
              class="participant-video"
            >
              <div class="video-placeholder participant">
                <div class="participant-avatar">{{ member.name.charAt(0) }}</div>
              </div>
              <div class="video-controls">
                <span class="video-label">{{ member.name }}</span>
                <div class="participant-status">
                  <span v-if="member.video">📹</span>
                  <span v-if="member.audio">🎤</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="meeting-bottom-controls">
          <button @click="toggleMute" class="control-btn" :class="{ active: !meetingState.muted }">
            {{ meetingState.muted ? '🔇' : '🎤' }}
          </button>
          <button @click="toggleVideo" class="control-btn" :class="{ active: meetingState.video }">
            {{ meetingState.video ? '📹' : '📷' }}
          </button>
          <button @click="toggleScreenShare" class="control-btn" :class="{ active: meetingState.screenShare }">
            🖥️
          </button>
          <button @click="endMeeting" class="control-btn end-call">
            📞
          </button>
        </div>
      </div>
    </div>

    <!-- Gemini AI Tab Content -->
    <div v-show="activeTab === 'ai'" class="tab-content">
      <div class="ai-header">
        <h3>🤖 Gemini AI Assistant</h3>
        <div class="ai-status">
          <span class="status-dot" :class="{ connected: aiConnected }"></span>
          <span>{{ aiConnected ? 'Connected' : 'Connecting...' }}</span>
        </div>
      </div>
      
      <div class="ai-messages" ref="aiMessagesContainer">
        <div v-if="aiMessages.length === 0" class="ai-welcome">
          <div class="ai-welcome-icon">🤖</div>
          <h4>Hello! I'm Gemini AI</h4>
          <p>I can help you with questions about Nextcloud, technology, or anything else. How can I assist you today?</p>
        </div>
        
        <div v-for="message in aiMessages" :key="message.id" class="ai-message">
          <div class="ai-message-bubble" :class="message.type">
            <div class="ai-message-header">
              <span class="ai-message-sender">{{ message.type === 'user' ? 'You' : 'Gemini AI' }}</span>
              <span class="ai-message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="ai-message-content" v-html="formatAIMessage(message.content)"></div>
          </div>
        </div>
        
        <div v-if="aiLoading" class="ai-typing">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <span class="typing-text">Gemini is thinking...</span>
        </div>
      </div>
      
      <div class="ai-input-area">
        <div class="ai-input-wrapper">
          <input
            v-model="aiInput"
            @keyup.enter="sendAIMessage"
            type="text"
            placeholder="Ask Gemini AI anything..."
            class="ai-input"
            :disabled="aiLoading"
          />
          <button
            @click="sendAIMessage"
            :disabled="!aiInput.trim() || aiLoading"
            class="ai-send-btn"
          >
            🚀 Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { fetchMessages, sendMessage as apiSendMessage, sendReaction } from './talkApi.js'
import { getAuthToken } from './auth.js'

// Props
const props = defineProps({
  selectedRoomId: {
    type: String,
    default: null
  }
})

// Reactive state
const messages = ref([])
const newMessage = ref('')
const isLoading = ref(false)
const error = ref('')
const selectedRoomName = ref('')
const messagesContainer = ref(null)

// Widget state
const activeTab = ref('chat')
const isEnlargedView = ref(false)

// Meeting state
const isMeetingActive = ref(false)
const selectedMembers = ref([])
const activeMeetingMembers = ref([])
const meetingSettings = ref({
  video: true,
  audio: true,
  screenShare: false,
  enlargeOnStart: false
})
const meetingState = ref({
  muted: false,
  video: true,
  screenShare: false
})

// Available members
const availableMembers = ref([
  { id: 'admin', name: 'Admin', status: 'online' },
  { id: 'aashu', name: 'Aashu', status: 'online' },
  { id: 'adithya', name: 'Adithya', status: 'away' },
  { id: 'dhanush', name: 'Dhanush', status: 'online' }
])

// AI state
const aiMessages = ref([])
const aiInput = ref('')
const aiLoading = ref(false)
const aiConnected = ref(true)
const aiMessagesContainer = ref(null)

// Gemini AI configuration
const GEMINI_API_KEY = 'AIzaSyCK1OPSmlb3rxBd_d7a0B3WK43RaksoxUE'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

// Fetch messages when room changes
watch(() => props.selectedRoomId, async (newRoomId) => {
  if (newRoomId) {
    await loadMessages()
  } else {
    messages.value = []
    selectedRoomName.value = ''
  }
}, { immediate: true })

// Load messages from API
const loadMessages = async () => {
  if (!props.selectedRoomId) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const token = getAuthToken()
    const response = await fetchMessages(props.selectedRoomId, token)
    
    if (response.success) {
      messages.value = response.data.reverse() // Show oldest first
      selectedRoomName.value = response.roomName || `Room ${props.selectedRoomId}`
      await scrollToBottom()
    } else {
      error.value = response.error || 'Failed to load messages'
    }
  } catch (err) {
    error.value = 'Network error: ' + err.message
  } finally {
    isLoading.value = false
  }
}

// Send a new message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.selectedRoomId) return
  
  const messageText = newMessage.value.trim()
  newMessage.value = ''
  
  isLoading.value = true
  error.value = ''
  
  try {
    const token = getAuthToken()
    const response = await apiSendMessage(props.selectedRoomId, messageText, token)
    
    if (response.success) {
      // Add the new message to the list
      messages.value.push(response.data)
      await scrollToBottom()
    } else {
      error.value = response.error || 'Failed to send message'
      newMessage.value = messageText // Restore the message
    }
  } catch (err) {
    error.value = 'Network error: ' + err.message
    newMessage.value = messageText // Restore the message
  } finally {
    isLoading.value = false
  }
}

// Toggle reaction on a message
const toggleReaction = async (messageId) => {
  if (!props.selectedRoomId) return
  
  try {
    const token = getAuthToken()
    const emoji = '👍' // Default emoji for now
    const response = await sendReaction(messageId, emoji, token)
    
    if (response.success) {
      // Reload messages to get updated reactions
      await loadMessages()
    } else {
      error.value = response.error || 'Failed to add reaction'
    }
  } catch (err) {
    error.value = 'Network error: ' + err.message
  }
}

// Scroll to bottom of messages
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Get user initials for avatar
const getInitials = (name) => {
  if (!name) return '?'
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Format time in super simple way
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now - date
  
  // If less than 1 minute ago
  if (diff < 60000) {
    return 'Just now ⏰'
  }
  
  // If less than 1 hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} min ago ⏰`
  }
  
  // If today
  if (date.toDateString() === now.toDateString()) {
    return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ⏰`
  }
  
  // Otherwise show date
  return date.toLocaleDateString() + ' 📅'
}

// Widget functions
const toggleEnlargedView = () => {
  isEnlargedView.value = !isEnlargedView.value
  // Emit event to parent component for full-screen handling
  if (isEnlargedView.value) {
    document.body.classList.add('smart-talk-enlarged')
  } else {
    document.body.classList.remove('smart-talk-enlarged')
  }
}

// Meeting functions
const startMeeting = async () => {
  if (selectedMembers.value.length === 0) return
  
  // Get selected members details
  activeMeetingMembers.value = availableMembers.value.filter(
    member => selectedMembers.value.includes(member.id)
  ).map(member => ({
    ...member,
    video: meetingSettings.value.video,
    audio: meetingSettings.value.audio
  }))
  
  // Enlarge view if requested
  if (meetingSettings.value.enlargeOnStart) {
    isEnlargedView.value = true
    document.body.classList.add('smart-talk-enlarged')
  }
  
  isMeetingActive.value = true
  selectedRoomName.value = `Meeting with ${activeMeetingMembers.value.length} members`
  
  // Show success notification
  showNotification(`🎉 Meeting started with ${activeMeetingMembers.value.length} members!`, 'success')
}

const endMeeting = () => {
  isMeetingActive.value = false
  activeMeetingMembers.value = []
  selectedMembers.value = []
  selectedRoomName.value = ''
  
  // Reset enlarged view
  isEnlargedView.value = false
  document.body.classList.remove('smart-talk-enlarged')
  
  showNotification('📞 Meeting ended', 'info')
}

const toggleMute = () => {
  meetingState.value.muted = !meetingState.value.muted
  showNotification(meetingState.value.muted ? '🔇 Muted' : '🎤 Unmuted', 'info')
}

const toggleVideo = () => {
  meetingState.value.video = !meetingState.value.video
  showNotification(meetingState.value.video ? '📹 Video On' : '📷 Video Off', 'info')
}

const toggleScreenShare = () => {
  meetingState.value.screenShare = !meetingState.value.screenShare
  showNotification(meetingState.value.screenShare ? '🖥️ Screen Sharing' : '🖥️ Screen Share Off', 'info')
}

// AI functions
const sendAIMessage = async () => {
  if (!aiInput.value.trim() || aiLoading.value) return
  
  const userMessage = aiInput.value.trim()
  aiInput.value = ''
  
  // Add user message
  aiMessages.value.push({
    id: Date.now(),
    type: 'user',
    content: userMessage,
    timestamp: Date.now()
  })
  
  aiLoading.value = true
  await scrollAIToBottom()
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      const aiResponse = data.candidates[0].content.parts[0].text
      
      aiMessages.value.push({
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: Date.now()
      })
    } else {
      throw new Error('API Error')
    }
  } catch (error) {
    aiMessages.value.push({
      id: Date.now() + 1,
      type: 'ai',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: Date.now()
    })
  }
  
  aiLoading.value = false
  await scrollAIToBottom()
}

const formatAIMessage = (content) => {
  // Basic markdown formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const scrollAIToBottom = async () => {
  await nextTick()
  if (aiMessagesContainer.value) {
    aiMessagesContainer.value.scrollTop = aiMessagesContainer.value.scrollHeight
  }
}

// Utility functions
const showNotification = (message, type = 'info') => {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `smart-talk-notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10001;
    padding: 12px 20px; border-radius: 8px; color: white;
    font-weight: bold; font-family: inherit;
    background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `
  
  document.body.appendChild(notification)
  setTimeout(() => notification.remove(), 3000)
}

// Load messages on component mount
onMounted(() => {
  if (props.selectedRoomId) {
    loadMessages()
  }
  
  // Add global styles
  const globalStyle = document.createElement('style')
  globalStyle.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .smart-talk-enlarged {
      overflow: hidden;
    }
    
    .smart-talk-enlarged .smart-talk-widget {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9999 !important;
      border-radius: 0 !important;
    }
  `
  document.head.appendChild(globalStyle)
})
</script>

<style scoped>
.smart-talk-widget {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
}

.smart-talk-widget.enlarged {
  border-radius: 0;
}

/* Header Styles */
.widget-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
}

.header-text h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-text p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enlarge-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.enlarge-btn:hover {
  background: rgba(255,255,255,0.3);
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  border-bottom: 2px solid #667eea;
}

.tab-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* Tab Content */
.tab-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Meeting Styles */
.meeting-setup {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meeting-header {
  text-align: center;
}

.meeting-header h3 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 20px;
}

.meeting-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.member-selection {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
}

.member-selection h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.member-item {
  cursor: pointer;
}

.member-checkbox {
  display: none;
}

.member-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s;
}

.member-checkbox:checked + .member-card {
  border-color: #667eea;
  background: #f0f4ff;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto 8px;
}

.member-name {
  display: block;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.member-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.member-status.online {
  background: #dcfce7;
  color: #166534;
}

.member-status.away {
  background: #fef3c7;
  color: #92400e;
}

/* Meeting Options */
.meeting-options {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
}

.meeting-options h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.option-checkbox {
  transform: scale(1.2);
}

.option-label {
  font-size: 14px;
  color: #374151;
}

/*

/* Meeting Actions */
.meeting-actions {
  text-align: center;
}

.start-meeting-btn {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.start-meeting-btn:hover:not(.disabled) {
  transform: translateY(-2px);
}

.start-meeting-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Meeting Interface */
.meeting-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.meeting-header-active {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.meeting-header-active h3 {
  margin: 0 0 4px 0;
  color: #1e293b;
}

.meeting-participants {
  font-size: 12px;
  color: #64748b;
}

.video-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.main-video {
  background: #1e293b;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  color: white;
  font-size: 16px;
  position: relative;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.participant-video {
  background: #374151;
  border-radius: 8px;
  padding: 20px 10px;
  text-align: center;
  color: white;
  position: relative;
}

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto 8px;
  font-size: 14px;
}

.video-controls {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-label {
  font-size: 12px;
  font-weight: 500;
}

.participant-status {
  display: flex;
  gap: 4px;
  font-size: 10px;
}

.meeting-bottom-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #cbd5e1;
}

.control-btn.active {
  background: #667eea;
  color: white;
}

.control-btn.end-call {
  background: #dc2626;
  color: white;
}

.control-btn.end-call:hover {
  background: #b91c1c;
}

/* AI Styles */
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.ai-header h3 {
  margin: 0;
  color: #1e293b;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: background 0.2s;
}

.status-dot.connected {
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  margin-bottom: 12px;
}

.ai-welcome {
  text-align: center;
  padding: 40px 20px;
}

.ai-welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.ai-welcome h4 {
  margin: 0 0 12px 0;
  color: #1e293b;
}

.ai-welcome p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

.ai-message {
  margin-bottom: 16px;
}

.ai-message-bubble {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 85%;
}

.ai-message-bubble.user {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #3b82f6;
  margin-left: auto;
}

.ai-message-bubble.ai {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #e2e8f0;
}

.ai-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.ai-message-sender {
  font-weight: 600;
}

.ai-message-time {
  opacity: 0.7;
}

.ai-message-content {
  line-height: 1.4;
}

.ai-typing {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  color: #667eea;
  font-style: italic;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #667eea;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
.typing-indicator span:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.ai-input-area {
  margin-top: auto;
}

.ai-input-wrapper {
  display: flex;
  gap: 8px;
}

.ai-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
}

.ai-input:focus {
  border-color: #667eea;
}

.ai-send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
}

.ai-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.ai-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Chat Styles (existing + enhanced) */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  color: #1e293b;
}

.empty-state p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

.message-wrapper {
  margin-bottom: 16px;
}

.message-bubble {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.message-time {
  font-size: 11px;
  color: #64748b;
}

.message-text {
  color: #374151;
  line-height: 1.4;
  margin-bottom: 8px;
}

.reaction-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.reaction-btn:hover {
  background: #e2e8f0;
}

.reactions-display {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.reaction-badge {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-input-area {
  margin-top: auto;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
}

.message-input:focus {
  border-color: #667eea;
}

.send-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.send-button:hover:not(.disabled) {
  transform: translateY(-1px);
}

.send-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-box {
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 20px;
}

.error-text {
  color: #991b1b;
  font-weight: 500;
}

/* Scrollbar Styles */
.messages-area::-webkit-scrollbar,
.ai-messages::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-track,
.ai-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.messages-area::-webkit-scrollbar-thumb,
.ai-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.messages-area::-webkit-scrollbar-thumb:hover,
.ai-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
