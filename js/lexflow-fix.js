/* === LEXFLOW FIX PATCH (v5): CF & OT-IN-NT TAGS OFF BY DEFAULT + LSJ ABOVE LXX + TOUCH & DESKTOP GUARD ===
 * Save as exact filename: ./js/lexflow-fix.js (replace any previous version).
 */
(function () {
    if (window.__lfFixPatchLoaded === 'v5') return;
    window.__lfFixPatchLoaded = 'v5';
    window.__lfFixVersion = 'v5';
    try { console.info('[LexFlow Fix v5] Active (CF & OT-in-NT tags default OFF)'); } catch (_) {}

    // Tag visibility state: BOTH OFF by default
    const tagState = {
        cf: false,
        otnt: false
    };

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

    // Apply default-off classes immediately (before first paint finishes)
    document.documentElement.classList.add('lf-hide-cf-tags', 'lf-hide-otnt-tags');

    // 2. Styles: fast touch taps + Study Dock above LXX + hide CF & OT-in-NT inline verse tags when OFF
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

        /* Hide inline Church Fathers verse tags when OFF (never hides the Study Dock tab/panel) */
        html.lf-hide-cf-tags [data-lf-inline-tag="cf"],
        html.lf-hide-cf-tags #flowEditor .lf-cf-badge,
        html.lf-hide-cf-tags #flowEditor .lf-cf-verse-badge,
        html.lf-hide-cf-tags #flowEditor .lf-cf-tag,
        html.lf-hide-cf-tags #flowEditor .cf-badge,
        html.lf-hide-cf-tags #flowEditor .cf-tag,
        html.lf-hide-cf-tags #flowEditor [class*="cf-badge" i],
        html.lf-hide-cf-tags #flowEditor [class*="cf-tag" i],
        html.lf-hide-cf-tags #flowEditor [class*="father-badge" i],
        html.lf-hide-cf-tags #flowEditor [class*="father-tag" i],
        html.lf-hide-cf-tags #flowEditor [data-cf-badge],
        html.lf-hide-cf-tags #flowEditor [data-cf-verse],
        html.lf-hide-cf-tags .lf-cf-inline-badge,
        html.lf-hide-cf-tags .lf-cf-verse-chip {
            display: none !important;
        }

        /* Hide inline OT-in-NT verse tags when OFF (never hides the Study Dock) */
        html.lf-hide-otnt-tags [data-lf-inline-tag="otnt"],
        html.lf-hide-otnt-tags #flowEditor .ot-in-nt-badge,
        html.lf-hide-otnt-tags #flowEditor .ot-in-nt-tag,
        html.lf-hide-otnt-tags #flowEditor .otnt-badge,
        html.lf-hide-otnt-tags #flowEditor .otnt-tag,
        html.lf-hide-otnt-tags #flowEditor .lf-otnt-badge,
        html.lf-hide-otnt-tags #flowEditor .lf-ot-in-nt,
        html.lf-hide-otnt-tags #flowEditor [class*="ot-in-nt" i],
        html.lf-hide-otnt-tags #flowEditor [class*="otnt" i],
        html.lf-hide-otnt-tags #flowEditor [class*="ot-nt" i],
        html.lf-hide-otnt-tags #flowEditor [data-ot-in-nt],
        html.lf-hide-otnt-tags #flowEditor [data-otnt],
        html.lf-hide-otnt-tags .ot-in-nt-pill,
        html.lf-hide-otnt-tags .ot-in-nt-chip {
            display: none !important;
        }

        /* Compact toggle pills for CF Tags & OT-in-NT Tags */
        .lf-tag-toggle-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.2;
            border: 1px solid rgba(100, 116, 139, 0.35);
            background: rgba(255, 255, 255, 0.85);
            color: #475569;
            cursor: pointer;
            white-space: nowrap;
            touch-action: manipulation;
            transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .lf-tag-toggle-pill.active {
            background: #eef2ff;
            color: #3730a3;
            border-color: #6366f1;
        }
    `;
    document.head.appendChild(css);

    // 3. Classify inline Church Fathers & OT-in-NT tags inside scripture/editor panes (excluding docks & navbars)
    function isInsideUiChrome(el) {
        return Boolean(el.closest(
            '#lfStudyDock, header, nav, #lfTopBar, .lf-tag-toggle-pill, #lfTagToggleWrap, [role="dialog"], .modal'
        ));
    }

    function scanAndClassifyInlineTags() {
        const roots = [];
        const editor = document.getElementById('flowEditor');
        if (editor) roots.push(editor);
        document.querySelectorAll('#readView, #readerView, #readPane, #scriptureContainer, .thought-flow-doc, main').forEach((r) => {
            if (!roots.includes(r)) roots.push(r);
        });
        if (!roots.length && document.body) roots.push(document.body);

        const selector = 'span, button, a, sup, small, div[role="button"]';
        roots.forEach((root) => {
            root.querySelectorAll(selector).forEach((el) => {
                if (el.dataset.lfInlineTag) return;
                if (isInsideUiChrome(el)) return;

                const txt = (el.textContent || '').trim();
                if (!txt || txt.length > 52) return;
                // Skip elements with many child nodes (containers, whole verses, paragraphs)
                if (el.children.length > 3) return;

                const meta = `${el.id || ''} ${el.className || ''} ${el.title || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('data-type') || ''} ${el.getAttribute('data-badge') || ''}`.toLowerCase();
                const isStyledChip =
                    el.tagName === 'BUTTON' ||
                    el.tagName === 'SUP' ||
                    el.getAttribute('role') === 'button' ||
                    /badge|tag|chip|pill|icon|ref|link|quote|allusion|marker|btn/.test(meta) ||
                    Boolean(el.title || el.onclick || el.dataset.cfRef || el.dataset.otRef || el.dataset.otInNt);

                if (!isStyledChip) return;

                // Match Church Fathers inline tags/chips
                const isCfMeta = /(cf[-_]?badge|cf[-_]?tag|cf[-_]?chip|cf[-_]?verse|church\s*father|patristic|fathers?\s*(tag|badge|cite|citation|ref))/i.test(meta);
                const isCfText = /^(🏛️?|⛪|📜|✝️?)?\s*(cf|fathers?|church\s*fathers?|patristic)(\s*[:•·-]?\s*\d+|\s*\(\d+\))?$/i.test(txt);

                if (isCfMeta || isCfText) {
                    el.dataset.lfInlineTag = 'cf';
                    return;
                }

                // Match OT-in-NT inline tags/chips
                const isOtNtMeta = /(ot[-_\s]?in[-_\s]?nt|otnt|ot[-_]nt|ot\s*(→|->|↔|\/)\s*nt|old\s*testament\s*in\s*(the\s*)?new|ot\s*(quote|allusion|echo))/i.test(meta);
                const isOtNtText = /^(🔗|📖|✦|★|↪)?\s*(ot\s*(in|→|->|↔|\/)\s*nt|ot\s*(quote|allusion|echo|ref)|nt\s*←\s*ot)(\s*[:•·-]?\s*[\w\s.:;-]{0,24})?$/i.test(txt);

                if (isOtNtMeta || isOtNtText) {
                    el.dataset.lfInlineTag = 'otnt';
                }
            });
        });
    }

    function syncTagClassesAndButtons() {
        document.documentElement.classList.toggle('lf-hide-cf-tags', !tagState.cf);
        document.documentElement.classList.toggle('lf-hide-otnt-tags', !tagState.otnt);

        const cfBtn = document.getElementById('lfFixToggleCfTags');
        if (cfBtn) {
            cfBtn.classList.toggle('active', tagState.cf);
            cfBtn.textContent = tagState.cf ? 'CF Tags: On' : 'CF Tags: Off';
            cfBtn.setAttribute('aria-pressed', String(tagState.cf));
        }
        const otBtn = document.getElementById('lfFixToggleOtNtTags');
        if (otBtn) {
            otBtn.classList.toggle('active', tagState.otnt);
            otBtn.textContent = tagState.otnt ? 'OT→NT: On' : 'OT→NT: Off';
            otBtn.setAttribute('aria-pressed', String(tagState.otnt));
        }
    }

    window.lfSetInlineTags = function (opts) {
        if (opts && typeof opts.cf === 'boolean') tagState.cf = opts.cf;
        if (opts && typeof opts.otnt === 'boolean') tagState.otnt = opts.otnt;
        scanAndClassifyInlineTags();
        syncTagClassesAndButtons();
    };

    // Turn off any native checkboxes/toggles for CF tags or OT-in-NT tags once on startup
    let nativeTogglesSyncedOnce = false;
    function syncNativeTagControlsOnStartup() {
        if (nativeTogglesSyncedOnce) return;
        let foundAny = false;
        document.querySelectorAll('input[type="checkbox"], button, [role="switch"]').forEach((el) => {
            if (el.closest('#lfStudyDock, #lfTagToggleWrap')) return;
            const labelText = (
                (el.labels && el.labels[0] ? el.labels[0].textContent : '') + ' ' +
                (el.textContent || '') + ' ' +
                (el.title || '') + ' ' +
                (el.id || '') + ' ' +
                (el.getAttribute('aria-label') || '')
            ).toLowerCase();

            const isCfToggle = /(church\s*father|fathers?\s*(tag|badge|icon)|cf\s*(tag|badge|icon))/i.test(labelText);
            const isOtNtToggle = /(ot\s*in\s*nt|ot\s*→\s*nt|otnt|ot[-_]in[-_]nt)/i.test(labelText);
            if (!isCfToggle && !isOtNtToggle) return;

            foundAny = true;
            if (el.tagName === 'INPUT' && el.type === 'checkbox') {
                if (el.checked) {
                    el.checked = false;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (!el.dataset.lfFixNativeBound) {
                    el.dataset.lfFixNativeBound = '1';
                    el.addEventListener('change', () => {
                        if (isCfToggle) tagState.cf = el.checked;
                        if (isOtNtToggle) tagState.otnt = el.checked;
                        syncTagClassesAndButtons();
                    });
                }
            } else if (/\bon\b/.test(labelText) && !el.dataset.lfFixAutoOffDone) {
                el.dataset.lfFixAutoOffDone = '1';
                try { el.click(); } catch (_) {}
            }
        });
        if (foundAny) nativeTogglesSyncedOnce = true;
    }

    // Add compact CF Tags & OT->NT toggle pills right beside Turbo (or in the top toolbar)
    function injectTagToggleButtons() {
        if (document.getElementById('lfTagToggleWrap')) return;

        const wrap = document.createElement('span');
        wrap.id = 'lfTagToggleWrap';
        wrap.style.cssText = 'display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;';

        const cfBtn = document.createElement('button');
        cfBtn.type = 'button';
        cfBtn.id = 'lfFixToggleCfTags';
        cfBtn.className = 'lf-tag-toggle-pill';
        cfBtn.title = 'Toggle inline Church Fathers verse tags (Off by default)';
        cfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            tagState.cf = !tagState.cf;
            scanAndClassifyInlineTags();
            syncTagClassesAndButtons();
        });

        const otBtn = document.createElement('button');
        otBtn.type = 'button';
        otBtn.id = 'lfFixToggleOtNtTags';
        otBtn.className = 'lf-tag-toggle-pill';
        otBtn.title = 'Toggle inline OT-in-NT verse tags (Off by default)';
        otBtn.addEventListener('click', (e) => {
            e.preventDefault();
            tagState.otnt = !tagState.otnt;
            scanAndClassifyInlineTags();
            syncTagClassesAndButtons();
        });

        wrap.appendChild(cfBtn);
        wrap.appendChild(otBtn);

        // Place right next to the Turbo button if present, otherwise in the document/header bar
        let anchor = null;
        document.querySelectorAll('button').forEach((b) => {
            if (!anchor && /turbo\s*:/i.test(b.textContent || '')) anchor = b;
        });

        if (anchor && anchor.parentElement) {
            anchor.parentElement.insertBefore(wrap, anchor.nextSibling);
        } else {
            const docHeader = document.querySelector('header, nav, #topBar, .top-toolbar');
            if (docHeader) docHeader.appendChild(wrap);
        }

        syncTagClassesAndButtons();
    }

    // 4. Reliably find the outermost LXX drawer container (including full-height 100vh fixed drawers)
    function findLxxDrawer() {
        const direct = document.querySelector('#lfLxxPanel, #lxxPanel, #lxxDrawer, #taggedLxxPanel');
        if (direct) return direct;

        const candidates = document.querySelectorAll('aside, section, div');
        let innerMatch = null;
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            if (el.id === 'lfStudyDock' || el.closest('#lfStudyDock')) continue;
            if (el.children.length <= 6 && /Tagged Septuagint\s*\(LXX\)/i.test(el.textContent || '')) {
                innerMatch = el;
                break;
            }
        }
        if (!innerMatch) return null;

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

    // 5. Elevate Study Dock & LSJ cleanly above the LXX drawer
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
        const targetZ = 2147483000;

        if (lxx) {
            const lxxCs = getComputedStyle(lxx);
            const lxxZ = parseInt(lxxCs.zIndex, 10);
            if (!Number.isNaN(lxxZ) && lxxZ >= targetZ) {
                lxx.style.setProperty('z-index', String(targetZ - 100), 'important');
            }
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

        document.querySelectorAll('[id*="lsj" i], [class*="lsj" i]').forEach((el) => {
            if (el === dock || el.closest('#lfStudyDock')) return;
            const cs = getComputedStyle(el);
            if ((cs.position === 'fixed' || cs.position === 'absolute') && cs.display !== 'none') {
                el.style.setProperty('z-index', String(targetZ + 10), 'important');
            }
        });
    }

    // 6. Unstick any accidentally disabled buttons after errors
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

    // 7. Capture-phase listener so stopPropagation() inside the LXX panel cannot block LSJ elevation
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

    // 8. Hook Study Dock & observe chapter changes so new verse tags stay hidden until toggled on
    function hookStudyDock() {
        if (typeof window.lfOpenStudyDock === 'function' && !window.lfOpenStudyDock.__lfFixV5Wrapped) {
            const orig = window.lfOpenStudyDock;
            const wrapped = function (...args) {
                const res = orig.apply(this, args);
                setTimeout(() => ensureDockAboveLxx(false), 20);
                setTimeout(() => ensureDockAboveLxx(false), 180);
                return res;
            };
            wrapped.__lfFixV5Wrapped = true;
            window.lfOpenStudyDock = wrapped;
        }

        const dock = document.getElementById('lfStudyDock');
        if (dock && !dock.dataset.lfFixV5Observed) {
            dock.dataset.lfFixV5Observed = '1';
            const mo = new MutationObserver(() => {
                if (dock.classList.contains('open')) {
                    ensureDockAboveLxx(false);
                }
            });
            mo.observe(dock, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }

    let tagScanTimer = null;
    function scheduleTagScan() {
        if (tagScanTimer) clearTimeout(tagScanTimer);
        tagScanTimer = setTimeout(() => {
            scanAndClassifyInlineTags();
            syncTagClassesAndButtons();
        }, 80);
    }

    function observeChapterRenders() {
        if (!document.body || document.body.dataset.lfFixTagObserver) return;
        document.body.dataset.lfFixTagObserver = '1';
        const mo = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
                    scheduleTagScan();
                    break;
                }
            }
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        applyResponsiveModeClass();
        unstickInteractiveControls();
        hookStudyDock();
        injectTagToggleButtons();
        syncNativeTagControlsOnStartup();
        scanAndClassifyInlineTags();
        syncTagClassesAndButtons();
        observeChapterRenders();

        // Catch modules that finish rendering slightly after DOMContentLoaded
        [350, 900, 1800].forEach((ms) => {
            setTimeout(() => {
                hookStudyDock();
                injectTagToggleButtons();
                syncNativeTagControlsOnStartup();
                scanAndClassifyInlineTags();
                syncTagClassesAndButtons();
            }, ms);
        });

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
