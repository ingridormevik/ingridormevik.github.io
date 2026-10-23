"""The final weeks of DIKULT105 (Alinta's announcement, 21 Oct 2026): Lab 6-8 on 6, 13 and 20 November, a road to the
final assessment in week 50, and the Final quest hub (labs/final-assessment.html) that students can use through the
exam period. Alinta writes the obligatory tasks, so nothing here names a task number: it points to Mitt UiB.
Safe to rerun."""
from pathlib import Path
from html import escape
import re

from lab4_walkthrough import TURING_HEAD
from final_rooms import forge, machine, studio, room_map

COURSE = 'https://mitt.uib.no/courses/59620'
LAB_DATES = [('lab-1', '2 Oct'), ('lab-2', '9 Oct'), ('lab-3', '16 Oct'), ('lab-4', '23 Oct'), ('lab-5', '30 Oct'),
             ('lab-6', '6 Nov'), ('lab-7', '13 Nov'), ('lab-8', '20 Nov')]

# One project, eight Fridays: the strip at the top of every lab.
PATH = [('A place', 'HTML &amp; CSS'), ('A choice', 'JavaScript'), ('A secret', 'Construct 1'), ('Rules &amp; rooms', 'Construct 2'),
        ('Someone tests it', 'Test &amp; publish'), ('A future', 'Future lab'), ('Sharper', 'Feedback'), ('Shipped', 'Link + video')]


def br_path(k):
    items = ''.join(f'<li class="{"is-done" if i < k else "is-now" if i == k else ""}"><a href="#lab-{i}"><span>{i}</span><b>{b}</b><small>{s}</small></a></li>'
                    for i, (b, s) in enumerate(PATH, 1))
    return f'<ol aria-label="The eight labs, one project" class="br-path">{items}</ol>'


# The road to week 50, on the lab map and in the hub.
ROAD = [
 (43, 'Lab 4', '23 Oct · rules and rooms', 'lab-programme.html#lab-4', ''),
 (44, 'Lab 5', '30 Oct · test and publish. Video lecture counts as attendance', 'lab-programme.html#lab-5', ''),
 (45, 'Lab 6', '6 Nov · future lab. Maybe the last obligatory chance', 'lab-programme.html#lab-6', ''),
 (46, 'Lab 7', '13 Nov · feedback clinic', 'lab-programme.html#lab-7', ''),
 (47, 'Lab 8', '20 Nov · ship it: link and video', 'lab-programme.html#lab-8', ''),
 (48, 'Build', 'no classes', 'final-assessment.html#stuck', 'is-off'),
 (49, 'Write', 'no classes', 'final-assessment.html#doc', 'is-off'),
 (50, 'Inspera', 'hand in. Exact deadline in Inspera', 'final-assessment.html#seals', 'is-goal'),
]


def road(title='Road to week 50', go=True):
    lis = ''.join(f'<li data-week="{w}" class="{c}"><a href="{h}"><span class="fq-w">WEEK {w}</span><b>{b}</b><small>{s}</small></a></li>'
                  for w, b, s, h, c in ROAD)
    link = '<a class="fq-road-go" href="final-assessment.html">Open the Final quest →</a>' if go else ''
    return (f'<section class="fq-road" id="road-to-50" aria-labelledby="fq-road-t" data-fq-road=""><p class="fq-kicker">THE FINAL WEEKS</p>'
            f'<h2 id="fq-road-t">{title}</h2><ol class="fq-road-list">{lis}</ol>{link}</section>')


# ---------------------------------------------------------------- Lab 6-8, cloned from Lab 5's structure
def rows(spec):
    out, t, c = [], 0, 8 * 60 + 15
    assert sum(r[0] for r in spec) == 105
    for m, title, prompt, detail in spec:
        brk = ' break-row' if title.startswith(('Break', 'Short break')) else ''
        a, b = c + t, c + t + m
        out.append(f'<li class="agenda-row{brk}" data-extension="false" data-minutes="{m}"><div class="time"><span class="clock">{a // 60:02d}:{a % 60:02d}-{b // 60:02d}:{b % 60:02d}</span>'
                   f'<span class="elapsed">{t}-{t + m} min</span></div><div class="activity"><h4>{title}</h4><p class="row-prompt">{prompt}</p>'
                   f'<details class="row-detail" open=""><summary>Details &amp; help</summary><p><strong>Do:</strong> {prompt} {detail}</p></details></div></li>')
        t += m
    return ''.join(out)


BREAK = (10, 'Break: step away', 'Save your project first. Then take a real break.', 'Stretch, get water or leave the screen.')
SHORT = (5, 'Short break: reset', 'Save and take a real break.', 'Stretch, get water or leave the screen.')


def move(n, c, title, time, body):
    return (f'<article class="fw-move" style="--c:{c}"><span class="fw-no" aria-hidden="true">{n}</span><h4>{title}</h4>'
            f'<p class="fw-time">{time}</p>{body}</article>')


