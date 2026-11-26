/* === LEXFLOW FIX PATCH (v3): ESCAPE STACKING CONTEXTS SO LSJ/DOCK POPS ABOVE LXX PANE ===
 * Drop this file into ./js/lexflow-fix.js (replacing v2).
 */
(function () {
    if (window.__lfFixPatchLoaded) return;
    window.__lfFixPatchLoaded = true;

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
        document.body.classList.toggle('lf-touch-device', touchMode);
        document.body.classList.toggle('lf-desktop-device', !touchMode);
    }

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
        /* Escape parent stacking contexts and layer cleanly above LXX / parallel panels */
        #lfStudyDock.lf-dock-front {
            position: fixed !important;
            z-index: 2147483000 !important;
            right: 12px;
            bottom: 12px;
            max-width: min(680px, calc(100vw - 24px));
            max-height: calc(100vh - 72px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35) !important;
        }
    `;
    document.head.appendChild(css);

    function findLxxPanel() {
        const byId = document.querySelector('#lfLxxPanel, #lxxPanel, [id*="lxx" i], [data-panel*="lxx" i]');
        if (byId) return byId;
        const nodes = document.querySelectorAll('div, section, aside');
        for (let i = 0; i < nodes.length; i++) {
            const el = nodes[i];
            if (el.id === 'lfStudyDock' || el.closest('#lfStudyDock')) continue;
            const txt = (el.textContent || '');
            if (txt.includes('Tagged Septuagint (LXX)') && el.offsetHeight > 120 && el.offsetHeight < window.innerHeight) {
                return el;
            }
        }
        return null;
    }

    function bringLexiconDockToFront() {
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;

        if (!dock.classList.contains('open') && typeof window.lfOpenStudyDock === 'function') {
            try { window.lfOpenStudyDock('lexicon'); } catch (_) {}
        }

        dock.querySelectorAll('.lf-dock-tab-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.dockTab === 'lexicon');
        });
        ['lexicon', 'compare', 'notes', 'brief', 'fathers'].forEach((t) => {
            const p = document.getElementById(`lfDockPanel_${t}`);
            if (p) p.classList.toggle('hidden', t !== 'lexicon');
        });

        // If LXX panel is covering the area, nudge it slightly left/down or push dock to top stacking level
        const lxx = findLxxPanel();
        if (lxx) {
            const lxxZ = parseInt(getComputedStyle(lxx).zIndex, 10);
            if (!Number.isNaN(lxxZ) && lxxZ >= 2147483000) {
                lxx.style.zIndex = String(lxxZ - 10);
            }
        }

        // Attach dock directly to body when brought to front so no parent container traps its z-index
        if (dock.parentElement !== document.body) {
            dock.dataset.lfOrigParentId = dock.parentElement ? (dock.parentElement.id || '') : '';
            document.body.appendChild(dock);
        }

        dock.style.display = 'flex';
        dock.style.visibility = 'visible';
        dock.style.opacity = '1';
        dock.classList.add('lf-dock-front');
    }

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

    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('button, [role="button"], a');
        if (!btn) return;
        const txt = `${btn.id || ''} ${btn.className || ''} ${btn.title || ''} ${btn.textContent || ''}`.toLowerCase();
        if (/\blsj\b/.test(txt)) {
            unstickInteractiveControls();
            setTimeout(bringLexiconDockToFront, 40);
            setTimeout(bringLexiconDockToFront, 220);
            setTimeout(bringLexiconDockToFront, 500);
        }
    }, false);

    function init() {
        applyResponsiveModeClass();
        unstickInteractiveControls();
        window.addEventListener('resize', applyResponsiveModeClass, { passive: true });
        setInterval(unstickInteractiveControls, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
