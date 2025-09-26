// COPY AND PASTE THIS ENTIRE CODE IN YOUR NEXTCLOUD CONSOLE TO ADD GEMINI AI

console.log('🤖 Adding Gemini AI to Smart Talk Widget...');

// Find the existing widget mount
const mount = document.getElementById('talk-widget-mount');
if (!mount) {
    alert('❌ Smart Talk widget not found! Please make sure it is open first.');
} else {
    // Clear existing content
    mount.innerHTML = '';
    
    // Add enhanced widget with Gemini AI
    mount.innerHTML = `
        <div class="chat-widget">
            <div class="header">
                <div class="title">
                    <span>🤖</span>
                    <div>
                        <h2>Smart Talk</h2>
                        <p id="widget-status">Gemini AI Ready</p>
                    </div>
                </div>
                <div class="controls">
                    <button onclick="this.closest('.chat-widget').style.display='none'">✖️</button>
                </div>
            </div>
            <div class="body">
                <div class="tabs">
                    <button class="tab" id="talk-tab" onclick="switchTab('talk')">💬 Talk</button>
                    <button class="tab active" id="ai-tab" onclick="switchTab('ai')">🤖 Gemini AI</button>
                </div>
                
                <!-- Talk Tab Content -->
                <div class="content" id="talk-content" style="display: none;">
                    <div class="messages" id="talk-messages">
                        <div class="message">
                            <div class="avatar">💬</div>
                            <div class="bubble">
                                <div class="meta">System</div>
                                <div>Welcome to Smart Talk! Switch to AI tab for Gemini assistance.</div>
                            </div>
                        </div>
                    </div>
                    <div class="input-area">
                        <input type="text" id="talk-input" placeholder="Type your message..." />
                        <button onclick="sendTalkMessage()">Send</button>
                    </div>
                </div>

                <!-- AI Tab Content -->
                <div class="content" id="ai-content">
                    <div class="ai-status-bar">
                        <span class="status-indicator connected"></span>
                        <span>Gemini AI Ready</span>
                        <button class="clear-btn" onclick="clearAIChat()">🗑️ Clear</button>
                        <button class="debug-btn" onclick="showAPIDebug()" style="margin-left: 8px; font-size: 10px;">🔍 Debug</button>
                    </div>
                    <div class="messages ai-messages" id="ai-messages">
                        <div class="message ai">
                            <div class="avatar ai-avatar">🤖</div>
                            <div class="bubble ai-bubble">
                                <div class="meta">Gemini AI <span class="ai-badge">Assistant</span></div>
                                <div>Hello! I'm Gemini AI integrated into your Smart Talk widget. I can help you with questions about Nextcloud, technology, or anything else. How can I assist you today?</div>
                            </div>
                        </div>
                    </div>
                    <div class="input-area ai-input-area">
                        <input type="text" id="ai-input" placeholder="Ask Gemini AI anything..." />
                        <button id="ai-send-btn" onclick="sendAIMessage()">🚀 Send</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add comprehensive styles
    const style = document.createElement('style');
    style.innerHTML = `
        .chat-widget { 
            width: 400px; border-radius: 16px; padding: 16px; background: white; 
            border: 1px solid #e0e0e0; box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .header { 
            display: flex; justify-content: space-between; align-items: center; 
            margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;
        }
        .title { display: flex; align-items: center; gap: 10px; }
        .title h2 { margin: 0; font-size: 16px; color: #333; }
        .title p { margin: 0; font-size: 12px; color: #667eea; font-weight: bold; }
        .controls button { 
            border: none; background: #dc3545; color: white; padding: 6px 8px; 
            border-radius: 6px; cursor: pointer; font-size: 12px;
        }
        
        .body { height: 450px; display: flex; flex-direction: column; }
        
        .tabs { display: flex; gap: 8px; margin-bottom: 12px; }
        .tab { 
            flex: 1; padding: 10px 12px; border: 1px solid #e0e0e0; background: #f5f5f5; 
            color: #666; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s;
        }
        .tab:hover { background: #e9ecef; }
        .tab.active { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; border-color: #667eea; 
        }
        
        .content { flex: 1; display: flex; flex-direction: column; }
        
        .ai-status-bar {
            display: flex; align-items: center; gap: 8px; padding: 8px 12px;
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
            border-radius: 8px; margin-bottom: 8px; font-size: 12px;
        }
        .status-indicator {
            width: 8px; height: 8px; border-radius: 50%;
        }
        .status-indicator.connected {
            background: #4caf50; box-shadow: 0 0 6px #4caf50;
        }
        .clear-btn {
            margin-left: auto; background: none; border: 1px solid #ddd;
            padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;
        }
        .debug-btn {
            background: none; border: 1px solid #667eea; color: #667eea;
            padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 10px;
        }
        
        .messages { 
            flex: 1; overflow-y: auto; padding: 8px; max-height: 300px;
            border-radius: 8px; margin-bottom: 8px;
        }
        .ai-messages {
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
        }
        
        .message { display: flex; gap: 8px; margin: 12px 0; align-items: flex-start; }
        .message.user { flex-direction: row-reverse; }
        
        .avatar { 
            width: 32px; height: 32px; border-radius: 50%; background: #007bff; 
            color: white; display: flex; align-items: center; justify-content: center; 
            font-size: 14px; flex-shrink: 0; font-weight: bold;
        }
        .ai-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-size: 16px;
        }
        
        .bubble { 
            background: white; border: 1px solid #e0e0e0; border-radius: 12px; 
            padding: 10px 14px; max-width: 280px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .ai-bubble {
            background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
            border: 2px solid #e3f2fd; max-width: 320px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }
        .message.user .bubble { 
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); 
            color: white; border-color: #007bff; 
        }
        
        .message-content {
            font-size: 14px;
            line-height: 1.4;
            color: #333;
            word-wrap: break-word;
            display: block;
            margin-top: 4px;
        }
        .message.user .message-content {
            color: white;
        }
        .ai-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 2px 6px; border-radius: 10px; font-size: 9px;
        }
        
        .input-area { display: flex; gap: 8px; align-items: stretch; }
        .ai-input-area {
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
            padding: 12px; border-radius: 8px; margin: -4px;
        }
        
        input[type="text"] { 
            flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; 
            border-radius: 8px; background: white; color: #333; font-size: 14px;
        }
        #ai-input {
            border: 2px solid #e3f2fd;
            background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
        }
        input[type="text"]:focus { 
            border-color: #667eea; outline: none; 
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        button { 
            padding: 12px 18px; border: none; color: white; 
            border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;
            transition: all 0.2s ease;
        }
        .input-area button { background: #007bff; }
        .input-area button:hover { background: #0056b3; transform: translateY(-1px); }
        #ai-send-btn { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        #ai-send-btn:hover { 
            transform: translateY(-1px); 
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        #ai-send-btn:disabled {
            opacity: 0.6; cursor: not-allowed; transform: none;
        }
        
        .ai-typing {
            display: flex; align-items: center; gap: 8px; padding: 12px;
            font-style: italic; color: #667eea;
        }
        .typing-dots {
            display: flex; gap: 4px;
        }
        .typing-dots span {
            width: 6px; height: 6px; border-radius: 50%; background: #667eea;
            animation: typing 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-8px); opacity: 1; }
        }
        
        /* Markdown styles for AI responses */
        .ai-bubble strong { color: #5e35b1; }
        .ai-bubble em { color: #7b1fa2; }
        .ai-bubble code {
            background: rgba(102, 126, 234, 0.1); color: #5e35b1;
            padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;
        }
        .ai-bubble pre {
            background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px;
            padding: 10px; margin: 8px 0; overflow-x: auto; font-size: 12px;
        }
        .ai-bubble ul, .ai-bubble ol { margin: 8px 0; padding-left: 16px; }
        .ai-bubble li { margin: 4px 0; }
        .ai-bubble a { color: #667eea; text-decoration: none; }
        .ai-bubble a:hover { text-decoration: underline; }
    `;
    document.head.appendChild(style);
    
    // Global variables
    let currentTab = 'ai';
    let aiLoading = false;
    const GEMINI_API_KEY = 'AIzaSyCK1OPSmlb3rxBd_d7a0B3WK43RaksoxUE';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    
    // Tab switching function
    window.switchTab = function(tab) {
        currentTab = tab;
        
        // Update tab appearance
        document.getElementById('talk-tab').classList.toggle('active', tab === 'talk');
        document.getElementById('ai-tab').classList.toggle('active', tab === 'ai');
        
        // Update content visibility
        document.getElementById('talk-content').style.display = tab === 'talk' ? 'flex' : 'none';
        document.getElementById('ai-content').style.display = tab === 'ai' ? 'flex' : 'none';
        
        // Update widget status
        const status = document.getElementById('widget-status');
        status.textContent = tab === 'ai' ? 'Gemini AI Ready' : 'Talk Mode';
        status.style.color = tab === 'ai' ? '#667eea' : '#28a745';
    };
    
    // Talk messaging function
    window.sendTalkMessage = function() {
        const input = document.getElementById('talk-input');
        const messages = document.getElementById('talk-messages');
        
        if (input.value.trim()) {
            // Add user message
            messages.innerHTML += `
                <div class="message user">
                    <div class="avatar">👤</div>
                    <div class="bubble">
                        <div class="meta">You</div>
                        <div>${input.value}</div>
                    </div>
                </div>
            `;
            
            // Add response
            setTimeout(() => {
                messages.innerHTML += `
                    <div class="message">
                        <div class="avatar">💬</div>
                        <div class="bubble">
                            <div class="meta">Talk Bot</div>
                            <div>Message received! Try the AI tab for intelligent responses.</div>
                        </div>
                    </div>
                `;
                messages.scrollTop = messages.scrollHeight;
            }, 500);
            
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
        }
    };
    
    // Enhanced markdown rendering
    function renderMarkdown(text) {
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/^- (.*)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
            .replace(/\n/g, '<br>');
        return html;
    }
    
    // AI messaging function with rate limiting protection
    window.sendAIMessage = async function() {
        const input = document.getElementById('ai-input');
        const messages = document.getElementById('ai-messages');
        const sendBtn = document.getElementById('ai-send-btn');
        
        if (!input.value.trim() || aiLoading) return;
        
        const userMessage = input.value.trim();
        input.value = '';
        aiLoading = true;
        sendBtn.disabled = true;
        sendBtn.textContent = '⏳ Sending...';
        
        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add user message immediately
        const userDiv = document.createElement('div');
        userDiv.className = 'message user';
        
        const userAvatar = document.createElement('div');
        userAvatar.className = 'avatar';
        userAvatar.textContent = '👤';
        
        const userBubble = document.createElement('div');
        userBubble.className = 'bubble';
        
        const userMeta = document.createElement('div');
        userMeta.className = 'meta';
        userMeta.textContent = 'You';
        
        const userContent = document.createElement('div');
        userContent.className = 'message-content';
        userContent.textContent = userMessage;
        
        userBubble.appendChild(userMeta);
        userBubble.appendChild(userContent);
        userDiv.appendChild(userAvatar);
        userDiv.appendChild(userBubble);
        messages.appendChild(userDiv);
        messages.scrollTop = messages.scrollHeight;
        
        // Add typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-typing';
        typingDiv.innerHTML = `
            <div class="avatar ai-avatar">🤖</div>
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
            <span>Gemini is thinking...</span>
        `;
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;
        
        try {
            const contextPrompt = `Context: You are Gemini AI integrated into Nextcloud Smart Talk widget. You're helping users with their questions and tasks. Be helpful, concise, and professional. Format your responses with markdown when appropriate.

User question: ${userMessage}

Please provide a helpful response:`;

            // Add additional delay before API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: contextPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                        candidateCount: 1
                    },
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_HATE_SPEECH',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        }
                    ]
                })
            });

            // Remove typing indicator
            typingDiv.remove();

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('API endpoint not found. Please check the API URL and try again.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                } else {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from Gemini API');
            }

            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // Add AI response
            const aiDiv = document.createElement('div');
            aiDiv.className = 'message ai';
            
            const aiAvatar = document.createElement('div');
            aiAvatar.className = 'avatar ai-avatar';
            aiAvatar.textContent = '🤖';
            
            const aiBubble = document.createElement('div');
            aiBubble.className = 'bubble ai-bubble';
            
            const aiMeta = document.createElement('div');
            aiMeta.className = 'meta';
            aiMeta.innerHTML = 'Gemini AI <span class="ai-badge">Assistant</span>';
            
            const aiContent = document.createElement('div');
            aiContent.className = 'message-content';
            aiContent.innerHTML = renderMarkdown(aiResponse);
            
            aiBubble.appendChild(aiMeta);
            aiBubble.appendChild(aiContent);
            aiDiv.appendChild(aiAvatar);
            aiDiv.appendChild(aiBubble);
            messages.appendChild(aiDiv);
            
        } catch (error) {
            // Remove typing indicator if it exists
            if (typingDiv && typingDiv.parentNode) {
                typingDiv.remove();
            }
            
            console.error('Gemini AI Error:', error);
            
            let errorMessage = error.message;
            if (error.message.includes('404')) {
                errorMessage = 'Service temporarily unavailable. Please check your connection and try again.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Too many requests. Please wait 30 seconds before trying again.';
            }
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai';
            
            const errorAvatar = document.createElement('div');
            errorAvatar.className = 'avatar ai-avatar';
            errorAvatar.textContent = '🤖';
            
            const errorBubble = document.createElement('div');
            errorBubble.className = 'bubble ai-bubble';
            
            const errorMeta = document.createElement('div');
            errorMeta.className = 'meta';
            errorMeta.innerHTML = 'Gemini AI <span class="ai-badge">Error</span>';
            
            const errorContent = document.createElement('div');
            errorContent.className = 'message-content';
            errorContent.textContent = errorMessage;
            
            errorBubble.appendChild(errorMeta);
            errorBubble.appendChild(errorContent);
            errorDiv.appendChild(errorAvatar);
            errorDiv.appendChild(errorBubble);
            messages.appendChild(errorDiv);
        } finally {
            aiLoading = false;
            sendBtn.disabled = false;
            sendBtn.textContent = '🚀 Send';
            messages.scrollTop = messages.scrollHeight;
            
            // Add cooldown period to prevent rapid requests
            setTimeout(() => {
                sendBtn.style.opacity = '1';
            }, 2000);
            sendBtn.style.opacity = '0.7';
        }
    };
    
    // Show API debug info function
    window.showAPIDebug = function() {
        const debugInfo = `
🔍 GEMINI API DEBUG INFO:
━━━━━━━━━━━━━━━━━━━━━━━━
📋 API Key: ${GEMINI_API_KEY}
🌐 API URL: ${GEMINI_API_URL}
📊 Status: ${aiLoading ? 'Currently Processing' : 'Ready'}

API Key Format: ${GEMINI_API_KEY.startsWith('AIza') && GEMINI_API_KEY.length === 39 ? '✅ Correct' : '❌ Invalid'}
API Key Length: ${GEMINI_API_KEY.length} characters

To test API directly, copy and paste this in console:
fetch('${GEMINI_API_URL}?key=${GEMINI_API_KEY}', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    contents: [{parts: [{text: 'Hello'}]}]
  })
}).then(r => r.json()).then(console.log)
        `;
        
        alert(debugInfo);
        console.log(debugInfo);
    };
    
    // Clear AI chat function
    window.clearAIChat = function() {
        const messages = document.getElementById('ai-messages');
        messages.innerHTML = `
            <div class="message ai">
                <div class="avatar ai-avatar">🤖</div>
                <div class="bubble ai-bubble">
                    <div class="meta">Gemini AI <span class="ai-badge">Assistant</span></div>
                    <div>Hello! I'm Gemini AI. How can I help you today?</div>
                </div>
            </div>
        `;
    };
    
    // Add enter key support for both inputs
    document.getElementById('talk-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendTalkMessage();
    });
    
    document.getElementById('ai-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendAIMessage();
    });
    
    // Show success notification
    const toast = document.createElement('div');
    toast.textContent = '🤖 SUCCESS: Gemini AI integrated into Smart Talk!';
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; padding: 15px 20px; border-radius: 8px; z-index: 10001; 
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const keyframes = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    const animationStyle = document.createElement('style');
    animationStyle.textContent = keyframes;
    document.head.appendChild(animationStyle);
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
    
    console.log('✅ DONE: Gemini AI successfully integrated!');
}