LABS = {
 6: dict(date='2026-11-06', day='FRIDAY 6 NOVEMBER 2026', title='Future lab: choose your future',
         lead='What future will your work let someone step into?',
         strip='FUTURE SIGNAL', rec='INCOMING FROM 2080',
         ob_h='Still missing an obligatory task? This may be your last chance.',
         ob_p='Read the task text on Mitt UiB and hand it in there. Three passed tasks open the door to the final assessment.',
         think_h='It is 2080. Something we have now is gone.',
         think_p='What is it? Who misses it? Today you choose the future your final work lives in.',
         starters=['In my future, nobody ', 'The thing I would miss most is ', 'The machines finally '],
         example='Example: “In my future nobody remembers birdsong. Today I want a room where you can only hear it if you wait.”',
         practice='Practice: Future lab', practice_desc='Three moves. Leave with one future and one interaction.',
         moves=[move(1, '#c6f15b', 'Spin', 'SPIN · 10 MIN', '<p>Pick a future from the brief, or bring your own. Stuck? Spin one.</p><p><a href="final-assessment.html#forge">Future forge →</a></p>'),
                move(2, '#ff5fd2', 'Touch', 'TOUCH · 15 MIN', '<p>What does the visitor <b>do</b> in that future? Choose one power: a variable that remembers, a rule that waits, rooms, a sound.</p><p><a href="#l4-host">Your Lab 4 powers →</a></p>'),
                move(3, '#e9ca85', 'Cut', 'CUT · 5 MIN', '<p>One room, one rule, one ending that works. Everything else goes on a wish list for later.</p>')],
         goal='Your final work: an interactive piece about <b>speculative digital futures</b>. <a href="final-assessment.html">Final quest →</a>',
         m_h='Your future, first version', m_p='Start the work you will hand in.', m_q='What future does your work let someone step into?',
         m_link=('final-assessment.html', 'Open the Final quest →'),
         checks=['Write my future in one sentence.', 'Choose the one interaction that carries it.', 'Build the first room and save it.'],
         note=('Your future in one sentence, and the interaction:', 'In my future… The visitor can… It changes when…'),
         res=[('final-assessment.html#brief', 'The brief, decoded'), ('tools.html#construct-toolkit', 'Construct toolkit'),
              ('academic-library.html#genre-explorer', 'Genre explorer'), ('#l4-host', 'Lab 4: memory, rules and rooms')],
         ob_check='I checked my obligatory tasks on Mitt UiB.',
         leave='One future, one interaction and a first room, saved.',
         connect='The theme of the final assessment: speculative digital futures, as something a visitor can do.',
         agenda=[(5, 'Arrive: open your project', 'Open your project, or start a new one.', 'Bring last week’s file if you have one.'),
                 (10, 'Together: speculative digital futures', 'What future could your work live in?', 'Ingrid shows examples. Spin the Future generator if you are stuck.'),
                 (30, 'Future lab: spin, touch, cut', 'Pick a future, choose one interaction, cut the scope.', 'Write everything else on a wish list.'),
                 BREAK,
                 (30, 'Build the first room', 'Make the first room of your final work.', 'Missing an obligatory task? Use this time for it.'),
                 SHORT,
                 (10, 'Show a neighbour', 'Let one person try it for two minutes.', 'Note one thing they did that surprised you.'),
                 (5, 'One next step', 'Write your future in one sentence and save.', 'Bring the file next Friday.')]),
 7: dict(date='2026-11-13', day='FRIDAY 13 NOVEMBER 2026', title='Feedback clinic: what should they feel?',
         lead='What are you actually trying to make someone experience?',
         strip='CLINIC TICKET', rec='NEXT PATIENT: YOUR PROJECT',
         ob_h='Three passed obligatory tasks?',
         ob_p='Check Mitt UiB › Vurderingar. A 1 in the box means passed. Unsure? Ask Alinta.',
         think_h='Someone opens your work for the first time.',
         think_p='What do you want them to feel, notice, understand or question? Today other people help you get there.',
         starters=['I want them to feel ', 'The most important interaction is ', 'I am not sure if '],
         example='Example: “I want them to feel watched. The most important interaction is the door that will not open.”',
         practice='Practice: Feedback clinic', practice_desc='Diagnose first. Feedback in the right order. Write it down.',
         moves=[move(1, '#8cdec5', 'Diagnose', 'DIAGNOSE · 10 MIN', '<p>Fill in four lines before anyone gives feedback:</p>'
                     '<p class="fw-diag">I AM MAKING ___ FOR ___<br/>I WANT THEM TO FEEL / NOTICE / UNDERSTAND / QUESTION ___<br/>THE MOST IMPORTANT INTERACTION IS ___</p>'),
                move(2, '#ff5fd2', 'Swap', 'SWAP · 20 MIN', '<p>Feedback in this order: <b>concept</b>, <b>experience</b>, <b>form</b>, <b>scope</b>, <b>technical problem</b>, and polish last.</p><p><a href="final-assessment.html#machine">Flow check →</a></p>'),
                move(3, '#e9ca85', 'Write it down', 'NOTE · 5 MIN', '<p>Every piece of feedback is process. It becomes part 4 of your text.</p><p><a href="final-assessment.html#doc">Start your text →</a></p>')],
         goal='Feedback is material for your written text: the process part. <a href="final-assessment.html#doc">Text builder →</a>',
         m_h='Make it sharper', m_p='Use other eyes to find what matters most.', m_q='What is the one thing a stranger must not miss?',
         m_link=('final-assessment.html#doc', 'Start your text in the Final quest →'),
         checks=['Fill in the four diagnosis lines.', 'Get feedback, concept before polish.', 'Change one thing and write it in my process notes.'],
         note=('The feedback you got, and what you changed:', 'They said… I noticed… I changed… because…'),
         res=[('final-assessment.html#doc', 'Text builder and word counter'), ('academic-library.html#genre-explorer', 'Genre explorer'),
              ('tools.html#construct-toolkit', 'Construct toolkit')],
         ob_check='I checked my three passed obligatory tasks on Mitt UiB.',
         leave='Four diagnosis lines, feedback in order and one change in your process notes.',
         connect='Part 4 of the written text: the process, and a challenge you solved.',
         agenda=[(5, 'Arrive: open your project', 'Open your project and your notes.', 'Bring the version you have, finished or not.'),
                 (10, 'Together: the feedback order', 'Concept first, polish last.', 'Ingrid shows how to give feedback that helps.'),
                 (30, 'Clinic, round 1', 'Diagnose, then swap feedback with a partner.', 'Fill in the four lines first. Then feedback in order.'),
                 BREAK,
                 (30, 'Clinic, round 2: fix', 'Change the one thing that matters most.', 'Or swap with a new partner.'),
                 SHORT,
                 (10, 'Start your text', 'Write the first 100 words of your process part.', 'Use the Final quest text builder or your own document.'),
                 (5, 'One next step', 'Write what you change next week. Save.', 'Bring the file next Friday.')]),
 8: dict(date='2026-11-20', day='FRIDAY 20 NOVEMBER 2026', title='Ship it: a link and a video',
         lead='Can a stranger open your work, and see it at its best?',
         strip='BOARDING PASS', rec='GATE CLOSES: WEEK 50',
         ob_h='Three passed obligatory tasks?',
         ob_p='Check Mitt UiB › Vurderingar before you leave today. A 1 in the box means passed.',
         think_h='An examiner clicks your link in December.',
         think_p='What do they see first? Today you make sure it opens, works and shows its best side.',
         starters=['The first thing they see is ', 'The moment I want them to reach is ', 'I am worried that '],
         example='Example: “The first thing they see is a dark room. I want them to reach the moment the lights come back.”',
         practice='Practice: Ship it', practice_desc='Export, test, record. Leave with a link and a video.',
         moves=[move(1, '#ffb347', 'Export', 'EXPORT · 15 MIN', '<p>Web export. Upload to itch.io, playable in the browser, set to <b>public</b>.</p><p><a href="publish-guide.html">Publish guide →</a></p>'),
                move(2, '#8cdec5', 'Test', 'TEST · 10 MIN', '<p>Open the exact link in a <b>private window</b> and on a <b>phone</b>. Fix what breaks.</p>'),
                move(3, '#ff5fd2', 'Record', 'RECORD · 20 MIN', '<p>A video walkthrough: the start, the main interaction, the moment it changes. Your voice is optional.</p><p><a href="final-assessment.html#video">Video guide →</a> · <a href="final-assessment.html#studio">Sound check →</a></p>')],
         goal='A broken link may fail. Test the exact link you paste. <a href="final-assessment.html#seals">Final seals →</a>',
         m_h='Ready for the examiner', m_p='The work, the link and the video, all reachable.', m_q='Does the link work for someone who is not you?',
         m_link=('final-assessment.html#seals', 'Run the final seals →'),
         checks=['Upload it and set it public.', 'The link works in a private window and on a phone.', 'Record and upload the video walkthrough.'],
         note=('Your two links, and what you still want to fix:', 'Work: https://… Video: https://… Still to fix…'),
         res=[('publish-guide.html', 'Export and publish'), ('final-assessment.html#video', 'Video walkthrough guide'),
              ('final-assessment.html#seals', 'Final seals'), ('https://www.construct.net/en/make-games/manuals/construct-3/overview/publishing-projects', 'Construct: publishing and export ↗')],
         ob_check='I checked my three passed obligatory tasks on Mitt UiB.',
         leave='A public link that works for a stranger, and a video walkthrough.',
         connect='What to submit: the text with the URL, and a video that shows the work functioning.',
         agenda=[(5, 'Arrive: open your project', 'Open your project and your itch.io account.', 'No account yet? Make one now. A nickname is fine.'),
                 (10, 'Together: export and itch.io', 'Watch one export and upload on the big screen.', 'Then do the same with your work.'),
                 (30, 'Ship: export, upload, test', 'Make the link work for a stranger.', 'Private window, phone, then fix.'),
                 BREAK,
                 (30, 'Record the video walkthrough', 'Show it working, at its best.', 'Start, main interaction, the moment it changes.'),
                 SHORT,
                 (10, 'Links into the text', 'Paste both links into your text, clearly labelled.', 'Use the Final quest text builder or your own document.'),
                 (5, 'One next step', 'Weeks 48 and 49 have no classes. Write your plan for them.', 'Keep the link working. Do not move or rename it.')]),
}


def sub(pattern, repl, s, flags=re.S):
    new, n = re.subn(pattern, lambda m: repl, s, count=1, flags=flags)
    assert n == 1, pattern
    return new


