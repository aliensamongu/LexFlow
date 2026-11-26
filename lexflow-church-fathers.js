/* === LEXFLOW PHASE 6 MODULE (v2): CHURCH FATHERS & CCEL INTEGRATION ===
 * Features:
 *  1. Reusable CCEL Pop-Out Window (matches BibleHub / SRGNT Collation UX)
 *  2. In-App Church Fathers Topic Search (ALL 37 ANF/NPNF volumes or any specific Father)
 *  3. Clickable Church Icon Badges on cited Scripture verses (zero textContent pollution, zero tablet lag)
 *  4. Automatic Kudos Attribution for CCEL & Calvin College / Calvin University
 */
(function () {
    if (window.__lfChurchFathersLoaded) return;
    window.__lfChurchFathersLoaded = true;

    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
    const MOD = isMac ? '⌘' : 'Ctrl+';

    // -------------------------------------------------------------------------
    // 1. CHURCH FATHERS REGISTRY (Mapped to Schaff ANF / NPNF Volumes on CCEL)
    // -------------------------------------------------------------------------
    const FATHERS = [
        { id: 'clement_rome',  name: 'Clement of Rome',       era: 'c. 96 AD',      series: 'Apostolic',       vols: ['ANF01'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf01.toc.html', queryName: 'Clement', works: 'First Epistle to the Corinthians' },
        { id: 'didache',       name: 'The Didache',           era: 'c. 70–120 AD',  series: 'Apostolic',       vols: ['ANF07'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf07.toc.html', queryName: 'Teaching of the Twelve Apostles', works: 'Teaching of the Twelve Apostles' },
        { id: 'ignatius',      name: 'Ignatius of Antioch',   era: 'c. 110 AD',     series: 'Apostolic',       vols: ['ANF01'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf01.toc.html', queryName: 'Ignatius', works: 'Epistles to Ephesians, Smyrnaeans, Romans, Magnesians' },
        { id: 'polycarp',      name: 'Polycarp of Smyrna',    era: 'c. 110–155 AD', series: 'Apostolic',       vols: ['ANF01'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf01.toc.html', queryName: 'Polycarp', works: 'Epistle to the Philippians; Martyrdom of Polycarp' },
        { id: 'justin',        name: 'Justin Martyr',         era: 'c. 100–165 AD', series: 'Ante-Nicene',     vols: ['ANF01'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf01.toc.html', queryName: 'Justin', works: 'First & Second Apologies; Dialogue with Trypho' },
        { id: 'irenaeus',      name: 'Irenaeus of Lyons',     era: 'c. 130–202 AD', series: 'Ante-Nicene',     vols: ['ANF01'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf01.toc.html', queryName: 'Irenaeus', works: 'Against Heresies (Books I–V)' },
        { id: 'clement_alex',  name: 'Clement of Alexandria', era: 'c. 150–215 AD', series: 'Ante-Nicene',     vols: ['ANF02'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf02.toc.html', queryName: 'Clement', works: 'Exhortation, The Instructor (Paedagogus), Stromata' },
        { id: 'tertullian',    name: 'Tertullian',            era: 'c. 155–220 AD', series: 'Ante-Nicene',     vols: ['ANF03', 'ANF04'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf03.toc.html', queryName: 'Tertullian', works: 'Apology, On Baptism, Against Praxeas, Prescription Against Heretics' },
        { id: 'origen',        name: 'Origen of Alexandria',  era: 'c. 184–253 AD', series: 'Ante-Nicene',     vols: ['ANF04', 'ANF09'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf04.toc.html', queryName: 'Origen', works: 'De Principiis, Against Celsus, Commentaries on Matthew & John' },
        { id: 'cyprian',       name: 'Cyprian of Carthage',   era: 'c. 210–258 AD', series: 'Ante-Nicene',     vols: ['ANF05'], ccelUrl: 'https://www.ccel.org/ccel/schaff/anf05.toc.html', queryName: 'Cyprian', works: 'On the Unity of the Church, On the Lord’s Prayer, Epistles' },
        { id: 'eusebius',      name: 'Eusebius of Caesarea',  era: 'c. 260–339 AD', series: 'Nicene',          vols: ['NPNF2-01'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf201.toc.html', queryName: 'Eusebius', works: 'Church History (Books I–X)' },
        { id: 'athanasius',    name: 'Athanasius',            era: 'c. 296–373 AD', series: 'Nicene',          vols: ['NPNF2-04'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf204.toc.html', queryName: 'Athanasius', works: 'On the Incarnation, Four Discourses Against the Arians, Festal Letters' },
        { id: 'cyril_jer',     name: 'Cyril of Jerusalem',    era: 'c. 313–386 AD', series: 'Nicene',          vols: ['NPNF2-07'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf207.toc.html', queryName: 'Cyril', works: 'Catechetical Lectures & Mystagogical Lectures' },
        { id: 'hilary',        name: 'Hilary of Poitiers',    era: 'c. 310–367 AD', series: 'Nicene',          vols: ['NPNF2-09'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf209.toc.html', queryName: 'Hilary', works: 'On the Trinity (De Trinitate), Homilies on Psalms' },
        { id: 'basil',         name: 'Basil the Great',       era: '330–379 AD',    series: 'Post-Nicene',     vols: ['NPNF2-08'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf208.toc.html', queryName: 'Basil', works: 'On the Holy Spirit (De Spiritu Sancto), Hexaemeron, Letters' },
        { id: 'gregory_naz',   name: 'Gregory of Nazianzus',  era: '329–390 AD',    series: 'Post-Nicene',     vols: ['NPNF2-07'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf207.toc.html', queryName: 'Gregory', works: 'Five Theological Orations, Oration on Holy Baptism' },
        { id: 'gregory_nys',   name: 'Gregory of Nyssa',      era: 'c. 335–395 AD', series: 'Post-Nicene',     vols: ['NPNF2-05'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf205.toc.html', queryName: 'Gregory', works: 'The Great Catechism, On Not Three Gods, Against Eunomius' },
        { id: 'ambrose',       name: 'Ambrose of Milan',      era: 'c. 339–397 AD', series: 'Post-Nicene',     vols: ['NPNF2-10'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf210.toc.html', queryName: 'Ambrose', works: 'On the Mysteries, On the Holy Spirit, On the Christian Faith' },
        { id: 'chrysostom',    name: 'John Chrysostom',       era: 'c. 347–407 AD', series: 'Post-Nicene',     vols: ['NPNF1-09','NPNF1-10','NPNF1-11','NPNF1-12','NPNF1-13','NPNF1-14'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf110.toc.html', queryName: 'Chrysostom', works: 'Homilies on Matthew, John, Acts, Romans, Corinthians, Ephesians, Hebrews' },
        { id: 'jerome',        name: 'Jerome',                era: 'c. 347–420 AD', series: 'Post-Nicene',     vols: ['NPNF2-06'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf206.toc.html', queryName: 'Jerome', works: 'Letters, Prefaces to the Vulgate, Against Jovinianus' },
        { id: 'augustine',     name: 'Augustine of Hippo',    era: '354–430 AD',    series: 'Post-Nicene',     vols: ['NPNF1-01','NPNF1-02','NPNF1-03','NPNF1-04','NPNF1-05','NPNF1-06','NPNF1-07','NPNF1-08'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf101.toc.html', queryName: 'Augustin', works: 'Confessions, City of God, On the Trinity, Enchiridion, Anti-Pelagian Writings, Tractates on John, Psalms' },
        { id: 'john_damascus', name: 'John of Damascus',      era: 'c. 675–749 AD', series: 'Post-Nicene',     vols: ['NPNF2-09'], ccelUrl: 'https://www.ccel.org/ccel/schaff/npnf209.toc.html', queryName: 'Damascus', works: 'Exposition of the Orthodox Faith (Books I–IV)' }
    ];

    const FATHER_BY_ID = Object.fromEntries(FATHERS.map((f) => [f.id, f]));

    // Quick-tap theological topic chips
    const QUICK_TOPICS = [
        'Atonement', 'Baptism', "Lord's Supper", 'Trinity', 'Incarnation',
        'Grace', 'Justification', 'Resurrection', 'Scripture', 'Church',
        'Prayer', 'Creation', 'Holy Spirit', 'Faith & Works', 'Martyrdom'
    ];

    // -------------------------------------------------------------------------
    // 2. CURATED PATRISTIC TOPIC GUIDE (Direct to exact CCEL volume & passage)
    // -------------------------------------------------------------------------
    const TOPIC_ENTRIES = [
        // ATONEMENT & REDEMPTION
        {
            topics: ['atonement', 'cross', 'sacrifice', 'redemption', 'salvation', 'ransom', 'substitution'],
            fatherId: 'athanasius',
            work: 'On the Incarnation (§7–10, §20–25)',
            vol: 'NPNF2-04',
            summary: 'Because humanity lay under the sentence of death, the immortal Word took a mortal body to offer His flesh as a sacrifice on behalf of all, paying the debt of death and defeating corruption.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf204.vii.ii.i.html',
            ccelSearch: 'title:(NPNF2-04) AND "On the Incarnation" AND (debt OR sacrifice OR death)'
        },
        {
            topics: ['atonement', 'redemption', 'recapitulation', 'cross', 'salvation'],
            fatherId: 'irenaeus',
            work: 'Against Heresies (Book V, Ch. 1, 16, 21)',
            vol: 'ANF01',
            summary: 'Presents recapitulation: Christ summed up humanity in Himself, undoing Adam’s disobedience by His obedience unto death and redeeming us by His own blood.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND Irenaeus AND (recapitulated OR ransom OR "own blood")'
        },
        {
            topics: ['atonement', 'substitution', 'justification', 'cross', 'sacrifice', 'righteousness'],
            fatherId: 'clement_rome',
            work: 'First Epistle to the Corinthians (Ch. 49) & Epistle to Diognetus (Ch. 9)',
            vol: 'ANF01',
            summary: 'Christ "gave His blood for us by the will of God; His flesh for our flesh, and His soul for our souls." In Diognetus: "O sweet exchange! The righteousness of One justifies many sinners."',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND ("flesh for our flesh" OR "sweet exchange")'
        },
        {
            topics: ['atonement', 'cross', 'ransom', 'sacrifice', 'redemption'],
            fatherId: 'gregory_naz',
            work: 'Oration 45: The Second Oration on Easter (§22)',
            vol: 'NPNF2-07',
            summary: 'Critiques the idea of a ransom paid to Satan ("Fie upon the outrage!") and asks why the precious blood of God was poured out—offered to the Father for our sanctification.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf207.toc.html',
            ccelSearch: 'title:(NPNF2-07) AND "To Whom was that Blood offered"'
        },
        {
            topics: ['atonement', 'cross', 'redemption', 'mediator', 'sacrifice'],
            fatherId: 'augustine',
            work: 'On the Trinity (Book IV & Book XIII) & Enchiridion (Ch. 33–41)',
            vol: 'NPNF1-03',
            summary: 'Christ is both Priest and Sacrifice, overcoming the devil not by sheer power first, but by justice—shedding innocent blood to cancel the bond of our guilt.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf103.toc.html',
            ccelSearch: 'title:(NPNF1-03) AND (sacrifice OR mediator) AND "precious blood"'
        },
        {
            topics: ['atonement', 'cross', 'sacrifice', 'redemption'],
            fatherId: 'chrysostom',
            work: 'Homilies on Romans (Homily 7 on Rom 3:25) & 2 Corinthians (Homily 11)',
            vol: 'NPNF1-11',
            summary: 'Expounds Christ as the true mercy-seat (propitiation) who bore the curse and condemnation due to sinners, exchanging our sin for the very righteousness of God.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf111.toc.html',
            ccelSearch: 'title:(NPNF1-11 OR NPNF1-12) AND (propitiation OR "made Him to be sin")'
        },

        // BAPTISM
        {
            topics: ['baptism', 'water', 'regeneration', 'immersion', 'sacrament'],
            fatherId: 'didache',
            work: 'The Didache (Chapter 7: Concerning Baptism)',
            vol: 'ANF07',
            summary: 'Earliest church manual on baptism: baptize in the name of the Father, Son, and Holy Spirit in living (running) water; if unavailable, other water or pouring three times on the head after fasting.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf07.toc.html',
            ccelSearch: 'title:(ANF07) AND "Concerning baptism" AND "living water"'
        },
        {
            topics: ['baptism', 'regeneration', 'illumination', 'sacrament', 'worship'],
            fatherId: 'justin',
            work: 'First Apology (Chapter 61: Christian Baptism)',
            vol: 'ANF01',
            summary: 'Describes believers who are persuaded of the truth, fast and pray, and are brought to water to be "regenerated" in the name of the Father, Jesus Christ, and the Holy Spirit—called "illumination."',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND "First Apology" AND "washing with water" AND illumination'
        },
        {
            topics: ['baptism', 'infant baptism', 'water', 'regeneration', 'sacrament'],
            fatherId: 'tertullian',
            work: 'On Baptism (De Baptismo, Ch. 1–20)',
            vol: 'ANF03',
            summary: 'First full treatise devoted entirely to baptism ("We, little fishes, after the example of our ICHTHYS Jesus Christ, are born in water"). Also discusses the timing of baptizing children (Ch. 18).',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf03.toc.html',
            ccelSearch: 'title:(ANF03) AND "On Baptism" AND "little fishes"'
        },
        {
            topics: ['baptism', 'infant baptism', 'sacrament', 'grace'],
            fatherId: 'cyprian',
            work: 'Epistle 58 (To Fidus, on the Baptism of Infants)',
            vol: 'ANF05',
            summary: 'Reports the Council of Carthage’s ruling that infants need not wait until the eighth day (as in circumcision) to receive baptism and the mercy of Christ.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf05.toc.html',
            ccelSearch: 'title:(ANF05) AND Fidus AND "baptism of infants"'
        },
        {
            topics: ['baptism', 'water', 'spirit', 'regeneration', 'catechism'],
            fatherId: 'cyril_jer',
            work: 'Catechetical Lecture 3 & Mystagogical Lecture 2 (On Baptism)',
            vol: 'NPNF2-07',
            summary: 'Explains baptism as burial and resurrection with Christ (Rom 6), renunciation of Satan, triple immersion, and the sealing of the Holy Spirit.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf207.toc.html',
            ccelSearch: 'title:(NPNF2-07) AND "On Baptism" AND "Mystagogical"'
        },
        {
            topics: ['baptism', 'infant baptism', 'original sin', 'grace', 'sacrament'],
            fatherId: 'augustine',
            work: 'On Baptism, Against the Donatists & On Merits and Forgiveness of Sins',
            vol: 'NPNF1-04',
            summary: 'Defends the validity of baptism based on Christ (not the moral perfection of the minister) and argues for infant baptism in connection with original sin.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf104.toc.html',
            ccelSearch: 'title:(NPNF1-04 OR NPNF1-05) AND "On Baptism" AND Donatists'
        },

        // LORD'S SUPPER / EUCHARIST
        {
            topics: ["lord's supper", 'lords supper', 'eucharist', 'communion', 'bread', 'wine', 'sacrament', 'worship'],
            fatherId: 'didache',
            work: 'The Didache (Chapters 9, 10, & 14: The Eucharist)',
            vol: 'ANF07',
            summary: 'Preserves the earliest non-canonical Eucharistic prayers over the cup and broken bread ("Even as this broken bread was scattered over the hills... so let Thy Church be gathered") and Sunday breaking of bread.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf07.toc.html',
            ccelSearch: 'title:(ANF07) AND "Concerning the Thanksgiving" AND "broken bread"'
        },
        {
            topics: ["lord's supper", 'lords supper', 'eucharist', 'communion', 'sacrament', 'church'],
            fatherId: 'ignatius',
            work: 'Epistle to the Smyrnaeans (Ch. 7–8) & Ephesians (Ch. 20)',
            vol: 'ANF01',
            summary: 'Calls the Eucharist "the medicine of immortality" and rebukes Docetists who abstain from the Eucharist because they deny Christ’s true flesh.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND Ignatius AND ("medicine of immortality" OR "Smyrnaeans" AND Eucharist)'
        },
        {
            topics: ["lord's supper", 'lords supper', 'eucharist', 'communion', 'worship', 'sunday'],
            fatherId: 'justin',
            work: 'First Apology (Chapters 65–67: Administration of the Eucharist & Sunday Worship)',
            vol: 'ANF01',
            summary: 'Describes weekly Sunday worship—Scripture readings, exhortation, prayers, bread and wine blessed by prayer ("not as common bread and common drink") distributed by deacons.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND "common bread and common drink" AND Eucharist'
        },
        {
            topics: ["lord's supper", 'lords supper', 'eucharist', 'communion', 'resurrection', 'sacrament'],
            fatherId: 'irenaeus',
            work: 'Against Heresies (Book IV, Ch. 18 & Book V, Ch. 2)',
            vol: 'ANF01',
            summary: 'Teaches that the bread receiving the invocation of God consists of two realities—earthly and heavenly—and nourishes our bodies for the hope of the resurrection.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND Irenaeus AND "earthly and a heavenly" AND Eucharist'
        },
        {
            topics: ["lord's supper", 'lords supper', 'eucharist', 'communion', 'sacrament'],
            fatherId: 'cyril_jer',
            work: 'Mystagogical Lectures 4 & 5 (On the Body and Blood of Christ)',
            vol: 'NPNF2-07',
            summary: 'Instructs newly baptized believers on 1 Cor 11, the epiclesis (calling on the Holy Spirit), and approaching the table with reverence.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf207.toc.html',
            ccelSearch: 'title:(NPNF2-07) AND "Body and Blood of Christ" AND Cyril'
        },
        {
            topics: ["lord's supper", 'lords supper', 'eucharist', 'communion', 'sacrament'],
            fatherId: 'augustine',
            work: 'Tractates on John (Tractates 25–27 on John 6) & Sermons 227, 272',
            vol: 'NPNF1-07',
            summary: 'Explains John 6 ("Believe, and thou hast eaten") and distinguishes the outward sign (sacramentum) from the spiritual reality (res) of union with Christ and His Body, the Church.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf107.toc.html',
            ccelSearch: 'title:(NPNF1-07) AND "Believe, and thou hast eaten"'
        },
        {
            topics: ["lord's supper", 'lords supper', 'eucharist', 'communion', 'sacrament'],
            fatherId: 'chrysostom',
            work: 'Homilies on 1 Corinthians (Homilies 24 & 27) & Matthew (Homily 82)',
            vol: 'NPNF1-12',
            summary: 'Preaches fervently on 1 Cor 10–11, emphasizing Christ’s presence at the table, self-examination, and love for the poor as inseparable from communion.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf112.toc.html',
            ccelSearch: 'title:(NPNF1-12) AND "cup of blessing" AND "table"'
        },

        // TRINITY
        {
            topics: ['trinity', 'godhead', 'father', 'son', 'holy spirit', 'persons', 'substance'],
            fatherId: 'tertullian',
            work: 'Against Praxeas (Ch. 2–12)',
            vol: 'ANF03',
            summary: 'First Latin Father to coin the terminology "Trinity" (Trinitas), "one substance" (una substantia), and "three persons" (tres personae) against modalism.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf03.toc.html',
            ccelSearch: 'title:(ANF03) AND "Against Praxeas" AND "one substance"'
        },
        {
            topics: ['trinity', 'deity of christ', 'son', 'arians', 'homoousios'],
            fatherId: 'athanasius',
            work: 'Four Discourses Against the Arians & Letters to Serapion',
            vol: 'NPNF2-04',
            summary: 'Defends the eternal generation and full deity of the Son (homoousios with the Father) against Arius ("There was never a time when the Son was not").',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf204.toc.html',
            ccelSearch: 'title:(NPNF2-04) AND "Discourses Against the Arians" AND "coessential"'
        },
        {
            topics: ['trinity', 'holy spirit', 'godhead', 'cappadocians'],
            fatherId: 'gregory_naz',
            work: 'Five Theological Orations (Orations 27–31)',
            vol: 'NPNF2-07',
            summary: 'Classic Nicene synthesis: "No sooner do I conceive of the One than I am illumined by the splendor of the Three; no sooner do I distinguish Them than I am carried back to the One."',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf207.toc.html',
            ccelSearch: 'title:(NPNF2-07) AND "Theological Oration" AND Trinity'
        },
        {
            topics: ['trinity', 'godhead', 'persons', 'essence'],
            fatherId: 'gregory_nys',
            work: 'On "Not Three Gods" (To Ablabius)',
            vol: 'NPNF2-05',
            summary: 'Explains why confessing Father, Son, and Holy Spirit is strict monotheism—one undivided divine nature and inseparable operation across all three Persons.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf205.toc.html',
            ccelSearch: 'title:(NPNF2-05) AND "Not Three Gods"'
        },
        {
            topics: ['trinity', 'godhead', 'love', 'image of god'],
            fatherId: 'augustine',
            work: 'On the Trinity (De Trinitate, Books I–XV)',
            vol: 'NPNF1-03',
            summary: 'Landmark 15-book treatise on the equality of the Three Persons, Scriptural missions, and psychological analogies of the Trinity in the human mind (memory, understanding, will).',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf103.toc.html',
            ccelSearch: 'title:(NPNF1-03) AND "On the Trinity" AND "memory, understanding"'
        },
        {
            topics: ['trinity', 'godhead', 'orthodox faith'],
            fatherId: 'john_damascus',
            work: 'Exposition of the Orthodox Faith (Book I, Ch. 8)',
            vol: 'NPNF2-09',
            summary: 'Synthesizes Eastern patristic Trinitarian theology, clearly defining perichoresis (mutual indwelling) of Father, Son, and Holy Spirit.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf209.toc.html',
            ccelSearch: 'title:(NPNF2-09) AND "Orthodox Faith" AND "Holy Trinity"'
        },

        // INCARNATION & CHRISTOLOGY
        {
            topics: ['incarnation', 'christology', 'deity of christ', 'humanity of christ', 'word'],
            fatherId: 'athanasius',
            work: 'On the Incarnation of the Word (De Incarnatione)',
            vol: 'NPNF2-04',
            summary: 'One of the most celebrated books in Christian history: why God became man—"For He was made man that we might be made God" (participating in His incorruption and divine life).',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf204.vii.ii.i.html',
            ccelSearch: 'title:(NPNF2-04) AND "On the Incarnation" AND "made man"'
        },
        {
            topics: ['incarnation', 'christology', 'two natures', 'docetism'],
            fatherId: 'ignatius',
            work: 'Epistle to the Ephesians (Ch. 7) & Trallians (Ch. 9)',
            vol: 'ANF01',
            summary: 'Confesses Christ as "both flesh and spirit, both made and not made, God existing in flesh, true life in death, both of Mary and of God."',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND Ignatius AND "both flesh and spirit"'
        },
        {
            topics: ['incarnation', 'christology', 'humanity of christ', 'salvation'],
            fatherId: 'gregory_naz',
            work: 'Epistle 101 (To Cledonius Against Apollinarius)',
            vol: 'NPNF2-07',
            summary: 'Famous Christological axiom: "For that which He has not assumed He has not healed; but that which is united to His Godhead is also saved."',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf207.toc.html',
            ccelSearch: 'title:(NPNF2-07) AND "not assumed" AND "not healed"'
        },

        // GRACE, FREE WILL & JUSTIFICATION
        {
            topics: ['grace', 'justification', 'faith & works', 'faith', 'works', 'salvation'],
            fatherId: 'clement_rome',
            work: 'First Epistle to the Corinthians (Chapter 32)',
            vol: 'ANF01',
            summary: 'Earliest post-apostolic witness to justification by faith: "We are not justified by ourselves, nor by our own wisdom, or understanding, or godliness, or works... but by that faith through which Almighty God has justified all men from the beginning."',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND "not justified by ourselves" AND Clement'
        },
        {
            topics: ['grace', 'justification', 'free will', 'predestination', 'faith & works', 'pelagianism'],
            fatherId: 'augustine',
            work: 'On the Spirit and the Letter; On Nature and Grace; On Grace and Free Will',
            vol: 'NPNF1-05',
            summary: 'Augustine’s classic Anti-Pelagian writings defending sovereign, prevenient grace—God commands what we cannot do in our own strength and gives what He commands.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf105.toc.html',
            ccelSearch: 'title:(NPNF1-05) AND "Spirit and the Letter" AND justification'
        },
        {
            topics: ['grace', 'justification', 'faith & works', 'faith', 'law'],
            fatherId: 'chrysostom',
            work: 'Homilies on Romans (Homily 7–8) & Galatians (Ch. 2–3)',
            vol: 'NPNF1-11',
            summary: 'Highlights the astonishing free gift of righteousness through faith apart from works of the Law, while exhorting believers to a transformed, holy life.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf111.toc.html',
            ccelSearch: 'title:(NPNF1-11) AND justified AND "without the deeds of the law"'
        },
        {
            topics: ['grace', 'free will', 'salvation'],
            fatherId: 'origen',
            work: 'De Principiis (Book III, Ch. 1: On the Freedom of the Will)',
            vol: 'ANF04',
            summary: 'Major early Eastern treatment defending human moral responsibility alongside divine grace and providence.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf04.toc.html',
            ccelSearch: 'title:(ANF04) AND "De Principiis" AND "freedom of the will"'
        },

        // HOLY SPIRIT
        {
            topics: ['holy spirit', 'trinity', 'pneumatology', 'doxology'],
            fatherId: 'basil',
            work: 'On the Holy Spirit (De Spiritu Sancto)',
            vol: 'NPNF2-08',
            summary: 'Foundational treatise proving the full deity, equality, and worship of the Holy Spirit alongside the Father and the Son.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf208.vii.html',
            ccelSearch: 'title:(NPNF2-08) AND "De Spiritu Sancto" AND glory'
        },
        {
            topics: ['holy spirit', 'trinity', 'sanctification'],
            fatherId: 'ambrose',
            work: 'On the Holy Spirit (Books I–III)',
            vol: 'NPNF2-10',
            summary: 'Western patristic defense of the Spirit’s divinity, creative power, and indwelling work in believers.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf210.toc.html',
            ccelSearch: 'title:(NPNF2-10) AND "On the Holy Spirit" AND Ambrose'
        },

        // SCRIPTURE & CANON
        {
            topics: ['scripture', 'bible', 'canon', 'inspiration', 'interpretation', 'hermeneutics'],
            fatherId: 'athanasius',
            work: 'Festal Letter 39 (367 AD — The 27-Book New Testament Canon)',
            vol: 'NPNF2-04',
            summary: 'First surviving Christian document listing the exact 27 books of the New Testament ("In these alone is proclaimed the doctrine of godliness").',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf204.toc.html',
            ccelSearch: 'title:(NPNF2-04) AND "Letter XXXIX" AND "springs of salvation"'
        },
        {
            topics: ['scripture', 'bible', 'interpretation', 'hermeneutics', 'preaching'],
            fatherId: 'augustine',
            work: 'On Christian Doctrine (De Doctrina Christiana, Books I–IV)',
            vol: 'NPNF1-02',
            summary: 'The classic early Christian manual of biblical interpretation: every faithful reading of Scripture must build up the twofold love of God and neighbor.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf102.toc.html',
            ccelSearch: 'title:(NPNF1-02) AND "Christian Doctrine" AND "love of God"'
        },
        {
            topics: ['scripture', 'canon', 'gospels', 'tradition'],
            fatherId: 'irenaeus',
            work: 'Against Heresies (Book III, Ch. 1 & 11: The Fourfold Gospel)',
            vol: 'ANF01',
            summary: 'Defends the authority and harmony of the four canonical Gospels (Matthew, Mark, Luke, John) against Gnostic fabrications.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND Irenaeus AND "four-formed" AND Gospel'
        },
        {
            topics: ['scripture', 'bible', 'canon', 'translation'],
            fatherId: 'jerome',
            work: 'Epistle 53 (To Paulinus: On the Study of the Scriptures) & Prefaces',
            vol: 'NPNF2-06',
            summary: 'Urges deep daily study of every book of Scripture ("Ignorance of Scripture is ignorance of Christ") and explains his Hebrew-to-Latin translation work.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf206.toc.html',
            ccelSearch: 'title:(NPNF2-06) AND "To Paulinus" AND Scriptures'
        },

        // RESURRECTION & ESCHATOLOGY
        {
            topics: ['resurrection', 'eschatology', 'afterlife', 'body', 'second coming'],
            fatherId: 'tertullian',
            work: 'On the Resurrection of the Flesh (De Resurrectione Carnis)',
            vol: 'ANF03',
            summary: 'Comprehensive defense of the bodily resurrection of believers against Gnostic dualism ("The flesh is the hinge of salvation").',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf03.toc.html',
            ccelSearch: 'title:(ANF03) AND "Resurrection of the Flesh"'
        },
        {
            topics: ['resurrection', 'eschatology', 'heaven', 'city of god', 'second coming'],
            fatherId: 'augustine',
            work: 'The City of God (Books XX–XXII)',
            vol: 'NPNF1-02',
            summary: 'Expounds the final judgment, the millennium (Rev 20), the resurrection of the body, and eternal joy in the City of God.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf102.toc.html',
            ccelSearch: 'title:(NPNF1-02) AND "City of God" AND "thousand years"'
        },

        // CHURCH, UNITY & MINISTRY
        {
            topics: ['church', 'bishops', 'elders', 'deacons', 'unity', 'ministry'],
            fatherId: 'ignatius',
            work: 'Epistles to the Magnesians, Trallians, & Smyrnaeans',
            vol: 'ANF01',
            summary: 'Earliest witness to the threefold ministry (bishop, presbyters/elders, deacons) and first surviving use of the phrase "catholic [universal] church" (Smyrnaeans 8).',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND Ignatius AND "catholic church"'
        },
        {
            topics: ['church', 'unity', 'schism', 'ministry'],
            fatherId: 'cyprian',
            work: 'On the Unity of the Church (Treatise 1)',
            vol: 'ANF05',
            summary: 'Pleads for visible Christian unity against schism, comparing the Church to the sun’s many rays, a tree’s branches, and Christ’s seamless garment.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf05.toc.html',
            ccelSearch: 'title:(ANF05) AND "Unity of the Church" AND Cyprian'
        },

        // PRAYER & LORD'S PRAYER
        {
            topics: ['prayer', "lord's prayer", 'fasting', 'devotion', 'worship'],
            fatherId: 'cyprian',
            work: 'On the Lord’s Prayer (Treatise 4)',
            vol: 'ANF05',
            summary: 'Line-by-line exposition of Matthew 6:9–13, emphasizing communal prayer ("Our Father", not "My Father"), daily bread, and forgiving others.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf05.toc.html',
            ccelSearch: 'title:(ANF05) AND "On the Lord\'s Prayer" AND Cyprian'
        },
        {
            topics: ['prayer', "lord's prayer", 'worship'],
            fatherId: 'tertullian',
            work: 'On Prayer (De Oratione)',
            vol: 'ANF03',
            summary: 'Earliest commentary on the Lord’s Prayer ("a summary of the whole Gospel") plus notes on early Christian postures and times of prayer.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf03.toc.html',
            ccelSearch: 'title:(ANF03) AND "On Prayer" AND "summary of the whole Gospel"'
        },

        // CREATION
        {
            topics: ['creation', 'genesis', 'six days', 'image of god', 'origin'],
            fatherId: 'basil',
            work: 'The Hexaemeron (Nine Homilies on the Six Days of Creation)',
            vol: 'NPNF2-08',
            summary: 'Classic nine-homily exposition of Genesis 1 defending creation ex nihilo (out of nothing) and marveling at the Creator’s wisdom in nature.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf208.toc.html',
            ccelSearch: 'title:(NPNF2-08) AND Hexaemeron AND "In the beginning"'
        },
        {
            topics: ['creation', 'genesis', 'time', 'confessions'],
            fatherId: 'augustine',
            work: 'Confessions (Books XI–XIII)',
            vol: 'NPNF1-01',
            summary: 'Profound meditation on Genesis 1:1, eternity vs. time ("God created time itself along with the world"), and the Trinity in creation.',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/npnf101.toc.html',
            ccelSearch: 'title:(NPNF1-01) AND Confessions AND "In the beginning God made"'
        },

        // MARTYRDOM & SUFFERING
        {
            topics: ['martyrdom', 'persecution', 'suffering', 'witness', 'courage'],
            fatherId: 'polycarp',
            work: 'The Martyrdom of Polycarp (Ch. 9–15)',
            vol: 'ANF01',
            summary: 'Eyewitness letter of Polycarp’s faithfulness at age 86: "Eighty and six years have I served Him, and He never did me any injury: how then can I blaspheme my King and my Saviour?"',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf01.toc.html',
            ccelSearch: 'title:(ANF01) AND "Eighty and six years" AND Polycarp'
        },
        {
            topics: ['martyrdom', 'persecution', 'suffering', 'apologetics'],
            fatherId: 'tertullian',
            work: 'The Apology (Ch. 50) & To the Martyrs',
            vol: 'ANF03',
            summary: 'Defends Christians before Roman magistrates with the immortal line: "The blood of Christians is seed!"',
            ccelDirect: 'https://www.ccel.org/ccel/schaff/anf03.toc.html',
            ccelSearch: 'title:(ANF03) AND "blood of Christians is seed"'
        }
    ];

    // -------------------------------------------------------------------------
    // 3. BOOK-LEVEL PATRISTIC HOMILY / COMMENTARY SERIES ON CCEL
    //    (Gives every chapter of major books direct links to classic patristic homilies)
    // -------------------------------------------------------------------------
    const BOOK_HOMILIES = {
        1:  [{ fatherId: 'basil', work: 'Hexaemeron (Gen 1)', vol: 'NPNF2-08', url: 'https://www.ccel.org/ccel/schaff/npnf208.toc.html' },
             { fatherId: 'augustine', work: 'City of God (Books XI–XVI) & Confessions XI–XIII', vol: 'NPNF1-02', url: 'https://www.ccel.org/ccel/schaff/npnf102.toc.html' }],
        19: [{ fatherId: 'augustine', work: 'Expositions on the Book of Psalms (Ps 1–150)', vol: 'NPNF1-08', url: 'https://www.ccel.org/ccel/schaff/npnf108.toc.html' }],
        40: [{ fatherId: 'chrysostom', work: '90 Homilies on the Gospel of Matthew', vol: 'NPNF1-10', url: 'https://www.ccel.org/ccel/schaff/npnf110.toc.html' },
             { fatherId: 'augustine', work: 'Sermon on the Mount & Harmony of the Gospels', vol: 'NPNF1-06', url: 'https://www.ccel.org/ccel/schaff/npnf106.toc.html' }],
        42: [{ fatherId: 'augustine', work: 'Harmony of the Gospels & Sermons on NT Lessons', vol: 'NPNF1-06', url: 'https://www.ccel.org/ccel/schaff/npnf106.toc.html' }],
        43: [{ fatherId: 'augustine', work: '124 Tractates on the Gospel of John', vol: 'NPNF1-07', url: 'https://www.ccel.org/ccel/schaff/npnf107.toc.html' },
             { fatherId: 'chrysostom', work: '88 Homilies on the Gospel of John', vol: 'NPNF1-14', url: 'https://www.ccel.org/ccel/schaff/npnf114.toc.html' }],
        44: [{ fatherId: 'chrysostom', work: '55 Homilies on the Acts of the Apostles', vol: 'NPNF1-11', url: 'https://www.ccel.org/ccel/schaff/npnf111.toc.html' }],
        45: [{ fatherId: 'chrysostom', work: '32 Homilies on the Epistle to the Romans', vol: 'NPNF1-11', url: 'https://www.ccel.org/ccel/schaff/npnf111.toc.html' },
             { fatherId: 'augustine', work: 'Anti-Pelagian Writings (Romans Exegesis)', vol: 'NPNF1-05', url: 'https://www.ccel.org/ccel/schaff/npnf105.toc.html' }],
        46: [{ fatherId: 'chrysostom', work: '44 Homilies on First Corinthians', vol: 'NPNF1-12', url: 'https://www.ccel.org/ccel/schaff/npnf112.toc.html' }],
        47: [{ fatherId: 'chrysostom', work: '30 Homilies on Second Corinthians', vol: 'NPNF1-12', url: 'https://www.ccel.org/ccel/schaff/npnf112.toc.html' }],
        48: [{ fatherId: 'chrysostom', work: 'Commentary on Galatians', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        49: [{ fatherId: 'chrysostom', work: '24 Homilies on Ephesians', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        50: [{ fatherId: 'chrysostom', work: '15 Homilies on Philippians', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        51: [{ fatherId: 'chrysostom', work: '12 Homilies on Colossians', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        52: [{ fatherId: 'chrysostom', work: '11 Homilies on 1 Thessalonians', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        53: [{ fatherId: 'chrysostom', work: '5 Homilies on 2 Thessalonians', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        54: [{ fatherId: 'chrysostom', work: '18 Homilies on 1 Timothy', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        55: [{ fatherId: 'chrysostom', work: '10 Homilies on 2 Timothy', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        56: [{ fatherId: 'chrysostom', work: '6 Homilies on Titus', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        57: [{ fatherId: 'chrysostom', work: '3 Homilies on Philemon', vol: 'NPNF1-13', url: 'https://www.ccel.org/ccel/schaff/npnf113.toc.html' }],
        58: [{ fatherId: 'chrysostom', work: '34 Homilies on the Epistle to the Hebrews', vol: 'NPNF1-14', url: 'https://www.ccel.org/ccel/schaff/npnf114.toc.html' }],
        62: [{ fatherId: 'augustine', work: '10 Homilies on the First Epistle of John', vol: 'NPNF1-07', url: 'https://www.ccel.org/ccel/schaff/npnf107.toc.html' }]
    };

    // -------------------------------------------------------------------------
    // 4. VERSE-LEVEL PATRISTIC CITATION INDEX (Drives the Clickable Church Icon!)
    //    Key format: "bookNum_chapter_verse" -> array of citations
    // -------------------------------------------------------------------------
    const VERSE_CITATIONS = {
        // GENESIS (Book 1)
        '1_1_1': [
            { fatherId: 'basil', work: 'Hexaemeron, Homily 1', note: 'Refutes eternal matter: God spoke the universe into being ex nihilo ("out of nothing") by His sovereign will.' },
            { fatherId: 'augustine', work: 'Confessions, Book XI–XII', note: 'Time itself is part of creation; God created heaven and earth "in the Beginning"—in His eternal Word (Christ).' },
            { fatherId: 'irenaeus', work: 'Against Heresies, II.10', note: 'Against Gnostics: the one supreme God, not a lesser demiurge, freely created all things from nothing.' }
        ],
        '1_1_2': [
            { fatherId: 'basil', work: 'Hexaemeron, Homily 2.6', note: 'The "Spirit of God" hovering (brooding like a bird warming eggs) prepares the waters to bring forth life.' },
            { fatherId: 'tertullian', work: 'On Baptism, Ch. 4', note: 'Links the Spirit moving upon the primordial waters to the Spirit’s sanctifying work in Christian baptism.' }
        ],
        '1_1_3': [
            { fatherId: 'basil', work: 'Hexaemeron, Homily 2.7', note: 'God’s speech is not vibration in air, but the instantaneous creative command of His will through the Son.' },
            { fatherId: 'ambrose', work: 'Hexaemeron, Day 1', note: 'Light was created before the sun so humanity would worship the Creator, not the sun.' }
        ],
        '1_1_26': [
            { fatherId: 'irenaeus', work: 'Against Heresies, IV.20.1', note: '"Let Us make man"—God spoke to His "two hands," the Son and the Holy Spirit, who are ever with Him.' },
            { fatherId: 'athanasius', work: 'On the Incarnation, §3', note: 'Humanity was uniquely graced with the image of the Word so we could know God and abide in blessedness.' },
            { fatherId: 'basil', work: 'On the Holy Spirit, Ch. 16', note: 'Cites the plural "Let Us make" as an Old Testament witness to the fellowship of the Father and the Son.' }
        ],
        '1_1_27': [
            { fatherId: 'gregory_nys', work: 'On the Making of Man, Ch. 16', note: 'Both male and female equally bear the royal image of God in reason, freedom, and capacity for virtue.' },
            { fatherId: 'augustine', work: 'On the Trinity, Book XII', note: 'Finds the image of the Triune God reflected in the rational soul’s memory, understanding, and love.' }
        ],
        '1_2_7': [
            { fatherId: 'irenaeus', work: 'Against Heresies, V.15', note: 'Just as God formed Adam from dust, Christ used clay in John 9 to heal the blind man—proving the same Creator.' },
            { fatherId: 'tertullian', work: 'On the Resurrection, Ch. 7', note: 'God’s own hands shaped human clay, giving the physical body immense dignity.' }
        ],
        '1_3_15': [
            { fatherId: 'irenaeus', work: 'Against Heresies, V.21.1', note: 'Protoevangelium: Christ, the Seed of the woman, treads down the serpent’s head and reverses Eve’s deception.' },
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 100', note: 'Contrasts Eve’s unbelief toward the serpent with Mary’s obedient faith in bearing the Redeemer.' }
        ],
        '1_15_6': [
            { fatherId: 'clement_rome', work: '1 Clement, Ch. 10 & 31', note: 'Abraham was called the Friend of God and received righteousness through faith and obedient trust.' },
            { fatherId: 'augustine', work: 'On the Spirit and the Letter', note: 'Abraham’s faith was credited as righteousness—not as a wage owed for works, but by God’s grace.' }
        ],
        '1_18_1': [
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 56', note: 'Identifies the Lord appearing to Abraham at Mamre as the pre-incarnate Word (the Son of God).' },
            { fatherId: 'hilary', work: 'On the Trinity, Book IV.25', note: 'Abraham saw three visitors yet addressed One as Lord—a classic patristic foreshadowing of the Trinity.' }
        ],

        // EXODUS (Book 2)
        '2_3_14': [
            { fatherId: 'gregory_naz', work: 'Oration 45.3', note: '"I AM WHO I AM" signifies God as an infinite, boundless sea of being—transcending time and change.' },
            { fatherId: 'augustine', work: 'On the Trinity, Book V.2', note: 'God alone truly and immutably IS (ipsum esse); all creatures only exist by participating in Him.' }
        ],
        '2_12_5': [
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 40', note: 'The unblemished Passover lamb roasted whole is a direct type of Christ crucified on the cross.' },
            { fatherId: 'chrysostom', work: 'Homilies on 1 Corinthians, 15', note: 'The blood on the doorposts foreshadowed the blood of Christ protecting believers from judgment.' }
        ],

        // PSALMS (Book 19)
        '19_2_7': [
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 88', note: 'Applied to Christ’s baptism and resurrection as the eternal Son acknowledged by the Father.' },
            { fatherId: 'athanasius', work: 'Against the Arians, II.52', note: '"Today" points to the timeless eternity of the Son’s generation and His manifestation in the incarnation.' }
        ],
        '19_22_1': [
            { fatherId: 'augustine', work: 'Exposition on Psalm 22', note: 'Christ spoke this cry not out of despair, but taking up the voice of suffering humanity—His Body, the Church.' },
            { fatherId: 'athanasius', work: 'Against the Arians, III.56', note: 'Christ bore our abandonment in His human flesh while remaining undivided in deity from the Father.' }
        ],
        '19_22_16': [
            { fatherId: 'justin', work: 'First Apology, Ch. 35', note: 'Prophetic eyewitness preview of the crucifixion: "They pierced my hands and my feet."' },
            { fatherId: 'tertullian', work: 'Against Marcion, III.19', note: 'Cites Psalm 22’s pierced hands and cast lots as proof the Old Testament foretold Jesus’s cross.' }
        ],
        '19_51_5': [
            { fatherId: 'augustine', work: 'On Merits and Forgiveness of Sins', note: 'Key proof text in the Pelagian debate showing universal human need for Christ’s cleansing grace from birth.' },
            { fatherId: 'origen', work: 'Homilies on Leviticus, 8', note: 'Notes that even infants are brought to baptism because none is free from human sinfulness.' }
        ],
        '19_110_1': [
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 32–33', note: 'Proves the Messiah is both David’s descendant and David’s divine Lord, seated at God’s right hand.' },
            { fatherId: 'chrysostom', work: 'Homilies on Hebrews, 2', note: 'The session at the right hand signifies equal honor and royal authority with the Father.' }
        ],

        // PROVERBS (Book 20)
        '20_8_22': [
            { fatherId: 'athanasius', work: 'Against the Arians, Discourse II.44–72', note: 'Centerpiece of the Arian controversy: "The Lord created [possessed] me" refers to Christ’s incarnate humanity, not His eternal deity.' },
            { fatherId: 'hilary', work: 'On the Trinity, Book XII', note: 'Explains how Wisdom’s eternal begetting differs from creation of temporal creatures.' }
        ],

        // ISAIAH (Book 23)
        '23_7_14': [
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 43 & 66', note: 'Defends the Septuagint "virgin" (parthenos) as a true miraculous sign—an ordinary young woman giving birth would be no sign.' },
            { fatherId: 'irenaeus', work: 'Against Heresies, III.21', note: 'Immanuel ("God with us") guarantees both Christ’s true humanity from Mary and His full deity.' }
        ],
        '23_9_6': [
            { fatherId: 'clement_alex', work: 'The Instructor, I.5', note: 'Celebrates the Child who is simultaneously "Mighty God" and "Prince of Peace."' },
            { fatherId: 'athanasius', work: 'Against the Arians, I.59', note: 'Demonstrates the Old Testament explicitly calls the promised Son "Mighty God."' }
        ],
        '23_53_4': [
            { fatherId: 'clement_rome', work: '1 Clement, Ch. 16', note: 'Quotes the entire Suffering Servant chapter as the supreme portrait of Christ’s humility and substitution.' },
            { fatherId: 'justin', work: 'First Apology, Ch. 50–51', note: 'Points to Isaiah 53 as the clearest prophecy of Christ’s voluntary suffering for sinners.' }
        ],
        '23_53_5': [
            { fatherId: 'athanasius', work: 'On the Incarnation, §34', note: '"By His stripes we are healed"—Christ took our wound and death so we might receive healing and life.' },
            { fatherId: 'augustine', work: 'City of God, XVIII.29', note: 'Marvels that Isaiah wrote of Christ’s wounds with the clarity of an eyewitness evangelist.' }
        ],

        // MATTHEW (Book 40)
        '40_1_23': [
            { fatherId: 'chrysostom', work: 'Homilies on Matthew, 5', note: 'Christ did not come merely to send a message, but to dwell personally among us as "God with us."' },
            { fatherId: 'irenaeus', work: 'Against Heresies, III.21', note: 'Unites Isaiah 7:14 with the incarnation of the eternal Son.' }
        ],
        '40_3_16': [
            { fatherId: 'hilary', work: 'On the Trinity, Book II', note: 'The Jordan baptism reveals all three Persons together: the Father’s voice, the Son in the water, the Spirit descending as a dove.' },
            { fatherId: 'chrysostom', work: 'Homilies on Matthew, 12', note: 'Christ was baptized not because He needed cleansing, but to sanctify the waters and fulfill all righteousness.' }
        ],
        '40_5_3': [
            { fatherId: 'augustine', work: 'On the Sermon on the Mount, I.1', note: '"Poor in spirit" means the humble who fear God and recognize they have nothing of their own to boast in.' },
            { fatherId: 'chrysostom', work: 'Homilies on Matthew, 15', note: 'Humility is placed first because it is the foundation stone of every other Christian virtue.' }
        ],
        '40_5_8': [
            { fatherId: 'gregory_nys', work: 'On the Beatitudes, Homily 6', note: 'We see God not with physical eyes, but as a clean mirror reflects the sun—by purifying the heart.' },
            { fatherId: 'augustine', work: 'On the Trinity, Book I.8', note: 'The vision of God is the highest reward of faith, prepared for hearts purified by faith.' }
        ],
        '40_6_9': [
            { fatherId: 'cyprian', work: 'On the Lord’s Prayer, Ch. 8–9', note: 'We pray "Our Father" in the plural—never as isolated individuals, but as one united family in Christ.' },
            { fatherId: 'tertullian', work: 'On Prayer, Ch. 1–2', note: 'Calls the Lord’s Prayer "a summary of the whole Gospel."' }
        ],
        '40_6_11': [
            { fatherId: 'cyprian', work: 'On the Lord’s Prayer, Ch. 18', note: 'Reads "daily bread" both as daily bodily provision and spiritually as Christ, the Bread of Life in the Eucharist.' },
            { fatherId: 'chrysostom', work: 'Homilies on Matthew, 19', note: 'Asking for "this day’s bread" trains us to rely on God daily rather than hoarding in anxious greed.' }
        ],
        '40_16_18': [
            { fatherId: 'chrysostom', work: 'Homilies on Matthew, 54', note: '"On this rock"—that is, on the faith of Peter’s confession that Jesus is the Christ, the Son of the living God.' },
            { fatherId: 'augustine', work: 'Tractates on John, 124 & Retractations', note: 'Explains that Christ Himself is the Rock (Petra), and Peter (Petrus) represents the Church built upon Him.' },
            { fatherId: 'cyprian', work: 'On the Unity of the Church, Ch. 4', note: 'Peter’s confession showcases the single origin and unity of the whole apostolate.' }
        ],
        '40_26_26': [
            { fatherId: 'chrysostom', work: 'Homilies on Matthew, 82', note: 'Christ instituted the Supper during the Passover to show He is the true fulfillment of the Old Covenant sacrifice.' },
            { fatherId: 'justin', work: 'First Apology, Ch. 66', note: 'Quotes the words of institution to explain the weekly Christian Eucharist.' },
            { fatherId: 'augustine', work: 'Against Adimantus, Ch. 12', note: 'Notes that the Lord did not hesitate to say "This is my body" when giving the sign (signum) of His body.' }
        ],
        '40_28_19': [
            { fatherId: 'didache', work: 'The Didache, Ch. 7', note: 'Prescribes the exact Matthean Triune baptismal formula in the first century.' },
            { fatherId: 'athanasius', work: 'Letters to Serapion, I.28', note: 'Proves the Trinity: the Son and Spirit are joined equally with the Father in the one saving Name—never creatures.' },
            { fatherId: 'basil', work: 'On the Holy Spirit, Ch. 10–12', note: 'Baptism into Father, Son, and Holy Spirit requires equal confession and worship of all Three.' }
        ],

        // JOHN (Book 43)
        '43_1_1': [
            { fatherId: 'augustine', work: 'Tractates on John, 1 & Confessions VII', note: 'The Word was eternally with God and IS God—co-eternal with the Father before all ages.' },
            { fatherId: 'chrysostom', work: 'Homilies on John, 2–4', note: 'John begins higher than Genesis: "In the beginning WAS the Word"—implying eternal existence without origin.' },
            { fatherId: 'irenaeus', work: 'Against Heresies, III.11', note: 'John wrote this opening specifically to refute early heretics who denied Christ’s eternal deity and role as Creator.' },
            { fatherId: 'athanasius', work: 'Against the Arians, I.11', note: 'Refutes Arius: if the Word "was" in the beginning, there was never a time when He was not.' }
        ],
        '43_1_3': [
            { fatherId: 'athanasius', work: 'On the Incarnation, §2–3', note: 'Since "all things were made through Him," the Word Himself cannot be one of the things that were made.' },
            { fatherId: 'augustine', work: 'Tractates on John, 1.16', note: 'Even sin is "nothing" (a privation of good), not a substance created by God.' }
        ],
        '43_1_14': [
            { fatherId: 'athanasius', work: 'On the Incarnation, §8', note: 'The Word became flesh without ceasing to be God—entering our mortality to clothe us with His immortality.' },
            { fatherId: 'irenaeus', work: 'Against Heresies, III.19', note: 'He became what we are so that He might bring us to be even what He is Himself.' },
            { fatherId: 'chrysostom', work: 'Homilies on John, 11', note: '"Dwelt (tabernacled) among us"—just as God’s glory filled the tabernacle, fullness of deity dwelt in Christ’s flesh.' }
        ],
        '43_3_5': [
            { fatherId: 'justin', work: 'First Apology, Ch. 61', note: 'Quotes Jesus’s words on being "born again" to explain Christian baptism as regeneration.' },
            { fatherId: 'cyril_jer', work: 'Catechetical Lecture 3.4', note: 'Water cleanses the body outwardly while the Holy Spirit seals and renews the soul inwardly.' },
            { fatherId: 'chrysostom', work: 'Homilies on John, 25', note: 'Just as the Spirit hovered over the waters in Genesis 1, so the Spirit gives new birth through baptism.' }
        ],
        '43_3_16': [
            { fatherId: 'chrysostom', work: 'Homilies on John, 27', note: 'Highlights the sheer scale of divine love: not a servant or an angel, but God’s own Only-Begotten Son.' },
            { fatherId: 'augustine', work: 'Tractates on John, 12.12', note: 'God’s love precedes our goodness—He loved the world not because it was already righteous, but to make it righteous.' }
        ],
        '43_6_53': [
            { fatherId: 'augustine', work: 'Tractates on John, 26 & On Christian Doctrine III.16', note: 'Interprets eating Christ’s flesh spiritually through abiding faith ("Believe, and thou hast eaten") and union with Christ in the Supper.' },
            { fatherId: 'ignatius', work: 'Epistle to the Romans, Ch. 7', note: 'Longs for "the bread of God, which is the flesh of Jesus Christ... and His blood, which is incorruptible love."' },
            { fatherId: 'chrysostom', work: 'Homilies on John, 46–47', note: 'Emphasizes intimate communion with Christ in the Eucharist so that believers become one body with Him.' }
        ],
        '43_10_30': [
            { fatherId: 'tertullian', work: 'Against Praxeas, Ch. 22', note: '"I and the Father ARE [plural] ONE [neuter]"—refutes both modalism (two Persons) and Arianism (one essence).' },
            { fatherId: 'augustine', work: 'Tractates on John, 48', note: 'Both words matter: "We are" refutes Sabellius; "One" refutes Arius.' }
        ],
        '43_14_6': [
            { fatherId: 'augustine', work: 'Tractates on John, 69', note: 'In His humanity Christ is the Way by which we travel; in His deity He is the Truth and Life to which we arrive.' },
            { fatherId: 'chrysostom', work: 'Homilies on John, 73', note: 'Christ is the Way so we need no other guide, and the Truth so we know His promises never fail.' }
        ],
        '43_14_28': [
            { fatherId: 'athanasius', work: 'Against the Arians, I.58', note: '"The Father is greater than I" refers to Christ’s incarnate mission as Mediator and Son—not an inferior nature.' },
            { fatherId: 'augustine', work: 'On the Trinity, Book I.7', note: 'Equal to the Father in the form of God; less than the Father in the form of a servant.' }
        ],
        '43_17_3': [
            { fatherId: 'hilary', work: 'On the Trinity, Book IX.32', note: 'Eternal life requires knowing BOTH the Father and Jesus Christ together—separating them destroys the Gospel.' },
            { fatherId: 'augustine', work: 'Tractates on John, 105', note: 'Calling the Father "the only true God" excludes idols, never the Son or the Holy Spirit.' }
        ],
        '43_20_28': [
            { fatherId: 'chrysostom', work: 'Homilies on John, 87', note: 'Thomas’s confession—"My Lord and my God!"—is accepted by Jesus without rebuke, sealing His full deity.' },
            { fatherId: 'augustine', work: 'Tractates on John, 121', note: 'Thomas touched the human wounds and confessed the hidden Godhead.' }
        ],

        // ACTS (Book 44)
        '44_2_38': [
            { fatherId: 'chrysostom', work: 'Homilies on Acts, 7', note: 'Repentance, baptism in Christ’s name, forgiveness of sins, and the gift of the Spirit form the single doorway of the Gospel.' },
            { fatherId: 'cyril_jer', work: 'Catechetical Lecture 3.15', note: 'Points to Peter’s Pentecost sermon as the universal invitation of baptismal grace.' }
        ],

        // ROMANS (Book 45)
        '45_1_20': [
            { fatherId: 'athanasius', work: 'Against the Heathen (Contra Gentes), §35–44', note: 'Creation itself acts like a harmonious lyre revealing the invisible power and artistry of its Maker.' },
            { fatherId: 'chrysostom', work: 'Homilies on Romans, 3', note: 'Even without written books, the book of heaven and earth leaves idolatry without excuse.' }
        ],
        '45_3_24': [
            { fatherId: 'augustine', work: 'On the Spirit and the Letter, Ch. 9–12', note: 'Justification is freely given by grace—not bought by merit—through the redemption accomplished in Christ.' },
            { fatherId: 'chrysostom', work: 'Homilies on Romans, 7', note: 'Paul stacks "freely" and "by His grace" together so no human pride can remain.' }
        ],
        '45_3_25': [
            { fatherId: 'chrysostom', work: 'Homilies on Romans, 7', note: 'Christ is the true mercy-seat (hilasterion) sprinkled with His own blood, showing God’s righteousness in pardoning sinners.' },
            { fatherId: 'origen', work: 'Commentary on Romans, III.8', note: 'Links Christ’s propitiatory sacrifice to the Ark’s mercy seat on the Day of Atonement.' }
        ],
        '45_3_28': [
            { fatherId: 'chrysostom', work: 'Homilies on Romans, 7', note: 'Faith alone brings righteousness apart from works of the Mosaic Law—though living faith always bears fruit.' },
            { fatherId: 'augustine', work: 'On Faith and Works & Spirit and Letter', note: 'Reconciles Paul (Rom 3:28) and James (Jas 2:24): good works do not precede justification, they follow the justified person.' }
        ],
        '45_5_12': [
            { fatherId: 'augustine', work: 'On Merits and Forgiveness of Sins, I.9–15', note: 'Landmark text for the Western doctrine of original sin and solidarity of all humanity in Adam.' },
            { fatherId: 'chrysostom', work: 'Homilies on Romans, 10', note: 'Emphasizes how Adam’s fall brought mortality and corruption to the race, far outweighed by Christ’s abundant grace.' }
        ],
        '45_6_3': [
            { fatherId: 'cyril_jer', work: 'Mystagogical Lecture 2.4', note: 'Going down into the baptismal water and rising again unites the believer visibly to Christ’s burial and resurrection.' },
            { fatherId: 'basil', work: 'On the Holy Spirit, Ch. 15', note: 'Water provides the image of death; the Spirit imparts the power of resurrection life.' }
        ],
        '45_8_28': [
            { fatherId: 'augustine', work: 'On Rebuke and Grace, Ch. 24', note: 'Even hardships—and for the repentant, even past stumbles—are woven by God’s providence for the eternal good of those who love Him.' },
            { fatherId: 'chrysostom', work: 'Homilies on Romans, 15', note: 'Afflictions cannot defeat those who love God, because God turns every trial into a crown.' }
        ],
        '45_9_5': [
            { fatherId: 'tertullian', work: 'Against Praxeas, Ch. 13', note: 'Cites Paul’s doxology calling Christ directly "God over all, blessed forever."' },
            { fatherId: 'athanasius', work: 'Against the Arians, I.10', note: 'Clear Pauline proof that the incarnate Messiah is supreme God.' }
        ],

        // 1 CORINTHIANS (Book 46)
        '46_10_16': [
            { fatherId: 'chrysostom', work: 'Homilies on 1 Corinthians, 24', note: 'Paul uses "communion/participation" (koinonia) to show real union with Christ and with one another as one bread.' },
            { fatherId: 'augustine', work: 'Sermon 227 & City of God X.6', note: 'Because we partake of one bread, we ourselves become what we receive—the united Body of Christ.' }
        ],
        '46_11_23': [
            { fatherId: 'chrysostom', work: 'Homilies on 1 Corinthians, 27', note: 'Recalls the night of betrayal to awaken awe, unity, and repentance before approaching the Lord’s Table.' },
            { fatherId: 'cyprian', work: 'Epistle 62 (To Caecilius)', note: 'Insists the church must strictly follow the Lord’s own tradition in administering the cup of wine and water.' }
        ],
        '46_15_20': [
            { fatherId: 'athanasius', work: 'On the Incarnation, §20–26', note: 'Christ as "firstfruits" guarantees our bodily resurrection—death’s tyrant grip is broken forever.' },
            { fatherId: 'chrysostom', work: 'Homilies on 1 Corinthians, 39', note: 'Just as the firstfruits guarantee the whole harvest, Christ’s rising guarantees the rising of all believers.' }
        ],

        // 2 CORINTHIANS (Book 47)
        '47_5_21': [
            { fatherId: 'chrysostom', work: 'Homilies on 2 Corinthians, 11', note: 'Marvels that Paul did not merely say "sinner," but "made Him to be sin," that we might become not merely righteous, but "the righteousness of God."' },
            { fatherId: 'augustine', work: 'Enchiridion, Ch. 41', note: 'In Old Testament idiom, Christ became our "sin-offering," bearing our guilt so His righteousness becomes ours.' }
        ],
        '47_13_14': [
            { fatherId: 'basil', work: 'On the Holy Spirit, Ch. 25', note: 'Cites Paul’s Triune benediction (grace of Christ, love of God, fellowship of the Spirit) as proof of the Spirit’s equal deity.' }
        ],

        // GALATIANS (Book 48)
        '48_2_16': [
            { fatherId: 'chrysostom', work: 'Commentary on Galatians, Ch. 2', note: 'Even Peter and Paul knew the Law could not justify; righteousness comes solely through faith in Christ.' },
            { fatherId: 'augustine', work: 'On the Spirit and the Letter, Ch. 14', note: 'The Law reveals sin; grace through faith in Christ heals and justifies.' }
        ],

        // EPHESIANS (Book 49)
        '49_2_8': [
            { fatherId: 'chrysostom', work: 'Homilies on Ephesians, 4', note: 'Even faith itself is not a boastful human achievement, because God’s grace initiated our salvation from start to finish.' },
            { fatherId: 'augustine', work: 'On the Predestination of the Saints, Ch. 12', note: 'Emphasizes that both salvation and the very faith by which we embrace it are the gracious gift of God.' }
        ],
        '49_4_5': [
            { fatherId: 'cyprian', work: 'On the Unity of the Church, Ch. 4', note: '"One Lord, one faith, one baptism" is the unbreakable bond forbidding schism in the Church.' },
            { fatherId: 'cyril_jer', work: 'Catechetical Lecture 1.7', note: 'Because there is "one baptism," true Christian baptism is never repeated.' }
        ],

        // PHILIPPIANS (Book 50)
        '50_2_6': [
            { fatherId: 'athanasius', work: 'Against the Arians, I.40–45', note: '"In the form of God" means possessing the true divine nature before taking the "form of a servant" in the incarnation.' },
            { fatherId: 'chrysostom', work: 'Homilies on Philippians, 6–7', note: 'Christ did not cling selfishly to His glory, but humbled Himself to teach us radical humility.' },
            { fatherId: 'hilary', work: 'On the Trinity, Book VIII.45', note: 'Christ’s self-emptying (kenosis) hid His majesty in servant flesh without ever losing His divine nature.' }
        ],

        // COLOSSIANS (Book 51)
        '51_1_15': [
            { fatherId: 'athanasius', work: 'Against the Arians, II.62–64', note: '"Firstborn of all creation" denotes preeminence and headship over creation—not that the Son is Himself a creature.' },
            { fatherId: 'chrysostom', work: 'Homilies on Colossians, 3', note: 'An "image" of the invisible God must Himself share the invisible divine nature.' }
        ],
        '51_2_11': [
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 43', note: 'Connects spiritual circumcision in Christ with Christian baptism replacing the physical sign.' },
            { fatherId: 'chrysostom', work: 'Homilies on Colossians, 6', note: 'Baptism is the new circumcision "made without hands," stripping off the old life of sin.' }
        ],

        // 2 TIMOTHY (Book 55)
        '55_3_16': [
            { fatherId: 'chrysostom', work: 'Homilies on 2 Timothy, 9', note: '"All Scripture is God-breathed"—therefore do not doubt its truth or neglect reading it daily.' },
            { fatherId: 'basil', work: 'Homily on Psalm 1 & Letters', note: 'Every divinely inspired Scripture serves as a public pharmacy of souls healing every spiritual ailment.' }
        ],

        // TITUS (Book 56)
        '56_3_5': [
            { fatherId: 'chrysostom', work: 'Homilies on Titus, 5', note: 'Not by works of righteousness we did, but by His mercy through the washing of regeneration and renewal of the Holy Spirit.' },
            { fatherId: 'augustine', work: 'On Grace and Free Will', note: 'Proves grace comes prior to human works of righteousness.' }
        ],

        // HEBREWS (Book 58)
        '58_1_3': [
            { fatherId: 'athanasius', work: 'Against the Arians, II.33', note: '"Radiance of His glory" proves co-eternity: just as the sun never exists without its radiance, the Father never existed without the Son.' },
            { fatherId: 'chrysostom', work: 'Homilies on Hebrews, 2', note: '"Exact imprint of His nature" shows the Son possesses the complete substance of the Father while remaining distinct as Person.' }
        ],
        '58_11_1': [
            { fatherId: 'chrysostom', work: 'Homilies on Hebrews, 21', note: 'Faith gives real present substance in the soul to the unseen promises of God.' },
            { fatherId: 'augustine', work: 'Enchiridion, Ch. 8', note: 'Faith believes unseen realities; hope expects future good; love unites both to God.' }
        ],

        // JAMES (Book 59)
        '59_2_24': [
            { fatherId: 'augustine', work: 'On Faith and Works, Ch. 14', note: 'James is refuting a dead, barren claim of faith—Paul speaks of works before faith, James of works flowing out of living faith.' }
        ],

        // 1 PETER (Book 60)
        '60_3_21': [
            { fatherId: 'tertullian', work: 'On the Resurrection, Ch. 48', note: 'Baptism saves not as washing dirt off the skin, but as the pledge of a good conscience through Christ’s resurrection.' },
            { fatherId: 'cyprian', work: 'Epistle 68 & 74', note: 'Uses Noah’s Ark as a classic image of the Church and baptismal deliverance.' }
        ],

        // 1 JOHN (Book 62)
        '62_1_7': [
            { fatherId: 'augustine', work: 'Homilies on 1 John, Homily 1', note: 'Walking in the light means honest confession and brotherly love, continually cleansed by the blood of Jesus.' }
        ],
        '62_4_8': [
            { fatherId: 'augustine', work: 'Homilies on 1 John, Homily 7', note: '"Love, and do what thou wilt"—if the root of God’s love is in you, nothing can spring from that root except good.' }
        ],

        // REVELATION (Book 66)
        '66_20_4': [
            { fatherId: 'justin', work: 'Dialogue with Trypho, Ch. 80–81', note: 'Early witness to premillennial hope (while noting many pure and pious Christians held differing views).' },
            { fatherId: 'augustine', work: 'City of God, Book XX.7–9', note: 'Landmark exposition of the "thousand years" as the present church age in which the saints reign with Christ.' }
        ]
    };

    // -------------------------------------------------------------------------
    // 5. STATE & HELPERS
    // -------------------------------------------------------------------------
    const state = {
        activeSubTab: 'topics',        // 'topics' | 'verse' | 'library'
        selectedFather: 'all',         // 'all' or father.id
        topicQuery: '',
        badgesEnabled: localStorage.getItem('lexflow_father_badges') !== 'false',
        activeVerse: { bookNum: 1, bookName: 'Genesis', chapter: 1, verse: 1 },
        ccelPopupRef: null
    };

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function showToast(msg) {
        let el = document.getElementById('lfQuickToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'lfQuickToast';
            el.style.cssText = 'position:fixed;bottom:76px;left:50%;transform:translateX(-50%);z-index:950;padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;background:#1e293b;color:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.28);transition:opacity 0.18s;';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        el.style.opacity = '1';
        clearTimeout(el.__t);
        el.__t = setTimeout(() => {
            el.classList.remove('show');
            el.style.opacity = '0';
        }, 2400);
    }

    function getBookName(bookNum) {
        if (typeof bibleBooksList !== 'undefined' && bibleBooksList[bookNum - 1]) {
            return bibleBooksList[bookNum - 1].name;
        }
        const fallback = {
            1: 'Genesis', 2: 'Exodus', 19: 'Psalms', 20: 'Proverbs', 23: 'Isaiah',
            40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts', 45: 'Romans',
            46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
            50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians',
            54: '1 Timothy', 55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews',
            59: 'James', 60: '1 Peter', 61: '2 Peter', 62: '1 John', 66: 'Revelation'
        };
        return fallback[bookNum] || 'Scripture';
    }

    // Build exact CCEL Full-Text Lucene search URL
    function buildCcelSearchUrl(luceneQuery) {
        return `https://www.ccel.org/search/fulltext/${encodeURIComponent(luceneQuery.trim())}`;
    }

    function buildCcelTopicSearchUrl(topic, fatherId) {
        const cleanTopic = (topic || '').trim();
        const quoted = /\s/.test(cleanTopic) ? `"${cleanTopic}"` : cleanTopic;
        if (!fatherId || fatherId === 'all') {
            return buildCcelSearchUrl(`title:(ANF* OR NPNF*) AND ${quoted}`);
        }
        const f = FATHER_BY_ID[fatherId];
        if (!f) return buildCcelSearchUrl(`title:(ANF* OR NPNF*) AND ${quoted}`);
        const volClause = f.vols.map((v) => `${v}*`).join(' OR ');
        // If volume holds multiple Fathers (like ANF01), include Father name for precision
        const multiAuthorVols = ['ANF01', 'ANF02', 'ANF03', 'ANF04', 'ANF05', 'ANF07', 'NPNF2-07', 'NPNF2-09'];
        const needsAuthor = f.vols.some((v) => multiAuthorVols.includes(v));
        const q = needsAuthor
            ? `title:(${volClause}) AND "${f.queryName}" AND ${quoted}`
            : `title:(${volClause}) AND ${quoted}`;
        return buildCcelSearchUrl(q);
    }

    function buildCcelScriptureSearchUrl(bookName, chapter, verse, fatherId) {
        // CCEL scriptureRef uses standard names like "John 1:1" or "1 Cor 11:23"
        const ref = `${bookName} ${chapter}:${verse}`;
        if (fatherId && fatherId !== 'all' && FATHER_BY_ID[fatherId]) {
            const f = FATHER_BY_ID[fatherId];
            const volClause = f.vols.map((v) => `${v}*`).join(' OR ');
            return buildCcelSearchUrl(`title:(${volClause}) AND scriptureRef:"${ref}"`);
        }
        return buildCcelSearchUrl(`title:(ANF* OR NPNF*) AND scriptureRef:"${ref}"`);
    }

    // -------------------------------------------------------------------------
    // 6. REUSABLE CCEL POP-OUT WINDOW (Same UX as BibleHub & SRGNT Collation)
    // -------------------------------------------------------------------------
    function openCcelPopout(url, label) {
        if (!url) return;
        const w = Math.min(1080, Math.max(760, Math.round((window.screen && window.screen.availWidth ? window.screen.availWidth : 1200) * 0.72)));
        const h = Math.min(840, Math.max(620, Math.round((window.screen && window.screen.availHeight ? window.screen.availHeight : 900) * 0.84)));
        const left = Math.max(20, Math.round(((window.screen && window.screen.availWidth ? window.screen.availWidth : 1200) - w) / 2));
        const top = Math.max(20, Math.round(((window.screen && window.screen.availHeight ? window.screen.availHeight : 900) - h) / 2));

        const features = `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=yes`;
        const win = window.open(url, 'LexFlowCCELWindow', features);
        if (win) {
            state.ccelPopupRef = win;
            try { win.focus(); } catch (e) {}
            showToast(`Opened ${label || 'CCEL'} in Pop-Out Window`);
        } else {
            // Popup blocker fallback
            window.open(url, '_blank', 'noopener');
            showToast('Opened CCEL in a new tab (allow pop-ups to use a floating window).');
        }
    }
    window.lfOpenCcelPopout = openCcelPopout;

    // -------------------------------------------------------------------------
    // 7. STYLES (External Margin Overlay for Church Icons — ZERO #flowEditor Pollution!)
    // -------------------------------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.id = 'lfChurchFathersStyles';
    styleEl.textContent = `
        #lfStudyDock #lfFathersContent > * {
            zoom: var(--lf-dock-zoom, 1);
        }

        /* Ensure #wordProcessorPane anchors our external margin overlay cleanly */
        #wordProcessorPane {
            position: relative;
        }

        /* Dedicated clean left gutter ONLY while Church Father icons are switched ON */
        body:not(.lf-hide-father-badges) #flowEditor {
            padding-left: 42px !important;
        }

        /* External overlay layer (lives OUTSIDE #flowEditor so breaks/edits NEVER touch icons!) */
        #lfFatherBadgesOverlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            pointer-events: none;
            z-index: 25;
        }
        body.lf-hide-father-badges #lfFatherBadgesOverlay {
            display: none !important;
        }

        /* Subtle, clickable Church Icon pill positioned in the clean left margin */
        .lf-father-badge {
            position: absolute;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 1px 6px;
            border-radius: 999px;
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            font-weight: 800;
            color: #b45309;
            background: rgba(254, 243, 199, 0.92);
            border: 1px solid rgba(217, 119, 6, 0.45);
            cursor: pointer;
            pointer-events: auto;
            user-select: none;
            -webkit-user-select: none;
            white-space: nowrap;
            transition: transform 0.1s ease, background-color 0.12s ease;
            touch-action: manipulation;
        }
        html.dark .lf-father-badge {
            color: #fcd34d;
            background: rgba(120, 53, 15, 0.52);
            border-color: rgba(245, 158, 11, 0.48);
        }
        .lf-father-badge:hover,
        .lf-father-badge:active {
            background: #d97706;
            color: #ffffff !important;
            border-color: #d97706;
            transform: scale(1.07);
        }
        .lf-father-badge::after {
            content: attr(data-count);
            margin-left: 3.5px;
            font-size: 9.5px;
            font-weight: 800;
        }
        body.lf-hide-father-badges .lf-father-badge {
            display: none !important;
        }
        /* Safety net: hide any legacy stray church icon if an old saved project still had one */
        #flowEditor .lf-father-badge,
        #flowEditor i.fa-church {
            display: none !important;
        }
        @media print {
            #lfFatherBadgesOverlay,
            .lf-father-badge { display: none !important; }
        }

        /* Fathers Dock Sub-Tabs & Topic Chips */
        .lf-cf-sub-btn {
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            background: rgba(255, 255, 255, 0.78);
            border: 1px solid rgba(148, 163, 184, 0.45);
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.12s ease;
        }
        html.dark .lf-cf-sub-btn {
            color: #d4d4d8;
            background: rgba(39, 39, 42, 0.82);
            border-color: rgba(82, 82, 91, 0.7);
        }
        .lf-cf-sub-btn.active {
            background: #b45309;
            border-color: #b45309;
            color: #ffffff !important;
        }

        .lf-cf-chip {
            padding: 3px 9px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            color: #92400e;
            background: rgba(254, 243, 199, 0.75);
            border: 1px solid rgba(217, 119, 6, 0.32);
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.12s ease;
        }
        html.dark .lf-cf-chip {
            color: #fde68a;
            background: rgba(120, 53, 15, 0.32);
            border-color: rgba(245, 158, 11, 0.35);
        }
        .lf-cf-chip:hover,
        .lf-cf-chip.active {
            background: #d97706;
            color: #ffffff !important;
            border-color: #d97706;
        }
    `;
    document.head.appendChild(styleEl);

    if (!state.badgesEnabled) {
        document.body.classList.add('lf-hide-father-badges');
    }

    // -------------------------------------------------------------------------
    // 8. ZERO-POLLUTION EXTERNAL CHURCH ICON OVERLAY ENGINE
    //    Never inserts anything into #flowEditor! Also scrubs any legacy icons
    //    that were auto-saved by v1 so they vanish permanently.
    // -------------------------------------------------------------------------
    let citedEntriesCache = [];
    let overlayRafId = 0;

    function scrubLegacyInlineIcons(triggerSave) {
        const ed = document.getElementById('flowEditor');
        if (!ed) return false;
        let removedAny = false;

        // 1. Remove any v1 span.lf-father-badge still sitting inside #flowEditor
        ed.querySelectorAll('.lf-father-badge').forEach((el) => {
            el.remove();
            removedAny = true;
        });

        // 2. Remove any unwrapped <i class="fa-solid fa-church"> left behind after Flow/Enter edits
        ed.querySelectorAll('i.fa-church').forEach((iconEl) => {
            const parent = iconEl.parentElement;
            iconEl.remove();
            if (parent && parent.tagName === 'SPAN' && parent.parentElement && parent.parentElement.closest('#flowEditor') && (parent.textContent || '') === '' && parent.children.length === 0) {
                parent.remove();
            }
            removedAny = true;
        });

        if (removedAny && triggerSave && typeof window.saveActiveProjectData === 'function') {
            try { window.saveActiveProjectData(false); } catch (e) {}
        }
        return removedAny;
    }

    function ensureOverlayContainer() {
        const pane = document.getElementById('wordProcessorPane');
        if (!pane) return null;
        let layer = document.getElementById('lfFatherBadgesOverlay');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'lfFatherBadgesOverlay';
            layer.setAttribute('aria-label', 'Church Father verse indicators');
            pane.appendChild(layer);
        }
        return layer;
    }

    function rebuildCitedEntriesCache() {
        const ed = document.getElementById('flowEditor');
        if (!ed) {
            citedEntriesCache = [];
            return;
        }
        scrubLegacyInlineIcons(false);

        const nextList = [];
        const seenKeys = new Set();
        const blocks = ed.querySelectorAll('div[data-book-num][data-chapter-num][data-verse-num]');

        for (let i = 0; i < blocks.length; i++) {
            const blk = blocks[i];
            const b = blk.dataset.bookNum;
            const c = blk.dataset.chapterNum;
            const v = blk.dataset.verseNum;
            if (!b || !c || !v) continue;
            const key = `${b}_${c}_${v}`;
            if (seenKeys.has(key)) continue;
            if (!VERSE_CITATIONS[key]) continue;
            if (blk.dataset.verseCont === 'true') continue;

            seenKeys.add(key);
            nextList.push({
                blk,
                key,
                bookNum: parseInt(b, 10),
                bookName: blk.dataset.bookName || getBookName(parseInt(b, 10)),
                chapter: parseInt(c, 10),
                verse: parseInt(v, 10),
                hits: VERSE_CITATIONS[key]
            });
        }
        citedEntriesCache = nextList;
    }

    function renderVisibleOverlayBadges() {
        const layer = ensureOverlayContainer();
        if (!layer) return;

        // Strictly respect Icons: Off — empty & hide the overlay immediately
        if (!state.badgesEnabled) {
            if (layer.childNodes.length) layer.innerHTML = '';
            return;
        }

        const pane = document.getElementById('wordProcessorPane');
        const ed = document.getElementById('flowEditor');
        if (!pane || !ed) return;

        const paneRect = pane.getBoundingClientRect();
        const edRect = ed.getBoundingClientRect();
        const baseLeft = Math.max(6, (edRect.left - paneRect.left) + pane.scrollLeft - pane.clientLeft);
        const minTop = paneRect.top - 500;
        const maxTop = paneRect.bottom + 500;

        // Reuse existing badge buttons by key so scroll updates do zero extra DOM churn
        const existingByKey = new Map();
        Array.from(layer.children).forEach((child) => {
            if (child.dataset && child.dataset.cfKey) {
                existingByKey.set(child.dataset.cfKey, child);
            } else {
                child.remove();
            }
        });

        const keptKeys = new Set();

        for (let i = 0; i < citedEntriesCache.length; i++) {
            const item = citedEntriesCache[i];
            if (!document.body.contains(item.blk)) continue;

            const r = item.blk.getBoundingClientRect();
            if (r.height === 0 || r.bottom < minTop || r.top > maxTop) continue;

            const topInPane = Math.round((r.top - paneRect.top) + pane.scrollTop - pane.clientTop + 3);
            keptKeys.add(item.key);

            let badge = existingByKey.get(item.key);
            if (!badge) {
                const fatherNames = item.hits
                    .map((h) => (FATHER_BY_ID[h.fatherId] ? FATHER_BY_ID[h.fatherId].name : ''))
                    .filter(Boolean)
                    .join(', ');

                badge = document.createElement('button');
                badge.type = 'button';
                badge.className = 'lf-father-badge';
                badge.dataset.cfKey = item.key;
                badge.dataset.count = String(item.hits.length);
                badge.title = `${item.hits.length} Church Father citation${item.hits.length === 1 ? '' : 's'} on ${item.bookName} ${item.chapter}:${item.verse} (${fatherNames}) — Click to view & open in CCEL`;
                badge.innerHTML = `<i class="fa-solid fa-church" aria-hidden="true"></i>`;

                badge.addEventListener('pointerdown', (e) => e.stopPropagation());
                badge.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    state.activeVerse = {
                        bookNum: item.bookNum,
                        bookName: item.bookName,
                        chapter: item.chapter,
                        verse: item.verse
                    };
                    activateFathersTabInDock('verse');
                });
                layer.appendChild(badge);
            }

            badge.style.top = `${topInPane}px`;
            badge.style.left = `${Math.round(baseLeft)}px`;
        }

        // Remove badges that scrolled far out of view
        existingByKey.forEach((node, k) => {
            if (!keptKeys.has(k)) node.remove();
        });
    }

    function scheduleOverlayRender() {
        if (overlayRafId) return;
        overlayRafId = requestAnimationFrame(() => {
            overlayRafId = 0;
            renderVisibleOverlayBadges();
        });
    }

    function installLazyVerseBadgeObserver() {
        const ed = document.getElementById('flowEditor');
        const pane = document.getElementById('wordProcessorPane');
        if (!ed || !pane || ed.dataset.lfFatherObserver) return;
        ed.dataset.lfFatherObserver = '1';

        // Clean up any legacy v1 inline church icons that were saved into the project
        scrubLegacyInlineIcons(true);
        rebuildCitedEntriesCache();
        scheduleOverlayRender();

        // Sync overlay smoothly on scroll & resize
        pane.addEventListener('scroll', scheduleOverlayRender, { passive: true });
        window.addEventListener('resize', scheduleOverlayRender, { passive: true });

        // Whenever #flowEditor changes (line breaks, indents, Bible switches, project loads),
        // rebuild the lightweight ~60-item index and reposition external badges cleanly
        let mutTimer = 0;
        const mo = new MutationObserver(() => {
            clearTimeout(mutTimer);
            mutTimer = setTimeout(() => {
                scrubLegacyInlineIcons(false);
                rebuildCitedEntriesCache();
                scheduleOverlayRender();
            }, 90);
        });
        mo.observe(ed, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

        // Also resync when switching Read / Flow / Research mode or opening Study Dock
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest('.lf-mode-pill, #lfToggleStudyDockBtn, #btnLoadSelectedText')) {
                setTimeout(() => {
                    rebuildCitedEntriesCache();
                    scheduleOverlayRender();
                }, 140);
            }
        }, true);
    }

    function toggleVerseBadges() {
        state.badgesEnabled = !state.badgesEnabled;
        document.body.classList.toggle('lf-hide-father-badges', !state.badgesEnabled);
        try { localStorage.setItem('lexflow_father_badges', String(state.badgesEnabled)); } catch (e) {}

        // Also scrub any stray legacy icons immediately when toggling
        scrubLegacyInlineIcons(true);
        if (state.badgesEnabled) {
            rebuildCitedEntriesCache();
        }
        scheduleOverlayRender();

        // Resync LexFlow's own Flow lines/controls if padding changed
        if (typeof window.syncOverlayControls === 'function') {
            setTimeout(() => {
                try { window.syncOverlayControls(); } catch (e) {}
            }, 60);
        }

        const btn = document.getElementById('lfCfBadgeToggleBtn');
        if (btn) {
            btn.classList.toggle('!bg-amber-600', state.badgesEnabled);
            btn.classList.toggle('!text-white', state.badgesEnabled);
            btn.innerHTML = `<i class="fa-solid fa-church mr-1"></i>Icons: ${state.badgesEnabled ? 'On' : 'Off'}`;
        }
        showToast(state.badgesEnabled
            ? 'Church Father verse icons ON'
            : 'Church Father verse icons hidden');
    }

    // -------------------------------------------------------------------------
    // 9. AUTOMATIC KUDOS ATTRIBUTION (CCEL & CALVIN COLLEGE / CALVIN UNIVERSITY)
    // -------------------------------------------------------------------------
    const CCEL_KUDOS_CARD_HTML = `
        <div id="lfCcelKudosCard" class="p-3 rounded-xl bg-amber-50/85 dark:bg-amber-950/35 border border-amber-300/80 dark:border-amber-700/70 space-y-1 mt-2">
            <div class="flex items-center justify-between gap-2">
                <div class="text-xs font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <i class="fa-solid fa-church text-amber-600 dark:text-amber-400"></i>
                    <span>Christian Classics Ethereal Library (CCEL) &amp; Calvin College</span>
                </div>
                <button type="button" class="lf-kudos-ccel-open text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer">
                    ccel.org ↗
                </button>
            </div>
            <p class="text-[11.5px] leading-relaxed text-amber-950/90 dark:text-amber-100/90">
                Heartfelt kudos to the <strong>Christian Classics Ethereal Library (CCEL)</strong>, founded by Dr. Harry Plantinga and hosted at <strong>Calvin College (Calvin University)</strong>, for making Philip Schaff’s 37-volume <em>Ante-Nicene, Nicene, and Post-Nicene Fathers</em> and classic Christian literature freely accessible to the world.
            </p>
        </div>
    `;

    function injectCcelIntoKudosModal() {
        if (document.getElementById('lfCcelKudosCard')) return;

        // Look for any Kudos / Credits / Acknowledgments heading or container anywhere in the DOM
        const allEls = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, section, p, strong, span'));
        let targetContainer = null;

        for (let i = 0; i < allEls.length; i++) {
            const el = allEls[i];
            if (el.closest('#lfStudyDock, #flowEditor')) continue;
            const txt = (el.textContent || '').trim();
            if (txt.length > 0 && txt.length < 90 && /\b(kudos|acknowledg|credits|special thanks)\b/i.test(txt)) {
                // Find the closest card/list container holding the other Kudos items
                const modalBody = el.closest('.overflow-y-auto, .space-y-3, .space-y-4, .space-y-2, section, .glass-panel') || el.parentElement;
                if (modalBody && !modalBody.closest('#lfStudyDock')) {
                    targetContainer = modalBody;
                    break;
                }
            }
        }

        if (!targetContainer) return;

        const wrap = document.createElement('div');
        wrap.innerHTML = CCEL_KUDOS_CARD_HTML.trim();
        const card = wrap.firstElementChild;
        card.querySelector('.lf-kudos-ccel-open')?.addEventListener('click', (e) => {
            e.preventDefault();
            openCcelPopout('https://www.ccel.org/fathers', 'CCEL Early Church Fathers');
        });
        targetContainer.appendChild(card);
    }

    function watchForKudosOpening() {
        injectCcelIntoKudosModal();
        // Also check whenever user clicks Settings / Kudos / About buttons (in case modal renders lazily)
        document.addEventListener('click', (e) => {
            const btn = e.target && e.target.closest('button, a');
            if (!btn) return;
            const txt = (btn.textContent || btn.title || '').toLowerCase();
            if (/kudos|credit|about|setting|acknow/.test(txt)) {
                setTimeout(injectCcelIntoKudosModal, 80);
                setTimeout(injectCcelIntoKudosModal, 350);
            }
        }, true);
    }

    // -------------------------------------------------------------------------
    // 10. STUDY DOCK "FATHERS" TAB UI & RENDERERS
    // -------------------------------------------------------------------------
    function getActiveVerseFromWorkspace() {
        const blk = (typeof lastSelectedBlock !== 'undefined' && lastSelectedBlock && lastSelectedBlock.dataset && lastSelectedBlock.dataset.bookNum)
            ? lastSelectedBlock
            : (typeof findTopVisibleVerseBlock === 'function' ? findTopVisibleVerseBlock() : null);

        if (blk && blk.dataset && blk.dataset.bookNum) {
            const b = parseInt(blk.dataset.bookNum, 10) || 1;
            return {
                bookNum: b,
                bookName: blk.dataset.bookName || getBookName(b),
                chapter: parseInt(blk.dataset.chapterNum, 10) || 1,
                verse: parseInt(blk.dataset.verseNum, 10) || 1
            };
        }
        return state.activeVerse;
    }

    function activateFathersTabInDock(subTab) {
        const dock = document.getElementById('lfStudyDock');
        if (!dock) return;

        if (!dock.classList.contains('open') && typeof window.lfOpenStudyDock === 'function') {
            window.lfOpenStudyDock('compare');
        }

        dock.querySelectorAll('.lf-dock-tab-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.dockTab === 'fathers');
        });
        ['lexicon', 'compare', 'notes', 'brief', 'fathers'].forEach((t) => {
            const p = document.getElementById(`lfDockPanel_${t}`);
            if (p) p.classList.toggle('hidden', t !== 'fathers');
        });

        const popBtn = document.getElementById('lfDockPopOutBtn');
        if (popBtn) popBtn.classList.add('hidden');

        if (subTab) state.activeSubTab = subTab;
        if (state.activeSubTab === 'verse' && !subTab) {
            state.activeVerse = getActiveVerseFromWorkspace();
        }
        syncSubTabButtons();
        renderFathersPanel();
    }

    function syncSubTabButtons() {
        const panel = document.getElementById('lfDockPanel_fathers');
        if (!panel) return;
        panel.querySelectorAll('.lf-cf-sub-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.cfSub === state.activeSubTab);
        });
    }

    function renderFathersPanel() {
        const content = document.getElementById('lfFathersContent');
        if (!content) return;

        if (state.activeSubTab === 'verse') {
            renderVerseCitationsView(content);
        } else if (state.activeSubTab === 'library') {
            renderFathersLibraryView(content);
        } else {
            renderTopicSearchView(content);
        }
    }

    function renderTopicSearchView(content) {
        const q = (state.topicQuery || '').trim();
        const qLow = q.toLowerCase();
        const fId = state.selectedFather;
        const selectedFatherObj = fId !== 'all' ? FATHER_BY_ID[fId] : null;
        const scopeLabel = selectedFatherObj ? selectedFatherObj.name : 'ALL Church Fathers (37 CCEL Volumes)';

        const chipsHtml = QUICK_TOPICS.map((t) => {
            const isAct = qLow === t.toLowerCase();
            return `<button type="button" class="lf-cf-chip ${isAct ? 'active' : ''}" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`;
        }).join('');

        // Filter curated topic guide
        const matches = TOPIC_ENTRIES.filter((entry) => {
            if (fId !== 'all' && entry.fatherId !== fId) return false;
            if (!qLow) return true;
            const father = FATHER_BY_ID[entry.fatherId];
            const hay = `${entry.topics.join(' ')} ${entry.work} ${entry.summary} ${father ? father.name : ''}`.toLowerCase();
            return qLow.split(/\s+/).every((part) => hay.includes(part));
        });

        // Live CCEL full-text search banner (handles ANY topic — curated or custom!)
        const liveCcelUrl = q
            ? buildCcelTopicSearchUrl(q, fId)
            : (selectedFatherObj ? selectedFatherObj.ccelUrl : 'https://www.ccel.org/fathers');

        const liveBannerHtml = q ? `
            <div class="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/50 dark:to-amber-950/35 border border-indigo-200 dark:border-indigo-700/70 flex flex-wrap items-center justify-between gap-2">
                <div class="min-w-0">
                    <div class="text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                        <i class="fa-solid fa-magnifying-glass mr-1"></i>Full-Text Search CCEL for “${escapeHtml(q)}”
                    </div>
                    <div class="text-[11px] text-gray-600 dark:text-gray-300">
                        Scope: <strong>${escapeHtml(scopeLabel)}</strong> — opens directly in a pop-out window.
                    </div>
                </div>
                <button type="button" id="lfCfLivePopoutBtn" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer shrink-0">
                    Pop-Out CCEL Search ↗
                </button>
            </div>
        ` : '';

        const cardsHtml = matches.length
            ? matches.map((m, idx) => {
                const f = FATHER_BY_ID[m.fatherId] || { name: 'Church Father', era: '', ccelUrl: 'https://www.ccel.org/fathers' };
                const searchUrl = buildCcelSearchUrl(m.ccelSearch);
                return `
                    <div class="p-3 rounded-xl bg-white dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 space-y-1.5">
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <div class="text-xs font-extrabold text-gray-900 dark:text-white flex items-center flex-wrap gap-1.5">
                                    <span>${escapeHtml(f.name)}</span>
                                    <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">${escapeHtml(f.era)}</span>
                                    <span class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">${escapeHtml(m.vol)}</span>
                                </div>
                                <div class="text-[11.5px] font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">${escapeHtml(m.work)}</div>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-gray-700 dark:text-gray-200">${escapeHtml(m.summary)}</p>
                        <div class="flex flex-wrap items-center gap-1.5 pt-1">
                            <button type="button" class="lf-cf-pop-btn px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer transition" data-url="${escapeHtml(searchUrl)}" data-label="${escapeHtml(f.name + ' — ' + m.work)}">
                                <i class="fa-solid fa-up-right-from-square mr-1"></i>Open Exact Passage on CCEL
                            </button>
                            <button type="button" class="lf-cf-pop-btn px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-indigo-600 hover:text-white text-gray-700 dark:text-gray-200 text-[11px] font-bold cursor-pointer transition" data-url="${escapeHtml(m.ccelDirect)}" data-label="${escapeHtml(m.vol + ' Contents')}">
                                Browse ${escapeHtml(m.vol)} TOC ↗
                            </button>
                        </div>
                    </div>
                `;
            }).join('')
            : `<div class="p-4 rounded-xl bg-amber-50/70 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-xs text-gray-700 dark:text-gray-200 space-y-2">
                <div>No pre-indexed quick card matched <strong>“${escapeHtml(q)}”</strong> for <strong>${escapeHtml(scopeLabel)}</strong> — click <strong>Pop-Out CCEL Search ↗</strong> above to search the entire full text of CCEL’s 37 Church Fathers volumes instantly!</div>
               </div>`;

        content.innerHTML = `
            <div class="space-y-1.5">
                <div class="text-[10.5px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">Popular Topics</div>
                <div class="flex flex-wrap gap-1.5">${chipsHtml}</div>
            </div>
            ${liveBannerHtml}
            <div class="space-y-2.5">
                <div class="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    <span>Curated Primary Passages (${matches.length})</span>
                    <span>Opens in CCEL Pop-Out Window</span>
                </div>
                ${cardsHtml}
            </div>
            ${renderCcelAttributionFooter()}
        `;

        content.querySelectorAll('.lf-cf-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const t = chip.dataset.topic || '';
                state.topicQuery = (state.topicQuery.toLowerCase() === t.toLowerCase()) ? '' : t;
                const inp = document.getElementById('lfCfTopicInput');
                if (inp) inp.value = state.topicQuery;
                renderTopicSearchView(content);
            });
        });

        content.querySelector('#lfCfLivePopoutBtn')?.addEventListener('click', () => {
            openCcelPopout(liveCcelUrl, `CCEL: ${q} (${scopeLabel})`);
        });

        content.querySelectorAll('.lf-cf-pop-btn').forEach((btn) => {
            btn.addEventListener('click', () => openCcelPopout(btn.dataset.url, btn.dataset.label));
        });
        wireFooterLinks(content);
    }

    function renderVerseCitationsView(content) {
        const ref = state.activeVerse || getActiveVerseFromWorkspace();
        const refLabel = `${ref.bookName} ${ref.chapter}:${ref.verse}`;
        const key = `${ref.bookNum}_${ref.chapter}_${ref.verse}`;
        const hits = VERSE_CITATIONS[key] || [];
        const homilies = BOOK_HOMILIES[ref.bookNum] || [];
        const ccelVerseUrl = buildCcelScriptureSearchUrl(ref.bookName, ref.chapter, ref.verse, state.selectedFather);

        const hitsHtml = hits.length
            ? hits.map((h) => {
                const f = FATHER_BY_ID[h.fatherId] || { name: 'Church Father', era: '', vols: ['ANF01'], ccelUrl: 'https://www.ccel.org/fathers' };
                const directVerseSearch = buildCcelScriptureSearchUrl(ref.bookName, ref.chapter, ref.verse, f.id);
                return `
                    <div class="p-3 rounded-xl bg-white dark:bg-zinc-800/90 border border-amber-200/90 dark:border-amber-800/70 space-y-1.5">
                        <div class="flex items-center justify-between gap-2">
                            <div class="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                <i class="fa-solid fa-church text-amber-600 text-[11px]"></i>
                                <span>${escapeHtml(f.name)}</span>
                                <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">${escapeHtml(f.era)}</span>
                            </div>
                        </div>
                        <div class="text-[11.5px] font-bold text-indigo-700 dark:text-indigo-300">${escapeHtml(h.work)}</div>
                        <p class="text-xs leading-relaxed text-gray-700 dark:text-gray-200">${escapeHtml(h.note)}</p>
                        <div class="flex flex-wrap gap-1.5 pt-1">
                            <button type="button" class="lf-cf-pop-btn px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer" data-url="${escapeHtml(directVerseSearch)}" data-label="${escapeHtml(f.name + ' on ' + refLabel)}">
                                Open ${escapeHtml(f.name)} on ${escapeHtml(refLabel)} ↗
                            </button>
                            <button type="button" class="lf-cf-pop-btn px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-indigo-600 hover:text-white text-gray-700 dark:text-gray-200 text-[11px] font-bold cursor-pointer" data-url="${escapeHtml(f.ccelUrl)}" data-label="${escapeHtml(f.name + ' on CCEL')}">
                                Browse Volume ↗
                            </button>
                        </div>
                    </div>
                `;
            }).join('')
            : `<div class="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-gray-300">
                No pre-cached quick card for <strong>${escapeHtml(refLabel)}</strong> yet — use the button above to search all <strong>37 ANF &amp; NPNF volumes on CCEL</strong> for every Church Father who quoted <strong>${escapeHtml(refLabel)}</strong>!
               </div>`;

        const homiliesHtml = homilies.length
            ? `<div class="p-3 rounded-xl bg-indigo-50/75 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/70 space-y-2">
                <div class="text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
                    <i class="fa-solid fa-scroll mr-1.5"></i>Full Patristic Homilies on ${escapeHtml(ref.bookName)} (CCEL)
                </div>
                <div class="space-y-1.5">
                    ${homilies.map((hm) => {
                        const f = FATHER_BY_ID[hm.fatherId];
                        return `
                            <button type="button" class="lf-cf-pop-btn w-full p-2 rounded-lg bg-white dark:bg-zinc-800 hover:border-indigo-500 border border-gray-200 dark:border-zinc-700 flex items-center justify-between gap-2 text-left cursor-pointer" data-url="${escapeHtml(hm.url)}" data-label="${escapeHtml((f ? f.name : '') + ' — ' + hm.work)}">
                                <div class="min-w-0">
                                    <div class="text-xs font-bold text-gray-900 dark:text-white truncate">${escapeHtml(f ? f.name : '')}: ${escapeHtml(hm.work)}</div>
                                    <div class="text-[10.5px] text-gray-500 dark:text-gray-400">CCEL Volume ${escapeHtml(hm.vol)}</div>
                                </div>
                                <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">Pop-Out ↗</span>
                            </button>`;
                    }).join('')}
                </div>
               </div>`
            : '';

        content.innerHTML = `
            <div class="p-3.5 rounded-xl bg-amber-50/85 dark:bg-amber-950/35 border border-amber-300 dark:border-amber-700/80 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div class="text-xs font-extrabold text-amber-950 dark:text-amber-200">
                        <i class="fa-solid fa-church mr-1.5 text-amber-600"></i>Patristic Citations for ${escapeHtml(refLabel)}
                    </div>
                    <div class="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                        ${hits.length ? `${hits.length} highlighted citation${hits.length === 1 ? '' : 's'} + live 37-volume CCEL lookup` : 'Live 37-volume CCEL Scripture citation lookup'}
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <button type="button" id="lfCfSyncVerseBtn" class="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-amber-300 dark:border-zinc-600 text-amber-900 dark:text-amber-200 text-[11px] font-bold cursor-pointer" title="Sync to visible/tapped verse">
                        <i class="fa-solid fa-crosshairs mr-1"></i>Sync
                    </button>
                    <button type="button" id="lfCfPopVerseAllBtn" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm cursor-pointer">
                        Search All CCEL ↗
                    </button>
                </div>
            </div>

            <div class="space-y-2.5">${hitsHtml}</div>
            ${homiliesHtml}
            ${renderCcelAttributionFooter()}
        `;

        content.querySelector('#lfCfSyncVerseBtn')?.addEventListener('click', () => {
            state.activeVerse = getActiveVerseFromWorkspace();
            renderVerseCitationsView(content);
        });
        content.querySelector('#lfCfPopVerseAllBtn')?.addEventListener('click', () => {
            openCcelPopout(ccelVerseUrl, `CCEL Citations: ${refLabel}`);
        });
        content.querySelectorAll('.lf-cf-pop-btn').forEach((btn) => {
            btn.addEventListener('click', () => openCcelPopout(btn.dataset.url, btn.dataset.label));
        });
        wireFooterLinks(content);
    }

    function renderFathersLibraryView(content) {
        const grouped = { Apostolic: [], 'Ante-Nicene': [], Nicene: [], 'Post-Nicene': [] };
        FATHERS.forEach((f) => {
            if (!grouped[f.series]) grouped[f.series] = [];
            grouped[f.series].push(f);
        });

        const sectionsHtml = Object.entries(grouped).map(([eraName, list]) => `
            <div class="space-y-1.5">
                <div class="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">${escapeHtml(eraName)} Fathers</div>
                <div class="space-y-1.5">
                    ${list.map((f) => `
                        <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 flex items-center justify-between gap-2">
                            <div class="min-w-0">
                                <div class="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                    <span>${escapeHtml(f.name)}</span>
                                    <span class="text-[10px] font-bold text-gray-500">(${escapeHtml(f.era)})</span>
                                </div>
                                <div class="text-[11px] text-gray-500 dark:text-gray-400 truncate">${escapeHtml(f.works)}</div>
                            </div>
                            <div class="flex items-center gap-1 shrink-0">
                                <button type="button" class="lf-cf-filter-father-btn px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-600 hover:text-white text-amber-900 dark:text-amber-200 text-[10.5px] font-bold cursor-pointer" data-fid="${escapeHtml(f.id)}" title="Search topics in ${escapeHtml(f.name)}">
                                    Topics
                                </button>
                                <button type="button" class="lf-cf-pop-btn px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-bold cursor-pointer" data-url="${escapeHtml(f.ccelUrl)}" data-label="${escapeHtml(f.name + ' (CCEL)')}">
                                    CCEL ↗
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        content.innerHTML = `
            <div class="p-3 rounded-xl bg-indigo-50/75 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-2">
                <div class="text-xs text-indigo-950 dark:text-indigo-200">
                    <strong>All 37 Volumes:</strong> Open CCEL’s complete Early Church Fathers hub.
                </div>
                <button type="button" class="lf-cf-pop-btn px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shrink-0" data-url="https://www.ccel.org/fathers" data-label="CCEL Early Church Fathers">
                    Open CCEL Hub ↗
                </button>
            </div>
            <div class="space-y-3">${sectionsHtml}</div>
            ${renderCcelAttributionFooter()}
        `;

        content.querySelectorAll('.lf-cf-filter-father-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                state.selectedFather = btn.dataset.fid || 'all';
                const sel = document.getElementById('lfCfFatherSelect');
                if (sel) sel.value = state.selectedFather;
                state.activeSubTab = 'topics';
                syncSubTabButtons();
                renderFathersPanel();
            });
        });
        content.querySelectorAll('.lf-cf-pop-btn').forEach((btn) => {
            btn.addEventListener('click', () => openCcelPopout(btn.dataset.url, btn.dataset.label));
        });
        wireFooterLinks(content);
    }

    function renderCcelAttributionFooter() {
        return `
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-700 text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong class="text-gray-800 dark:text-gray-200">Kudos &amp; Attribution:</strong> Patristic links powered by the
                <button type="button" class="lf-cf-footer-link font-bold text-indigo-700 dark:text-indigo-300 underline cursor-pointer" data-url="https://www.ccel.org">Christian Classics Ethereal Library (CCEL)</button>
                at <strong>Calvin College (Calvin University)</strong>.
            </div>
        `;
    }

    function wireFooterLinks(container) {
        container.querySelectorAll('.lf-cf-footer-link').forEach((btn) => {
            btn.addEventListener('click', () => openCcelPopout(btn.dataset.url, 'CCEL — Calvin College'));
        });
    }

    // -------------------------------------------------------------------------
    // 11. MOUNT INTO STUDY DOCK + RESEARCH BAR + SHORTCUT (Cmd+Shift+C)
    // -------------------------------------------------------------------------
    function mountFathersIntoStudyDock() {
        const dock = document.getElementById('lfStudyDock');
        if (!dock || document.getElementById('lfDockPanel_fathers')) return false;

        const tabsRow = dock.querySelector('.lf-dock-tab-btn')?.parentElement;
        if (tabsRow && !tabsRow.querySelector('[data-dock-tab="fathers"]')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lf-dock-tab-btn';
            btn.dataset.dockTab = 'fathers';
            btn.title = `Early Church Fathers Topic Search & CCEL Citations (${MOD}⇧C)`;
            btn.innerHTML = `<i class="fa-solid fa-church text-[11px]"></i><span>Fathers</span>`;
            btn.addEventListener('click', () => activateFathersTabInDock());
            tabsRow.appendChild(btn);

            tabsRow.querySelectorAll('.lf-dock-tab-btn:not([data-dock-tab="fathers"])').forEach((origBtn) => {
                origBtn.addEventListener('click', () => {
                    btn.classList.remove('active');
                    const fp = document.getElementById('lfDockPanel_fathers');
                    if (fp) fp.classList.add('hidden');
                });
            });
        }

        const fatherOptionsHtml = [
            `<option value="all">All Church Fathers (37 CCEL Vols)</option>`,
            ...FATHERS.map((f) => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)} (${escapeHtml(f.era)})</option>`)
        ].join('');

        const panel = document.createElement('div');
        panel.id = 'lfDockPanel_fathers';
        panel.className = 'flex-1 flex flex-col min-h-0 overflow-hidden hidden';
        panel.innerHTML = `
            <div class="px-3.5 py-2.5 border-b border-gray-200/80 dark:border-zinc-700/80 bg-amber-50/75 dark:bg-zinc-900/70 space-y-2 shrink-0">
                <div class="flex flex-wrap items-center gap-1.5">
                    <input type="text" id="lfCfTopicInput" placeholder="Topic (e.g. atonement, baptism, Lord's Supper)..."
                           class="select-text flex-1 min-w-[155px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-amber-300 dark:border-zinc-700 text-xs font-semibold text-gray-800 dark:text-gray-100 outline-none">
                    <button type="button" id="lfCfSearchPopoutBtn" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0" title="Search CCEL in Pop-Out Window">
                        CCEL ↗
                    </button>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                    <select id="lfCfFatherSelect" class="flex-1 min-w-[165px] px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-amber-300/80 dark:border-zinc-700 text-[11.5px] font-bold text-gray-800 dark:text-gray-100 outline-none cursor-pointer">
                        ${fatherOptionsHtml}
                    </select>
                    <button type="button" id="lfCfBadgeToggleBtn" class="px-2.5 py-1 rounded-lg ${state.badgesEnabled ? '!bg-amber-600 !text-white' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200'} border border-amber-300 dark:border-zinc-700 text-[11px] font-bold cursor-pointer shrink-0" title="Show or hide church icons next to cited verses">
                        <i class="fa-solid fa-church mr-1"></i>Icons: ${state.badgesEnabled ? 'On' : 'Off'}
                    </button>
                </div>
                <div class="flex items-center flex-wrap gap-1">
                    <button type="button" class="lf-cf-sub-btn active" data-cf-sub="topics">Topic Search</button>
                    <button type="button" class="lf-cf-sub-btn" data-cf-sub="verse">This Verse</button>
                    <button type="button" class="lf-cf-sub-btn" data-cf-sub="library">22 Fathers &amp; CCEL</button>
                </div>
            </div>
            <div id="lfFathersContent" class="flex-1 p-3.5 overflow-y-auto custom-scrollbar space-y-3"></div>
        `;
        dock.appendChild(panel);

        // Wire search input (debounced for snappy tablet typing)
        const topicInp = document.getElementById('lfCfTopicInput');
        let inputTimer = 0;
        topicInp.addEventListener('input', () => {
            state.topicQuery = topicInp.value;
            if (state.activeSubTab !== 'topics') {
                state.activeSubTab = 'topics';
                syncSubTabButtons();
            }
            clearTimeout(inputTimer);
            inputTimer = setTimeout(() => renderFathersPanel(), 140);
        });
        topicInp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                state.topicQuery = topicInp.value;
                renderFathersPanel();
                if (state.topicQuery.trim()) {
                    const fObj = state.selectedFather !== 'all' ? FATHER_BY_ID[state.selectedFather] : null;
                    openCcelPopout(
                        buildCcelTopicSearchUrl(state.topicQuery, state.selectedFather),
                        `CCEL: ${state.topicQuery} (${fObj ? fObj.name : 'All Fathers'})`
                    );
                }
            }
        });

        document.getElementById('lfCfSearchPopoutBtn').addEventListener('click', () => {
            const q = (topicInp.value || '').trim();
            const fObj = state.selectedFather !== 'all' ? FATHER_BY_ID[state.selectedFather] : null;
            if (q) {
                openCcelPopout(buildCcelTopicSearchUrl(q, state.selectedFather), `CCEL: ${q}`);
            } else if (fObj) {
                openCcelPopout(fObj.ccelUrl, `${fObj.name} (CCEL)`);
            } else {
                openCcelPopout('https://www.ccel.org/fathers', 'CCEL Early Church Fathers');
            }
        });

        const fatherSelect = document.getElementById('lfCfFatherSelect');
        fatherSelect.addEventListener('change', () => {
            state.selectedFather = fatherSelect.value || 'all';
            renderFathersPanel();
        });

        document.getElementById('lfCfBadgeToggleBtn').addEventListener('click', toggleVerseBadges);

        panel.querySelectorAll('.lf-cf-sub-btn').forEach((b) => {
            b.addEventListener('click', () => {
                state.activeSubTab = b.dataset.cfSub || 'topics';
                if (state.activeSubTab === 'verse') {
                    state.activeVerse = getActiveVerseFromWorkspace();
                }
                syncSubTabButtons();
                renderFathersPanel();
            });
        });

        // Also add a quick button to Research Mode bar if present
        const rqBar = document.getElementById('lfResearchQuickBar');
        if (rqBar && !rqBar.querySelector('[data-rq="fathers"]')) {
            const firstWrap = rqBar.firstElementChild;
            if (firstWrap) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'lf-rq-btn';
                b.dataset.rq = 'fathers';
                b.innerHTML = `<i class="fa-solid fa-church text-amber-600"></i><span>Church Fathers</span>`;
                b.addEventListener('click', () => activateFathersTabInDock('topics'));
                firstWrap.appendChild(b);
            }
        }

        return true;
    }

    // Keyboard shortcut: Cmd+Shift+C / Ctrl+Shift+C -> Open Church Fathers tab
    document.addEventListener('keydown', (e) => {
        const modPressed = isMac ? e.metaKey : e.ctrlKey;
        if (!modPressed || !e.shiftKey || e.altKey) return;
        const tag = (e.target && e.target.tagName) || '';
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        if ((e.key || '').toLowerCase() === 'c') {
            e.preventDefault();
            activateFathersTabInDock('topics');
        }
    });

    window.lfOpenChurchFathers = (sub) => activateFathersTabInDock(sub || 'topics');

    function initChurchFathers() {
        installLazyVerseBadgeObserver();
        watchForKudosOpening();

        if (!mountFathersIntoStudyDock()) {
            let tries = 0;
            const t = setInterval(() => {
                tries++;
                if (mountFathersIntoStudyDock() || tries > 30) clearInterval(t);
            }, 150);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initChurchFathers, 260));
    } else {
        setTimeout(initChurchFathers, 260);
    }
})();
