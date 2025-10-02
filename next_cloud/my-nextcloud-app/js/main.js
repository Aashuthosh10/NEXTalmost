import { createApp } from 'vue'
import TalkWidget from './components/TalkWidget.vue'
import { createApp as createApp2 } from 'vue'
import NotificationCenter from './components/NotificationCenter.vue'
import { startTalkNotifications } from './services/TalkNotificationService.js'

// Enable Talk/spreed features
const TALK_DISABLED = false
// Guard: don’t mount widget or notifications inside Talk meeting iframes
const isInIframe = (window.self !== window.top)
const isTalkContext = () => {
    try {
        const p = (location.pathname || '').toLowerCase()
        return (p.includes('/apps/spreed') || p.includes('/call/'))
    } catch { return false }
}

const mountWidget = () => {
    if (isInIframe && isTalkContext()) return
	// Ensure toggle exists
	let toggle = document.getElementById('talk-widget-toggle')
	if (!toggle) {
		toggle = document.createElement('button')
		toggle.id = 'talk-widget-toggle'
		toggle.setAttribute('aria-label', 'Open chat')
		Object.assign(toggle.style, {
			position: 'fixed', right: '22px', bottom: '22px', width: '48px', height: '48px',
			borderRadius: '50%', border: '1px solid var(--color-border)',
			background: 'var(--color-primary)', color: 'var(--color-primary-text)',
			boxShadow: '0 8px 24px rgba(0,0,0,.2)', cursor: 'grab', zIndex: 10000,
			pointerEvents: 'auto',
			userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
			display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
		})
		toggle.textContent = '💬'
		document.body.appendChild(toggle)
	}
	// Ensure draggable styles always applied (even if toggle pre-existed)
	try {
		Object.assign(toggle.style, { cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' })
	} catch {}

	// Ensure mount exists
	let mount = document.getElementById('talk-widget-mount')
	if (!mount) {
		mount = document.createElement('div')
		mount.id = 'talk-widget-mount'
		Object.assign(mount.style, {
			position: 'fixed', right: '24px', bottom: '82px', zIndex: 9999,
			transform: 'scale(0.92) translateY(24px)',
			opacity: '0',
			transition: 'transform .42s cubic-bezier(0.34,1.56,0.64,1), opacity .32s ease-out'
		})
		document.body.appendChild(mount)
		createApp(TalkWidget).mount('#talk-widget-mount')

		// Respect reduced motion preferences
		try {
			if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
				mount.style.transition = 'none'
			}
		} catch {}

		// Responsive placement (mobile dock)
		const applyResponsivePlacement = () => {
			try {
				const isNarrow = window.matchMedia && window.matchMedia('(max-width: 680px)').matches
				if (isNarrow) {
					mount.style.right = '12px'
					mount.style.left = '12px'
					mount.style.width = 'auto'
					mount.style.maxWidth = '480px'
					mount.style.bottom = '78px'
				} else {
					mount.style.right = '24px'
					mount.style.left = ''
					mount.style.width = ''
					mount.style.maxWidth = ''
					mount.style.bottom = '82px'
				}
			} catch {}
		}
		applyResponsivePlacement()
		try { window.addEventListener('resize', applyResponsivePlacement, { passive: true }) } catch {}
	}

	// ===== Draggable toggle & dynamic panel placement =====
	const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
	const getViewport = () => ({ width: window.innerWidth || document.documentElement.clientWidth, height: window.innerHeight || document.documentElement.clientHeight })
	const storageKey = 'smartTalkTogglePos'

	// Restore saved position if present
	try {
		const saved = localStorage.getItem(storageKey)
		if (saved) {
			const pos = JSON.parse(saved)
			if (typeof pos.left === 'number' && typeof pos.top === 'number') {
				toggle.style.left = pos.left + 'px'
				toggle.style.top = pos.top + 'px'
				toggle.style.right = ''
				toggle.style.bottom = ''
			}
		}
	} catch {}

	let dragging = false
	let dragStart = { x: 0, y: 0 }
	let startPos = { left: 0, top: 0 }
	let movedPx = 0
	let rafId = 0

	const readTogglePos = () => {
		const rect = toggle.getBoundingClientRect()
		return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
	}

	const setTogglePos = (left, top) => {
		const vp = getViewport()
		const size = readTogglePos()
		const margin = 8
		const clampedLeft = clamp(left, margin, vp.width - size.width - margin)
		const clampedTop = clamp(top, margin, vp.height - size.height - margin)
		toggle.style.left = clampedLeft + 'px'
		toggle.style.top = clampedTop + 'px'
		toggle.style.right = ''
		toggle.style.bottom = ''
		try { localStorage.setItem(storageKey, JSON.stringify({ left: clampedLeft, top: clampedTop })) } catch {}
	}

	const onPointerDown = (x, y) => {
		dragging = true
		movedPx = 0
		toggle.style.transition = 'none'
		toggle.style.cursor = 'grabbing'
		dragStart = { x, y }
		const pos = readTogglePos()
		startPos = { left: pos.left, top: pos.top }
	document.addEventListener('mousemove', onMouseMove, { passive: false })
		document.addEventListener('mouseup', onPointerUp)
		document.addEventListener('touchmove', onTouchMove, { passive: false })
		document.addEventListener('touchend', onPointerUp)
	}

	const onPointerUp = () => {
		dragging = false
		toggle.style.cursor = 'grab'
		cancelAnimationFrame(rafId)
		document.removeEventListener('mousemove', onMouseMove)
		document.removeEventListener('mouseup', onPointerUp)
		document.removeEventListener('touchmove', onTouchMove)
		document.removeEventListener('touchend', onPointerUp)
	}

	const schedulePos = (left, top) => {
		cancelAnimationFrame(rafId)
		rafId = requestAnimationFrame(() => setTogglePos(left, top))
	}

	const onMouseMove = (e) => {
		if (!dragging) return
		e.preventDefault()
		const dx = e.clientX - dragStart.x
		const dy = e.clientY - dragStart.y
		movedPx += Math.abs(dx) + Math.abs(dy)
		schedulePos(startPos.left + dx, startPos.top + dy)
	}
	const onTouchMove = (e) => {
		if (!dragging) return
		e.preventDefault()
		const t = e.touches && e.touches[0]
		if (!t) return
		const dx = t.clientX - dragStart.x
		const dy = t.clientY - dragStart.y
		movedPx += Math.abs(dx) + Math.abs(dy)
		schedulePos(startPos.left + dx, startPos.top + dy)
	}

	// Bind pointer events
	toggle.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY))
	toggle.addEventListener('touchstart', (e) => {
		const t = e.touches && e.touches[0]
		if (!t) return
		onPointerDown(t.clientX, t.clientY)
	},{ passive: true })

	// Prefer Pointer Events when supported (unified mouse/touch/pen)
	try {
		const onPtrDown = (e) => {
			e.preventDefault()
			if (typeof toggle.setPointerCapture === 'function') {
				try { toggle.setPointerCapture(e.pointerId) } catch {}
			}
			onPointerDown(e.clientX, e.clientY)
		}
		const onPtrMove = (e) => {
			if (!dragging) return
			e.preventDefault()
			const dx = e.clientX - dragStart.x
			const dy = e.clientY - dragStart.y
			movedPx += Math.abs(dx) + Math.abs(dy)
			schedulePos(startPos.left + dx, startPos.top + dy)
		}
		const onPtrUp = (e) => {
			if (typeof toggle.releasePointerCapture === 'function') {
				try { toggle.releasePointerCapture(e.pointerId) } catch {}
			}
			onPointerUp()
		}
		toggle.addEventListener('pointerdown', onPtrDown)
		toggle.addEventListener('pointermove', onPtrMove)
		toggle.addEventListener('pointerup', onPtrUp)
		// Global capture listeners in case DOM is re-rendered by dashboard
		document.addEventListener('pointerdown', (e) => {
			const t = e.target && (e.target.id === 'talk-widget-toggle' || (e.target.closest && e.target.closest('#talk-widget-toggle')))
			if (t) onPtrDown(e)
		}, true)
		document.addEventListener('pointermove', (e) => { if (dragging) onPtrMove(e) }, true)
		document.addEventListener('pointerup', (e) => { if (dragging) onPtrUp(e) }, true)
	} catch {}

	// Re-clamp on resize
	window.addEventListener('resize', () => {
		try {
			const saved = localStorage.getItem(storageKey)
			if (saved) {
				const pos = JSON.parse(saved)
				setTogglePos(pos.left, pos.top)
			}
		} catch {}
	},{ passive: true })

	// Dynamic panel placement next to toggle
	const placePanelRelativeToToggle = () => {
		const gap = 12
		const vp = getViewport()
		const tRect = toggle.getBoundingClientRect()
		const mRect = mount.getBoundingClientRect()
		let panelWidth = mRect.width || 380
		let panelHeight = mRect.height || 520
		const toggleCenterX = tRect.left + tRect.width / 2
		const openLeftSide = (toggleCenterX > (vp.width / 2))
		let left = openLeftSide ? (tRect.left - panelWidth - gap) : (tRect.right + gap)
		let top = (tRect.top + (tRect.height / 2)) - (panelHeight / 2)
		// Clamp vertically
		top = clamp(top, 12, vp.height - panelHeight - 12)
		// If overflow horizontally, flip side
		if (left < 8) left = tRect.right + gap
		if (left + panelWidth > vp.width - 8) left = tRect.left - panelWidth - gap
		// Final clamp horizontally
		left = clamp(left, 8, vp.width - panelWidth - 8)
		mount.style.left = left + 'px'
		mount.style.top = top + 'px'
		mount.style.right = ''
		mount.style.bottom = ''
	}

	// Wire toggle behavior to mount
	const openPanel = () => { 
		placePanelRelativeToToggle()
		// springy entrance
		mount.style.transition = 'transform .46s cubic-bezier(0.34,1.56,0.64,1), opacity .32s ease-out'
		mount.style.transform = 'scale(1) translateY(0)'; 
		mount.style.opacity = '1'; 
		setupPanelHeaderDrag()
		try { 
			window.SmartTalkOpen = true
			;(window.SmartTalkBus || new EventTarget()).dispatchEvent(new CustomEvent('smartTalk:widgetOpen'))
		} catch {}
	}
	const closePanel = () => { 
		// scale down and slide subtly for exit
		mount.style.transition = 'transform .36s cubic-bezier(0.4,0,1,1), opacity .22s ease-in'
		mount.style.transform = 'scale(0.92) translateY(24px)'; 
		mount.style.opacity = '0'; 
		try { 
			window.SmartTalkOpen = false 
			;(window.SmartTalkBus || new EventTarget()).dispatchEvent(new CustomEvent('smartTalk:widgetClose'))
		} catch {}
	}
	let opened = false
	toggle.addEventListener('click', () => {
		// If it was a drag (> 6px movement), suppress click action
		if (movedPx > 6) { movedPx = 0; return }
		opened = !opened; opened ? openPanel() : closePanel()
	})

	// ===== Optional: drag the panel by its header as well =====
	const setupPanelHeaderDrag = () => {
		try {
			const header = mount.querySelector('.header') || mount.querySelector('.widget-header')
			if (!header) return
			header.style.cursor = 'move'
			header.style.userSelect = 'none'
			let pDragging = false
			let pStart = { x: 0, y: 0 }
			let pMountStart = { left: 0, top: 0 }
			const readMountPos = () => {
				const r = mount.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }
			}
			const onPDown = (x, y) => {
				pDragging = true; pStart = { x, y }
				const m = readMountPos(); pMountStart = { left: m.left, top: m.top }
				document.addEventListener('mousemove', onPMove, { passive: false })
				document.addEventListener('mouseup', onPUp)
				document.addEventListener('touchmove', onPTouchMove, { passive: false })
				document.addEventListener('touchend', onPUp)
			}
			const onPMove = (e) => {
				if (!pDragging) return; e.preventDefault()
				const dx = e.clientX - pStart.x; const dy = e.clientY - pStart.y
				moveMountTo(pMountStart.left + dx, pMountStart.top + dy)
			}
			const onPTouchMove = (e) => {
				if (!pDragging) return; e.preventDefault(); const t = e.touches && e.touches[0]; if (!t) return
				const dx = t.clientX - pStart.x; const dy = t.clientY - pStart.y
				moveMountTo(pMountStart.left + dx, pMountStart.top + dy)
			}
			const onPUp = () => {
				pDragging = false
				document.removeEventListener('mousemove', onPMove)
				document.removeEventListener('mouseup', onPUp)
				document.removeEventListener('touchmove', onPTouchMove)
				document.removeEventListener('touchend', onPUp)
			}
			const moveMountTo = (left, top) => {
				const vp = getViewport(); const m = readMountPos();
				const cl = clamp(left, 8, vp.width - m.width - 8)
				const ct = clamp(top, 8, vp.height - m.height - 8)
				mount.style.left = cl + 'px'; mount.style.top = ct + 'px'; mount.style.right = ''; mount.style.bottom = ''
			}
			header.addEventListener('mousedown', (e) => onPDown(e.clientX, e.clientY))
			header.addEventListener('touchstart', (e) => { const t = e.touches && e.touches[0]; if (t) onPDown(t.clientX, t.clientY) }, { passive: true })
		} catch {}
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mountWidget)
} else {
	mountWidget()
}

document.addEventListener('DOMContentLoaded', function() {
	console.log('My Nextcloud App loaded!')
    if (!(isInIframe && isTalkContext())) {
        if (!TALK_DISABLED) {
            // Mount global Notification Center once
            if (!document.getElementById('smart-talk-notifications')) {
                const el = document.createElement('div')
                el.id = 'smart-talk-notifications'
                Object.assign(el.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 100000 })
                document.body.appendChild(el)
                const app = createApp2(NotificationCenter)
                app.mount('#smart-talk-notifications')
                if (!window.SmartTalkBus) window.SmartTalkBus = new EventTarget()
                const stack = document.querySelector('#smart-talk-notifications .nc-toast-stack')
                if (stack) stack.style.pointerEvents = 'auto'
            }
            // Start global notification service only when enabled
            if (!window.__smartTalkServiceStarted) {
                try {
                    startTalkNotifications()
                    window.__smartTalkServiceStarted = true
                } catch {}
            }
        }
    }
})