def lab_article(lab5, n, d):
    s = lab5.replace('data-obligatory="6" ', '').replace('data-unlock-date="2026-10-30"', f'data-unlock-date="{d["date"]}"')
    s = s.replace('lab-5', f'lab-{n}')
    s = re.sub(r'\b((?:checkin|mission)-[a-z]+)-5\b', rf'\g<1>-{n}', s)
    for a, b in [('data-checkin="5"', f'data-checkin="{n}"'), ('data-mission="5"', f'data-mission="{n}"'), ('ARRIVAL 05', f'ARRIVAL 0{n}'),
                 ('EXPERIMENT 05', f'EXPERIMENT 0{n}'), ('LAB 05', f'LAB 0{n}'), ('Experiment 5', f'Experiment {n}'), ('Lab 5 steps', f'Lab {n} steps')]:
        s = s.replace(a, b)
    s = sub(r'<p class="eyebrow">LAB 0\d / FRIDAY [^<]*</p><h2>.*?</h2><p class="lead">.*?</p>',
            f'<p class="eyebrow">LAB 0{n} / {d["day"]}</p><h2>{d["title"]}</h2><p class="lead">{d["lead"]}</p>', s)
    s = sub(rf'<aside aria-labelledby="lab-{n}-obligatory-t".*?</aside>',
            f'<aside aria-labelledby="lab-{n}-obligatory-t" class="obligatory-banner" id="lab-{n}-obligatory"><p class="obligatory-kicker">OBLIGATORY TASKS · CHECK MITT UIB</p>'
            f'<h3 id="lab-{n}-obligatory-t">{d["ob_h"]}</h3><p>{d["ob_p"]}</p>'
            f'<a class="obligatory-go" href="{COURSE}" rel="noopener" target="_blank">Open Mitt UiB ↗</a></aside>', s)
    s = sub(rf'<span>ARRIVAL 0{n} / [^<]*</span>', f'<span>ARRIVAL 0{n} / {d["strip"]}</span>', s)
    s = s.replace('SOMEONE WILL OPEN THIS', d['rec']).replace('LAB PASS / READ RECEIPT', f'LAB PASS / {d["strip"]}')
    s = sub(rf'<h3 id="checkin-title-{n}">.*?</h3><p class="arrival-prompt">.*?</p>',
            f'<h3 id="checkin-title-{n}">{d["think_h"]}</h3><p class="arrival-prompt">{d["think_p"]}</p>', s)
    s = sub(r'<p class="checkin-example" hidden="">.*?</p>', f'<p class="checkin-example" hidden="">{d["example"]}</p>', s)
    st = ''.join(f'<button class="thought-starter" data-starter="{escape(x)}" type="button">{escape(x.strip())}…</button>' for x in d['starters'])
    s = sub(r'<div aria-label="Sentence starters" class="thought-starters" role="group">.*?</div>',
            f'<div aria-label="Sentence starters" class="thought-starters" role="group"><span class="starter-label">Stuck? Tap a starter:</span>{st}</div>', s)
    s = s.replace('<span>Practice: Test Lab</span>', f'<span>{d["practice"]}</span>')
    # The final work has its own AI rule, so these labs do not invite AI code.
    s = sub(r'<li><strong>Build</strong> it\. Read any AI code you keep\.</li>', '<li><strong>Build</strong> it yourself.</li>', s)
    s = s.replace('Experiment not behaving? Open the help drawer.', 'Stuck? Open the help drawer.')
    practice = (f'<div class="section-band sb-practice" id="lab-{n}-sec-1"><p class="sb-meta"><span class="sb-no">01</span><span class="sb-badge">PRACTICE</span></p>'
                f'<p class="time-chip" data-from="15" data-to="45"></p><h3 class="sb-title">{d["practice"]}</h3><p class="sb-desc">{d["practice_desc"]}</p></div>'
                f'<p class="fw-goal">{d["goal"]}</p><div class="fw-moves">{"".join(d["moves"])}</div>')
    s = sub(rf'<div class="section-band sb-practice" id="lab-{n}-sec-1">.*?(?=<div class="section-band sb-required" id="lab-{n}-sec-2">)', practice, s)
    s = sub(r'<div class="mission-brief">.*?</div>',
            f'<div class="mission-brief"><p class="eyebrow">YOUR WORKBENCH</p><h3 id="mission-title-{n}">{d["m_h"]}</h3><p>{d["m_p"]}</p>'
            f'<p class="mission-prompt">{d["m_q"]}</p><a class="primary" href="{d["m_link"][0]}">{d["m_link"][1]}</a>'
            '<p class="mission-small">Working on your final project? Use these steps on it.</p></div>', s)
    for i, c in enumerate(d['checks']):
        box = f'<input data-check="{i}" disabled="" type="checkbox"/>'
        s = sub(rf'{re.escape(box)}<span>.*?</span>', f'{box}<span>{c}</span>', s)
    s = sub(rf'<label class="mission-note-label" for="mission-note-{n}">.*?</label>',
            f'<label class="mission-note-label" for="mission-note-{n}">{d["note"][0]}</label>', s)
    s = re.sub(rf'(<textarea disabled="" hidden="" id="mission-note-{n}"[^>]*?placeholder=")[^"]*(")', lambda m: m.group(1) + escape(d['note'][1]) + m.group(2), s, count=1)
    ext = ' rel="noopener" target="_blank"'
    res = ''.join(f'<li><a href="{h}"{ext}>{t}</a></li>' if h.startswith('http') else f'<li><a href="{h}">{t} →</a></li>' for h, t in d['res'])
    s = sub(r'<details class="resources">.*?</details>', f'<details class="resources"><summary>Open the guides for today</summary><ul>{res}</ul></details>', s)
    s = sub(r'<div class="time-unlock">.*?</div>', '', s)
    s = sub(r'<label class="obligatory-check">.*?</label>', f'<label class="obligatory-check"><input data-final="obligatory" type="checkbox"/> {d["ob_check"]}</label>', s)
    s = sub(r'<div class="outcome">.*?</div>',
            f'<div class="outcome"><p><strong>Leave with:</strong> {d["leave"]}</p><p><strong>Connect to the course:</strong> {d["connect"]}</p></div>', s)
    s = sub(r'<ol class="agenda">.*?</ol>', f'<ol class="agenda">{rows(d["agenda"])}</ol>', s)
    s = re.sub(r'<ol aria-label="The (?:five|eight) labs, one project" class="br-path">.*?</ol>', lambda m: br_path(n), s, flags=re.S)
    assert 'Obligatory Task' not in s and not re.search(r'(id|for)="[^"]*-5\b|lab-5-', s), n
    return s


# ---------------------------------------------------------------- the lab map page
LEVELS = [(6, 'FUTURE', '6 November', 'Future lab'), (7, 'CLINIC', '13 November', 'Feedback clinic'), (8, 'SHIP', '20 November', 'Ship it')]
GOAL = ('<a class="sl-goal" href="final-assessment.html"><svg viewBox="0 0 34 40" aria-hidden="true"><path d="M4 2v36" stroke="#10151f" stroke-width="4"/>'
        '<path d="M6 4h22l-6 7 6 7H6Z" fill="#ff5fd2" stroke="#10151f" stroke-width="3"/></svg><span><small>WEEK 50 · INSPERA</small><b>Final quest</b></span></a>')
AI_NOTE = ('<!-- fq-ai --><aside class="fq-ai-note"><b>Final assessment:</b> no AI in making your work, unless AI is part of your theme. '
           'No AI writing your text. <a href="final-assessment.html#ai">Read the rules →</a></aside><!-- /fq-ai -->')


