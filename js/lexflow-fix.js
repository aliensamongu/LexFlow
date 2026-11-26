/* === LEXFLOW FIX PATCH (v6): STANDALONE LSJ MODAL ABOVE LXX + GUARANTEED CLOSE + STUCK-LOOKUP RECOVERY + CF & OT-IN-NT OFF BY DEFAULT ===
 * Save as exact filename: ./js/lexflow-fix.js (replace any previous version).
 */
(function () {
    if (window.__lfFixPatchLoaded === 'v6') return;
    window.__lfFixPatchLoaded = 'v6';
    window.__lfFixVersion = 'v6';
    try { console.info('[LexFlow Fix v6] Active'); } catch (_) {}

    const tagState = {
        cf: false,
        otnt: false
    };

    let lastRuntimeError = '';
    let lsjLookupStartedAt = 0;

    // 1. Real touch/mobile/tablet vs desktop detection
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

    // Apply default-off tag classes immediately
    document.documentElement.classList.add('lf-hide-cf-tags', 'lf-hide-otnt-tags');

    // 2. Styles
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

        /* Standalone LSJ modal always sits cleanly above LXX drawer & Study Dock */
        [data-lf-lsj-modal-root="1"] {
            z-index: 2147483500 !important;
        }
        [data-lf-lsj-modal-card="1"] {
            z-index: 2147483505 !important;
            pointer-events: auto !important;
        }
        [data-lf-lsj-modal-card="1"] button,
        [data-lf-lsj-modal-card="1"] input {
            pointer-events: auto !important;
        }

        /* Study Dock stays above LXX drawer when open, but below standalone LSJ modal */
        #lfStudyDock.open,
        #lfStudyDock.lf-dock-front {
            z-index: 2147483000 !important;
        }

        /* Hide inline Church Fathers verse tags when OFF (never hides Study Dock tab/panel) */
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

        /* Hide inline OT-in-NT verse tags when OFF (never hides Study Dock) */
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
        }
        .lf-tag-toggle-pill.active {
            background: #eef2ff;
            color: #3730a3;
            border-color: #6366f1;
        }

        /* Recovery box shown only if LSJ lookup hangs > 4.5s */
        #lfLsjRecoveryBox {
            margin: 14px auto 4px;
            max-width: 520px;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid #fca5a5;
            background: #fef2f2;
            color: #7f1d1d;
            font-size: 13px;
            text-align: center;
        }
        #lfLsjRecoveryBox .lf-rec-btns {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
            margin-top: 10px;
        }
        #lfLsjRecoveryBox button {
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #0f172a;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }
        #lfLsjRecoveryBox button.lf-rec-primary {
            background: #0f766e;
            color: #ffffff;
            border-color: #0f766e;
        }
    `;
    document.head.appendChild(css);

    // 3. Locate the standalone LSJ modal ("LSJ Greek-English Lexicon (1940)")
    function findStandaloneLsjModal() {
        const candidates = document.querySelectorAll('h1, h2, h3, h4, div, span');
        let titleEl = null;
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            if (el.closest('#lfStudyDock')) continue;
            if (el.children.length > 4) continue;
            const txt = (el.textContent || '').trim();
            if (/LSJ Greek[–-]English Lexicon/i.test(txt) && txt.length < 80) {
                titleEl = el;
                break;
            }
        }
        if (!titleEl) return null;

        let cur = titleEl;
        let card = null;
        let outermostFixed = null;
        while (cur && cur !== document.body && cur !== document.documentElement) {
            const cs = getComputedStyle(cur);
            if (!card && cur.querySelector('input') && cur.querySelector('button')) {
                card = cur;
            }
            if (cs.position === 'fixed') {
                outermostFixed = cur;
            }
            cur = cur.parentElement;
        }

        const root = outermostFixed || card || titleEl.parentElement;
        return { root, card: card || root };
    }

    function isElementVisible(el) {
        if (!el) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 20 && rect.height > 20;
    }

    function findLxxDrawer() {
        const direct = document.querySelector('#lfLxxPanel, #lxxPanel, #lxxDrawer, #taggedLxxPanel');
        if (direct) return direct;
        const nodes = document.querySelectorAll('aside, section, div');
        let match = null;
        for (let i = 0; i < nodes.length; i++) {
            const el = nodes[i];
            if (el.id === 'lfStudyDock' || el.closest('#lfStudyDock')) continue;
            if (el.children.length <= 6 && /Tagged Septuagint\s*\(LXX\)/i.test(el.textContent || '')) {
                match = el;
                break;
            }
        }
        if (!match) return null;
        let cur = match;
        let outermostFixed = null;
        while (cur && cur !== document.body && cur !== document.documentElement) {
            const cs = getComputedStyle(cur);
            if (cs.position === 'fixed' || cs.position === 'absolute') outermostFixed = cur;
            cur = cur.parentElement;
        }
        return outermostFixed || match.parentElement;
    }

    // 4. Elevate the standalone LSJ modal cleanly above the LXX panel (and wire guaranteed close)
    function forceCloseStandaloneLsjModal() {
        const info = findStandaloneLsjModal();
        // Try native close functions first if they exist
        ['closeLsjModal', 'closeLSJModal', 'hideLsjModal', 'lfCloseLsjModal'].forEach((fn) => {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch (_) {}
            }
        });

        if (info && info.root) {
            info.root.classList.add('hidden');
            info.root.classList.remove('open', 'active', 'show', 'flex');
            info.root.style.setProperty('display', 'none', 'important');
            info.root.dataset.lfForceHidden = '1';
        }

        // Also clear any orphaned dark backdrop sibling if present
        document.querySelectorAll('[id*="lsj" i][id*="backdrop" i], [class*="lsj" i][class*="backdrop" i], [id*="lsj" i][id*="overlay" i]').forEach((bg) => {
            bg.style.setProperty('display', 'none', 'important');
            bg.dataset.lfForceHidden = '1';
        });

        if (document.body && document.body.style.overflow === 'hidden') {
            document.body.style.overflow = '';
        }
        lsjLookupStartedAt = 0;
        const rec = document.getElementById('lfLsjRecoveryBox');
        if (rec) rec.remove();
    }

    function clearForceHiddenOnLsjModal() {
        document.querySelectorAll('[data-lf-force-hidden="1"]').forEach((el) => {
            el.style.removeProperty('display');
            el.classList.remove('hidden');
            delete el.dataset.lfForceHidden;
        });
    }

    function elevateStandaloneLsjModal() {
        const info = findStandaloneLsjModal();
        if (!info || !info.root) return false;
        if (!isElementVisible(info.root)) return false;

        // If trapped inside a non-body container with lower z-index, lift root to body
        if (info.root.parentElement && info.root.parentElement !== document.body) {
            document.body.appendChild(info.root);
        }

        info.root.setAttribute('data-lf-lsj-modal-root', '1');
        info.card.setAttribute('data-lf-lsj-modal-card', '1');
        info.root.style.setProperty('z-index', '2147483500', 'important');
        info.card.style.setProperty('z-index', '2147483505', 'important');

        // Keep LXX drawer strictly below the LSJ modal
        const lxx = findLxxDrawer();
        if (lxx) {
            const lxxZ = parseInt(getComputedStyle(lxx).zIndex, 10);
            if (!Number.isNaN(lxxZ) && lxxZ >= 2147483500) {
                lxx.style.setProperty('z-index', '2147482000', 'important');
            }
        }

        // Ensure close button inside the LSJ modal is NEVER disabled or unresponsive
        info.card.querySelectorAll('button').forEach((btn) => {
            const txt = (btn.textContent || '').trim();
            const meta = `${btn.id || ''} ${btn.className || ''} ${btn.title || ''} ${btn.getAttribute('aria-label') || ''}`.toLowerCase();
            const isCloseBtn = /^[×✕✖x]$/.test(txt) || meta.includes('close');
            if (isCloseBtn) {
                btn.disabled = false;
                btn.removeAttribute('aria-disabled');
                btn.style.pointerEvents = 'auto';
                if (!btn.dataset.lfFixCloseBound) {
                    btn.dataset.lfFixCloseBound = '1';
                    btn.addEventListener('click', () => {
                        setTimeout(() => {
                            const cur = findStandaloneLsjModal();
                            if (cur && isElementVisible(cur.root)) {
                                forceCloseStandaloneLsjModal();
                            }
                        }, 60);
                    });
                }
            }
        });

        // Clicking on the dimmed backdrop outside the modal card also closes it reliably
        if (info.root !== info.card && !info.root.dataset.lfFixBackdropBound) {
            info.root.dataset.lfFixBackdropBound = '1';
            info.root.addEventListener('click', (e) => {
                if (e.target === info.root) {
                    setTimeout(() => {
                        if (isElementVisible(info.root)) forceCloseStandaloneLsjModal();
                    }, 60);
                }
            });
        }

        return true;
    }

    // 5. Detect stuck "Looking up ... in LSJ..." state and provide instant recovery
    function checkStuckLsjLookup() {
        const info = findStandaloneLsjModal();
        if (!info || !isElementVisible(info.root)) {
            lsjLookupStartedAt = 0;
            return;
        }

        const txt = info.card.textContent || '';
        const isLookingUp = /Looking up\s+.+\s+in LSJ/i.test(txt);

        if (!isLookingUp) {
            lsjLookupStartedAt = 0;
            const oldRec = document.getElementById('lfLsjRecoveryBox');
            if (oldRec) oldRec.remove();
            return;
        }

        if (!lsjLookupStartedAt) {
            lsjLookupStartedAt = Date.now();
            return;
        }

        if (Date.now() - lsjLookupStartedAt < 4500) return;
        if (document.getElementById('lfLsjRecoveryBox')) return;

        // Find the container showing "Looking up ... in LSJ..."
        let statusNode = null;
        info.card.querySelectorAll('div, p, span').forEach((el) => {
            if (!statusNode && el.children.length <= 2 && /Looking up\s+.+\s+in LSJ/i.test(el.textContent || '')) {
                statusNode = el;
            }
        });
        const host = (statusNode && statusNode.parentElement) || info.card;

        const box = document.createElement('div');
        box.id = 'lfLsjRecoveryBox';

        const msg = document.createElement('div');
        msg.textContent = lastRuntimeError
            ? `LSJ lookup stalled (${lastRuntimeError}).`
            : 'LSJ lookup is taking too long (IndexedDB cache may be blocked or corrupted).';

        const btnRow = document.createElement('div');
        btnRow.className = 'lf-rec-btns';

        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'lf-rec-primary';
        retryBtn.textContent = 'Retry Search';
        retryBtn.addEventListener('click', () => {
            box.remove();
            lsjLookupStartedAt = Date.now();
            lastRuntimeError = '';
            const searchBtn = Array.from(info.card.querySelectorAll('button')).find((b) => /^\s*search\s*$/i.test(b.textContent || ''));
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.click();
            }
        });

        const repairBtn = document.createElement('button');
        repairBtn.type = 'button';
        repairBtn.textContent = 'Reset LSJ Offline Cache';
        repairBtn.addEventListener('click', async () => {
            repairBtn.textContent = 'Clearing cache...';
            try {
                if (indexedDB && typeof indexedDB.databases === 'function') {
                    const dbs = await indexedDB.databases();
                    dbs.forEach((d) => {
                        if (d && d.name && /lsj|lexicon|greek/i.test(d.name)) {
                            indexedDB.deleteDatabase(d.name);
                        }
                    });
                } else {
                    ['lexflow_lsj', 'lsj_db', 'lsj_cache', 'LSJ_DB', 'LexFlowLSJ'].forEach((n) => {
                        try { indexedDB.deleteDatabase(n); } catch (_) {}
                    });
                }
            } catch (_) {}
            setTimeout(() => window.location.reload(), 350);
        });

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = 'Close LSJ';
        closeBtn.addEventListener('click', forceCloseStandaloneLsjModal);

        btnRow.appendChild(retryBtn);
        btnRow.appendChild(repairBtn);
        btnRow.appendChild(closeBtn);
        box.appendChild(msg);
        box.appendChild(btnRow);
        host.appendChild(box);
    }

    // 6. Keep Study Dock above LXX drawer when Study Dock itself is opened (without conflicting with standalone LSJ modal)
    function ensureDockAboveLxxIfOpen() {
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;
        const isOpen = dock.classList.contains('open') || (getComputedStyle(dock).display !== 'none' && dock.offsetHeight > 40);
        if (!isOpen) return;
        dock.classList.add('lf-dock-front');
        dock.style.setProperty('z-index', '2147483000', 'important');
    }

    // 7. Inline Church Fathers & OT-in-NT tag hiding (OFF by default)
    function isInsideUiChrome(el) {
        return Boolean(el.closest(
            '#lfStudyDock, [data-lf-lsj-modal-root="1"], header, nav, #lfTopBar, .lf-tag-toggle-pill, #lfTagToggleWrap, [role="dialog"], .modal'
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
                if (el.children.length > 3) return;

                const meta = `${el.id || ''} ${el.className || ''} ${el.title || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('data-type') || ''} ${el.getAttribute('data-badge') || ''}`.toLowerCase();
                const isStyledChip =
                    el.tagName === 'BUTTON' ||
                    el.tagName === 'SUP' ||
                    el.getAttribute('role') === 'button' ||
                    /badge|tag|chip|pill|icon|ref|link|quote|allusion|marker|btn/.test(meta) ||
                    Boolean(el.title || el.onclick || el.dataset.cfRef || el.dataset.otRef || el.dataset.otInNt);

                if (!isStyledChip) return;

                const isCfMeta = /(cf[-_]?badge|cf[-_]?tag|cf[-_]?chip|cf[-_]?verse|church\s*father|patristic|fathers?\s*(tag|badge|cite|citation|ref))/i.test(meta);
                const isCfText = /^(🏛️?|⛪|📜|✝️?)?\s*(cf|fathers?|church\s*fathers?|patristic)(\s*[:•·-]?\s*\d+|\s*\(\d+\))?$/i.test(txt);

                if (isCfMeta || isCfText) {
                    el.dataset.lfInlineTag = 'cf';
                    return;
                }

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

    let nativeTogglesSyncedOnce = false;
    function syncNativeTagControlsOnStartup() {
        if (nativeTogglesSyncedOnce) return;
        let foundAny = false;
        document.querySelectorAll('input[type="checkbox"], button, [role="switch"]').forEach((el) => {
            if (el.closest('#lfStudyDock, #lfTagToggleWrap, [data-lf-lsj-modal-root="1"]')) return;
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

    // 8. Capture errors & button clicks safely (NEVER hijack clicks inside the LSJ modal!)
    function unstickInteractiveControls() {
        document.querySelectorAll('button[disabled], [aria-disabled="true"]').forEach((el) => {
            if (el.dataset.lfUserDisabled === 'true') return;
            const label = (el.textContent || el.title || el.id || '').toLowerCase();
            if (/lsj|lexicon|study dock|quick jump|read|flow|research|turbo|close|search/.test(label)) {
                el.disabled = false;
                el.removeAttribute('aria-disabled');
            }
        });
    }

    window.addEventListener('error', (ev) => {
        if (ev && ev.message && !/404|emtv\.xml|ot\.xml|ot\.json/i.test(ev.message)) {
            lastRuntimeError = String(ev.message).slice(0, 140);
        }
        unstickInteractiveControls();
    }, true);

    window.addEventListener('unhandledrejection', (ev) => {
        const reason = ev && ev.reason ? (ev.reason.message || String(ev.reason)) : 'Promise rejected';
        lastRuntimeError = String(reason).slice(0, 140);
        unstickInteractiveControls();
    });

    // Escape key ALWAYS closes the standalone LSJ modal if it's open
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const info = findStandaloneLsjModal();
            if (info && isElementVisible(info.root)) {
                setTimeout(() => {
                    const cur = findStandaloneLsjModal();
                    if (cur && isElementVisible(cur.root)) forceCloseStandaloneLsjModal();
                }, 40);
            }
        }
    }, true);

    // When clicking an LSJ trigger OUTSIDE the LSJ modal, clear any forced-hidden state & elevate modal cleanly
    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('button, [role="button"], a');
        if (!btn) return;

        // If click is INSIDE the standalone LSJ modal, do NOT touch Study Dock
        if (btn.closest('[data-lf-lsj-modal-root="1"]')) return;

        const txt = `${btn.id || ''} ${btn.className || ''} ${btn.title || ''} ${btn.textContent || ''}`.toLowerCase();
        if (/\blsj\b/.test(txt)) {
            lastRuntimeError = '';
            lsjLookupStartedAt = 0;
            clearForceHiddenOnLsjModal();
            unstickInteractiveControls();
            setTimeout(elevateStandaloneLsjModal, 30);
            setTimeout(elevateStandaloneLsjModal, 180);
            setTimeout(elevateStandaloneLsjModal, 450);
        }
    }, true);

    let tagScanTimer = null;
    function scheduleTagScan() {
        if (tagScanTimer) clearTimeout(tagScanTimer);
        tagScanTimer = setTimeout(() => {
            scanAndClassifyInlineTags();
            syncTagClassesAndButtons();
        }, 150);
    }

    function observeDom() {
        if (!document.body || document.body.dataset.lfFixV6Observed) return;
        document.body.dataset.lfFixV6Observed = '1';
        const mo = new MutationObserver((mutations) => {
            let sawNonModalChange = false;
            for (let i = 0; i < mutations.length; i++) {
                const t = mutations[i].target;
                if (t && t.closest && t.closest('[data-lf-lsj-modal-root="1"]')) continue;
                if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
                    sawNonModalChange = true;
                    break;
                }
            }
            if (sawNonModalChange) scheduleTagScan();
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        applyResponsiveModeClass();
        unstickInteractiveControls();
        injectTagToggleButtons();
        syncNativeTagControlsOnStartup();
        scanAndClassifyInlineTags();
        syncTagClassesAndButtons();
        observeDom();

        [350, 1000, 2000].forEach((ms) => {
            setTimeout(() => {
                injectTagToggleButtons();
                syncNativeTagControlsOnStartup();
                scanAndClassifyInlineTags();
                syncTagClassesAndButtons();
            }, ms);
        });

        window.addEventListener('resize', applyResponsiveModeClass, { passive: true });

        setInterval(() => {
            unstickInteractiveControls();
            elevateStandaloneLsjModal();
            checkStuckLsjLookup();
            ensureDockAboveLxxIfOpen();
        }, 700);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
