"""Turing's library: the academic library as stations you open one at a time, plus the Writing desk
(Chicago author-date: front page, citations, figures, block quotes, references). Runs after the other library
generators and only wraps their sections, so every section and id stays intact. Safe to rerun: it removes its
own wrappers first."""
from pathlib import Path
from html import escape
import re

ICON = {
 'find': '<circle class="lq-scan" cx="30" cy="30" r="14" fill="none" stroke="#ffd23f" stroke-width="5"/><path d="M40 40l14 14" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/>',
 'genre': '<circle cx="32" cy="32" r="22" fill="none" stroke="#8cdec5" stroke-width="4"/><path class="lq-spin" d="M32 14l6 18-6 18-6-18Z" fill="#ff5fd2" stroke="#080e15" stroke-width="2"/>',
 'bergen': '<path d="M6 52l16-22 10 12 10-18 16 28Z" fill="#6fb7ff" stroke="#080e15" stroke-width="3"/><circle class="lq-sun" cx="48" cy="14" r="6" fill="#ffd23f"/>',
 'desk': '<rect x="10" y="40" width="44" height="8" fill="#e9ca85" stroke="#080e15" stroke-width="3"/><path d="M20 40V22l14-10" fill="none" stroke="#080e15" stroke-width="4"/><path class="lq-lamp" d="M30 8l14 6-6 10Z" fill="#ffd23f" stroke="#080e15" stroke-width="2"/>',
 'books': '<rect class="lq-book" x="12" y="14" width="10" height="38" fill="#ff7a59" stroke="#080e15" stroke-width="3"/><rect x="24" y="20" width="10" height="32" fill="#c6f15b" stroke="#080e15" stroke-width="3"/><rect class="lq-book lq-d2" x="36" y="10" width="10" height="42" fill="#6fb7ff" stroke="#080e15" stroke-width="3"/><path d="M6 54h52" stroke="#080e15" stroke-width="4"/>',
 'make': '<rect x="10" y="30" width="22" height="24" fill="#8cdec5" stroke="#080e15" stroke-width="3"/><path class="lq-ham" d="M40 10l14 14-6 6-14-14Z M38 24L22 40" fill="#e9ca85" stroke="#080e15" stroke-width="3"/>',
 'look': '<path d="M32 10a22 22 0 1 0 6 43c-4-6 0-10 6-8 8 2 10-8 4-16a22 22 0 0 0-16-19Z" fill="#e9ca85" stroke="#080e15" stroke-width="3"/><circle class="lq-dot" cx="22" cy="26" r="4" fill="#ff5fd2"/><circle class="lq-dot lq-d2" cx="34" cy="20" r="4" fill="#6fb7ff"/><circle class="lq-dot lq-d3" cx="20" cy="40" r="4" fill="#c6f15b"/>',
 'fields': '<circle class="lq-dot" cx="22" cy="30" r="14" fill="#ff5fd2" fill-opacity=".8" stroke="#080e15" stroke-width="3"/><circle class="lq-dot lq-d2" cx="42" cy="30" r="14" fill="#6fb7ff" fill-opacity=".8" stroke="#080e15" stroke-width="3"/>',
 'write': '<rect x="14" y="8" width="34" height="46" fill="#edf4dd" stroke="#080e15" stroke-width="3"/><path d="M20 20h22M20 28h22M20 36h14" stroke="#8aa0b8" stroke-width="3"/><path class="lq-pen" d="M40 46l14-18 5 4-14 18-7 2Z" fill="#ff5fd2" stroke="#080e15" stroke-width="2"/>',
}

# key, icon, title, promise, minutes, ids that move into this station (in page order)
STATIONS = [
 ('find', 'find', 'Find my research', 'Describe it. Get search words.', '5 min', ['research-finder', 'course-workbench']),
 ('genre', 'genre', 'Genre explorer', 'What kind of work is it?', '5-10 min', ['genre-explorer']),
 ('bergen', 'bergen', 'Made in Bergen', 'Research from your own university.', '5 min', ['bergen-research', '@ge-full-table']),
 ('desk', 'desk', 'Research desk', 'Find one real article.', '10 min', ['find-articles']),
 ('books', 'books', 'Book archive', '14 books to start from.', 'browse', ['sources', '@al-count', '@al-shelves']),
 ('make', 'make', 'Make it, study it', 'Building and research together.', '5 min', ['building-and-research']),
 ('look', 'look', 'Aesthetics bench', 'Same task. Different mood.', '3 min', ['aesthetics']),
 ('fields', 'fields', 'Across fields', 'Mix subjects. Make it precise.', '5 min', ['across-fields']),
 ('write', 'write', 'Writing desk', 'Cite, figures, front page.', '10 min', ['@writing-desk', 'reading']),
]


