/* === LEXFLOW PHASE 3 MODULE: EXEGETICAL ENGINE (MACULA + PASSAGE BRIEF + HEBREW CANTILLATION) === */
(function () {
    if (window.__lfPhase3ExegesisLoaded) return;
    window.__lfPhase3ExegesisLoaded = true;

    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
    const MOD = isMac ? '⌘' : 'Ctrl+';

    // Classic 93 Louw-Nida Semantic Domain Headings (for MACULA Greek @ln / @domain codes)
    const LOUW_NIDA_DOMAINS = {
        1: 'Geographical Objects & Features', 2: 'Natural Substances', 3: 'Plants', 4: 'Animals',
        5: 'Foods & Condiments', 6: 'Artifacts', 7: 'Constructions', 8: 'Body, Body Parts & Products',
        9: 'People', 10: 'Kinship Terms', 11: 'Groups & Classes of Persons', 12: 'Supernatural Beings & Powers',
        13: 'Be, Become, Exist, Happen', 14: 'Physical Events & States', 15: 'Linear Movement',
        16: 'Non-Linear Movement', 17: 'Stances & Events Related to Stances', 18: 'Attachment',
        19: 'Physical Impact', 20: 'Violence, Harm, Destroy, Kill', 21: 'Danger, Risk, Safe, Save',
        22: 'Trouble, Hardship, Relief, Favorable', 23: 'Physiological Processes & States',
        24: 'Sensory Events & States', 25: 'Attitudes & Emotions', 26: 'Psychological Faculties',
        27: 'Learn', 28: 'Know', 29: 'Memory & Recall', 30: 'Think', 31: 'Hold a View, Believe, Trust',
        32: 'Understand', 33: 'Communication', 34: 'Association', 35: 'Help, Care For',
        36: 'Guide, Discipline, Follow', 37: 'Control, Rule', 38: 'Punish, Reward',
        39: 'Hostility, Strife', 40: 'Reconciliation, Forgiveness', 41: 'Behavior & Related States',
        42: 'Perform, Do', 43: 'Agriculture', 44: 'Animal Husbandry, Fishing', 45: 'Building, Constructing',
        46: 'Household Activities', 47: 'Activities Involving Liquids/Masses', 48: 'Activities Involving Cloth',
        49: 'Activities Involving Clothing', 50: 'Contests & Play', 51: 'Festivals', 52: 'Funerals & Burial',
        53: 'Religious Activities', 54: 'Maritime Activities', 55: 'Military Activities',
        56: 'Courts & Legal Procedures', 57: 'Possess, Transfer, Exchange', 58: 'Nature, Class, Example',
        59: 'Quantity', 60: 'Number', 61: 'Sequence', 62: 'Arrange, Organize', 63: 'Whole, Unite, Part, Divide',
        64: 'Comparison', 65: 'Value', 66: 'Proper, Improper', 67: 'Time', 68: 'Aspect',
        69: 'Affirmation, Negation', 70: 'Real, Unreal', 71: 'Mode', 72: 'True, False',
        73: 'Genuine, Phony', 74: 'Able, Capable', 75: 'Adequate, Qualified', 76: 'Power, Force',
        77: 'Ready, Prepared', 78: 'Degree', 79: 'Features of Objects', 80: 'Space', 81: 'Spacial Dimensions',
        82: 'Spacial Orientations', 83: 'Spacial Positions', 84: 'Spacial Extensions',
        85: 'Existence in Space', 86: 'Weight', 87: 'Status', 88: 'Moral & Ethical Qualities',
        89: 'Relations (Cause, Purpose, Result)', 90: 'Case / Semantic Roles',
        91: 'Discourse Markers', 92: 'Discourse Referentials', 93: 'Names of Persons & Places'
    };

    const MINOR_GREEK_LEMMAS = new Set([
        'ὁ', 'καί', 'δέ', 'ἐν', 'εἰς', 'ἐκ', 'ἀπό', 'διά', 'ἐπί', 'πρός', 'μετά', 'κατά', 'περί', 'ὑπό', 'παρά',
        'αὐτός', 'ὅς', 'οὗτος', 'ἐκεῖνος', 'σύ', 'ἐγώ', 'τις', 'τίς', 'εἰμί', 'γάρ', 'ὅτι', 'ἀλλά', 'οὐ', 'μή',
        'ὡς', 'εἰ', 'ἐάν', 'ἵνα', 'οὖν', 'τε', 'ἤ', 'μέν', 'καθώς', 'οὐδέ', 'μηδέ', 'οὔτε', 'μήτε'
    ]);

    const MINOR_HEBREW_STRONGS = new Set([
        'H853', 'H3588', 'H834', 'H5921', 'H413', 'H4480', 'H3808', 'H3605', 'H1931', 'H2088', 'H1961',
        'H559', 'H1121', 'H376', 'H5973', 'H1571', 'H408', 'H518', 'H3651', 'H6440', 'H8478'
    ]);

    const state = {
        briefRef: { bookNum: 43, bookName: 'John', chapter: 1, startVerse: 1, endVerse: 5 },
        activeSubTab: 'overview',      // 'overview' | 'macula' | 'verbs' | 'cantillation'
        maculaBookCache: new Map(),    // key: `nt_${bookNum}` or `ot_${bookNum}` -> parsed book object
        maculaDirCache: null,          // { nt: Map(bookNum->filename), ot: Map(bookNum->filename) }
        renderToken: 0
    };

    // -------------------------------------------------------------------------
    // 1. STYLES
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfPhase3ExegesisStyles';
    styleEl.textContent = `
        #lfStudyDock #lfBriefContent > * {
            zoom: var(--lf-dock-zoom, 1);
        }
        .lf-brief-pill {
            padding: 4px 9px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.45);
            cursor: pointer;
            transition: all 0.12s ease;
            white-space: nowrap;
        }
        html.dark .lf-brief-pill {
            color: #d4d4d8;
            background: rgba(39, 39, 42, 0.78);
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-brief-pill.active {
            background: #0d9488;
            border-color: #0d9488;
            color: #ffffff !important;
        }
        .lf-macula-word-chip {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 5px 8px;
            border-radius: 10px;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background: rgba(255, 255, 255, 0.92);
            cursor: pointer;
            transition: all 0.12s ease;
            text-align: left;
            max-width: 190px;
        }
        html.dark .lf-macula-word-chip {
            background: rgba(39, 39, 42, 0.88);
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-macula-word-chip:hover {
            border-color: #4f46e5;
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(79, 70, 229, 0.16);
        }
        .lf-macula-word-chip.lf-role-verb { border-left: 3px solid #dc2626; }
        .lf-macula-word-chip.lf-role-subj { border-left: 3px solid #2563eb; }
        .lf-macula-word-chip.lf-role-obj  { border-left: 3px solid #059669; }
        .lf-macula-word-chip.lf-has-ref   { border-bottom: 2px dashed #d97706; }

        .lf-cant-clause {
            border-left: 3px solid #0d9488;
            padding: 5px 10px;
            border-radius: 0 8px 8px 0;
            background: rgba(255, 255, 255, 0.86);
            margin-bottom: 4px;
        }
        html.dark .lf-cant-clause {
            background: rgba(39, 39, 42, 0.82);
        }
        .lf-cant-lvl-0 { border-left-color: #4f46e5; margin-left: 0; }
        .lf-cant-lvl-1 { border-left-color: #0d9488; margin-left: 18px; }
        .lf-cant-lvl-2 { border-left-color: #d97706; margin-left: 36px; }
    `;
    document.head.appendChild(styleEl);

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    function getBookName(bookNum) {
        if (typeof bibleBooksList !== 'undefined' && bibleBooksList[bookNum - 1]) {
            return bibleBooksList[bookNum - 1].name;
        }
        return 'Scripture';
    }

    function getActivePassageRangeFromWorkspace() {
        const topBlk = (typeof findTopVisibleVerseBlock === 'function' ? findTopVisibleVerseBlock() : null) ||
                       (typeof lastSelectedBlock !== 'undefined' ? lastSelectedBlock : null);

        let bookNum = 43, chapter = 1, startVerse = 1, endVerse = 5;
        if (topBlk && topBlk.dataset && topBlk.dataset.bookNum) {
            bookNum = parseInt(topBlk.dataset.bookNum, 10) || 43;
            chapter = parseInt(topBlk.dataset.chapterNum, 10) || 1;
            startVerse = parseInt(topBlk.dataset.verseNum, 10) || 1;
            endVerse = startVerse + 4;
        }

        const inp = document.getElementById('passageRefInput');
        if (inp && inp.value.trim() && typeof window.parseScriptureReference === 'function') {
            const parsed = window.parseScriptureReference(inp.value.trim());
            if (parsed && parsed.bookNum === bookNum && parsed.chapter === chapter) {
                startVerse = parsed.startVerse || 1;
                endVerse = (parsed.endVerse && parsed.endVerse < 180) ? parsed.endVerse : Math.min(startVerse + 6, 176);
            }
        }

        const ed = document.getElementById('flowEditor');
        if (ed) {
            const chapBlks = ed.querySelectorAll(`div[data-book-num="${bookNum}"][data-chapter-num="${chapter}"]:not(.lex-chapter-banner)`);
            if (chapBlks.length) {
                let maxV = 1;
                chapBlks.forEach((b) => {
                    const v = parseInt(b.dataset.verseNum || '1', 10);
                    if (v > maxV) maxV = v;
                });
                endVerse = Math.min(endVerse, maxV);
                startVerse = Math.min(startVerse, endVerse);
            }
        }

        return { bookNum, bookName: getBookName(bookNum), chapter, startVerse, endVerse };
    }

    function parseBriefRangeInput(raw) {
        const clean = (raw || '').trim();
        if (!clean) return null;
        if (typeof window.parseScriptureReference === 'function') {
            const p = window.parseScriptureReference(clean);
            if (p) {
                const isWholeChap = !clean.includes(':');
                return {
                    bookNum: p.bookNum,
                    bookName: p.bookName,
                    chapter: p.chapter,
                    startVerse: isWholeChap ? 1 : p.startVerse,
                    endVerse: isWholeChap ? 176 : p.endVerse
                };
            }
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // 2. MACULA DATASET ENGINE (Clear-Bible/macula-greek & macula-hebrew)
    // -------------------------------------------------------------------------
    async function getMaculaDirectoryMap() {
        if (state.maculaDirCache) return state.maculaDirCache;

        try {
            const cachedRaw = localStorage.getItem('lf_macula_dir_map_v1');
            if (cachedRaw) {
                const parsed = JSON.parse(cachedRaw);
                if (parsed && parsed.nt && parsed.ot && Object.keys(parsed.nt).length >= 20) {
                    state.maculaDirCache = parsed;
                    return parsed;
                }
            }
        } catch (e) {}

        const dir = { nt: {}, ot: {} };

        const fetchDir = async (repo, subPath, isNt) => {
            try {
                const res = await fetch(`https://api.github.com/repos/Clear-Bible/${repo}/contents/${subPath}`);
                if (!res.ok) return;
                const list = await res.json();
                if (!Array.isArray(list)) return;
                const xmlFiles = list
                    .filter((f) => f && f.name && /\.xml$/i.test(f.name) && !/index|manifest/i.test(f.name))
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

                xmlFiles.forEach((f, idx) => {
                    const numMatch = f.name.match(/^(\d{2})/);
                    let bNum = 0;
                    if (numMatch) {
                        const n = parseInt(numMatch[1], 10);
                        if (isNt) {
                            bNum = (n >= 40 && n <= 66) ? n : (n >= 1 && n <= 27 ? n + 39 : (n >= 61 && n <= 87 ? n - 21 : 0));
                        } else {
                            bNum = (n >= 1 && n <= 39) ? n : 0;
                        }
                    }
                    if (!bNum) bNum = isNt ? (40 + idx) : (1 + idx);
                    if (isNt && bNum >= 40 && bNum <= 66) dir.nt[bNum] = f.name;
                    if (!isNt && bNum >= 1 && bNum <= 39) dir.ot[bNum] = f.name;
                });
            } catch (e) {}
        };

        await Promise.all([
            fetchDir('macula-greek', 'SBLGNT/lowfat', true),
            fetchDir('macula-hebrew', 'WLC/lowfat', false)
        ]);

        if (Object.keys(dir.nt).length >= 20 || Object.keys(dir.ot).length >= 20) {
            state.maculaDirCache = dir;
            try { localStorage.setItem('lf_macula_dir_map_v1', JSON.stringify(dir)); } catch (e) {}
        }
        return dir;
    }

    function parseDomainLabel(rawDomain, rawLn) {
        const src = String(rawLn || rawDomain || '').trim();
        if (!src) return '';
        const firstCode = src.split(/[;\s,]+/)[0];
        const major = parseInt(firstCode.split('.')[0], 10);
        if (major && LOUW_NIDA_DOMAINS[major]) {
            return `${firstCode} (${LOUW_NIDA_DOMAINS[major]})`;
        }
        return src.slice(0, 36);
    }

    function parseMaculaLowfatXml(xmlText, bookNum) {
        const isNt = bookNum >= 40;
        const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
        const words = Array.from(doc.getElementsByTagName('w'));
        const verses = {};
        const idMap = new Map();
        const lemmaCounts = {};

        const parsedNodes = [];
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            const refAttr = w.getAttribute('ref') || '';
            let ch = 0, vs = 0;
            const refMatch = refAttr.match(/(\d{1,3}):(\d{1,3})/);
            if (refMatch) {
                ch = parseInt(refMatch[1], 10);
                vs = parseInt(refMatch[2], 10);
            } else {
                const idRaw = w.getAttribute('id') || w.getAttribute('xml:id') || w.getAttribute('n') || '';
                const numId = idRaw.replace(/\D/g, '');
                if (numId.length >= 8) {
                    ch = parseInt(numId.slice(2, 5), 10);
                    vs = parseInt(numId.slice(5, 8), 10);
                }
            }
            if (!ch || !vs) continue;

            const surface = (w.textContent || '').trim();
            const lemma = (w.getAttribute('lemma') || '').trim();
            const gloss = (w.getAttribute('gloss') || w.getAttribute('english') || '').trim();
            const strongRaw = (w.getAttribute('strong') || w.getAttribute('strongnumberx') || '').trim();
            let strongs = '';
            if (strongRaw) {
                const sm = strongRaw.match(/(\d{1,4})/);
                if (sm) strongs = (isNt ? 'G' : 'H') + parseInt(sm[1], 10);
            }

            const pos = (w.getAttribute('class') || w.getAttribute('pos') || '').toLowerCase();
            const morph = (w.getAttribute('morph') || '').trim();
            const tense = (w.getAttribute('tense') || '').toLowerCase();
            const voice = (w.getAttribute('voice') || '').toLowerCase();
            const mood = (w.getAttribute('mood') || '').toLowerCase();
            const stem = (w.getAttribute('stem') || '').toLowerCase();
            const role = (w.getAttribute('role') || (w.parentElement && w.parentElement.getAttribute('role')) || '').toLowerCase();
            const domainLabel = parseDomainLabel(w.getAttribute('domain') || w.getAttribute('lexdomain'), w.getAttribute('ln'));
            const nodeId = w.getAttribute('xml:id') || w.getAttribute('id') || w.getAttribute('n') || '';
            const referentId = (w.getAttribute('referent') || w.getAttribute('subjref') || '').trim();

            if (nodeId) {
                idMap.set(nodeId, { surface, gloss: gloss || lemma });
                const digitsOnly = nodeId.replace(/\D/g, '');
                if (digitsOnly) idMap.set(digitsOnly, { surface, gloss: gloss || lemma });
            }

            const lemmaKey = strongs || lemma || surface;
            if (lemmaKey) lemmaCounts[lemmaKey] = (lemmaCounts[lemmaKey] || 0) + 1;

            parsedNodes.push({
                ch, vs, surface, lemma, gloss, strongs, pos, morph, tense, voice, mood, stem, role, domainLabel, referentId, lemmaKey
            });
        }

        const wgs = Array.from(doc.getElementsByTagName('wg'));
        for (let i = 0; i < wgs.length; i++) {
            const wg = wgs[i];
            const wgId = wg.getAttribute('nodeId') || wg.getAttribute('xml:id') || wg.getAttribute('id') || '';
            if (!wgId || idMap.has(wgId)) continue;
            const childWs = Array.from(wg.getElementsByTagName('w')).slice(0, 5);
            if (!childWs.length) continue;
            const surf = childWs.map((cw) => (cw.textContent || '').trim()).filter(Boolean).join(' ');
            const gl = childWs.map((cw) => (cw.getAttribute('gloss') || cw.getAttribute('english') || '').trim()).filter(Boolean).join(' ');
            const entry = { surface: surf, gloss: gl || surf };
            idMap.set(wgId, entry);
            const digitsOnly = wgId.replace(/\D/g, '');
            if (digitsOnly && !idMap.has(digitsOnly)) idMap.set(digitsOnly, entry);
        }

        for (let i = 0; i < parsedNodes.length; i++) {
            const item = parsedNodes[i];
            let referentText = '';
            if (item.referentId) {
                const firstRef = item.referentId.split(/\s+/)[0];
                const hit = idMap.get(firstRef) || idMap.get(firstRef.replace(/\D/g, ''));
                if (hit) {
                    referentText = hit.gloss && hit.gloss !== hit.surface ? `${hit.gloss} (${hit.surface})` : hit.surface;
                }
            }
            const vk = `${item.ch}_${item.vs}`;
            if (!verses[vk]) verses[vk] = [];
            verses[vk].push({
                surface: item.surface,
                lemma: item.lemma,
                gloss: item.gloss,
                strongs: item.strongs,
                pos: item.pos,
                morph: item.morph,
                tense: item.tense,
                voice: item.voice,
                mood: item.mood,
                stem: item.stem,
                role: item.role,
                domain: item.domainLabel,
                referent: referentText,
                bookFreq: lemmaCounts[item.lemmaKey] || 1
            });
        }

        return { bookNum, isNt, verses, source: 'MACULA' };
    }

    async function loadMaculaBookData(bookNum) {
        const isNt = bookNum >= 40;
        const memKey = `${isNt ? 'nt' : 'ot'}_${bookNum}`;
        if (state.maculaBookCache.has(memKey)) return state.maculaBookCache.get(memKey);

        const idbKey = `lf_macula_book_v1_${memKey}`;
        if (typeof window.getCachedFileData === 'function') {
            const cached = await window.getCachedFileData(idbKey);
            if (cached && cached.verses && Object.keys(cached.verses).length > 5) {
                state.maculaBookCache.set(memKey, cached);
                return cached;
            }
        }

        const dir = await getMaculaDirectoryMap();
        const fileName = isNt ? dir.nt[bookNum] : dir.ot[bookNum];
        if (!fileName) return null;

        const repo = isNt ? 'macula-greek' : 'macula-hebrew';
        const subPath = isNt ? 'SBLGNT/lowfat' : 'WLC/lowfat';
        const urls = [
            `https://cdn.jsdelivr.net/gh/Clear-Bible/${repo}@main/${subPath}/${encodeURIComponent(fileName)}`,
            `https://raw.githubusercontent.com/Clear-Bible/${repo}/main/${subPath}/${encodeURIComponent(fileName)}`
        ];

        for (const url of urls) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const xmlText = await res.text();
                if (!xmlText || !xmlText.includes('<w')) continue;
                const parsed = parseMaculaLowfatXml(xmlText, bookNum);
                if (Object.keys(parsed.verses).length > 0) {
                    state.maculaBookCache.set(memKey, parsed);
                    if (typeof window.setCachedFileData === 'function') {
                        await window.setCachedFileData(idbKey, parsed);
                    }
                    return parsed;
                }
            } catch (e) {}
        }
        return null;
    }

    async function buildFallbackTokensForRange(ref) {
        const isNt = ref.bookNum >= 40;
        const verses = {};
        if (!isNt && typeof window.fetchHebrewChapterFast === 'function') {
            await window.fetchHebrewChapterFast(ref.bookNum, ref.chapter);
        }
        for (let v = ref.startVerse; v <= ref.endVerse; v++) {
            const vk = `${ref.chapter}_${v}`;
            let raw = [];
            if (isNt && typeof window.getSrgntTokensForSingleVerse === 'function') {
                raw = await window.getSrgntTokensForSingleVerse(ref.bookNum, ref.chapter, v);
            } else if (!isNt && typeof scriptureDataCache !== 'undefined' && scriptureDataCache.wlcVerseTokensMap) {
                raw = scriptureDataCache.wlcVerseTokensMap.get(`${ref.bookNum}_${ref.chapter}_${v}`) || [];
            }
            if (!raw || !raw.length) continue;

            verses[vk] = raw.map((t) => {
                const st = (t.strongs || '').toUpperCase();
                let gloss = '';
                if (isNt && st && typeof strongsGreekDictionary !== 'undefined' && strongsGreekDictionary[st]) {
                    gloss = (strongsGreekDictionary[st].strongs_def || strongsGreekDictionary[st].kjv_def || '').replace(/^:\s*--+/, '').split(/[;,]/)[0].trim();
                } else if (!isNt && st && typeof strongsHebrewDictionary !== 'undefined' && strongsHebrewDictionary[st]) {
                    gloss = (strongsHebrewDictionary[st].strongs_def || strongsHebrewDictionary[st].kjv_def || '').replace(/^:\s*--+/, '').split(/[;,]/)[0].trim();
                }
                const morphStr = String(t.morph || '');
                let pos = '', mood = '', tense = '', stem = '';
                if (isNt && morphStr.includes(':')) {
                    const [pCode, parse] = morphStr.split(':');
                    if (pCode.startsWith('V')) pos = 'verb';
                    else if (pCode.startsWith('N')) pos = 'noun';
                    else if (pCode.startsWith('A')) pos = 'adj';
                    else if (pCode.startsWith('R')) pos = 'pron';
                    if (parse && parse.length >= 4) {
                        const tMap = { P: 'present', I: 'imperfect', F: 'future', A: 'aorist', X: 'perfect', Y: 'pluperfect' };
                        const mMap = { I: 'indicative', D: 'imperative', S: 'subjunctive', O: 'optative', N: 'infinitive', P: 'participle' };
                        tense = tMap[parse[1]] || '';
                        mood = mMap[parse[3]] || '';
                    }
                } else if (!isNt && morphStr) {
                    if (/\/V|^HV|^AV/.test(morphStr)) {
                        pos = 'verb';
                        if (/Vq/.test(morphStr)) stem = 'qal';
                        else if (/VN/.test(morphStr)) stem = 'niphal';
                        else if (/Vp/.test(morphStr)) stem = 'piel';
                        else if (/Vh/.test(morphStr)) stem = 'hiphil';
                        else if (/Vt/.test(morphStr)) stem = 'hithpael';
                        if (/v[mp]/.test(morphStr)) mood = 'imperative';
                        else if (/r[msfp]|s[msfp]/.test(morphStr)) mood = 'participle';
                    } else if (/\/N|^HN/.test(morphStr)) pos = 'noun';
                }
                return {
                    surface: t.surface || '',
                    lemma: t.lemma || t.surface || '',
                    gloss,
                    strongs: st,
                    pos,
                    morph: morphStr,
                    tense,
                    voice: '',
                    mood,
                    stem,
                    role: '',
                    domain: '',
                    referent: '',
                    bookFreq: 0
                };
            });
        }
        return { bookNum: ref.bookNum, isNt, verses, source: 'Built-In Morphology' };
    }

    // -------------------------------------------------------------------------
    // 3. HEBREW MASORETIC CANTILLATION PARSER & AUTO-SPLITTER
    // -------------------------------------------------------------------------
    const CANT_ATNAH = /\u0591/;
    const CANT_SOF_PASUQ = /\u05C3/;

    function getAccentInfo(word) {
        if (!word) return null;
        if (CANT_SOF_PASUQ.test(word)) return { level: 0, name: 'Sof Pasuq (End)', rank: 'Emperor' };
        if (CANT_ATNAH.test(word)) return { level: 0, name: 'Atnaḥ (Major Half)', rank: 'Emperor' };
        if (/\u0594/.test(word)) return { level: 1, name: 'Zaqef Qatan', rank: 'King' };
        if (/\u0595/.test(word)) return { level: 1, name: 'Zaqef Gadol', rank: 'King' };
        if (/\u0592/.test(word)) return { level: 1, name: 'Segolta', rank: 'King' };
        if (/\u0593/.test(word)) return { level: 1, name: 'Shalshelet', rank: 'King' };
        if (/\u0597/.test(word)) return { level: 2, name: "Revi'a", rank: 'Duke' };
        if (/\u0596/.test(word)) return { level: 2, name: 'Tifḥa', rank: 'Duke' };
        if (/\u0599/.test(word)) return { level: 2, name: 'Pashta', rank: 'Duke' };
        if (/\u059B/.test(word)) return { level: 2, name: 'Tevir', rank: 'Duke' };
        if (/\u0598/.test(word)) return { level: 2, name: 'Zarqa', rank: 'Duke' };
        if (/\u05A1/.test(word)) return { level: 2, name: 'Pazer', rank: 'Duke' };
        return null;
    }

    function segmentHebrewVerseByCantillation(tokens) {
        if (!Array.isArray(tokens) || !tokens.length) return [];
        const clauses = [];
        let buf = [];
        let nextLevel = 0;

        for (let i = 0; i < tokens.length; i++) {
            const surf = tokens[i].surface || '';
            if (!surf) continue;
            buf.push(surf);
            const acc = getAccentInfo(surf);
            const isLast = i === tokens.length - 1;

            if ((acc && buf.length >= 2) || isLast) {
                const breakAccent = acc || { level: 0, name: 'Verse End', rank: 'End' };
                clauses.push({
                    text: buf.join(' '),
                    wordCount: buf.length,
                    endRatio: (i + 1) / tokens.length,
                    indentLevel: nextLevel,
                    breakName: breakAccent.name,
                    breakLevel: breakAccent.level
                });
                buf = [];
                if (breakAccent.level === 0) nextLevel = 0;
                else if (breakAccent.level === 1) nextLevel = 1;
                else nextLevel = 2;
            }
        }
        return clauses;
    }

    function splitEnglishTextByCantillationRatios(englishText, hebClauses) {
        const words = (englishText || '').trim().split(/\s+/).filter(Boolean);
        if (!words.length || !hebClauses.length) return [];
        if (hebClauses.length === 1) {
            return [{ text: englishText.trim(), indentLevel: 0, breakName: hebClauses[0].breakName }];
        }

        const out = [];
        let cursor = 0;
        for (let c = 0; c < hebClauses.length; c++) {
            const hc = hebClauses[c];
            if (c === hebClauses.length - 1) {
                const rest = words.slice(cursor).join(' ').trim();
                if (rest) out.push({ text: rest, indentLevel: hc.indentLevel, breakName: hc.breakName });
                break;
            }
            const targetIdx = Math.max(cursor + 1, Math.min(words.length - 1, Math.round(hc.endRatio * words.length)));
            let snapIdx = targetIdx;
            for (let offset = 0; offset <= 2; offset++) {
                const checkA = targetIdx + offset;
                const checkB = targetIdx - offset;
                if (checkA > cursor && checkA < words.length && /[,;:\-—\.!?]$/.test(words[checkA - 1])) {
                    snapIdx = checkA;
                    break;
                }
                if (checkB > cursor && checkB < words.length && /[,;:\-—\.!?]$/.test(words[checkB - 1])) {
                    snapIdx = checkB;
                    break;
                }
            }
            const slice = words.slice(cursor, snapIdx).join(' ').trim();
            if (slice) {
                out.push({ text: slice, indentLevel: hc.indentLevel, breakName: hc.breakName });
            }
            cursor = snapIdx;
        }
        return out;
    }

    async function applyHebrewCantillationAutoSplit(ref) {
        if (!ref || ref.bookNum > 39) {
            showToast('Masoretic Cantillation Auto-Split is for Old Testament (Hebrew) passages.');
            return;
        }

        const ed = document.getElementById('flowEditor');
        if (!ed) return;

        if (typeof window.fetchHebrewChapterFast === 'function') {
            await window.fetchHebrewChapterFast(ref.bookNum, ref.chapter);
        }
        const tokMap = typeof scriptureDataCache !== 'undefined' ? scriptureDataCache.wlcVerseTokensMap : null;
        if (!tokMap) {
            showToast('Could not load WLC Hebrew accents for this chapter.');
            return;
        }

        if (document.body.classList.contains('hide-text-flow') && typeof window.toggleTextFlowVisibility === 'function') {
            window.toggleTextFlowVisibility(true, true);
        }

        let versesSplit = 0;
        for (let v = ref.startVerse; v <= ref.endVerse; v++) {
            const vTokens = tokMap.get(`${ref.bookNum}_${ref.chapter}_${v}`);
            if (!vTokens || vTokens.length < 3) continue;

            const hebClauses = segmentHebrewVerseByCantillation(vTokens);
            if (hebClauses.length < 2) continue;

            const domBlocks = Array.from(ed.querySelectorAll(
                `div[data-book-num="${ref.bookNum}"][data-chapter-num="${ref.chapter}"][data-verse-num="${v}"]:not(.lex-chapter-banner)`
            ));
            if (!domBlocks.length) continue;

            const fullText = domBlocks.map((b) => (b.textContent || '').trim()).join(' ').replace(/\s+/g, ' ').trim();
            if (!fullText) continue;

            const isHebrewWorkspace = /[\u0590-\u05FF]/.test(fullText);
            const targetClauses = isHebrewWorkspace
                ? hebClauses
                : splitEnglishTextByCantillationRatios(fullText, hebClauses);

            if (targetClauses.length < 2) continue;

            const firstBlock = domBlocks[0];
            const parent = firstBlock.parentNode;
            const insertBeforeNode = domBlocks[domBlocks.length - 1].nextSibling;

            domBlocks.forEach((b) => b.remove());

            targetClauses.forEach((cl, idx) => {
                const div = document.createElement('div');
                div.dataset.bookNum = String(ref.bookNum);
                div.dataset.bookName = ref.bookName;
                div.dataset.chapterNum = String(ref.chapter);
                div.dataset.verseNum = String(v);
                div.dataset.splitVerse = 'true';
                div.dataset.edited = 'true';
                if (idx === 0) div.dataset.verseHead = 'true';
                else div.dataset.verseCont = 'true';
                if (idx === targetClauses.length - 1) div.dataset.splitVerseEnd = 'true';

                if (cl.indentLevel > 0) {
                    div.style.marginLeft = `${cl.indentLevel * 2.25}rem`;
                    div.classList.add('has-indent');
                }
                div.textContent = cl.text;
                parent.insertBefore(div, insertBeforeNode);
            });
            versesSplit++;
        }

        if (versesSplit > 0) {
            if (typeof window.refreshDocumentBlockAttributes === 'function') window.refreshDocumentBlockAttributes();
            if (typeof window.syncOverlayControls === 'function') window.syncOverlayControls();
            if (typeof window.saveActiveProjectData === 'function') window.saveActiveProjectData(false);
            showToast(`Split ${versesSplit} OT verse${versesSplit === 1 ? '' : 's'} by Masoretic Cantillation!`);
        } else {
            showToast('No multi-clause verses found to split in that range.');
        }
    }

    // -------------------------------------------------------------------------
    // 4. BUILD & WIRE THE "BRIEF" TAB INSIDE THE STUDY DOCK
    // -------------------------------------------------------------------------
    function openLexiconForWord(strongs, lemma, isNt) {
        if (typeof window.lfOpenStudyDock === 'function') {
            window.lfOpenStudyDock('lexicon', isNt ? 'greek' : 'hebrew');
        }
        const q = strongs || lemma || '';
        if (!q) return;
        if (isNt) {
            const inp = document.getElementById('thayersSearchInput');
            if (inp) inp.value = q;
            if (strongs && typeof window.openRelatedStrongEntry === 'function') {
                window.openRelatedStrongEntry(strongs);
            } else if (typeof window.executeThayersSearch === 'function') {
                window.executeThayersSearch();
            }
        } else {
            const inp = document.getElementById('bdbSearchInput');
            if (inp) inp.value = q;
            if (typeof window.executeBdbSearch === 'function') {
                window.executeBdbSearch();
            }
        }
    }

    function activateBriefTabInDock(autoSync = true) {
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;

        if (!dock.classList.contains('open') && typeof window.lfOpenStudyDock === 'function') {
            window.lfOpenStudyDock('compare');
        }

        dock.querySelectorAll('.lf-dock-tab-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.dockTab === 'brief');
        });
        ['lexicon', 'compare', 'notes', 'brief'].forEach((t) => {
            const p = document.getElementById(`lfDockPanel_${t}`);
            if (p) p.classList.toggle('hidden', t !== 'brief');
        });

        const popBtn = document.getElementById('lfDockPopOutBtn');
        if (popBtn) popBtn.classList.add('hidden');

        if (autoSync) {
            state.briefRef = getActivePassageRangeFromWorkspace();
        }
        renderPassageBrief();
    }

    function setBriefSubTab(sub) {
        state.activeSubTab = sub || 'overview';
        const panel = document.getElementById('lfDockPanel_brief');
        if (panel) {
            panel.querySelectorAll('.lf-brief-pill').forEach((b) => {
                b.classList.toggle('active', b.dataset.briefSub === state.activeSubTab);
            });
        }
        renderPassageBrief();
    }

    async function renderPassageBrief() {
        const content = document.getElementById('lfBriefContent');
        const rangeInput = document.getElementById('lfBriefRangeInput');
        const cantTabBtn = document.getElementById('lfBriefCantTabBtn');
        const sourceBadge = document.getElementById('lfBriefSourceBadge');
        if (!content) return;

        const ref = state.briefRef;
        const isNt = ref.bookNum >= 40;
        const label = ref.startVerse === ref.endVerse
            ? `${ref.bookName} ${ref.chapter}:${ref.startVerse}`
            : `${ref.bookName} ${ref.chapter}:${ref.startVerse}-${ref.endVerse}`;

        if (rangeInput && document.activeElement !== rangeInput) {
            rangeInput.value = label;
        }
        if (cantTabBtn) {
            cantTabBtn.classList.toggle('hidden', isNt);
            if (isNt && state.activeSubTab === 'cantillation') {
                state.activeSubTab = 'overview';
            }
        }

        const myToken = ++state.renderToken;
        content.innerHTML = `<div class="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <i class="fa-solid fa-spinner fa-spin mr-1.5 text-teal-500"></i>
            Loading MACULA linguistics &amp; exegetical brief for <strong>${escapeHtml(label)}</strong>…
        </div>`;

        let bookData = await loadMaculaBookData(ref.bookNum);
        if (!bookData) {
            bookData = await buildFallbackTokensForRange(ref);
        }
        if (myToken !== state.renderToken) return;

        if (sourceBadge) {
            sourceBadge.textContent = bookData.source === 'MACULA'
                ? 'MACULA (BSB Gloss + Domains + Referents)'
                : 'Built-In Morphology';
        }

        const verseBuckets = [];
        const allWords = [];
        for (let v = ref.startVerse; v <= ref.endVerse; v++) {
            const vk = `${ref.chapter}_${v}`;
            const wList = bookData.verses[vk];
            if (wList && wList.length) {
                verseBuckets.push({ verse: v, words: wList });
                wList.forEach((w) => allWords.push({ ...w, verse: v }));
            }
        }

        if (!allWords.length) {
            content.innerHTML = `<div class="p-5 rounded-xl bg-amber-50 dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200">
                No linguistic tokens were found for <strong>${escapeHtml(label)}</strong>. Try typing a valid range like <strong>Heb 1:1-4</strong> or <strong>Gen 1:1-5</strong> and clicking <strong>Analyze</strong>.
            </div>`;
            return;
        }

        if (state.activeSubTab === 'macula') {
            renderMaculaWordExplorerView(content, ref, label, verseBuckets, isNt);
        } else if (state.activeSubTab === 'verbs') {
            renderVerbBackboneView(content, ref, label, allWords, isNt);
        } else if (state.activeSubTab === 'cantillation' && !isNt) {
            await renderCantillationView(content, ref, label);
        } else {
            renderOverviewBriefView(content, ref, label, allWords, verseBuckets, isNt, bookData.source);
        }
    }

    function renderOverviewBriefView(content, ref, label, allWords, verseBuckets, isNt, sourceName) {
        const lemmaMap = new Map();
        allWords.forEach((w) => {
            const isMinor = isNt ? MINOR_GREEK_LEMMAS.has(w.lemma) : MINOR_HEBREW_STRONGS.has(w.strongs);
            if (isMinor || w.pos === 'det' || w.pos === 'conj' || w.pos === 'prep' || w.pos === 'ptcl') return;
            const key = w.strongs || w.lemma || w.surface;
            if (!key) return;
            if (!lemmaMap.has(key)) {
                lemmaMap.set(key, { ...w, count: 0, verses: new Set() });
            }
            const rec = lemmaMap.get(key);
            rec.count++;
            rec.verses.add(w.verse);
        });

        const repeated = Array.from(lemmaMap.values())
            .filter((x) => x.count >= 2)
            .sort((a, b) => b.count - a.count)
            .slice(0, 12);

        const rareWords = Array.from(lemmaMap.values())
            .filter((x) => x.bookFreq === 1 && (x.pos === 'verb' || x.pos === 'noun' || x.pos === 'adj' || x.pos === 'adv'))
            .slice(0, 14);

        const domainMap = new Map();
        allWords.forEach((w) => {
            if (!w.domain) return;
            const majorLabel = w.domain.replace(/^[0-9.]+\s*\((.+)\)$/, '$1');
            if (!domainMap.has(majorLabel)) domainMap.set(majorLabel, { label: majorLabel, words: [] });
            const d = domainMap.get(majorLabel);
            if (d.words.length < 4 && !d.words.some((x) => x.lemma === w.lemma)) {
                d.words.push(w);
            }
        });
        const topDomains = Array.from(domainMap.values())
            .sort((a, b) => b.words.length - a.words.length)
            .slice(0, 6);

        const imperatives = allWords.filter((w) => w.mood === 'imperative');
        const participles = allWords.filter((w) => w.mood === 'participle');
        const mainVerbs = allWords.filter((w) => w.pos === 'verb' && w.mood !== 'participle' && w.mood !== 'infinitive' && w.mood !== 'imperative');
        const referents = allWords.filter((w) => w.referent);

        const statsHtml = `
            <div class="grid grid-cols-4 gap-2 text-center">
                <div class="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <div class="text-base font-extrabold text-indigo-600 dark:text-indigo-400">${mainVerbs.length}</div>
                    <div class="text-[10px] font-bold text-gray-500">Main Verbs</div>
                </div>
                <div class="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <div class="text-base font-extrabold text-rose-600 dark:text-rose-400">${imperatives.length}</div>
                    <div class="text-[10px] font-bold text-gray-500">Commands</div>
                </div>
                <div class="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <div class="text-base font-extrabold text-purple-600 dark:text-purple-400">${participles.length}</div>
                    <div class="text-[10px] font-bold text-gray-500">Participles</div>
                </div>
                <div class="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <div class="text-base font-extrabold text-amber-600 dark:text-amber-400">${referents.length}</div>
                    <div class="text-[10px] font-bold text-gray-500">Pronoun Links</div>
                </div>
            </div>
        `;

        const repeatedHtml = repeated.length
            ? repeated.map((r) => `
                <button type="button" class="lf-brief-lex-btn px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:border-indigo-500 border border-gray-200 dark:border-zinc-700 text-left transition cursor-pointer" data-strong="${escapeHtml(r.strongs)}" data-lemma="${escapeHtml(r.lemma)}">
                    <div class="flex items-center gap-1.5">
                        <span class="font-serif font-bold text-sm text-gray-900 dark:text-white">${escapeHtml(r.lemma || r.surface)}</span>
                        <span class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">${r.count}×</span>
                    </div>
                    <div class="text-[10.5px] text-gray-500 dark:text-gray-400 truncate max-w-[160px]">${escapeHtml(r.gloss || r.strongs)} • v${Array.from(r.verses).join(',')}</div>
                </button>`).join('')
            : `<span class="text-xs text-gray-500 italic">No key content words repeated 2+ times in this short range.</span>`;

        const rareHtml = rareWords.length
            ? rareWords.map((r) => `
                <button type="button" class="lf-brief-lex-btn px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs transition cursor-pointer" data-strong="${escapeHtml(r.strongs)}" data-lemma="${escapeHtml(r.lemma)}" title="Only used once in ${escapeHtml(ref.bookName)} (v${r.verse})">
                    <span class="font-serif font-bold">${escapeHtml(r.lemma || r.surface)}</span>
                    <span class="opacity-80 text-[10.5px] ml-1">“${escapeHtml(r.gloss || '')}”</span>
                </button>`).join('')
            : `<span class="text-xs text-gray-500 italic">${sourceName === 'MACULA' ? 'No single-occurrence words in this range.' : 'Book-wide rarity calculates automatically when MACULA loads.'}</span>`;

        const domainsHtml = topDomains.length
            ? topDomains.map((d) => `
                <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-gray-800 dark:text-gray-100">${escapeHtml(d.label)}</span>
                    <span class="text-[11px] font-serif text-indigo-700 dark:text-indigo-300 truncate">${d.words.map((w) => escapeHtml(w.lemma || w.surface)).join(', ')}</span>
                </div>`).join('')
            : '';

        const verseCiteBtns = verseBuckets.slice(0, 12).map((vb) => `
            <button type="button" class="lf-brief-cite-btn px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-500 hover:text-white text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-[11px] font-bold cursor-pointer transition" data-vref="${escapeHtml(`${ref.bookName} ${ref.chapter}:${vb.verse}`)}">
                ${escapeHtml(`${ref.bookName} ${ref.chapter}:${vb.verse}`)}
            </button>`).join('');

        content.innerHTML = `
            ${statsHtml}

            <div class="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/25 border border-teal-200 dark:border-teal-800/70 space-y-2">
                <div class="text-xs font-extrabold text-teal-900 dark:text-teal-300 flex items-center justify-between">
                    <span><i class="fa-solid fa-repeat mr-1.5"></i>Repeated Key Lemmas in ${escapeHtml(label)}</span>
                    <span class="text-[10px] font-normal opacity-80">Click any word for Lexicon</span>
                </div>
                <div class="flex flex-wrap gap-1.5">${repeatedHtml}</div>
            </div>

            <div class="p-3.5 rounded-xl bg-purple-50/65 dark:bg-purple-950/25 border border-purple-200 dark:border-purple-800/70 space-y-2">
                <div class="text-xs font-extrabold text-purple-900 dark:text-purple-300">
                    <i class="fa-solid fa-gem mr-1.5"></i>Unique / Rare Words in ${escapeHtml(ref.bookName)} (Used 1× in Book)
                </div>
                <div class="flex flex-wrap gap-1.5">${rareHtml}</div>
            </div>

            ${domainsHtml ? `
            <div class="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-200 dark:border-indigo-800/70 space-y-2">
                <div class="text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
                    <i class="fa-solid fa-sitemap mr-1.5"></i>MACULA Semantic Domains (Key Concepts)
                </div>
                <div class="space-y-1.5">${domainsHtml}</div>
            </div>` : ''}

            <div class="p-3.5 rounded-xl bg-amber-50/75 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/70 space-y-2">
                <div class="text-xs font-extrabold text-amber-950 dark:text-amber-300">
                    <i class="fa-solid fa-book-bible mr-1.5"></i>Search All Lexicons for Citations of These Verses
                </div>
                <div class="flex flex-wrap gap-1.5">${verseCiteBtns}</div>
            </div>

            ${!isNt ? `
            <div class="p-3.5 rounded-xl bg-emerald-50/75 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/70 flex flex-wrap items-center justify-between gap-2">
                <div class="text-xs text-emerald-900 dark:text-emerald-200">
                    <strong>Masoretic Cantillation Auto-Split:</strong> Break ${escapeHtml(label)} into indented clauses using Hebrew Atnaḥ &amp; Zaqef accents.
                </div>
                <button type="button" id="lfBriefQuickCantSplitBtn" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                    Split by Cantillation →
                </button>
            </div>` : ''}
        `;

        content.querySelectorAll('.lf-brief-lex-btn').forEach((btn) => {
            btn.addEventListener('click', () => openLexiconForWord(btn.dataset.strong, btn.dataset.lemma, isNt));
        });
        content.querySelectorAll('.lf-brief-cite-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (typeof window.lfOpenAllLexiconScriptureSearch === 'function') {
                    window.lfOpenAllLexiconScriptureSearch(btn.dataset.vref);
                }
            });
        });
        content.querySelector('#lfBriefQuickCantSplitBtn')?.addEventListener('click', () => applyHebrewCantillationAutoSplit(ref));
    }

    function renderMaculaWordExplorerView(content, ref, label, verseBuckets, isNt) {
        const legend = `
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-[11px] text-gray-600 dark:text-gray-300 flex flex-wrap items-center gap-3">
                <span class="font-bold text-gray-800 dark:text-white">MACULA Tags:</span>
                <span><span class="inline-block w-2 h-2 rounded-full bg-red-600 mr-1"></span>Verb</span>
                <span><span class="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1"></span>Subject</span>
                <span><span class="inline-block w-2 h-2 rounded-full bg-emerald-600 mr-1"></span>Object</span>
                <span class="border-b-2 border-dashed border-amber-500 font-semibold">Pronoun → Referent</span>
            </div>
        `;

        const versesHtml = verseBuckets.map((vb) => {
            const chips = vb.words.map((w) => {
                let roleCls = '';
                if (w.pos === 'verb' || w.role === 'v') roleCls = 'lf-role-verb';
                else if (w.role === 's') roleCls = 'lf-role-subj';
                else if (w.role === 'o' || w.role === 'io') roleCls = 'lf-role-obj';
                const refCls = w.referent ? 'lf-has-ref' : '';

                const metaBits = [w.strongs, w.domain ? w.domain.split(' ')[0] : ''].filter(Boolean).join(' • ');
                return `
                    <button type="button" class="lf-macula-word-chip ${roleCls} ${refCls}" data-strong="${escapeHtml(w.strongs)}" data-lemma="${escapeHtml(w.lemma)}" title="${escapeHtml([w.lemma, w.domain, w.referent ? 'Refers to: ' + w.referent : ''].filter(Boolean).join(' | '))}">
                        <span class="font-serif font-bold text-sm text-gray-900 dark:text-white leading-snug">${escapeHtml(w.surface)}</span>
                        ${w.gloss ? `<span class="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 leading-tight">${escapeHtml(w.gloss)}</span>` : ''}
                        ${w.referent ? `<span class="text-[10px] font-bold text-amber-700 dark:text-amber-300 leading-tight">↳ ${escapeHtml(w.referent)}</span>` : ''}
                        ${metaBits ? `<span class="text-[9.5px] font-mono text-gray-400 leading-tight">${escapeHtml(metaBits)}</span>` : ''}
                    </button>`;
            }).join('');

            return `
                <div class="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-700 space-y-2">
                    <div class="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">${escapeHtml(ref.bookName)} ${ref.chapter}:${vb.verse}</div>
                    <div class="flex flex-wrap gap-1.5" dir="${isNt ? 'ltr' : 'rtl'}">${chips}</div>
                </div>`;
        }).join('');

        content.innerHTML = `${legend}<div class="space-y-2.5">${versesHtml}</div>`;
        content.querySelectorAll('.lf-macula-word-chip').forEach((btn) => {
            btn.addEventListener('click', () => openLexiconForWord(btn.dataset.strong, btn.dataset.lemma, isNt));
        });
    }

    function renderVerbBackboneView(content, ref, label, allWords, isNt) {
        const imperatives = allWords.filter((w) => w.mood === 'imperative');
        const mainVerbs = allWords.filter((w) => w.pos === 'verb' && w.mood !== 'participle' && w.mood !== 'infinitive' && w.mood !== 'imperative');
        const participles = allWords.filter((w) => w.mood === 'participle');
        const infinitives = allWords.filter((w) => w.mood === 'infinitive');

        const buildSection = (title, colorCls, icon, list) => {
            const rows = list.length
                ? list.map((w) => {
                    const parseTag = [w.tense, w.stem, w.voice, w.mood].filter(Boolean).join(' ');
                    return `
                        <button type="button" class="lf-brief-lex-btn w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:border-indigo-500 border border-gray-200 dark:border-zinc-700 flex items-center justify-between gap-2 text-left transition cursor-pointer" data-strong="${escapeHtml(w.strongs)}" data-lemma="${escapeHtml(w.lemma)}">
                            <div class="min-w-0">
                                <span class="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 mr-1.5">v${w.verse}</span>
                                <span class="font-serif font-bold text-sm text-gray-900 dark:text-white">${escapeHtml(w.surface)}</span>
                                ${w.gloss ? `<span class="text-xs text-gray-600 dark:text-gray-300 ml-1.5">“${escapeHtml(w.gloss)}”</span>` : ''}
                            </div>
                            <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 shrink-0 capitalize">${escapeHtml(parseTag || 'verb')}</span>
                        </button>`;
                }).join('')
                : `<div class="text-xs text-gray-500 italic px-1">None in ${escapeHtml(label)}.</div>`;

            return `
                <div class="space-y-1.5">
                    <div class="text-xs font-extrabold ${colorCls} flex items-center gap-1.5">
                        <i class="fa-solid ${icon}"></i><span>${title} (${list.length})</span>
                    </div>
                    <div class="space-y-1.5">${rows}</div>
                </div>`;
        };

        content.innerHTML = `
            <div class="space-y-4">
                ${buildSection('Commands (Imperatives)', 'text-rose-700 dark:text-rose-400', 'fa-exclamation-circle', imperatives)}
                ${buildSection('Main Verbs (Clause Backbone)', 'text-indigo-700 dark:text-indigo-400', 'fa-bolt', mainVerbs)}
                ${buildSection('Participles (Supporting Actions)', 'text-purple-700 dark:text-purple-400', 'fa-code-branch', participles)}
                ${buildSection('Infinitives (Purpose / Complement)', 'text-teal-700 dark:text-teal-400', 'fa-arrow-right', infinitives)}
            </div>
        `;

        content.querySelectorAll('.lf-brief-lex-btn').forEach((btn) => {
            btn.addEventListener('click', () => openLexiconForWord(btn.dataset.strong, btn.dataset.lemma, isNt));
        });
    }

    async function renderCantillationView(content, ref, label) {
        if (typeof window.fetchHebrewChapterFast === 'function') {
            await window.fetchHebrewChapterFast(ref.bookNum, ref.chapter);
        }
        const tokMap = typeof scriptureDataCache !== 'undefined' ? scriptureDataCache.wlcVerseTokensMap : null;

        let cardsHtml = '';
        for (let v = ref.startVerse; v <= ref.endVerse; v++) {
            const toks = tokMap ? tokMap.get(`${ref.bookNum}_${ref.chapter}_${v}`) : null;
            if (!toks || !toks.length) continue;
            const clauses = segmentHebrewVerseByCantillation(toks);
            const rows = clauses.map((c) => `
                <div class="lf-cant-clause lf-cant-lvl-${c.indentLevel}">
                    <div class="flex items-center justify-between gap-2 mb-0.5">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">Level ${c.indentLevel} • Ends on ${escapeHtml(c.breakName)}</span>
                    </div>
                    <div class="font-serif text-base text-gray-900 dark:text-gray-100 leading-relaxed" dir="rtl">${escapeHtml(c.text)}</div>
                </div>
            `).join('');

            cardsHtml += `
                <div class="space-y-1.5">
                    <div class="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">${escapeHtml(ref.bookName)} ${ref.chapter}:${v}</div>
                    ${rows}
                </div>`;
        }

        content.innerHTML = `
            <div class="p-3.5 rounded-xl bg-emerald-50/85 dark:bg-emerald-950/35 border border-emerald-300 dark:border-emerald-700 flex flex-wrap items-center justify-between gap-2">
                <div class="text-xs text-emerald-950 dark:text-emerald-200">
                    <strong>Masoretic Cantillation Hierarchy:</strong> Preview how WLC accents (<em>Atnaḥ</em>, <em>Zaqef</em>, <em>Revi'a</em>) divide <strong>${escapeHtml(label)}</strong>, then apply directly to your Thought Flow editor.
                </div>
                <button type="button" id="lfApplyCantSplitMainBtn" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                    <i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Apply Split to Workspace
                </button>
            </div>
            <div class="space-y-3 mt-2">${cardsHtml || '<div class="text-xs text-gray-500 italic">No Hebrew cantillation marks loaded for this range.</div>'}</div>
        `;

        content.querySelector('#lfApplyCantSplitMainBtn')?.addEventListener('click', () => applyHebrewCantillationAutoSplit(ref));
    }

    // -------------------------------------------------------------------------
    // 5. MOUNT INTO STUDY DOCK + RESEARCH BAR + SHORTCUT (Cmd+Shift+B)
    // -------------------------------------------------------------------------
    function mountBriefIntoStudyDock() {
        const dock = document.getElementById('lfStudyDock');
        if (!dock || document.getElementById('lfDockPanel_brief')) return false;

        const tabsRow = dock.querySelector('.lf-dock-tab-btn')?.parentElement;
        if (tabsRow && !tabsRow.querySelector('[data-dock-tab="brief"]')) {
            const briefBtn = document.createElement('button');
            briefBtn.type = 'button';
            briefBtn.className = 'lf-dock-tab-btn';
            briefBtn.dataset.dockTab = 'brief';
            briefBtn.title = `Passage Exegetical Brief & MACULA Word Intelligence (${MOD}⇧B)`;
            briefBtn.innerHTML = `<i class="fa-solid fa-sparkles text-[11px]"></i><span>Brief</span>`;
            briefBtn.addEventListener('click', () => activateBriefTabInDock(true));
            tabsRow.appendChild(briefBtn);

            tabsRow.querySelectorAll('.lf-dock-tab-btn:not([data-dock-tab="brief"])').forEach((origBtn) => {
                origBtn.addEventListener('click', () => {
                    briefBtn.classList.remove('active');
                    const bp = document.getElementById('lfDockPanel_brief');
                    if (bp) bp.classList.add('hidden');
                });
            });
        }

        const panel = document.createElement('div');
        panel.id = 'lfDockPanel_brief';
        panel.className = 'flex-1 flex flex-col min-h-0 overflow-hidden hidden';
        panel.innerHTML = `
            <div class="px-3.5 py-2.5 border-b border-gray-200/80 dark:border-zinc-700/80 bg-teal-50/70 dark:bg-zinc-900/60 space-y-2 shrink-0">
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                    <div class="flex items-center gap-1.5 flex-1 min-w-[160px]">
                        <input type="text" id="lfBriefRangeInput" placeholder="e.g. Heb 1:1-4 or Gen 1:1-5"
                               class="select-text flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-teal-300 dark:border-zinc-700 text-xs font-bold text-gray-800 dark:text-gray-100 outline-none">
                        <button type="button" id="lfBriefAnalyzeBtn" class="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer">
                            Analyze
                        </button>
                    </div>
                    <button type="button" id="lfBriefSyncBtn" class="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition cursor-pointer" title="Sync to visible passage in workspace">
                        <i class="fa-solid fa-crosshairs mr-1"></i>Sync
                    </button>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                    <div class="flex items-center flex-wrap gap-1">
                        <button type="button" class="lf-brief-pill active" data-brief-sub="overview">Overview</button>
                        <button type="button" class="lf-brief-pill" data-brief-sub="macula">MACULA Words</button>
                        <button type="button" class="lf-brief-pill" data-brief-sub="verbs">Verb Backbone</button>
                        <button type="button" id="lfBriefCantTabBtn" class="lf-brief-pill hidden" data-brief-sub="cantillation">Cantillation Split</button>
                    </div>
                    <span id="lfBriefSourceBadge" class="text-[10px] font-bold text-teal-800 dark:text-teal-300">MACULA Ready</span>
                </div>
            </div>
            <div id="lfBriefContent" class="flex-1 p-3.5 overflow-y-auto custom-scrollbar space-y-3"></div>
        `;
        dock.appendChild(panel);

        panel.querySelectorAll('.lf-brief-pill').forEach((btn) => {
            btn.addEventListener('click', () => setBriefSubTab(btn.dataset.briefSub));
        });

        const runRangeInput = () => {
            const inp = document.getElementById('lfBriefRangeInput');
            const parsed = parseBriefRangeInput(inp ? inp.value : '');
            if (!parsed) {
                showToast('Try a range like "Heb 1:1-4" or "Gen 1:1-5".');
                return;
            }
            state.briefRef = parsed;
            renderPassageBrief();
        };

        document.getElementById('lfBriefAnalyzeBtn').addEventListener('click', runRangeInput);
        document.getElementById('lfBriefRangeInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                runRangeInput();
            }
        });
        document.getElementById('lfBriefSyncBtn').addEventListener('click', () => {
            state.briefRef = getActivePassageRangeFromWorkspace();
            renderPassageBrief();
        });

        const rqBar = document.getElementById('lfResearchQuickBar');
        if (rqBar && !rqBar.querySelector('[data-rq="brief"]')) {
            const firstWrap = rqBar.firstElementChild;
            if (firstWrap) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'lf-rq-btn';
                b.dataset.rq = 'brief';
                b.innerHTML = `<i class="fa-solid fa-sparkles text-teal-500"></i><span>Passage Brief</span>`;
                b.addEventListener('click', () => activateBriefTabInDock(true));
                firstWrap.appendChild(b);
            }
        }

        return true;
    }

    document.addEventListener('keydown', (e) => {
        const modPressed = isMac ? e.metaKey : e.ctrlKey;
        if (!modPressed || !e.shiftKey || e.altKey) return;
        const tag = (e.target && e.target.tagName) || '';
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        if ((e.key || '').toLowerCase() === 'b') {
            e.preventDefault();
            activateBriefTabInDock(true);
        }
    });

    window.lfOpenPassageBrief = () => activateBriefTabInDock(true);
    window.lfApplyHebrewCantillationSplit = () => applyHebrewCantillationAutoSplit(getActivePassageRangeFromWorkspace());

    function initPhase3() {
        if (!mountBriefIntoStudyDock()) {
            let tries = 0;
            const t = setInterval(() => {
                tries++;
                if (mountBriefIntoStudyDock() || tries > 25) clearInterval(t);
            }, 150);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initPhase3, 180));
    } else {
        setTimeout(initPhase3, 180);
    }
})();
