/* === LEXFLOW PHASE 4 MODULE: FLOW-TO-OUTLINE BUILDER, UNIFIED EXPORT STUDIO & OFFLINE PWA === */
(function () {
    if (window.__lfPhase4ExportLoaded) return;
    window.__lfPhase4ExportLoaded = true;

    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
    const MOD = isMac ? '⌘' : 'Ctrl+';

    const state = {
        activeTab: 'outline',       // 'outline' | 'export'
        scopeMode: 'chapter',       // 'chapter' | 'range' | 'modified'
        rangeText: '',
        studyTitle: '',
        bigIdea: '',
        includeVerseNums: true,
        includeSemanticLabels: true,
        includeClauseNotes: true,
        includeFlowDiagram: true,
        includeOutline: true,
        includeMasterNotes: true,
        deferredInstallPrompt: null,
        swRegistered: false
    };

    // -------------------------------------------------------------------------
    // 1. STYLES
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfPhase4ExportStyles';
    styleEl.textContent = `
        #lfExportStudioModal {
            position: fixed;
            inset: 0;
            z-index: 620;
            background: rgba(15, 23, 42, 0.58);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        #lfExportStudioModal.open { display: flex; }

        #lfExportStudioDialog {
            width: 100%;
            max-width: 960px;
            height: 88vh;
            max-height: 860px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .lf-exp-tab-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            background: transparent;
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.13s ease;
        }
        html.dark .lf-exp-tab-btn { color: #cbd5e1; }
        .lf-exp-tab-btn:hover { background: rgba(148, 163, 184, 0.16); color: #0f172a; }
        html.dark .lf-exp-tab-btn:hover { color: #ffffff; }
        .lf-exp-tab-btn.active {
            background: #4f46e5;
            color: #ffffff !important;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.32);
        }

        #lfOutlineEditorArea {
            outline: none;
            line-height: 1.75;
            font-size: 14.5px;
        }
        #lfOutlineEditorArea h1 { font-size: 1.35rem; font-weight: 800; margin-bottom: 0.35rem; }
        #lfOutlineEditorArea .lf-ol-bigidea {
            padding: 8px 12px;
            border-left: 4px solid #4f46e5;
            background: rgba(99, 102, 241, 0.08);
            border-radius: 0 8px 8px 0;
            margin: 8px 0 14px;
            font-style: italic;
        }
        #lfOutlineEditorArea .lf-ol-row {
            margin: 4px 0;
            padding: 2px 0;
        }
        #lfOutlineEditorArea .lf-ol-lvl-0 { font-weight: 700; margin-top: 10px; font-size: 15.5px; }
        #lfOutlineEditorArea .lf-ol-lvl-1 { margin-left: 24px; }
        #lfOutlineEditorArea .lf-ol-lvl-2 { margin-left: 48px; font-size: 14px; }
        #lfOutlineEditorArea .lf-ol-lvl-3 { margin-left: 72px; font-size: 13.5px; }
        #lfOutlineEditorArea .lf-ol-note {
            margin: 4px 0 8px 34px;
            padding: 6px 10px;
            border-left: 3px solid #10b981;
            background: rgba(16, 185, 129, 0.07);
            border-radius: 0 6px 6px 0;
            font-size: 12.5px;
        }
        .lf-ol-tag {
            display: inline-block;
            font-size: 10.5px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 999px;
            margin-right: 5px;
            vertical-align: middle;
        }
        .lf-exp-card-btn {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 16px;
            border-radius: 14px;
            text-align: left;
            cursor: pointer;
            transition: all 0.14s ease;
            border: 1.5px solid rgba(148, 163, 184, 0.35);
            background: rgba(255, 255, 255, 0.9);
        }
        html.dark .lf-exp-card-btn {
            background: rgba(39, 39, 42, 0.88);
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-exp-card-btn:hover {
            transform: translateY(-2px);
            border-color: #4f46e5;
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.15);
        }
    `;
    document.head.appendChild(styleEl);

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function stripHtmlToPlain(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = String(html || '');
        return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function showToast(msg) {
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
        }, 2500);
    }

    // -------------------------------------------------------------------------
    // 2. EXTRACT THOUGHT FLOW CLAUSES FROM #flowEditor
    // -------------------------------------------------------------------------
    function parseIndentLevel(el) {
        const ml = (el.style && el.style.marginLeft) ? el.style.marginLeft.trim() : '';
        if (!ml) return 0;
        const val = parseFloat(ml) || 0;
        if (val <= 0) return 0;
        if (ml.endsWith('rem') || ml.endsWith('em')) {
            return Math.min(6, Math.max(1, Math.round(val / 2.1)));
        }
        // px fallback
        return Math.min(6, Math.max(1, Math.round(val / 32)));
    }

    function getActiveChapterContext() {
        const topBlk = (typeof findTopVisibleVerseBlock === 'function' ? findTopVisibleVerseBlock() : null) ||
                       (typeof lastSelectedBlock !== 'undefined' ? lastSelectedBlock : null);
        if (topBlk && topBlk.dataset && topBlk.dataset.bookNum) {
            const bookNum = parseInt(topBlk.dataset.bookNum, 10) || 43;
            const chapter = parseInt(topBlk.dataset.chapterNum, 10) || 1;
            const bookName = topBlk.dataset.bookName || (typeof bibleBooksList !== 'undefined' && bibleBooksList[bookNum - 1] ? bibleBooksList[bookNum - 1].name : 'Scripture');
            return { bookNum, bookName, chapter };
        }
        return { bookNum: 43, bookName: 'John', chapter: 1 };
    }

    function collectClausesForExport() {
        const ed = document.getElementById('flowEditor');
        if (!ed) return { label: 'LexFlow Study', clauses: [] };

        const allBlocks = Array.from(ed.children).filter((el) => !el.classList.contains('lex-chapter-banner') && (el.textContent || '').trim().length > 0);
        let selectedBlocks = [];
        let label = 'LexFlow Study';

        if (state.scopeMode === 'range' && state.rangeText.trim() && typeof window.parseScriptureReference === 'function') {
            const parsed = window.parseScriptureReference(state.rangeText.trim());
            if (parsed) {
                selectedBlocks = allBlocks.filter((b) => {
                    const bn = parseInt(b.dataset.bookNum || '0', 10);
                    const ch = parseInt(b.dataset.chapterNum || '0', 10);
                    const vs = parseInt(b.dataset.verseNum || '0', 10);
                    return bn === parsed.bookNum && ch === parsed.chapter && vs >= parsed.startVerse && vs <= parsed.endVerse;
                });
                const isWhole = !state.rangeText.includes(':');
                label = isWhole
                    ? `${parsed.bookName} ${parsed.chapter}`
                    : (parsed.endVerse > parsed.startVerse
                        ? `${parsed.bookName} ${parsed.chapter}:${parsed.startVerse}-${parsed.endVerse}`
                        : `${parsed.bookName} ${parsed.chapter}:${parsed.startVerse}`);
            }
        } else if (state.scopeMode === 'modified') {
            // Find every chapter that has any indentation, relation label, clause notes, split verse, or formatting
            const modifiedChaps = new Set();
            let prevV = null;
            allBlocks.forEach((b) => {
                const key = `${b.dataset.bookNum}_${b.dataset.chapterNum}`;
                const v = b.dataset.verseNum;
                const isMod =
                    parseIndentLevel(b) > 0 ||
                    !!b.dataset.relation ||
                    !!b.dataset.exegeticalNotes ||
                    b.dataset.splitVerse === 'true' ||
                    b.dataset.edited === 'true' ||
                    b.classList.contains('attach-down') ||
                    b.children.length > 0 ||
                    (v && v === prevV);
                if (isMod) modifiedChaps.add(key);
                prevV = v;
            });
            selectedBlocks = allBlocks.filter((b) => modifiedChaps.has(`${b.dataset.bookNum}_${b.dataset.chapterNum}`));
            label = modifiedChaps.size > 0
                ? `All Studied Chapters (${modifiedChaps.size})`
                : 'No Studied Chapters Found';
        }

        // Default or fallback: Current Visible Chapter
        if (state.scopeMode === 'chapter' || (state.scopeMode === 'range' && !selectedBlocks.length && !state.rangeText.trim())) {
            const ctx = getActiveChapterContext();
            selectedBlocks = allBlocks.filter((b) =>
                parseInt(b.dataset.bookNum || '0', 10) === ctx.bookNum &&
                parseInt(b.dataset.chapterNum || '0', 10) === ctx.chapter
            );
            label = `${ctx.bookName} ${ctx.chapter}`;
        }

        const clauses = selectedBlocks.map((b) => {
            const rel = (b.dataset.relation || '').trim();
            let relColor = b.dataset.relationColor || b.dataset.relationDot || '#6366f1';
            if (rel && typeof semanticPresetMap !== 'undefined' && semanticPresetMap[rel]) {
                relColor = semanticPresetMap[rel].dot || relColor;
            }
            return {
                bookName: b.dataset.bookName || '',
                chapter: b.dataset.chapterNum || '',
                verse: b.dataset.verseNum || '',
                level: parseIndentLevel(b),
                text: (b.textContent || '').replace(/\s+/g, ' ').trim(),
                html: b.innerHTML,
                relation: rel,
                relationColor: relColor,
                attachDown: b.classList.contains('attach-down'),
                notesHtml: (b.dataset.exegeticalNotes || '').trim()
            };
        });

        return { label, clauses };
    }

    function toRoman(num) {
        const vals = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
        let n = num, out = '';
        for (const [v, sym] of vals) {
            while (n >= v) { out += sym; n -= v; }
        }
        return out || String(num);
    }

    function toAlpha(num, upper = true) {
        const base = upper ? 65 : 97;
        let n = num, out = '';
        while (n > 0) {
            n--;
            out = String.fromCharCode(base + (n % 26)) + out;
            n = Math.floor(n / 26);
        }
        return out || (upper ? 'A' : 'a');
    }

    function getOutlineMarker(level, counters) {
        counters[level] = (counters[level] || 0) + 1;
        for (let k = level + 1; k < counters.length; k++) counters[k] = 0;
        if (level === 0) return `${toRoman(counters[0])}.`;
        if (level === 1) return `${toAlpha(counters[1], true)}.`;
        if (level === 2) return `${counters[2]}.`;
        return `${toAlpha(counters[level], false)}.`;
    }

    // -------------------------------------------------------------------------
    // 3. BUILD STRUCTURED TEACHING OUTLINE (HTML & MARKDOWN)
    // -------------------------------------------------------------------------
    function generateOutlineHTML(bundle) {
        const { label, clauses } = bundle;
        const title = state.studyTitle.trim() || `${label} — Teaching Outline`;
        const bigIdea = state.bigIdea.trim();

        let html = `<h1>${escapeHtml(title)}</h1>`;
        if (bigIdea) {
            html += `<div class="lf-ol-bigidea"><strong>Big Idea:</strong> ${escapeHtml(bigIdea)}</div>`;
        }

        if (!clauses.length) {
            html += `<p style="color:#6b7280;font-style:italic;">No clauses found for this selection. Try switching scope to "Current Chapter" or enter a verse range like "Heb 1:1-4".</p>`;
            return html;
        }

        const counters = [0, 0, 0, 0, 0, 0, 0];
        let lastVerseShown = '';

        clauses.forEach((c) => {
            const lvl = Math.min(3, c.level);
            const marker = getOutlineMarker(lvl, counters);
            const verseKey = `${c.chapter}:${c.verse}`;
            const showVerse = state.includeVerseNums && c.verse && verseKey !== lastVerseShown;
            if (showVerse) lastVerseShown = verseKey;

            const verseBadge = showVerse
                ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#b45309;margin-right:5px;">(${escapeHtml(c.chapter)}:${escapeHtml(c.verse)})</span>`
                : '';

            const relBadge = (state.includeSemanticLabels && c.relation)
                ? `<span class="lf-ol-tag" style="background:${c.relationColor}22;color:${c.relationColor};border:1px solid ${c.relationColor}66;">${escapeHtml(c.relation)}</span>`
                : '';

            html += `<div class="lf-ol-row lf-ol-lvl-${lvl}"><span style="font-weight:800;margin-right:6px;color:#4f46e5;">${marker}</span>${relBadge}${verseBadge}${escapeHtml(c.text)}</div>`;

            if (state.includeClauseNotes && c.notesHtml) {
                html += `<div class="lf-ol-note"><strong>Note (v${escapeHtml(c.verse)}):</strong> ${c.notesHtml}</div>`;
            }
        });

        return html;
    }

    function generateCombinedExportHTML(bundle) {
        const { label, clauses } = bundle;
        const title = state.studyTitle.trim() || `LexFlow Study Packet — ${label}`;
        const bigIdea = state.bigIdea.trim();
        const masterEditor = document.getElementById('masterNoteEditor');
        const masterNotesHtml = masterEditor ? masterEditor.innerHTML.trim() : '';
        const outlineEditor = document.getElementById('lfOutlineEditorArea');
        const editedOutlineHtml = outlineEditor && outlineEditor.dataset.userEdited === 'true'
            ? outlineEditor.innerHTML
            : generateOutlineHTML(bundle);

        const sections = [];

        // Header block
        sections.push(`
            <div style="border-bottom:2px solid #4f46e5;padding-bottom:10px;margin-bottom:18px;">
                <h1 style="margin:0 0 4px 0;font-size:22pt;color:#111827;">${escapeHtml(title)}</h1>
                <div style="font-size:10pt;color:#6b7280;">Passage: <strong>${escapeHtml(label)}</strong> &bull; Exported from LexFlow</div>
                ${bigIdea ? `<div style="margin-top:10px;padding:8px 12px;border-left:4px solid #4f46e5;background:#eef2ff;font-style:italic;color:#1e1b4b;"><strong>Big Idea:</strong> ${escapeHtml(bigIdea)}</div>` : ''}
            </div>
        `);

        // 1. Thought Flow Diagram
        if (state.includeFlowDiagram && clauses.length) {
            let lastV = '';
            const flowRows = clauses.map((c) => {
                const indentPx = c.level * 28;
                const borderLeft = c.level > 0 ? 'border-left:2.5px solid #9ca3af;padding-left:12px;' : '';
                const vKey = `${c.chapter}:${c.verse}`;
                const vSpan = (state.includeVerseNums && c.verse && vKey !== lastV)
                    ? `<sup style="font-family:monospace;font-weight:700;color:#b45309;margin-right:4px;">${escapeHtml(c.verse)}</sup>`
                    : '';
                if (vSpan) lastV = vKey;
                const relSpan = (state.includeSemanticLabels && c.relation)
                    ? `<span style="display:inline-block;font-size:8.5pt;font-weight:700;padding:1px 7px;border-radius:10px;margin-right:6px;background:${c.relationColor}22;color:${c.relationColor};border:1px solid ${c.relationColor}88;">${escapeHtml(c.relation)}</span>`
                    : '';
                const attachPrefix = c.attachDown ? `<span style="color:#6366f1;font-weight:700;margin-right:4px;">↓</span>` : '';
                return `<div style="margin-left:${indentPx}px;${borderLeft}padding-top:4px;padding-bottom:4px;font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.7;">${attachPrefix}${relSpan}${vSpan}${c.html}</div>`;
            }).join('');

            sections.push(`
                <div style="margin-bottom:24px;">
                    <h2 style="font-size:14pt;color:#4f46e5;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:10px;">Thought Flow Diagram</h2>
                    ${flowRows}
                </div>
            `);
        }

        // 2. Teaching / Sermon Outline
        if (state.includeOutline && clauses.length) {
            sections.push(`
                <div style="margin-bottom:24px;">
                    <h2 style="font-size:14pt;color:#0f766e;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:10px;">Teaching / Sermon Outline</h2>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:11.5pt;line-height:1.7;">${editedOutlineHtml}</div>
                </div>
            `);
        }

        // 3. Companion Clause Notes
        if (state.includeClauseNotes) {
            const withNotes = clauses.filter((c) => c.notesHtml);
            if (withNotes.length) {
                const notesRows = withNotes.map((c) => `
                    <div style="margin-bottom:10px;padding:8px 12px;border-left:3px solid #10b981;background:#f0fdf4;">
                        <div style="font-size:9.5pt;font-weight:700;color:#065f46;margin-bottom:3px;">${escapeHtml(c.bookName)} ${escapeHtml(c.chapter)}:${escapeHtml(c.verse)} — “${escapeHtml(c.text.slice(0, 75))}${c.text.length > 75 ? '…' : ''}”</div>
                        <div style="font-size:10.5pt;color:#1f2937;">${c.notesHtml}</div>
                    </div>
                `).join('');
                sections.push(`
                    <div style="margin-bottom:24px;">
                        <h2 style="font-size:14pt;color:#059669;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:10px;">Exegetical Clause Notes</h2>
                        ${notesRows}
                    </div>
                `);
            }
        }

        // 4. Master Notes Document
        if (state.includeMasterNotes && masterNotesHtml && stripHtmlToPlain(masterNotesHtml).length > 0) {
            sections.push(`
                <div style="margin-bottom:20px;">
                    <h2 style="font-size:14pt;color:#d97706;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:10px;">Master Exegetical Notes</h2>
                    <div style="font-size:11pt;line-height:1.65;">${masterNotesHtml}</div>
                </div>
            `);
        }

        return sections.join('\n');
    }

    function generateMarkdownExport(bundle) {
        const { label, clauses } = bundle;
        const title = state.studyTitle.trim() || `LexFlow Study — ${label}`;
        const bigIdea = state.bigIdea.trim();
        const lines = [];

        lines.push(`# ${title}`);
        lines.push(`> **Passage:** ${label}`);
        if (bigIdea) lines.push(`> **Big Idea:** ${bigIdea}`);
        lines.push('');

        if (state.includeFlowDiagram && clauses.length) {
            lines.push('## Thought Flow Diagram');
            lines.push('');
            clauses.forEach((c) => {
                const pad = '  '.repeat(c.level);
                const rel = (state.includeSemanticLabels && c.relation) ? `**[${c.relation}]** ` : '';
                const vTag = (state.includeVerseNums && c.verse) ? `\`v${c.verse}\` ` : '';
                const arr = c.attachDown ? '↓ ' : '';
                lines.push(`${pad}- ${arr}${rel}${vTag}${c.text}`);
            });
            lines.push('');
        }

        if (state.includeOutline && clauses.length) {
            lines.push('## Teaching / Sermon Outline');
            lines.push('');
            const counters = [0, 0, 0, 0, 0, 0, 0];
            clauses.forEach((c) => {
                const lvl = Math.min(3, c.level);
                const pad = '  '.repeat(lvl);
                const marker = getOutlineMarker(lvl, counters);
                const rel = (state.includeSemanticLabels && c.relation) ? `*(${c.relation})* ` : '';
                const vTag = (state.includeVerseNums && c.verse) ? `(${c.chapter}:${c.verse}) ` : '';
                const boldWrap = lvl === 0 ? `**${c.text}**` : c.text;
                lines.push(`${pad}- **${marker}** ${rel}${vTag}${boldWrap}`);
                if (state.includeClauseNotes && c.notesHtml) {
                    const plainNote = stripHtmlToPlain(c.notesHtml);
                    if (plainNote) lines.push(`${pad}  > *Note:* ${plainNote}`);
                }
            });
            lines.push('');
        }

        if (state.includeClauseNotes) {
            const withNotes = clauses.filter((c) => c.notesHtml);
            if (withNotes.length) {
                lines.push('## Exegetical Clause Notes');
                lines.push('');
                withNotes.forEach((c) => {
                    lines.push(`### ${c.bookName} ${c.chapter}:${c.verse} — "${c.text.slice(0, 65)}${c.text.length > 65 ? '…' : ''}"`);
                    lines.push(stripHtmlToPlain(c.notesHtml));
                    lines.push('');
                });
            }
        }

        if (state.includeMasterNotes) {
            const masterEditor = document.getElementById('masterNoteEditor');
            const plainMaster = masterEditor ? stripHtmlToPlain(masterEditor.innerHTML) : '';
            if (plainMaster) {
                lines.push('## Master Exegetical Notes');
                lines.push('');
                lines.push(plainMaster);
                lines.push('');
            }
        }

        return lines.join('\n');
    }

    // -------------------------------------------------------------------------
    // 4. EXPORT ACTIONS (PDF, WORD .DOC, RICH-TEXT COPY, MARKDOWN .MD)
    // -------------------------------------------------------------------------
    function sanitizeFilename(name) {
        return String(name || 'LexFlow-Study').replace(/[^A-Za-z0-9\-_ ]+/g, '').replace(/\s+/g, '-').slice(0, 64) || 'LexFlow-Study';
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            a.remove();
            URL.revokeObjectURL(url);
        }, 250);
    }

    function runPdfStudyPacketExport() {
        const bundle = collectClausesForExport();
        const bodyHtml = generateCombinedExportHTML(bundle);
        const title = state.studyTitle.trim() || `LexFlow — ${bundle.label}`;

        const win = window.open('', '_blank', 'width=900,height=780');
        if (!win) {
            showToast('Pop-up blocked — allow pop-ups for LexFlow to print/save PDF.');
            return;
        }
        win.document.open();
        win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<style>
    @page { margin: 0.75in; }
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
        color: #111827;
        background: #ffffff;
        max-width: 780px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.65;
    }
    .no-print-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        margin-bottom: 18px;
        border-radius: 10px;
        background: #eef2ff;
        border: 1px solid #c7d2fe;
        font-family: system-ui, sans-serif;
        font-size: 13px;
    }
    .no-print-bar button {
        background: #4f46e5;
        color: #fff;
        border: none;
        padding: 7px 14px;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
    }
    @media print {
        .no-print-bar { display: none !important; }
        body { padding: 0; }
    }