# ---------------------------------------------------------------- the Writing desk
HOT = [
 ('title', 'Front page', 'Title of your work, a subtitle, DIKULT105, Final assessment and the date. No page number here.'),
 ('who', 'Name or number?', 'Inspera exams are usually anonymous: write your candidate number, not your name, unless Alinta says otherwise.'),
 ('links', 'The two links', 'Clearly labelled on the front page: <b>Interactive work:</b> and <b>Video walkthrough:</b> Copy them from the browser and test them in a private window.'),
 ('words', 'Word count', '2000 words, 10% over or under. Ask Alinta if the reference list counts.'),
 ('margin', 'Margins', 'About 2.5 cm on every side. A plain font in 12 pt. Chicago papers are double-spaced; follow Alinta’s template if she gives one.'),
 ('page', 'Page numbers', 'Every page after the front page, in the same place: top right or bottom centre.'),
 ('cite', 'Citing in the sentence', '<b>(Jørgensen 2013, 42)</b>: author, year, page. No comma after the name. It goes before the full stop. Name in the sentence? <b>Jørgensen (2013, 42) argues …</b>'),
 ('fig', 'Figure 1', 'Your screenshots are figures. Number them in order. The caption goes <b>under</b> the image: <i>Figure 1. The flooded archive room. Screenshot by the author.</i> In the text: “(figure 1)”.'),
 ('block', 'Block quote (innrykk)', 'A quote of 100 words or more (about five lines) gets its own indented paragraph, with no quotation marks. The citation comes after the final full stop. Shorter quotes stay in the sentence, “in quotation marks”.'),
 ('refs', 'References', 'Heading <b>References</b>. Alphabetical by surname. Hanging indent: the first line sticks out, the rest is indented. Every citation in your text is here, and nothing else.'),
]


def pin(k, n):
    return f'<button type="button" class="wd-pin" data-wd-pin="{k}" aria-label="{escape(dict((a, b) for a, b, _ in HOT)[k])}">{n}</button>'


def bars(n, short=False):
    return ''.join(f'<i class="wd-line{" is-short" if short and i == n - 1 else ""}"></i>' for i in range(n))


def paper():
    num = {k: i for i, (k, *_) in enumerate(HOT, 1)}
    p = lambda k: pin(k, num[k])
    front = (f'<div class="wd-page wd-front" aria-label="Front page"><div class="wd-t">{p("title")}<b>The Tide Archive</b><span>An interactive work about speculative digital futures</span>'
             '<span>DIKULT105 · Final assessment · December 2026</span></div>'
             f'<div class="wd-who">{p("who")}Candidate number: 123</div>'
             f'<div class="wd-links">{p("links")}<span><b>Interactive work:</b> https://nickname.itch.io/tide-archive</span><span><b>Video walkthrough:</b> https://…</span></div>'
             f'<div class="wd-words">{p("words")}Words: 2,040</div></div>')
    body = (f'<div class="wd-page wd-text" aria-label="A text page"><span class="wd-margin" aria-hidden="true">2.5 cm</span>{p("margin")}'
            f'<span class="wd-pnum">{p("page")}2</span><b class="wd-h">Theme</b>{bars(3)}'
            f'<p class="wd-sent">… the archive answers only when the water rises <span class="wd-cite">(Jørgensen 2013, 42)</span>.{p("cite")}</p>{bars(2, True)}'
            f'<div class="wd-fig"><div class="wd-img" aria-hidden="true"><i></i></div><span><i>Figure 1. The flooded archive room. Screenshot by the author.</i></span>{p("fig")}</div>'
            f'<div class="wd-block">{p("block")}{bars(4, True)}<span class="wd-cite">(Murray 2017, 128)</span></div>{bars(2, True)}</div>')
    refs = (f'<div class="wd-page wd-refs" aria-label="References page"><span class="wd-pnum">9</span><b class="wd-h">References</b>{p("refs")}'
            '<p>Fullbright. 2013. <i>Gone Home</i>. Windows. Fullbright.</p>'
            '<p>Jørgensen, Kristine. 2013. <i>Gameworld Interfaces</i>. MIT Press.</p>'
            '<p>Murray, Janet H. 2017. <i>Hamlet on the Holodeck: The Future of Narrative in Cyberspace</i>. Updated ed. MIT Press.</p></div>')
    notes = ''.join(f'<p class="wd-note" data-wd-note="{k}"{"" if i == 1 else " hidden"}><span>{i}</span><b>{t}.</b> {d}</p>' for i, (k, t, d) in enumerate(HOT, 1))
    return f'<div class="wd-paper"><div class="wd-pages">{front}{body}{refs}</div><div class="wd-notes" aria-live="polite">{notes}</div></div>'


