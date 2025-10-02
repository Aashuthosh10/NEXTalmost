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

    // Also add a floating, draggable launcher + panel on the website itself
    try { initFloatingSmartTalk() } catch (e) { console.warn('Floating SmartTalk init failed', e) }
    // Also expose a simple draggable per requested API (chat-bubble/chat-panel ids)
    try { initSimpleDraggableWidget() } catch (e) { console.warn('Simple draggable init failed', e) }
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

/**
 * Floating Smart Talk (draggable bubble + smart panel placement)
 */
function initFloatingSmartTalk() {
    // Avoid duplicate mounts
    if (document.getElementById('talk-widget-toggle')) return

    const storageKey = 'smartTalkTogglePos'
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
    const vp = () => ({ w: window.innerWidth || document.documentElement.clientWidth, h: window.innerHeight || document.documentElement.clientHeight })

    // Toggle (bubble)
    const toggle = document.createElement('button')
    toggle.id = 'talk-widget-toggle'
    toggle.setAttribute('aria-label', 'Open chat')
    Object.assign(toggle.style, {
        position: 'fixed', right: '22px', bottom: '22px', width: '48px', height: '48px',
        borderRadius: '50%', border: '1px solid rgba(0,0,0,.15)',
        background: 'var(--color-primary, #667eea)', color: 'var(--color-primary-text, #fff)',
        boxShadow: '0 8px 24px rgba(0,0,0,.2)', cursor: 'grab', zIndex: 2147483647,
        pointerEvents: 'auto', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
    })
    toggle.textContent = '💬'
    document.body.appendChild(toggle)

    // Panel mount
    const mount = document.createElement('div')
    mount.id = 'talk-widget-mount'
    Object.assign(mount.style, {
        position: 'fixed', right: '24px', bottom: '82px', zIndex: 2147483646,
        transform: 'scale(0.92) translateY(24px)', opacity: '0',
        transition: 'transform .42s cubic-bezier(0.34,1.56,0.64,1), opacity .32s ease-out'
    })
    document.body.appendChild(mount)

    // Inject lightweight panel content sourced from existing widget HTML
    mount.innerHTML = `
      <div class="smart-talk-widget" style="width:380px; min-height:420px; border:1px solid rgba(0,0,0,.15); border-radius:16px; background: var(--color-main-background, #111); color: var(--color-main-text, #fff); box-shadow: 0 8px 24px rgba(0,0,0,.2);">
        <div class="widget-header header" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; cursor: move; user-select:none">
          <div style="display:flex; gap:10px; align-items:center"><div>🤖</div><strong>Smart Talk</strong></div>
          <div style="display:flex; gap:8px">
            <button id="st-min" style="width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:#6a5acd;color:#fff">−</button>
            <button id="st-close" style="width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:#7c3aed;color:#fff">×</button>
          </div>
        </div>
        <div style="padding:10px 12px; color: var(--color-text-maxcontrast, #cbd5e1)">Launcher ready. Use the dashboard card for full features.</div>
      </div>
    `

    // Restore position
    try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            const pos = JSON.parse(saved)
            if (typeof pos.left === 'number' && typeof pos.top === 'number') {
                toggle.style.left = pos.left + 'px'; toggle.style.top = pos.top + 'px'
                toggle.style.right = ''; toggle.style.bottom = ''
            }
        }
    } catch {}

    // Dragging (pointer events with viewport clamping + smooth transform)
    let dragging = false, moved = 0
    let start = { x: 0, y: 0 }, startPos = { left: 0, top: 0 }
    let frame = 0, pendingDX = 0, pendingDY = 0
    let temporarilyDisabled = []
    const read = () => toggle.getBoundingClientRect()
    const setPos = (l, t) => {
        const r = read(); const { w, h } = vp(); const m = 8
        const cl = clamp(l, m, w - r.width - m), ct = clamp(t, m, h - r.height - m)
        toggle.style.left = cl + 'px'; toggle.style.top = ct + 'px'; toggle.style.right = ''; toggle.style.bottom = ''
        try { localStorage.setItem(storageKey, JSON.stringify({ left: cl, top: ct })) } catch {}
    }
    const applyTransform = () => {
        frame = 0
        toggle.style.transform = `translate3d(${pendingDX}px, ${pendingDY}px, 0)`
    }
    const disableOverlayAtPoint = (x, y) => {
        // disable top overlay elements that intercept pointers at the drag point
        const topEl = document.elementFromPoint(x, y)
        const isBubble = (el) => el && (el === toggle || el === mount || toggle.contains(el) || mount.contains(el))
        if (topEl && !isBubble(topEl)) {
            const prev = topEl.style.pointerEvents
            temporarilyDisabled.push({ el: topEl, prev })
            topEl.style.pointerEvents = 'none'
        }
    }
    const restoreOverlays = () => {
        temporarilyDisabled.forEach(({ el, prev }) => { try { el.style.pointerEvents = prev || '' } catch {} })
        temporarilyDisabled = []
    }
    const onDown = (e) => {
        e.preventDefault(); dragging = true; moved = 0; toggle.style.cursor = 'grabbing'
        toggle.style.transition = 'transform .0s'
        start = { x: e.clientX, y: e.clientY }; const r = read(); startPos = { left: r.left, top: r.top }
        disableOverlayAtPoint(start.x, start.y)
        if (toggle.setPointerCapture) { try { toggle.setPointerCapture(e.pointerId) } catch {} }
    }
    const onMove = (e) => {
        if (!dragging) return; e.preventDefault()
        const dx = e.clientX - start.x, dy = e.clientY - start.y; moved += Math.abs(dx) + Math.abs(dy)
        pendingDX = dx; pendingDY = dy
        if (!frame) frame = requestAnimationFrame(applyTransform)
    }
    const onUp = (e) => {
        if (!dragging) return
        dragging = false
        toggle.style.cursor = 'grab'
        if (toggle.releasePointerCapture) { try { toggle.releasePointerCapture(e.pointerId) } catch {} }
        // Commit final position with clamp and animate settle
        const finalLeft = startPos.left + pendingDX
        const finalTop = startPos.top + pendingDY
        toggle.style.transition = 'transform .18s ease-out'
        // Smoothly settle to zero transform while updating left/top
        setPos(finalLeft, finalTop)
        requestAnimationFrame(() => { toggle.style.transform = 'translate3d(0,0,0)' })
        pendingDX = 0; pendingDY = 0
        restoreOverlays()
    }
    // capture on element and document to be robust
    toggle.addEventListener('pointerdown', onDown, { passive: false })
    document.addEventListener('pointermove', onMove, { passive: false, capture: true })
    document.addEventListener('pointerup', onUp, { passive: false, capture: true })
    // Mouse/touch fallback
    toggle.addEventListener('mousedown', (e) => onDown(e), { passive: false })
    document.addEventListener('mousemove', onMove, { passive: false, capture: true })
    document.addEventListener('mouseup', onUp, { passive: false, capture: true })
    toggle.addEventListener('touchstart', (e) => { const t = e.touches?.[0]; if (t) onDown({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault(), pointerId: undefined }) }, { passive: false })
    document.addEventListener('touchmove', (e) => { const t = e.touches?.[0]; if (t) onMove({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault() }) }, { passive: false, capture: true })
    document.addEventListener('touchend', (e) => { onUp({ clientX: 0, clientY: 0, pointerId: undefined }) }, { passive: false, capture: true })

    // Global capture: start drag even if overlay is on top
    document.addEventListener('pointerdown', (e) => {
        const r = read();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            onDown(e)
        }
    }, { passive: false, capture: true })

    // Panel placement relative to toggle
    const placePanel = () => {
        const gap = 12; const { w, h } = vp()
        const t = toggle.getBoundingClientRect(); const m = mount.getBoundingClientRect()
        const pw = m.width || 380, ph = m.height || 420
        const openLeft = (t.left + t.width / 2) > (w / 2)
        let left = openLeft ? (t.left - pw - gap) : (t.right + gap)
        let top = (t.top + t.height / 2) - (ph / 2)
        top = clamp(top, 12, h - ph - 12)
        if (left < 8) left = t.right + gap
        if (left + pw > w - 8) left = t.left - pw - gap
        left = clamp(left, 8, w - pw - 8)
        mount.style.left = left + 'px'; mount.style.top = top + 'px'; mount.style.right = ''; mount.style.bottom = ''
    }

    // Open / close
    let opened = false
    const open = () => { placePanel(); mount.style.transform = 'scale(1) translateY(0)'; mount.style.opacity = '1' }
    const close = () => { mount.style.transform = 'scale(0.92) translateY(24px)'; mount.style.opacity = '0' }
    toggle.addEventListener('click', () => { if (moved > 6) { moved = 0; return } opened = !opened; opened ? open() : close() })

    // Dragging the panel by header
    const header = mount.querySelector('.header')
    if (header) {
        let pDrag = false, pStart = { x:0,y:0 }, pMount = { left:0, top:0 }
        let pDX = 0, pDY = 0, pFrame = 0
        const readMount = () => mount.getBoundingClientRect()
        const commitMount = (l,t) => { const { w,h } = vp(); const m = readMount(); const cl = clamp(l,8,w-m.width-8), ct = clamp(t,8,h-m.height-8); Object.assign(mount.style,{ left: cl+'px', top: ct+'px', right:'', bottom:'' }) }
        const applyHeaderTransform = () => { pFrame = 0; mount.style.transform = `translate3d(${pDX}px, ${pDY}px, 0)` }
        header.style.pointerEvents = 'auto'
        header.style.cursor = 'move'
        header.addEventListener('pointerdown', (e) => { pDrag = true; pStart = { x:e.clientX, y:e.clientY }; const r = readMount(); pMount = { left:r.left, top:r.top }; mount.style.transition = 'transform .0s' })
        document.addEventListener('pointermove', (e) => { if (!pDrag) return; e.preventDefault(); pDX = (e.clientX-pStart.x); pDY = (e.clientY-pStart.y); if (!pFrame) pFrame = requestAnimationFrame(applyHeaderTransform) }, { passive: false, capture: true })
        document.addEventListener('pointerup', () => { if (!pDrag) return; pDrag = false; commitMount(pMount.left + pDX, pMount.top + pDY); mount.style.transition = 'transform .18s ease-out'; requestAnimationFrame(() => { mount.style.transform = 'translate3d(0,0,0)' }); pDX = 0; pDY = 0 }, { capture: true })
        // Mouse/touch fallback
        header.addEventListener('mousedown', (e) => { pDrag = true; pStart = { x:e.clientX, y:e.clientY }; const r = readMount(); pMount = { left:r.left, top:r.top }; mount.style.transition = 'transform .0s' }, { passive: false })
        document.addEventListener('mousemove', (e) => { if (!pDrag) return; e.preventDefault(); pDX = (e.clientX-pStart.x); pDY = (e.clientY-pStart.y); if (!pFrame) pFrame = requestAnimationFrame(applyHeaderTransform) }, { passive: false, capture: true })
        document.addEventListener('mouseup', () => { if (!pDrag) return; pDrag = false; commitMount(pMount.left + pDX, pMount.top + pDY); mount.style.transition = 'transform .18s ease-out'; requestAnimationFrame(() => { mount.style.transform = 'translate3d(0,0,0)' }); pDX = 0; pDY = 0 }, { capture: true })
        header.addEventListener('touchstart', (e) => { const t = e.touches?.[0]; if (!t) return; pDrag = true; pStart = { x:t.clientX, y:t.clientY }; const r = readMount(); pMount = { left:r.left, top:r.top }; mount.style.transition = 'transform .0s' }, { passive: false })
        document.addEventListener('touchmove', (e) => { if (!pDrag) return; const t = e.touches?.[0]; if (!t) return; e.preventDefault(); pDX = (t.clientX-pStart.x); pDY = (t.clientY-pStart.y); if (!pFrame) pFrame = requestAnimationFrame(applyHeaderTransform) }, { passive: false, capture: true })
        document.addEventListener('touchend', () => { if (!pDrag) return; pDrag = false; commitMount(pMount.left + pDX, pMount.top + pDY); mount.style.transition = 'transform .18s ease-out'; requestAnimationFrame(() => { mount.style.transform = 'translate3d(0,0,0)' }); pDX = 0; pDY = 0 }, { capture: true })
    }

    // EXTRA: drag the whole panel (except inputs/buttons) for maximum reliability
    const panelRoot = mount.querySelector('.smart-talk-widget')
    if (panelRoot) {
        let rDrag = false, rStart = { x:0,y:0 }, rMount = { left:0, top:0 }, rDX = 0, rDY = 0, rFrame = 0
        const readMount = () => mount.getBoundingClientRect()
        const applyRootTransform = () => { rFrame = 0; mount.style.transform = `translate3d(${rDX}px, ${rDY}px, 0)` }
        const commitRoot = (l,t) => { const { w,h } = vp(); const m = readMount(); const cl = clamp(l,8,w-m.width-8), ct = clamp(t,8,h-m.height-8); Object.assign(mount.style,{ left: cl+'px', top: ct+'px', right:'', bottom:'' }) }
        const isInteractive = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON' || el.isContentEditable)
        panelRoot.addEventListener('pointerdown', (e) => { if (isInteractive(e.target)) return; rDrag = true; rStart = { x:e.clientX, y:e.clientY }; const r = readMount(); rMount = { left:r.left, top:r.top }; mount.style.transition = 'transform .0s' }, { passive:false })
        document.addEventListener('pointermove', (e) => { if (!rDrag) return; e.preventDefault(); rDX = (e.clientX - rStart.x); rDY = (e.clientY - rStart.y); if (!rFrame) rFrame = requestAnimationFrame(applyRootTransform) }, { passive:false, capture:true })
        document.addEventListener('pointerup', () => { if (!rDrag) return; rDrag = false; commitRoot(rMount.left + rDX, rMount.top + rDY); mount.style.transition = 'transform .18s ease-out'; requestAnimationFrame(() => { mount.style.transform = 'translate3d(0,0,0)' }); rDX = 0; rDY = 0 }, { capture:true })
    }

    // Keep bubble as last child to avoid being hidden by later inserts
    try {
        const ensureTop = () => { if (document.body.lastElementChild !== toggle) document.body.appendChild(toggle) }
        ensureTop(); setTimeout(ensureTop, 0); setInterval(ensureTop, 2000)
    } catch {}

    // Re-clamp on resize
    window.addEventListener('resize', () => {
        try { const saved = localStorage.getItem(storageKey); if (saved) { const pos = JSON.parse(saved); setPos(pos.left, pos.top) } } catch {}
        if (opened) placePanel()
    }, { passive: true })
}