def patch_programme(root):
    path = root / 'labs/lab-programme.html'
    s = path.read_text(encoding='utf-8')
    s = re.sub(r'<!-- fw-labs -->.*?<!-- /fw-labs -->', '', s, flags=re.S)
    s = re.sub(r'<!-- fw-lv -->.*?<!-- /fw-lv -->', '', s, flags=re.S)
    s = re.sub(r'<!-- fw-road -->.*?<!-- /fw-road -->', '', s, flags=re.S)
    s = re.sub(r'<!-- fq-ai -->.*?<!-- /fq-ai -->', '', s, flags=re.S)

    a = s.index('<article class="lab" data-obligatory="6" data-unlock-date="2026-10-30" id="lab-5">')
    b = s.index('</article>', a) + len('</article>')
    lab5 = s[a:b]
    new = ''.join(lab_article(lab5, n, d) for n, d in LABS.items())
    s = s[:b] + '<!-- fw-labs -->' + new + '<!-- /fw-labs -->' + s[b:]

    lv = ''.join(f'<a class="lv lv-{n}" href="#lab-{n}"><span aria-hidden="true" class="lv-orb"><b>0{n}</b><i>{tag}</i></span><span class="lv-text">'
                 f'<span class="lv-date">Lab 0{n} · {day}</span><strong>{title}</strong><span class="mission-nav-status" data-mission-status="{n}">Open · choose this lab</span>'
                 '<span aria-hidden="true" class="lv-stars"><i></i><i></i><i></i></span></span></a>' for n, tag, day, title in LEVELS)
    i = s.index('<a class="lv lv-5"'); j = s.index('</a>', i) + 4
    assert s[j:j + 6] == '</nav>'
    s = s[:j] + '<!-- fw-lv -->' + lv + '<!-- /fw-lv --></nav><!-- fw-lv -->' + GOAL + '<!-- /fw-lv -->' + s[j + 6:]

    t = s.index('<section aria-label="Lab legends')
    s = s[:t] + '<!-- fw-road -->' + road() + '<!-- /fw-road -->' + s[t:]

    s = s.replace('Five Fridays. Five experiments. Collect all 15 stars.', 'Eight Fridays. One final work. Collect all 24 stars.')
    s = s.replace('<span class="sl-tag-more"> / 5 EXPERIMENTS</span>', '<span class="sl-tag-more"> / 8 EXPERIMENTS</span>')
    s = s.replace('ONE PROJECT · FIVE FRIDAYS', 'ONE PROJECT · EIGHT FRIDAYS')
    s = s.replace('<title>Five Friday Labs ·', '<title>Eight Friday Labs ·')
    for k in range(1, 6):
        m = re.search(rf'<article class="lab"[^>]*id="lab-{k}".*?</article>', s, flags=re.S)
        art = re.sub(r'<ol aria-label="The (?:five|eight) labs, one project" class="br-path">.*?</ol>', lambda _: br_path(k), m.group(0), flags=re.S)
        s = s[:m.start()] + art + s[m.end():]

    # Lab 2 teaches AI-assisted coding: the final-assessment rule sits right above it.
    s, n = re.subn(r'(<section class="vibecoding-portal" id="lab-2-sec-1">)', lambda m: AI_NOTE + m.group(1), s, count=1)
    assert n == 1

    if 'href="final-assessment.html">Final quest</a>' not in s.split('</header>')[0]:
        s = re.sub(r'(<header class="studio-header">.*?<nav[^>]*>.*?Lab map</a>)', lambda m: m.group(1) + '<a href="final-assessment.html">Final quest</a>', s, count=1, flags=re.S)
    if 'final-quest.css' not in s:
        s = s.replace('</head>', '<link href="final-quest.css?v=4" rel="stylesheet"/><script defer="" src="final-quest.js?v=4"></script></head>', 1)
    s = re.sub(r'final-quest\.(css|js)\?v=\d+', r'final-quest.\1?v=4', s)
    # Eight labs instead of five: the level map, the finish screen and the guide return links changed.
    s = re.sub(r'(start-lab|lab-victory|lab-navigation)\.js\?v=[\w-]+', r'\1.js?v=final-weeks-1', s)
    path.write_text(s, encoding='utf-8', newline='\n')


def patch_ai_pages(root):
    for name in ['vibecoding.html', 'ai-coding.html']:
        path = root / 'labs' / name
        s = path.read_text(encoding='utf-8')
        s = re.sub(r'<!-- fq-ai -->.*?<!-- /fq-ai -->', '', s, flags=re.S)
        s = re.sub(r'(<main id="main-content"[^>]*>)', lambda m: m.group(1) + AI_NOTE, s, count=1)
        if 'final-quest.css' not in s:
            s = s.replace('</head>', '<link href="final-quest.css?v=4" rel="stylesheet"/></head>', 1)
        s = re.sub(r'final-quest\.css\?v=\d+', 'final-quest.css?v=4', s)
        path.write_text(s, encoding='utf-8', newline='\n')


