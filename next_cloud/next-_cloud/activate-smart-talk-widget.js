// SMART TALK WIDGET ACTIVATION WITH MEETING FEATURES
// Copy and paste this entire code in your Nextcloud browser console

console.log('🚀 Activating Smart Talk Widget with Meeting Features...');

// Find or create the widget mount point
let mount = document.getElementById('talk-widget-mount');
if (!mount) {
    // Create mount point if it doesn't exist
    mount = document.createElement('div');
    mount.id = 'talk-widget-mount';
    mount.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        width: 400px; height: 600px;
    `;
    document.body.appendChild(mount);
}

// Clear existing content
mount.innerHTML = '';

// Create the enhanced Smart Talk widget with meeting features
mount.innerHTML = `
    <div class="smart-talk-widget">
        <div class="widget-header">
            <div class="title-section">
                <h2>🎯 Smart Talk Widget</h2>
                <div class="status-indicator online"></div>
                <span class="status-text">Ready</span>
            </div>
            <div class="header-controls">
                <button class="minimize-btn" onclick="toggleWidget()">−</button>
                <button class="close-btn" onclick="closeWidget()">×</button>
            </div>
        </div>
        
        <div class="widget-body">
            <!-- Navigation Tabs -->
            <div class="nav-tabs">
                <button class="tab-btn active" onclick="switchTab('chat')" id="chat-tab">
                    💬 Chat
                </button>
                <button class="tab-btn" onclick="switchTab('meeting')" id="meeting-tab">
                    🎥 Meeting
                </button>
                <button class="tab-btn" onclick="switchTab('gemini')" id="gemini-tab">
                    🤖 Gemini AI
                </button>
            </div>
            
            <!-- Chat Tab Content -->
            <div class="tab-content active" id="chat-content">
                <div class="chat-messages" id="chat-messages">
                    <div class="system-message">
                        <div class="message-bubble system">
                            Welcome to Smart Talk! Use the Meeting tab to start video calls with member selection.
                        </div>
                    </div>
                </div>
                <div class="message-input-area">
                    <input type="text" id="chat-input" placeholder="Type your message..." />
                    <button onclick="sendChatMessage()" class="send-btn">Send</button>
                </div>
            </div>
            
            <!-- Meeting Tab Content -->
            <div class="tab-content" id="meeting-content">
                <div class="meeting-controls">
                    <div class="meeting-header">
                        <h3>📹 Start Meeting</h3>
                        <div class="meeting-status" id="meeting-status">Ready to start</div>
                    </div>
                    
                    <!-- Member Selection Section -->
                    <div class="member-selection">
                        <h4>👥 Select Members to Invite</h4>
                        <div class="members-list" id="members-list">
                            <div class="member-item">
                                <input type="checkbox" id="member-admin" value="admin">
                                <label for="member-admin">
                                    <div class="avatar">A</div>
                                    <span>Admin</span>
                                </label>
                            </div>
                            <div class="member-item">
                                <input type="checkbox" id="member-aashu" value="aashu">
                                <label for="member-aashu">
                                    <div class="avatar">A</div>
                                    <span>Aashu</span>
                                </label>
                            </div>
                            <div class="member-item">
                                <input type="checkbox" id="member-adithya" value="adithya">
                                <label for="member-adithya">
                                    <div class="avatar">A</div>
                                    <span>Adithya</span>
                                </label>
                            </div>
                            <div class="member-item">
                                <input type="checkbox" id="member-dhanush" value="dhanush">
                                <label for="member-dhanush">
                                    <div class="avatar">D</div>
                                    <span>Dhanush</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Meeting Options -->
                    <div class="meeting-options">
                        <div class="option-item">
                            <input type="checkbox" id="enable-video" checked>
                            <label for="enable-video">📹 Enable Video</label>
                        </div>
                        <div class="option-item">
                            <input type="checkbox" id="enable-audio" checked>
                            <label for="enable-audio">🎤 Enable Audio</label>
                        </div>
                        <div class="option-item">
                            <input type="checkbox" id="screen-share">
                            <label for="screen-share">🖥️ Screen Share</label>
                        </div>
                        <div class="option-item">
                            <input type="checkbox" id="enlarge-screen">
                            <label for="enlarge-screen">🔍 Enlarge Screen View</label>
                        </div>
                    </div>
                    
                    <!-- Start Meeting Button -->
                    <div class="meeting-actions">
                        <button class="start-meeting-btn" onclick="startMeeting()" id="start-meeting-btn">
                            🚀 Start Meeting
                        </button>
                        <button class="join-meeting-btn" onclick="joinMeeting()" id="join-meeting-btn" style="display: none;">
                            🎯 Join Meeting
                        </button>
                    </div>
                </div>
                
                <!-- Meeting Interface (Hidden initially) -->
                <div class="meeting-interface" id="meeting-interface" style="display: none;">
                    <div class="video-container">
                        <div class="main-video">
                            <div class="video-placeholder">
                                📹 Video Stream Will Appear Here
                            </div>
                        </div>
                        <div class="participants-videos" id="participants-videos">
                            <!-- Participant videos will be added here -->
                        </div>
                    </div>
                    <div class="meeting-bottom-controls">
                        <button class="control-btn" onclick="toggleMute()">🎤</button>
                        <button class="control-btn" onclick="toggleVideo()">📹</button>
                        <button class="control-btn" onclick="toggleScreenShare()">🖥️</button>
                        <button class="control-btn end-call" onclick="endMeeting()">📞</button>
                    </div>
                </div>
            </div>
            
            <!-- Gemini AI Tab Content -->
            <div class="tab-content" id="gemini-content">
                <div class="ai-header">
                    <h3>🤖 Gemini AI Assistant</h3>
                    <div class="ai-status">
                        <span class="status-dot connected"></span>
                        <span>Connected</span>
                    </div>
                </div>
                <div class="ai-messages" id="ai-messages">
                    <div class="ai-message">
                        <div class="message-bubble ai">
                            <strong>Gemini AI:</strong> Hello! I'm ready to help you with questions about Nextcloud, meetings, or anything else. How can I assist you?
                        </div>
                    </div>
                </div>
                <div class="ai-input-area">
                    <input type="text" id="ai-input" placeholder="Ask Gemini AI anything..." />
                    <button onclick="sendAIMessage()" class="ai-send-btn">🚀 Send</button>
                </div>
            </div>
        </div>
    </div>
`;

// Add comprehensive styles
const styles = document.createElement('style');
styles.innerHTML = `
    .smart-talk-widget {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .widget-header {
        background: rgba(255,255,255,0.1);
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        backdrop-filter: blur(10px);
    }
    
    .title-section {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .title-section h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    }
    
    .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 10px #4ade80;
    }
    
    .status-text {
        font-size: 12px;
        opacity: 0.9;
    }
    
    .header-controls {
        display: flex;
        gap: 8px;
    }
    
    .minimize-btn, .close-btn {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        color: white;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }
    
    .minimize-btn:hover, .close-btn:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .widget-body {
        flex: 1;
        background: white;
        display: flex;
        flex-direction: column;
    }
    
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
    
    .tab-content {
        flex: 1;
        padding: 16px;
        display: none;
        flex-direction: column;
    }
    
    .tab-content.active {
        display: flex;
    }
    
    /* Chat Styles */
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        margin-bottom: 12px;
    }
    
    .message-bubble {
        padding: 10px 14px;
        border-radius: 12px;
        margin-bottom: 8px;
        max-width: 280px;
    }
    
    .message-bubble.system {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 13px;
    }
    
    .message-bubble.user {
        background: #3b82f6;
        color: white;
        margin-left: auto;
    }
    
    .message-bubble.ai {
        background: #f1f5f9;
        border: 2px solid #e2e8f0;
    }
    
    .message-input-area {
        display: flex;
        gap: 8px;
    }
    
    .message-input-area input {
        flex: 1;
        padding: 10px 14px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        outline: none;
    }
    
    .message-input-area input:focus {
        border-color: #667eea;
    }
    
    .send-btn, .ai-send-btn {
        padding: 10px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: transform 0.2s;
    }
    
    .send-btn:hover, .ai-send-btn:hover {
        transform: translateY(-1px);
    }
    
    /* Meeting Styles */
    .meeting-header {
        text-align: center;
        margin-bottom: 20px;
    }
    
    .meeting-header h3 {
        margin: 0 0 8px 0;
        color: #1e293b;
    }
    
    .meeting-status {
        font-size: 12px;
        color: #64748b;
        background: #f1f5f9;
        padding: 4px 12px;
        border-radius: 20px;
        display: inline-block;
    }
    
    .member-selection {
        background: #f8fafc;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 16px;
    }
    
    .member-selection h4 {
        margin: 0 0 12px 0;
        color: #374151;
        font-size: 14px;
    }
    
    .members-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .member-item {
        display: flex;
        align-items: center;
    }
    
    .member-item input[type="checkbox"] {
        margin-right: 12px;
        transform: scale(1.2);
    }
    
    .member-item label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        flex: 1;
        padding: 8px;
        border-radius: 8px;
        transition: background 0.2s;
    }
    
    .member-item label:hover {
        background: rgba(102, 126, 234, 0.1);
    }
    
    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
    }
    
    .meeting-options {
        background: #f8fafc;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 16px;
    }
    
    .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .option-item input[type="checkbox"] {
        margin-right: 12px;
        transform: scale(1.2);
    }
    
    .option-item label {
        cursor: pointer;
        font-size: 14px;
        color: #374151;
    }
    
    .meeting-actions {
        text-align: center;
    }
    
    .start-meeting-btn, .join-meeting-btn {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        color: white;
        border: none;
        padding: 14px 28px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }
    
    .start-meeting-btn:hover, .join-meeting-btn:hover {
        transform: translateY(-2px);
    }
    
    .meeting-interface {
        background: #1e293b;
        border-radius: 12px;
        padding: 16px;
        color: white;
    }
    
    .video-container {
        background: #374151;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin-bottom: 16px;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .video-placeholder {
        font-size: 16px;
        color: #9ca3af;
    }
    
    .meeting-bottom-controls {
        display: flex;
        justify-content: center;
        gap: 12px;
    }
    
    .control-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 20px;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .control-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    .control-btn.end-call {
        background: #dc2626;
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
    
    .status-dot.connected {
        width: 8px;
        height: 8px;
        border-radius: 50%;
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
    
    .ai-input-area {
        display: flex;
        gap: 8px;
    }
    
    .ai-input-area input {
        flex: 1;
        padding: 10px 14px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        outline: none;
    }
    
    .ai-input-area input:focus {
        border-color: #667eea;
    }
`;

document.head.appendChild(styles);

// Widget functionality
let isMinimized = false;
let currentTab = 'chat';
let isMeetingActive = false;

// Tab switching
window.switchTab = function(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    document.getElementById(tabName + '-content').classList.add('active');
    
    currentTab = tabName;
};

// Widget controls
window.toggleWidget = function() {
    const widget = document.querySelector('.smart-talk-widget');
    if (isMinimized) {
        widget.style.height = '600px';
        document.querySelector('.minimize-btn').textContent = '−';
        isMinimized = false;
    } else {
        widget.style.height = '60px';
        document.querySelector('.minimize-btn').textContent = '+';
        isMinimized = true;
    }
};

window.closeWidget = function() {
    mount.style.display = 'none';
};

// Chat functionality
window.sendChatMessage = function() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    
    if (input.value.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<div class="message-bubble user">${input.value}</div>`;
        messages.appendChild(messageDiv);
        
        // Auto response
        setTimeout(() => {
            const responseDiv = document.createElement('div');
            responseDiv.innerHTML = `<div class="message-bubble system">Message received! Try the Meeting tab to start video calls.</div>`;
            messages.appendChild(responseDiv);
            messages.scrollTop = messages.scrollHeight;
        }, 500);
        
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
    }
};

