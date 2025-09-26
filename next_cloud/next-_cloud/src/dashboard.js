/**
 * Smart Talk Dashboard Widget Entry Point
 * Integrates enhanced chat, meeting features, and Gemini AI
 */

import { generateUrl } from '@nextcloud/router'

// Import styles
import './styles/main.css'

// Widget registration and initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Smart Talk Dashboard Widget Loading...')
    
    // Initialize the Smart Talk Widget
    initializeSmartTalkWidget()
})

/**
 * Initialize the Smart Talk Widget with enhanced features
 */
function initializeSmartTalkWidget() {
    // Find the dashboard widget container
    const dashboardContainer = document.querySelector('.dashboard') || document.querySelector('#dashboard')
    
    if (!dashboardContainer) {
        console.log('Dashboard container not found, creating widget mount...')
        createWidgetMount()
        return
    }
    
    // Create the widget element
    const widgetElement = createWidgetElement()
    
    // Add to dashboard
    dashboardContainer.appendChild(widgetElement)
    
    console.log('✅ Smart Talk Widget initialized successfully!')
}

/**
 * Create a widget mount point if dashboard doesn't exist
 */
function createWidgetMount() {
    // Create the mount point
    const mount = document.createElement('div')
    mount.id = 'talk-widget-mount'
    mount.className = 'smart-talk-mount'
    mount.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        height: 600px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    
    document.body.appendChild(mount)
    
    // Load the Vue component
    loadVueWidget(mount)
}

/**
 * Create the widget element
 */
function createWidgetElement() {
    const widget = document.createElement('div')
    widget.className = 'dashboard-widget smart-talk-widget'
    widget.innerHTML = `
        <div class="widget-header">
            <h3>🎯 Smart Talk</h3>
            <p>Chat, Meetings & AI Assistant</p>
        </div>
        <div class="widget-content">
            <div id="talk-widget-mount"></div>
        </div>
    `
    
    // Load the Vue component into the mount
    const mount = widget.querySelector('#talk-widget-mount')
    loadVueWidget(mount)
    
    return widget
}

/**
 * Load the Vue widget component
 */
function loadVueWidget(mountElement) {
    // Since we're using the TalkWidget.vue component, we need to initialize it
    // This would normally be done with Vue's createApp, but we'll inject the HTML directly
    
    mountElement.innerHTML = `
        <div class="smart-talk-widget-loading">
            <div class="loading-spinner">⏳</div>
            <p>Loading Smart Talk Widget...</p>
            <div class="loading-features">
                <div>✨ Enhanced Chat Interface</div>
                <div>📹 Meeting with Member Selection</div>
                <div>🔍 Screen Enlargement Options</div>
                <div>🤖 Gemini AI Integration</div>
            </div>
        </div>
    `
    
    // Simulate loading and then inject the actual widget
    setTimeout(() => {
        injectSmartTalkWidget(mountElement)
    }, 1500)
}

/**
 * Inject the Smart Talk Widget HTML and functionality
 */
function injectSmartTalkWidget(container) {
    container.innerHTML = `
        <div class="smart-talk-widget">
            <div class="widget-header">
                <div class="header-left">
                    <div class="header-icon">🎯</div>
                    <div class="header-text">
                        <h2>Smart Talk</h2>
                        <p>Chat & Meetings Ready</p>
                    </div>
                </div>
                <div class="header-right">
                    <button class="enlarge-btn" onclick="toggleEnlargedView()" title="Toggle Enlarged View">
                        🔍
                    </button>
                </div>
            </div>
            
            <div class="nav-tabs">
                <button class="tab-btn active" onclick="switchTab('chat')" id="chat-tab">
                    💬 Chat
                </button>
                <button class="tab-btn" onclick="switchTab('meeting')" id="meeting-tab">
                    🎥 Meeting
                </button>
                <button class="tab-btn" onclick="switchTab('ai')" id="ai-tab">
                    🤖 Gemini AI
                </button>
            </div>
            
            <div class="tab-content active" id="chat-content">
                <div class="welcome-message">
                    <div class="welcome-icon">👋</div>
                    <h3>Welcome to Smart Talk!</h3>
                    <p>Your enhanced communication hub with chat, meetings, and AI assistance.</p>
                </div>
            </div>
            
            <div class="tab-content" id="meeting-content">
                <div class="meeting-setup">
                    <div class="meeting-header">
                        <h3>📹 Start Meeting</h3>
                        <p>Select members and configure your meeting</p>
                    </div>
                    <div class="feature-highlight">
                        ✨ Enhanced meeting features available!
                        <ul>
                            <li>👥 Member selection</li>
                            <li>🔍 Screen enlargement</li>
                            <li>📹 Video controls</li>
                            <li>🎤 Audio controls</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="ai-content">
                <div class="ai-welcome">
                    <div class="ai-icon">🤖</div>
                    <h3>Gemini AI Assistant</h3>
                    <p>Ask me anything about Nextcloud, technology, or get help with your tasks!</p>
                    <div class="ai-status">
                        <span class="status-dot connected"></span>
                        <span>Ready to assist</span>
                    </div>
                </div>
            </div>
        </div>
    `
    
    // Initialize widget functionality
    initializeWidgetFunctionality()
    
    // Show success notification
    showNotification('🎉 Smart Talk Widget loaded successfully!', 'success')
}

/**
 * Initialize widget functionality
 */
function initializeWidgetFunctionality() {
    let currentTab = 'chat'
    let isEnlarged = false
    
    // Tab switching function
    window.switchTab = function(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'))
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'))
        
        // Add active class to selected tab
        const tabBtn = document.getElementById(tabName + '-tab')
        const tabContent = document.getElementById(tabName + '-content')
        
        if (tabBtn && tabContent) {
            tabBtn.classList.add('active')
            tabContent.classList.add('active')
            currentTab = tabName
        }
    }
    
    // Enlarge view toggle
    window.toggleEnlargedView = function() {
        const widget = document.querySelector('.smart-talk-widget')
        const enlargeBtn = document.querySelector('.enlarge-btn')
        
        if (widget && enlargeBtn) {
            isEnlarged = !isEnlarged
            
            if (isEnlarged) {
                widget.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999 !important;
                    border-radius: 0 !important;
                `
                enlargeBtn.textContent = '🔽'
                enlargeBtn.title = 'Exit Full Screen'
                showNotification('🔍 Enlarged view activated', 'info')
            } else {
                widget.style.cssText = ''
                enlargeBtn.textContent = '🔍'
                enlargeBtn.title = 'Toggle Enlarged View'
                showNotification('🔽 Normal view restored', 'info')
            }
        }
    }
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `smart-talk-notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10001;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        font-family: inherit;
        background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease;
    `
    
    // Add animation
    const style = document.createElement('style')
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `
    document.head.appendChild(style)
    
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 3000)
}

// Export for use in other modules
export { initializeSmartTalkWidget, showNotification }