# ---------------------------------------------------------------- the hub
FUTURE_SVG = (
 '<svg class="l4h-scene" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="fq-title">'
 '<title id="fq-title">Cartoon: Dr. Turing points at a round portal that shows possible futures from the brief, one after another: '
 'a water drop locked away by machines, the last bee, a conversation with another planet, and a robot holding a pen.</title>'
 '<defs><linearGradient id="fq-wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#16124a"/><stop offset="1" stop-color="#2b1b6b"/></linearGradient>'
 '<pattern id="fq-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#4fd1c5" stroke-opacity=".13"/></pattern>'
 + TURING_HEAD.replace('id="l4h-head"', 'id="fq-head"') + '</defs>'
 '<rect width="600" height="380" fill="url(#fq-wall)"/><rect width="600" height="300" fill="url(#fq-grid)"/>'
 '<g fill="#edf4dd"><circle class="fq-star" cx="40" cy="40" r="2"/><circle class="fq-star" cx="372" cy="60" r="2.5"/><circle class="fq-star" cx="352" cy="230" r="2"/>'
 '<circle class="fq-star" cx="30" cy="250" r="2.5"/><circle class="fq-star" cx="560" cy="40" r="2"/><circle class="fq-star" cx="330" cy="140" r="1.8"/></g>'
 '<polygon points="0,300 600,300 600,380 0,380" fill="#140a2b"/>'
 '<path d="M300 300L-300 380M300 300L-60 380M300 300L120 380M300 300L300 380M300 300L480 380M300 300L660 380M300 300L900 380M0 316H600M0 338H600M0 366H600" stroke="#ff5fd2" stroke-opacity=".45" stroke-width="1.5"/>'
 '<g><path d="M330 0v12M520 0v12" stroke="#000" stroke-width="3"/><rect x="314" y="10" width="222" height="32" rx="6" fill="#0b0b1e" stroke="#000" stroke-width="4"/>'
 '<text x="425" y="32" fill="#ff5fd2" font-family="Consolas,monospace" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">FUTURE PORTAL · W50</text></g>'
 # The portal
 '<g class="fq-portal"><circle cx="190" cy="170" r="128" fill="#2d3a8c" stroke="#000" stroke-width="5"/><circle cx="190" cy="170" r="110" fill="#06231f" stroke="#000" stroke-width="3"/></g>'
 '<g stroke="#000" stroke-width="2"><circle class="l4h-blink" cx="98" cy="300" r="6" fill="#c6f15b"/><circle class="l4h-blink l4h-b2" cx="120" cy="300" r="6" fill="#ff5fd2"/><circle class="l4h-blink l4h-b3" cx="142" cy="300" r="6" fill="#6fb7ff"/></g>'
 '<rect x="160" y="292" width="140" height="18" rx="3" fill="#0b0b1e" stroke="#000" stroke-width="2"/>'
 # Future 1: the water belongs to the machines
 '<g class="fq-f fq-f1"><rect x="120" y="140" width="40" height="80" fill="#2d3a8c" stroke="#000" stroke-width="3"/><rect x="126" y="150" width="28" height="6" fill="#c6f15b"/><rect x="126" y="164" width="28" height="6" fill="#c6f15b"/><rect x="126" y="178" width="28" height="6" fill="#ff5fd2"/>'
 '<path d="M220 110q-30 40-30 62a30 30 0 0 0 60 0q0-22-30-62Z" fill="#6fb7ff" stroke="#000" stroke-width="3"/><circle class="fq-drip" cx="220" cy="210" r="5" fill="#6fb7ff" stroke="#000" stroke-width="2"/>'
 '<rect x="206" y="160" width="28" height="22" rx="3" fill="#ffd23f" stroke="#000" stroke-width="2.5"/><path d="M211 160v-7a9 9 0 0 1 18 0v7" fill="none" stroke="#000" stroke-width="3"/>'
 '<text x="230" y="305" fill="#c6f15b" font-family="Consolas,monospace" font-size="11" text-anchor="middle">AI TOOK THE WATER</text></g>'
 # Future 2: the last bee
 '<g class="fq-f fq-f2"><path d="M190 240v-60" stroke="#c6f15b" stroke-width="5"/><path d="M190 214q-22-6-26-22 18-2 26 12" fill="#c6f15b" stroke="#000" stroke-width="2"/>'
 '<g stroke="#000" stroke-width="2.5"><circle cx="190" cy="160" r="12" fill="#ffd23f"/><circle cx="190" cy="138" r="12" fill="#ff7a59"/><circle cx="210" cy="152" r="12" fill="#ff7a59"/>'
 '<circle cx="170" cy="152" r="12" fill="#ff7a59"/><circle cx="204" cy="174" r="12" fill="#ff7a59"/><circle cx="176" cy="174" r="12" fill="#ff7a59"/><circle cx="190" cy="160" r="9" fill="#ffd23f"/></g>'
 '<g class="fq-bee"><ellipse cx="190" cy="92" rx="10" ry="7" fill="#ffd23f" stroke="#000" stroke-width="2"/><path d="M186 86v12M193 86v12" stroke="#000" stroke-width="2"/>'
 '<ellipse cx="188" cy="84" rx="6" ry="4" fill="#eef8ff" stroke="#000" stroke-width="1.5"/></g>'
 '<text x="230" y="305" fill="#c6f15b" font-family="Consolas,monospace" font-size="11" text-anchor="middle">THE LAST BEE</text></g>'
 # Future 3: talking to another planet
 '<g class="fq-f fq-f3"><circle cx="210" cy="150" r="34" fill="#a98df7" stroke="#000" stroke-width="3"/><ellipse class="fq-ring" cx="210" cy="150" rx="56" ry="12" fill="none" stroke="#ffd23f" stroke-width="4"/>'
 '<circle cx="128" cy="212" r="16" fill="#6fb7ff" stroke="#000" stroke-width="3"/>'
 '<rect x="96" y="150" width="58" height="26" rx="10" fill="#eef8ff" stroke="#000" stroke-width="2.5"/><text x="125" y="168" font-family="Consolas,monospace" font-size="12" text-anchor="middle" fill="#16124a">hello?</text>'
 '<rect x="214" y="200" width="66" height="26" rx="10" fill="#eef8ff" stroke="#000" stroke-width="2.5"/><text x="247" y="218" font-family="Consolas,monospace" font-size="12" text-anchor="middle" fill="#16124a">◇ ○ ◇</text>'
 '<text x="230" y="305" fill="#c6f15b" font-family="Consolas,monospace" font-size="11" text-anchor="middle">ANOTHER PLANET</text></g>'
 # Future 4: who writes the poems?
 '<g class="fq-f fq-f4"><rect x="130" y="120" width="70" height="62" rx="10" fill="#8aa0b8" stroke="#000" stroke-width="3"/><circle cx="152" cy="148" r="8" fill="#c6f15b" stroke="#000" stroke-width="2"/>'
 '<circle cx="178" cy="148" r="8" fill="#c6f15b" stroke="#000" stroke-width="2"/><path d="M150 168h30" stroke="#000" stroke-width="3"/><path d="M165 120v-14" stroke="#000" stroke-width="3"/><circle cx="165" cy="102" r="5" fill="#ff5fd2" stroke="#000" stroke-width="2"/>'
 '<rect x="206" y="150" width="70" height="86" fill="#eef8ff" stroke="#000" stroke-width="3"/><path d="M214 166h48M214 180h40M214 194h52M214 208h30" stroke="#8aa0b8" stroke-width="3"/>'
 '<g class="fq-pen"><path d="M228 222l22-28 6 5-22 28-8 3Z" fill="#ffd23f" stroke="#000" stroke-width="2.5"/></g>'
 '<text x="230" y="305" fill="#c6f15b" font-family="Consolas,monospace" font-size="11" text-anchor="middle">WHO WRITES THE POEMS?</text></g>'
 # Dr. Turing
 '<g class="l4h-turing" transform="translate(224 0)">'
 '<path d="M196 380l12-104q62-30 124 0l12 104Z" fill="#f6f6f6" stroke="#000" stroke-width="4"/>'
 '<path d="M248 262l22 40 22-40Z" fill="#dce7f2" stroke="#000" stroke-width="3"/>'
 '<path d="M266 270h8l6 46-10 12-10-12Z" fill="#2b2f6b" stroke="#000" stroke-width="2.5"/>'
 '<path d="M248 262l-14 76M292 262l14 76" fill="none" stroke="#000" stroke-width="3"/>'
 '<rect x="294" y="318" width="26" height="18" rx="2" fill="#6fb7ff" stroke="#000" stroke-width="2.5"/>'
 '<path d="M326 286q32 26 36 60l-20 6q-6-28-30-46Z" fill="#f6f6f6" stroke="#000" stroke-width="4"/>'
 '<ellipse cx="354" cy="354" rx="17" ry="13" fill="#8e44ad" stroke="#000" stroke-width="3"/>'
 '<g class="l4h-point"><path d="M214 286q-40-20-62-74l18-8q16 44 52 62Z" fill="#f6f6f6" stroke="#000" stroke-width="4"/>'
 '<ellipse cx="156" cy="204" rx="15" ry="13" fill="#8e44ad" stroke="#000" stroke-width="3"/></g>'
 '<rect x="255" y="226" width="30" height="40" fill="#efc39b" stroke="#000" stroke-width="3"/>'
 '<use class="l4h-head" href="#fq-head" x="196" y="86" width="148" height="150"/></g>'
 '</svg>')


def card(tag, title, body, cls=''):
    return f'<article class="fq-card fq-in {cls}"><span class="fq-tag">{tag}</span><h3>{title}</h3>{body}</article>'


