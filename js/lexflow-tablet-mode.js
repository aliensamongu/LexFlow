/* === LEXFLOW PHASE 5 MODULE (v3): SAMSUNG ANDROID & IPAD PERFORMANCE + DRAGGABLE CURSOR & INDENT HANDLES === */
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
    const isTouchDevice = anyCoarse || isAndroid || isIOS || hasTouchHardware;

    const savedPerfPref = localStorage.getItem('lexflow_tablet_perf_mode');
    const savedHandlesPref = localStorage.getItem('lexflow_tablet_handles_on');

    const state = {
        isTouch: isTouchDevice,
        isAndroid,
        isIPad,
        isIOS,
        perfMode: savedPerfPref !== null ? (savedPerfPref === 'true') : isTouchDevice,
        handlesEnabled: savedHandlesPref !== null ? (savedHandlesPref === 'true') : isTouchDevice,
        readLock: isTouchDevice,
        activeBlock: null,
        selectedWord: '',
        sheetHeightPct: parseInt(localStorage.getItem('lexflow_tablet_sheet_h') || '50', 10) || 50,
        sheetExpanded: false,
        // Active draggable cursor state
        cursorBlock: null,
        cursorNode: null,
        cursorOffset: 0,
        cursorRect: null
    };

    if (state.isTouch) document.documentElement.classList.add('lf-touch-device');
    if (state.isAndroid) document.documentElement.classList.add('lf-android-device');
    if (state.isIOS) document.documentElement.classList.add('lf-ios-device');
    if (state.perfMode) document.documentElement.classList.add('lf-tablet-turbo');

    // -------------------------------------------------------------------------
    // 2. STYLES: TURBO GPU + ZERO-REFLOW + WRAPPING HEADER + DRAGGABLE HANDLES
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfTabletEngineStyles';
    styleEl.textContent = `
        /* =====================================================================
           A. TURBO GPU & ZERO-REFLOW ENGINE (Fixes Samsung Android Lag)
           ===================================================================== */
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

        html.lf-tablet-turbo main,
        html.lf-tablet-turbo #wordProcessorPane,
        html.lf-tablet-turbo #lfStudyDock,
        html.lf-tablet-turbo #parallelOriginalPane {
            contain: layout style;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }

        html.lf-touch-device body.lf-dock-open #wordProcessorPane {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }

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
           B. CLEAN WRAPPING HEADER & SUB-BAR (Zero Clipped Buttons!)
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
            header > div {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: 6px !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
            }
            header > div > * {
                margin-left: 0 !important;
                flex-shrink: 0 !important;
            }
            header button,
            header .lf-mode-pill,
            header select {
                white-space: nowrap !important;
                line-height: 1.2 !important;
                min-height: 34px;
            }
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
            header > div > .glass-control > div.w-px {
                display: none !important;
            }
            header .lf-kbd {
                display: none !important;
            }
        }

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

        @media (max-width: 1180px) {
            #wordProcessorPane {
                padding-left: 1.25rem !important;
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

        #flowEditor > div.lf-tablet-active-block {
            background: rgba(99, 102, 241, 0.08) !important;
            border-radius: 8px;
        }
        html.dark #flowEditor > div.lf-tablet-active-block {
            background: rgba(129, 140, 248, 0.14) !important;
        }
        html.lf-touch-device #flowEditor {
            padding-bottom: 130px !important;
        }

        /* =====================================================================
           C. ZERO-REFLOW OVERLAY SIDEBAR & STUDY DOCK ON TABLETS
           ===================================================================== */
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

        #lfSheetDragBar { display: none; }

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
           D. DRAGGABLE CURSOR HANDLE (LINE BREAKS) & INDENT HANDLE (SLIDING INDENT)
           ===================================================================== */

        /* 1. Draggable Teardrop Cursor Handle */
        #lfCursorOverlay {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 455;
            display: none;
            pointer-events: none;
            will-change: transform;
        }
        #lfCursorOverlay.visible { display: block; }

        /* Crisp vertical cursor bar */
        #lfCursorBar {
            position: absolute;
            left: -1.5px;
            top: 0;
            width: 3px;
            height: 24px;
            border-radius: 2px;
            background: #4f46e5;
            box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.85);
        }
        html.dark #lfCursorBar {
            background: #818cf8;
            box-shadow: 0 0 0 1.5px rgba(15, 23, 42, 0.85);
        }

        /* Finger/S-Pen draggable teardrop knob below the text line (so finger never covers words!) */
        #lfCursorKnob {
            position: absolute;
            left: -19px;
            top: 24px;
            width: 38px;
            height: 38px;
            pointer-events: auto;
            touch-action: none;
            cursor: grab;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 2px;
        }
        #lfCursorKnob:active,
        #lfCursorKnob.dragging {
            cursor: grabbing;
        }
        #lfCursorDrop {
            width: 22px;
            height: 22px;
            background: linear-gradient(135deg, #4f46e5, #0284c7);
            border: 2.5px solid #ffffff;
            border-radius: 0 50% 50% 50%;
            transform: rotate(45deg);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.45);
            transition: transform 0.08s ease;
        }
        #lfCursorKnob.dragging #lfCursorDrop {
            transform: rotate(45deg) scale(1.18);
            background: linear-gradient(135deg, #6366f1, #0ea5e9);
        }

        /* Mini floating pill right above the cursor line: [✂ Break] [↰ Join] [✕] */
        #lfCursorMiniPill {
            position: fixed;
            z-index: 458;
            display: none;
            align-items: center;
            gap: 4px;
            padding: 4px 6px;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.94);
            border: 1.5px solid rgba(129, 140, 248, 0.55);
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.32);
            pointer-events: auto;
            white-space: nowrap;
        }
        #lfCursorMiniPill.visible { display: flex; }

        .lf-mini-pill-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border-radius: 999px;
            font-size: 11.5px;
            font-weight: 800;
            border: none;
            cursor: pointer;
            touch-action: manipulation;
            color: #ffffff;
            background: #4f46e5;
        }
        .lf-mini-pill-btn.lf-btn-join {
            background: #0d9488;
        }
        .lf-mini-pill-btn.lf-btn-dismiss {
            padding: 5px 8px;
            background: rgba(255, 255, 255, 0.14);
            color: #cbd5e1;
        }

        /* 2. Left-Edge Draggable Indent Grip Handle */
        #lfIndentHandle {
            position: fixed;
            z-index: 456;
            display: none;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 32px;
            border-radius: 10px;
            background: linear-gradient(180deg, #4f46e5, #0284c7);
            border: 2px solid #ffffff;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.42);
            cursor: ew-resize;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            font-size: 11px;
        }
        #lfIndentHandle.visible { display: flex; }
        #lfIndentHandle.dragging {
            transform: scale(1.14);
            background: linear-gradient(180deg, #059669, #0d9488);
        }

        #lfIndentBadge {
            position: fixed;
            z-index: 462;
            display: none;
            padding: 4px 10px;
            border-radius: 999px;
            background: #059669;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
            pointer-events: none;
        }
        #lfIndentBadge.visible { display: block; }

        /* =====================================================================
           E. FLOATING TABLET TOUCH ACTION BAR
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
        .lf-tab-act-btn.lf-act-teal {
            background: #0d9488;
            border-color: #14b8a6;
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
    // 3. DRAGGABLE CURSOR HANDLE (LINE BREAKS) + DRAGGABLE LEFT INDENT HANDLE
    // -------------------------------------------------------------------------
    function getRawCaretFromPoint(x, y) {
        if (document.caretRangeFromPoint) {
            const r = document.caretRangeFromPoint(x, y);
            if (r && r.startContainer) return { node: r.startContainer, offset: r.startOffset };
        } else if (document.caretPositionFromPoint) {
            const p = document.caretPositionFromPoint(x, y);
            if (p && p.offsetNode) return { node: p.offsetNode, offset: p.offset };
        }
        return null;
    }

    function getTextNodesInBlock(block) {
        const list = [];
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.length) return NodeFilter.FILTER_REJECT;
                const p = node.parentElement;
                if (p && p.closest('.verse-num, sup, button')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        let n;
        while ((n = walker.nextNode())) list.push(n);
        return list;
    }

    function measureCaretRect(textNode, offset) {
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null;
        const len = textNode.nodeValue.length;
        const clamped = Math.max(0, Math.min(len, offset));
        const r = document.createRange();
        r.setStart(textNode, clamped);
        r.setEnd(textNode, clamped);
        let rect = r.getBoundingClientRect();

        // WebKit/Blink sometimes returns 0x0 for collapsed range at start/end of text node; peek 1 char
        if (!rect || (rect.height === 0 && rect.width === 0)) {
            if (clamped < len) {
                r.setStart(textNode, clamped);
                r.setEnd(textNode, clamped + 1);
                const charRect = r.getBoundingClientRect();
                if (charRect && charRect.height > 0) {
                    return { left: charRect.left, top: charRect.top, height: charRect.height, bottom: charRect.bottom };
                }
            } else if (clamped > 0) {
                r.setStart(textNode, clamped - 1);
                r.setEnd(textNode, clamped);
                const charRect = r.getBoundingClientRect();
                if (charRect && charRect.height > 0) {
                    return { left: charRect.right, top: charRect.top, height: charRect.height, bottom: charRect.bottom };
                }
            }
            return null;
        }
        return { left: rect.left, top: rect.top, height: rect.height || 22, bottom: rect.bottom };
    }

    function snapOffsetToWordBoundary(textNode, rawOffset, targetX) {
        const txt = textNode.nodeValue || '';
        const len = txt.length;
        if (!len) return 0;

        let idx = Math.max(0, Math.min(len, rawOffset));

        // If cursor is inside whitespace, move right to start of next word (or end)
        if (idx < len && /\s/.test(txt[idx])) {
            let right = idx;
            while (right < len && /\s/.test(txt[right])) right++;
            return right;
        }

        // Find start & end of the tapped word
        let wordStart = idx;
        while (wordStart > 0 && !/\s/.test(txt[wordStart - 1])) wordStart--;

        let wordEnd = idx;
        while (wordEnd < len && !/\s/.test(txt[wordEnd])) wordEnd++;
        // Advance past trailing spaces so a break starts cleanly on the next word
        let nextWordStart = wordEnd;
        while (nextWordStart < len && /\s/.test(txt[nextWordStart])) nextWordStart++;

        const rStart = measureCaretRect(textNode, wordStart);
        const rEnd = measureCaretRect(textNode, nextWordStart);

        if (rStart && rEnd && typeof targetX === 'number') {
            return Math.abs(targetX - rStart.left) <= Math.abs(targetX - rEnd.left)
                ? wordStart
                : nextWordStart;
        }
        return (idx - wordStart <= wordEnd - idx) ? wordStart : nextWordStart;
    }

    function resolveWordSnapInBlock(block, clientX, clientY) {
        if (!block) return null;
        const bRect = block.getBoundingClientRect();
        if (bRect.height === 0) return null;

        const clampedX = Math.max(bRect.left + 6, Math.min(bRect.right - 6, clientX));
        const clampedY = Math.max(bRect.top + 6, Math.min(bRect.bottom - 6, clientY));

        let hit = getRawCaretFromPoint(clampedX, clampedY);

        // If raw hit landed outside a valid text node in this block, probe gently inward
        if (!hit || hit.node.nodeType !== Node.TEXT_NODE || !block.contains(hit.node) || (hit.node.parentElement && hit.node.parentElement.closest('.verse-num, sup'))) {
            const probes = [-18, 18, -42, 42];
            for (let i = 0; i < probes.length; i++) {
                const px = Math.max(bRect.left + 6, Math.min(bRect.right - 6, clampedX + probes[i]));
                const testHit = getRawCaretFromPoint(px, clampedY);
                if (testHit && testHit.node.nodeType === Node.TEXT_NODE && block.contains(testHit.node) && !(testHit.node.parentElement && testHit.node.parentElement.closest('.verse-num, sup'))) {
                    hit = testHit;
                    break;
                }
            }
        }

        if (!hit || hit.node.nodeType !== Node.TEXT_NODE || !block.contains(hit.node)) {
            return null;
        }

        const snappedOffset = snapOffsetToWordBoundary(hit.node, hit.offset, clampedX);
        const rect = measureCaretRect(hit.node, snappedOffset);
        if (!rect) return null;

        return { node: hit.node, offset: snappedOffset, rect };
    }

    function canMergeBlockUp(block) {
        if (!block) return false;
        const prev = block.previousElementSibling;
        if (!prev || !prev.dataset || !prev.dataset.verseNum) return false;
        return (
            prev.dataset.bookNum === block.dataset.bookNum &&
            prev.dataset.chapterNum === block.dataset.chapterNum &&
            prev.dataset.verseNum === block.dataset.verseNum
        );
    }

    function canSplitAtCurrentCursor() {
        if (!state.cursorBlock || !state.cursorNode || !state.cursorBlock.contains(state.cursorNode)) return false;
        try {
            const beforeR = document.createRange();
            beforeR.setStart(state.cursorBlock, 0);
            beforeR.setEnd(state.cursorNode, state.cursorOffset);
            const afterR = document.createRange();
            afterR.setStart(state.cursorNode, state.cursorOffset);
            afterR.setEnd(state.cursorBlock, state.cursorBlock.childNodes.length);
            return beforeR.toString().trim().length > 0 && afterR.toString().trim().length > 0;
        } catch (e) {
            return false;
        }
    }

    function trimLeadingWhitespaceInFragment(frag) {
        const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
            const trimmed = n.nodeValue.replace(/^\s+/, '');
            n.nodeValue = trimmed;
            if (trimmed.length > 0) break;
        }
    }

    function trimTrailingWhitespaceInElement(el) {
        const nodes = getTextNodesInBlock(el);
        for (let i = nodes.length - 1; i >= 0; i--) {
            const trimmed = nodes[i].nodeValue.replace(/\s+$/, '');
            nodes[i].nodeValue = trimmed;
            if (trimmed.length > 0) break;
        }
    }

    function executeBreakAtHandle() {
        const block = state.cursorBlock;
        if (!block || !canSplitAtCurrentCursor()) {
            showToast('Drag the blue handle between two words to break the line.');
            return;
        }

        // Reveal Thought Flow lines automatically if currently hidden
        if (document.body.classList.contains('hide-text-flow') && typeof window.toggleTextFlowVisibility === 'function') {
            window.toggleTextFlowVisibility(true, true);
        }

        try {
            const splitRange = document.createRange();
            splitRange.setStart(state.cursorNode, state.cursorOffset);
            splitRange.setEnd(block, block.childNodes.length);
            const tailFrag = splitRange.extractContents();

            trimLeadingWhitespaceInFragment(tailFrag);
            trimTrailingWhitespaceInElement(block);

            const newDiv = document.createElement('div');
            newDiv.dataset.bookNum = block.dataset.bookNum || '';
            newDiv.dataset.bookName = block.dataset.bookName || '';
            newDiv.dataset.chapterNum = block.dataset.chapterNum || '';
            newDiv.dataset.verseNum = block.dataset.verseNum || '';
            newDiv.dataset.splitVerse = 'true';
            newDiv.dataset.verseCont = 'true';
            newDiv.dataset.edited = 'true';
            if (block.dataset.splitVerseEnd === 'true') {
                newDiv.dataset.splitVerseEnd = 'true';
                delete block.dataset.splitVerseEnd;
            }
            block.dataset.splitVerse = 'true';
            block.dataset.edited = 'true';

            // Keep same indent level as the parent clause; user can immediately slide left-edge handle to indent!
            const curLvl = parseIndentLevel(block);
            if (curLvl > 0) {
                newDiv.style.marginLeft = `${curLvl * 2.25}rem`;
                newDiv.classList.add('has-indent');
            }

            newDiv.appendChild(tailFrag);
            block.parentNode.insertBefore(newDiv, block.nextSibling);

            // Switch active focus to the brand-new clause so its Indent Handle appears right away!
            setActiveBlock(newDiv);

            // Place cursor handle at the start/first gap of the new clause (or hide cursor & keep Indent Handle ready)
            hideCursorHandleOnly();
            positionIndentHandleForBlock(newDiv);

            if (typeof window.refreshDocumentBlockAttributes === 'function') window.refreshDocumentBlockAttributes();
            if (typeof window.syncOverlayControls === 'function') window.syncOverlayControls();
            if (typeof window.saveActiveProjectData === 'function') window.saveActiveProjectData(false);

            showToast('Line broken! Drag the left blue grip to indent.');
        } catch (err) {
            console.error(err);
            showToast('Could not split at that spot — try dragging the handle slightly.');
        }
    }

    function executeMergeBlockUp(targetBlock) {
        const block = targetBlock || state.cursorBlock || state.activeBlock;
        if (!canMergeBlockUp(block)) {
            showToast('Only split clauses of the same verse can be merged upward.');
            return;
        }
        const prev = block.previousElementSibling;

        // Add a clean space between the two pieces
        const prevTxt = (prev.textContent || '');
        if (prevTxt.length && !/\s$/.test(prevTxt)) {
            prev.appendChild(document.createTextNode(' '));
        }
        while (block.firstChild) {
            prev.appendChild(block.firstChild);
        }
        if (block.dataset.splitVerseEnd === 'true') {
            prev.dataset.splitVerseEnd = 'true';
        }
        prev.dataset.edited = 'true';
        block.remove();

        setActiveBlock(prev);
        hideCursorHandleOnly();
        positionIndentHandleForBlock(prev);

        if (typeof window.refreshDocumentBlockAttributes === 'function') window.refreshDocumentBlockAttributes();
        if (typeof window.syncOverlayControls === 'function') window.syncOverlayControls();
        if (typeof window.saveActiveProjectData === 'function') window.saveActiveProjectData(false);

        showToast('Merged clause back with line above.');
    }

    function buildHandlesDOM() {
        if (document.getElementById('lfCursorOverlay')) return;

        // 1. Draggable Teardrop Cursor Overlay
        const overlay = document.createElement('div');
        overlay.id = 'lfCursorOverlay';
        overlay.innerHTML = `
            <div id="lfCursorBar"></div>
            <div id="lfCursorKnob" title="Drag left or right across words to move cursor">
                <div id="lfCursorDrop"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // 2. Floating Action Pill above Cursor ([✂ Break] [↰ Join] [✕])
        const pill = document.createElement('div');
        pill.id = 'lfCursorMiniPill';
        pill.innerHTML = `
            <button type="button" id="lfMiniBreakBtn" class="lf-mini-pill-btn">
                <i class="fa-solid fa-scissors text-[10px]"></i><span>Break Line</span>
            </button>
            <button type="button" id="lfMiniJoinBtn" class="lf-mini-pill-btn lf-btn-join hidden">
                <i class="fa-solid fa-arrow-turn-up text-[10px]"></i><span>Join Up</span>
            </button>
            <button type="button" id="lfMiniDismissBtn" class="lf-mini-pill-btn lf-btn-dismiss" title="Hide handle">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        document.body.appendChild(pill);

        // 3. Left-Edge Draggable Indent Handle + Live Level Badge
        const indentHandle = document.createElement('div');
        indentHandle.id = 'lfIndentHandle';
        indentHandle.title = 'Drag left or right to indent or outdent this clause';
        indentHandle.innerHTML = `<i class="fa-solid fa-arrows-left-right"></i>`;
        document.body.appendChild(indentHandle);

        const indentBadge = document.createElement('div');
        indentBadge.id = 'lfIndentBadge';
        document.body.appendChild(indentBadge);

        // Wire Mini Pill Buttons
        document.getElementById('lfMiniBreakBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            executeBreakAtHandle();
        });
        document.getElementById('lfMiniJoinBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            executeMergeBlockUp(state.cursorBlock || state.activeBlock);
        });
        document.getElementById('lfMiniDismissBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            hideAllHandles();
        });

        // Wire Dragging on the Teardrop Cursor Knob (Finger & S-Pen smooth Pointer Capture)
        const knob = document.getElementById('lfCursorKnob');
        let draggingCursor = false;
        let fingerYOffset = 28;
        let rafPending = false;
        let lastMoveX = 0;
        let lastMoveY = 0;

        knob.addEventListener('pointerdown', (e) => {
            if (!state.cursorBlock) return;
            e.preventDefault();
            e.stopPropagation();
            draggingCursor = true;
            knob.classList.add('dragging');
            const caretMidY = state.cursorRect ? (state.cursorRect.top + state.cursorRect.height * 0.5) : (e.clientY - 28);
            fingerYOffset = Math.max(18, Math.min(48, e.clientY - caretMidY));
            try { knob.setPointerCapture(e.pointerId); } catch (err) {}
        });

        knob.addEventListener('pointermove', (e) => {
            if (!draggingCursor || !state.cursorBlock) return;
            e.preventDefault();
            lastMoveX = e.clientX;
            lastMoveY = e.clientY - fingerYOffset;
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(() => {
                    rafPending = false;
                    if (!draggingCursor || !state.cursorBlock) return;
                    const snap = resolveWordSnapInBlock(state.cursorBlock, lastMoveX, lastMoveY);
                    if (snap) {
                        state.cursorNode = snap.node;
                        state.cursorOffset = snap.offset;
                        state.cursorRect = snap.rect;
                        renderCursorHandleVisuals();
                    }
                });
            }
        });

        const endCursorDrag = () => {
            if (!draggingCursor) return;
            draggingCursor = false;
            knob.classList.remove('dragging');
        };
        knob.addEventListener('pointerup', endCursorDrag);
        knob.addEventListener('pointercancel', endCursorDrag);

        // Wire Dragging on the Left-Edge Indent Grip Handle
        let draggingIndent = false;
        let indentStartX = 0;
        let indentStartLevel = 0;
        let lastAppliedLevel = 0;

        indentHandle.addEventListener('pointerdown', (e) => {
            const blk = state.activeBlock;
            if (!blk) return;
            e.preventDefault();
            e.stopPropagation();
            draggingIndent = true;
            indentStartX = e.clientX;
            indentStartLevel = parseIndentLevel(blk);
            lastAppliedLevel = indentStartLevel;
            indentHandle.classList.add('dragging');
            if (document.body.classList.contains('hide-text-flow') && typeof window.toggleTextFlowVisibility === 'function') {
                window.toggleTextFlowVisibility(true, true);
            }
            try { indentHandle.setPointerCapture(e.pointerId); } catch (err) {}
            showIndentLevelBadge(blk, indentStartLevel);
        });

        indentHandle.addEventListener('pointermove', (e) => {
            if (!draggingIndent || !state.activeBlock) return;
            e.preventDefault();
            const dx = e.clientX - indentStartX;
            const stepDelta = Math.round(dx / 30);
            const nextLvl = Math.max(0, Math.min(6, indentStartLevel + stepDelta));
            if (nextLvl !== lastAppliedLevel) {
                lastAppliedLevel = nextLvl;
                applyIndentLevelDirectly(state.activeBlock, nextLvl, false);
                positionIndentHandleForBlock(state.activeBlock);
                if (state.cursorBlock === state.activeBlock && state.cursorNode) {
                    const freshRect = measureCaretRect(state.cursorNode, state.cursorOffset);
                    if (freshRect) {
                        state.cursorRect = freshRect;
                        renderCursorHandleVisuals();
                    }
                }
                showIndentLevelBadge(state.activeBlock, nextLvl);
            }
        });

        const endIndentDrag = () => {
            if (!draggingIndent) return;
            draggingIndent = false;
            indentHandle.classList.remove('dragging');
            indentBadge.classList.remove('visible');
            if (state.activeBlock) {
                if (typeof window.refreshDocumentBlockAttributes === 'function') window.refreshDocumentBlockAttributes();
                if (typeof window.syncOverlayControls === 'function') window.syncOverlayControls();
                if (typeof window.saveActiveProjectData === 'function') window.saveActiveProjectData(false);
            }
        };
        indentHandle.addEventListener('pointerup', endIndentDrag);
        indentHandle.addEventListener('pointercancel', endIndentDrag);

        // Reposition handles smoothly while scrolling the Bible pane
        let scrollRaf = false;
        const onScrollSync = () => {
            if (scrollRaf) return;
            scrollRaf = true;
            requestAnimationFrame(() => {
                scrollRaf = false;
                repositionVisibleHandles();
            });
        };
        const pane = document.getElementById('wordProcessorPane');
        if (pane) pane.addEventListener('scroll', onScrollSync, { passive: true });
        window.addEventListener('resize', onScrollSync, { passive: true });
    }

    function showIndentLevelBadge(blk, lvl) {
        const badge = document.getElementById('lfIndentBadge');
        if (!badge || !blk) return;
        const r = blk.getBoundingClientRect();
        badge.textContent = lvl === 0 ? 'Main Margin (Level 0)' : `Indent Level ${lvl}`;
        badge.style.left = `${Math.max(12, Math.min(window.innerWidth - 150, r.left))}px`;
        badge.style.top = `${Math.max(58, r.top - 32)}px`;
        badge.classList.add('visible');
    }

    function applyIndentLevelDirectly(blk, level, commitSave) {
        if (!blk) return;
        if (level === 0) {
            blk.style.marginLeft = '';
            blk.classList.remove('has-indent');
        } else {
            blk.style.marginLeft = `${level * 2.25}rem`;
            blk.classList.add('has-indent');
        }
        blk.dataset.edited = 'true';
        if (commitSave) {
            if (typeof window.refreshDocumentBlockAttributes === 'function') window.refreshDocumentBlockAttributes();
            if (typeof window.syncOverlayControls === 'function') window.syncOverlayControls();
            if (typeof window.saveActiveProjectData === 'function') window.saveActiveProjectData(false);
        }
    }

    function renderCursorHandleVisuals() {
        const overlay = document.getElementById('lfCursorOverlay');
        const bar = document.getElementById('lfCursorBar');
        const knob = document.getElementById('lfCursorKnob');
        const pill = document.getElementById('lfCursorMiniPill');
        const breakBtn = document.getElementById('lfMiniBreakBtn');
        const joinBtn = document.getElementById('lfMiniJoinBtn');
        if (!overlay || !bar || !knob || !pill || !state.cursorRect) return;

        const r = state.cursorRect;
        const pane = document.getElementById('wordProcessorPane');
        const paneRect = pane ? pane.getBoundingClientRect() : { top: 50, bottom: window.innerHeight - 60 };

        // Hide cleanly if scrolled outside visible reading area
        if (r.bottom < paneRect.top + 30 || r.top > paneRect.bottom - 10) {
            overlay.classList.remove('visible');
            pill.classList.remove('visible');
            return;
        }

        const h = Math.max(18, Math.min(34, r.height || 24));
        overlay.style.transform = `translate3d(${Math.round(r.left)}px, ${Math.round(r.top)}px, 0)`;
        bar.style.height = `${Math.round(h)}px`;
        knob.style.top = `${Math.round(h)}px`;
        overlay.classList.add('visible');

        const splittable = canSplitAtCurrentCursor();
        const joinable = canMergeBlockUp(state.cursorBlock);

        if (breakBtn) {
            breakBtn.style.opacity = splittable ? '1' : '0.45';
        }
        if (joinBtn) {
            joinBtn.classList.toggle('hidden', !joinable);
        }

        pill.classList.add('visible');
        const pillW = pill.offsetWidth || 135;
        const pillLeft = Math.max(10, Math.min(window.innerWidth - pillW - 10, r.left - pillW / 2));
        const pillTop = (r.top - 44 > paneRect.top + 8) ? (r.top - 42) : (r.bottom + 36);
        pill.style.left = `${Math.round(pillLeft)}px`;
        pill.style.top = `${Math.round(pillTop)}px`;
    }

    function positionIndentHandleForBlock(blk) {
        const handle = document.getElementById('lfIndentHandle');
        if (!handle) return;
        if (!blk || !state.handlesEnabled || !document.body.contains(blk)) {
            handle.classList.remove('visible');
            return;
        }
        const pane = document.getElementById('wordProcessorPane');
        const paneRect = pane ? pane.getBoundingClientRect() : { top: 50, bottom: window.innerHeight - 60 };
        const r = blk.getBoundingClientRect();

        if (r.bottom < paneRect.top + 30 || r.top > paneRect.bottom - 10) {
            handle.classList.remove('visible');
            return;
        }

        const leftX = Math.max(4, r.left - 34);
        const topY = r.top + Math.min(4, Math.max(0, (r.height - 32) / 2));
        handle.style.left = `${Math.round(leftX)}px`;
        handle.style.top = `${Math.round(topY)}px`;
        handle.classList.add('visible');
    }

    function repositionVisibleHandles() {
        if (!state.handlesEnabled) {
            hideAllHandles();
            return;
        }
        if (state.activeBlock && document.body.contains(state.activeBlock)) {
            positionIndentHandleForBlock(state.activeBlock);
        }
        if (state.cursorBlock && state.cursorNode && document.body.contains(state.cursorNode)) {
            const fresh = measureCaretRect(state.cursorNode, state.cursorOffset);
            if (fresh) {
                state.cursorRect = fresh;
                renderCursorHandleVisuals();
            } else {
                hideCursorHandleOnly();
            }
        }
    }

    function hideCursorHandleOnly() {
        state.cursorBlock = null;
        state.cursorNode = null;
        state.cursorOffset = 0;
        state.cursorRect = null;
        document.getElementById('lfCursorOverlay')?.classList.remove('visible');
        document.getElementById('lfCursorMiniPill')?.classList.remove('visible');
    }

    function hideAllHandles() {
        hideCursorHandleOnly();
        document.getElementById('lfIndentHandle')?.classList.remove('visible');
        document.getElementById('lfIndentBadge')?.classList.remove('visible');
    }

    function dropCursorHandleAtTap(block, clientX, clientY) {
        if (!state.handlesEnabled || !block) return;
        const snap = resolveWordSnapInBlock(block, clientX, clientY);
        if (!snap) return;
        state.cursorBlock = block;
        state.cursorNode = snap.node;
        state.cursorOffset = snap.offset;
        state.cursorRect = snap.rect;
        renderCursorHandleVisuals();
        positionIndentHandleForBlock(block);
    }

    // -------------------------------------------------------------------------
    // 4. ASYNC LEXICON ACCELERATOR (Eliminates Samsung Freeze!)
    // -------------------------------------------------------------------------
    function installAsyncLexiconAccelerator() {
        if (!state.perfMode && !state.isTouch) return;

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

        const debounceInput = (inputId, fnName) => {
            const inp = document.getElementById(inputId);
            if (!inp || inp.dataset.lfDebounced) return;
            inp.dataset.lfDebounced = '1';
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

        if (state.isTouch) {
            document.addEventListener('click', (e) => {
                const sidebar = document.querySelector('aside:not(#lfStudyDock)');
                if (!sidebar) return;
                const isVisible = !sidebar.classList.contains('hidden') && sidebar.getBoundingClientRect().width > 40;
                if (!isVisible) return;
                if (e.target.closest('aside:not(#lfStudyDock)') || e.target.closest('#sidebarToggleBtn')) return;
                if (typeof window.toggleToolsSidebar === 'function') {
                    window.toggleToolsSidebar();
                }
            }, true);
        }
    }

    // -------------------------------------------------------------------------
    // 5. SMART READING LOCK & WORKSPACE HELPERS
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
        if (!state.readLock) hideAllHandles();
        updateTabletBarUI();
        if (announce) {
            showToast(state.readLock
                ? 'Read Lock ON: Tap any verse for drag handles (no keyboard)'
                : 'Keyboard Edit ON: Type directly inside clauses');
        }
    }

    function toggleHandlesMode() {
        state.handlesEnabled = !state.handlesEnabled;
        try { localStorage.setItem('lexflow_tablet_handles_on', String(state.handlesEnabled)); } catch (e) {}
        if (!state.handlesEnabled) {
            hideAllHandles();
            showToast('Drag Handles OFF: Clean tap reading');
        } else {
            if (!state.readLock) applyEditorReadLock(true, false);
            if (state.activeBlock) positionIndentHandleForBlock(state.activeBlock);
            showToast('Drag Handles ON: Tap any word to drop the cursor handle');
        }
        updateTabletBarUI();
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

    function setActiveBlock(blk) {
        if (state.activeBlock && state.activeBlock !== blk) {
            state.activeBlock.classList.remove('lf-tablet-active-block');
        }
        state.activeBlock = blk;
        if (blk && state.isTouch) blk.classList.add('lf-tablet-active-block');
        try { window.lastSelectedBlock = blk; } catch (err) {}
    }

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
        applyIndentLevelDirectly(blk, next, true);
        repositionVisibleHandles();
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

        hideAllHandles();
        if (isHeb) {
            if (typeof window.openBdbModal === 'function') window.openBdbModal(picked);
            else if (typeof window.lfOpenStudyDock === 'function') window.lfOpenStudyDock('lexicon', 'hebrew');
        } else {
            if (typeof window.openThayersModal === 'function') window.openThayersModal(picked);
            else if (typeof window.lfOpenStudyDock === 'function') window.lfOpenStudyDock('lexicon', 'greek');
        }
    }

    function openClauseNoteForActiveBlock() {
        hideAllHandles();
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
            <button type="button" id="lfTabActHandles" class="lf-tab-act-btn lf-act-teal" title="Toggle Draggable Cursor & Indent Handles">
                <i class="fa-solid fa-i-cursor text-[11px]"></i><span>Handles: On</span>
            </button>
            <button type="button" id="lfTabActOutdent" class="lf-tab-act-btn" title="Move clause left (Outdent)">
                <i class="fa-solid fa-outdent"></i>
            </button>
            <button type="button" id="lfTabActIndent" class="lf-tab-act-btn" title="Move clause right (Indent)">
                <i class="fa-solid fa-indent"></i>
            </button>
            <span class="lf-tab-sep"></span>
            <button type="button" id="lfTabActEditToggle" class="lf-tab-act-btn lf-act-amber" title="Switch between Read Lock (no keyboard) and Keyboard Typing">
                <i class="fa-solid fa-lock text-[11px]"></i><span>Read Lock</span>
            </button>
        `;

        document.body.appendChild(bar);

        document.getElementById('lfTabActLookup').addEventListener('click', lookupActiveTouchSelection);
        document.getElementById('lfTabActCompare').addEventListener('click', () => {
            hideAllHandles();
            if (typeof window.lfOpenStudyDock === 'function') window.lfOpenStudyDock('compare');
        });
        document.getElementById('lfTabActBrief').addEventListener('click', () => {
            hideAllHandles();
            if (typeof window.lfOpenPassageBrief === 'function') window.lfOpenPassageBrief();
        });
        document.getElementById('lfTabActNote').addEventListener('click', openClauseNoteForActiveBlock);
        document.getElementById('lfTabActHandles').addEventListener('click', toggleHandlesMode);
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
        const hBtn = document.getElementById('lfTabActHandles');
        if (hBtn) {
            hBtn.classList.toggle('lf-act-teal', state.handlesEnabled);
            hBtn.innerHTML = `<i class="fa-solid fa-i-cursor text-[11px]"></i><span>${state.handlesEnabled ? 'Handles: On' : 'Handles: Off'}</span>`;
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
                editBtn.innerHTML = `<i class="fa-solid fa-keyboard text-[11px]"></i><span>Keyboard</span>`;
            }
        }
    }

    // -------------------------------------------------------------------------
    // 7. UPGRADE STUDY DOCK WITH TOUCH RESIZING (LANDSCAPE + PORTRAIT SHEET)
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
    // 8. TRACK TAPPED VERSE, DROP DRAGGABLE HANDLES & WIRE TOP BAR BUTTON
    // -------------------------------------------------------------------------
    function wireTouchSelectionTracking() {
        const ed = document.getElementById('flowEditor');
        if (ed) {
            ed.addEventListener('click', (e) => {
                const blk = e.target && e.target.closest('div[data-book-num][data-chapter-num][data-verse-num]');
                if (!blk) return;
                setActiveBlock(blk);

                // If the user just long-pressed to highlight a word for Lexicon, don't cover it with handles
                const sel = window.getSelection();
                if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
                    hideAllHandles();
                    return;
                }

                // On tablets with Handles ON + Read Lock ON, drop our zero-keyboard draggable handles right at the tap!
                if (state.isTouch && state.handlesEnabled && state.readLock) {
                    dropCursorHandleAtTap(blk, e.clientX, e.clientY);
                }
            }, { passive: true });
        }

        // Dismiss handles cleanly if user taps outside the Bible editor & handle controls
        document.addEventListener('click', (e) => {
            if (!state.cursorBlock && !document.getElementById('lfIndentHandle')?.classList.contains('visible')) return;
            if (e.target.closest('#flowEditor, #lfCursorOverlay, #lfCursorMiniPill, #lfIndentHandle, #lfTabletActionBar')) return;
            hideAllHandles();
        }, true);

        let selTimer = 0;
        document.addEventListener('selectionchange', () => {
            clearTimeout(selTimer);
            selTimer = setTimeout(() => {
                const sel = window.getSelection();
                const txt = cleanWord(sel ? sel.toString() : '');
                if (txt && txt.length <= 36 && !/\s/.test(txt)) {
                    state.selectedWord = txt;
                    // User highlighted a word with long-press -> hide cursor handle so Lexicon lookup is unobstructed
                    hideCursorHandleOnly();
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
                hideAllHandles();
            } else if (m === 'flow') {
                applyEditorReadLock(true, false);
                state.handlesEnabled = true;
                updateTabletBarUI();
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
        buildHandlesDOM();
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
