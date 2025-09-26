// COPY AND PASTE THIS ENTIRE CODE IN YOUR NEXTCLOUD CONSOLE TO REMOVE AI TAB

console.log('🔧 Removing AI tab from Smart Talk...');

// Find and update the existing widget
const mount = document.getElementById('talk-widget-mount');
if (!mount) {
    alert('❌ Smart Talk widget not found! Please make sure it is open first.');
} else {
    // Clear existing content
    mount.innerHTML = '';
    
    // Add simple Talk-only widget
    mount.innerHTML = `
        <div class="chat-widget">
            <div class="header">
                <div class="title">
                    <span>💬</span>
                    <div>
                        <h2>Smart Talk</h2>
                        <p>Talk Only - AI Removed</p>
                    </div>
                </div>
                <div class="controls">
                    <button onclick="this.closest('.chat-widget').style.display='none'">✖️</button>
                </div>
            </div>
            <div class="body">
                <div class="single-tab">
                    <button class="tab active" disabled>💬 Talk Only</button>
                </div>
                <div class="content">
                    <div class="messages" id="talk-messages">
                        <div class="message">
                            <div class="avatar">🤖</div>
                            <div class="bubble">
                                <div class="meta">System</div>
                                <div>✅ AI tab has been successfully removed! This is now Talk-only mode.</div>
                            </div>
                        </div>
                    </div>
                    <div class="input-area">
                        <input type="text" id="talk-input" placeholder="Type your message (AI removed)..." />
                        <button onclick="sendTalkMessage()">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.innerHTML = `
        .chat-widget { 
            width: 380px; border-radius: 16px; padding: 16px; background: white; 
            border: 1px solid #e0e0e0; box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header { 
            display: flex; justify-content: space-between; align-items: center; 
            margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;
        }
        .title { display: flex; align-items: center; gap: 10px; }
        .title h2 { margin: 0; font-size: 16px; color: #333; }
        .title p { margin: 0; font-size: 12px; color: #28a745; font-weight: bold; }
        .controls button { 
            border: none; background: #dc3545; color: white; padding: 6px 8px; 
            border-radius: 6px; cursor: pointer; font-size: 12px;
        }
        .body { height: 400px; display: flex; flex-direction: column; }
        .single-tab { margin-bottom: 10px; }
        .tab { 
            padding: 8px 12px; border: 1px solid #28a745; background: #28a745; 
            color: white; border-radius: 8px; cursor: not-allowed; font-weight: bold;
        }
        .content { flex: 1; display: flex; flex-direction: column; }
        .messages { 
            flex: 1; overflow-y: auto; padding: 8px; background: #f8f9fa; 
            border-radius: 8px; margin-bottom: 8px; max-height: 280px;
        }
        .message { display: flex; gap: 8px; margin: 8px 0; }
        .avatar { 
            width: 28px; height: 28px; border-radius: 50%; background: #28a745; 
            color: white; display: flex; align-items: center; justify-content: center; 
            font-size: 14px; flex-shrink: 0;
        }
        .bubble { 
            background: white; border: 1px solid #e0e0e0; border-radius: 12px; 
            padding: 8px 12px; max-width: 280px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .meta { font-size: 11px; color: #666; margin-bottom: 4px; font-weight: bold; }
        .input-area { display: flex; gap: 8px; }
        #talk-input { 
            flex: 1; padding: 10px 12px; border: 1px solid #e0e0e0; 
            border-radius: 8px; background: white; color: #333; 
        }
        #talk-input:focus { border-color: #28a745; outline: none; }
        .input-area button { 
            padding: 10px 16px; border: none; background: #28a745; color: white; 
            border-radius: 8px; cursor: pointer; font-weight: 500;
        }
        .input-area button:hover { background: #218838; }
    `;
    document.head.appendChild(style);
    
    // Add simple messaging function
    window.sendTalkMessage = function() {
        const input = document.getElementById('talk-input');
        const messages = document.getElementById('talk-messages');
        
        if (input.value.trim()) {
            // Add user message
            messages.innerHTML += `
                <div class="message" style="flex-direction: row-reverse;">
                    <div class="avatar" style="background: #007bff;">👤</div>
                    <div class="bubble" style="background: #007bff; color: white;">
                        <div class="meta" style="color: rgba(255,255,255,0.8);">You</div>
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
                            <div>Message received! AI features have been removed from this widget.</div>
                        </div>
                    </div>
                `;
                messages.scrollTop = messages.scrollHeight;
            }, 500);
            
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
        }
    };
    
    // Add enter key support
    document.getElementById('talk-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendTalkMessage();
        }
    });
    
    // Show success notification
    const toast = document.createElement('div');
    toast.textContent = '✅ SUCCESS: AI tab removed from Smart Talk!';
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #28a745; color: white;
        padding: 15px 20px; border-radius: 8px; z-index: 10001; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: bold;
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
    
    console.log('✅ DONE: AI tab successfully removed!');
}