</style>
</head>
<body>
    <div class="no-print-bar">
        <span><strong>Ready to Print or Save as PDF</strong> — Choose “Save as PDF” in the Print window.</span>
        <button onclick="window.print()">Print / Save PDF</button>
    </div>
    ${bodyHtml}
</body>
</html>`);
        win.document.close();
        setTimeout(() => { try { win.focus(); win.print(); } catch (e) {} }, 250);
    }

    function runWordDocExport() {
        const bundle = collectClausesForExport();
        const bodyHtml = generateCombinedExportHTML(bundle);
        const title = state.studyTitle.trim() || `LexFlow-${bundle.label}`;

        const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<style>
    body { font-family: Georgia, "Times New Roman", serif; font-size: 12pt; color: #111827; line-height: 1.65; }
    h1 { font-size: 18pt; color: #111827; }
    h2 { font-size: 14pt; color: #4f46e5; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;

        const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
        downloadBlob(blob, `${sanitizeFilename(title)}.doc`);
        showToast('Downloaded Word Document (.doc) — opens in Word, Pages & Google Docs!');
    }

    async function runRichTextCopy(htmlToCopy) {
        const plain = stripHtmlToPlain(htmlToCopy);
        try {
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                const item = new ClipboardItem({
                    'text/html': new Blob([htmlToCopy], { type: 'text/html' }),
                    'text/plain': new Blob([plain], { type: 'text/plain' })
                });
                await navigator.clipboard.write([item]);
                showToast('Copied formatted study packet — press Cmd+V in Google Docs, Word, or Pages!');
                return;
            }
        } catch (e) {}

        // Fallback rich-text selection copy
        const temp = document.createElement('div');
        temp.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff;color:#111;';
        temp.innerHTML = htmlToCopy;
        document.body.appendChild(temp);
        const range = document.createRange();
        range.selectNodeContents(temp);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand('copy'); } catch (e) {}
        sel.removeAllRanges();
        temp.remove();
        showToast('Copied formatted study packet to clipboard!');
    }

    function runMarkdownExport() {
        const bundle = collectClausesForExport();
        const md = generateMarkdownExport(bundle);
        const title = state.studyTitle.trim() || `LexFlow-${bundle.label}`;
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        downloadBlob(blob, `${sanitizeFilename(title)}.md`);
        showToast('Downloaded Markdown (.md) for Obsidian / Notion!');
    }

    // -------------------------------------------------------------------------
    // 5. BUILD EXPORT & OUTLINE STUDIO MODAL UI
    // -------------------------------------------------------------------------
    function buildExportStudioModal() {
        if (document.getElementById('lfExportStudioModal')) return;

        const modal = document.createElement('div');
        modal.id = 'lfExportStudioModal';
        modal.innerHTML = `
            <div id="lfExportStudioDialog" class="glass-panel">
                <!-- Header -->
                <div class="px-5 py-3.5 bg-gradient-to-r from-indigo-50/95 via-white/95 to-emerald-50/95 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 border-b border-indigo-200/80 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="bg-emerald-600 text-white p-2 rounded-xl shadow-sm">
                            <i class="fa-solid fa-file-export text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Outline Builder &amp; Unified Export Studio</h3>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400">Turn your Thought Flow into a sermon/teaching outline and export to PDF, Word, Google Docs, or Markdown</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" class="lf-exp-tab-btn active" data-exp-tab="outline">
                            <i class="fa-solid fa-list-ol"></i><span>1. Flow-to-Outline Builder</span>
                        </button>
                        <button type="button" class="lf-exp-tab-btn" data-exp-tab="export">
                            <i class="fa-solid fa-download"></i><span>2. Export Packet</span>
                        </button>
                        <button type="button" id="lfCloseExportStudioBtn" class="text-gray-400 hover:text-red-500 text-lg font-bold px-2 py-1 cursor-pointer" title="Close (Esc)">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Shared Scope & Metadata Bar -->
                <div class="px-5 py-3 bg-white/85 dark:bg-zinc-900/90 border-b border-gray-200/80 dark:border-zinc-800 space-y-2.5 shrink-0 text-xs">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="font-bold text-gray-700 dark:text-gray-200">Passage Scope:</span>
                        <select id="lfExpScopeSelect" class="glass-control px-2.5 py-1.5 font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer">
                            <option value="chapter">Current Visible Chapter</option>
                            <option value="range">Custom Verse Range (e.g. Heb 1:1-4)</option>
                            <option value="modified">All Studied / Indented Chapters</option>
                        </select>
                        <input type="text" id="lfExpRangeInput" placeholder="e.g. Heb 1:1-4 or Gen 1:1-5"
                               class="hidden select-text px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-xs font-bold text-gray-900 dark:text-white outline-none w-48">
                        <button type="button" id="lfExpRefreshOutlineBtn" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer">
                            <i class="fa-solid fa-rotate mr-1"></i>Refresh from Flow
                        </button>
                        <span id="lfExpClauseCountBadge" class="ml-auto px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">0 clauses</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="text" id="lfExpTitleInput" placeholder="Study / Sermon Title (optional — auto-fills from passage)..."
                               class="select-text px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-xs font-semibold text-gray-900 dark:text-white outline-none">
                        <input type="text" id="lfExpBigIdeaInput" placeholder="Big Idea / Main Proposition (optional)..."
                               class="select-text px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-xs font-semibold text-gray-900 dark:text-white outline-none">
                    </div>
                </div>

                <!-- TAB 1: FLOW-TO-OUTLINE BUILDER -->
                <div id="lfExpPanel_outline" class="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div class="px-5 py-2 bg-slate-50/90 dark:bg-zinc-800/80 border-b border-gray-200/80 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                        <div class="flex items-center flex-wrap gap-3">
                            <label class="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                                <input type="checkbox" id="lfChkVerseNums" checked class="accent-indigo-600">
                                <span>Verse #s</span>
                            </label>
                            <label class="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                                <input type="checkbox" id="lfChkSemLabels" checked class="accent-indigo-600">
                                <span>Semantic Labels</span>
                            </label>
                            <label class="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                                <input type="checkbox" id="lfChkClauseNotes" checked class="accent-indigo-600">
                                <span>Inline Clause Notes</span>
                            </label>
                        </div>
                        <div class="flex items-center flex-wrap gap-1.5">
                            <button type="button" id="lfOutlineCopyBtn" class="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 hover:bg-indigo-600 hover:text-white text-indigo-800 dark:text-indigo-200 font-bold transition cursor-pointer">
                                <i class="fa-solid fa-copy mr-1"></i>Copy Outline
                            </button>
                            <button type="button" id="lfOutlineToMasterBtn" class="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 hover:bg-amber-600 hover:text-white text-amber-900 dark:text-amber-200 font-bold transition cursor-pointer">
                                <i class="fa-solid fa-book-open mr-1"></i>Send to Master Notes
                            </button>
                            <button type="button" id="lfOutlineNextToExportBtn" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition cursor-pointer">
                                Export Packet →
                            </button>
                        </div>
                    </div>
                    <div class="flex-1 p-5 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-zinc-900/95">
                        <div class="text-[11px] text-gray-400 italic mb-2">Tip: You can click anywhere below to edit, reword, or polish your outline before copying or exporting.</div>
                        <div id="lfOutlineEditorArea" contenteditable="true" class="font-serif text-gray-900 dark:text-gray-100 min-h-[260px]"></div>
                    </div>
                </div>

                <!-- TAB 2: UNIFIED EXPORT STUDIO -->
                <div id="lfExpPanel_export" class="hidden flex-1 p-5 overflow-y-auto custom-scrollbar bg-gray-50/70 dark:bg-zinc-900/70 space-y-5">
                    <!-- Packet Contents Checklist -->
                    <div class="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 space-y-2.5">
                        <div class="text-xs font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                            <i class="fa-solid fa-list-check text-indigo-500 mr-1.5"></i>What to Include in Your Study Packet
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <label class="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-700 flex items-center gap-2.5 cursor-pointer font-semibold text-gray-800 dark:text-gray-100">
                                <input type="checkbox" id="lfIncFlowChk" checked class="accent-indigo-600 w-4 h-4">
                                <span><strong>Thought Flow Diagram</strong> (Indents, lines &amp; semantic pills)</span>
                            </label>
                            <label class="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-700 flex items-center gap-2.5 cursor-pointer font-semibold text-gray-800 dark:text-gray-100">
                                <input type="checkbox" id="lfIncOutlineChk" checked class="accent-indigo-600 w-4 h-4">
                                <span><strong>Teaching / Sermon Outline</strong> (Your I. A. 1. outline)</span>
                            </label>
                            <label class="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-700 flex items-center gap-2.5 cursor-pointer font-semibold text-gray-800 dark:text-gray-100">
                                <input type="checkbox" id="lfIncNotesChk" checked class="accent-indigo-600 w-4 h-4">
                                <span><strong>Exegetical Clause Notes</strong> (Companion notes &amp; lexicon clips)</span>
                            </label>
                            <label class="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-700 flex items-center gap-2.5 cursor-pointer font-semibold text-gray-800 dark:text-gray-100">
                                <input type="checkbox" id="lfIncMasterChk" checked class="accent-indigo-600 w-4 h-4">
                                <span><strong>Master Notes Document</strong> (Full scratchpad notes)</span>
                            </label>
                        </div>
                    </div>

                    <!-- 4 Export Format Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <button type="button" id="lfRunExportPdfBtn" class="lf-exp-card-btn">
                            <div class="flex items-center gap-2.5">
                                <span class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center"><i class="fa-solid fa-file-pdf text-base"></i></span>
                                <div>
                                    <div class="font-extrabold text-sm text-gray-900 dark:text-white">Combined Study Packet (PDF)</div>
                                    <div class="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Best for printing, preaching &amp; handouts</div>
                                </div>
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-300">Clean print layout with Thought Flow lines, colored semantic labels, outline, and notes.</div>
                        </button>

                        <button type="button" id="lfRunExportWordBtn" class="lf-exp-card-btn">
                            <div class="flex items-center gap-2.5">
                                <span class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center"><i class="fa-solid fa-file-word text-base"></i></span>
                                <div>
                                    <div class="font-extrabold text-sm text-gray-900 dark:text-white">Editable Manuscript (.doc)</div>
                                    <div class="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">Opens in Word, Apple Pages &amp; Google Docs</div>
                                </div>
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-300">Preserves indentation, colors, headings, and full Unicode Greek &amp; Hebrew text.</div>
                        </button>

                        <button type="button" id="lfRunCopyRichBtn" class="lf-exp-card-btn">
                            <div class="flex items-center gap-2.5">
                                <span class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center"><i class="fa-solid fa-clipboard-check text-base"></i></span>
                                <div>
                                    <div class="font-extrabold text-sm text-gray-900 dark:text-white">Copy Rich Text to Clipboard</div>
                                    <div class="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold">1-click paste (Cmd+V) into Google Docs or Pages</div>
                                </div>
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-300">No file download needed—copies formatted headings, indents, and notes straight to your clipboard.</div>
                        </button>

                        <button type="button" id="lfRunExportMdBtn" class="lf-exp-card-btn">
                            <div class="flex items-center gap-2.5">
                                <span class="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center"><i class="fa-brands fa-markdown text-base"></i></span>
                                <div>
                                    <div class="font-extrabold text-sm text-gray-900 dark:text-white">Markdown File (.md)</div>
                                    <div class="text-[11px] text-purple-700 dark:text-purple-400 font-semibold">Best for Obsidian, Notion &amp; Bear Notes</div>
                                </div>
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-300">Clean nested bullet hierarchy with semantic tags, verse numbers, and callout notes.</div>
                        </button>
                    </div>

                    <!-- Offline App (PWA) Status Card -->
                    <div id="lfPwaStatusCard" class="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/35 border border-indigo-200 dark:border-indigo-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div class="text-indigo-950 dark:text-indigo-200">
                            <i class="fa-solid fa-laptop-arrow-down text-indigo-600 dark:text-indigo-400 mr-1.5"></i>
                            <strong id="lfPwaStatusTitle">Offline App Mode:</strong>
                            <span id="lfPwaStatusText">On your GitHub Pages link, use Chrome’s “Install LexFlow” icon or Safari’s File → Add to Dock to run LexFlow as a standalone offline app.</span>
                        </div>
                        <button type="button" id="lfTriggerInstallAppBtn" class="hidden px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer">
                            Install LexFlow App
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeExportStudio();
        });
        document.body.appendChild(modal);

        // Wire tabs
        modal.querySelectorAll('.lf-exp-tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => setExportStudioTab(btn.dataset.expTab));
        });
        document.getElementById('lfCloseExportStudioBtn').addEventListener('click', closeExportStudio);
        document.getElementById('lfOutlineNextToExportBtn').addEventListener('click', () => setExportStudioTab('export'));

        // Scope & metadata bindings
        const scopeSel = document.getElementById('lfExpScopeSelect');
        const rangeInp = document.getElementById('lfExpRangeInput');
        const titleInp = document.getElementById('lfExpTitleInput');
        const ideaInp = document.getElementById('lfExpBigIdeaInput');
        const outlineEl = document.getElementById('lfOutlineEditorArea');

        scopeSel.addEventListener('change', () => {
            state.scopeMode = scopeSel.value;
            rangeInp.classList.toggle('hidden', state.scopeMode !== 'range');
            refreshOutlinePreview(true);
        });
        rangeInp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                state.rangeText = rangeInp.value;
                refreshOutlinePreview(true);
            }
        });
        rangeInp.addEventListener('input', () => { state.rangeText = rangeInp.value; });
        titleInp.addEventListener('input', () => { state.studyTitle = titleInp.value; });
        ideaInp.addEventListener('input', () => { state.bigIdea = ideaInp.value; });
        outlineEl.addEventListener('input', () => { outlineEl.dataset.userEdited = 'true'; });

        document.getElementById('lfExpRefreshOutlineBtn').addEventListener('click', () => {
            state.rangeText = rangeInp.value;
            refreshOutlinePreview(true);
            showToast('Refreshed outline from your Thought Flow!');
        });

        // Outline checkboxes
        const bindChk = (id, prop, refreshOutline) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                state[prop] = el.checked;
                if (refreshOutline) refreshOutlinePreview(true);
            });
        };
        bindChk('lfChkVerseNums', 'includeVerseNums', true);
        bindChk('lfChkSemLabels', 'includeSemanticLabels', true);
        bindChk('lfChkClauseNotes', 'includeClauseNotes', true);
        bindChk('lfIncFlowChk', 'includeFlowDiagram', false);
        bindChk('lfIncOutlineChk', 'includeOutline', false);
        bindChk('lfIncNotesChk', 'includeClauseNotes', false);
        bindChk('lfIncMasterChk', 'includeMasterNotes', false);

        // Outline quick actions
        document.getElementById('lfOutlineCopyBtn').addEventListener('click', () => {
            runRichTextCopy(outlineEl.innerHTML);
        });
        document.getElementById('lfOutlineToMasterBtn').addEventListener('click', () => {
            const master = document.getElementById('masterNoteEditor');
            if (!master) return;
            master.innerHTML = (master.innerHTML ? master.innerHTML + '<hr style="margin:14px 0;">' : '') + outlineEl.innerHTML;
            if (typeof window.saveActiveProjectData === 'function') window.saveActiveProjectData(false);
            showToast('Added Teaching Outline into your Master Notes!');
        });

        // 4 Export buttons
        document.getElementById('lfRunExportPdfBtn').addEventListener('click', runPdfStudyPacketExport);
        document.getElementById('lfRunExportWordBtn').addEventListener('click', runWordDocExport);
        document.getElementById('lfRunCopyRichBtn').addEventListener('click', () => {
            const bundle = collectClausesForExport();
            runRichTextCopy(generateCombinedExportHTML(bundle));
        });
        document.getElementById('lfRunExportMdBtn').addEventListener('click', runMarkdownExport);

        // PWA Install button
        document.getElementById('lfTriggerInstallAppBtn').addEventListener('click', async () => {
            if (!state.deferredInstallPrompt) return;
            state.deferredInstallPrompt.prompt();
            try { await state.deferredInstallPrompt.userChoice; } catch (e) {}
            state.deferredInstallPrompt = null;
            document.getElementById('lfTriggerInstallAppBtn').classList.add('hidden');
            const topInstall = document.getElementById('lfTopInstallAppBtn');
            if (topInstall) topInstall.classList.add('hidden');
        });
    }

    function setExportStudioTab(tab) {
        state.activeTab = tab === 'export' ? 'export' : 'outline';
        const modal = document.getElementById('lfExportStudioModal');
        if (!modal) return;
        modal.querySelectorAll('.lf-exp-tab-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.expTab === state.activeTab);
        });
        document.getElementById('lfExpPanel_outline')?.classList.toggle('hidden', state.activeTab !== 'outline');
        document.getElementById('lfExpPanel_export')?.classList.toggle('hidden', state.activeTab !== 'export');
    }

    function refreshOutlinePreview(forceRegenerate) {
        const bundle = collectClausesForExport();
        const badge = document.getElementById('lfExpClauseCountBadge');
        if (badge) {
            badge.textContent = `${bundle.label} • ${bundle.clauses.length} clause${bundle.clauses.length === 1 ? '' : 's'}`;
        }
        const outlineEl = document.getElementById('lfOutlineEditorArea');
        if (outlineEl && (forceRegenerate || outlineEl.dataset.userEdited !== 'true')) {
            outlineEl.innerHTML = generateOutlineHTML(bundle);
            outlineEl.dataset.userEdited = 'false';
        }
    }

    function openExportStudio(initialTab = 'outline') {
        buildExportStudioModal();
        const modal = document.getElementById('lfExportStudioModal');
        if (!modal) return;

        // Pre-fill passage hint from top passage bar if user typed a specific range
        const passInp = document.getElementById('passageRefInput');
        const rangeInp = document.getElementById('lfExpRangeInput');
        if (passInp && passInp.value.trim() && rangeInp && !rangeInp.value.trim()) {
            rangeInp.value = passInp.value.trim();
            state.rangeText = rangeInp.value;
        }

        modal.classList.add('open');
        setExportStudioTab(initialTab);
        refreshOutlinePreview(true);
        updatePwaStatusUI();
    }

    function closeExportStudio() {
        const modal = document.getElementById('lfExportStudioModal');
        if (modal) modal.classList.remove('open');
    }

    // -------------------------------------------------------------------------
    // 6. OFFLINE PWA SERVICE WORKER REGISTRATION & INSTALL PROMPT
    // -------------------------------------------------------------------------
    function updatePwaStatusUI() {
        const txt = document.getElementById('lfPwaStatusText');
        const installBtn = document.getElementById('lfTriggerInstallAppBtn');
        if (!txt) return;

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) {
            txt.textContent = 'Running as an installed standalone LexFlow app — offline caching is active!';
            if (installBtn) installBtn.classList.add('hidden');
        } else if (location.protocol === 'file:') {
            txt.textContent = 'Currently opened as a local file. Upload to your GitHub Pages HTTPS link to install as an offline Mac/iPad app.';
        } else if (state.swRegistered) {
            txt.textContent = 'Offline caching is active! Click “Install LexFlow App” (or Safari File → Add to Dock) to use LexFlow without internet.';
            if (installBtn && state.deferredInstallPrompt) installBtn.classList.remove('hidden');
        }
    }

    function registerOfflineServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        // Service Workers only work on https:// or localhost (skip quietly on file://)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            return;
        }
        navigator.serviceWorker.register('./sw.js').then(() => {
            state.swRegistered = true;
            updatePwaStatusUI();
        }).catch(() => {});
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        state.deferredInstallPrompt = e;
        const topBtn = document.getElementById('lfTopInstallAppBtn');
        if (topBtn) topBtn.classList.remove('hidden');
        updatePwaStatusUI();
    });

    // -------------------------------------------------------------------------
    // 7. TOP BAR BUTTON, RESEARCH BAR BUTTON & SHORTCUTS
    // -------------------------------------------------------------------------
    function injectPhase4Triggers() {
        const header = document.querySelector('header');
        const leftGroup = header && header.firstElementChild;
        if (leftGroup && !document.getElementById('lfOpenExportStudioBtn')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'lfOpenExportStudioBtn';
            btn.className = 'glass-control px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 cursor-pointer';
            btn.title = `Open Outline Builder & Unified Export Studio (${MOD}⇧E)`;
            btn.innerHTML = `
                <i class="fa-solid fa-file-export text-[11px]"></i>
                <span class="hidden sm:inline">Outline &amp; Export</span>
            `;
            btn.addEventListener('click', () => openExportStudio('outline'));
            leftGroup.appendChild(btn);

            // Subtle Install App button (stays hidden unless browser offers 1-click PWA install)
            const instBtn = document.createElement('button');
            instBtn.type = 'button';
            instBtn.id = 'lfTopInstallAppBtn';
            instBtn.className = 'hidden glass-control px-2.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 cursor-pointer';
            instBtn.title = 'Install LexFlow as a standalone offline app';
            instBtn.innerHTML = `<i class="fa-solid fa-download text-[11px]"></i><span class="hidden lg:inline">Install App</span>`;
            instBtn.addEventListener('click', async () => {
                if (!state.deferredInstallPrompt) return;
                state.deferredInstallPrompt.prompt();
                try { await state.deferredInstallPrompt.userChoice; } catch (e) {}
                state.deferredInstallPrompt = null;
                instBtn.classList.add('hidden');
            });
            leftGroup.appendChild(instBtn);
        }

        const rqBar = document.getElementById('lfResearchQuickBar');
        if (rqBar && !rqBar.querySelector('[data-rq="export"]')) {
            const firstWrap = rqBar.firstElementChild;
            if (firstWrap) {
                const expBtn = document.createElement('button');
                expBtn.type = 'button';
                expBtn.className = 'lf-rq-btn';
                expBtn.dataset.rq = 'export';
                expBtn.innerHTML = `<i class="fa-solid fa-file-export text-emerald-600"></i><span>Outline &amp; Export</span>`;
                expBtn.addEventListener('click', () => openExportStudio('outline'));
                firstWrap.appendChild(expBtn);
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const m = document.getElementById('lfExportStudioModal');
            if (m && m.classList.contains('open')) {
                e.preventDefault();
                closeExportStudio();
                return;
            }
        }
        const modPressed = isMac ? e.metaKey : e.ctrlKey;
        if (!modPressed || !e.shiftKey || e.altKey) return;
        const tag = (e.target && e.target.tagName) || '';
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        if ((e.key || '').toLowerCase() === 'e') {
            e.preventDefault();
            openExportStudio('outline');
        }
    });

    window.lfOpenExportStudio = openExportStudio;

    function initPhase4() {
        injectPhase4Triggers();
        buildExportStudioModal();
        registerOfflineServiceWorker();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initPhase4, 220));
    } else {
        setTimeout(initPhase4, 220);
    }
})();