TYPES = [
 ('book', 'Book', [('last', 'Author surname', 'Jørgensen'), ('first', 'First name', 'Kristine'), ('year', 'Year', '2013'), ('title', 'Book title', 'Gameworld Interfaces'), ('pub', 'Publisher', 'MIT Press')]),
 ('article', 'Journal article', [('last', 'Author surname', 'Jørgensen'), ('first', 'First name', 'Kristine'), ('year', 'Year', '2012'), ('title', 'Article title', 'Between the Game System and the Fictional World'), ('journal', 'Journal', 'Games and Culture'), ('vol', 'Volume (issue): pages', '7 (2): 142–63'), ('url', 'DOI or URL', 'https://doi.org/10.1177/1555412012440315')]),
 ('web', 'Web page', [('last', 'Author or organisation', 'Center for Digital Narrative'), ('first', 'First name (if a person)', ''), ('year', 'Year (or n.d.)', 'n.d.'), ('title', 'Page title', 'About the Center'), ('site', 'Website name', 'University of Bergen'), ('url', 'URL', 'https://www.uib.no/en/cdn')]),
 ('game', 'Game', [('last', 'Studio or creator', 'Fullbright'), ('first', 'First name (if a person)', ''), ('year', 'Year', '2013'), ('title', 'Game title', 'Gone Home'), ('plat', 'Platform', 'Windows'), ('pub', 'Publisher', 'Fullbright')]),
 ('art', 'Artwork or installation', [('last', 'Artist surname', 'Kubisch'), ('first', 'First name', 'Christina'), ('year', 'Year', '2003'), ('title', 'Title of the work', 'Electrical Walks'), ('medium', 'Medium', 'Sound installation'), ('url', 'Where to see it (URL)', '')]),
 ('lecture', 'Lecture', [('last', 'Lecturer surname', 'Krauth'), ('first', 'First name', 'Alinta'), ('year', 'Year', '2026'), ('title', 'Lecture title', 'Design Futures'), ('date', 'Day and month', 'October 21')]),
 ('video', 'Video', [('last', 'Creator or channel', ''), ('first', 'First name (if a person)', ''), ('year', 'Year', ''), ('title', 'Video title', ''), ('site', 'Site', 'YouTube'), ('url', 'URL', '')]),
 ('sound', 'Sound file', [('last', 'Creator (username)', ''), ('first', '', ''), ('year', 'Year', ''), ('title', 'Sound title', ''), ('site', 'Site', 'Freesound'), ('lic', 'Licence', 'CC BY 4.0'), ('url', 'URL', '')]),
]


