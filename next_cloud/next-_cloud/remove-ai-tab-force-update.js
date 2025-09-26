// Force Update Smart Talk Widget - Remove AI Tab
// Copy and paste this in your Nextcloud browser console

console.log('🔧 Force updating Smart Talk Widget to remove AI tab...');

// Step 1: Remove all existing Smart Talk widgets
document.querySelectorAll('[id*="talk-widget"], [class*="smart-talk"], [class*="chat-widget"]').forEach(el => {
    console.log('Removing existing widget:', el);
    el.remove();
});

// Step 2: Clear any global widget state
try {
    if (window.SmartTalkOpen) window.SmartTalkOpen = false;
    if (window.SmartTalkBus) delete window.SmartTalkBus;
} catch (e) {}

// Step 3: Load Vue 3 if not available
if (typeof Vue === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vue@3/dist/vue.global.js';
    script.onload = initTalkOnlyWidget;
    document.head.appendChild(script);
} else {
    initTalkOnlyWidget();
}

function initTalkOnlyWidget() {
    const { createApp, ref, nextTick } = Vue;
    
    // Create new widget container
    const mount = document.createElement('div');
    mount.id = 'smart-talk-widget-updated';
    mount.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    document.body.appendChild(mount);

    // Talk-only widget component (NO AI TAB)
    const TalkOnlyWidget = {
        template: `
            <div v-if="!closed" class="chat-widget" :class="{ minimized }">
                <div class="header">
                    <div class="title">
                        <span class="header-icon">💬</span>
                        <div>
                            <h2>Smart Talk</h2>
                            <p>{{ selectedRoomName || 'Conversations' }}</p>
                        </div>
                    </div>
                    <div class="controls">
                        <button @click="minimized = !minimized" title="Minimize/Expand">
                            {{ minimized ? '📖' : '📘' }}
                        </button>
                        <button @click="closed = true" title="Close">✖️</button>
                    </div>
                </div>

                <div v-if="!minimized" class="body">
                    <!-- NO TABS - Just direct Talk interface -->
                    <div class="toolbar">
                        <select v-model="selectedRoomToken" @change="onSelectRoom" class="room-select">
                            <option disabled value="">Select conversation...</option>
                            <option v-for="r in rooms" :key="r.token" :value="r.token">{{ r.displayName }}</option>
                        </select>
                        <button class="btn" @click="showCreate = !showCreate">➕ New</button>
                    </div>
                    
                    <div v-if="showCreate" class="panel">
                        <input v-model="newGroupName" class="panel-input" placeholder="Group name" />
                        <button class="btn" @click="submitCreate">Create</button>
                        <button class="btn" @click="showCreate = false">Cancel</button>
                    </div>

                    <div class="content">
                        <div class="messages" ref="messagesContainer">
                            <div v-for="message in messages" :key="message.id" class="message" :class="{ self: isSelf(message) }">
                                <div class="avatar">{{ (message.actorDisplayName || '?').charAt(0).toUpperCase() }}</div>
                                <div class="bubble">
                                    <div class="meta">
                                        <span class="user-name">{{ message.actorDisplayName }}</span>
                                        <span class="time">{{ formatTime(message.timestamp) }}</span>
                                    </div>
                                    <div class="message-text">{{ message.message }}</div>
                                </div>
                            </div>
                            <div v-if="messages.length === 0" class="empty">No messages yet. Start a conversation!</div>
                        </div>
                        
                        <div class="input-area">
                            <input 
                                v-model="newMessage" 
                                @keyup.enter="sendMessage" 
                                type="text" 
                                class="message-input" 
                                placeholder="Type your message..." 
                            />
                            <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim()">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        setup() {
            // Component state
            const minimized = ref(false);
            const closed = ref(false);
            const selectedRoomToken = ref('');
            const selectedRoomName = ref('General');
            const rooms = ref([
                { token: 'general', displayName: 'General' },
                { token: 'demo', displayName: 'Demo Room' },
                { token: 'team', displayName: 'Team Chat' }
            ]);
            const messages = ref([
                {
                    id: 1,
                    actorDisplayName: 'System',
                    actorId: 'system',
                    timestamp: Math.floor(Date.now() / 1000),
                    message: 'Welcome to Smart Talk! This is the Talk-only version without AI features.'
                }
            ]);
            const newMessage = ref('');
            const showCreate = ref(false);
            const newGroupName = ref('');
            const messagesContainer = ref(null);
            
            // Methods
            const onSelectRoom = () => {
                const found = rooms.value.find(r => r.token === selectedRoomToken.value);
                if (found) {
                    selectedRoomName.value = found.displayName;
                    messages.value = [
                        {
                            id: Date.now(),
                            actorDisplayName: 'System',
                            actorId: 'system',
                            timestamp: Math.floor(Date.now() / 1000),
                            message: `Switched to ${found.displayName}`
                        }
                    ];
                    scrollToBottom();
                }
            };
            
            const submitCreate = () => {
                if (newGroupName.value.trim()) {
                    const newRoom = {
                        token: 'room_' + Date.now(),
                        displayName: newGroupName.value.trim()
                    };
                    rooms.value.push(newRoom);
                    selectedRoomToken.value = newRoom.token;
                    selectedRoomName.value = newRoom.displayName;
                    newGroupName.value = '';
                    showCreate.value = false;
                    showToast('Group created successfully!');
                    
                    messages.value = [
                        {
                            id: Date.now(),
                            actorDisplayName: 'System',
                            actorId: 'system',
                            timestamp: Math.floor(Date.now() / 1000),
                            message: `Created new group: ${newRoom.displayName}`
                        }
                    ];
                    scrollToBottom();
                }
            };
            
            const sendMessage = () => {
                if (!newMessage.value.trim()) return;
                
                const userMessage = {
                    id: Date.now(),
                    actorDisplayName: 'You',
                    actorId: 'user',
                    timestamp: Math.floor(Date.now() / 1000),
                    message: newMessage.value.trim()
                };
                
                messages.value.push(userMessage);
                newMessage.value = '';
                scrollToBottom();
                
                // Simulate response after a delay
                setTimeout(() => {
                    messages.value.push({
                        id: Date.now() + 1,
                        actorDisplayName: 'Demo User',
                        actorId: 'demo',
                        timestamp: Math.floor(Date.now() / 1000),
                        message: 'This is a demo response from the Talk integration!'
                    });
                    scrollToBottom();
                }, 1000);
            };
            
            const isSelf = (message) => {
                return message.actorId === 'user';
            };
            
            const formatTime = (timestamp) => {
                const date = new Date(timestamp * 1000);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };
            
            const scrollToBottom = () => {
                nextTick(() => {
                    if (messagesContainer.value) {
                        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
                    }
                });
            };
            
            const showToast = (message) => {
                const toast = document.createElement('div');
                toast.textContent = message;
                toast.style.cssText = `
                    position: fixed; top: 20px; right: 20px; background: #0082c9; color: white;
                    padding: 12px 16px; border-radius: 8px; z-index: 10001; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: fadeIn 0.3s ease;
                `;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            };
            
            // Initialize
            selectedRoomToken.value = rooms.value[0].token;
            selectedRoomName.value = rooms.value[0].displayName;
            
            return {
                minimized, closed, selectedRoomToken, selectedRoomName, rooms, messages, 
                newMessage, showCreate, newGroupName, messagesContainer,
                onSelectRoom, submitCreate, sendMessage, isSelf, formatTime, scrollToBottom
            };
        }
    };

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
        
        .chat-widget { 
            width: 380px; min-height: 420px; border-radius: 16px; padding: 16px; 
            background: white; border: 1px solid #e0e0e0; 
            box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
        }
        
        .header { 
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; 
            padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;
        }
        
        .title { display: flex; align-items: center; gap: 10px; }
        .title h2 { margin: 0; font-size: 16px; color: #333; }
        .title p { margin: 0; font-size: 12px; color: #666; }
        
        .controls { display: flex; gap: 8px; }
        .controls button { 
            border: none; background: #0082c9; color: white; padding: 6px 8px; 
            border-radius: 6px; cursor: pointer; font-size: 12px;
        }
        .controls button:hover { background: #006ba3; }
        
        .body { height: 420px; display: flex; flex-direction: column; }
        
        .toolbar { 
            display: flex; gap: 8px; align-items: center; margin-bottom: 8px; 
            padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;
        }
        
        .room-select { 
            flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #e0e0e0; 
            background: #f5f5f5; color: #333; font-size: 13px; 
        }
        
        .btn { 
            padding: 6px 10px; border-radius: 8px; border: 1px solid #e0e0e0; 
            background: #f5f5f5; color: #333; cursor: pointer; font-size: 12px; 
            transition: all 0.2s ease; 
        }
        .btn:hover { background: #e0e0e0; }
        
        .panel { 
            display: flex; gap: 8px; align-items: center; margin: 6px 0; 
            padding: 8px; background: #f8f9fa; border-radius: 8px;
        }
        
        .panel-input { 
            flex: 1; padding: 8px 10px; border-radius: 8px; border: 1px solid #e0e0e0; 
            background: white; color: #333; 
        }
        
        .content { flex: 1; display: flex; flex-direction: column; }
        
        .messages { 
            flex: 1; overflow-y: auto; padding: 8px; max-height: 280px;
            background: #fafafa; border-radius: 8px; margin-bottom: 8px;
        }
        
        .message { display: flex; gap: 8px; margin: 8px 0; align-items: flex-end; }
        .message.self { flex-direction: row-reverse; }
        
        .avatar { 
            width: 28px; height: 28px; border-radius: 50%; background: #0082c9; 
            color: white; display: flex; align-items: center; justify-content: center; 
            font-size: 12px; font-weight: bold; flex-shrink: 0;
        }
        
        .bubble { 
            background: white; border: 1px solid #e0e0e0; border-radius: 12px; 
            padding: 8px 12px; max-width: 250px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .message.self .bubble { 
            background: #0082c9; color: white; border-color: #0082c9; 
        }
        
        .meta { 
            display: flex; justify-content: space-between; align-items: center;
            font-size: 11px; opacity: 0.8; margin-bottom: 4px; 
        }
        
        .message-text { font-size: 14px; line-height: 1.4; }
        
        .empty { 
            text-align: center; color: #666; padding: 20px; font-style: italic; 
            background: white; border-radius: 8px; border: 1px dashed #ddd;
        }
        
        .input-area { display: flex; gap: 8px; }
        
        .message-input { 
            flex: 1; padding: 10px 12px; border: 1px solid #e0e0e0; 
            border-radius: 8px; background: white; color: #333; 
        }
        .message-input:focus { border-color: #0082c9; outline: none; }
        
        .send-button { 
            padding: 10px 16px; border: none; background: #0082c9; color: white; 
            border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
        }
        .send-button:hover:not(:disabled) { background: #006ba3; }
        .send-button:disabled { opacity: 0.6; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    // Create app
    createApp(TalkOnlyWidget).mount(mount);
    
    console.log('✅ Smart Talk Widget updated - AI tab removed!');
    
    // Show success notification
    const toast = document.createElement('div');
    toast.textContent = '✅ Smart Talk updated - AI tab removed!';
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #28a745; color: white;
        padding: 12px 16px; border-radius: 8px; z-index: 10001; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Clean up any existing intervals or event listeners
try {
    // Clear any existing Smart Talk timers
    for (let i = 1; i < 99999; i++) {
        window.clearInterval(i);
    }
} catch (e) {}