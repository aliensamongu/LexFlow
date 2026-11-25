/* === LEXFLOW PHASE 1 MODULE: COMMAND PALETTE (Cmd+K), WORKSPACE MODES & SHORTCUTS === */
(function () {
    if (window.__lfPhase1Loaded) return;
    window.__lfPhase1Loaded = true;

    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
    const MOD = isMac ? '⌘' : 'Ctrl+';

    // -------------------------------------------------------------------------
    // 1. STYLES (Matches LexFlow Glassy Light & Dark Theme)
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfPhase1Styles';
    styleEl.textContent = `
        /* Workspace Mode Switcher Pill Bar */
        #lfModeSwitcherBar {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            padding: 3px;
            border-radius: 12px;
            background: rgba(226, 232, 240, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.45);
        }
        html.dark #lfModeSwitcherBar {
            background: rgba(30, 41, 59, 0.78);
            border-color: rgba(148, 163, 184, 0.25);
        }
        .lf-mode-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 11px;
            border-radius: 9px;
            font-size: 11.5px;
            font-weight: 700;
            color: #475569;
            background: transparent;
            border: none;
            cursor: pointer;
            transition: all 0.14s ease;
            white-space: nowrap;
        }
        html.dark .lf-mode-pill { color: #cbd5e1; }
        .lf-mode-pill:hover { color: #1e293b; background: rgba(255, 255, 255, 0.55); }
        html.dark .lf-mode-pill:hover { color: #ffffff; background: rgba(255, 255, 255, 0.08); }
        .lf-mode-pill.active {
            background: #4f46e5;
            color: #ffffff !important;
            box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35);
        }

        /* Research Quick-Launch Strip (Shown in Research Mode) */
        #lfResearchQuickBar {
            display: none;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 8px 14px;
            margin-bottom: 14px;
            border-radius: 14px;
            background: linear-gradient(90deg, rgba(238, 242, 255, 0.88), rgba(240, 253, 250, 0.88));
            border: 1.5px solid rgba(99, 102, 241, 0.32);
        }
        html.dark #lfResearchQuickBar {
            background: linear-gradient(90deg, rgba(30, 27, 75, 0.65), rgba(19, 78, 74, 0.45));
            border-color: rgba(129, 140, 248, 0.35);
        }
        #lfResearchQuickBar.visible { display: flex; }

        .lf-rq-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 11px;
            border-radius: 9px;
            font-size: 11.5px;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.85);
            color: #334155;
            border: 1px solid rgba(148, 163, 184, 0.45);
            cursor: pointer;
            transition: all 0.12s ease;
        }
        html.dark .lf-rq-btn {
            background: rgba(24, 24, 27, 0.8);
            color: #e4e4e7;
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-rq-btn:hover {
            background: #4f46e5;
            color: #ffffff;
            border-color: #4f46e5;
            transform: translateY(-1px);
        }

        /* Command Palette Overlay */
        #lfCmdPaletteOverlay {
            position: fixed;
            inset: 0;
            z-index: 900;
            background: rgba(15, 23, 42, 0.52);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            display: none;
            align-items: flex-start;
            justify-content: center;
            padding: 9vh 16px 16px;
        }
        #lfCmdPaletteOverlay.open { display: flex; }

        #lfCmdPaletteBox {
            width: 100%;
            max-width: 610px;
            border-radius: 18px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.96);
            border: 2px solid rgba(99, 102, 241, 0.38);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.32);
            display: flex;
            flex-direction: column;
            max-height: 74vh;
        }
        html.dark #lfCmdPaletteBox {
            background: rgba(24, 24, 27, 0.96);
            border-color: rgba(129, 140, 248, 0.4);
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
        }

        .lf-cmd-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            padding: 10px 14px;
            border-radius: 11px;
            text-align: left;
            cursor: pointer;
            border: 1px solid transparent;
            background: transparent;
            transition: background 0.1s ease;
        }
        .lf-cmd-item.selected,
        .lf-cmd-item:hover {
            background: rgba(99, 102, 241, 0.12);
            border-color: rgba(99, 102, 241, 0.3);
        }
        html.dark .lf-cmd-item.selected,
        html.dark .lf-cmd-item:hover {
            background: rgba(99, 102, 241, 0.24);
            border-color: rgba(129, 140, 248, 0.35);
        }

        .lf-kbd {
            display: inline-flex;
            align-items: center;
            padding: 2px 6px;
            border-radius: 6px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10.5px;
            font-weight: 700;
            background: rgba(226, 232, 240, 0.85);
            color: #475569;
            border: 1px solid rgba(148, 163, 184, 0.5);
            white-space: nowrap;
        }
        html.dark .lf-kbd {
            background: rgba(63, 63, 70, 0.85);
            color: #e4e4e7;
            border-color: rgba(113, 113, 122, 0.6);
        }

        /* Toast notification */
        #lfQuickToast {
            position: fixed;
            bottom: 22px;
            left: 50%;
            transform: translateX(-50%) translateY(16px);
            z-index: 950;
            padding: 8px 16px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            background: #1e293b;
            color: #ffffff;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        #lfQuickToast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    `;
    document.head.appendChild(styleEl);

    let toastTimer = 0;
    function showToast(msg) {
        let el = document.getElementById('lfQuickToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'lfQuickToast';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 2100);
    }

    // -------------------------------------------------------------------------
    // 2. HELPERS TO CALL EXISTING LEXFLOW FEATURES SAFELY
    // -------------------------------------------------------------------------
    function isParallelOpen() {
        const pane = document.getElementById('parallelOriginalPane');
        return !!(pane && !pane.classList.contains('hidden'));
    }

    function setParallelOpen(shouldBeOpen) {
        if (typeof window.toggleParallelOriginalPane !== 'function') return;
        if (isParallelOpen() !== shouldBeOpen) {
            window.toggleParallelOriginalPane();
        }
    }

    function setTextFlowVisible(shouldBeVisible) {
        if (typeof window.toggleTextFlowVisibility === 'function') {
            window.toggleTextFlowVisibility(shouldBeVisible, true);
        }
    }

    function openLsjSafely(query) {
        if (typeof window.openLsjModal === 'function') {
            window.openLsjModal(query || '');
            return true;
        }
        const overlay = document.getElementById('lfLsjModalOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.remove('hidden');
            const inp = overlay.querySelector('input[type="text"], input[type="search"], input:not([type])');
            if (inp && query) {
                inp.value = query;
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                const btn = Array.from(overlay.querySelectorAll('button')).find((b) => /^\s*Search/i.test(b.textContent || ''));
                if (btn) btn.click();
            } else if (inp) {
                inp.focus();
            }
            return true;
        }
        const lsjBtn = Array.from(document.querySelectorAll('button')).find((b) => /\bLSJ\b/.test(b.textContent || '') && !b.closest('#lfCmdPaletteOverlay, #lfResearchQuickBar'));
        if (lsjBtn) {
            lsjBtn.click();
            return true;
        }
        showToast('LSJ button not found on this page yet.');
        return false;
    }

    function jumpToPassage(refText) {
        const inp = document.getElementById('passageRefInput');
        if (!inp) return;
        inp.value = refText;
        if (typeof window.updatePassageContext === 'function') {
            window.updatePassageContext();
        }
        showToast(`Jumped to ${refText}`);
    }

    function getActiveBookNum() {
        try {
            const blk = (typeof findTopVisibleVerseBlock === 'function' && findTopVisibleVerseBlock()) ||
                        (typeof lastSelectedBlock !== 'undefined' && lastSelectedBlock);
            if (blk && blk.dataset && blk.dataset.bookNum) {
                return parseInt(blk.dataset.bookNum, 10);
            }
        } catch (e) {}
        return 40;
    }

    function smartLookupSelectedWord() {
        const sel = window.getSelection();
        const word = (sel ? sel.toString() : '').trim().replace(/^[^A-Za-z\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF]+|[^A-Za-z\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF]+$/g, '');
        const bookNum = getActiveBookNum();
        const isHebrewWord = /[\u0590-\u05FF]/.test(word);
        const isGreekWord = /[\u0370-\u03FF\u1F00-\u1FFF]/.test(word);

        if (isHebrewWord || (!isGreekWord && bookNum >= 1 && bookNum <= 39)) {
            if (typeof window.openBdbModal === 'function') {
                window.openBdbModal(word);
            }
        } else {
            if (typeof window.openThayersModal === 'function') {
                window.openThayersModal(word);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 3. THREE WORKSPACE MODES: READ | FLOW | RESEARCH
    // -------------------------------------------------------------------------
    let activeWorkspaceMode = localStorage.getItem('lexflow_workspace_mode') || 'read';

    function applyWorkspaceMode(mode, announce = true) {
        activeWorkspaceMode = mode;
        try { localStorage.setItem('lexflow_workspace_mode', mode); } catch (e) {}

        document.querySelectorAll('.lf-mode-pill').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const rqBar = document.getElementById('lfResearchQuickBar');

        if (mode === 'read') {
            setTextFlowVisible(false);
            setParallelOpen(false);
            if (rqBar) rqBar.classList.remove('visible');
            if (announce) showToast('Read Mode: Clean Single-Pane Scripture');
        } else if (mode === 'flow') {
            setTextFlowVisible(true);
            setParallelOpen(false);
            if (rqBar) rqBar.classList.remove('visible');
            if (announce) showToast('Flow Mode: Full-width Thought Flow, Lines & Semantic Labels');
        } else if (mode === 'research') {
            setParallelOpen(true);
            if (rqBar) rqBar.classList.add('visible');
            if (announce) showToast('Research Mode: Side-by-Side Original + Quick Research Bar');
        }
    }

    function injectTopBarControls() {
        const header = document.querySelector('header');
        if (!header || document.getElementById('lfModeSwitcherBar')) return;

        const leftGroup = header.firstElementChild;
        if (!leftGroup) return;

        // 1. Mode Switcher (Read | Flow | Research)
        const modeBar = document.createElement('div');
        modeBar.id = 'lfModeSwitcherBar';
        modeBar.title = 'Switch workspace preset: Read, Flow & Diagram, or Research';
        modeBar.innerHTML = `
            <button type="button" class="lf-mode-pill" data-mode="read" title="Clean single-pane Scripture reading">
                <i class="fa-solid fa-book-open text-[10px]"></i><span>Read</span>
            </button>
            <button type="button" class="lf-mode-pill" data-mode="flow" title="Thought Flow indents, subordination lines & semantic labels">
                <i class="fa-solid fa-diagram-next text-[10px]"></i><span>Flow</span>
            </button>
            <button type="button" class="lf-mode-pill" data-mode="research" title="Side-by-Side Original + Quick Lexicons, Scripture & Grammar Search">
                <i class="fa-solid fa-microscope text-[10px]"></i><span>Research</span>
            </button>
        `;
        modeBar.querySelectorAll('.lf-mode-pill').forEach((btn) => {
            btn.addEventListener('click', () => applyWorkspaceMode(btn.dataset.mode, true));
        });

        // 2. Command Palette Button (⌘K)
        const cmdBtn = document.createElement('button');
        cmdBtn.type = 'button';
        cmdBtn.id = 'lfOpenCmdPaletteBtn';
        cmdBtn.className = 'glass-control px-2.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 cursor-pointer';
        cmdBtn.title = `Open Quick Command Palette (${MOD}K) — jump to verses, search lexicons, or run any tool`;
        cmdBtn.innerHTML = `
            <i class="fa-solid fa-bolt text-amber-500 text-[11px]"></i>
            <span class="hidden sm:inline">Quick Jump</span>
            <span class="lf-kbd">${MOD}K</span>
        `;
        cmdBtn.addEventListener('click', openCommandPalette);

        leftGroup.appendChild(modeBar);
        leftGroup.appendChild(cmdBtn);

        // Reflect current state on the pills without changing user's current view on load
        const currentFlowShown = !document.body.classList.contains('hide-text-flow');
        const initialPill = currentFlowShown ? 'flow' : (activeWorkspaceMode === 'research' ? 'research' : 'read');
        modeBar.querySelectorAll('.lf-mode-pill').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.mode === initialPill);
        });

        // 3. Research Mode Quick-Launch Strip inside #wordProcessorPane
        const pane = document.getElementById('wordProcessorPane');
        const stickyBar = pane && pane.querySelector('.sticky');
        if (pane && stickyBar && !document.getElementById('lfResearchQuickBar')) {
            const rq = document.createElement('div');
            rq.id = 'lfResearchQuickBar';
            if (activeWorkspaceMode === 'research') rq.classList.add('visible');
            rq.innerHTML = `
                <div class="flex items-center flex-wrap gap-1.5">
                    <span class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mr-1">
                        <i class="fa-solid fa-microscope mr-1"></i>Research Bar:
                    </span>
                    <button type="button" class="lf-rq-btn" data-rq="greek"><i class="fa-solid fa-spell-check text-purple-500"></i><span>Greek Lexicon</span></button>
                    <button type="button" class="lf-rq-btn" data-rq="hebrew"><i class="fa-solid fa-scroll text-teal-500"></i><span>Hebrew Lexicon</span></button>
                    <button type="button" class="lf-rq-btn" data-rq="lsj"><i class="fa-solid fa-landmark text-indigo-500"></i><span>LSJ (1940)</span></button>
                    <button type="button" class="lf-rq-btn" data-rq="scripture"><i class="fa-solid fa-book-bible text-amber-500"></i><span>All-Lexicon Verse Search</span></button>
                    <button type="button" class="lf-rq-btn" data-rq="grammar"><i class="fa-solid fa-magnifying-glass text-sky-500"></i><span>Grammar Search</span></button>
                    <button type="button" class="lf-rq-btn" data-rq="analytics"><i class="fa-solid fa-chart-pie text-emerald-500"></i><span>Analytics</span></button>
                    <button type="button" class="lf-rq-btn" data-rq="notes"><i class="fa-solid fa-book-open text-amber-600"></i><span>Notes</span></button>
                </div>
                <button type="button" class="lf-rq-btn" data-rq="cmd"><i class="fa-solid fa-keyboard text-indigo-500"></i><span>All Actions (${MOD}K)</span></button>
            `;
            rq.querySelectorAll('.lf-rq-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const act = btn.dataset.rq;
                    if (act === 'greek' && typeof openThayersModal === 'function') openThayersModal();
                    else if (act === 'hebrew' && typeof openBdbModal === 'function') openBdbModal();
                    else if (act === 'lsj') openLsjSafely('');
                    else if (act === 'scripture' && typeof window.lfOpenAllLexiconScriptureSearch === 'function') window.lfOpenAllLexiconScriptureSearch('');
                    else if (act === 'grammar' && typeof openGrammarSearchModal === 'function') openGrammarSearchModal();
                    else if (act === 'analytics' && typeof openVisualAnalyticsStudioFromCurrentSearch === 'function') openVisualAnalyticsStudioFromCurrentSearch(false);
                    else if (act === 'notes' && typeof toggleMasterNoteDrawer === 'function') toggleMasterNoteDrawer();
                    else if (act === 'cmd') openCommandPalette();
                });
            });
            stickyBar.insertAdjacentElement('afterend', rq);
        }
    }

    // -------------------------------------------------------------------------
    // 4. UNIVERSAL COMMAND PALETTE (Cmd+K / Ctrl+K)
    // -------------------------------------------------------------------------
    const STATIC_COMMANDS = [
        { id: 'mode_read', icon: 'fa-book-open', color: '#3b82f6', title: 'Switch to Read Mode', subtitle: 'Clean single-pane Scripture reading (no side-by-side or flow lines)', keywords: 'mode read clean single pane', run: () => applyWorkspaceMode('read', true) },
        { id: 'mode_flow', icon: 'fa-diagram-next', color: '#4f46e5', title: 'Switch to Flow & Diagram Mode', subtitle: 'Show Thought Flow indents, subordination lines & semantic labels', keywords: 'mode flow diagram lines indent', run: () => applyWorkspaceMode('flow', true) },
        { id: 'mode_research', icon: 'fa-microscope', color: '#0d9488', title: 'Switch to Research Mode', subtitle: 'Side-by-Side Original + Quick Lexicon & Search bar', keywords: 'mode research lexicon study parallel', run: () => applyWorkspaceMode('research', true) },
        { id: 'all_lex_scripture', icon: 'fa-book-bible', color: '#ca8a04', title: 'All-Lexicon Scripture Search', subtitle: 'Search Abbott-Smith, BDB, Gesenius & LSJ for any Bible verse', keywords: 'scripture verse reference lexicon search', run: () => window.lfOpenAllLexiconScriptureSearch && window.lfOpenAllLexiconScriptureSearch('') },
        { id: 'open_greek', icon: 'fa-spell-check', color: '#9333ea', title: "Open Greek NT Lexicon (Thayer's & Abbott-Smith)", subtitle: 'Search Greek words, English glosses, or Strong’s G#', shortcut: `${MOD}⇧L`, keywords: 'greek thayer abbott smith lexicon nt', run: () => typeof openThayersModal === 'function' && openThayersModal() },
        { id: 'open_hebrew', icon: 'fa-scroll', color: '#0d9488', title: 'Open Hebrew OT Lexicon (BDB & Gesenius)', subtitle: 'Search Hebrew roots, English glosses, or Strong’s H#', keywords: 'hebrew bdb gesenius lexicon ot', run: () => typeof openBdbModal === 'function' && openBdbModal() },
        { id: 'open_lsj', icon: 'fa-landmark', color: '#4338ca', title: 'Open LSJ Greek-English Lexicon (1940)', subtitle: 'Classical & Septuagint (LXX) Greek entries', keywords: 'lsj liddell scott jones classical lxx', run: () => openLsjSafely('') },
        { id: 'open_grammar_search', icon: 'fa-magnifying-glass', color: '#4f46e5', title: 'Open Grammar & Construct Search', subtitle: 'Search morphology, parts of speech, and proximity schemas', keywords: 'grammar morph construct syntax search', run: () => typeof openGrammarSearchModal === 'function' && openGrammarSearchModal() },
        { id: 'open_analytics', icon: 'fa-chart-pie', color: '#059669', title: 'Open Visual Analytics Studio', subtitle: 'Charts, trends, heatmaps & comparative tables', keywords: 'analytics charts graphs visual', run: () => typeof openVisualAnalyticsStudioFromCurrentSearch === 'function' && openVisualAnalyticsStudioFromCurrentSearch(false) },
        { id: 'open_grammar_guide', icon: 'fa-graduation-cap', color: '#6366f1', title: 'Open In-App Grammar Guide (OT/NT)', subtitle: 'Layperson essentials + deep exegetical syntax', keywords: 'guide grammar help reference', run: () => typeof openGrammarCompanionModal === 'function' && openGrammarCompanionModal() },
        { id: 'toggle_parallel', icon: 'fa-columns', color: '#2563eb', title: 'Toggle Side-by-Side Original Language Pane', subtitle: 'Show or hide WLC Hebrew / SRGNT Greek parallel view', shortcut: `${MOD}⇧S`, keywords: 'side by side parallel original greek hebrew', run: () => typeof toggleParallelOriginalPane === 'function' && toggleParallelOriginalPane() },
        { id: 'toggle_flow', icon: 'fa-indent', color: '#4f46e5', title: 'Toggle Text Flow Lines & Semantic Labels', subtitle: 'Show or hide clause indentation and labels', shortcut: `${MOD}⇧F`, keywords: 'text flow hide show lines labels', run: () => typeof toggleTextFlowVisibility === 'function' && toggleTextFlowVisibility() },
        { id: 'auto_split', icon: 'fa-wand-magic-sparkles', color: '#0d9488', title: 'Auto-Split Passage Into Clauses', subtitle: 'Automatically break the active chapter into clauses', keywords: 'split auto clause', run: () => typeof autoSplitPassageClauses === 'function' && autoSplitPassageClauses() },
        { id: 'toggle_notes', icon: 'fa-book-open', color: '#d97706', title: 'Open Master Exegetical Notes', subtitle: 'View, compile, or export all your clause notes', shortcut: `${MOD}⇧N`, keywords: 'notes drawer master exegetical', run: () => typeof toggleMasterNoteDrawer === 'function' && toggleMasterNoteDrawer() },
        { id: 'export_pdf', icon: 'fa-file-pdf', color: '#059669', title: 'Export Clean PDF', subtitle: 'Export your Thought Flow text, indents & lines to PDF', keywords: 'export pdf print download', run: () => typeof exportCleanPDF === 'function' && exportCleanPDF() },
        { id: 'toggle_theme', icon: 'fa-circle-half-stroke', color: '#f59e0b', title: 'Toggle Light / Dark Glass Theme', subtitle: 'Switch between Light Glass and Dark Glass appearance', keywords: 'dark light theme appearance', run: () => typeof toggleTheme === 'function' && toggleTheme() },
        { id: 'open_settings', icon: 'fa-gear', color: '#64748b', title: 'Open Settings, Themes & Projects', subtitle: 'Border colors, cloud sync, and saved workspace projects', keywords: 'settings themes colors sync projects', run: () => typeof openSettingsModal === 'function' && openSettingsModal() }
    ];

    let cmdSelectedIdx = 0;
    let currentFilteredItems = [];

    function buildPaletteDOM() {
        if (document.getElementById('lfCmdPaletteOverlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'lfCmdPaletteOverlay';
        overlay.innerHTML = `
            <div id="lfCmdPaletteBox" role="dialog" aria-modal="true" aria-label="LexFlow Quick Command Palette">
                <div class="px-4 py-3 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-3">
                    <i class="fa-solid fa-bolt text-amber-500 text-sm"></i>
                    <input type="text" id="lfCmdPaletteInput" autocomplete="off"
                           placeholder="Type a verse (Heb 1:1), a word (grace / G2540), or a tool (PDF, Notes, LSJ)..."
                           class="select-text flex-1 bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none">
                    <span class="lf-kbd">Esc</span>
                </div>
                <div id="lfCmdPaletteList" class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1"></div>
                <div class="px-4 py-2 bg-gray-50 dark:bg-zinc-900/90 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span><span class="lf-kbd">↑</span> <span class="lf-kbd">↓</span> navigate &bull; <span class="lf-kbd">Enter</span> run</span>
                    <span>Shortcuts: <span class="lf-kbd">${MOD}K</span> Palette &bull; <span class="lf-kbd">${MOD}⇧L</span> Lookup &bull; <span class="lf-kbd">${MOD}⇧S</span> Side-by-Side &bull; <span class="lf-kbd">${MOD}⇧F</span> Flow</span>
                </div>
            </div>
        `;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeCommandPalette();
        });
        document.body.appendChild(overlay);

        const inp = document.getElementById('lfCmdPaletteInput');
        inp.addEventListener('input', () => {
            cmdSelectedIdx = 0;
            renderCommandList(inp.value);
        });
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeCommandPalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentFilteredItems.length) {
                    cmdSelectedIdx = (cmdSelectedIdx + 1) % currentFilteredItems.length;
                    highlightSelectedCmdItem();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentFilteredItems.length) {
                    cmdSelectedIdx = (cmdSelectedIdx - 1 + currentFilteredItems.length) % currentFilteredItems.length;
                    highlightSelectedCmdItem();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const picked = currentFilteredItems[cmdSelectedIdx];
                if (picked) runCommandItem(picked);
            }
        });
    }

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getDynamicItems(rawQuery) {
        const q = (rawQuery || '').trim();
        if (!q) return [];
        const items = [];

        // 1. Check if user typed a Bible passage reference (e.g., "Gen 1:2", "Heb 1", "Rom 8:1-4")
        const parsedRef = typeof window.parseScriptureReference === 'function' ? window.parseScriptureReference(q) : null;
        if (parsedRef) {
            const label = parsedRef.startVerse && q.includes(':')
                ? `${parsedRef.bookName} ${parsedRef.chapter}:${parsedRef.startVerse}${parsedRef.endVerse > parsedRef.startVerse ? '-' + parsedRef.endVerse : ''}`
                : `${parsedRef.bookName} ${parsedRef.chapter}`;
            items.push({
                id: 'dyn_jump',
                icon: 'fa-location-arrow',
                color: '#4f46e5',
                title: `Jump to ${label}`,
                subtitle: 'Scroll workspace directly to this Scripture passage',
                run: () => jumpToPassage(q)
            });
            if (q.includes(':') || q.includes('.')) {
                items.push({
                    id: 'dyn_lex_verse',
                    icon: 'fa-book-bible',
                    color: '#ca8a04',
                    title: `Search ALL Lexicons for ${label}`,
                    subtitle: 'Find every entry in Abbott-Smith, BDB, Gesenius & LSJ citing this verse',
                    run: () => window.lfOpenAllLexiconScriptureSearch && window.lfOpenAllLexiconScriptureSearch(q)
                });
            }
        }

        // 2. Check if user typed a Strong's # or word
        if (/^[Gg]\d{1,4}$/.test(q)) {
            items.push({
                id: 'dyn_strong_g',
                icon: 'fa-spell-check',
                color: '#9333ea',
                title: `Look up ${q.toUpperCase()} in Greek Lexicon`,
                subtitle: "Open Thayer's / Abbott-Smith entry",
                run: () => typeof openThayersModal === 'function' && openThayersModal(q.toUpperCase())
            });
        } else if (/^[Hh]\d{1,4}$/.test(q)) {
            items.push({
                id: 'dyn_strong_h',
                icon: 'fa-scroll',
                color: '#0d9488',
                title: `Look up ${q.toUpperCase()} in Hebrew Lexicon`,
                subtitle: 'Open BDB / Gesenius entry',
                run: () => typeof openBdbModal === 'function' && openBdbModal(q.toUpperCase())
            });
        } else if (!parsedRef && q.length >= 2) {
            items.push({
                id: 'dyn_word_g',
                icon: 'fa-spell-check',
                color: '#9333ea',
                title: `Look up “${q}” in Greek Lexicon`,
                subtitle: "Search Thayer's & Abbott-Smith",
                run: () => typeof openThayersModal === 'function' && openThayersModal(q)
            });
            items.push({
                id: 'dyn_word_h',
                icon: 'fa-scroll',
                color: '#0d9488',
                title: `Look up “${q}” in Hebrew Lexicon`,
                subtitle: 'Search BDB & Gesenius',
                run: () => typeof openBdbModal === 'function' && openBdbModal(q)
            });
        }

        return items;
    }

    function renderCommandList(rawQuery) {
        const listEl = document.getElementById('lfCmdPaletteList');
        if (!listEl) return;
        const q = (rawQuery || '').trim().toLowerCase();

        const dynamic = getDynamicItems(rawQuery);
        const matchedStatic = STATIC_COMMANDS.filter((c) => {
            if (!q) return true;
            const hay = `${c.title} ${c.subtitle} ${c.keywords}`.toLowerCase();
            return q.split(/\s+/).every((part) => hay.includes(part));
        });

        currentFilteredItems = [...dynamic, ...matchedStatic];

        if (!currentFilteredItems.length) {
            listEl.innerHTML = `<div class="p-6 text-center text-xs text-gray-500 dark:text-gray-400">No matching commands. Try typing a verse like <strong>Heb 1:1</strong> or a tool like <strong>PDF</strong>.</div>`;
            return;
        }

        listEl.innerHTML = currentFilteredItems.map((item, idx) => `
            <button type="button" class="lf-cmd-item ${idx === cmdSelectedIdx ? 'selected' : ''}" data-cmd-idx="${idx}">
                <div class="flex items-center gap-3 min-w-0">
                    <span class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background: ${item.color}18; color: ${item.color};">
                        <i class="fa-solid ${item.icon} text-xs"></i>
                    </span>
                    <div class="min-w-0">
                        <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">${escapeHtml(item.title)}</div>
                        <div class="text-[11px] text-gray-500 dark:text-gray-400 truncate">${escapeHtml(item.subtitle)}</div>
                    </div>
                </div>
                ${item.shortcut ? `<span class="lf-kbd shrink-0">${escapeHtml(item.shortcut)}</span>` : ''}
            </button>
        `).join('');

        listEl.querySelectorAll('.lf-cmd-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                const picked = currentFilteredItems[parseInt(btn.dataset.cmdIdx, 10)];
                if (picked) runCommandItem(picked);
            });
        });
    }

    function highlightSelectedCmdItem() {
        const listEl = document.getElementById('lfCmdPaletteList');
        if (!listEl) return;
        listEl.querySelectorAll('.lf-cmd-item').forEach((btn, idx) => {
            const active = idx === cmdSelectedIdx;
            btn.classList.toggle('selected', active);
            if (active) btn.scrollIntoView({ block: 'nearest' });
        });
    }

    function runCommandItem(item) {
        closeCommandPalette();
        setTimeout(() => {
            try { item.run(); } catch (e) { console.error(e); }
        }, 30);
    }

    function openCommandPalette() {
        buildPaletteDOM();
        const overlay = document.getElementById('lfCmdPaletteOverlay');
        const inp = document.getElementById('lfCmdPaletteInput');
        if (!overlay || !inp) return;
        overlay.classList.add('open');
        inp.value = '';
        cmdSelectedIdx = 0;
        renderCommandList('');
        setTimeout(() => inp.focus(), 10);
    }

    function closeCommandPalette() {
        const overlay = document.getElementById('lfCmdPaletteOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    window.openLexFlowCommandPalette = openCommandPalette;

    // -------------------------------------------------------------------------
    // 5. GLOBAL KEYBOARD SHORTCUTS (Safe, Non-Conflicting)
    // -------------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        const modPressed = isMac ? e.metaKey : e.ctrlKey;
        if (!modPressed || e.altKey) return;

        const key = (e.key || '').toLowerCase();

        // Cmd/Ctrl + K -> Command Palette
        if (!e.shiftKey && key === 'k') {
            e.preventDefault();
            const overlay = document.getElementById('lfCmdPaletteOverlay');
            if (overlay && overlay.classList.contains('open')) closeCommandPalette();
            else openCommandPalette();
            return;
        }

        // Ignore Shift shortcuts if typing inside a text box (except flowEditor)
        const tag = (e.target && e.target.tagName) || '';
        const inFormField = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
        if (inFormField) return;

        if (e.shiftKey) {
            if (key === 'l') {
                e.preventDefault();
                smartLookupSelectedWord();
            } else if (key === 's') {
                e.preventDefault();
                if (typeof window.toggleParallelOriginalPane === 'function') window.toggleParallelOriginalPane();
            } else if (key === 'f') {
                e.preventDefault();
                if (typeof window.toggleTextFlowVisibility === 'function') window.toggleTextFlowVisibility();
            } else if (key === 'n') {
                e.preventDefault();
                if (typeof window.toggleMasterNoteDrawer === 'function') window.toggleMasterNoteDrawer();
            }
        }
    });

    // -------------------------------------------------------------------------
    // 6. INITIALIZE
    // -------------------------------------------------------------------------
    function initPhase1() {
        injectTopBarControls();
        buildPaletteDOM();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhase1);
    } else {
        initPhase1();
    }
})();