def builder():
    opts = ''.join(f'<option value="{k}">{t}</option>' for k, t, _ in TYPES)
    sets = ''
    for k, t, fields in TYPES:
        inputs = ''.join(f'<label{" hidden" if not lab else ""}><span>{lab}</span><input type="text" data-wb="{f}" value="{escape(v)}"/></label>'
                         for f, lab, v in fields)
        sets += f'<div class="wb-set" data-wb-set="{k}"{"" if k == "book" else " hidden"}>{inputs}</div>'
    return (
     '<div class="wb" data-wb=""><p class="lq-k">CITATION BUILDER</p><div class="wb-row"><label class="wb-type"><span>What are you citing?</span>'
     f'<select data-wb-type="">{opts}</select></label><label class="wb-page"><span>Page (optional)</span><input type="text" data-wb-page="" placeholder="42"/></label></div>'
     f'{sets}<div class="wb-out"><p><span class="lq-chip">IN YOUR TEXT</span> <b data-wb-in="">(Jørgensen 2013)</b> or <b data-wb-narr="">Jørgensen (2013)</b> argues …</p>'
     '<p><span class="lq-chip is-pink">REFERENCE LIST</span> <span data-wb-ref="">Jørgensen, Kristine. 2013. <i>Gameworld Interfaces</i>. MIT Press.</span></p>'
     '<p><button type="button" class="lq-btn" data-wb-copy="" hidden="">Copy the reference</button> <span data-wb-msg="" role="status"></span></p></div>'
     '<p class="lq-small">Italics: book, game, journal and artwork titles. “Quotation marks”: article, web page, lecture, video and sound titles. Check the details against the source itself.</p></div>')


ROUNDS = [
 ('Which is Chicago author-date?', '(Jørgensen, 2013)', '(Jørgensen 2013)', 1, 'No comma between author and year.'),
 ('You quote page 42. Which is right?', '(Murray 2017, 42)', '(Murray, 42)', 0, 'Author, year, page. The year is never left out.'),
 ('Where does the figure caption go?', 'Above the image', 'Under the image', 1, 'Figure 1. What it shows. Source. Under the image.'),
 ('A 120-word quote. How?', 'Indented block, no quotation marks', 'In the sentence, in quotation marks', 0, '100 words or more: its own indented paragraph.'),
 ('How is the reference list ordered?', 'Alphabetical by surname', 'In the order you cited them', 0, 'Alphabetical. Then the reader finds any source fast.'),
 ('Where do the links to your work go?', 'Front page, clearly labelled', 'At the very end', 0, 'The examiner should find them first.'),
]


def game():
    cards = ''.join(f'<div class="wq-card" data-wq="{i}"{"" if i == 0 else " hidden"}><p class="wq-q">{i + 1}/{len(ROUNDS)} · {q}</p>'
                    f'<div class="wq-opts"><button type="button" data-ok="{str(r == 0).lower()}">{a}</button><button type="button" data-ok="{str(r == 1).lower()}">{b}</button></div>'
                    f'<p class="wq-why" hidden="">{why}</p></div>' for i, (q, a, b, r, why) in enumerate(ROUNDS))
    return (f'<div class="wq" data-wq-game=""><p class="lq-k">SPOT THE MISTAKE · <span data-wq-xp="">0</span> XP</p>{cards}'
            '<div class="wq-done" hidden=""><b>Citation master.</b> You can cite like a researcher.</div>'
            '<p><button type="button" class="lq-btn" data-wq-next="" hidden="">Next →</button></p></div>')


def own_work():
    rows = [('DESCRIBE', 'What happens?', 'In my work, the visitor … When they …, the room …', '(see figure 1)'),
            ('ANALYSE', 'What does it mean?', 'Juul (2005) describes rules as … In my work, the rule that … makes …', 'cite a source'),
            ('REFLECT', 'What did you learn?', 'I chose … because … When I tested it, … so I changed …', '“I” is fine')]
    cards = ''.join(f'<article class="wd-move"><span class="lq-chip">{a}</span><h4>{b}</h4><p>“{c}”</p><small>{d}</small></article>' for a, b, c, d in rows)
    return (f'<div class="wd-own"><p class="lq-k">WRITING ABOUT YOUR OWN WORK</p><div class="wd-moves">{cards}</div>'
            '<p class="lq-small">Write it yourself. AI may only do light editing if you write in English. '
            '<a href="final-assessment.html#doc">Draft your four parts in the Final quest →</a></p></div>')


def writing_desk():
    return ('<!-- lq-desk --><section class="lq-desk" id="writing-desk" aria-labelledby="wd-title"><p class="lq-k">THE WRITING DESK · CHICAGO AUTHOR-DATE</p>'
            '<h2 id="wd-title">Write it like a researcher. Simply.</h2>'
            '<p class="lq-lead">Tap the numbers on the paper. Alinta’s instructions always win.</p>'
            + paper() + builder() + game() + own_work() + '</section><!-- /lq-desk -->')