# Beyond the screen: Alinta's lecture "Digital art beyond the screen" (physical computing, sound and sensory
# experience), turned into a sense switch. Works and facts come from the lecture; the Construct lines say what
# students can actually build in a browser.
SENSE_ART = {
 'hear': '<circle cx="40" cy="40" r="8" fill="#ffd23f" stroke="#080e15" stroke-width="3"/>'
         '<circle class="fs-ring" cx="40" cy="40" r="16" fill="none" stroke="#ffd23f" stroke-width="3"/>'
         '<circle class="fs-ring fs-d2" cx="40" cy="40" r="16" fill="none" stroke="#ffd23f" stroke-width="3"/>'
         '<circle class="fs-ring fs-d3" cx="40" cy="40" r="16" fill="none" stroke="#ffd23f" stroke-width="3"/>',
 'touch': '<path d="M30 66V30a5 5 0 0 1 10 0v18M40 44v-6a5 5 0 0 1 10 0v8M50 46a5 5 0 0 1 10 0v6q0 16-14 16H38q-8 0-12-8l-8-14a5 5 0 0 1 9-5l3 5" '
          'fill="#efc39b" stroke="#080e15" stroke-width="3" stroke-linejoin="round"/>'
          '<circle class="fs-press" cx="35" cy="22" r="7" fill="none" stroke="#ff5fd2" stroke-width="3"/>',
 'move': '<g class="fs-walk"><circle cx="40" cy="18" r="7" fill="#8cdec5" stroke="#080e15" stroke-width="3"/>'
         '<path d="M40 26v20M40 32l-12 8M40 32l12-4M40 46l-10 16M40 46l12 14" stroke="#080e15" stroke-width="4" stroke-linecap="round" fill="none"/></g>'
         '<path d="M10 70h60" stroke="#8cdec5" stroke-width="3" stroke-dasharray="6 6" class="fs-floor"/>',
 'tilt': '<g class="fs-tilt"><rect x="26" y="12" width="28" height="50" rx="5" fill="#2d3a8c" stroke="#080e15" stroke-width="3"/>'
         '<circle class="fs-ball" cx="40" cy="40" r="5" fill="#c6f15b" stroke="#080e15" stroke-width="2"/></g>'
         '<path d="M20 72h40" stroke="#c6f15b" stroke-width="3"/><path d="M40 72l-6-6h12Z" fill="#c6f15b"/>',
 'inside': '<path d="M40 66q-26-16-26-34a13 13 0 0 1 26-5 13 13 0 0 1 26 5q0 18-26 34Z" fill="#ff7a59" stroke="#080e15" stroke-width="3" class="fs-beat"/>'
           '<polyline points="8,44 24,44 30,32 36,54 42,40 72,40" fill="none" stroke="#edf4dd" stroke-width="3" class="fs-line"/>',
 'signal': '<path d="M40 70V34" stroke="#080e15" stroke-width="4"/><circle cx="40" cy="30" r="6" fill="#6fb7ff" stroke="#080e15" stroke-width="3"/>'
           '<path class="fs-arc" d="M26 18a20 20 0 0 1 28 0" fill="none" stroke="#6fb7ff" stroke-width="3"/>'
           '<path class="fs-arc fs-d2" d="M18 10a30 30 0 0 1 44 0" fill="none" stroke="#6fb7ff" stroke-width="3"/>'
           '<path class="fs-zig" d="M8 54l8-6 8 6 8-6" fill="none" stroke="#ff5fd2" stroke-width="3"/>',
}
SENSES = [
 ('hear', 'Hear', 'SOUND AS VIBRATION',
  'Sound travels through air, water and solids, not through a vacuum. Humans hear about 20 to 20,000 Hz.',
  [('River Listening', 'Leah Barclay with the Australian Rivers Institute, 2014–', 'Listening to rivers, under the surface.'),
   ('What Stirs Between?', 'Camille Norment, 2023', 'Visitors sit or lie down and feel the voices vibrate through wood.'),
   ('Department of X', 'Nanna K. Hougaard, 2019', 'An algorithm rearranges eight researchers into a conversation that never happened.')],
  'Add the <b>Audio</b> object. Right-click <b>Sounds</b> › Import sounds. Event: on tap › Audio › <b>Play</b>. A variable can set the volume.',
  'What will a future river, city or forest sound like? Make one sound the visitor can only find by listening.'),
 ('touch', 'Touch', 'TEXTURE AND PRESSURE',
  'Museums say look, don’t touch. Digital work does not have to.',
  [('Jabblrs', 'Britt Ransom, 2016', 'Silicone objects with electronics and code. Dogs play with them, with their mouths.'),
   ('Elephant “jukebox”', 'Fiona French, 2014–2021', 'Elephants use their trunks on tactile controls to trigger sounds.'),
   ('Good Night Lamp', 'Alexandra Deschamps-Sonsino and collaborators, 2005–2015', 'Switch your lamp on, and a lamp in someone else’s home lights up.')],
  'Touch › <b>On hold gesture</b> rewards patience. <b>Drag &amp; Drop</b> lets them push things. Browser › <b>Vibrate</b> buzzes phones that support it.',
  'In your future, what can no longer be touched? Let the visitor hold, press or wait instead of just look.'),
 ('move', 'Move', 'KINAESTHESIA AND PROPRIOCEPTION',
  'Knowing where your body is, and how it moves.',
  [('Wooden Mirror', 'Daniel Rozin, 1999', 'Hundreds of wooden pieces tilt to mirror the person in front of it.'),
   ('Rain Room', 'Random International, 2012', 'It rains everywhere, except where you walk.'),
   ('MIMICRY', 'Sougwen Chung, 2015', 'A robot arm draws alongside the artist, copying the artist’s lines.')],
  'Every tick › Set position to <b>Mouse.X</b>, <b>Mouse.Y</b> (or Touch.X, Touch.Y). The world can follow, flee or copy the visitor.',
  'What in your future moves away when you come near? Or what only appears when you hold still?'),
 ('tilt', 'Balance', 'VESTIBULAR PERCEPTION',
  'Balance: the sense that tells you which way is up.',
  [('Can’t Help Myself', 'Sun Yuan and Peng Yu, 2016', 'A robot arm keeps trying to sweep a spreading liquid back into place.'),
   ('tele-present water', 'David Bowen, 2011', 'Live data from a buoy far away moves a grid of wires like the sea.')],
  'On a phone, Touch gives the tilt: <b>Touch.Beta</b> and <b>Touch.Gamma</b>. On iPhone, add Touch › <b>Request permission</b> first.',
  'A future that will not stay level: let the visitor tilt the phone to keep something from spilling.'),
 ('inside', 'Inside', 'INTEROCEPTION',
  'Conditions within the body: heartbeat, breath, hunger.',
  [('Pulse Room', 'Rafael Lozano-Hemmer, 2006', 'Your heartbeat becomes a flashing light bulb among hundreds of others.'),
   ('BioMuse performance', 'Atau Tanaka, early 1990s–', 'Signals from the body play the music.'),
   ('Data Garden Quartet', 'Data Garden, 2012', 'Signals from plants become music through MIDI.')],
  'Construct cannot read a heartbeat, but it can fake one: System › <b>Every X seconds</b>, where X shrinks as a variable grows. A pulse that speeds up.',
  'What does the body feel in your future: thirsty, tired, calm? Give your work a pulse.'),
 ('signal', 'Invisible', 'DATA MADE SENSIBLE',
  'Turning what we cannot sense into something we can. MIDI does this: control messages become sound.',
  [('Electrical Walks', 'Christina Kubisch, 2003', 'Induction headphones make electromagnetic activity audible.'),
   ('Amphibious Architecture', 'The Living Architecture Lab and NYU Environmental Health Clinic, 2009', 'Lights on the river respond to fish and water quality.')],
  'Translate one number into another sense: a variable sets a volume, a colour, a speed. Start with your own made-up data.',
  'What is invisible in your future: the water, the air, the AI? Make it heard, felt or seen.'),
]


