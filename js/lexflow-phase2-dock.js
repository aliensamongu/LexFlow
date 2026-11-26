/* === LEXFLOW PHASE 2 MODULE: TABBED RIGHT-HAND STUDY DOCK (LEXICON, COMPARE, NOTES + FONT SIZE) === */
(function () {
    if (window.__lfPhase2DockLoaded) return;
    window.__lfPhase2DockLoaded = true;

    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
    const MOD = isMac ? '⌘' : 'Ctrl+';

    const TRANSLATIONS = [
        { slug: 'BSB', name: 'BSB', full: 'Berean Standard Bible', ot: true, nt: true, defaultOn: true },
        { slug: 'EMTV', name: 'EMTV', full: 'English Majority Text Version (NT)', ot: false, nt: true, defaultOn: true, localOnly: true },
        { slug: 'WEB', name: 'WEB', full: 'World English Bible', ot: true, nt: true, defaultOn: true },
        { slug: 'ASV', name: 'ASV', full: 'American Standard Version (1901)', ot: true, nt: true, defaultOn: false },
        { slug: 'KJV', name: 'KJV', full: 'King James Version', ot: true, nt: true, defaultOn: true },
        { slug: 'YLT', name: 'YLT', full: "Young's Literal Translation", ot: true, nt: true, defaultOn: true }
    ];

    const STOP_WORDS = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by', 'did', 'do', 'does',
        'for', 'from', 'had', 'has', 'have', 'he', 'her', 'here', 'him', 'his', 'i', 'if', 'in', 'into',
        'is', 'it', 'its', 'me', 'my', 'no', 'nor', 'not', 'of', 'on', 'or', 'our', 'out', 'shall',
        'she', 'should', 'so', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
        'this', 'those', 'thou', 'thy', 'thee', 'to', 'unto', 'up', 'upon', 'us', 'was', 'we', 'were',
        'what', 'when', 'where', 'which', 'who', 'whom', 'will', 'with', 'ye', 'you', 'your', 'yours'
    ]);

    const savedFontPct = parseInt(localStorage.getItem('lexflow_dock_font_scale') || '100', 10);

    const state = {
        isOpen: false,
        activeTab: 'lexicon',          // 'lexicon' | 'compare' | 'notes'
        activeLexSub: 'greek',         // 'greek' | 'hebrew' | 'lsj'
        activeNotesSub: 'master',      // 'master' | 'clause'
        autoDockPopups: localStorage.getItem('lexflow_autodock') !== 'false',
        dockWidth: parseInt(localStorage.getItem('lexflow_dock_width') || '490', 10) || 490,
        fontScalePct: (!isNaN(savedFontPct) && savedFontPct >= 80 && savedFontPct <= 160) ? savedFontPct : 100,
        compareRef: { bookNum: 43, bookName: 'John', chapter: 1, verse: 1 },
        enabledTranslations: new Set(['BSB', 'EMTV', 'WEB', 'KJV', 'YLT']),
        highlightDivergence: true,
        poppedOutTarget: null,         // 'greek' | 'hebrew' | 'lsj' | 'master' | 'clause' | null
        suppressObservers: false
    };

    const chapterTextCache = new Map();

    // -------------------------------------------------------------------------
    // 1. STYLES
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfPhase2DockStyles';
    styleEl.textContent = `
        body.lf-dock-open main {
            min-width: 0 !important;
        }
        body.lf-dock-open #wordProcessorPane {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
        }

        /* Right-Hand Study Dock Container */
        #lfStudyDock {
            display: none;
            flex-direction: column;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            z-index: 45;
            min-width: 340px;
            max-width: 66vw;
            height: 100%;
            --lf-dock-zoom: 1;
        }
        #lfStudyDock.open {
            display: flex;
        }

        /* Cleanly scale reading text inside every Study Dock tab without distorting headers or scrollbars */
        #lfStudyDock #thayersResultsContainer > *,
        #lfStudyDock #bdbResultsContainer > *,
        #lfStudyDock #lfCompareContent > *,
        #lfStudyDock .lf-dock-scale-children > *,
        #lfStudyDock #masterNoteEditor,
        #lfStudyDock #clauseNoteEditor {
            zoom: var(--lf-dock-zoom, 1);
        }

        /* Compact Font Size Control Pill */
        .lf-dock-font-ctrl {
            display: inline-flex;
            align-items: center;
            border-radius: 9px;
            padding: 1px;
            background: rgba(226, 232, 240, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.45);
        }
        html.dark .lf-dock-font-ctrl {
            background: rgba(39, 39, 42, 0.85);
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-dock-font-btn {
            padding: 3px 7px;
            border-radius: 7px;
            font-size: 11px;
            font-weight: 800;
            color: #334155;
            background: transparent;
            border: none;
            cursor: pointer;
            line-height: 1.2;
            transition: background 0.12s ease, color 0.12s ease;
        }
        html.dark .lf-dock-font-btn { color: #e4e4e7; }
        .lf-dock-font-btn:hover {
            background: #4f46e5;
            color: #ffffff !important;
        }
        .lf-dock-font-val {
            padding: 2px 5px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10.5px;
            font-weight: 700;
            color: #4f46e5;
            background: transparent;
            border: none;
            cursor: pointer;
            min-width: 36px;
            text-align: center;
        }
        html.dark .lf-dock-font-val { color: #a5b4fc; }
        .lf-dock-font-val:hover { text-decoration: underline; }

        /* Drag Handle on Left Edge */
        #lfDockResizeHandle {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 7px;
            cursor: col-resize;
            z-index: 60;
            background: transparent;
            transition: background-color 0.15s ease;
        }
        #lfDockResizeHandle:hover,
        #lfDockResizeHandle.dragging {
            background: rgba(99, 102, 241, 0.35);
        }

        /* Dock Header & Primary Tabs */
        .lf-dock-tab-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            background: transparent;
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.13s ease;
            white-space: nowrap;
        }
        html.dark .lf-dock-tab-btn { color: #cbd5e1; }
        .lf-dock-tab-btn:hover { background: rgba(148, 163, 184, 0.16); color: #0f172a; }
        html.dark .lf-dock-tab-btn:hover { color: #ffffff; }
        .lf-dock-tab-btn.active {
            background: #4f46e5;
            color: #ffffff !important;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.32);
        }

        /* Sub-tabs inside Lexicon & Notes tabs */
        .lf-dock-sub-btn {
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11.5px;
            font-weight: 700;
            color: #475569;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.45);
            cursor: pointer;
            transition: all 0.12s ease;
            white-space: nowrap;
        }
        html.dark .lf-dock-sub-btn {
            color: #d4d4d8;
            background: rgba(39, 39, 42, 0.75);
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-dock-sub-btn.active {
            background: #0f766e;
            border-color: #0f766e;
            color: #ffffff !important;
        }
        .lf-dock-sub-btn.active.lf-sub-greek { background: #7c3aed; border-color: #7c3aed; }
        .lf-dock-sub-btn.active.lf-sub-lsj { background: #4338ca; border-color: #4338ca; }
        .lf-dock-sub-btn.active.lf-sub-notes { background: #d97706; border-color: #d97706; }

        /* Docked Native Modal Host */
        .lf-docked-modal-host {
            position: relative !important;
            inset: auto !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            z-index: 1 !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
        }
        .lf-docked-modal-host.hidden {
            display: none !important;
        }
        .lf-docked-modal-host > div {
            width: 100% !important;
            max-width: none !important;
            height: 100% !important;
            max-height: none !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
        }
        .lf-docked-modal-host button[onclick*="closeThayersModal"],
        .lf-docked-modal-host button[onclick*="closeBdbModal"] {
            display: none !important;
        }
        .lf-docked-modal-host > div > div:first-child {
            padding: 10px 14px !important;
        }

        /* Docked Native Notes Drawers */
        .lf-docked-drawer-host {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            width: 100% !important;
            max-width: none !important;
            height: 100% !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            z-index: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            background: transparent !important;
        }
        .lf-docked-drawer-host button[onclick*="closeNoteDrawer"],
        .lf-docked-drawer-host button[onclick*="closeMasterNoteDrawer"] {
            display: none !important;
        }

        /* Multi-Translation Compare Cards & Divergence Highlight */
        .lf-div-word {
            background: rgba(251, 191, 36, 0.28);
            border-bottom: 1.5px solid rgba(217, 119, 6, 0.7);
            border-radius: 3px;
            padding: 0 2px;
        }
        html.dark .lf-div-word {
            background: rgba(245, 158, 11, 0.25);
            border-bottom-color: rgba(251, 191, 36, 0.75);
            color: #fef3c7;
        }

        .lf-compare-pill {
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid rgba(148, 163, 184, 0.5);
            background: rgba(255, 255, 255, 0.75);
            color: #475569;
            transition: all 0.12s ease;
        }
        html.dark .lf-compare-pill {
            background: rgba(39, 39, 42, 0.8);
            color: #a1a1aa;
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-compare-pill.on {
            background: #0284c7;
            border-color: #0284c7;
            color: #ffffff !important;
        }

        @media (max-width: 1023px) {
            #lfStudyDock.open {
                position: fixed !important;
                top: 68px;
                right: 10px;
                bottom: 10px;
                left: 10px;
                width: auto !important;
                max-width: none !important;
                min-width: 0 !important;
                z-index: 480 !important;
            }
            #lfDockResizeHandle { display: none; }
        }
    `;
    document.head.appendChild(styleEl);

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function showDockToast(msg) {
        let el = document.getElementById('lfQuickToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'lfQuickToast';
            el.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:950;padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;background:#1e293b;color:#fff;box-shadow:0 10px 25px rgba(0,0,0,0.25);transition:opacity 0.2s;';
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

    function applyDockFontScale(pct, announce = false) {
        const clamped = Math.max(80, Math.min(160, Math.round(pct / 10) * 10));
        state.fontScalePct = clamped;
        try { localStorage.setItem('lexflow_dock_font_scale', String(clamped)); } catch (e) {}

        const dock = document.getElementById('lfStudyDock');
        if (dock) {
            dock.style.setProperty('--lf-dock-zoom', String(clamped / 100));
        }
        const label = document.getElementById('lfDockFontResetBtn');
        if (label) label.textContent = `${clamped}%`;

        markLsjResultsScalable();
        if (announce) showDockToast(`Study Dock text size: ${clamped}%`);
    }

    function markLsjResultsScalable() {
        const lm = document.getElementById('lfLsjModalOverlay');
        if (!lm) return;
        const lsjInput = lm.querySelector('input[type="text"], input[type="search"], input:not([type])');
        const bodyEl =
            lm.querySelector('#lfLsjResults, #lfLsjBody, .lf-lsj-results') ||
            (lsjInput && lsjInput.closest('div') && lsjInput.closest('div').parentElement ? lsjInput.closest('div').parentElement.nextElementSibling : null);
        if (bodyEl && !bodyEl.classList.contains('lf-dock-scale-children')) {
            bodyEl.classList.add('lf-dock-scale-children');
        }
    }

    function isParallelOpen() {
        const p = document.getElementById('parallelOriginalPane');
        return !!(p && !p.classList.contains('hidden'));
    }

    function setParallelOpen(shouldBeOpen) {
        if (typeof window.toggleParallelOriginalPane !== 'function') return;
        if (isParallelOpen() !== shouldBeOpen) {
            window.toggleParallelOriginalPane();
        }
    }

    function getActiveVerseFromWorkspace() {
        try {
            const blk =
                (typeof lastSelectedBlock !== 'undefined' && lastSelectedBlock && lastSelectedBlock.dataset && lastSelectedBlock.dataset.bookNum ? lastSelectedBlock : null) ||
                (typeof findTopVisibleVerseBlock === 'function' ? findTopVisibleVerseBlock() : null);

            if (blk && blk.dataset && blk.dataset.bookNum) {
                const bookNum = parseInt(blk.dataset.bookNum, 10) || 43;
                const chapter = parseInt(blk.dataset.chapterNum, 10) || 1;
                const verse = parseInt(blk.dataset.verseNum, 10) || 1;
                const bookName = blk.dataset.bookName || (typeof bibleBooksList !== 'undefined' && bibleBooksList[bookNum - 1] ? bibleBooksList[bookNum - 1].name : 'John');
                return { bookNum, bookName, chapter, verse };
            }
        } catch (e) {}
        return { bookNum: 43, bookName: 'John', chapter: 1, verse: 1 };
    }

    // -------------------------------------------------------------------------
    // 2. BUILD THE RIGHT-HAND STUDY DOCK SHELL
    // -------------------------------------------------------------------------
    function buildStudyDockDOM() {
        if (document.getElementById('lfStudyDock')) return;

        const mainEl = document.querySelector('main');
        const workspaceRow = mainEl && mainEl.parentElement;
        if (!workspaceRow) return;

        const dock = document.createElement('aside');
        dock.id = 'lfStudyDock';
        dock.className = 'glass-panel';
        dock.style.width = `${Math.max(340, Math.min(state.dockWidth, Math.floor(window.innerWidth * 0.6)))}px`;

        dock.innerHTML = `
            <div id="lfDockResizeHandle" title="Drag left or right to resize Study Dock"></div>

            <!-- Dock Top Bar -->
            <div class="px-3 py-2 border-b border-gray-200/80 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-1.5 shrink-0 select-none">
                <div class="flex items-center gap-1">
                    <button type="button" class="lf-dock-tab-btn active" data-dock-tab="lexicon" title="Unified Greek, Hebrew, LSJ & All-Lexicon Verse Search">
                        <i class="fa-solid fa-book-atlas text-[11px]"></i><span>Lexicon</span>
                    </button>
                    <button type="button" class="lf-dock-tab-btn" data-dock-tab="compare" title="Compare Bible translations side-by-side with divergence highlights">
                        <i class="fa-solid fa-code-compare text-[11px]"></i><span>Compare</span>
                    </button>
                    <button type="button" class="lf-dock-tab-btn" data-dock-tab="notes" title="Clause & Master Exegetical Notes">
                        <i class="fa-solid fa-note-sticky text-[11px]"></i><span>Notes</span>
                    </button>
                </div>

                <div class="flex items-center gap-1.5">
                    <div class="lf-dock-font-ctrl" title="Adjust Study Dock text size (click percentage to reset to 100%)">
                        <button type="button" id="lfDockFontDecBtn" class="lf-dock-font-btn" title="Smaller text">A−</button>
                        <button type="button" id="lfDockFontResetBtn" class="lf-dock-font-val" title="Reset text size to 100%">${state.fontScalePct}%</button>
                        <button type="button" id="lfDockFontIncBtn" class="lf-dock-font-btn" title="Larger text">A+</button>
                    </div>
                    <button type="button" id="lfDockOriginalSwitchBtn" class="px-2 py-1 rounded-lg text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition cursor-pointer" title="Switch right side to Side-by-Side Original Greek/Hebrew pane">
                        <i class="fa-solid fa-columns mr-1"></i>Original
                    </button>
                    <button type="button" id="lfDockPopOutBtn" class="px-2 py-1 rounded-lg text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-zinc-700 transition cursor-pointer" title="Pop current tool out into a full-screen window">
                        <i class="fa-solid fa-up-right-from-square"></i>
                    </button>
                    <button type="button" id="lfDockCloseBtn" class="px-2 py-1 rounded-lg text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer" title="Close Study Dock (${MOD}⇧D)">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- TAB 1: UNIFIED LEXICON STUDIO -->
            <div id="lfDockPanel_lexicon" class="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div class="px-3 py-2 border-b border-gray-200/70 dark:border-zinc-700/70 bg-slate-50/80 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-1.5 shrink-0 select-none">
                    <div class="flex items-center flex-wrap gap-1.5">
                        <button type="button" class="lf-dock-sub-btn lf-sub-greek active" data-lex-sub="greek">Greek NT</button>
                        <button type="button" class="lf-dock-sub-btn" data-lex-sub="hebrew">Hebrew OT</button>
                        <button type="button" class="lf-dock-sub-btn lf-sub-lsj" data-lex-sub="lsj">LSJ (1940)</button>
                    </div>
                    <button type="button" id="lfDockVerseSearchShortcut" class="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-500 hover:text-white text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[11px] font-bold transition cursor-pointer" title="Search all lexicons for a Bible verse reference">
                        <i class="fa-solid fa-book-bible mr-1"></i>Verse Search
                    </button>
                </div>
                <div id="lfDockSlotGreek" class="flex-1 flex flex-col min-h-0 overflow-hidden"></div>
                <div id="lfDockSlotHebrew" class="flex-1 flex flex-col min-h-0 overflow-hidden hidden"></div>
                <div id="lfDockSlotLsj" class="flex-1 flex flex-col min-h-0 overflow-hidden hidden">
                    <div class="p-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-3">
                        <div class="font-bold text-sm text-gray-800 dark:text-gray-100">LSJ Greek-English Lexicon (1940)</div>
                        <p>Click below to load your offline LSJ lexicon right into the Study Dock.</p>
                        <button type="button" id="lfDockLaunchLsjBtn" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer">
                            Open LSJ in Dock
                        </button>
                    </div>
                </div>
            </div>

            <!-- TAB 2: MULTI-TRANSLATION COMPARE & DIVERGENCE -->
            <div id="lfDockPanel_compare" class="flex-1 flex flex-col min-h-0 overflow-hidden hidden">
                <div class="px-3.5 py-2.5 border-b border-gray-200/80 dark:border-zinc-700/80 bg-sky-50/70 dark:bg-zinc-900/60 space-y-2 shrink-0">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5">
                            <button type="button" id="lfComparePrevBtn" class="glass-control px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer" title="Previous Verse"><i class="fa-solid fa-chevron-left"></i></button>
                            <span id="lfCompareRefLabel" class="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-sky-200 dark:border-zinc-700 text-xs font-extrabold text-sky-800 dark:text-sky-300">John 1:1</span>
                            <button type="button" id="lfCompareNextBtn" class="glass-control px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer" title="Next Verse"><i class="fa-solid fa-chevron-right"></i></button>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <button type="button" id="lfCompareSyncBtn" class="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition cursor-pointer" title="Sync to the verse currently visible in your Bible workspace">
                                <i class="fa-solid fa-crosshairs mr-1"></i>Sync Verse
                            </button>
                            <button type="button" id="lfCompareDivToggleBtn" class="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[11px] font-bold transition cursor-pointer" title="Highlight words unique to a translation to spot interpretive differences">
                                <i class="fa-solid fa-highlighter mr-1"></i>Differences: On
                            </button>
                        </div>
                    </div>
                    <div id="lfCompareTransPills" class="flex flex-wrap items-center gap-1.5"></div>
                </div>
                <div id="lfCompareContent" class="flex-1 p-3.5 overflow-y-auto custom-scrollbar space-y-2.5"></div>
            </div>

            <!-- TAB 3: DOCKED EXEGETICAL NOTES -->
            <div id="lfDockPanel_notes" class="flex-1 flex flex-col min-h-0 overflow-hidden hidden">
                <div class="px-3 py-2 border-b border-gray-200/70 dark:border-zinc-700/70 bg-amber-50/70 dark:bg-zinc-900/50 flex items-center justify-between gap-2 shrink-0 select-none">
                    <div class="flex items-center gap-1.5">
                        <button type="button" class="lf-dock-sub-btn lf-sub-notes active" data-notes-sub="master">Master Notes</button>
                        <button type="button" class="lf-dock-sub-btn lf-sub-notes" data-notes-sub="clause">Active Clause Notes</button>
                    </div>
                    <span class="text-[11px] text-gray-500 dark:text-gray-400">Auto-saved</span>
                </div>
                <div id="lfDockSlotNotesMaster" class="flex-1 flex flex-col min-h-0 overflow-hidden"></div>
                <div id="lfDockSlotNotesClause" class="flex-1 flex flex-col min-h-0 overflow-hidden hidden"></div>
            </div>
        `;

        workspaceRow.appendChild(dock);

        // Wire dock header buttons
        dock.querySelectorAll('.lf-dock-tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => setDockTab(btn.dataset.dockTab));
        });
        dock.querySelectorAll('[data-lex-sub]').forEach((btn) => {
            btn.addEventListener('click', () => setLexSubTab(btn.dataset.lexSub, true));
        });
        dock.querySelectorAll('[data-notes-sub]').forEach((btn) => {
            btn.addEventListener('click', () => setNotesSubTab(btn.dataset.notesSub));
        });

        // Wire Font Size Adjuster buttons
        document.getElementById('lfDockFontDecBtn').addEventListener('click', () => applyDockFontScale(state.fontScalePct - 10, true));
        document.getElementById('lfDockFontIncBtn').addEventListener('click', () => applyDockFontScale(state.fontScalePct + 10, true));
        document.getElementById('lfDockFontResetBtn').addEventListener('click', () => applyDockFontScale(100, true));

        document.getElementById('lfDockCloseBtn').addEventListener('click', () => closeStudyDock());
        document.getElementById('lfDockPopOutBtn').addEventListener('click', () => popOutActiveDockContent());
        document.getElementById('lfDockOriginalSwitchBtn').addEventListener('click', () => {
            closeStudyDock();
            setParallelOpen(true);
            showDockToast('Switched right pane to Side-by-Side Original Language');
        });

        document.getElementById('lfDockVerseSearchShortcut').addEventListener('click', () => {
            const ref = getActiveVerseFromWorkspace();
            const q = `${ref.bookName} ${ref.chapter}:${ref.verse}`;
            if (typeof window.lfOpenAllLexiconScriptureSearch === 'function') {
                window.lfOpenAllLexiconScriptureSearch(q);
            }
        });

        document.getElementById('lfDockLaunchLsjBtn')?.addEventListener('click', () => {
            triggerNativeLsjOpen();
        });

        // Wire Compare controls
        document.getElementById('lfComparePrevBtn').addEventListener('click', () => stepCompareVerse(-1));
        document.getElementById('lfCompareNextBtn').addEventListener('click', () => stepCompareVerse(1));
        document.getElementById('lfCompareSyncBtn').addEventListener('click', () => {
            state.compareRef = getActiveVerseFromWorkspace();
            renderCompareTab();
        });
        document.getElementById('lfCompareDivToggleBtn').addEventListener('click', () => {
            state.highlightDivergence = !state.highlightDivergence;
            const b = document.getElementById('lfCompareDivToggleBtn');
            if (b) b.innerHTML = `<i class="fa-solid fa-highlighter mr-1"></i>Differences: ${state.highlightDivergence ? 'On' : 'Off'}`;
            renderCompareTab();
        });

        applyDockFontScale(state.fontScalePct, false);
        renderCompareTranslationPills();
        wireDockResizeHandle();
    }

    function wireDockResizeHandle() {
        const handle = document.getElementById('lfDockResizeHandle');
        const dock = document.getElementById('lfStudyDock');
        if (!handle || !dock) return;

        let startX = 0;
        let startW = 0;

        const onMove = (e) => {
            const dx = startX - e.clientX;
            const minW = 340;
            const maxW = Math.floor(window.innerWidth * 0.65);
            const nextW = Math.max(minW, Math.min(maxW, startW + dx));
            dock.style.width = `${nextW}px`;
            state.dockWidth = nextW;
        };

        const onUp = () => {
            handle.classList.remove('dragging');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            try { localStorage.setItem('lexflow_dock_width', String(state.dockWidth)); } catch (e) {}
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startX = e.clientX;
            startW = dock.getBoundingClientRect().width;
            handle.classList.add('dragging');
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        });
    }

    // -------------------------------------------------------------------------
    // 3. DOCKING / UNDOCKING NATIVE LEXFLOW MODALS & DRAWERS SAFELY
    // -------------------------------------------------------------------------
    function dockNativeElement(el, slotId, hostClass) {
        const slot = document.getElementById(slotId);
        if (!el || !slot) return false;
        if (el.parentElement !== slot) {
            slot.innerHTML = '';
            slot.appendChild(el);
        }
        el.classList.add(hostClass);
        return true;
    }

    function undockNativeElement(el, hostClass) {
        if (!el) return;
        el.classList.remove(hostClass);
        if (el.parentElement !== document.body) {
            document.body.appendChild(el);
        }
    }

    function dockAllSupportedPanels() {
        state.suppressObservers = true;
        try {
            const tm = document.getElementById('thayersModal');
            if (tm && state.poppedOutTarget !== 'greek') dockNativeElement(tm, 'lfDockSlotGreek', 'lf-docked-modal-host');

            const bm = document.getElementById('bdbModal');
            if (bm && state.poppedOutTarget !== 'hebrew') dockNativeElement(bm, 'lfDockSlotHebrew', 'lf-docked-modal-host');

            const lm = document.getElementById('lfLsjModalOverlay');
            if (lm && state.poppedOutTarget !== 'lsj') {
                dockNativeElement(lm, 'lfDockSlotLsj', 'lf-docked-modal-host');
                markLsjResultsScalable();
            }

            const mn = document.getElementById('masterNoteDrawer');
            if (mn && state.poppedOutTarget !== 'master') dockNativeElement(mn, 'lfDockSlotNotesMaster', 'lf-docked-drawer-host');

            const cn = document.getElementById('exegeticalNoteDrawer');
            if (cn && state.poppedOutTarget !== 'clause') dockNativeElement(cn, 'lfDockSlotNotesClause', 'lf-docked-drawer-host');
        } finally {
            setTimeout(() => { state.suppressObservers = false; }, 60);
        }
    }

    function triggerNativeLsjOpen() {
        const existing = document.getElementById('lfLsjModalOverlay');
        if (existing) {
            dockNativeElement(existing, 'lfDockSlotLsj', 'lf-docked-modal-host');
            markLsjResultsScalable();
            existing.style.display = 'flex';
            existing.classList.remove('hidden');
            return;
        }
        if (typeof window.openLsjModal === 'function') {
            window.openLsjModal('');
        } else {
            const lsjBtn = Array.from(document.querySelectorAll('button')).find((b) => /\bLSJ\b/.test(b.textContent || '') && !b.closest('#lfStudyDock, #lfCmdPaletteOverlay, #lfResearchQuickBar'));
            if (lsjBtn) lsjBtn.click();
        }
        setTimeout(() => {
            const lm = document.getElementById('lfLsjModalOverlay');
            if (lm) {
                dockNativeElement(lm, 'lfDockSlotLsj', 'lf-docked-modal-host');
                markLsjResultsScalable();
                lm.style.display = 'flex';
                lm.classList.remove('hidden');
            }
        }, 120);
    }

    function openStudyDock(tabName, subTabName) {
        buildStudyDockDOM();
        dockAllSupportedPanels();

        if (window.innerWidth < 1540 && isParallelOpen()) {
            setParallelOpen(false);
        }

        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;
        dock.classList.add('open');
        document.body.classList.add('lf-dock-open');
        state.isOpen = true;
        updateTopDockButtonUI();

        if (tabName) {
            setDockTab(tabName, subTabName);
        } else {
            setDockTab(state.activeTab);
        }
    }

    function closeStudyDock() {
        const dock = document.getElementById('lfStudyDock');
        if (dock) dock.classList.remove('open');
        document.body.classList.remove('lf-dock-open');
        state.isOpen = false;
        updateTopDockButtonUI();
    }

    function setDockTab(tabName, subTabName) {
        state.activeTab = tabName || 'lexicon';
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;

        dock.querySelectorAll('.lf-dock-tab-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.dockTab === state.activeTab);
        });

        ['lexicon', 'compare', 'notes'].forEach((t) => {
            const panel = document.getElementById(`lfDockPanel_${t}`);
            if (panel) panel.classList.toggle('hidden', t !== state.activeTab);
        });

        const popBtn = document.getElementById('lfDockPopOutBtn');
        if (popBtn) popBtn.classList.toggle('hidden', state.activeTab === 'compare');

        if (state.activeTab === 'lexicon') {
            let chosenSub = subTabName;
            if (!chosenSub) {
                const ref = getActiveVerseFromWorkspace();
                chosenSub = (ref.bookNum <= 39) ? 'hebrew' : 'greek';
            }
            setLexSubTab(chosenSub, true);
        } else if (state.activeTab === 'compare') {
            state.compareRef = getActiveVerseFromWorkspace();
            renderCompareTab();
        } else if (state.activeTab === 'notes') {
            setNotesSubTab(subTabName || state.activeNotesSub);
        }
    }

    function setLexSubTab(sub, initIfEmpty) {
        state.activeLexSub = sub || 'greek';
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;

        dock.querySelectorAll('[data-lex-sub]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lexSub === state.activeLexSub);
        });

        const slots = {
            greek: document.getElementById('lfDockSlotGreek'),
            hebrew: document.getElementById('lfDockSlotHebrew'),
            lsj: document.getElementById('lfDockSlotLsj')
        };
        Object.keys(slots).forEach((k) => {
            if (slots[k]) slots[k].classList.toggle('hidden', k !== state.activeLexSub);
        });

        state.suppressObservers = true;
        try {
            if (state.activeLexSub === 'greek') {
                const tm = document.getElementById('thayersModal');
                if (tm) {
                    dockNativeElement(tm, 'lfDockSlotGreek', 'lf-docked-modal-host');
                    tm.classList.remove('hidden');
                    const resEl = document.getElementById('thayersResultsContainer');
                    if (initIfEmpty && resEl && !resEl.textContent.trim() && typeof window.executeThayersSearch === 'function') {
                        window.executeThayersSearch();
                    }
                }
            } else if (state.activeLexSub === 'hebrew') {
                const bm = document.getElementById('bdbModal');
                if (bm) {
                    dockNativeElement(bm, 'lfDockSlotHebrew', 'lf-docked-modal-host');
                    bm.classList.remove('hidden');
                    const resEl = document.getElementById('bdbResultsContainer');
                    if (initIfEmpty && resEl && !resEl.textContent.trim() && typeof window.executeBdbSearch === 'function') {
                        window.executeBdbSearch();
                    }
                }
            } else if (state.activeLexSub === 'lsj') {
                const lm = document.getElementById('lfLsjModalOverlay');
                if (lm) {
                    dockNativeElement(lm, 'lfDockSlotLsj', 'lf-docked-modal-host');
                    markLsjResultsScalable();
                    lm.style.display = 'flex';
                    lm.classList.remove('hidden');
                }
            }
        } finally {
            setTimeout(() => { state.suppressObservers = false; }, 80);
        }
    }

    function setNotesSubTab(sub) {
        state.activeNotesSub = sub || 'master';
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;

        dock.querySelectorAll('[data-notes-sub]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.notesSub === state.activeNotesSub);
        });

        const masterSlot = document.getElementById('lfDockSlotNotesMaster');
        const clauseSlot = document.getElementById('lfDockSlotNotesClause');
        if (masterSlot) masterSlot.classList.toggle('hidden', state.activeNotesSub !== 'master');
        if (clauseSlot) clauseSlot.classList.toggle('hidden', state.activeNotesSub !== 'clause');

        state.suppressObservers = true;
        try {
            if (state.activeNotesSub === 'master') {
                const mn = document.getElementById('masterNoteDrawer');
                if (mn) {
                    dockNativeElement(mn, 'lfDockSlotNotesMaster', 'lf-docked-drawer-host');
                    mn.classList.add('open');
                }
            } else {
                const cn = document.getElementById('exegeticalNoteDrawer');
                if (cn) {
                    dockNativeElement(cn, 'lfDockSlotNotesClause', 'lf-docked-drawer-host');
                    cn.classList.add('open');
                }
            }
        } finally {
            setTimeout(() => { state.suppressObservers = false; }, 80);
        }
    }

    function popOutActiveDockContent() {
        let target = null;
        let el = null;
        let hostClass = 'lf-docked-modal-host';

        if (state.activeTab === 'lexicon') {
            target = state.activeLexSub;
            if (target === 'greek') el = document.getElementById('thayersModal');
            else if (target === 'hebrew') el = document.getElementById('bdbModal');
            else if (target === 'lsj') el = document.getElementById('lfLsjModalOverlay');
        } else if (state.activeTab === 'notes') {
            target = state.activeNotesSub;
            hostClass = 'lf-docked-drawer-host';
            el = target === 'clause' ? document.getElementById('exegeticalNoteDrawer') : document.getElementById('masterNoteDrawer');
        }

        if (!el) return;
        state.poppedOutTarget = target;
        state.suppressObservers = true;
        try {
            undockNativeElement(el, hostClass);
            if (hostClass === 'lf-docked-modal-host') {
                el.classList.remove('hidden');
                if (target === 'lsj') el.style.display = 'flex';
            } else {
                el.classList.add('open');
            }
            closeStudyDock();
        } finally {
            setTimeout(() => { state.suppressObservers = false; }, 120);
        }
        showDockToast('Popped out full-screen — closing it will re-dock it automatically');
    }

    // -------------------------------------------------------------------------
    // 4. INTERCEPT NATIVE MODAL / DRAWER OPENS SO THEY DOCK AUTOMATICALLY
    // -------------------------------------------------------------------------
    function watchNativePanelsForAutoDock() {
        const tm = document.getElementById('thayersModal');
        const bm = document.getElementById('bdbModal');
        const mn = document.getElementById('masterNoteDrawer');
        const cn = document.getElementById('exegeticalNoteDrawer');

        const watchModal = (el, subName) => {
            if (!el) return;
            const obs = new MutationObserver(() => {
                if (state.suppressObservers) return;
                const isHidden = el.classList.contains('hidden');
                if (state.poppedOutTarget === subName) {
                    if (isHidden) {
                        state.poppedOutTarget = null;
                        dockAllSupportedPanels();
                    }
                    return;
                }
                if (!isHidden && state.autoDockPopups) {
                    openStudyDock('lexicon', subName);
                }
            });
            obs.observe(el, { attributes: true, attributeFilter: ['class'] });
        };

        const watchDrawer = (el, subName) => {
            if (!el) return;
            const obs = new MutationObserver(() => {
                if (state.suppressObservers) return;
                const isOpen = el.classList.contains('open');
                if (state.poppedOutTarget === subName) {
                    if (!isOpen) {
                        state.poppedOutTarget = null;
                        dockAllSupportedPanels();
                    }
                    return;
                }
                if (isOpen && state.autoDockPopups) {
                    openStudyDock('notes', subName);
                }
            });
            obs.observe(el, { attributes: true, attributeFilter: ['class'] });
        };

        watchModal(tm, 'greek');
        watchModal(bm, 'hebrew');
        watchDrawer(mn, 'master');
        watchDrawer(cn, 'clause');

        const watchLsjOverlay = (lm) => {
            if (!lm || lm.__lfDockWatched) return;
            lm.__lfDockWatched = true;
            markLsjResultsScalable();
            const obs = new MutationObserver(() => {
                if (state.suppressObservers) return;
                const isHidden = lm.classList.contains('hidden') || lm.style.display === 'none';
                if (state.poppedOutTarget === 'lsj') {
                    if (isHidden) {
                        state.poppedOutTarget = null;
                        dockAllSupportedPanels();
                    }
                    return;
                }
                if (!isHidden && state.autoDockPopups) {
                    openStudyDock('lexicon', 'lsj');
                }
            });
            obs.observe(lm, { attributes: true, attributeFilter: ['style', 'class'] });
        };

        const existingLsj = document.getElementById('lfLsjModalOverlay');
        if (existingLsj) watchLsjOverlay(existingLsj);

        const bodyObs = new MutationObserver(() => {
            const lm = document.getElementById('lfLsjModalOverlay');
            if (lm && !lm.__lfDockWatched) {
                watchLsjOverlay(lm);
                if (state.autoDockPopups && lm.style.display !== 'none' && !lm.classList.contains('hidden')) {
                    openStudyDock('lexicon', 'lsj');
                }
            }
        });
        bodyObs.observe(document.body, { childList: true });

        const parallelPane = document.getElementById('parallelOriginalPane');
        if (parallelPane) {
            const pObs = new MutationObserver(() => {
                if (!parallelPane.classList.contains('hidden') && state.isOpen && window.innerWidth < 1540) {
                    closeStudyDock();
                }
            });
            pObs.observe(parallelPane, { attributes: true, attributeFilter: ['class'] });
        }
    }

    // -------------------------------------------------------------------------
    // 5. MULTI-TRANSLATION COMPARE & DIVERGENCE ENGINE (TAB 2)
    // -------------------------------------------------------------------------
    function renderCompareTranslationPills() {
        const wrap = document.getElementById('lfCompareTransPills');
        if (!wrap) return;
        const isOt = state.compareRef.bookNum <= 39;

        wrap.innerHTML = TRANSLATIONS.filter((t) => (isOt ? t.ot : t.nt)).map((t) => {
            const on = state.enabledTranslations.has(t.slug);
            return `<button type="button" class="lf-compare-pill ${on ? 'on' : ''}" data-slug="${t.slug}" title="${escapeHtml(t.full)}">${t.name}</button>`;
        }).join('');

        wrap.querySelectorAll('.lf-compare-pill').forEach((btn) => {
            btn.addEventListener('click', () => {
                const slug = btn.dataset.slug;
                if (state.enabledTranslations.has(slug)) {
                    if (state.enabledTranslations.size > 1) state.enabledTranslations.delete(slug);
                } else {
                    state.enabledTranslations.add(slug);
                }
                renderCompareTranslationPills();
                renderCompareTab();
            });
        });
    }

    async function fetchTranslationChapter(slug, bookNum, chapter) {
        const key = `${slug}_${bookNum}_${chapter}`;
        if (chapterTextCache.has(key)) return chapterTextCache.get(key);

        const verseMap = new Map();

        if (slug === 'EMTV') {
            if (typeof scriptureDataCache !== 'undefined' && Array.isArray(scriptureDataCache.fullVerses?.emtv)) {
                scriptureDataCache.fullVerses.emtv.forEach((v) => {
                    if (v.bookNum === bookNum && v.chapter === chapter) {
                        verseMap.set(v.verse, v.text);
                    }
                });
            }
            if (verseMap.size > 0) chapterTextCache.set(key, verseMap);
            return verseMap;
        }

        try {
            const res = await fetch(`https://bolls.life/get-text/${slug}/${bookNum}/${chapter}/`);
            if (res.ok) {
                const rows = await res.json();
                if (Array.isArray(rows)) {
                    rows.forEach((r) => {
                        const vNum = parseInt(r.verse, 10);
                        const clean = String(r.text || '')
                            .replace(/<S>\d+<\/S>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        if (vNum && clean) verseMap.set(vNum, clean);
                    });
                }
            }
        } catch (e) {}

        if (verseMap.size > 0) chapterTextCache.set(key, verseMap);
        return verseMap;
    }

    function normalizeWordStem(w) {
        let s = w.toLowerCase().replace(/[^a-z']/g, '');
        if (s.length > 4 && s.endsWith('ing')) s = s.slice(0, -3);
        else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
        else if (s.length > 3 && s.endsWith('es')) s = s.slice(0, -2);
        else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
        return s;
    }

    function highlightDivergentWords(items) {
        if (!state.highlightDivergence || items.length < 3) {
            return items.map((it) => ({ ...it, html: escapeHtml(it.text) }));
        }

        const docFreq = new Map();
        items.forEach((it) => {
            const seenInThis = new Set();
            const words = it.text.match(/[A-Za-z][A-Za-z']*/g) || [];
            words.forEach((w) => {
                const lower = w.toLowerCase();
                if (lower.length < 3 || STOP_WORDS.has(lower)) return;
                const stem = normalizeWordStem(lower);
                if (stem && !seenInThis.has(stem)) {
                    seenInThis.add(stem);
                    docFreq.set(stem, (docFreq.get(stem) || 0) + 1);
                }
            });
        });

        return items.map((it) => {
            const html = escapeHtml(it.text).replace(/\b([A-Za-z][A-Za-z']{2,})\b/g, (match) => {
                const lower = match.toLowerCase();
                if (STOP_WORDS.has(lower)) return match;
                const stem = normalizeWordStem(lower);
                const freq = docFreq.get(stem) || 0;
                if (freq === 1) {
                    return `<span class="lf-div-word" title="Unique wording in ${it.name} compared to the other translations">${match}</span>`;
                }
                return match;
            });
            return { ...it, html };
        });
    }

    async function getOriginalTokensForCompare(bookNum, chapter, verse) {
        const vKey = `${bookNum}_${chapter}_${verse}`;
        if (bookNum >= 40) {
            if (typeof window.getSrgntTokensForSingleVerse === 'function') {
                return { lang: 'greek', tokens: await window.getSrgntTokensForSingleVerse(bookNum, chapter, verse) };
            }
            return { lang: 'greek', tokens: [] };
        } else {
            if (typeof scriptureDataCache !== 'undefined' && scriptureDataCache.wlcVerseTokensMap?.has(vKey)) {
                return { lang: 'hebrew', tokens: scriptureDataCache.wlcVerseTokensMap.get(vKey) };
            }
            if (typeof window.fetchHebrewChapterFast === 'function') {
                await window.fetchHebrewChapterFast(bookNum, chapter);
                if (typeof scriptureDataCache !== 'undefined' && scriptureDataCache.wlcVerseTokensMap?.has(vKey)) {
                    return { lang: 'hebrew', tokens: scriptureDataCache.wlcVerseTokensMap.get(vKey) };
                }
            }
            return { lang: 'hebrew', tokens: [] };
        }
    }

    let compareRenderToken = 0;

    async function renderCompareTab() {
        const content = document.getElementById('lfCompareContent');
        const refLabel = document.getElementById('lfCompareRefLabel');
        if (!content || !refLabel) return;

        const { bookNum, bookName, chapter, verse } = state.compareRef;
        refLabel.textContent = `${bookName} ${chapter}:${verse}`;
        renderCompareTranslationPills();

        const myToken = ++compareRenderToken;
        content.innerHTML = `<div class="p-6 text-center text-xs text-gray-500 dark:text-gray-400"><i class="fa-solid fa-spinner fa-spin mr-1.5 text-sky-500"></i>Loading translations for <strong>${escapeHtml(bookName)} ${chapter}:${verse}</strong>…</div>`;

        const isOt = bookNum <= 39;
        const activeMeta = TRANSLATIONS.filter((t) => (isOt ? t.ot : t.nt) && state.enabledTranslations.has(t.slug));

        const [origData, ...chapMaps] = await Promise.all([
            getOriginalTokensForCompare(bookNum, chapter, verse),
            ...activeMeta.map((t) => fetchTranslationChapter(t.slug, bookNum, chapter))
        ]);

        if (myToken !== compareRenderToken) return;

        const loadedItems = [];
        activeMeta.forEach((meta, idx) => {
            const txt = chapMaps[idx]?.get(verse);
            if (txt) loadedItems.push({ ...meta, text: txt });
        });

        const formatted = highlightDivergentWords(loadedItems);

        let origHtml = '';
        if (origData.tokens && origData.tokens.length) {
            const isHeb = origData.lang === 'hebrew';
            const chips = origData.tokens.filter((t) => t && t.surface).map((t, idx) => `
                <button type="button" class="lf-cmp-orig-chip px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-gray-100 border border-indigo-200 dark:border-zinc-700 font-serif text-base font-medium transition cursor-pointer" data-orig-idx="${idx}" title="Click to look up in ${isHeb ? 'BDB / Gesenius' : 'Thayer / Abbott-Smith'}">
                    ${escapeHtml(t.surface)}
                </button>
            `).join('');

            origHtml = `
                <div class="p-3 rounded-xl bg-indigo-50/75 dark:bg-indigo-950/35 border border-indigo-200 dark:border-indigo-800/70 space-y-1.5">
                    <div class="flex items-center justify-between text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
                        <span><i class="fa-solid fa-language mr-1"></i>${isHeb ? 'WLC Hebrew (OT)' : 'SRGNT Greek (NT)'}</span>
                        <span class="font-normal opacity-80">Click any word for Lexicon</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 leading-loose" dir="${isHeb ? 'rtl' : 'ltr'}">${chips}</div>
                </div>
            `;
        }

        const transCardsHtml = formatted.length
            ? formatted.map((it) => `
                <div class="p-3.5 rounded-xl bg-white/95 dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 shadow-xs space-y-1">
                    <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300">${it.name}</span>
                        <span class="text-[10.5px] text-gray-400">${escapeHtml(it.full)}</span>
                    </div>
                    <div class="text-sm font-serif leading-relaxed text-gray-800 dark:text-gray-100">${it.html}</div>
                </div>
            `).join('')
            : `<div class="p-5 rounded-xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-xs text-amber-900 dark:text-amber-200">Could not load translations for ${escapeHtml(bookName)} ${chapter}:${verse}. Check your internet connection or try another verse.</div>`;

        const legendHtml = (state.highlightDivergence && formatted.length >= 3)
            ? `<div class="text-[11px] text-gray-500 dark:text-gray-400 px-1 flex items-center gap-1.5">
                   <span class="lf-div-word font-semibold">Highlighted words</span>
                   <span>= unique wording in that translation (great for spotting interpretive differences).</span>
               </div>`
            : '';

        content.innerHTML = `${origHtml}${legendHtml}<div class="space-y-2.5">${transCardsHtml}</div>`;

        content.querySelectorAll('.lf-cmp-orig-chip').forEach((btn) => {
            btn.addEventListener('click', () => {
                const tok = origData.tokens[parseInt(btn.dataset.origIdx, 10)];
                if (!tok) return;
                const q = tok.strongs || tok.lemma || tok.surface;
                if (origData.lang === 'hebrew') {
                    openStudyDock('lexicon', 'hebrew');
                    const inp = document.getElementById('bdbSearchInput');
                    if (inp) inp.value = q;
                    if (typeof window.executeBdbSearch === 'function') window.executeBdbSearch();
                } else {
                    openStudyDock('lexicon', 'greek');
                    const inp = document.getElementById('thayersSearchInput');
                    if (inp) inp.value = q;
                    if (typeof window.executeThayersSearch === 'function') window.executeThayersSearch(tok);
                }
            });
        });
    }

    async function stepCompareVerse(delta) {
        const nextV = Math.max(1, state.compareRef.verse + delta);
        const bsbMap = await fetchTranslationChapter('BSB', state.compareRef.bookNum, state.compareRef.chapter);
        if (delta > 0 && bsbMap.size > 0 && !bsbMap.has(nextV)) {
            showDockToast(`End of ${state.compareRef.bookName} ${state.compareRef.chapter}`);
            return;
        }
        state.compareRef.verse = nextV;
        renderCompareTab();
    }

    function wireEditorClickToCompareSync() {
        const ed = document.getElementById('flowEditor');
        if (!ed) return;
        ed.addEventListener('click', (e) => {
            if (!state.isOpen || state.activeTab !== 'compare') return;
            const blk = e.target && e.target.closest('div[data-book-num][data-chapter-num][data-verse-num]');
            if (!blk) return;
            const bookNum = parseInt(blk.dataset.bookNum, 10);
            const chapter = parseInt(blk.dataset.chapterNum, 10);
            const verse = parseInt(blk.dataset.verseNum, 10);
            if (bookNum && chapter && verse) {
                if (state.compareRef.bookNum !== bookNum || state.compareRef.chapter !== chapter || state.compareRef.verse !== verse) {
                    const bookName = blk.dataset.bookName || (typeof bibleBooksList !== 'undefined' && bibleBooksList[bookNum - 1] ? bibleBooksList[bookNum - 1].name : 'Scripture');
                    state.compareRef = { bookNum, bookName, chapter, verse };
                    renderCompareTab();
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // 6. TOP BAR BUTTON, RESEARCH BAR INTEGRATION & SHORTCUTS
    // -------------------------------------------------------------------------
    function updateTopDockButtonUI() {
        const btn = document.getElementById('lfToggleStudyDockBtn');
        if (!btn) return;
        if (state.isOpen) {
            btn.classList.add('!bg-indigo-600', '!text-white');
        } else {
            btn.classList.remove('!bg-indigo-600', '!text-white');
        }
    }

    function injectStudyDockTriggers() {
        const header = document.querySelector('header');
        const leftGroup = header && header.firstElementChild;
        if (leftGroup && !document.getElementById('lfToggleStudyDockBtn')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'lfToggleStudyDockBtn';
            btn.className = 'glass-control px-2.5 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 cursor-pointer';
            btn.title = `Open / Close Right-Hand Study Dock (${MOD}⇧D) — Lexicon, Compare & Notes side-by-side with your Bible`;
            btn.innerHTML = `
                <i class="fa-solid fa-table-columns text-[11px]"></i>
                <span class="hidden sm:inline">Study Dock</span>
            `;
            btn.addEventListener('click', () => {
                if (state.isOpen) closeStudyDock();
                else openStudyDock();
            });
            leftGroup.appendChild(btn);
        }

        const rqBar = document.getElementById('lfResearchQuickBar');
        if (rqBar && !rqBar.querySelector('[data-rq="compare"]')) {
            const firstWrap = rqBar.firstElementChild;
            if (firstWrap) {
                const cmpBtn = document.createElement('button');
                cmpBtn.type = 'button';
                cmpBtn.className = 'lf-rq-btn';
                cmpBtn.dataset.rq = 'compare';
                cmpBtn.innerHTML = `<i class="fa-solid fa-code-compare text-sky-500"></i><span>Compare Translations</span>`;
                cmpBtn.addEventListener('click', () => openStudyDock('compare'));
                firstWrap.appendChild(cmpBtn);
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        const modPressed = isMac ? e.metaKey : e.ctrlKey;
        if (!modPressed || !e.shiftKey || e.altKey) return;
        const tag = (e.target && e.target.tagName) || '';
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

        const key = (e.key || '').toLowerCase();
        if (key === 'd') {
            e.preventDefault();
            if (state.isOpen) closeStudyDock();
            else openStudyDock();
        } else if (key === 'c') {
            e.preventDefault();
            openStudyDock('compare');
        }
    });

    window.lfOpenStudyDock = openStudyDock;
    window.lfCloseStudyDock = closeStudyDock;
    window.lfCompareCurrentVerse = () => openStudyDock('compare');
    window.lfSetDockFontScale = applyDockFontScale;

    function initPhase2Dock() {
        buildStudyDockDOM();
        dockAllSupportedPanels();
        watchNativePanelsForAutoDock();
        injectStudyDockTriggers();
        wireEditorClickToCompareSync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initPhase2Dock, 80));
    } else {
        setTimeout(initPhase2Dock, 80);
    }
})();