/**
 * Simple draggable implementation matching the user's API (chat-bubble/chat-panel)
 */
function initSimpleDraggableWidget() {
    // Create bubble if missing
    let bubble = document.getElementById('chat-bubble')
    if (!bubble) {
        bubble = document.createElement('button')
        bubble.id = 'chat-bubble'
        bubble.setAttribute('aria-label', 'Open chat')
        document.body.appendChild(bubble)
    }
    let panel = document.getElementById('chat-panel')
    if (!panel) {
        panel = document.createElement('div')
        panel.id = 'chat-panel'
        panel.setAttribute('hidden', '')
        document.body.appendChild(panel)
    }

    // Minimal styles to ensure visibility and layering
    Object.assign(bubble.style, {
        position: 'fixed', width: '48px', height: '48px', borderRadius: '50%',
        right: '22px', bottom: '22px', zIndex: 10000, cursor: 'grab',
        userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
    })
    if (!bubble.textContent) bubble.textContent = '💬'
    Object.assign(panel.style, { position: 'fixed', width: '380px', minHeight: '420px', zIndex: 9999 })

    const STORAGE_KEY = 'smartWidgetPos'
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
    const rect = () => bubble.getBoundingClientRect()

    // Restore position
    try {
        const pos = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        if (pos && Number.isFinite(pos.left) && Number.isFinite(pos.top)) {
            bubble.style.left = pos.left + 'px'; bubble.style.top = pos.top + 'px'
            bubble.style.right = ''; bubble.style.bottom = ''
        }
    } catch {}

    // Drag logic (pointer events)
    let dragging = false, moved = 0, sx = 0, sy = 0, sl = 0, st = 0
    const commit = (l, t) => {
        const r = rect(), m = 8
        const L = clamp(l, m, window.innerWidth  - r.width  - m)
        const T = clamp(t, m, window.innerHeight - r.height - m)
        Object.assign(bubble.style, { left: L + 'px', top: T + 'px', right: '', bottom: '' })
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: L, top: T })) } catch {}
    }
    const onDown = (e) => {
        e.preventDefault(); dragging = true; moved = 0; bubble.style.cursor = 'grabbing'
        const r = rect(); sl = r.left; st = r.top; sx = e.clientX; sy = e.clientY
        document.addEventListener('pointermove', onMove, { passive: false, capture: true })
        document.addEventListener('pointerup', onUp, { passive: false, capture: true })
    }
    const onMove = (e) => {
        if (!dragging) return; e.preventDefault()
        const dx = e.clientX - sx, dy = e.clientY - sy; moved += Math.abs(dx) + Math.abs(dy)
        bubble.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
    }
    const onUp = (e) => {
        if (!dragging) return; dragging = false; bubble.style.cursor = 'grab'
        const dx = e.clientX - sx, dy = e.clientY - sy
        bubble.style.transform = 'translate3d(0,0,0)'
        commit(sl + dx, st + dy)
        document.removeEventListener('pointermove', onMove, true)
        document.removeEventListener('pointerup', onUp, true)
    }
    bubble.addEventListener('pointerdown', onDown, { passive: false })

    // Smart panel placement
    const placePanel = () => {
        const b = rect(); const pw = panel.offsetWidth || 380; const ph = panel.offsetHeight || 420; const gap = 12
        let left = (b.left + b.width / 2 > window.innerWidth / 2) ? (b.left - pw - gap) : (b.right + gap)
        let top  = b.top
        if (top + ph > window.innerHeight - 12) top = window.innerHeight - ph - 12
        if (top < 12) top = 12
        if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8
        if (left < 8) left = 8
        Object.assign(panel.style, { left: left + 'px', top: top + 'px' })
    }

    // Toggle panel with positioning (ignore click after drag)
    bubble.addEventListener('click', () => {
        if (moved > 6) { moved = 0; return }
        const hidden = panel.hasAttribute('hidden')
        if (hidden) { placePanel(); panel.removeAttribute('hidden') }
        else { panel.setAttribute('hidden', '') }
    })

    // Re-clamp on resize
    window.addEventListener('resize', () => {
        try { const pos = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (pos) commit(pos.left, pos.top) } catch {}
        if (!panel.hasAttribute('hidden')) placePanel()
    }, { passive: true })
}