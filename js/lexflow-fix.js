/* === LEXFLOW FIX PATCH (v4): ALWAYS LAYER STUDY DOCK & LSJ ABOVE LXX DRAWER + TOUCH & DESKTOP GUARD ===
 * Save as exact filename: ./js/lexflow-fix.js (replace any previous version).
 */
(function () {
    if (window.__lfFixPatchLoaded === 'v4') return;
    window.__lfFixPatchLoaded = 'v4';
    window.__lfFixVersion = 'v4';
    try { console.info('[LexFlow Fix v4] Active'); } catch (_) {}

    // 1. Real touch/mobile/tablet vs desktop detection (keeps desktop from collapsing when DevTools is docked)
    function isRealTouchDevice() {
        const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        const smallScreen = window.innerWidth <= 900;
        const mobileUA = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent || '');
        return Boolean(mobileUA || (hasTouch && (coarsePointer || smallScreen)));
    }

    function applyResponsiveModeClass() {
        const touchMode = isRealTouchDevice();
        document.documentElement.classList.toggle('lf-touch-device', touchMode);
        document.documentElement.classList.toggle('lf-desktop-device', !touchMode);
        if (document.body) {
            document.body.classList.toggle('lf-touch-device', touchMode);
            document.body.classList.toggle('lf-desktop-device', !touchMode);
        }
    }

    // 2. Styles: responsive touch taps + guarantee Study Dock / LSJ sits ABOVE the full-height LXX drawer
    const oldStyle = document.getElementById('lfFixPatchStyles');
    if (oldStyle) oldStyle.remove();

    const css = document.createElement('style');
    css.id = 'lfFixPatchStyles';
    css.textContent = `
        button, [role="button"], .btn, .lf-dock-tab-btn, .lf-cf-sub-btn, .lf-cf-chip,
        #flowEditor [data-verse-num], #flowEditor .verse-block {
            touch-action: manipulation;
        }
        button:active, [role="button"]:active {
            opacity: 0.88;
        }
        html.lf-desktop-device body {
            min-width: 980px;
        }
        /* Keep Study Dock & LSJ cleanly above the LXX right-hand drawer whenever open */
        #lfStudyDock.open,
        #lfStudyDock.lf-dock-front {
            z-index: 2147483000 !important;
        }
        #lfStudyDock.lf-dock-lifted {
            position: fixed !important;
            left: 10px !important;
            right: 10px !important;
            bottom: 10px !important;
            width: auto !important;
            max-width: calc(100vw - 20px) !important;
            max-height: min(62vh, calc(100vh - 80px)) !important;
            box-shadow: 0 -8px 36px rgba(0, 0, 0, 0.34) !important;
            z-index: 2147483000 !important;
        }
    `;
    document.head.appendChild(css);

    // 3. Reliably find the outermost LXX drawer container (including full-height 100vh fixed drawers)
    function findLxxDrawer() {
        const direct = document.querySelector('#lfLxxPanel, #lxxPanel, #lxxDrawer, #taggedLxxPanel');
        if (direct) return direct;

        const candidates = document.querySelectorAll('aside, section, div');
        let innerMatch = null;
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            if (el.id === 'lfStudyDock' || el.closest('#lfStudyDock')) continue;
            // Match the header text node directly so we don't match document wrappers
            if (el.children.length <= 6 && /Tagged Septuagint\s*\(LXX\)/i.test(el.textContent || '')) {
                innerMatch = el;
                break;
            }
        }
        if (!innerMatch) return null;

        // Walk upward to the outermost fixed/absolute panel (stopping before body)
        let cur = innerMatch;
        let outermostFixed = null;
        while (cur && cur !== document.body && cur !== document.documentElement) {
            const cs = getComputedStyle(cur);
            if (cs.position === 'fixed' || cs.position === 'absolute') {
                outermostFixed = cur;
            }
            cur = cur.parentElement;
        }
        return outermostFixed || innerMatch.parentElement;
    }

    function hasTrappingStackingAncestor(el) {
        let cur = el.parentElement;
        while (cur && cur !== document.body && cur !== document.documentElement) {
            const cs = getComputedStyle(cur);
            const createsContext =
                (cs.position !== 'static' && cs.zIndex !== 'auto') ||
                cs.transform !== 'none' ||
                cs.filter !== 'none' ||
                cs.backdropFilter !== 'none' ||
                cs.isolation === 'isolate' ||
                cs.contain.includes('layout') ||
                cs.contain.includes('paint') ||
                parseFloat(cs.opacity) < 1;
            if (createsContext) return cur;
            cur = cur.parentElement;
        }
        return null;
    }

    // 4. Elevate Study Dock (and any standalone LSJ container) cleanly above the LXX drawer
    function ensureDockAboveLxx(forceLexiconTab) {
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;

        if (forceLexiconTab && !dock.classList.contains('open') && typeof window.lfOpenStudyDock === 'function') {
            try { window.lfOpenStudyDock('lexicon'); } catch (_) {}
        }

        const isOpen = dock.classList.contains('open') || getComputedStyle(dock).display !== 'none';
        if (!isOpen && !forceLexiconTab) return;

        if (forceLexiconTab) {
            dock.querySelectorAll('.lf-dock-tab-btn').forEach((b) => {
                b.classList.toggle('active', b.dataset.dockTab === 'lexicon');
            });
            ['lexicon', 'compare', 'notes', 'brief', 'fathers'].forEach((t) => {
                const p = document.getElementById(`lfDockPanel_${t}`);
                if (p) p.classList.toggle('hidden', t !== 'lexicon');
            });
        }

        const lxx = findLxxDrawer();
        let targetZ = 2147483000;

        if (lxx) {
            const lxxCs = getComputedStyle(lxx);
            const lxxZ = parseInt(lxxCs.zIndex, 10);
            if (!Number.isNaN(lxxZ) && lxxZ >= targetZ) {
                lxx.style.setProperty('z-index', String(targetZ - 100), 'important');
            }
            // If LXX is visible and overlapping, lift dock to body if trapped in a parent stacking context
            const lxxRect = lxx.getBoundingClientRect();
            const lxxVisible = lxxRect.width > 40 && lxxRect.height > 40 && lxxCs.display !== 'none' && lxxCs.visibility !== 'hidden';
            if (lxxVisible) {
                const trap = hasTrappingStackingAncestor(dock);
                if (trap && dock.parentElement !== document.body) {
                    document.body.appendChild(dock);
                }
                if (dock.parentElement === document.body) {
                    dock.classList.add('lf-dock-lifted');
                }
            }
        }

        dock.classList.add('lf-dock-front');
        dock.style.setProperty('z-index', String(targetZ), 'important');

        // Also elevate any standalone LSJ modal/panel if one exists outside #lfStudyDock
        document.querySelectorAll('[id*="lsj" i], [class*="lsj" i]').forEach((el) => {
            if (el === dock || el.closest('#lfStudyDock')) return;
            const cs = getComputedStyle(el);
            if ((cs.position === 'fixed' || cs.position === 'absolute') && cs.display !== 'none') {
                el.style.setProperty('z-index', String(targetZ + 10), 'important');
            }
        });
    }

    // 5. Unstick any accidentally disabled buttons after errors
    function unstickInteractiveControls() {
        document.querySelectorAll('button[disabled], [aria-disabled="true"]').forEach((el) => {
            if (el.dataset.lfUserDisabled === 'true') return;
            const label = (el.textContent || el.title || el.id || '').toLowerCase();
            if (/lsj|lexicon|study dock|quick jump|read|flow|research|turbo/.test(label)) {
                el.disabled = false;
                el.removeAttribute('aria-disabled');
            }
        });
    }

    window.addEventListener('error', (ev) => {
        unstickInteractiveControls();
        if (ev && ev.message && /404|emtv\.xml|ot\.xml|ot\.json/i.test(ev.message)) {
            ev.preventDefault();
        }
    }, true);

    window.addEventListener('unhandledrejection', () => {
        unstickInteractiveControls();
    });

    // 6. CAPTURE-phase listener so stopPropagation() inside the LXX panel can NEVER block us
    function handlePossibleLsjTrigger(e) {
        const btn = e.target && e.target.closest('button, [role="button"], a, span');
        if (!btn) return;
        const meta = `${btn.id || ''} ${btn.className || ''} ${btn.title || ''} ${btn.getAttribute('aria-label') || ''} ${btn.textContent || ''}`.toLowerCase();
        if (meta.includes('lsj') || meta.includes('lexicon')) {
            unstickInteractiveControls();
            setTimeout(() => ensureDockAboveLxx(true), 20);
            setTimeout(() => ensureDockAboveLxx(true), 150);
            setTimeout(() => ensureDockAboveLxx(false), 450);
        }
    }

    document.addEventListener('click', handlePossibleLsjTrigger, true);
    document.addEventListener('pointerdown', (e) => {
        const dock = document.getElementById('lfStudyDock');
        if (dock && dock.contains(e.target)) {
            ensureDockAboveLxx(false);
        }
    }, true);

    // 7. Wrap lfOpenStudyDock & observe #lfStudyDock so ANY open/update stays above LXX
    function hookStudyDock() {
        if (typeof window.lfOpenStudyDock === 'function' && !window.lfOpenStudyDock.__lfFixV4Wrapped) {
            const orig = window.lfOpenStudyDock;
            const wrapped = function (...args) {
                const res = orig.apply(this, args);
                setTimeout(() => ensureDockAboveLxx(false), 20);
                setTimeout(() => ensureDockAboveLxx(false), 180);
                return res;
            };
            wrapped.__lfFixV4Wrapped = true;
            window.lfOpenStudyDock = wrapped;
        }

        const dock = document.getElementById('lfStudyDock');
        if (dock && !dock.dataset.lfFixV4Observed) {
            dock.dataset.lfFixV4Observed = '1';
            const mo = new MutationObserver(() => {
                if (dock.classList.contains('open')) {
                    ensureDockAboveLxx(false);
                }
            });
            mo.observe(dock, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }

    function init() {
        applyResponsiveModeClass();
        unstickInteractiveControls();
        hookStudyDock();
        setTimeout(hookStudyDock, 500);
        setTimeout(hookStudyDock, 1500);
        window.addEventListener('resize', applyResponsiveModeClass, { passive: true });
        setInterval(() => {
            unstickInteractiveControls();
            const dock = document.getElementById('lfStudyDock');
            if (dock && dock.classList.contains('open')) {
                ensureDockAboveLxx(false);
            }
        }, 1200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