// Meeting functionality
window.startMeeting = function() {
    const selectedMembers = [];
    const checkboxes = document.querySelectorAll('.member-item input[type="checkbox"]:checked');
    checkboxes.forEach(cb => selectedMembers.push(cb.value));
    
    const enlargeScreen = document.getElementById('enlarge-screen').checked;
    const enableVideo = document.getElementById('enable-video').checked;
    const enableAudio = document.getElementById('enable-audio').checked;
    const screenShare = document.getElementById('screen-share').checked;
    
    if (selectedMembers.length === 0) {
        alert('Please select at least one member to invite to the meeting.');
        return;
    }
    
    // Update status
    document.getElementById('meeting-status').textContent = `Starting meeting with ${selectedMembers.join(', ')}...`;
    document.getElementById('start-meeting-btn').style.display = 'none';
    document.getElementById('join-meeting-btn').style.display = 'block';
    
    // Show meeting interface
    document.getElementById('meeting-interface').style.display = 'block';
    
    // Enlarge screen if selected
    if (enlargeScreen) {
        mount.style.cssText = `
            position: fixed; top: 0; left: 0; 
            width: 100vw; height: 100vh; z-index: 10000;
        `;
    }
    
    // Add participant videos
    const participantsContainer = document.getElementById('participants-videos');
    selectedMembers.forEach(member => {
        const participantDiv = document.createElement('div');
        participantDiv.innerHTML = `
            <div style="background: #374151; border-radius: 8px; padding: 20px; margin: 8px; text-align: center; color: white;">
                <div class="avatar" style="margin: 0 auto 8px;">${member.charAt(0).toUpperCase()}</div>
                <div style="font-size: 12px;">${member}</div>
                <div style="font-size: 10px; opacity: 0.7;">${enableVideo ? '📹' : '🔇'} ${enableAudio ? '🎤' : '🔇'}</div>
            </div>
        `;
        participantsContainer.appendChild(participantDiv);
    });
    
    isMeetingActive = true;
    
    // Show success notification
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                   background: #059669; color: white; padding: 12px 20px; border-radius: 8px; 
                   z-index: 10001; font-weight: bold;">
            🎉 Meeting started with ${selectedMembers.length} members! ${enlargeScreen ? '(Enlarged View)' : ''}
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};

