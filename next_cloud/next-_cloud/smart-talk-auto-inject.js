// SMART TALK ENHANCED WIDGET - AUTO INJECTOR
// This script automatically injects the enhanced widget into Nextcloud

(function() {
    'use strict';
    
    console.log('🚀 Smart Talk Enhanced Widget Loading...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        setTimeout(injectWidget, 2000);
    }
    
    function injectWidget() {
        // Remove existing widget
        const existing = document.getElementById('smart-talk-enhanced');
        if (existing) existing.remove();
        
        // Create widget container
        const widget = document.createElement('div');
        widget.id = 'smart-talk-enhanced';
        widget.innerHTML = `
            <div class="header">
                <div class="title">🎯 Smart Talk Enhanced</div>
                <div class="controls">
                    <button onclick="toggleEnlarge()">🔍</button>
                    <button onclick="closeWidget()">×</button>
                </div>
            </div>
            <div class="tabs">
                <button class="tab active" onclick="switchTab('chat')">💬 Chat</button>
                <button class="tab" onclick="switchTab('meeting')">🎥 Meeting</button>
                <button class="tab" onclick="switchTab('ai')">🤖 AI</button>
            </div>
            <div class="content">
                <div class="panel active" id="chat">
                    <div class="welcome">👋 Enhanced Chat Ready!</div>
                </div>
                <div class="panel" id="meeting">
                    <div class="meeting-setup">
                        <h3>📹 Start Meeting</h3>
                        <div class="members">
                            <label><input type="checkbox" value="admin"> Admin</label>
                            <label><input type="checkbox" value="aashu"> Aashu</label>
                            <label><input type="checkbox" value="adithya"> Adithya</label>
                            <label><input type="checkbox" value="dhanush"> Dhanush</label>
                        </div>
                        <div class="options">
                            <label><input type="checkbox" id="enlarge-on-start"> 🔍 Enlarge on Start</label>
                        </div>
                        <button onclick="startMeeting()">🚀 Start Meeting</button>
                    </div>
                    <div class="meeting-active" id="meeting-active" style="display: none;">
                        <h3>📹 Meeting Active</h3>
                        <div class="participants" id="participants"></div>
                        <div class="controls">
                            <button onclick="endMeeting()">📞 End</button>
                        </div>
                    </div>
                </div>
                <div class="panel" id="ai">
                    <div class="ai-messages" id="ai-messages">
                        <div class="ai-welcome">🤖 Gemini AI Ready!</div>
                    </div>
                    <div class="ai-input">
                        <input type="text" id="ai-input" placeholder="Ask Gemini...">
                        <button onclick="sendAI()">Send</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #smart-talk-enhanced {
                position: fixed; top: 20px; right: 20px; width: 400px; height: 600px;
                background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                z-index: 10000; font-family: system-ui; display: flex; flex-direction: column;
            }
            #smart-talk-enhanced.enlarged {
                top: 0!important; left: 0!important; width: 100vw!important; height: 100vh!important;
                border-radius: 0!important; z-index: 9999!important;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 16px; display: flex; justify-content: space-between;
            }
            .header button {
                background: rgba(255,255,255,0.2); border: none; color: white;
                padding: 6px 10px; border-radius: 6px; cursor: pointer;
            }
            .tabs {
                display: flex; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
            }
            .tab {
                flex: 1; padding: 12px; border: none; background: transparent;
                cursor: pointer; color: #64748b;
            }
            .tab.active { background: white; color: #667eea; border-bottom: 2px solid #667eea; }
            .content { flex: 1; overflow: hidden; }
            .panel { padding: 16px; height: 100%; display: none; flex-direction: column; }
            .panel.active { display: flex; }
            .welcome, .ai-welcome { text-align: center; padding: 40px 20px; font-size: 18px; }
            .meeting-setup { display: flex; flex-direction: column; gap: 16px; }
            .members { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .members label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
            .meeting-setup button {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white; border: none; padding: 14px 28px; border-radius: 12px;
                font-size: 16px; cursor: pointer;
            }
            .ai-messages { flex: 1; overflow-y: auto; background: #f8fafc; border-radius: 8px; margin-bottom: 12px; }
            .ai-input { display: flex; gap: 8px; }
            .ai-input input { flex: 1; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; }
            .ai-input button { background: #667eea; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
            .participants { background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; }
        `;
        document.head.appendChild(style);
        
        // Position and add to page
        document.body.appendChild(widget);
        
        // Initialize functionality
        initFunctions();
        
        showNotification('🎉 Smart Talk Enhanced Widget Loaded!');
        console.log('✅ Widget injected successfully!');
    }
    
    function initFunctions() {
        let isEnlarged = false;
        let selectedMembers = [];
        
        window.switchTab = function(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
            document.getElementById(tab).classList.add('active');
        };
        
        window.toggleEnlarge = function() {
            const widget = document.getElementById('smart-talk-enhanced');
            isEnlarged = !isEnlarged;
            widget.classList.toggle('enlarged', isEnlarged);
            showNotification(isEnlarged ? '🔍 Enlarged' : '🔽 Normal');
        };
        
        window.closeWidget = function() {
            document.getElementById('smart-talk-enhanced').style.display = 'none';
        };
        
        window.startMeeting = function() {
            const checkboxes = document.querySelectorAll('.members input:checked');
            selectedMembers = Array.from(checkboxes).map(cb => cb.value);
            
            if (selectedMembers.length === 0) {
                alert('Please select members!');
                return;
            }
            
            if (document.getElementById('enlarge-on-start').checked) {
                toggleEnlarge();
            }
            
            document.querySelector('.meeting-setup').style.display = 'none';
            document.getElementById('meeting-active').style.display = 'block';
            
            const participants = document.getElementById('participants');
            participants.innerHTML = selectedMembers.map(member => 
                `<div style="background: #374151; color: white; padding: 12px; border-radius: 8px; text-align: center; margin: 4px;">
                    ${member.charAt(0).toUpperCase()}<br>${member}
                </div>`
            ).join('');
            
            showNotification(`🎉 Meeting started with ${selectedMembers.length} members!`);
        };
        
        window.endMeeting = function() {
            document.querySelector('.meeting-setup').style.display = 'block';
            document.getElementById('meeting-active').style.display = 'none';
            document.querySelectorAll('.members input').forEach(cb => cb.checked = false);
            if (isEnlarged) toggleEnlarge();
            showNotification('📞 Meeting ended');
        };
        
        window.sendAI = async function() {
            const input = document.getElementById('ai-input');
            const messages = document.getElementById('ai-messages');
            
            if (!input.value.trim()) return;
            
            const userMsg = input.value.trim();
            input.value = '';
            
            // Add user message
            const userDiv = document.createElement('div');
            userDiv.innerHTML = `<div style="background: #3b82f6; color: white; padding: 8px 12px; border-radius: 12px; margin: 8px; max-width: 80%; margin-left: auto;">You: ${userMsg}</div>`;
            messages.appendChild(userDiv);
            
            // Add AI response
            try {
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCK1OPSmlb3rxBd_d7a0B3WK43RaksoxUE', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userMsg }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const aiResp = data.candidates[0].content.parts[0].text;
                    const aiDiv = document.createElement('div');
                    aiDiv.innerHTML = `<div style="background: #f1f5f9; border: 2px solid #e2e8f0; padding: 8px 12px; border-radius: 12px; margin: 8px; max-width: 80%;">🤖: ${aiResp}</div>`;
                    messages.appendChild(aiDiv);
                } else {
                    throw new Error('API Error');
                }
            } catch (error) {
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = `<div style="background: #fef2f2; border: 2px solid #fecaca; padding: 8px 12px; border-radius: 12px; margin: 8px; max-width: 80%; color: #991b1b;">🤖: Error occurred. Please try again.</div>`;
                messages.appendChild(errorDiv);
            }
            
            messages.scrollTop = messages.scrollHeight;
        };
        
        // Add enter key support
        document.getElementById('ai-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendAI();
        });
    }
    
    function showNotification(message) {
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: #059669; color: white; padding: 12px 20px; border-radius: 8px;
            z-index: 10001; font-weight: bold;
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
})();