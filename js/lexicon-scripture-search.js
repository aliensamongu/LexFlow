/* === LEXFLOW MODULE: ALL-LEXICON SCRIPTURE SEARCH + VERSE-WORDS FALLBACK (v3.1) === */
(function () {
    if (window.__lfScriptureSearchLoaded) return;
    window.__lfScriptureSearchLoaded = true;

    const BOOKS = [
        { num: 1, name: 'Genesis', ot: ['Genesis', 'Gen', 'Gn', 'Ge'], gnt: ['Genesis', 'Gen', 'Ge', 'Gn'], lsj: ['Genesis', 'Gen.', 'Ge.', 'Gn.'] },
        { num: 2, name: 'Exodus', ot: ['Exodus', 'Exod', 'Ex'], gnt: ['Exodus', 'Exod', 'Ex'], lsj: ['Exodus', 'Exod.', 'Ex.'] },
        { num: 3, name: 'Leviticus', ot: ['Leviticus', 'Lev', 'Lv', 'Le'], gnt: ['Leviticus', 'Lev', 'Le', 'Lv'], lsj: ['Leviticus', 'Lev.', 'Le.', 'Lv.'] },
        { num: 4, name: 'Numbers', ot: ['Numbers', 'Num', 'Nu', 'Nm', 'Nb'], gnt: ['Numbers', 'Num', 'Nu', 'Nm'], lsj: ['Numbers', 'Num.', 'Nu.', 'Nm.'] },
        { num: 5, name: 'Deuteronomy', ot: ['Deuteronomy', 'Deut', 'Dt', 'De'], gnt: ['Deuteronomy', 'Deut', 'De', 'Dt'], lsj: ['Deuteronomy', 'Deut.', 'De.', 'Dt.'] },
        { num: 6, name: 'Joshua', ot: ['Joshua', 'Josh', 'Jos'], gnt: ['Joshua', 'Josh', 'Jos'], lsj: ['Joshua', 'Josh.', 'Jos.'] },
        { num: 7, name: 'Judges', ot: ['Judges', 'Judg', 'Jdg', 'Jg', 'Ju'], gnt: ['Judges', 'Judg', 'Jdg', 'Jg', 'Ju'], lsj: ['Judges', 'Judg.', 'Jdg.', 'Ju.'] },
        { num: 8, name: 'Ruth', ot: ['Ruth', 'Ru', 'Rth'], gnt: ['Ruth', 'Ru'], lsj: ['Ruth', 'Ru.'] },
        { num: 9, name: '1 Samuel', ot: ['1 Samuel', '1 Sam', '1 Sa', '1 S', '1Sm', '1S', 'I Sam', 'I Sa', 'I S', '1 Kings', 'I Kings'], gnt: ['1 Samuel', '1 Sam', 'I Sam', '1 Sa', 'I Sa', '1 S', 'I S', '1 Kings', 'I Kings'], lsj: ['1 Samuel', '1 Sam.', '1 Sa.', '1 Reg.', '1 Ki.', '1 Kings'] },
        { num: 10, name: '2 Samuel', ot: ['2 Samuel', '2 Sam', '2 Sa', '2 S', '2Sm', '2S', 'II Sam', 'II Sa', 'II S', '2 Kings', 'II Kings'], gnt: ['2 Samuel', '2 Sam', 'II Sam', '2 Sa', 'II Sa', '2 S', 'II S', '2 Kings', 'II Kings'], lsj: ['2 Samuel', '2 Sam.', '2 Sa.', '2 Reg.', '2 Ki.', '2 Kings'] },
        { num: 11, name: '1 Kings', ot: ['1 Kings', '1 Kgs', '1 Ki', '1 K', '1Ki', '1K', 'I Kings', 'I Kgs', 'I Ki', 'I K'], gnt: ['1 Kings', '1 Kgs', '1 Ki', '1 K', 'I Kings', 'I Kgs', 'I Ki', 'I K'], lsj: ['1 Kings', '1 Ki.', '1 Reg.', '3 Reg.', '3 Ki.'] },
        { num: 12, name: '2 Kings', ot: ['2 Kings', '2 Kgs', '2 Ki', '2 K', '2Ki', '2K', 'II Kings', 'II Kgs', 'II Ki', 'II K'], gnt: ['2 Kings', '2 Kgs', '2 Ki', '2 K', 'II Kings', 'II Kgs', 'II Ki', 'II K'], lsj: ['2 Kings', '2 Ki.', '2 Reg.', '4 Reg.', '4 Ki.'] },
        { num: 13, name: '1 Chronicles', ot: ['1 Chronicles', '1 Chron', '1 Chr', '1 Ch', '1Ch', 'I Chron', 'I Chr', 'I Ch'], gnt: ['1 Chronicles', '1 Chron', '1 Chr', '1 Ch', 'I Chron', 'I Chr', 'I Ch'], lsj: ['1 Chronicles', '1 Chron.', '1 Chr.', '1 Par.'] },
        { num: 14, name: '2 Chronicles', ot: ['2 Chronicles', '2 Chron', '2 Chr', '2 Ch', '2Ch', 'II Chron', 'II Chr', 'II Ch'], gnt: ['2 Chronicles', '2 Chron', '2 Chr', '2 Ch', 'II Chron', 'II Chr', 'II Ch'], lsj: ['2 Chronicles', '2 Chron.', '2 Chr.', '2 Par.'] },
        { num: 15, name: 'Ezra', ot: ['Ezra', 'Ezr'], gnt: ['Ezra', 'Ezr'], lsj: ['Ezra', 'Ezr.', '1 Esd.'] },
        { num: 16, name: 'Nehemiah', ot: ['Nehemiah', 'Neh', 'Ne'], gnt: ['Nehemiah', 'Neh', 'Ne'], lsj: ['Nehemiah', 'Neh.', 'Ne.', '2 Esd.'] },
        { num: 17, name: 'Esther', ot: ['Esther', 'Esth', 'Est', 'Es'], gnt: ['Esther', 'Esth', 'Est'], lsj: ['Esther', 'Esth.', 'Est.'] },
        { num: 18, name: 'Job', ot: ['Job', 'Jb'], gnt: ['Job', 'Jb'], lsj: ['Job'] },
        { num: 19, name: 'Psalms', ot: ['Psalms', 'Psalm', 'Pss', 'Psa', 'Ps'], gnt: ['Psalms', 'Psalm', 'Pss', 'Psa', 'Ps'], lsj: ['Psalms', 'Psalm', 'Ps.', 'Pss.'] },
        { num: 20, name: 'Proverbs', ot: ['Proverbs', 'Prov', 'Prv', 'Pr'], gnt: ['Proverbs', 'Prov', 'Pr'], lsj: ['Proverbs', 'Prov.', 'Pr.'] },
        { num: 21, name: 'Ecclesiastes', ot: ['Ecclesiastes', 'Eccles', 'Eccl', 'Ecc', 'Ec', 'Qoh'], gnt: ['Ecclesiastes', 'Eccles', 'Eccl', 'Ec'], lsj: ['Ecclesiastes', 'Eccles.', 'Eccl.', 'Ec.'] },
        { num: 22, name: 'Song of Solomon', ot: ['Song of Solomon', 'Songs', 'Song', 'Cant', 'Ct', 'Ca', 'So', 'SS'], gnt: ['Song of Solomon', 'Cant', 'Song', 'Ca', 'So'], lsj: ['Song of Solomon', 'Cant.', 'Ca.', 'Song'] },
        { num: 23, name: 'Isaiah', ot: ['Isaiah', 'Isa', 'Is'], gnt: ['Isaiah', 'Isa', 'Is'], lsj: ['Isaiah', 'Isa.', 'Is.'] },
        { num: 24, name: 'Jeremiah', ot: ['Jeremiah', 'Jer', 'Je', 'Jr'], gnt: ['Jeremiah', 'Jer', 'Je'], lsj: ['Jeremiah', 'Jer.', 'Je.'] },
        { num: 25, name: 'Lamentations', ot: ['Lamentations', 'Lam', 'La'], gnt: ['Lamentations', 'Lam', 'La'], lsj: ['Lamentations', 'Lam.', 'La.'] },
        { num: 26, name: 'Ezekiel', ot: ['Ezekiel', 'Ezek', 'Eze', 'Ez'], gnt: ['Ezekiel', 'Ezek', 'Ez'], lsj: ['Ezekiel', 'Ezek.', 'Ez.'] },
        { num: 27, name: 'Daniel', ot: ['Daniel', 'Dan', 'Dn', 'Da'], gnt: ['Daniel', 'Dan', 'Dn', 'Da'], lsj: ['Daniel', 'Dan.', 'Da.'] },
        { num: 28, name: 'Hosea', ot: ['Hosea', 'Hos', 'Ho'], gnt: ['Hosea', 'Hos', 'Ho'], lsj: ['Hosea', 'Hos.', 'Ho.'] },
        { num: 29, name: 'Joel', ot: ['Joel', 'Joe', 'Jl', 'Jo'], gnt: ['Joel', 'Jl'], lsj: ['Joel', 'Jl.'] },
        { num: 30, name: 'Amos', ot: ['Amos', 'Am'], gnt: ['Amos', 'Am'], lsj: ['Amos', 'Am.'] },
        { num: 31, name: 'Obadiah', ot: ['Obadiah', 'Obad', 'Ob'], gnt: ['Obadiah', 'Obad', 'Ob'], lsj: ['Obadiah', 'Obad.', 'Ob.'] },
        { num: 32, name: 'Jonah', ot: ['Jonah', 'Jon', 'Jnh'], gnt: ['Jonah', 'Jon'], lsj: ['Jonah', 'Jon.'] },
        { num: 33, name: 'Micah', ot: ['Micah', 'Mic', 'Mi'], gnt: ['Micah', 'Mic', 'Mi'], lsj: ['Micah', 'Mic.', 'Mi.'] },
        { num: 34, name: 'Nahum', ot: ['Nahum', 'Nah', 'Na'], gnt: ['Nahum', 'Nah', 'Na'], lsj: ['Nahum', 'Nah.', 'Na.'] },
        { num: 35, name: 'Habakkuk', ot: ['Habakkuk', 'Hab', 'Hb'], gnt: ['Habakkuk', 'Hab', 'Hb'], lsj: ['Habakkuk', 'Hab.', 'Hb.'] },
        { num: 36, name: 'Zephaniah', ot: ['Zephaniah', 'Zeph', 'Zep', 'Zp'], gnt: ['Zephaniah', 'Zeph', 'Zp'], lsj: ['Zephaniah', 'Zeph.', 'Zp.'] },
        { num: 37, name: 'Haggai', ot: ['Haggai', 'Hag', 'Hg'], gnt: ['Haggai', 'Hag', 'Hg'], lsj: ['Haggai', 'Hag.', 'Hg.'] },
        { num: 38, name: 'Zechariah', ot: ['Zechariah', 'Zech', 'Zec', 'Zc'], gnt: ['Zechariah', 'Zech', 'Zc'], lsj: ['Zechariah', 'Zech.', 'Zc.'] },
        { num: 39, name: 'Malachi', ot: ['Malachi', 'Mal', 'Ml'], gnt: ['Malachi', 'Mal', 'Ml'], lsj: ['Malachi', 'Mal.', 'Ml.'] },
        { num: 40, name: 'Matthew', ot: ['Matthew', 'Matt', 'Mt'], gnt: ['Matthew', 'Matt', 'Mat', 'Mt'], lsj: ['Ev. Matt.', 'Ev. Mat.', 'Matthew', 'Matt.', 'Mat.', 'Mt.'] },
        { num: 41, name: 'Mark', ot: ['Mark', 'Mk'], gnt: ['Mark', 'Marc', 'Mk', 'Mr'], lsj: ['Ev. Marc.', 'Ev. Mar.', 'Mark', 'Marc.', 'Mk.', 'Mr.'] },
        { num: 42, name: 'Luke', ot: ['Luke', 'Lk'], gnt: ['Luke', 'Luk', 'Luc', 'Lk'], lsj: ['Ev. Luc.', 'Luke', 'Lk.'] },
        { num: 43, name: 'John', ot: ['John', 'Jn'], gnt: ['John', 'Joh', 'Jn', 'Jo'], lsj: ['Ev. Jo.', 'Ev. Joh.', 'John', 'Joh.', 'Jn.'] },
        { num: 44, name: 'Acts', ot: ['Acts', 'Ac'], gnt: ['Acts', 'Act', 'Ac'], lsj: ['Act. Ap.', 'Acts', 'Act.'] },
        { num: 45, name: 'Romans', ot: ['Romans', 'Rom', 'Ro'], gnt: ['Romans', 'Rom', 'Ro', 'Rm'], lsj: ['Ep. Rom.', 'Romans', 'Rom.', 'Ro.'] },
        { num: 46, name: '1 Corinthians', ot: ['1 Corinthians', '1 Cor', '1 Co'], gnt: ['1 Corinthians', '1 Cor', 'I Cor', '1 Co', 'I Co'], lsj: ['1 Ep. Cor.', '1 Corinthians', '1 Cor.', '1 Co.'] },
        { num: 47, name: '2 Corinthians', ot: ['2 Corinthians', '2 Cor', '2 Co'], gnt: ['2 Corinthians', '2 Cor', 'II Cor', '2 Co', 'II Co'], lsj: ['2 Ep. Cor.', '2 Corinthians', '2 Cor.', '2 Co.'] },
        { num: 48, name: 'Galatians', ot: ['Galatians', 'Gal', 'Ga'], gnt: ['Galatians', 'Gal', 'Ga'], lsj: ['Ep. Gal.', 'Galatians', 'Gal.', 'Ga.'] },
        { num: 49, name: 'Ephesians', ot: ['Ephesians', 'Eph'], gnt: ['Ephesians', 'Eph', 'Ep'], lsj: ['Ep. Eph.', 'Ephesians', 'Eph.'] },
        { num: 50, name: 'Philippians', ot: ['Philippians', 'Phil', 'Php'], gnt: ['Philippians', 'Phil', 'Php', 'Ph'], lsj: ['Ep. Phil.', 'Philippians', 'Phil.', 'Php.'] },
        { num: 51, name: 'Colossians', ot: ['Colossians', 'Col'], gnt: ['Colossians', 'Col'], lsj: ['Ep. Col.', 'Colossians', 'Col.'] },
        { num: 52, name: '1 Thessalonians', ot: ['1 Thessalonians', '1 Thess', '1 Th'], gnt: ['1 Thessalonians', '1 Thess', 'I Thess', '1 Thes', 'I Thes', '1 Th', 'I Th'], lsj: ['1 Ep. Thess.', '1 Thessalonians', '1 Thess.', '1 Thes.', '1 Th.'] },
        { num: 53, name: '2 Thessalonians', ot: ['2 Thessalonians', '2 Thess', '2 Th'], gnt: ['2 Thessalonians', '2 Thess', 'II Thess', '2 Thes', 'II Thes', '2 Th', 'II Th'], lsj: ['2 Ep. Thess.', '2 Thessalonians', '2 Thess.', '2 Thes.', '2 Th.'] },
        { num: 54, name: '1 Timothy', ot: ['1 Timothy', '1 Tim', '1 Ti'], gnt: ['1 Timothy', '1 Tim', 'I Tim', '1 Ti', 'I Ti'], lsj: ['1 Ep. Tim.', '1 Timothy', '1 Tim.', '1 Ti.'] },
        { num: 55, name: '2 Timothy', ot: ['2 Timothy', '2 Tim', '2 Ti'], gnt: ['2 Timothy', '2 Tim', 'II Tim', '2 Ti', 'II Ti'], lsj: ['2 Ep. Tim.', '2 Timothy', '2 Tim.', '2 Ti.'] },
        { num: 56, name: 'Titus', ot: ['Titus', 'Tit'], gnt: ['Titus', 'Tit', 'Ti'], lsj: ['Ep. Tit.', 'Titus', 'Tit.'] },
        { num: 57, name: 'Philemon', ot: ['Philemon', 'Philem', 'Phm'], gnt: ['Philemon', 'Philem', 'Phlm', 'Phm'], lsj: ['Ep. Philem.', 'Philemon', 'Philem.', 'Phm.'] },
        { num: 58, name: 'Hebrews', ot: ['Hebrews', 'Heb', 'He'], gnt: ['Hebrews', 'Hebr', 'Heb', 'He'], lsj: ['Ep. Hebr.', 'Hebrews', 'Hebr.', 'Heb.'] },
        { num: 59, name: 'James', ot: ['James', 'Jas', 'Ja'], gnt: ['James', 'Jas', 'Jac', 'Ja'], lsj: ['Ep. Jac.', 'James', 'Jac.', 'Jas.'] },
        { num: 60, name: '1 Peter', ot: ['1 Peter', '1 Pet', '1 Pe'], gnt: ['1 Peter', '1 Pet', 'I Pet', '1 Pe', 'I Pe', '1 P', 'I P'], lsj: ['1 Ep. Pet.', '1 Peter', '1 Pet.', '1 Pe.'] },
        { num: 61, name: '2 Peter', ot: ['2 Peter', '2 Pet', '2 Pe'], gnt: ['2 Peter', '2 Pet', 'II Pet', '2 Pe', 'II Pe', '2 P', 'II P'], lsj: ['2 Ep. Pet.', '2 Peter', '2 Pet.', '2 Pe.'] },
        { num: 62, name: '1 John', ot: ['1 John', '1 Jn'], gnt: ['1 John', '1 Joh', 'I Joh', '1 Jn', 'I Jn', '1 Jo', 'I Jo', 'I John'], lsj: ['1 Ep. Jo.', '1 Ep. Joh.', '1 John', '1 Joh.', '1 Jn.'] },
        { num: 63, name: '2 John', ot: ['2 John', '2 Jn'], gnt: ['2 John', '2 Joh', 'II Joh', '2 Jn', 'II Jn', '2 Jo', 'II Jo', 'II John'], lsj: ['2 Ep. Jo.', '2 Ep. Joh.', '2 John', '2 Joh.', '2 Jn.'] },
        { num: 64, name: '3 John', ot: ['3 John', '3 Jn'], gnt: ['3 John', '3 Joh', 'III Joh', '3 Jn', 'III Jn', '3 Jo', 'III Jo', 'III John'], lsj: ['3 Ep. Jo.', '3 Ep. Joh.', '3 John', '3 Joh.', '3 Jn.'] },
        { num: 65, name: 'Jude', ot: ['Jude', 'Jud'], gnt: ['Jude', 'Jud'], lsj: ['Ep. Jud.', 'Jude', 'Jud.'] },
        { num: 66, name: 'Revelation', ot: ['Revelation', 'Rev', 'Re'], gnt: ['Revelation', 'Apoc', 'Rev', 'Re'], lsj: ['Apoc.', 'Revelation', 'Rev.'] }
    ];

    const LEXICON_META = {
        abbott: { label: 'Abbott-Smith', full: 'Abbott-Smith (1922)', mode: 'gnt', modal: 'gnt', chipBg: '#ede9fe', chipText: '#6d28d9', chipBorder: '#c4b5fd' },
        bdb: { label: 'BDB', full: 'BDB Hebrew Lexicon', mode: 'ot', modal: 'hebrew', chipBg: '#ccfbf1', chipText: '#0f766e', chipBorder: '#5eead4' },
        gesenius: { label: 'Gesenius', full: 'Gesenius Hebrew-Chaldee', mode: 'ot', modal: 'hebrew', chipBg: '#d1fae5', chipText: '#047857', chipBorder: '#6ee7b7' },
        lsj: { label: 'LSJ (1940)', full: 'LSJ Greek-English (1940)', mode: 'lsj', modal: 'lsj', chipBg: '#e0e7ff', chipText: '#3730a3', chipBorder: '#a5b4fc' }
    };

    const BOOK_LOOKUP = new Map();
    BOOKS.forEach((b) => {
        const reg = (k) => {
            const clean = k.toLowerCase().replace(/\.+$/, '').replace(/\s+/g, ' ').trim();
            if (clean && !BOOK_LOOKUP.has(clean)) BOOK_LOOKUP.set(clean, b);
            const compact = clean.replace(/\s+/g, '');
            if (compact && !BOOK_LOOKUP.has(compact)) BOOK_LOOKUP.set(compact, b);
        };
        reg(b.name);
        [...b.gnt, ...b.ot, ...b.lsj].forEach(reg);
    });

    function romanToInt(str) {
        if (!str) return 0;
        const map = { i: 1, v: 5, x: 10, l: 50, c: 100 };
        const s = str.toLowerCase();
        let total = 0;
        for (let i = 0; i < s.length; i++) {
            const cur = map[s[i]] || 0;
            const next = map[s[i + 1]] || 0;
            if (!cur) return 0;
            total += cur < next ? -cur : cur;
        }
        return total;
    }

    function parseVerseQuery(raw) {
        if (!raw) return null;
        const clean = raw.trim().replace(/^<\s*/, '').replace(/\s*>$/, '').trim();
        const m = clean.match(/^((?:[1-3]\s*|I{1,3}\s+)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\.?\s+(\d{1,3})\s*[:.]\s*(\d{1,3})\s*$/i);
        if (!m) return null;
        const bookKey = m[1].toLowerCase().replace(/\.+$/, '').replace(/\s+/g, ' ').trim();
        const book = BOOK_LOOKUP.get(bookKey) || BOOK_LOOKUP.get(bookKey.replace(/\s+/g, ''));
        if (!book) return null;
        const chapter = parseInt(m[2], 10);
        const verse = parseInt(m[3], 10);
        if (!chapter || !verse) return null;
        return { book, chapter, verse, label: `${book.name} ${chapter}:${verse}` };
    }

    function buildBookStartRegex(book, mode) {
        const list = mode === 'lsj' ? book.lsj : (mode === 'ot' ? book.ot : book.gnt);
        const set = new Set();
        list.forEach((a) => {
            const c = a.toLowerCase().replace(/\s+/g, ' ').trim();
            set.add(c);
            if (!c.endsWith('.')) set.add(`${c}.`);
            else set.add(c.replace(/\.+$/, ''));
        });
        const escaped = Array.from(set)
            .sort((a, b) => b.length - a.length)
            .map((a) => {
                let e = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                e = mode === 'lsj'
                    ? e.replace(/\\\.\s+/g, '\\.\\s*').replace(/\s+/g, '\\s+')
                    : e.replace(/\s+/g, '\\s+');
                return e;
            })
            .join('|');
        const chPart = mode === 'ot'
            ? '(?:(\\d{1,3})|([ivxlc]{1,7}))(?:\\s*\\(\\d{1,3}\\))?\\s*[:.,]\\s*'
            : '(\\d{1,3})(?:\\s*\\(\\d{1,3}\\))?\\s*[:.,]\\s*';
        const pat = `\\b(?:${escaped})(?=\\s|\\d|\\(|$)\\s*${chPart}(\\d{1,3})[a-c]?(?:\\s*[–—-]\\s*(\\d{1,3})[a-c]?)?`;
        return new RegExp(pat, 'gi');
    }

    const CHAIN_CONT_RE = /^\s*[;,]\s*(?:(?:(\d{1,3})|([ivxlc]{1,7}))(?:\s*\(\d{1,3}\))?\s*[:.,]\s*)?(\d{1,3})[a-c]?(?:\s*[–—-]\s*(\d{1,3})[a-c]?)?/i;

    function findVerseMatchesInText(plainText, parsed, mode, cachedRegex) {
        if (!plainText || !parsed || !parsed.book) return [];
        if (mode !== 'ot' && !plainText.includes(String(parsed.chapter))) return [];
        const matchWholeChapter = parsed.verse == null;
        const startRe = cachedRegex || buildBookStartRegex(parsed.book, mode);
        startRe.lastIndex = 0;
        const hits = [];
        let m;

        while ((m = startRe.exec(plainText)) !== null) {
            let curCh = 0, vsStart = 0, vsEnd = 0;
            if (mode === 'ot') {
                curCh = m[1] ? parseInt(m[1], 10) : romanToInt(m[2]);
                vsStart = parseInt(m[3], 10);
                vsEnd = m[4] ? parseInt(m[4], 10) : vsStart;
            } else {
                curCh = parseInt(m[1], 10);
                vsStart = parseInt(m[2], 10);
                vsEnd = m[3] ? parseInt(m[3], 10) : vsStart;
            }

            if (curCh === parsed.chapter && (matchWholeChapter || (parsed.verse >= vsStart && parsed.verse <= vsEnd))) {
                hits.push({ start: m.index, end: m.index + m[0].length });
            }

            let cursor = m.index + m[0].length;
            let guard = 0;
            while (cursor < plainText.length && guard < 40) {
                guard++;
                const rest = plainText.slice(cursor, cursor + 36);
                const cm = rest.match(CHAIN_CONT_RE);
                if (!cm) break;
                if (cm[1]) curCh = parseInt(cm[1], 10);
                else if (cm[2]) curCh = romanToInt(cm[2]);
                const cVsStart = parseInt(cm[3], 10);
                const cVsEnd = cm[4] ? parseInt(cm[4], 10) : cVsStart;
                if (curCh === parsed.chapter && (matchWholeChapter || (parsed.verse >= cVsStart && parsed.verse <= cVsEnd))) {
                    const leadTrim = cm[0].match(/^[\s;,]+/);
                    const sIdx = cursor + (leadTrim ? leadTrim[0].length : 0);
                    hits.push({ start: sIdx, end: cursor + cm[0].length });
                }
                cursor += cm[0].length;
            }
        }
        return hits;
    }

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function stripTags(str) {
        return String(str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function buildHighlightedExcerpt(plainText, hits) {
        const first = hits[0];
        const winStart = Math.max(0, first.start - 85);
        const winEnd = Math.min(plainText.length, first.end + 135);
        let out = winStart > 0 ? '…' : '';
        let pos = winStart;
        hits.forEach((h) => {
            if (h.end <= winStart || h.start >= winEnd) return;
            const s = Math.max(pos, h.start);
            const e = Math.min(winEnd, h.end);
            if (s > pos) out += escapeHtml(plainText.slice(pos, s));
            out += `<mark class="lf-scripture-hit-mark">${escapeHtml(plainText.slice(s, e))}</mark>`;
            pos = e;
        });
        if (pos < winEnd) out += escapeHtml(plainText.slice(pos, winEnd));
        if (winEnd < plainText.length) out += '…';
        return out;
    }

    function scrollMarkIntoContainer(container, markEl) {
        if (!container || !markEl) return;
        let scroller = container;
        let cur = markEl.parentElement;
        while (cur && cur !== document.body) {
            const cs = getComputedStyle(cur);
            if (/(auto|scroll)/i.test(cs.overflowY) && cur.scrollHeight > cur.clientHeight + 8) {
                scroller = cur;
                break;
            }
            cur = cur.parentElement;
        }
        try {
            const sRect = scroller.getBoundingClientRect();
            const mRect = markEl.getBoundingClientRect();
            const targetTop = scroller.scrollTop + (mRect.top - sRect.top) - (scroller.clientHeight / 2) + (mRect.height / 2);
            scroller.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        } catch (e) {
            markEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function highlightAdjacentScriptureBadge(markEl) {
        if (!markEl) return;
        const badgeRe = /^(LXX|NT|OT|MT)$/i;
        let prev = markEl.previousElementSibling;
        if (!prev && markEl.parentElement && markEl.parentElement.previousElementSibling) {
            const parentTextOnly = (markEl.parentElement.textContent || '').trim();
            if (parentTextOnly === (markEl.textContent || '').trim()) {
                prev = markEl.parentElement.previousElementSibling;
            }
        }
        if (prev && badgeRe.test((prev.textContent || '').trim())) {
            prev.classList.add('lf-scripture-hit-badge');
        }
    }

    function highlightOpenedEntryContainer(container, parsed, mode) {
        if (!container || !parsed) return 0;

        container.querySelectorAll('.lf-scripture-hit-badge').forEach((b) => {
            b.classList.remove('lf-scripture-hit-badge');
        });
        container.querySelectorAll('mark.lf-scripture-hit-mark').forEach((mk) => {
            const p = mk.parentNode;
            if (!p) return;
            while (mk.firstChild) p.insertBefore(mk.firstChild, mk);
            mk.remove();
            p.normalize();
        });

        const textNodes = [];
        const tw = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
            acceptNode(n) {
                const p = n.parentElement;
                if (!p || /^(SCRIPT|STYLE|BUTTON|INPUT|SELECT|MARK)$/i.test(p.tagName)) return NodeFilter.FILTER_REJECT;
                if (p.closest('.lf-scripture-back-bar, .lf-verse-fallback-box, .lf-lsj-cite-jump-bar')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let node, full = '', prevParent = null;
        while ((node = tw.nextNode())) {
            const val = node.nodeValue || '';
            if (!val) continue;
            // Insert virtual space across different parent elements so adjacent tags never break \b word boundaries
            if (full.length > 0 && prevParent && prevParent !== node.parentElement) {
                if (!/\s/.test(full[full.length - 1]) && !/\s/.test(val[0])) {
                    full += ' ';
                }
            }
            const start = full.length;
            full += val;
            textNodes.push({ node, start, end: full.length });
            prevParent = node.parentElement;
        }

        const hits = findVerseMatchesInText(full, parsed, mode);
        if (!hits.length) return 0;

        // Deduplicate & merge any overlapping hit spans so each logical citation gets one clean group ID
        const orderedHits = hits
            .slice()
            .sort((a, b) => a.start - b.start || b.end - a.end);
        const cleanHits = [];
        for (let i = 0; i < orderedHits.length; i++) {
            const h = orderedHits[i];
            const prev = cleanHits[cleanHits.length - 1];
            if (prev && h.start < prev.end) {
                if (h.end > prev.end) prev.end = h.end;
            } else {
                cleanHits.push({ start: h.start, end: h.end });
            }
        }

        for (let i = cleanHits.length - 1; i >= 0; i--) {
            const { start, end } = cleanHits[i];
            for (let j = textNodes.length - 1; j >= 0; j--) {
                const tn = textNodes[j];
                if (tn.end <= start || tn.start >= end) continue;
                const lStart = Math.max(0, start - tn.start);
                const lEnd = Math.min(tn.node.nodeValue.length, end - tn.start);
                if (lEnd <= lStart) continue;
                let target = tn.node;
                if (lEnd < target.nodeValue.length) target.splitText(lEnd);
                if (lStart > 0) target = target.splitText(lStart);
                const mk = document.createElement('mark');
                mk.className = 'lf-scripture-hit-mark';
                mk.dataset.lfHitGroup = String(i);
                mk.title = `Matched Scripture: ${parsed.label}`;
                target.parentNode.insertBefore(mk, target);
                mk.appendChild(target);
                highlightAdjacentScriptureBadge(mk);
            }
        }

        const groups = getDistinctCitationGroups(container);
        if (groups.length) {
            focusCitationGroup(container, groups, 0);
        }
        return groups.length;
    }

    function getDistinctCitationGroups(container) {
        if (!container) return [];
        const allMarks = Array.from(container.querySelectorAll('mark.lf-scripture-hit-mark'));
        const byGroup = new Map();
        const groups = [];

        allMarks.forEach((mk, idx) => {
            const gid = mk.dataset.lfHitGroup != null ? `g_${mk.dataset.lfHitGroup}` : `u_${idx}`;
            let entry = byGroup.get(gid);
            if (!entry) {
                entry = { id: gid, marks: [], anchor: mk };
                byGroup.set(gid, entry);
                groups.push(entry);
            }
            entry.marks.push(mk);
        });

        // Safety merge: if two groups share the exact same visual position (e.g., nested/duplicate spans), collapse them
        const deduped = [];
        for (let i = 0; i < groups.length; i++) {
            const g = groups[i];
            const rect = g.anchor.getBoundingClientRect();
            const prev = deduped[deduped.length - 1];
            if (prev && rect.width > 0 && rect.height > 0) {
                const prevLastRect = prev.marks[prev.marks.length - 1].getBoundingClientRect();
                const sameLine = Math.abs(rect.top - prevLastRect.top) < 6;
                const touching = rect.left >= prevLastRect.left - 4 && (rect.left - prevLastRect.right) < 12;
                if (sameLine && touching) {
                    prev.marks.push(...g.marks);
                    continue;
                }
            }
            deduped.push(g);
        }
        return deduped;
    }

    function focusCitationGroup(container, groups, idx) {
        if (!container || !groups || !groups.length) return;
        const safeIdx = ((idx % groups.length) + groups.length) % groups.length;
        container.querySelectorAll('mark.lf-scripture-hit-active').forEach((m) => {
            m.classList.remove('lf-scripture-hit-active');
        });
        const targetGroup = groups[safeIdx];
        targetGroup.marks.forEach((m) => m.classList.add('lf-scripture-hit-active'));
        requestAnimationFrame(() => scrollMarkIntoContainer(container, targetGroup.anchor));
    }

    function openIdb(name) {
        return new Promise((resolve) => {
            try {
                const req = indexedDB.open(name);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            } catch (e) { resolve(null); }
        });
    }

    function readIdbStoreEntries(db, storeName) {
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const vReq = store.getAll();
                const kReq = store.getAllKeys();
                let vals = null, keys = null;
                const done = () => { if (vals !== null && keys !== null) resolve({ keys, vals }); };
                vReq.onsuccess = () => { vals = vReq.result || []; done(); };
                kReq.onsuccess = () => { keys = kReq.result || []; done(); };
                vReq.onerror = kReq.onerror = () => resolve({ keys: [], vals: [] });
            } catch (e) { resolve({ keys: [], vals: [] }); }
        });
    }

    async function decodeBinaryToText(val) {
        let bytes = null;
        if (typeof Blob !== 'undefined' && val instanceof Blob) {
            bytes = new Uint8Array(await val.arrayBuffer());
        } else if (val instanceof ArrayBuffer) {
            bytes = new Uint8Array(val);
        } else if (ArrayBuffer.isView(val)) {
            bytes = new Uint8Array(val.buffer, val.byteOffset, val.byteLength);
        }
        if (!bytes || !bytes.length) return '';
        if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
            try {
                const ds = new DecompressionStream('gzip');
                const stream = new Blob([bytes]).stream().pipeThrough(ds);
                return await new Response(stream).text();
            } catch (e) {}
        }
        try { return new TextDecoder('utf-8').decode(bytes); } catch (e) { return ''; }
    }

    function extractTextFromObj(val) {
        if (typeof val === 'string') return val;
        if (!val || typeof val !== 'object') return '';
        const fields = [
            val.entry, val.text, val.html, val.xml, val.definition, val.def, val.body,
            val.content, val.abbottSmith, val.abbott_smith, val.gesenius, val.bdb,
            val.strongs_def, val.kjv_def, val.senses ? JSON.stringify(val.senses) : ''
        ].filter(Boolean);
        return fields.length ? fields.join(' ') : JSON.stringify(val);
    }

    function isValidStrongGreek(code) {
        return /^[Gg]0*\d{1,4}[a-z]?$/i.test(String(code || '').trim());
    }

    function getGreekMeta(strongCode) {
        if (!isValidStrongGreek(strongCode)) return { strongs: '', headword: String(strongCode || ''), translit: '' };
        const norm = 'G' + String(strongCode).trim().replace(/^[Gg]0*/, '').toUpperCase();
        const byStrong = (typeof scriptureDataCache !== 'undefined' && scriptureDataCache.thayersByStrong) || {};
        if (byStrong[norm]) {
            return { strongs: norm, headword: byStrong[norm].lemma || norm, translit: byStrong[norm].translit || '' };
        }
        if (typeof strongsGreekDictionary !== 'undefined') {
            const raw = strongsGreekDictionary[norm] || strongsGreekDictionary[strongCode];
            if (raw) return { strongs: norm, headword: raw.lemma || norm, translit: raw.translit || '' };
        }
        return { strongs: norm, headword: norm, translit: '' };
    }

    function getHebrewMeta(strongCode, fallbackHead) {
        const isValid = /^[Hh]0*\d{1,4}[a-z]?$/i.test(String(strongCode || '').trim());
        const norm = isValid ? ('H' + String(strongCode).trim().replace(/^[Hh]0*/, '').toUpperCase()) : '';
        if (norm && typeof strongsHebrewDictionary !== 'undefined') {
            const raw = strongsHebrewDictionary[norm] || strongsHebrewDictionary[strongCode];
            if (raw) return { strongs: norm, headword: raw.lemma || fallbackHead || norm, translit: raw.xlit || raw.translit || '' };
        }
        return { strongs: norm, headword: fallbackHead || norm || 'Entry', translit: '' };
    }

    function parseXmlEntries(xmlStr, kind, onRecord) {
        const entryRe = /<(?:entryFree|entry)\b([^>]*)>([\s\S]*?)<\/(?:entryFree|entry)>/gi;
        let m, foundAny = false;
        while ((m = entryRe.exec(xmlStr)) !== null) {
            foundAny = true;
            const attrs = m[1] || '';
            const inner = m[2] || '';
            if (kind === 'lsj') {
                const orthMatch = inner.match(/<orth\b[^>]*>([\s\S]*?)<\/orth>/i);
                const keyMatch = attrs.match(/\bkey\s*=\s*["']([^"']+)["']/i);
                const head = orthMatch ? stripTags(orthMatch[1]).replace(/[,;·]+$/, '') : (keyMatch ? keyMatch[1].replace(/\d+$/, '') : 'LSJ Entry');
                onRecord({ lexicon: 'lsj', headword: head, translit: '', strongs: '', queryTerm: head, badge: 'LSJ', plainText: stripTags(inner) });
            } else {
                const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
                const strongMatch = (attrs + ' ' + inner).match(/\b(?:strong|H)\s*=?\s*["']?H?0*(\d{1,4})\b/i);
                const wMatch = inner.match(/<w\b[^>]*>([\s\S]*?)<\/w>/i);
                const bdbId = idMatch ? idMatch[1] : '';
                const strongCode = strongMatch ? ('H' + strongMatch[1]) : '';
                const meta = getHebrewMeta(strongCode, wMatch ? stripTags(wMatch[1]) : bdbId);
                onRecord({
                    lexicon: kind,
                    headword: meta.headword,
                    translit: meta.translit,
                    strongs: meta.strongs,
                    queryTerm: meta.strongs || bdbId || meta.headword,
                    badge: meta.strongs || bdbId,
                    plainText: stripTags(inner)
                });
            }
        }
        return foundAny;
    }

    async function unpackAnyContainer(container, kind, onRecord, depth = 0) {
        if (!container || depth > 4) return;

        if ((typeof Blob !== 'undefined' && container instanceof Blob) || container instanceof ArrayBuffer || ArrayBuffer.isView(container)) {
            const decoded = await decodeBinaryToText(container);
            if (decoded) await unpackAnyContainer(decoded, kind, onRecord, depth + 1);
            return;
        }

        if (typeof container === 'string') {
            const trimmed = container.trim();
            if (!trimmed || trimmed.length < 10) return;
            if (trimmed.includes('<entryFree') || trimmed.includes('<entry')) {
                if (parseXmlEntries(trimmed, kind, onRecord)) return;
            }
            if ((trimmed[0] === '{' || trimmed[0] === '[') && trimmed.length > 30) {
                try {
                    const parsedJson = JSON.parse(trimmed);
                    await unpackAnyContainer(parsedJson, kind, onRecord, depth + 1);
                    return;
                } catch (e) {}
            }
            return;
        }

        if (container instanceof Map) {
            for (const [k, v] of container.entries()) {
                if (typeof v === 'object' && v && (Array.isArray(v) || v instanceof Map || v instanceof Blob || v instanceof ArrayBuffer)) {
                    await unpackAnyContainer(v, kind, onRecord, depth + 1);
                    continue;
                }
                const txt = stripTags(extractTextFromObj(v));
                if (!txt) continue;
                emitSingleObject(k, v, txt, kind, onRecord);
            }
            return;
        }

        if (Array.isArray(container)) {
            for (let i = 0; i < container.length; i++) {
                const item = container[i];
                if (!item) continue;
                if (typeof item === 'string' && (item.includes('<entry') || item.trim()[0] === '{')) {
                    await unpackAnyContainer(item, kind, onRecord, depth + 1);
                } else if (typeof item === 'object') {
                    const txt = stripTags(extractTextFromObj(item));
                    if (!txt) continue;
                    emitSingleObject('', item, txt, kind, onRecord);
                }
            }
            return;
        }

        if (typeof container === 'object') {
            const keys = Object.keys(container);
            const wrapperProps = ['entries', 'data', 'xml', 'json', 'payload', 'blob', 'buffer', 'compressed', 'raw', 'items', 'words', 'lemmas', 'dict', 'map', 'content', 'text', 'html'];
            if (keys.length <= 12) {
                let unpackedWrapper = false;
                for (const prop of wrapperProps) {
                    const sub = container[prop];
                    if (!sub) continue;
                    if (
                        Array.isArray(sub) || sub instanceof Map ||
                        (typeof Blob !== 'undefined' && sub instanceof Blob) ||
                        sub instanceof ArrayBuffer || ArrayBuffer.isView(sub) ||
                        (typeof sub === 'object' && Object.keys(sub).length > 10) ||
                        (typeof sub === 'string' && (sub.includes('<entry') || sub.trim()[0] === '{' || sub.trim()[0] === '['))
                    ) {
                        unpackedWrapper = true;
                        await unpackAnyContainer(sub, kind, onRecord, depth + 1);
                    }
                }
                if (unpackedWrapper) return;
                const txt = stripTags(extractTextFromObj(container));
                if (txt.length >= 10) emitSingleObject('', container, txt, kind, onRecord);
                return;
            }

            for (let i = 0; i < keys.length; i++) {
                const k = keys[i];
                const v = container[k];
                if (!v) continue;
                if (typeof v === 'string' && (v.includes('<entryFree') || v.includes('<entry'))) {
                    parseXmlEntries(v, kind, onRecord);
                    continue;
                }
                const txt = stripTags(extractTextFromObj(v));
                if (!txt || txt.length < 8) continue;
                emitSingleObject(k, v, txt, kind, onRecord);
            }
        }
    }

    function emitSingleObject(fallbackKey, v, txt, kind, onRecord) {
        const obj = (v && typeof v === 'object') ? v : {};
        if (kind === 'abbott') {
            const rawKey = String(fallbackKey || '').trim();
            const keyStrong = isValidStrongGreek(rawKey) ? rawKey : '';
            const objStrong = isValidStrongGreek(obj.strongs || obj.strong) ? (obj.strongs || obj.strong) : '';
            const validStrong = keyStrong || objStrong;
            if (!validStrong && rawKey && !obj.lemma && !obj.headword) return;
            const meta = validStrong ? getGreekMeta(validStrong) : { strongs: '', headword: obj.lemma || obj.headword || rawKey, translit: '' };
            onRecord({
                lexicon: 'abbott',
                headword: obj.lemma || obj.headword || obj.word || meta.headword,
                translit: obj.translit || meta.translit,
                strongs: meta.strongs,
                queryTerm: meta.strongs || rawKey,
                badge: meta.strongs || rawKey,
                plainText: txt
            });
        } else if (kind === 'lsj') {
            const hw = obj.orth || obj.lemma || obj.headword || obj.word || obj.head || obj.key || fallbackKey || 'LSJ Entry';
            onRecord({
                lexicon: 'lsj',
                headword: String(hw).replace(/[,;·]+$/, '').trim(),
                translit: '',
                strongs: '',
                queryTerm: String(hw).replace(/[,;·]+$/, '').trim(),
                badge: 'LSJ',
                plainText: txt
            });
        } else {
            const rawKey = String(fallbackKey || '').trim();
            const st = /^[Hh]0*\d+$/i.test(rawKey) ? rawKey.toUpperCase() : (obj.strongs || obj.strong || '');
            const hw = obj.lemma || obj.headword || obj.word || obj.hebrew || '';
            const meta = getHebrewMeta(st, hw || rawKey);
            onRecord({
                lexicon: kind,
                headword: meta.headword,
                translit: obj.translit || obj.xlit || meta.translit,
                strongs: meta.strongs,
                queryTerm: meta.strongs || obj.id || rawKey || meta.headword,
                badge: meta.strongs || obj.id || rawKey,
                plainText: txt
            });
        }
    }

    async function scanOneLexicon(parsed, kind) {
        const mode = LEXICON_META[kind].mode;
        const startRe = buildBookStartRegex(parsed.book, mode);
        const results = [];
        const seen = new Set();
        let scannedCount = 0;

        const evaluateRecord = (rec) => {
            scannedCount++;
            if (!rec || !rec.plainText) return;
            const hits = findVerseMatchesInText(rec.plainText, parsed, mode, startRe);
            if (!hits.length) return;
            const key = `${rec.headword}|${rec.badge}`.toLowerCase();
            const textSig = `txt:${rec.plainText.slice(0, 90).toLowerCase()}`;
            if (seen.has(key) || seen.has(textSig)) return;
            seen.add(key);
            seen.add(textSig);
            results.push({
                ...rec,
                lexicon: kind,
                hitCount: hits.length,
                excerptHtml: buildHighlightedExcerpt(rec.plainText, hits)
            });
        };

        if (kind === 'abbott') {
            if (typeof getThayersEntries === 'function') await getThayersEntries();
            let map = (typeof scriptureDataCache !== 'undefined' && scriptureDataCache.abbottSmithByStrong) || null;
            if (!map && typeof ensureAbbottSmithLoaded === 'function') map = await ensureAbbottSmithLoaded();
            if (!map && typeof getCachedFileData === 'function') map = await getCachedFileData('abbott_smith_map_v1');
            if (map) await unpackAnyContainer(map, 'abbott', evaluateRecord);
        } else if (kind === 'bdb' || kind === 'gesenius') {
            const loaders = kind === 'gesenius'
                ? ['ensureGeseniusLoaded', 'loadGeseniusLexicon', 'getGeseniusEntries']
                : ['ensureBdbLoaded', 'loadBdbLexicon', 'getBdbEntries', 'loadBdbXmlData'];
            for (const fn of loaders) {
                try { if (typeof window[fn] === 'function') await window[fn](); } catch (e) {}
            }
            const keyRe = kind === 'gesenius' ? /gesen/i : /bdb(?!t)/i;
            if (typeof scriptureDataCache !== 'undefined') {
                for (const k of Object.keys(scriptureDataCache)) {
                    if (keyRe.test(k) && scriptureDataCache[k]) {
                        await unpackAnyContainer(scriptureDataCache[k], kind, evaluateRecord);
                    }
                }
            }
            const db = await openIdb('LexFlowCleanCacheV3');
            if (db && db.objectStoreNames.contains('files')) {
                const { keys, vals } = await readIdbStoreEntries(db, 'files');
                for (let i = 0; i < keys.length; i++) {
                    if (keyRe.test(String(keys[i]))) {
                        await unpackAnyContainer(vals[i], kind, evaluateRecord);
                    }
                }
                db.close();
            }
        } else if (kind === 'lsj') {
            if (typeof scriptureDataCache !== 'undefined') {
                for (const k of Object.keys(scriptureDataCache)) {
                    if (/lsj/i.test(k) && scriptureDataCache[k]) {
                        await unpackAnyContainer(scriptureDataCache[k], 'lsj', evaluateRecord);
                    }
                }
            }
            const mainDb = await openIdb('LexFlowCleanCacheV3');
            if (mainDb && mainDb.objectStoreNames.contains('files')) {
                const { keys, vals } = await readIdbStoreEntries(mainDb, 'files');
                for (let i = 0; i < keys.length; i++) {
                    if (/lsj/i.test(String(keys[i]))) {
                        await unpackAnyContainer(vals[i], 'lsj', evaluateRecord);
                    }
                }
                mainDb.close();
            }
            if (window.indexedDB && typeof indexedDB.databases === 'function') {
                const dbs = await indexedDB.databases();
                for (let d = 0; d < dbs.length; d++) {
                    const name = dbs[d].name;
                    if (!name || name === 'LexFlowCleanCacheV3') continue;
                    if (!/lsj|perseus|celano|greek/i.test(name)) continue;
                    const db = await openIdb(name);
                    if (!db) continue;
                    const stores = Array.from(db.objectStoreNames);
                    for (let s = 0; s < stores.length; s++) {
                        const { vals } = await readIdbStoreEntries(db, stores[s]);
                        for (let i = 0; i < vals.length; i++) {
                            await unpackAnyContainer(vals[i], 'lsj', evaluateRecord);
                            if (i % 4 === 0) await new Promise((r) => setTimeout(r, 0));
                        }
                    }
                    db.close();
                }
            }
        }

        results.sort((a, b) => b.hitCount - a.hitCount);
        return { kind, results, scannedCount };
    }

    async function scanAllLexicons(parsed) {
        const order = ['abbott', 'bdb', 'gesenius', 'lsj'];
        const byLexicon = {};
        const allResults = [];
        for (const kind of order) {
            const res = await scanOneLexicon(parsed, kind);
            byLexicon[kind] = res;
            allResults.push(...res.results);
            await new Promise((r) => setTimeout(r, 0));
        }
        return { parsed, order, byLexicon, allResults };
    }

    // -------------------------------------------------------------------------
    // VERSE-WORDS FALLBACK FOR ENGLISH -> GREEK LOOKUPS
    // -------------------------------------------------------------------------
    let greekLemmaToStrongMap = null;
    const MINOR_GREEK_STRONGS = new Set(['G3588', 'G2532', 'G1161', 'G1722', 'G1519', 'G1537', 'G575', 'G1223', 'G1909', 'G4314', 'G3326', 'G3754', 'G1063', 'G3739', 'G846']);

    function getGreekLemmaMap() {
        if (greekLemmaToStrongMap) return greekLemmaToStrongMap;
        greekLemmaToStrongMap = new Map();
        if (typeof strongsGreekDictionary !== 'undefined' && typeof normalizeGreekWord === 'function') {
            Object.keys(strongsGreekDictionary).forEach((code) => {
                const item = strongsGreekDictionary[code];
                if (!item || !item.lemma) return;
                const normCode = 'G' + code.replace(/^[Gg]0*/, '').toUpperCase();
                const normLem = normalizeGreekWord(item.lemma);
                if (normLem && !greekLemmaToStrongMap.has(normLem)) {
                    greekLemmaToStrongMap.set(normLem, {
                        strongs: normCode,
                        lemma: item.lemma,
                        gloss: (item.strongs_def || item.kjv_def || '').replace(/^:\s*--+/, '').trim()
                    });
                }
            });
        }
        return greekLemmaToStrongMap;
    }

    function resolveGreekTokenInfo(tok) {
        const map = getGreekLemmaMap();
        let strongs = isValidStrongGreek(tok.strongs) ? ('G' + tok.strongs.replace(/^[Gg]0*/, '').toUpperCase()) : '';
        let gloss = '';

        if (strongs && typeof strongsGreekDictionary !== 'undefined') {
            const raw = strongsGreekDictionary[strongs];
            if (raw) gloss = (raw.strongs_def || raw.kjv_def || '').replace(/^:\s*--+/, '').trim();
        }
        if (!strongs && typeof normalizeGreekWord === 'function') {
            const norm = normalizeGreekWord(tok.lemma || tok.surface);
            const hit = norm && map.get(norm);
            if (hit) {
                strongs = hit.strongs;
                gloss = hit.gloss;
            }
        }
        if (gloss.length > 52) gloss = gloss.slice(0, 49).trim() + '…';
        return {
            surface: tok.surface || tok.lemma || '',
            lemma: tok.lemma || tok.surface || '',
            strongs,
            gloss,
            isMinor: strongs ? MINOR_GREEK_STRONGS.has(strongs) : false
        };
    }

    function getLockedSideBySideGreekWord() {
        const bar = document.getElementById('parallelHoverInfoBar');
        if (!bar) return null;
        const txt = bar.textContent || '';
        if (!/Word Locked/i.test(txt)) return null;
        const stMatch = txt.match(/\b(G\d{1,4})\b/i);
        const grMatch = txt.match(/[\u0370-\u03FF\u1F00-\u1FFF]+/);
        if (!stMatch && !grMatch) return null;
        return {
            strongs: stMatch ? stMatch[1].toUpperCase() : '',
            surface: grMatch ? grMatch[0] : ''
        };
    }

    function getActiveNtClauseVerse() {
        const blk =
            (typeof activeThayersClauseBlock !== 'undefined' && activeThayersClauseBlock) ||
            (typeof lastSelectedBlock !== 'undefined' && lastSelectedBlock) ||
            (typeof findTopVisibleVerseBlock === 'function' ? findTopVisibleVerseBlock() : null);

        if (blk && blk.dataset && blk.dataset.bookNum && blk.dataset.chapterNum && blk.dataset.verseNum) {
            const book = parseInt(blk.dataset.bookNum, 10);
            const chapter = parseInt(blk.dataset.chapterNum, 10);
            const verse = parseInt(blk.dataset.verseNum, 10);
            const bookName = blk.dataset.bookName || (BOOKS.find((b) => b.num === book)?.name || '');
            if (book >= 40 && chapter && verse) return { book, chapter, verse, label: `${bookName} ${chapter}:${verse}` };
        }
        if (typeof parseCurrentRefRange === 'function') {
            const ref = parseCurrentRefRange(blk);
            if (ref && ref.book >= 40) {
                const bookName = BOOKS.find((b) => b.num === ref.book)?.name || '';
                return { book: ref.book, chapter: ref.chapter, verse: ref.startVerse, label: `${bookName} ${ref.chapter}:${ref.startVerse}` };
            }
        }
        return null;
    }

    async function maybeInjectGreekVerseFallback() {
        const gntModal = document.getElementById('thayersModal');
        const gntInput = document.getElementById('thayersSearchInput');
        const container = document.getElementById('thayersResultsContainer');
        if (!gntModal || !gntInput || !container) return;

        const fieldSel = gntModal.querySelector('.lf-field-select[data-modal="gnt"]');
        if (fieldSel && fieldSel.value === 'scripture') return;

        const queryRaw = (gntInput.value || '').trim();
        if (!queryRaw || isValidStrongGreek(queryRaw) || /[\u0370-\u03FF\u1F00-\u1FFF]/.test(queryRaw)) return;

        const alreadyInVerse =
            (typeof currentThayersState !== 'undefined' && currentThayersState && currentThayersState.inCurrentVerse) ||
            /USED IN THIS VERSE/i.test(container.textContent || '');
        if (alreadyInVerse) return;

        const ref = getActiveNtClauseVerse();
        if (!ref || typeof getSrgntTokensForSingleVerse !== 'function') return;

        const rawTokens = await getSrgntTokensForSingleVerse(ref.book, ref.chapter, ref.verse);
        if (!rawTokens || !rawTokens.length) return;

        const locked = getLockedSideBySideGreekWord();
        const tokens = rawTokens.filter((t) => t && t.surface).map(resolveGreekTokenInfo);
        if (!tokens.length) return;

        const entryPanel = document.getElementById('thayersEntryTabPanel') || container;
        const oldBox = entryPanel.querySelector('.lf-verse-fallback-box');
        if (oldBox) oldBox.remove();

        const box = document.createElement('div');
        box.className = 'lf-verse-fallback-box p-3.5 rounded-xl bg-amber-50/95 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2.5';

        const lockedBtnHtml = (locked && (locked.strongs || locked.surface))
            ? `<button type="button" class="lf-jump-locked-btn px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-sm cursor-pointer">
                    Open Locked Side-by-Side: ${escapeHtml(locked.surface || locked.strongs)} ${locked.strongs ? `(${escapeHtml(locked.strongs)})` : ''} →
               </button>`
            : '';

        const chipsHtml = tokens.map((tok, idx) => {
            const isLockedChip = locked && ((locked.strongs && tok.strongs === locked.strongs) || (locked.surface && tok.surface === locked.surface));
            const borderCls = isLockedChip
                ? 'border-purple-500 ring-1 ring-purple-400 bg-purple-50 dark:bg-purple-950/60'
                : (tok.isMinor ? 'border-amber-200/70 bg-white/60 dark:bg-zinc-900/60 opacity-75' : 'border-amber-300 bg-white dark:bg-zinc-800 hover:border-purple-500');
            return `
                <button type="button" class="lf-verse-tok-chip text-left px-2.5 py-1.5 rounded-lg border ${borderCls} transition shadow-xs cursor-pointer" data-tok-idx="${idx}" title="${escapeHtml(tok.gloss || tok.lemma)}">
                    <div class="flex items-center gap-1.5">
                        <span class="font-serif font-bold text-sm text-gray-900 dark:text-white">${escapeHtml(tok.surface)}</span>
                        ${tok.strongs ? `<span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">${escapeHtml(tok.strongs)}</span>` : ''}
                        ${isLockedChip ? `<span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white">Locked</span>` : ''}
                    </div>
                    ${tok.gloss && !tok.isMinor ? `<div class="text-[10px] text-gray-600 dark:text-gray-300 leading-tight mt-0.5 max-w-[175px] truncate">${escapeHtml(tok.gloss)}</div>` : ''}
                </button>`;
        }).join('');

        box.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="text-xs font-bold text-amber-950 dark:text-amber-200">
                    <i class="fa-solid fa-triangle-exclamation text-amber-600 mr-1.5"></i>
                    No Greek word in <span class="underline">${escapeHtml(ref.label)}</span> matched the English gloss “${escapeHtml(queryRaw)}”. Pick the exact Greek word from ${escapeHtml(ref.label)}:
                </div>
                ${lockedBtnHtml}
            </div>
            <div class="flex flex-wrap gap-1.5">${chipsHtml}</div>
        `;

        const openGreekChoice = (strongs, lemma, rawTok) => {
            if (strongs && typeof openRelatedStrongEntry === 'function') {
                gntInput.value = strongs;
                openRelatedStrongEntry(strongs);
            } else {
                gntInput.value = strongs || lemma;
                if (typeof executeThayersSearch === 'function') executeThayersSearch(rawTok || null);
            }
        };

        box.querySelector('.lf-jump-locked-btn')?.addEventListener('click', () => {
            openGreekChoice(locked.strongs, locked.surface, null);
        });

        box.querySelectorAll('.lf-verse-tok-chip').forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.tokIdx, 10);
                const tok = tokens[idx];
                if (!tok) return;
                openGreekChoice(tok.strongs, tok.lemma, rawTokens[idx]);
            });
        });

        entryPanel.prepend(box);
    }

    function hookGreekLookupFallback() {
        if (typeof window.executeThayersSearch === 'function' && !window.executeThayersSearch.__lfFallbackWrapped) {
            const origExec = window.executeThayersSearch;
            window.executeThayersSearch = async function (...args) {
                const res = await origExec.apply(this, args);
                try { await maybeInjectGreekVerseFallback(); } catch (e) {}
                return res;
            };
            window.executeThayersSearch.__lfFallbackWrapped = true;
        }
        if (typeof window.renderCurrentThayersView === 'function' && !window.renderCurrentThayersView.__lfFallbackWrapped) {
            const origRender = window.renderCurrentThayersView;
            window.renderCurrentThayersView = function (...args) {
                const res = origRender.apply(this, args);
                setTimeout(() => { maybeInjectGreekVerseFallback().catch(() => {}); }, 20);
                return res;
            };
            window.renderCurrentThayersView.__lfFallbackWrapped = true;
        }
    }

    // -------------------------------------------------------------------------
    // STYLES
    // -------------------------------------------------------------------------
    const oldStyle = document.getElementById('lfScriptureFieldStyles');
    if (oldStyle) oldStyle.remove();
    const styleEl = document.createElement('style');
    styleEl.id = 'lfScriptureFieldStyles';
    styleEl.textContent = `
        @keyframes lfScriptureHitPulse {
            0% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.72), 0 0 18px rgba(245, 158, 11, 0.55); }
            100% { box-shadow: 0 0 0 2px #f59e0b, 0 2px 6px rgba(245, 158, 11, 0.30); }
        }
        mark.lf-scripture-hit-mark,
        .lf-scripture-hit-badge {
            background: #fde047 !important;
            color: #1c1917 !important;
            font-weight: 800 !important;
            padding: 1px 5px !important;
            border-radius: 5px !important;
            border-bottom: 2px solid #d97706 !important;
            box-shadow: 0 0 0 2px #f59e0b, 0 2px 6px rgba(245, 158, 11, 0.30) !important;
            animation: lfScriptureHitPulse 1.3s ease-out 1 !important;
        }
        mark.lf-scripture-hit-mark.lf-scripture-hit-active {
            background: #fbbf24 !important;
            box-shadow: 0 0 0 3px #b45309, 0 4px 14px rgba(217, 119, 6, 0.45) !important;
        }
        .lf-lsj-cite-jump-bar {
            position: sticky;
            top: 0;
            z-index: 5;
            margin-bottom: 10px;
            padding: 7px 12px;
            border-radius: 10px;
            background: #fef9c3;
            border: 1px solid #f59e0b;
            color: #78350f;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        html.dark .lf-lsj-cite-jump-bar {
            background: #422006;
            border-color: #d97706;
            color: #fef08a;
        }
        .lf-lsj-cite-jump-bar button {
            padding: 3px 9px;
            border-radius: 7px;
            border: 1px solid #d97706;
            background: #ffffff;
            color: #78350f;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
        }
        html.dark .lf-lsj-cite-jump-bar button {
            background: #27272a;
            color: #fef08a;
            border-color: #eab308;
        }
        .lf-field-wrap { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .lf-field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
        html.dark .lf-field-label { color: #9ca3af; }
        .lf-field-select {
            font-size: 12px; font-weight: 700; padding: 7px 10px; border-radius: 8px;
            border: 1.5px solid #cbd5e1; background: #f8fafc; color: #1e293b; cursor: pointer; outline: none;
        }
        html.dark .lf-field-select { background: #27272a; border-color: #3f3f46; color: #f4f4f5; }
        .lf-field-select.lf-scripture-active { background: #fef9c3; border-color: #eab308; color: #854d0e; }
        html.dark .lf-field-select.lf-scripture-active { background: #422006; border-color: #eab308; color: #fef08a; }
        .lf-lex-tab-btn {
            padding: 5px 11px; border-radius: 999px; font-size: 12px; font-weight: 700;
            border: 1px solid #e2e8f0; background: #ffffff; color: #475569; cursor: pointer;
            transition: all 0.12s ease; display: inline-flex; align-items: center; gap: 6px;
        }
        html.dark .lf-lex-tab-btn { background: #27272a; border-color: #3f3f46; color: #d4d4d8; }
        .lf-lex-tab-btn.active { background: #ca8a04; border-color: #a16207; color: #ffffff; }
        .lf-lex-tab-count {
            font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 999px;
            background: rgba(15, 23, 42, 0.08);
        }
        .lf-lex-tab-btn.active .lf-lex-tab-count { background: rgba(255, 255, 255, 0.25); color: #ffffff; }
    `;
    document.head.appendChild(styleEl);

    // -------------------------------------------------------------------------
    // GLOBAL REGISTRY OF MODALS + TABBED SCRIPTURE RESULTS RENDERER
    // -------------------------------------------------------------------------
    const modalContexts = {};
    const bypassFlag = { gnt: false, hebrew: false, lsj: false };
    let lastGlobalSearch = null;
    let activeResultTab = 'all';

    function hideWorkspaceVerseBridgeBars() {
        const hb = document.getElementById('bdbVerseHebrewBar');
        const gb = document.getElementById('thayersVerseGreekBar');
        if (hb) hb.classList.add('hidden');
        if (gb) gb.classList.add('hidden');
    }

    function renderTabbedResultsUI(modalType, ctx, searchBundle, selectedTab) {
        const container = ctx.getResultsContainer();
        if (!container || !searchBundle) return;

        hideWorkspaceVerseBridgeBars();
        if (modalType === 'gnt') {
            const nav = document.getElementById('thayersNavTabsBar');
            if (nav) nav.classList.add('hidden');
        } else if (modalType === 'hebrew') {
            const nav = document.getElementById('bdbNavTabsBar');
            if (nav) nav.classList.add('hidden');
        }

        const { parsed, order, byLexicon, allResults } = searchBundle;
        activeResultTab = selectedTab || 'all';
        lastGlobalSearch = searchBundle;

        const tabsHtml = [
            `<button type="button" class="lf-lex-tab-btn ${activeResultTab === 'all' ? 'active' : ''}" data-tab="all">
                <span>All Lexicons</span><span class="lf-lex-tab-count">${allResults.length}</span>
            </button>`,
            ...order.map((k) => {
                const cnt = byLexicon[k].results.length;
                return `<button type="button" class="lf-lex-tab-btn ${activeResultTab === k ? 'active' : ''}" data-tab="${k}">
                    <span>${LEXICON_META[k].label}</span><span class="lf-lex-tab-count">${cnt}</span>
                </button>`;
            })
        ].join('');

        const activeItems = activeResultTab === 'all' ? allResults : (byLexicon[activeResultTab]?.results || []);
        const totalScanned = activeResultTab === 'all'
            ? order.reduce((sum, k) => sum + byLexicon[k].scannedCount, 0)
            : (byLexicon[activeResultTab]?.scannedCount || 0);

        let cardsHtml = '';
        if (!activeItems.length) {
            const tabLabel = activeResultTab === 'all' ? 'any cached lexicon' : LEXICON_META[activeResultTab].full;
            const zeroHint = totalScanned === 0
                ? `<div class="mt-1.5 text-xs opacity-85">This lexicon hasn't been cached in memory yet—open 1 word in <strong>${escapeHtml(tabLabel)}</strong> once to cache it, then search again.</div>`
                : '';
            cardsHtml = `
                <div class="p-5 rounded-xl bg-amber-50/90 dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-sm text-amber-900 dark:text-amber-200">
                    <div>No references to <strong>${escapeHtml(parsed.label)}</strong> were found in <strong>${escapeHtml(tabLabel)}</strong> (${totalScanned.toLocaleString()} entries scanned).</div>
                    ${zeroHint}
                </div>`;
        } else {
            cardsHtml = activeItems.slice(0, 150).map((item, idx) => {
                const meta = LEXICON_META[item.lexicon];
                return `
                    <div class="lf-scripture-hit-card p-4 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 hover:border-amber-500 shadow-sm transition cursor-pointer" data-hit-idx="${idx}">
                        <div class="flex items-center justify-between gap-2 mb-1.5">
                            <div class="flex items-center flex-wrap gap-2">
                                <span style="background:${meta.chipBg};color:${meta.chipText};border:1px solid ${meta.chipBorder};font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;">${meta.label}</span>
                                <span class="text-lg font-serif font-bold text-gray-900 dark:text-white">${escapeHtml(item.headword)}</span>
                                ${item.translit ? `<span class="text-xs italic text-gray-500 dark:text-gray-400">(${escapeHtml(item.translit)})</span>` : ''}
                                ${item.badge && item.badge !== 'LSJ' ? `<span class="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200">${escapeHtml(item.badge)}</span>` : ''}
                            </div>
                            <span class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">Open in ${meta.label} →</span>
                        </div>
                        <div class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">${item.excerptHtml}</div>
                    </div>`;
            }).join('');
        }

        container.innerHTML = `
            <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                        <i class="fa-solid fa-book-bible mr-1.5 text-amber-600"></i>
                        All-Lexicon Scripture Search: <span class="underline">${escapeHtml(parsed.label)}</span>
                    </div>
                    <span class="text-[11px] text-amber-800 dark:text-amber-300">Scanned ${totalScanned.toLocaleString()} entries • Click any card to open</span>
                </div>
                <div class="flex flex-wrap items-center gap-1.5">${tabsHtml}</div>
            </div>
            <div class="space-y-2.5 mt-3">${cardsHtml}</div>
        `;

        container.querySelectorAll('.lf-lex-tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                renderTabbedResultsUI(modalType, ctx, searchBundle, btn.dataset.tab);
            });
        });

        container.querySelectorAll('.lf-scripture-hit-card').forEach((card) => {
            card.addEventListener('click', () => {
                const hit = activeItems[parseInt(card.dataset.hitIdx, 10)];
                if (!hit) return;
                openHitInNativeLexicon(hit, parsed, activeResultTab);
            });
        });
    }

    function injectBackBarAndHighlight(targetModalType, parsed, mode, returnTab) {
        const ctx = modalContexts[targetModalType];
        if (!ctx) return;
        const container = ctx.getResultsContainer();
        if (!container) return;

        const oldBar = container.querySelector('.lf-scripture-back-bar');
        if (oldBar) oldBar.remove();

        const total = lastGlobalSearch ? lastGlobalSearch.allResults.length : 0;
        const bar = document.createElement('div');
        bar.className = 'lf-scripture-back-bar mb-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-2 text-xs';
        bar.innerHTML = `
            <button type="button" class="lf-back-to-scripture-btn font-bold text-amber-900 dark:text-amber-200 hover:underline flex items-center space-x-1.5 cursor-pointer">
                <i class="fa-solid fa-arrow-left"></i>
                <span>Back to All-Lexicon Results for ${escapeHtml(parsed.label)} (${total} total)</span>
            </button>
            <span class="text-amber-700 dark:text-amber-300 font-semibold">Highlighting ${escapeHtml(parsed.label)}</span>
        `;
        bar.querySelector('.lf-back-to-scripture-btn').addEventListener('click', () => {
            if (lastGlobalSearch) renderTabbedResultsUI(targetModalType, ctx, lastGlobalSearch, returnTab);
        });
        container.prepend(bar);
        highlightOpenedEntryContainer(container, parsed, mode);
    }

    let pendingScriptureJump = null;
    let lastLxxClickedRef = null;
    let isAutoHighlightingLsj = false;

    function getLsjResultsContainer(lsjModal, lsjInput) {
        if (!lsjModal) return null;
        const explicit = lsjModal.querySelector('#lfLsjResults, #lfLsjBody, #lsjResults, #lsjBody, .lf-lsj-results, [data-lsj-results]');
        if (explicit) return explicit;

        if (lsjInput) {
            let row = lsjInput.parentElement;
            while (row && row.parentElement && row.parentElement !== lsjModal) {
                const next = row.nextElementSibling;
                if (next && !next.contains(lsjInput) && !/Liddell,\s*Scott\s*&\s*Jones.*Public Domain/i.test((next.textContent || '').trim())) {
                    return next;
                }
                row = row.parentElement;
            }
        }

        const divs = Array.from(lsjModal.querySelectorAll('div')).filter((d) => {
            if (lsjInput && d.contains(lsjInput)) return false;
            const cs = getComputedStyle(d);
            return /(auto|scroll)/i.test(cs.overflowY);
        });
        return divs[0] || null;
    }

    function readRefFromLxxDrawer(clickedEl) {
        let drawer = null;
        if (clickedEl && clickedEl.closest) {
            const nodes = document.querySelectorAll('aside, section, div');
            for (let i = 0; i < nodes.length; i++) {
                const el = nodes[i];
                if (el.contains(clickedEl) && /Tagged Septuagint\s*\(LXX\)/i.test(el.textContent || '') && el.querySelector('select')) {
                    drawer = el;
                }
            }
        }
        if (!drawer) {
            const nodes = document.querySelectorAll('aside, section, div');
            for (let i = 0; i < nodes.length; i++) {
                const el = nodes[i];
                if (el.id === 'lfStudyDock' || el.closest('#lfStudyDock')) continue;
                const cs = getComputedStyle(el);
                if (cs.display === 'none' || cs.visibility === 'hidden') continue;
                if (el.querySelectorAll('select').length >= 2 && /Tagged Septuagint\s*\(LXX\)/i.test(el.textContent || '')) {
                    drawer = el;
                    break;
                }
            }
        }
        if (!drawer) return null;

        let book = null;
        let chapter = 0;
        drawer.querySelectorAll('select').forEach((sel) => {
            const optText = (sel.options[sel.selectedIndex]?.textContent || sel.value || '').trim();
            const chM = optText.match(/^(?:Ch\.?\s*)?(\d{1,3})$/i);
            if (chM) {
                chapter = parseInt(chM[1], 10);
            } else {
                const key = optText.toLowerCase().replace(/\.+$/, '').replace(/\s+/g, ' ').trim();
                const hit = BOOK_LOOKUP.get(key) || BOOK_LOOKUP.get(key.replace(/\s+/g, ''));
                if (hit) book = hit;
            }
        });
        if (!book || !chapter) return null;

        let verse = null;
        if (clickedEl) {
            let cur = clickedEl;
            while (cur && cur !== drawer && drawer.contains(cur)) {
                const dv = cur.getAttribute && (cur.getAttribute('data-verse') || cur.getAttribute('data-verse-num') || cur.getAttribute('data-v'));
                if (dv && /^\d{1,3}$/.test(dv)) {
                    verse = parseInt(dv, 10);
                    break;
                }
                const dref = cur.getAttribute && cur.getAttribute('data-ref');
                if (dref) {
                    const rm = dref.match(/[:.]\s*(\d{1,3})\b/);
                    if (rm) {
                        verse = parseInt(rm[1], 10);
                        break;
                    }
                }
                cur = cur.parentElement;
            }
            if (verse == null) {
                const holder = clickedEl.closest('p, li, tr, div');
                if (holder && drawer.contains(holder) && !holder.querySelector('select')) {
                    const firstBadge = holder.querySelector('span, sup, strong, b');
                    const bt = firstBadge ? (firstBadge.textContent || '').trim() : '';
                    if (/^\d{1,3}$/.test(bt)) verse = parseInt(bt, 10);
                }
            }
        }
        return {
            book,
            chapter,
            verse,
            label: verse ? `${book.name} ${chapter}:${verse}` : `${book.name} ${chapter}`
        };
    }

    function getCurrentWorkspaceRef() {
        const liveLxxRef = readRefFromLxxDrawer(null);
        if (lastLxxClickedRef && (Date.now() - lastLxxClickedRef.ts) < 120000) {
            if (!liveLxxRef || (liveLxxRef.book.num === lastLxxClickedRef.ref.book.num && liveLxxRef.chapter === lastLxxClickedRef.ref.chapter)) {
                return lastLxxClickedRef.ref;
            }
        }
        if (liveLxxRef) return liveLxxRef;

        try {
            const blk =
                (typeof lastSelectedBlock !== 'undefined' && lastSelectedBlock && lastSelectedBlock.dataset && lastSelectedBlock.dataset.bookNum ? lastSelectedBlock : null) ||
                (typeof findTopVisibleVerseBlock === 'function' ? findTopVisibleVerseBlock() : null);

            if (blk && blk.dataset && blk.dataset.bookNum) {
                const bookNum = parseInt(blk.dataset.bookNum, 10);
                const chapter = parseInt(blk.dataset.chapterNum, 10);
                const verse = parseInt(blk.dataset.verseNum, 10) || null;
                const book = BOOKS.find((b) => b.num === bookNum);
                if (book && chapter) {
                    return {
                        book,
                        chapter,
                        verse,
                        label: verse ? `${book.name} ${chapter}:${verse}` : `${book.name} ${chapter}`
                    };
                }
            }
        } catch (e) {}
        return null;
    }

    document.addEventListener('click', (e) => {
        const ref = readRefFromLxxDrawer(e.target);
        if (!ref) return;
        // Preserve previously clicked verse for the same book/chapter when clicking the LSJ button in the bottom word card
        if (ref.verse == null && lastLxxClickedRef &&
            lastLxxClickedRef.ref.book.num === ref.book.num &&
            lastLxxClickedRef.ref.chapter === ref.chapter &&
            lastLxxClickedRef.ref.verse != null) {
            lastLxxClickedRef.ts = Date.now();
            return;
        }
        lastLxxClickedRef = { ref, ts: Date.now() };
    }, true);

    function getEntryContentSignature(container) {
        if (!container) return '';
        let sample = '';
        let totalLen = 0;
        const tw = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
            acceptNode(n) {
                const p = n.parentElement;
                if (!p || /^(SCRIPT|STYLE|BUTTON|INPUT|SELECT)$/i.test(p.tagName)) return NodeFilter.FILTER_REJECT;
                if (p.closest('.lf-scripture-back-bar, .lf-verse-fallback-box, .lf-lsj-cite-jump-bar')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        let node;
        while ((node = tw.nextNode())) {
            const v = node.nodeValue || '';
            if (!v) continue;
            totalLen += v.length;
            if (sample.length < 120) sample += v;
        }
        return `${sample.trim().slice(0, 80)}::${totalLen}`;
    }

    function applyLsjAutoCitationHighlight(container) {
        if (!container || isAutoHighlightingLsj) return;
        const text = (container.textContent || '').trim();
        if (!text || text.length < 40) return;
        if (/Looking up\s+.+\s+in LSJ/i.test(text)) return;
        if (/All-Lexicon Scripture Search:/i.test(text)) return;
        if (/Type any Greek lemma above/i.test(text)) return;

        const sig = getEntryContentSignature(container);
        if (!sig) return;
        if (container.dataset.lfLsjAutoSig === sig && container.querySelector('mark.lf-scripture-hit-mark')) return;

        isAutoHighlightingLsj = true;
        try {
            const oldBar = container.querySelector('.lf-lsj-cite-jump-bar');
            if (oldBar) oldBar.remove();

            if (pendingScriptureJump && pendingScriptureJump.modalType === 'lsj' && (Date.now() - pendingScriptureJump.ts) < 12000) {
                const { parsed, mode, returnTab } = pendingScriptureJump;
                injectBackBarAndHighlight('lsj', parsed, mode, returnTab);
                if (container.querySelector('mark.lf-scripture-hit-mark')) {
                    container.dataset.lfLsjAutoSig = sig;
                    pendingScriptureJump = null;
                }
                return;
            }

            const activeRef = getCurrentWorkspaceRef();
            if (!activeRef) return;

            let usedRef = activeRef;
            let count = highlightOpenedEntryContainer(container, activeRef, 'lsj');

            if (!count && activeRef.verse != null) {
                const chapterRef = { book: activeRef.book, chapter: activeRef.chapter, verse: null, label: `${activeRef.book.name} ${activeRef.chapter}` };
                count = highlightOpenedEntryContainer(container, chapterRef, 'lsj');
                if (count) usedRef = chapterRef;
            }

            if (count > 0) {
                container.dataset.lfLsjAutoSig = sig;
                const groups = getDistinctCitationGroups(container);
                let curIdx = 0;

                const bar = document.createElement('div');
                bar.className = 'lf-lsj-cite-jump-bar';
                const renderCountText = () => (
                    groups.length > 1
                        ? `Cited in entry: ${escapeHtml(usedRef.label)} (${curIdx + 1} / ${groups.length})`
                        : `Cited in entry: ${escapeHtml(usedRef.label)} (1)`
                );

                bar.innerHTML = `
                    <span class="lf-lsj-cite-count-label">${renderCountText()}</span>
                    <span style="display:inline-flex;gap:6px;">
                        ${groups.length > 1 ? '<button type="button" data-lf-cite-nav="-1">Prev</button><button type="button" data-lf-cite-nav="1">Next</button>' : ''}
                        <button type="button" data-lf-cite-nav="0">Jump</button>
                    </span>
                `;
                const labelEl = bar.querySelector('.lf-lsj-cite-count-label');
                bar.querySelectorAll('button[data-lf-cite-nav]').forEach((b) => {
                    b.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const delta = parseInt(b.getAttribute('data-lf-cite-nav'), 10);
                        if (delta !== 0) {
                            curIdx = (curIdx + delta + groups.length) % groups.length;
                            if (labelEl) labelEl.textContent = renderCountText();
                        }
                        focusCitationGroup(container, groups, curIdx);
                    });
                });
                container.prepend(bar);
            }
        } finally {
            setTimeout(() => { isAutoHighlightingLsj = false; }, 60);
        }
    }

    function openHitInNativeLexicon(hit, parsed, returnTab) {
        const meta = LEXICON_META[hit.lexicon];
        const targetModalType = meta.modal;

        if (targetModalType !== 'gnt') {
            const tm = document.getElementById('thayersModal');
            if (tm && !tm.classList.contains('hidden')) tm.classList.add('hidden');
        }
        if (targetModalType !== 'hebrew') {
            const bm = document.getElementById('bdbModal');
            if (bm && !bm.classList.contains('hidden')) bm.classList.add('hidden');
        }
        if (targetModalType !== 'lsj') {
            const lm = document.getElementById('lfLsjModalOverlay');
            if (lm && lm.style.display !== 'none') lm.style.display = 'none';
        }

        bypassFlag[targetModalType] = true;
        try {
            if (targetModalType === 'gnt') {
                const tm = document.getElementById('thayersModal');
                if (tm) tm.classList.remove('hidden');
                const abbottBtn = tm && Array.from(tm.querySelectorAll('button')).find((b) => /Abbott-Smith/i.test(b.textContent || ''));
                if (abbottBtn) abbottBtn.click();
                else if (typeof activeGreekLexiconSource !== 'undefined') activeGreekLexiconSource = 'abbott';

                if (hit.strongs && typeof openRelatedStrongEntry === 'function') {
                    openRelatedStrongEntry(hit.strongs);
                } else if (modalContexts.gnt) {
                    modalContexts.gnt.input.value = hit.queryTerm || hit.headword;
                    if (typeof executeThayersSearch === 'function') executeThayersSearch();
                }
            } else if (targetModalType === 'hebrew') {
                const bm = document.getElementById('bdbModal');
                if (bm) bm.classList.remove('hidden');
                const tabRe = hit.lexicon === 'gesenius' ? /Gesenius/i : /BDB\s*\(Brown/i;
                const tabBtn = bm && Array.from(bm.querySelectorAll('button')).find((b) => tabRe.test(b.textContent || ''));
                if (tabBtn) tabBtn.click();
                else if (typeof activeHebrewLexiconSource !== 'undefined') activeHebrewLexiconSource = hit.lexicon;

                if (modalContexts.hebrew) {
                    modalContexts.hebrew.input.value = hit.queryTerm || hit.headword;
                    if (typeof executeBdbSearch === 'function') executeBdbSearch();
                }
            } else if (targetModalType === 'lsj') {
                const lm = document.getElementById('lfLsjModalOverlay');
                if (lm) {
                    lm.classList.remove('lf-docked-modal-host', 'hidden', 'lf-lsj-force-closed');
                    if (lm.parentElement !== document.body) document.body.appendChild(lm);
                    lm.style.setProperty('z-index', '2147483500', 'important');
                    lm.style.display = 'flex';
                } else if (typeof window.openLsjModal === 'function') {
                    window.openLsjModal(hit.headword);
                }
                if (modalContexts.lsj) {
                    modalContexts.lsj.input.value = hit.headword;
                    modalContexts.lsj.input.dispatchEvent(new Event('input', { bubbles: true }));
                    const btn = modalContexts.lsj.getSearchButton();
                    if (btn) btn.click();
                }
            }
        } finally {
            setTimeout(() => { bypassFlag[targetModalType] = false; }, 150);
        }

        pendingScriptureJump = { modalType: targetModalType, parsed, mode: meta.mode, returnTab, ts: Date.now() };

        const attemptHighlight = () => {
            const ctx = modalContexts[targetModalType];
            const c = ctx && ctx.getResultsContainer();
            if (!c) return false;
            const txt = (c.textContent || '').trim();
            if (!txt || /Looking up\s+.+\s+in LSJ/i.test(txt)) return false;
            if (!c.querySelector('mark.lf-scripture-hit-mark')) {
                injectBackBarAndHighlight(targetModalType, parsed, meta.mode, returnTab);
            }
            return Boolean(c.querySelector('mark.lf-scripture-hit-mark'));
        };

        [180, 500, 1100, 2000].forEach((ms) => {
            setTimeout(attemptHighlight, ms);
        });
    }

    async function executeAllLexiconScriptureSearch(modalType, ctx) {
        const container = ctx.getResultsContainer();
        hideWorkspaceVerseBridgeBars();
        const parsed = parseVerseQuery(ctx.input.value);
        if (!parsed) {
            if (container) {
                container.innerHTML = `<div class="p-4 rounded-xl bg-amber-50 dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                    Enter a Bible verse reference such as <strong>Gen 1:2</strong>, <strong>Heb 11:15</strong>, <strong>Rom 10:7</strong>, or <strong>John 1:1</strong>.
                </div>`;
            }
            return;
        }

        if (container) {
            container.innerHTML = `<div class="p-5 rounded-xl bg-amber-50 dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-sm font-semibold text-amber-900 dark:text-amber-200">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i>Searching <strong>Abbott-Smith, BDB, Gesenius &amp; LSJ</strong> for <strong>${escapeHtml(parsed.label)}</strong>…
            </div>`;
        }

        const bundle = await scanAllLexicons(parsed);
        renderTabbedResultsUI(modalType, ctx, bundle, 'all');
    }

    function attachFieldDropdownToModal(modalType, ctx) {
        modalContexts[modalType] = ctx;
        if (!ctx.modal || !ctx.input || ctx.modal.querySelector(`.lf-field-select[data-modal="${modalType}"]`)) return;

        const origPlaceholder = ctx.input.getAttribute('placeholder') || '';
        const wrap = document.createElement('div');
        wrap.className = 'lf-field-wrap';
        wrap.innerHTML = `
            <span class="lf-field-label">Field:</span>
            <select class="lf-field-select" data-modal="${modalType}" title="Switch between Word lookup and All-Lexicon Scripture search">
                <option value="word">Word</option>
                <option value="scripture">Scripture (All Lexicons)</option>
            </select>
        `;

        const select = wrap.querySelector('select');
        const inputBox = ctx.input.closest('div') || ctx.input;
        inputBox.parentElement.insertBefore(wrap, inputBox);

        select.addEventListener('change', () => {
            const isScripture = select.value === 'scripture';
            select.classList.toggle('lf-scripture-active', isScripture);
            if (isScripture) hideWorkspaceVerseBridgeBars();
            ctx.input.setAttribute(
                'placeholder',
                isScripture ? 'Search ALL lexicons for a verse (e.g. Gen 1:2, Heb 11:15, Rom 10:7)...' : origPlaceholder
            );
            ctx.input.focus();
        });

        ctx.modal.addEventListener('keydown', (e) => {
            if (bypassFlag[modalType] || select.value !== 'scripture') return;
            if (e.target === ctx.input && e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                executeAllLexiconScriptureSearch(modalType, ctx);
            }
        }, true);

        ctx.modal.addEventListener('click', (e) => {
            if (bypassFlag[modalType] || select.value !== 'scripture') return;
            const btn = e.target && e.target.closest('button');
            if (!btn) return;
            if (btn === ctx.getSearchButton()) {
                e.preventDefault();
                e.stopPropagation();
                executeAllLexiconScriptureSearch(modalType, ctx);
            }
        }, true);
    }

    // Helper exposed for Command Palette & Research Bar
    window.lfOpenAllLexiconScriptureSearch = function (verseQuery) {
        const parsed = parseVerseQuery(verseQuery || '');
        const preferHebrew = parsed && parsed.book.num <= 39;
        const modalType = preferHebrew && modalContexts.hebrew ? 'hebrew' : 'gnt';
        const ctx = modalContexts[modalType];
        if (!ctx) return;

        if (modalType === 'hebrew') {
            const bm = document.getElementById('bdbModal');
            if (bm) bm.classList.remove('hidden');
        } else {
            const tm = document.getElementById('thayersModal');
            if (tm) tm.classList.remove('hidden');
        }

        const sel = ctx.modal.querySelector(`.lf-field-select[data-modal="${modalType}"]`);
        if (sel) {
            sel.value = 'scripture';
            sel.dispatchEvent(new Event('change'));
        }
        ctx.input.value = verseQuery || '';
        if (parsed) {
            executeAllLexiconScriptureSearch(modalType, ctx);
        } else {
            ctx.input.focus();
        }
    };

    window.lfParseVerseQuery = parseVerseQuery;

    function initLexiconFieldDropdowns() {
        hookGreekLookupFallback();

        const gntModal = document.getElementById('thayersModal');
        const gntInput = document.getElementById('thayersSearchInput');
        if (gntModal && gntInput) {
            attachFieldDropdownToModal('gnt', {
                modal: gntModal,
                input: gntInput,
                getResultsContainer: () => document.getElementById('thayersResultsContainer'),
                getSearchButton: () => Array.from(gntModal.querySelectorAll('button')).find((b) => /Search\s+Lexicon/i.test(b.textContent || ''))
            });
        }

        const bdbModal = document.getElementById('bdbModal');
        const bdbInput = document.getElementById('bdbSearchInput');
        if (bdbModal && bdbInput) {
            attachFieldDropdownToModal('hebrew', {
                modal: bdbModal,
                input: bdbInput,
                getResultsContainer: () => document.getElementById('bdbResultsContainer'),
                getSearchButton: () => Array.from(bdbModal.querySelectorAll('button')).find((b) => /Search\s+(BDB|Hebrew|Lexicon)/i.test(b.textContent || ''))
            });
        }

        const wireLsjIfPresent = () => {
            const lsjModal = document.getElementById('lfLsjModalOverlay');
            if (!lsjModal) return false;
            const lsjInput = lsjModal.querySelector('input[type="text"], input[type="search"], input:not([type])');
            if (!lsjInput) return false;

            const getContainer = () => getLsjResultsContainer(lsjModal, lsjInput);

            attachFieldDropdownToModal('lsj', {
                modal: lsjModal,
                input: lsjInput,
                getResultsContainer: getContainer,
                getSearchButton: () => Array.from(lsjModal.querySelectorAll('button')).find((b) => /^\s*Search(\s+LSJ|\s+Lexicon)?\s*$/i.test(b.textContent || ''))
            });

            if (!lsjModal.dataset.lfLsjJumpObserver) {
                lsjModal.dataset.lfLsjJumpObserver = '1';
                let debounceTimer = null;
                const mo = new MutationObserver(() => {
                    if (isAutoHighlightingLsj) return;
                    if (debounceTimer) clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        const c = getContainer();
                        if (c) applyLsjAutoCitationHighlight(c);
                    }, 90);
                });
                mo.observe(lsjModal, { childList: true, subtree: true });
                setTimeout(() => {
                    const c = getContainer();
                    if (c) applyLsjAutoCitationHighlight(c);
                }, 120);
            }
            return true;
        };

        if (!wireLsjIfPresent()) {
            const obs = new MutationObserver(() => {
                if (wireLsjIfPresent()) obs.disconnect();
            });
            obs.observe(document.body, { childList: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLexiconFieldDropdowns);
    } else {
        initLexiconFieldDropdowns();
    }
})();
