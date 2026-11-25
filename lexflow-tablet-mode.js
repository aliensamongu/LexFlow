/* === LEXFLOW PHASE 5 MODULE: IPAD & ANDROID TABLET PERFORMANCE + TOUCH ENGINE === */
(function () {
    if (window.__lfTabletModeLoaded) return;
    window.__lfTabletModeLoaded = true;

    // -------------------------------------------------------------------------
    // 1. SMART DEVICE DETECTION (iPadOS, Samsung/Android Tablets, Touchscreens)
    // -------------------------------------------------------------------------
    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIOS = isIPad || /iPhone|iPod/i.test(ua);
    const hasCoarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    const isTouchDevice = hasCoarsePointer || isAndroid || isIOS || (navigator.maxTouchPoints > 0 && window.innerWidth <= 1400);

    const savedPerfPref = localStorage.getItem('lexflow_tablet_perf_mode');
    // Auto-enable Turbo Tablet Performance on all touch devices/tablets; desktop users can toggle it if desired
    let perfModeOn = savedPerfPref !== null ? (savedPerfPref === 'true') : isTouchDevice;

    const state = {
        isTouch: isTouchDevice,
        isAndroid,
        isIPad,
        isIOS,
        perfMode: perfModeOn,
        readLock: isTouchDevice,       // Prevents annoying virtual keyboard popups while reading/tapping on tablets
        activeBlock: null,
        selectedWord: '',
        sheetHeightPct: parseInt(localStorage.getItem('lexflow_tablet_sheet_h') || '48', 10) || 48,
        sheetExpanded: false
    };

    // Apply body classes immediately so CSS takes effect before first paint settles
    if (state.isTouch) document.documentElement.classList.add('lf-touch-device');
    if (state.isAndroid) document.documentElement.classList.add('lf-android-device');
    if (state.isIOS) document.documentElement.classList.add('lf-ios-device');
    if (state.perfMode) document.documentElement.classList.add('lf-tablet-turbo');

    // -------------------------------------------------------------------------
    // 2. STYLES: GPU PERFORMANCE BOOST + TABLET SPLIT LAYOUT + TOUCH TARGETS
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfTabletEngineStyles';
    styleEl.textContent = `
        /* =====================================================================
           A. TURBO PERFORMANCE ENGINE (Fixes Samsung/Android & iPad lag)
           ===================================================================== */

        /* 1. CSS content-visibility: auto skips painting off-screen verses (up to 7x faster!) */
        html.lf-tablet-turbo #flowEditor > div,
        html.lf-tablet-turbo #parallelOriginalContent > div {
            content-visibility: auto;
            contain-intrinsic-size: auto 38px;
        }

        /* Isolate main workspace & Study Dock so scrolling one never re-layouts the other */
        html.lf-tablet-turbo main,
        html.lf-tablet-turbo #wordProcessorPane,
        html.lf-tablet-turbo #lfStudyDock,
        html.lf-tablet-turbo #parallelOriginalPane {
            contain: layout style;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }

        /* 2. Disable heavy backdrop-filter blurs on tablets (biggest GPU bottleneck on Samsung/Android!) */
        html.lf-tablet-turbo .glass-panel,
        html.lf-tablet-turbo .glass-control,
        html.lf-tablet-turbo #lfCmdPaletteOverlay,
        html.lf-tablet-turbo #lfExportStudioModal,
        html.lf-tablet-turbo header,
        html.lf-tablet-turbo aside {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
        html.lf-tablet-turbo .glass-panel {
            background: rgba(255, 255, 255, 0.97) !important;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08) !important;
        }
        html.dark.lf-tablet-turbo .glass-panel {
            background: rgba(24, 24, 27, 0.97) !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45) !important;
        }
        html.lf-tablet-turbo .glass-control {
            background: rgba(248, 250, 252, 0.96) !important;
        }
        html.dark.lf-tablet-turbo .glass-control {
            background: rgba(39, 39, 42, 0.96) !important;
        }

        /* Use dynamic viewport height (100dvh) + iPad/Android safe areas */
        html.lf-touch-device,
        html.lf-touch-device body {
            height: 100dvh !important;
            max-height: 100dvh !important;
            padding-top: env(safe-area-inset-top, 0px);
            padding-bottom: env(safe-area-inset-bottom, 0px);
            touch-action: manipulation;
        }

        /* Prevent iPad Safari auto-zoom when tapping inputs (< 16px triggers zoom on iOS/iPadOS) */
        html.lf-touch-device input[type="text"],
        html.lf-touch-device input[type="search"],
        html.lf-touch-device select,
        html.lf-touch-device textarea {
            font-size: 16px !important;
        }

        /* =====================================================================
           B. RESPONSIVE HEADER FIX (Stops buttons clipping off right edge!)
           ===================================================================== */
        @media (max-width: 1320px), (pointer: coarse) {
            header {
                flex-wrap: wrap !important;
                gap: 6px !important;
                padding: 6px 10px !important;
                overflow-x: hidden !important;
            }
            header > div {
                display: flex !important;
                flex-wrap: nowrap !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
                scrollbar-width: none !important;
                max-width: 100% !important;
                width: 100% !important;
                gap: 6px !important;
                padding-bottom: 2px;
                align-items: center !important;
            }
            header > div::-webkit-scrollbar {
                display: none !important;
            }
            header > div > * {
                flex-shrink: 0 !important;
            }
        }

        /* Comfortable 40px+ finger tap targets on tablets */
        html.lf-touch-device header button,
        html.lf-touch-device .lf-mode-pill,
        html.lf-touch-device .lf-dock-tab-btn,
        html.lf-touch-device .lf-dock-sub-btn,
        html.lf-touch-device .lf-brief-pill,
        html.lf-touch-device .lf-rq-btn {
            min-height: 36px;
            touch-action: manipulation;
        }
        html.lf-touch-device .lf-kbd {
            display: none !important;
        }

        /* Active tapped verse subtle highlight on tablets */
        #flowEditor > div.lf-tablet-active-block {
            background: rgba(99, 102, 241, 0.08) !important;
            border-radius: 8px;
        }
        html.dark #flowEditor > div.lf-tablet-active-block {
            background: rgba(129, 140, 248, 0.14) !important;
        }

        /* Extra bottom breathing room in editor so floating tablet bar never covers last verse */
        html.lf-touch-device #flowEditor {
            padding-bottom: 110px !important;
        }

        /* =====================================================================
           C. TABLET SPLIT-SCREEN STUDY DOCK (Landscape Side-by-Side + Portrait Bottom Sheet)
           ===================================================================== */

        /* Landscape Tablets (900px - 1366px): Keep Study Dock side-by-side instead of full-screen overlay! */
        @media (min-width: 900px) and (max-width: 1023px) {
            #lfStudyDock.open {
                position: relative !important;
                inset: auto !important;
                width: 45vw !important;
                min-width: 320px !important;
                max-width: 58vw !important;
                height: 100% !important;
                z-index: 45 !important;
            }
            #lfDockResizeHandle {
                display: block !important;
                width: 18px !important;
                left: -6px !important;
                touch-action: none !important;
            }
        }

        /* Wider finger-friendly drag handle on ALL touchscreens in landscape */
        html.lf-touch-device #lfDockResizeHandle {
            width: 18px !important;
            left: -4px !important;
            touch-action: none !important;
        }
        html.lf-touch-device #lfDockResizeHandle::after {
            content: '';
            position: absolute;
            left: 7px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 44px;
            border-radius: 999px;
            background: rgba(148, 163, 184, 0.55);
        }

        /* Portrait Tablets & Narrow Split-Screen (< 900px): Resizable Bottom Sheet so Bible stays visible on top! */
        #lfSheetDragBar {
            display: none;
        }
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
                height: var(--lf-sheet-h, 48dvh) !important;
                border-radius: 18px !important;
                z-index: 480 !important;
                box-shadow: 0 -10px 35px rgba(15, 23, 42, 0.28) !important;
                border: 1.5px solid rgba(99, 102, 241, 0.38) !important;
            }
            #lfDockResizeHandle {
                display: none !important;
            }
            #lfSheetDragBar {
                display: flex !important;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 7px 12px 3px;
                cursor: row-resize;
                touch-action: none;
                background: rgba(248, 250, 252, 0.9);
                flex-shrink: 0;
            }
            html.dark #lfSheetDragBar {
                background: rgba(24, 24, 27, 0.92);
            }
            #lfSheetDragPill {
                width: 46px;
                height: 5px;
                border-radius: 999px;
                background: rgba(148, 163, 184, 0.75);
            }
            /* Reserve bottom space in Bible pane so user can scroll verses above the open bottom sheet */
            body.lf-dock-open #wordProcessorPane {
                padding-bottom: 52dvh !important;
            }
        }

        /* =====================================================================
           D. FLOATING TABLET TOUCH ACTION BAR (Replaces Right-Click & Hover!)
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
            max-width: calc(100vw - 20px);
            overflow-x: auto;
            scrollbar-width: none;
            border-radius: 16px;
            background: rgba(15, 23, 42, 0.94);
            border: 1.5px solid rgba(129, 140, 248, 0.45);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
            color: #ffffff;
        }
        #lfTabletActionBar::-webkit-scrollbar { display: none; }
        html.lf-touch-device #lfTabletActionBar.visible {
            display: flex;
        }
        /* Hide floating bar while full bottom-sheet dock covers bottom on portrait tablets */
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
            background: rgba(255, 255, 255, 0.11);
            border: 1px solid rgba(255, 255, 255, 0.14);
            white-space: nowrap;
            flex-shrink: 0;
            cursor: pointer;
            touch-action: manipulation;
        }
        .lf-tab-act-btn:active {
            background: #4f46e5;
            transform: scale(0.97);
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
            el.style.cssText = 'position:fixed;bottom:76px;left:50%;transform:translateX(-50%);z-index:950;padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;background:#1e293b;color:#fff;box-shadow:0 10px 25px rgba(0,0,0,0.25);transition:opacity 0.2s;';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        el.style.opacity = '1';
        clearTimeout(el.__t);
        el.__t = setTimeout(() => {
            el.classList.remove('show');
            el.style.opacity = '0';
        }, 2300);
    }

    // -------------------------------------------------------------------------
    // 3. SMART READING LOCK (Prevents Keyboard Lag & Popups on Tablets)
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
                ? 'Reading Mode: Tap verses freely without keyboard popups'
                : 'Edit Mode: Keyboard & cursor enabled for typing/splitting');
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
        showToast(state.perfMode
            ? 'Tablet Turbo Mode ON: Smooth scrolling, low GPU load'
            : 'Tablet Turbo Mode OFF: Full desktop glass blur restored');
    }

    // -------------------------------------------------------------------------
    // 4. TOUCH-FRIENDLY CLAUSE INDENT / OUTDENT / SPLIT HELPERS
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
        // Make sure Thought Flow lines are visible when indenting
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
    // 5. BUILD FLOATING TABLET TOUCH BAR (Replaces Hover & Right-Click)
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
            <button type="button" id="lfTabActEditToggle" class="lf-tab-act-btn lf-act-amber" title="Switch between Reading Lock (no keyboard popups) and Edit Text">
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
    // 6. UPGRADE STUDY DOCK WITH TOUCH RESIZING (LANDSCAPE + PORTRAIT BOTTOM SHEET)
    // -------------------------------------------------------------------------
    function enhanceStudyDockForTouch() {
        const dock = document.getElementById('lfStudyDock');
        if (!dock || dock.dataset.lfTouchUpgraded) return false;
        dock.dataset.lfTouchUpgraded = 'true';

        dock.style.setProperty('--lf-sheet-h', `${Math.max(32, Math.min(82, state.sheetHeightPct))}dvh`);

        // A. Add draggable top bar for Portrait Bottom Sheet mode (< 900px)
        const dragBar = document.createElement('div');
        dragBar.id = 'lfSheetDragBar';
        dragBar.innerHTML = `
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Drag</span>
            <div id="lfSheetDragPill"></div>
            <button type="button" id="lfSheetToggleHeightBtn" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 cursor-pointer">
                Tall
            </button>
        `;
        dock.prepend(dragBar);

        const toggleBtn = document.getElementById('lfSheetToggleHeightBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                state.sheetExpanded = !state.sheetExpanded;
                const nextPct = state.sheetExpanded ? 78 : 48;
                state.sheetHeightPct = nextPct;
                dock.style.setProperty('--lf-sheet-h', `${nextPct}dvh`);
                toggleBtn.textContent = state.sheetExpanded ? 'Half' : 'Tall';
                try { localStorage.setItem('lexflow_tablet_sheet_h', String(nextPct)); } catch (err) {}
            });
        }

        // Touch / Pointer drag for Portrait Bottom Sheet height
        let startY = 0;
        let startH = 0;
        let draggingSheet = false;

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

        // B. Upgrade Landscape Left-Edge Resize Handle with Touch / Stylus Pointer Events
        const handle = document.getElementById('lfDockResizeHandle');
        if (handle) {
            let startX = 0;
            let startW = 0;
            let draggingSide = false;

            handle.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse') return; // Mouse already handled by Phase 2
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
                const nextW = Math.max(320, Math.min(Math.floor(window.innerWidth * 0.65), startW + dx));
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
    // 7. TRACK TAPPED VERSE & SELECTED WORD + TOP BAR TURBO BUTTON
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

        // Throttled selectionchange listener so picking a word with your finger updates the Lexicon button live
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
            }, 90);
        });

        // Automatically unlock editor when switching to Flow mode on a tablet, and re-lock on Read mode
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
        btn.title = 'Toggle Tablet Turbo Performance Mode (faster scrolling & battery savings on iPad and Android tablets)';
        btn.innerHTML = `<i class="fa-solid fa-gauge-high text-[11px]"></i><span>${state.perfMode ? 'Turbo: On' : 'Turbo: Off'}</span>`;
        btn.addEventListener('click', togglePerfMode);
        leftGroup.appendChild(btn);
    }

    function initTabletEngine() {
        applyEditorReadLock(state.readLock, false);
        buildTabletActionBar();
        injectTurboToggleButton();
        wireTouchSelectionTracking();

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
