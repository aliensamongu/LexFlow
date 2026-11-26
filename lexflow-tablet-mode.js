/* === LEXFLOW PHASE 5 MODULE (v2): SAMSUNG ANDROID & IPAD PERFORMANCE + ZERO-REFLOW TOUCH ENGINE === */
(function () {
    if (window.__lfTabletModeLoaded) return;
    window.__lfTabletModeLoaded = true;

    // -------------------------------------------------------------------------
    // 1. BULLETPROOF TABLET DETECTION (Works even if Samsung "Desktop Site" or S-Pen is ON!)
    // -------------------------------------------------------------------------
    const ua = navigator.userAgent || '';
    const isAndroid = /Android|SamsungBrowser|SM-T|SM-X|SM-P/i.test(ua);
    const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIOS = isIPad || /iPhone|iPod/i.test(ua);
    const anyCoarse = !!(window.matchMedia && window.matchMedia('(any-pointer: coarse)').matches);
    const hasTouchHardware = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);
    // MacBooks have maxTouchPoints === 0 & anyCoarse === false; Samsung Tabs & iPads always have touch hardware
    const isTouchDevice = anyCoarse || isAndroid || isIOS || hasTouchHardware;

    const savedPerfPref = localStorage.getItem('lexflow_tablet_perf_mode');
    let perfModeOn = savedPerfPref !== null ? (savedPerfPref === 'true') : isTouchDevice;

    const state = {
        isTouch: isTouchDevice,
        isAndroid,
        isIPad,
        isIOS,
        perfMode: perfModeOn,
        readLock: isTouchDevice,
        activeBlock: null,
        selectedWord: '',
        sheetHeightPct: parseInt(localStorage.getItem('lexflow_tablet_sheet_h') || '50', 10) || 50,
        sheetExpanded: false
    };

    if (state.isTouch) document.documentElement.classList.add('lf-touch-device');
    if (state.isAndroid) document.documentElement.classList.add('lf-android-device');
    if (state.isIOS) document.documentElement.classList.add('lf-ios-device');
    if (state.perfMode) document.documentElement.classList.add('lf-tablet-turbo');

    // -------------------------------------------------------------------------
    // 2. STYLES: ZERO-REFLOW OVERLAYS, ZERO BACKDROP-BLUR LAG, ZERO CLIPPED BUTTONS
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfTabletEngineStyles';
    styleEl.textContent = `
        /* =====================================================================
           A. TURBO GPU & ZERO-REFLOW ENGINE (Fixes Samsung Android Tap Lag!)
           ===================================================================== */

        /* Kill EVERY backdrop-filter blur on Turbo devices (huge Android GPU bottleneck!) */
        html.lf-tablet-turbo *,
        html.lf-tablet-turbo *::before,
        html.lf-tablet-turbo *::after {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        html.lf-tablet-turbo .glass-panel {
            background: rgba(255, 255, 255, 0.98) !important;
            box-shadow: 0 3px 12px rgba(15, 23, 42, 0.08) !important;
        }
        html.dark.lf-tablet-turbo .glass-panel {
            background: rgba(24, 24, 27, 0.98) !important;
            box-shadow: 0 3px 14px rgba(0, 0, 0, 0.45) !important;
        }
        html.lf-tablet-turbo .glass-control {
            background: rgba(248, 250, 252, 0.98) !important;
        }
        html.dark.lf-tablet-turbo .glass-control {
            background: rgba(39, 39, 42, 0.98) !important;
        }

        /* Skip layout & paint for off-screen Bible verses AND lexicon result cards */
        html.lf-tablet-turbo #flowEditor > div,
        html.lf-tablet-turbo #parallelOriginalContent > div {
            content-visibility: auto;
            contain-intrinsic-size: auto 38px;
        }
        html.lf-tablet-turbo #thayersResultsContainer > *,
        html.lf-tablet-turbo #bdbResultsContainer > *,
        html.lf-tablet-turbo #lfCompareContent > *,
        html.lf-tablet-turbo #lfBriefContent > * {
            content-visibility: auto;
            contain-intrinsic-size: auto 90px;
        }

        /* Isolate scroll containers so tapping/scrolling tools NEVER triggers Bible reflow */
        html.lf-tablet-turbo main,
        html.lf-tablet-turbo #wordProcessorPane,
        html.lf-tablet-turbo #lfStudyDock,
        html.lf-tablet-turbo #parallelOriginalPane {
            contain: layout style;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }

        /* CRITICAL: On touch tablets, NEVER change #wordProcessorPane horizontal padding
           when opening Study Dock (changing padding forces all 31,102 verses to re-wrap!) */
        html.lf-touch-device body.lf-dock-open #wordProcessorPane {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }

        /* Eliminate 300ms tap delay & give instant tactile tap feedback on Android/iPad */
        html.lf-touch-device,
        html.lf-touch-device body {
            height: 100dvh !important;
            max-height: 100dvh !important;
            padding-top: env(safe-area-inset-top, 0px);
            padding-bottom: env(safe-area-inset-bottom, 0px);
            touch-action: manipulation;
        }
        html.lf-touch-device button,
        html.lf-touch-device a,
        html.lf-touch-device select,
        html.lf-touch-device input,
        html.lf-touch-device [role="button"] {
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: rgba(79, 70, 229, 0.18);
        }
        html.lf-touch-device button:active {
            opacity: 0.78;
            transform: scale(0.97);
            transition: transform 0.04s ease, opacity 0.04s ease !important;
        }

        /* Prevent iOS/Android auto-zoom when tapping text inputs */
        html.lf-touch-device input[type="text"],
        html.lf-touch-device input[type="search"],
        html.lf-touch-device select,
        html.lf-touch-device textarea {
            font-size: 15px !important;
        }
        html.lf-ios-device input[type="text"],
        html.lf-ios-device input[type="search"],
        html.lf-ios-device select,
        html.lf-ios-device textarea {
            font-size: 16px !important;
        }

        /* =====================================================================
           B. CLEAN WRAPPING HEADER & SUB-BAR (Fixes ALL Clipped & Stacked Buttons!)
           ===================================================================== */
        @media (max-width: 1220px) {
            header {
                margin-left: 8px !important;
                margin-right: 8px !important;
                margin-top: 8px !important;
                padding: 8px 10px !important;
                gap: 8px !important;
                flex-wrap: wrap !important;
            }
            /* Row 1 & Row 2 containers inside <header> wrap cleanly instead of clipping off right edge */
            header > div {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: 6px !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
            }
            /* Override Tailwind space-x-* negative/left margins so wrapped rows align flush left */
            header > div > * {
                margin-left: 0 !important;
                flex-shrink: 0 !important;
            }
            /* Keep EVERY button & pill strictly single-line (no more "Quick\nJump" or "Load\nText"!) */
            header button,
            header .lf-mode-pill,
            header select {
                white-space: nowrap !important;
                line-height: 1.2 !important;
                min-height: 34px;
            }
            /* Inner scripture navigation bar (Jump, Go, X, BSB Select, Load Text, Search, Settings) */
            header > div > .glass-control {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: 6px !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 6px 10px !important;
            }
            header > div > .glass-control > * {
                margin-left: 0 !important;
                flex-shrink: 0 !important;
            }
            header #passageRefInput {
                flex: 1 1 150px !important;
                min-width: 130px !important;
                width: auto !important;
            }
            header #otVersionSelect {
                flex: 1 1 200px !important;
                max-width: 100% !important;
                min-width: 170px !important;
            }
            /* Hide vertical hairlines when Row 2 wraps cleanly */
            header > div > .glass-control > div.w-px {
                display: none !important;
            }
            /* Hide desktop keyboard badges (Ctrl+K / ⌘K) on tablets to save horizontal room */
            header .lf-kbd {
                display: none !important;
            }
        }

        /* Also apply clean header wrapping on ALL touch devices regardless of landscape width */
        html.lf-touch-device header {
            padding: 8px 10px !important;
            gap: 8px !important;
        }
        html.lf-touch-device header button,
        html.lf-touch-device header .lf-mode-pill,
        html.lf-touch-device header select {
            white-space: nowrap !important;
            min-height: 36px;
        }
        html.lf-touch-device .lf-kbd {
            display: none !important;
        }

        /* Fix Document Sticky Sub-Bar Overlap ("Full BSB OT + EMTV" & "Tagged LXX" & "Flowchart") */
        @media (max-width: 1180px) {
            #wordProcessorPane {
                padding-left: 1rem !important;
                padding-right: 1rem !important;
            }
            #wordProcessorPane .sticky {
                flex-wrap: wrap !important;
                height: auto !important;
                row-gap: 6px !important;
                column-gap: 8px !important;
                padding: 8px 12px !important;
            }
            #wordProcessorPane .sticky > * {
                flex-wrap: wrap !important;
                gap: 6px !important;
                max-width: 100% !important;
            }
            #wordProcessorPane .sticky button,
            #wordProcessorPane .sticky select,
            #wordProcessorPane .sticky span {
                white-space: nowrap !important;
                max-width: 100% !important;
            }
        }

        /* Active tapped verse subtle highlight on tablets */
        #flowEditor > div.lf-tablet-active-block {
            background: rgba(99, 102, 241, 0.09) !important;
            border-radius: 8px;
        }
        html.dark #flowEditor > div.lf-tablet-active-block {
            background: rgba(129, 140, 248, 0.15) !important;
        }

        /* Extra bottom scroll space so bottom touch bar never covers the last verse */
        html.lf-touch-device #flowEditor {
            padding-bottom: 120px !important;
        }

        /* =====================================================================
           C. ZERO-REFLOW OVERLAY SIDEBAR & STUDY DOCK ON TABLETS
              (Opening Tools or Study Dock NEVER resizes the 31,102-verse Bible!)
           ===================================================================== */

        /* Tools Sidebar floats smoothly over workspace on tablets instead of squeezing <main> */
        html.lf-touch-device aside:not(#lfStudyDock) {
            position: fixed !important;
            top: 8px !important;
            left: 8px !important;
            bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;
            z-index: 490 !important;
            max-width: 86vw !important;
            border-radius: 16px !important;
            box-shadow: 10px 0 32px rgba(15, 23, 42, 0.3) !important;
        }

        /* Study Dock floats cleanly on touch tablets -> ZERO Bible reflow = INSTANT open! */
        #lfSheetDragBar { display: none; }

        /* Landscape Tablets (>= 900px): Right-side floating drawer so Bible stays visible on left */
        @media (min-width: 900px) {
            html.lf-touch-device #lfStudyDock.open {
                position: fixed !important;
                top: 10px !important;
                right: 10px !important;
                bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
                left: auto !important;
                width: min(46vw, 520px) !important;
                min-width: 340px !important;
                max-width: 68vw !important;
                height: auto !important;
                z-index: 480 !important;
                border-radius: 18px !important;
                box-shadow: -8px 0 32px rgba(15, 23, 42, 0.25) !important;
                border: 1.5px solid rgba(99, 102, 241, 0.35) !important;
            }
            html.lf-touch-device #lfDockResizeHandle {
                display: block !important;
                width: 20px !important;
                left: -6px !important;
                touch-action: none !important;
            }
            html.lf-touch-device #lfDockResizeHandle::after {
                content: '';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 46px;
                border-radius: 999px;
                background: rgba(148, 163, 184, 0.65);
            }
        }

        /* Portrait Tablets (< 900px): Resizable Bottom Sheet so Bible stays readable on top! */
        @media (max-width: 899px) {
            #lfStudyDock.open {
                position: fixed !important;
                left: 8px !important;
                right: 8px !important;
                bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;
                top: auto !important;
                width: auto !important;
                max-width: none !important;
                min-width: 0 !important;
                height: var(--lf-sheet-h, 50dvh) !important;
                border-radius: 18px !important;
                z-index: 480 !important;
                box-shadow: 0 -10px 35px rgba(15, 23, 42, 0.3) !important;
                border: 1.5px solid rgba(99, 102, 241, 0.4) !important;
            }
            #lfDockResizeHandle { display: none !important; }
            #lfSheetDragBar {
                display: flex !important;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 8px 12px 4px;
                cursor: row-resize;
                touch-action: none;
                background: rgba(248, 250, 252, 0.96);
                flex-shrink: 0;
            }
            html.dark #lfSheetDragBar {
                background: rgba(24, 24, 27, 0.96);
            }
            #lfSheetDragPill {
                width: 48px;
                height: 5px;
                border-radius: 999px;
                background: rgba(148, 163, 184, 0.78);
            }
        }

        /* =====================================================================
           D. FLOATING TABLET TOUCH ACTION BAR (Replaces Right-Click & Hover)
           ===================================================================== */
        #lfTabletActionBar {
            position: fixed;
            left: 50%;
            bottom: calc(14px + env(safe-area-inset-bottom, 0px));
            transform: translateX(-50%);
            z-index: 460;
            display: none;
            align-items: center;
            gap: 5px;
            padding: 6px 8px;
            max-width: calc(100vw - 16px);
            overflow-x: auto;
            scrollbar-width: none;
            border-radius: 16px;
            background: rgba(15, 23, 42, 0.95);
            border: 1.5px solid rgba(129, 140, 248, 0.45);
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.38);
            color: #ffffff;
        }
        #lfTabletActionBar::-webkit-scrollbar { display: none; }
        html.lf-touch-device #lfTabletActionBar.visible {
            display: flex;
        }
        @media (max-width: 899px) {
            body.lf-dock-open #lfTabletActionBar {
                display: none !important;
            }
        }

        .lf-tab-act-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 11px;
            border-radius: 11px;
            font-size: 12px;
            font-weight: 700;
            color: #f8fafc;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.15);
            white-space: nowrap;
            flex-shrink: 0;
            cursor: pointer;
            touch-action: manipulation;
        }
        .lf-tab-act-btn.lf-act-primary {
            background: #4f46e5;
            border-color: #6366f1;
        }
        .lf-tab-act-btn.lf-act-edit-on {
            background: #059669;
            border-color: #10b981;
        }
        .lf-tab-act-btn.lf-act-amber {
            background: rgba(245, 158, 11, 0.25);
            border-color: rgba(251, 191, 36, 0.45);
            color: #fef3c7;
        }
        .lf-tab-sep {
            width: 1px;
            height: 22px;
            background: rgba(255, 255, 255, 0.2);
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(styleEl);

    function showToast(msg) {
        let el = document.getElementById('lfQuickToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'lfQuickToast';
            el.style.cssText = 'position:fixed;bottom:78px;left:50%;transform:translateX(-50%);z-index:950;padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;background:#1e293b;color:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.28);transition:opacity 0.18s;';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        el.style.opacity = '1';
        clearTimeout(el.__t);
        el.__t = setTimeout(() => {
            el.classList.remove('show');
            el.style.opacity = '0';
        }, 2200);
    }

    // -------------------------------------------------------------------------
    // 3. ASYNC LEXICON ACCELERATOR (Eliminates Samsung Freeze When Opening/Searching Lexicons!)
    //    Yields 1 animation frame so the UI responds IMMEDIATELY, then runs search & debounces typing.
    // -------------------------------------------------------------------------
    function installAsyncLexiconAccelerator() {
        if (!state.perfMode && !state.isTouch) return;

        // Wrap Thayer's / Abbott-Smith search so opening & typing never blocks the tap frame
        if (typeof window.executeThayersSearch === 'function' && !window.executeThayersSearch.__lfAccelerated) {
            const origThayers = window.executeThayersSearch;
            let thTimer = 0;
            const wrapped = function (...args) {
                const container = document.getElementById('thayersResultsContainer');
                if (container && !container.dataset.lfBusy) {
                    container.dataset.lfBusy = '1';
                    if (!container.children.length) {
                        container.innerHTML = '<div class="p-6 text-center text-xs text-indigo-600 dark:text-indigo-300 font-semibold"><i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Loading Greek lexicon…</div>';
                    }
                }
                clearTimeout(thTimer);
                thTimer = setTimeout(() => {
                    try { origThayers.apply(this, args); } finally {
                        if (container) delete container.dataset.lfBusy;
                    }
                }, 40);
            };
            wrapped.__lfAccelerated = true;
            window.executeThayersSearch = wrapped;
        }

        // Wrap BDB / Gesenius search the exact same way
        if (typeof window.executeBdbSearch === 'function' && !window.executeBdbSearch.__lfAccelerated) {
            const origBdb = window.executeBdbSearch;
            let bdbTimer = 0;
            const wrapped = function (...args) {
                const container = document.getElementById('bdbResultsContainer');
                if (container && !container.dataset.lfBusy) {
                    container.dataset.lfBusy = '1';
                    if (!container.children.length) {
                        container.innerHTML = '<div class="p-6 text-center text-xs text-teal-600 dark:text-teal-300 font-semibold"><i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Loading Hebrew lexicon…</div>';
                    }
                }
                clearTimeout(bdbTimer);
                bdbTimer = setTimeout(() => {
                    try { origBdb.apply(this, args); } finally {
                        if (container) delete container.dataset.lfBusy;
                    }
                }, 40);
            };
            wrapped.__lfAccelerated = true;
            window.executeBdbSearch = wrapped;
        }

        // Debounce rapid keyboard typing in lexicon inputs on Android tablets (220ms)
        const debounceInput = (inputId, fnName) => {
            const inp = document.getElementById(inputId);
            if (!inp || inp.dataset.lfDebounced) return;
            inp.dataset.lfDebounced = '1';
            // Remove inline oninput handler that fires synchronously on every single keypress
            if (inp.hasAttribute('oninput')) {
                inp.removeAttribute('oninput');
                let t = 0;
                inp.addEventListener('input', () => {
                    clearTimeout(t);
                    t = setTimeout(() => {
                        if (typeof window[fnName] === 'function') window[fnName]();
                    }, 220);
                });
            }
        };
        debounceInput('thayersSearchInput', 'executeThayersSearch');
        debounceInput('bdbSearchInput', 'executeBdbSearch');

        // Make Tools Sidebar open smoothly with a backdrop tap-to-close on tablets
        if (state.isTouch) {
            document.addEventListener('click', (e) => {
                const sidebar = document.querySelector('aside:not(#lfStudyDock)');
                if (!sidebar) return;
                const isVisible = !sidebar.classList.contains('hidden') && sidebar.getBoundingClientRect().width > 40;
                if (!isVisible) return;
                if (e.target.closest('aside:not(#lfStudyDock)') || e.target.closest('#sidebarToggleBtn')) return;
                // User tapped outside the floating Tools sidebar -> close it cleanly
                if (typeof window.toggleToolsSidebar === 'function') {
                    window.toggleToolsSidebar();
                }
            }, true);
        }
    }

    // -------------------------------------------------------------------------
    // 4. SMART READING LOCK (Prevents Keyboard Lag & Popups on Tablets)
    // -------------------------------------------------------------------------
    function applyEditorReadLock(lockOn, announce = false) {
        state.readLock = !!lockOn;
        const ed = document.getElementById('flowEditor');
        if (ed) {
            ed.setAttribute('spellcheck', 'false');
            ed.setAttribute('autocorrect', 'off');
            ed.setAttribute('autocapitalize', 'off');
            if (state.isTouch) {
                ed.setAttribute('contenteditable', state.readLock ? 'false' : 'true');
            }
        }
        updateTabletBarUI();
        if (announce) {
            showToast(state.readLock
                ? 'Reading Lock ON: Tap verses freely without keyboard popups'
                : 'Edit Mode ON: Keyboard enabled for typing & splitting');
        }
    }

    function togglePerfMode() {
        state.perfMode = !state.perfMode;
        document.documentElement.classList.toggle('lf-tablet-turbo', state.perfMode);
        try { localStorage.setItem('lexflow_tablet_perf_mode', String(state.perfMode)); } catch (e) {}
        const btn = document.getElementById('lfTabletTurboBtn');
        if (btn) {
            btn.classList.toggle('!bg-emerald-600', state.perfMode);
            btn.classList.toggle('!text-white', state.perfMode);
            btn.innerHTML = `<i class="fa-solid fa-gauge-high text-[11px]"></i><span>${state.perfMode ? 'Turbo: On' : 'Turbo: Off'}</span>`;
        }
        if (state.perfMode) installAsyncLexiconAccelerator();
        showToast(state.perfMode
            ? 'Turbo Mode ON: Zero-blur fast touch mode'
            : 'Turbo Mode OFF: Full desktop glass blur restored');
    }

    // -------------------------------------------------------------------------
    // 5. TOUCH-FRIENDLY CLAUSE INDENT / OUTDENT / LOOKUP HELPERS
    // -------------------------------------------------------------------------
    function parseIndentLevel(el) {
        if (!el || !el.style || !el.style.marginLeft) return 0;
        const ml = el.style.marginLeft.trim();
        const val = parseFloat(ml) || 0;
        if (val <= 0) return 0;
        return ml.endsWith('rem') || ml.endsWith('em')
            ? Math.min(6, Math.max(1, Math.round(val / 2.1)))
            : Math.min(6, Math.max(1, Math.round(val / 32)));
    }

    function adjustActiveBlockIndent(delta) {
        const blk = state.activeBlock || (typeof lastSelectedBlock !== 'undefined' ? lastSelectedBlock : null);
        if (!blk || !blk.dataset || !blk.dataset.bookNum) {
            showToast('Tap a verse or clause first to indent or outdent it.');
            return;
        }
        if (document.body.classList.contains('hide-text-flow') && typeof window.toggleTextFlowVisibility === 'function') {
            window.toggleTextFlowVisibility(true, true);
        }
        const cur = parseIndentLevel(blk);
        const next = Math.max(0, Math.min(6, cur + delta));
        if (next === 0) {
            blk.style.marginLeft = '';
            blk.classList.remove('has-indent');
        } else {
            blk.style.marginLeft = `${next * 2.25}rem`;
            blk.classList.add('has-indent');
        }
        blk.dataset.edited = 'true';
        if (typeof window.refreshDocumentBlockAttributes === 'function') window.refreshDocumentBlockAttributes();
        if (typeof window.syncOverlayControls === 'function') window.syncOverlayControls();
        if (typeof window.saveActiveProjectData === 'function') window.saveActiveProjectData(false);
    }

    function getActiveBookNum() {
        const blk = state.activeBlock ||
                    (typeof lastSelectedBlock !== 'undefined' ? lastSelectedBlock : null) ||
                    (typeof findTopVisibleVerseBlock === 'function' ? findTopVisibleVerseBlock() : null);
        return (blk && blk.dataset && blk.dataset.bookNum) ? parseInt(blk.dataset.bookNum, 10) : 43;
    }

    function cleanWord(raw) {
        return String(raw || '').trim().replace(/^[^A-Za-z\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF]+|[^A-Za-z\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF]+$/g, '');
    }

    function lookupActiveTouchSelection() {
        const sel = window.getSelection();
        const picked = cleanWord(sel ? sel.toString() : '') || state.selectedWord;
        const bookNum = getActiveBookNum();
        const isHeb = /[\u0590-\u05FF]/.test(picked) || (!/[\u0370-\u03FF\u1F00-\u1FFF]/.test(picked) && bookNum <= 39);

        if (isHeb) {
            if (typeof window.openBdbModal === 'function') window.openBdbModal(picked);
            else if (typeof window.lfOpenStudyDock === 'function') window.lfOpenStudyDock('lexicon', 'hebrew');
        } else {
            if (typeof window.openThayersModal === 'function') window.openThayersModal(picked);
            else if (typeof window.lfOpenStudyDock === 'function') window.lfOpenStudyDock('lexicon', 'greek');
        }
    }

    function openClauseNoteForActiveBlock() {
        const blk = state.activeBlock || (typeof lastSelectedBlock !== 'undefined' ? lastSelectedBlock : null);
        if (blk && typeof window.openNoteDrawer === 'function') {
            window.openNoteDrawer(blk);
            return;
        }
        if (typeof window.lfOpenStudyDock === 'function') {
            window.lfOpenStudyDock('notes', 'master');
        } else if (typeof window.toggleMasterNoteDrawer === 'function') {
            window.toggleMasterNoteDrawer();
        }
    }

    // -------------------------------------------------------------------------
    // 6. FLOATING TABLET TOUCH ACTION BAR
    // -------------------------------------------------------------------------
    function buildTabletActionBar() {
        if (document.getElementById('lfTabletActionBar')) return;

        const bar = document.createElement('div');
        bar.id = 'lfTabletActionBar';
        if (state.isTouch) bar.classList.add('visible');

        bar.innerHTML = `
            <button type="button" id="lfTabActLookup" class="lf-tab-act-btn lf-act-primary" title="Look up highlighted word in Greek/Hebrew Lexicon">
                <i class="fa-solid fa-book-atlas"></i><span id="lfTabActLookupLabel">Lexicon</span>
            </button>
            <button type="button" id="lfTabActCompare" class="lf-tab-act-btn" title="Compare Bible translations for tapped verse">
                <i class="fa-solid fa-code-compare text-sky-400"></i><span>Compare</span>
            </button>
            <button type="button" id="lfTabActBrief" class="lf-tab-act-btn" title="Open MACULA Passage Brief">
                <i class="fa-solid fa-sparkles text-teal-400"></i><span>Brief</span>
            </button>
            <button type="button" id="lfTabActNote" class="lf-tab-act-btn" title="Open Notes for tapped clause">
                <i class="fa-solid fa-note-sticky text-amber-400"></i><span>Note</span>
            </button>
            <span class="lf-tab-sep"></span>
            <button type="button" id="lfTabActOutdent" class="lf-tab-act-btn" title="Move clause left (Outdent)">
                <i class="fa-solid fa-outdent"></i>
            </button>
            <button type="button" id="lfTabActIndent" class="lf-tab-act-btn" title="Move clause right (Indent)">
                <i class="fa-solid fa-indent"></i>
            </button>
            <span class="lf-tab-sep"></span>
            <button type="button" id="lfTabActEditToggle" class="lf-tab-act-btn lf-act-amber" title="Switch between Reading Lock and Edit Mode">
                <i class="fa-solid fa-lock text-[11px]"></i><span>Read Lock</span>
            </button>
        `;

        document.body.appendChild(bar);

        document.getElementById('lfTabActLookup').addEventListener('click', lookupActiveTouchSelection);
        document.getElementById('lfTabActCompare').addEventListener('click', () => {
            if (typeof window.lfOpenStudyDock === 'function') window.lfOpenStudyDock('compare');
        });
        document.getElementById('lfTabActBrief').addEventListener('click', () => {
            if (typeof window.lfOpenPassageBrief === 'function') window.lfOpenPassageBrief();
        });
        document.getElementById('lfTabActNote').addEventListener('click', openClauseNoteForActiveBlock);
        document.getElementById('lfTabActOutdent').addEventListener('click', () => adjustActiveBlockIndent(-1));
        document.getElementById('lfTabActIndent').addEventListener('click', () => adjustActiveBlockIndent(1));
        document.getElementById('lfTabActEditToggle').addEventListener('click', () => applyEditorReadLock(!state.readLock, true));

        updateTabletBarUI();
    }

    function updateTabletBarUI() {
        const lookupLabel = document.getElementById('lfTabActLookupLabel');
        if (lookupLabel) {
            if (state.selectedWord) {
                const shortW = state.selectedWord.length > 14 ? state.selectedWord.slice(0, 13) + '…' : state.selectedWord;
                lookupLabel.textContent = `“${shortW}”`;
            } else {
                lookupLabel.textContent = 'Lexicon';
            }
        }
        const editBtn = document.getElementById('lfTabActEditToggle');
        if (editBtn) {
            if (state.readLock) {
                editBtn.classList.remove('lf-act-edit-on');
                editBtn.classList.add('lf-act-amber');
                editBtn.innerHTML = `<i class="fa-solid fa-lock text-[11px]"></i><span>Read Lock</span>`;
            } else {
                editBtn.classList.remove('lf-act-amber');
                editBtn.classList.add('lf-act-edit-on');
                editBtn.innerHTML = `<i class="fa-solid fa-pen text-[11px]"></i><span>Editing</span>`;
            }
        }
    }

    // -------------------------------------------------------------------------
    // 7. UPGRADE STUDY DOCK WITH TOUCH RESIZING (LANDSCAPE + PORTRAIT BOTTOM SHEET)
    // -------------------------------------------------------------------------
    function enhanceStudyDockForTouch() {
        const dock = document.getElementById('lfStudyDock');
        if (!dock || dock.dataset.lfTouchUpgraded) return false;
        dock.dataset.lfTouchUpgraded = 'true';

        dock.style.setProperty('--lf-sheet-h', `${Math.max(32, Math.min(82, state.sheetHeightPct))}dvh`);

        const dragBar = document.createElement('div');
        dragBar.id = 'lfSheetDragBar';
        dragBar.innerHTML = `
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Drag</span>
            <div id="lfSheetDragPill"></div>
            <button type="button" id="lfSheetToggleHeightBtn" class="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 cursor-pointer">
                Tall
            </button>
        `;
        dock.prepend(dragBar);

        const toggleBtn = document.getElementById('lfSheetToggleHeightBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                state.sheetExpanded = !state.sheetExpanded;
                const nextPct = state.sheetExpanded ? 78 : 50;
                state.sheetHeightPct = nextPct;
                dock.style.setProperty('--lf-sheet-h', `${nextPct}dvh`);
                toggleBtn.textContent = state.sheetExpanded ? 'Half' : 'Tall';
                try { localStorage.setItem('lexflow_tablet_sheet_h', String(nextPct)); } catch (err) {}
            });
        }

        let startY = 0, startH = 0, draggingSheet = false;
        dragBar.addEventListener('pointerdown', (e) => {
            if (e.target && e.target.closest('button')) return;
            draggingSheet = true;
            startY = e.clientY;
            startH = dock.getBoundingClientRect().height;
            try { dragBar.setPointerCapture(e.pointerId); } catch (err) {}
        });
        dragBar.addEventListener('pointermove', (e) => {
            if (!draggingSheet) return;
            const dy = startY - e.clientY;
            const vh = window.innerHeight || 800;
            const pct = Math.max(30, Math.min(86, Math.round(((startH + dy) / vh) * 100)));
            state.sheetHeightPct = pct;
            dock.style.setProperty('--lf-sheet-h', `${pct}dvh`);
        });
        const stopSheetDrag = () => {
            if (!draggingSheet) return;
            draggingSheet = false;
            try { localStorage.setItem('lexflow_tablet_sheet_h', String(state.sheetHeightPct)); } catch (err) {}
        };
        dragBar.addEventListener('pointerup', stopSheetDrag);
        dragBar.addEventListener('pointercancel', stopSheetDrag);

        const handle = document.getElementById('lfDockResizeHandle');
        if (handle) {
            let startX = 0, startW = 0, draggingSide = false;
            handle.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse') return;
                e.preventDefault();
                draggingSide = true;
                startX = e.clientX;
                startW = dock.getBoundingClientRect().width;
                handle.classList.add('dragging');
                try { handle.setPointerCapture(e.pointerId); } catch (err) {}
            });
            handle.addEventListener('pointermove', (e) => {
                if (!draggingSide) return;
                const dx = startX - e.clientX;
                const nextW = Math.max(320, Math.min(Math.floor(window.innerWidth * 0.68), startW + dx));
                dock.style.width = `${nextW}px`;
                try { localStorage.setItem('lexflow_dock_width', String(nextW)); } catch (err) {}
            });
            const stopSideDrag = () => {
                if (!draggingSide) return;
                draggingSide = false;
                handle.classList.remove('dragging');
            };
            handle.addEventListener('pointerup', stopSideDrag);
            handle.addEventListener('pointercancel', stopSideDrag);
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // 8. TRACK TAPPED VERSE & SELECTED WORD + TOP BAR TURBO BUTTON
    // -------------------------------------------------------------------------
    function wireTouchSelectionTracking() {
        const ed = document.getElementById('flowEditor');
        if (ed) {
            ed.addEventListener('click', (e) => {
                const blk = e.target && e.target.closest('div[data-book-num][data-chapter-num][data-verse-num]');
                if (!blk) return;
                if (state.activeBlock && state.activeBlock !== blk) {
                    state.activeBlock.classList.remove('lf-tablet-active-block');
                }
                state.activeBlock = blk;
                if (state.isTouch) blk.classList.add('lf-tablet-active-block');
                try { window.lastSelectedBlock = blk; } catch (err) {}
            }, { passive: true });
        }

        let selTimer = 0;
        document.addEventListener('selectionchange', () => {
            clearTimeout(selTimer);
            selTimer = setTimeout(() => {
                const sel = window.getSelection();
                const txt = cleanWord(sel ? sel.toString() : '');
                if (txt && txt.length <= 36 && !/\s/.test(txt)) {
                    state.selectedWord = txt;
                } else {
                    state.selectedWord = '';
                }
                updateTabletBarUI();
            }, 120);
        });

        document.addEventListener('click', (e) => {
            if (!state.isTouch) return;
            const pill = e.target && e.target.closest('.lf-mode-pill');
            if (!pill) return;
            const m = pill.dataset.mode;
            if (m === 'read' || m === 'research') {
                applyEditorReadLock(true, false);
            }
        }, true);
    }

    function injectTurboToggleButton() {
        const header = document.querySelector('header');
        const leftGroup = header && header.firstElementChild;
        if (!leftGroup || document.getElementById('lfTabletTurboBtn')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'lfTabletTurboBtn';
        btn.className = 'glass-control px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer';
        if (state.perfMode) {
            btn.classList.add('!bg-emerald-600', '!text-white');
        }
        btn.title = 'Toggle Tablet Turbo Performance Mode';
        btn.innerHTML = `<i class="fa-solid fa-gauge-high text-[11px]"></i><span>${state.perfMode ? 'Turbo: On' : 'Turbo: Off'}</span>`;
        btn.addEventListener('click', togglePerfMode);
        leftGroup.appendChild(btn);
    }

    function initTabletEngine() {
        applyEditorReadLock(state.readLock, false);
        buildTabletActionBar();
        injectTurboToggleButton();
        wireTouchSelectionTracking();
        installAsyncLexiconAccelerator();

        if (!enhanceStudyDockForTouch()) {
            let tries = 0;
            const t = setInterval(() => {
                tries++;
                if (enhanceStudyDockForTouch() || tries > 25) clearInterval(t);
            }, 150);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initTabletEngine, 240));
    } else {
        setTimeout(initTabletEngine, 240);
    }
})();