def senses():
    btns = ''.join(f'<button type="button" data-fs="{k}" aria-pressed="{str(i == 0).lower()}">'
                   f'<svg viewBox="0 0 80 80" aria-hidden="true">{SENSE_ART[k]}</svg><span>{t}</span></button>'
                   for i, (k, t, *_) in enumerate(SENSES))
    panels = ''
    for k, t, kick, idea, works, c3, future in SENSES:
        w = ''.join(f'<li><b>{a}</b><small>{b}</small><span>{c}</span></li>' for a, b, c in works)
        panels += (f'<article class="fs-panel" data-fs-panel="{k}"><div class="fs-art" aria-hidden="true"><svg viewBox="0 0 80 80">{SENSE_ART[k]}</svg></div>'
                   f'<div class="fs-body"><p class="fq-kicker">{kick}</p><h3>{t}</h3><p class="fs-idea">{idea}</p>'
                   f'<ul class="fs-works">{w}</ul><div class="fs-do"><p><span class="fq-tag">IN CONSTRUCT</span> {c3}</p>'
                   f'<p><span class="fq-tag fs-tag-future">IN YOUR FUTURE</span> {future}</p></div></div></article>')
    return (
     '<section class="fq-gate fs-gate" id="senses" aria-labelledby="gs" data-fs=""><p class="fq-kicker">BEYOND THE SCREEN · FROM ALINTA’S LECTURE</p>'
     '<h2 id="gs">Close your eyes. Is it still art?</h2>'
     '<p class="fq-sub"><i>Aesthetics</i> comes from the Greek <i>aisthetikos</i>: “of sense perception”. Not only what looks good. '
     'Seeing is believing, but looking is only one way in. The brief even names an interactive sound piece.</p>'
     f'<div class="fs-switch" role="group" aria-label="Choose a sense" hidden="">{btns}</div><div class="fs-panels">{panels}</div>'
     '<div class="fs-test"><p class="fq-kicker">THE EYES-CLOSED TEST</p><p>Let someone try your work for ten seconds with their eyes closed, '
     'or with the screen turned away. What is left? That is your work beyond the screen.</p></div>'
     '<p class="fq-small">Works from Alinta’s lecture “Digital art beyond the screen”. Find them by name for photos and sources, and cite what you use.</p></section>')


PARTS = [
 ('link', '1 · The link', 'On your front page, clearly labelled: <b>Interactive work: https://…</b> and <b>Video walkthrough: https://…</b> <a href="academic-library.html#writing-desk">See the paper →</a>', ''),
 ('theme', '2 · The theme', 'What future does your work imagine, and for whom is it preferred? How is your work one early step? <a href="#forge">Future forge ↑</a>', '600'),
 ('genre', '3 · The genre', 'Which genre or genres, and why? Describe how it works: rules, mechanics, state. <a href="#machine">Game machine ↑</a> · <a href="academic-library.html#genre-explorer">Genre explorer</a>. Cite your sources.', '500'),
 ('process', '4 · The process', 'Frame, research, try, test: how did you make it, and what did testing change? Skip “I had never used the software”. <a href="academic-library.html#writing-desk">How to cite →</a>', '700'),
 ('frame', 'Opening and ending', 'Optional: what the work is, in a few sentences, and what you would do next.', '200'),
]
SEALS = [
 ('work', 'Interactive', 'Someone can do something, and it is about a speculative digital future.'),
 ('link', 'The link works', 'Public. Opens in a private window and on a phone.'),
 ('video', 'The video', 'Shows the work functioning. Its link is in the text.'),
 ('words', '2000 words', 'Between 1800 and 2200 (10% over or under).'),
 ('parts', 'Four parts', 'Labelled link, theme, genre and process.'),
 ('ai', 'Your own', 'Made and written by you, unless AI is part of your theme.'),
 ('inspera', 'Uploaded', 'The text with both links, in Inspera in week 50.'),
]


def hub():
    labs = ''.join(f'<label><input type="checkbox" data-fq-lab="{i}"/> Lab {n + 1} · {d}</label>' for n, (i, d) in enumerate(LAB_DATES))
    parts = ''.join(f'<div class="fq-part" data-part="{k}"><div class="fq-part-head"><h3>{t}</h3><span class="fq-pc" data-fq-pc="">0 words</span></div>'
                    f'<p>{h}</p><textarea data-fq-part="{k}" data-title="{escape(re.sub("<[^>]+>", "", t))}" data-aim="{a}" rows="{3 if k == "link" else 6}" '
                    f'aria-label="{escape(re.sub("<[^>]+>", "", t))}"></textarea></div>' for k, t, h, a in PARTS)
    seals = ''.join(f'<li><label><input type="checkbox" data-fq-seal="{k}"/><span class="l4-seal" aria-hidden="true">{i:02d}</span>'
                    f'<span class="l4-txt"><b>{t}</b>{d}</span></label></li>' for i, (k, t, d) in enumerate(SEALS, 1))
    tick = lambda items, key: f'<ol class="fq-steps" data-fq-list="{key}">' + ''.join(f'<li><label><input type="checkbox"/><span>{x}</span></label></li>' for x in items) + '</ol>'
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1" name="viewport"/><title>Final quest | DIKULT105</title>
<meta content="Everything for the DIKULT105 final assessment: the brief, the 2000-word text, the link, the video walkthrough and the AI rules." name="description"/>
<link href="setup.css" rel="stylesheet"/><link href="studio.css?v=3" rel="stylesheet"/><link href="accessibility.css?v=contrast20261009" rel="stylesheet"/><script defer="" src="accessibility.js?v=3"></script>
<link href="computing-history.css?v=contrast20261009" rel="stylesheet"/><link href="c3-walk.css?v=25" rel="stylesheet"/><link href="final-quest.css?v=4" rel="stylesheet"/>
<script defer="" src="lab-audio.js?v=4"></script><script defer="" src="final-quest.js?v=4"></script></head>
<body class="studio time-lab fq-page"><a class="skip-link" href="#main-content">Skip to the final quest</a>
<header class="studio-header"><a href="lab-programme.html">Creating Digital Culture</a><nav aria-label="Main navigation"><a href="lab-programme.html">Lab map</a><a href="final-assessment.html" aria-current="page">Final quest</a><a href="tools.html">Guides</a></nav></header>
<main id="main-content">
<section class="l4-host fq-hero" aria-labelledby="fq-h1"><div class="l4-host-copy"><p class="fq-kicker">FINAL QUEST · DIKULT105 · WEEK 50</p>
<h1 id="fq-h1">Build a future.<br/>Hand it in calm.</h1>
<p class="fq-lead">One interactive piece about <b>speculative digital futures</b>. One text of 2000 words. One video. One link that works. Everything you need is on this page.</p>
<p class="fq-count" data-fq-count="">Week 50. Exact deadline: Inspera.</p><br/><a class="fq-start" href="#gate0">Start at gate 0 ↓</a></div>
<div class="l4-host-art">{FUTURE_SVG}</div></section>

{road('Where you are', go=False)}

{room_map()}

<section class="fq-gate" id="gate0" aria-labelledby="g0"><p class="fq-kicker">GATE 0 · CAN I SUBMIT?</p><h2 id="g0">Two keys open the exam door.</h2>
<p class="fq-sub">The final assessment can only be taken when both keys are yours.</p><div class="fq-grid">
{card('KEY 1', 'Three passed obligatory tasks', f'<p>Look in <a href="{COURSE}/grades" target="_blank" rel="noopener">Mitt UiB › Vurderingar ↗</a>. A <b>1</b> in the box means passed.</p><p>Missing one? Week 45 may be your last chance. The task texts are on Mitt UiB.</p>', 'is-key')}
<article class="fq-card fq-in is-key" data-fq-att=""><span class="fq-tag">KEY 2</span><h3>75% attendance</h3><p>Mitt UiB cannot show this. Tick what you came to.</p>
<div class="fq-att">{labs}</div><p class="fq-lect"><label>Lectures attended <input type="number" min="0" max="10" value="0" data-fq-lect=""/> of 10</label></p><p class="fq-small">The week 44 video lecture counts if you watch it.</p>
<div class="fq-meter" aria-hidden="true"><span></span><i></i></div><p class="fq-att-out" data-fq-att-out="" role="status"></p>
<p class="fq-small">Your own tracker, saved only in this browser. Not an official record: ask Alinta if you are unsure.</p></article>
</div></section>