window.joinMeeting = function() {
    alert('🎯 Joining meeting... This would connect to the Nextcloud Talk room.');
};

window.endMeeting = function() {
    document.getElementById('meeting-interface').style.display = 'none';
    document.getElementById('start-meeting-btn').style.display = 'block';
    document.getElementById('join-meeting-btn').style.display = 'none';
    document.getElementById('meeting-status').textContent = 'Ready to start';
    document.getElementById('participants-videos').innerHTML = '';
    
    // Reset widget size
    mount.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        width: 400px; height: 600px;
    `;
    
    isMeetingActive = false;
};

// Meeting controls
window.toggleMute = function() {
    alert('🎤 Microphone toggled');
};

window.toggleVideo = function() {
    alert('📹 Video toggled');
};

window.toggleScreenShare = function() {
    alert('🖥️ Screen share toggled');
};

// Gemini AI functionality
const GEMINI_API_KEY = 'AIzaSyCK1OPSmlb3rxBd_d7a0B3WK43RaksoxUE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

window.sendAIMessage = async function() {
    const input = document.getElementById('ai-input');
    const messages = document.getElementById('ai-messages');
    
    if (!input.value.trim()) return;
    
    const userMessage = input.value.trim();
    input.value = '';
    
    // Add user message
    const userDiv = document.createElement('div');
    userDiv.innerHTML = `<div class="message-bubble user"><strong>You:</strong> ${userMessage}</div>`;
    messages.appendChild(userDiv);
    messages.scrollTop = messages.scrollHeight;
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            const aiDiv = document.createElement('div');
            aiDiv.innerHTML = `<div class="message-bubble ai"><strong>Gemini AI:</strong> ${aiResponse}</div>`;
            messages.appendChild(aiDiv);
        } else {
            throw new Error('API Error');
        }
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="message-bubble ai"><strong>Gemini AI:</strong> Sorry, I encountered an error. Please try again.</div>`;
        messages.appendChild(errorDiv);
    }
    
    messages.scrollTop = messages.scrollHeight;
};

// Add enter key support
document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendChatMessage();
});

document.getElementById('ai-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendAIMessage();
});

// Success notification
const successNotification = document.createElement('div');
successNotification.innerHTML = `
    <div style="position: fixed; top: 20px; left: 20px; background: #059669; color: white; 
               padding: 15px 20px; border-radius: 8px; z-index: 10001; font-weight: bold;
               box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
        ✅ Smart Talk Widget Activated! Features: Chat, Meetings with Member Selection, Screen Enlargement, and Gemini AI
    </div>
`;
document.body.appendChild(successNotification);
setTimeout(() => successNotification.remove(), 5000);

console.log('✅ Smart Talk Widget successfully activated with all meeting features!');