# ---------------------------------------------------------------- the stations
def hero_map():
    tiles = ''.join(f'<a class="lq-tile" href="#st-{k}" data-lq-go="{k}"><svg viewBox="0 0 64 64" aria-hidden="true">{ICON[ic]}</svg>'
                    f'<b>{t}</b><span>{pr}</span><small>{m}</small><i class="lq-tick" aria-hidden="true">✓</i></a>' for k, ic, t, pr, m, _ in STATIONS)
    return ('<!-- lq-map --><nav class="lq-map" aria-label="Library stations"><p class="lq-k">DR. TURING’S LIBRARY · 9 STATIONS · OPEN ONE</p>'
            f'<div class="lq-tiles">{tiles}</div><p class="lq-guide" role="status" data-lq-guide="">Not sure where to start? <a href="#st-find" data-lq-go="find">Find my research</a>. Writing your text? <a href="#st-write" data-lq-go="write">Writing desk</a>.</p></nav><!-- /lq-map -->')


def unwrap(s):
    for a, b in [('<!-- lq-map -->', '<!-- /lq-map -->'), ('<!-- lq-desk -->', '<!-- /lq-desk -->')]:
        s = re.sub(re.escape(a) + '.*?' + re.escape(b), '', s, flags=re.S)
    s = re.sub(r'<!-- lq-open:[a-z]+ -->.*?<!-- lq-body -->', '', s, flags=re.S)
    s = s.replace('<!-- lq-close --></div></details>', '')
    return s


def block_span(s, marker):
    """Start and end of the top-level element that carries the id (or, with @, the class or id) named by marker."""
    if marker.startswith('@'):
        name = marker[1:]
        m = re.search(rf'<(\w+)\b[^>]*(?:class="{name}"|class="{name} [^"]*"|id="{name}")[^>]*>', s)
    else:
        m = re.search(rf'<(\w+)\b[^>]*\bid="{marker}"[^>]*>', s)
    assert m, marker
    tag, a = m.group(1), m.start()
    depth, i = 0, a
    for t in re.finditer(rf'<(/?){tag}\b[^>]*>', s[a:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return a, a + t.end()
    raise ValueError(marker)


def build(root):
    path = root / 'labs/academic-library.html'
    s = unwrap(path.read_text(encoding='utf-8'))
    # The writing desk sits just before the reading section, so both land in the same station.
    s = s.replace('<section class="al-reading" id="reading">', writing_desk() + '<section class="al-reading" id="reading">', 1)
    for k, ic, t, pr, m, ids in STATIONS:
        spans = [block_span(s, x) for x in ids]
        a, b = min(x[0] for x in spans), max(x[1] for x in spans)
        head = (f'<!-- lq-open:{k} --><details class="lq-station" id="st-{k}" data-lq="{k}"><summary><svg viewBox="0 0 64 64" aria-hidden="true">{ICON[ic]}</svg>'
                f'<span class="lq-st-t"><b>{t}</b><span>{pr}</span></span><small>{m}</small><span class="lq-open">Open</span></summary><div class="lq-body"><!-- lq-body -->')
        s = s[:a] + head + s[a:b] + '<!-- lq-close --></div></details>' + s[b:]
    s = s.replace('</header><!-- lq-open:find -->', '</header>' + hero_map() + '<!-- lq-open:find -->', 1)
    assert '<!-- lq-map -->' in s
    # Our stylesheet goes before accessibility.css, which must stay last (tools/verify_library_routes.py).
    s = re.sub(r'<link href="library-quest\.css[^>]*>|<script defer="" src="(?:lab-audio|library-quest)\.js[^>]*></script>', '', s)
    s = s.replace('<link href="accessibility.css', '<link href="library-quest.css?v=4" rel="stylesheet"/><link href="accessibility.css', 1)
    s = s.replace('</head>', '<script defer="" src="lab-audio.js?v=4"></script><script defer="" src="library-quest.js?v=2"></script></head>', 1)
    s = s.replace('<article class="al-library" id="steps">', '<article class="al-library lq-on" id="steps">')
    path.write_text(s, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    build(Path(__file__).resolve().parent.parent)
    print('ok')
