// Remove AI Tab from Smart Talk Widget - Direct Update
// Copy and paste this in your Nextcloud browser console

console.log('🔧 Updating existing Smart Talk Widget to remove AI tab...');

// Find the existing talk-widget-mount
const existingMount = document.getElementById('talk-widget-mount');
if (!existingMount) {
    console.error('❌ talk-widget-mount not found! Make sure the Smart Talk widget is open.');
    alert('Please open the Smart Talk widget first, then run this script.');
    throw new Error('talk-widget-mount not found');
}

console.log('✅ Found existing talk-widget-mount, updating...');

// Clear the existing content
existingMount.innerHTML = '';

// Load Vue 3 if not available
if (typeof Vue === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vue@3/dist/vue.global.js';
    script.onload = () => updateExistingWidget(existingMount);
    document.head.appendChild(script);
} else {
    updateExistingWidget(existingMount);
}

function updateExistingWidget(mount) {
    const { createApp, ref, nextTick } = Vue;
    
    // Use the existing mount, preserve its styling
    console.log('🔄 Updating existing widget container...');

    // Component definition
    const SmartTalkWidget = {
        template: `
            <div v-if="!closed" class="chat-widget" :class="{ minimized }">
                <div class="header">
                    <div class="title">
                        <span class="header-icon">🤖</span>
                        <div>
                            <h2>Smart Talk</h2>
                            <p>{{ activeTab === 'ai' ? 'Gemini AI Assistant' : 'Conversations' }}</p>
                        </div>
                    </div>
                    <div class="controls">
                        <button @click="minimized = !minimized">{{ minimized ? '📖' : '📘' }}</button>
                        <button @click="closed = true">✖️</button>
                    </div>
                </div>

                <div v-if="!minimized" class="body">
                    <div class="tabs">
                        <button :class="['tab', 'active']" disabled style="opacity: 1;">💬 Talk Only</button>
                    </div>

                    <!-- Only Talk content -->
                    <div class="content">
                        <div class="messages">
                            <div v-for="msg in messages" :key="msg.id" class="message">
                                <div class="avatar">{{ msg.user.charAt(0) }}</div>
                                <div class="bubble">
                                    <div class="meta">{{ msg.user }} • {{ msg.time }}</div>
                                    <div>{{ msg.text }}</div>
                                </div>
                            </div>
                            <div v-if="!messages.length" class="empty">No messages yet - AI tab removed!</div>
                        </div>
                        <div class="input-area">
                            <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type message..." />
                            <button @click="sendMessage">Send</button>
                        </div>
                    </div>

                    <!-- AI Tab Removed -->
                </div>
            </div>
        `,
        setup() {
            const activeTab = ref('talk'); // Always talk tab
            const minimized = ref(false);
            const closed = ref(false);
            
            // Talk state only
            const messages = ref([]);
            const newMessage = ref('');
            
            // Methods
            const sendMessage = () => {
                if (!newMessage.value.trim()) return;
                messages.value.push({
                    id: Date.now(),
                    user: 'You',
                    text: newMessage.value.trim(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                newMessage.value = '';
                
                // Demo response
                setTimeout(() => {
                    messages.value.push({
                        id: Date.now() + 1,
                        user: 'Demo',
                        text: 'AI tab has been removed! This is Talk-only mode.',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }, 1000);
            };
            
            return {
                activeTab, minimized, closed, messages, newMessage, sendMessage
            };
        }
    };

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .chat-widget { width: 380px; border-radius: 16px; padding: 16px; background: white; 
                       border: 1px solid #e0e0e0; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .title { display: flex; align-items: center; gap: 10px; }
        .title h2 { margin: 0; font-size: 16px; } .title p { margin: 0; font-size: 12px; color: #666; }
        .controls { display: flex; gap: 8px; }
        .controls button { border: none; background: #667eea; color: white; padding: 6px 8px; 
                          border-radius: 6px; cursor: pointer; }
        .tabs { display: flex; gap: 6px; margin-bottom: 10px; }
        .tab { padding: 8px 12px; border: 1px solid #e0e0e0; background: #f5f5f5; 
               border-radius: 8px; cursor: pointer; }
        .tab.active { background: #667eea; color: white; border-color: #667eea; }
        .content { height: 400px; display: flex; flex-direction: column; }
        .messages { flex: 1; overflow-y: auto; padding: 8px; }
        .message { display: flex; gap: 8px; margin: 8px 0; }
        .message.user { flex-direction: row-reverse; }
        .avatar { width: 28px; height: 28px; border-radius: 50%; background: #667eea; 
                  color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .bubble { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; 
                  padding: 8px; max-width: 250px; }
        .ai-bubble { background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%); 
                     border-color: #e3f2fd; }
        .message.user .bubble { background: #667eea; color: white; }
        .meta { font-size: 11px; opacity: 0.8; margin-bottom: 4px; }
        .empty { text-align: center; color: #666; padding: 20px; }
        .typing { text-align: center; color: #666; padding: 10px; font-style: italic; }
        .error { background: #ffe6e6; border: 1px solid #ffb3b3; padding: 8px; 
                 border-radius: 6px; margin: 8px 0; }
        .input-area { display: flex; gap: 8px; margin-top: 8px; }
        .input-area input { flex: 1; padding: 8px; border: 1px solid #e0e0e0; 
                           border-radius: 8px; }
        .input-area button { padding: 8px 12px; border: none; background: #667eea; 
                            color: white; border-radius: 8px; cursor: pointer; }
        .input-area button:disabled { opacity: 0.6; cursor: not-allowed; }
        .ai-status { font-size: 11px; color: #666; margin-top: 8px; display: flex; 
                     align-items: center; gap: 6px; }
        .indicator { width: 6px; height: 6px; border-radius: 50%; }
        .indicator.ok { background: #4caf50; }
        .indicator.error { background: #f44336; }
        /* AI styles removed */
    `;
    document.head.appendChild(style);

    // Create app
    createApp(SmartTalkWidget).mount(mount);
    
    console.log('✅ Smart Talk Widget updated - AI tab removed!');
    
    // Show notification
    const toast = document.createElement('div');
    toast.textContent = '✅ AI tab removed from Smart Talk!';
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #28a745; color: white;
        padding: 12px 16px; border-radius: 8px; z-index: 10001; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}