<section class="fq-gate" id="brief" aria-labelledby="g1"><p class="fq-kicker">GATE 1 · THE BRIEF</p><h2 id="g1">Speculative digital futures.</h2>
<p class="fq-sub">An imagined future world. Not necessarily science fiction. What do you speculate will happen?</p><div class="fq-grid">
{card('THE WORK', 'Interactive, and yours', '<p>An interactive artwork, an artistic game, or a mix. It can be a sound piece.</p><p>Web design is allowed if you use it creatively. A plain website is not enough: build something unique.</p>')}
{card('THE TEXT', '2000 words', '<p>10% over or under is allowed. It has a labelled link, and analyses the theme, the genre and your process.</p><p><a href="#doc">Text builder ↓</a></p>')}
{card('THE VIDEO', 'Show it working', '<p>A walkthrough that shows the work at its best, in case the examiners miss something. Speaking is optional.</p><p><a href="#video">Video guide ↓</a></p>')}
{card('THE LINK', 'It must open', '<p>itch.io is recommended. GitHub or another public host also works.</p><p>A broken or private link may fail. A nickname is fine.</p>', 'is-warn')}
</div>
<div class="fq-gen" data-fq-gen=""><p class="fq-kicker">FUTURE GENERATOR</p><p>Futures from the brief: climate change, pandemics, extinction, environmental loss, talking with other planets, AI and fresh water, AI and office jobs, AI and creativity.</p>
<button type="button" class="fq-btn" hidden="">Spin a future</button><p class="fq-gen-out" data-fq-gen-out="" aria-live="polite">? + ? + ?</p><p class="fq-small">Not your idea? Spin again. Your own idea always wins.</p></div></section>

{forge()}

{machine()}

{senses()}

{studio()}

<section class="fq-gate" id="doc" aria-labelledby="g2" data-fq-doc=""><p class="fq-kicker">GATE 2 · THE TEXT</p><h2 id="g2">2000 words, four parts.</h2>
<p class="fq-sub">Write here or in your own document. Write it yourself: AI may only do light editing if you write in English.</p>
<div class="fq-total"><b data-fq-total="">0</b><span>WORDS · AIM 2000 · BAND 1800-2200</span></div>
<div class="fq-band" aria-hidden="true"><span class="fq-zone"></span><span class="fq-pin"></span></div><div class="fq-band-scale" aria-hidden="true"><span style="left:0">0</span><span style="left:69.2%">1800</span><span style="left:84.6%">2200</span><span style="left:100%">2600</span></div>
<p class="fq-status" data-fq-status="" role="status">1800 words to the minimum (1800).</p>
<div class="fq-parts">{parts}</div>
<p class="fq-small">Saved only in this browser on this device. Nothing is sent anywhere. Keep your real copy in your own document. Suggested word counts are only a guide.</p>
<p><button type="button" class="fq-btn" data-fq-copy="" hidden="">Copy all</button><button type="button" class="fq-btn is-quiet" data-fq-clear="" hidden="">Clear the boxes</button> <span data-fq-docmsg="" role="status"></span></p></section>

<section class="fq-gate" id="publish" aria-labelledby="g3"><p class="fq-kicker">GATE 3 · THE LINK</p><h2 id="g3">A link that opens for a stranger.</h2>
<p class="fq-sub">You submit a link, not your Construct file. If the examiners cannot open it, they cannot grade it.</p>
{tick(['Export for the web. Construct: Menu › Project › Export, then the web option. <a href="publish-guide.html">Publish guide →</a>',
       'Upload to itch.io as a game you can play in the browser. Set it to <b>public</b>, not draft.',
       'Want to stay anonymous? Use a nickname on your itch.io profile. Your name on the work is your choice.',
       'Open the exact link in a <b>private window</b>. Does it start? Does the main interaction work?',
       'Open it on a <b>phone</b> or another computer.',
       'Paste it into the text as <b>Interactive work: https://…</b>'], 'ship')}</section>

<section class="fq-gate" id="video" aria-labelledby="g4"><p class="fq-kicker">GATE 4 · THE VIDEO</p><h2 id="g4">Show it working, in its best light.</h2>
<p class="fq-sub">The video helps the examiners see what they might miss. You do not have to speak.</p>
{tick(['Plan three moments: the start, the main interaction, and the moment something changes.',
       'Record your screen.<span class="fq-keys"><span>Windows: Win + Shift + R (Snipping Tool)</span><span>Mac: Cmd + Shift + 5</span><span>Chromebook: Ctrl + Shift + Show windows › Screen record</span><span>Linux: Print Screen › video, or OBS Studio</span></span>',
       'Play slowly. Let each change finish before you move on.',
       'Speak, add short captions, or stay silent. All are fine.',
       'Upload it where the examiners can watch: Panopto in the Mitt UiB menu, or YouTube set to <b>Unlisted</b>. Check the link in a private window.',
       'Paste it into the text as <b>Video walkthrough: https://…</b>'], 'video')}</section>

<section class="fq-gate" id="ai" aria-labelledby="g5"><p class="fq-kicker">GATE 5 · AI RULES</p><h2 id="g5">Your work, your words.</h2><div class="fq-ai">
{card('THE WORK', 'No AI in making it', '<p class="fq-big">…unless AI is part of your theme, speculative futures.</p><p>Alinta explains this in class. Unsure? Ask her before you use it.</p>')}
{card('THE TEXT', 'Do not let AI write it', '<p class="fq-big">A text that looks mostly AI-written may not pass.</p><p>Parts that look AI-written may not be read. Light editing is allowed if you write in English.</p>')}
</div></section>

<section class="l4-ready" id="seals" aria-labelledby="g6" data-fq-seals=""><p class="l4-ready-kicker">FINAL GATE · INSPERA · WEEK 50</p><h4 id="g6">Light all seven seals</h4>
<ol class="l4-checks">{seals}</ol><div class="l4-meter" aria-hidden="true"><span></span></div><p class="l4-status" role="status"></p>
<div class="l4-done" hidden=""><p><b>Ready.</b> Upload your text to Inspera in week 50. The exact deadline is there.</p></div>
<p class="l4-official">The official task text is on Mitt UiB under Files. If this page and the task text differ, the task text wins.</p></section>

<section class="fq-gate" id="stuck" aria-labelledby="g7"><p class="fq-kicker">WEEKS 48-49 · NO CLASSES</p><h2 id="g7">Stuck? Start here.</h2>
<div class="fq-tiles"><a href="tools.html#construct-toolkit"><b>Construct toolkit</b><small>Templates, rules, shortcuts and fixes.</small></a>
<a href="publish-guide.html"><b>Publish guide</b><small>From your folder to a playable link.</small></a>
<a href="academic-library.html#genre-explorer"><b>Genre explorer</b><small>Find the words for your genre.</small></a>
<a href="lab-programme.html"><b>Every lab is open</b><small>Replay any Friday, any time.</small></a>
<a href="{COURSE}/announcements" target="_blank" rel="noopener"><b>Mitt UiB announcements ↗</b><small>Dates and changes from Alinta.</small></a></div>
<p class="fq-calm"><b>Breathe.</b> Small and working beats big and broken. Cut one feature, keep the idea, test the link, and write about what you learned while making it.</p></section>
<p><a href="lab-programme.html">← Back to the lab map</a></p>
</main></body></html>
'''


def build(root):
    (root / 'labs/final-assessment.html').write_text(hub(), encoding='utf-8', newline='\n')
    patch_programme(root)
    patch_ai_pages(root)


if __name__ == '__main__':
    build(Path(__file__).resolve().parent.parent)
    print('ok')
