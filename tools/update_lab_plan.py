"""Apply the October teaching plan to a clean source tree. All I/O is UTF-8.

Usage: python tools/update_lab_plan.py --source PATH --templates ZIP
The destination is the directory containing tools/. The source is read only.
"""
from pathlib import Path
import argparse
import copy
import json
import re
import zipfile
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True, type=Path)
parser.add_argument('--templates', required=True, type=Path)
args = parser.parse_args()
BASE = args.source / 'labs'
OUT = ROOT / 'labs'
DATES = ['2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30']
DAYS = [2, 9, 16, 23, 30]
changed = set()

def read(name):
    return (BASE / name).read_text(encoding='utf-8')

def write(name, text):
    text = text.replace('\u2014', ': ').replace('\u2013', '-')
    target = OUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists() or target.read_text(encoding='utf-8') != text:
        target.write_text(text, encoding='utf-8', newline='\n')
    if not (BASE / name).exists() or read(name).replace('\r\n', '\n') != text:
        changed.add('labs/' + name)

def soup(text):
    return BeautifulSoup(text, 'html.parser')

def fragment(html):
    return soup(html).find()

def settext(root, selector, value):
    node = root.select_one(selector)
    assert node is not None, selector
    node.clear()
    node.append(value)

def replace_node(root, selector, html):
    node = root.select_one(selector)
    assert node is not None, selector
    node.replace_with(fragment(html))

def fix_quotes(text):
    replacements = {
        '?I chose ___ because ___. My test showed ___.?': '&quot;I chose ___ because ___. My test showed ___.&quot;',
        '?the element with id story?': '&quot;the element with id story&quot;',
        '?no?': '&quot;no&quot;',
        'paragraph?s': "paragraph's", 'Microsoft?s': "Microsoft's",
        'Turing?s': "Turing's", 'student?s': "student's",
        'Open the step-by-step tutorial ?': 'Open the step-by-step tutorial &rarr;',
        'Go to my project ?': 'Go to my project &rarr;',
        'Open the new lab programme ?': 'Open the new lab programme &rarr;',
        'DIKULT105 ? The new lab programme': 'DIKULT105: The new lab programme',
        'OPEN EXPERIMENT ?': 'OPEN EXPERIMENT &rarr;',
        'Target chosen: test it ?': 'Target chosen: test it &rarr;',
        'Evidence collected: improve it ?': 'Evidence collected: improve it &rarr;',
        'Change made: verify it ?': 'Change made: verify it &rarr;',
        'Save my repair log to my project note ?': 'Save my repair log to my project note &rarr;',
    }
    for a, b in replacements.items():
        text = text.replace(a, b)
    return text

# Correct the damaged source strings rather than re-encoding already lost characters.
for path in BASE.glob('*.html'):
    text = read(path.name)
    fixed = fix_quotes(text)
    if fixed != text:
        write(path.name, fixed)

original = fix_quotes(read('lab-programme.html'))
page = soup(original)
labs = [page.select_one('#lab-' + str(n)) for n in range(1, 6)]
old_library = copy.deepcopy(labs[3].select_one('[data-mission-kind="stacks"]'))
gate = labs[2].select_one('[data-mission-kind="gate"]').extract()
shared_schedule = [copy.deepcopy(row) for row in labs[2].select('.agenda-row') if row.get('data-extension') != 'true']

# Fixed slot: 45 minutes of work, 10-minute break, 30 work, 5 break, 15 save/reflection.
for n, lab in enumerate(labs, 1):
    lab['data-unlock-date'] = DATES[n - 1]
    lab.select_one('.quest-content').attrs.pop('hidden', None)
    header = lab.select_one('.eyebrow')
    header.string = f'LAB {n:02d} / FRIDAY {DAYS[n - 1]} OCTOBER 2026'
    for time in lab.select('time[datetime]'):
        time['datetime'] = DATES[n - 1]
        time.string = f'{DAYS[n - 1]} October 2026'
    settext(lab, '.session-window', 'Morning · 08:15-10:00 · 105 minutes')
    preview = lab.select_one('.quest-preview')
    preview['hidden'] = ''
    for p in preview.select('p'):
        p.string = 'Every lab is open. Start here or revisit any earlier experiment.'
    if preview.select_one('h3,h4'):
        preview.select_one('h3,h4').string = 'Choose your experiment.'
    rows = lab.select('.agenda-row')
    for row in list(rows):
        if row.get('data-extension') == 'true':
            row.decompose()
    rows = lab.select('.agenda-row')
    # Lab 4's old library travel agenda is replaced with the shared workshop structure.
    if n == 4:
        agenda_parent = rows[0].parent
        for row in rows:
            row.decompose()
        for row in shared_schedule:
            agenda_parent.append(copy.deepcopy(row))
        rows = lab.select('.agenda-row')
    rows[4]['data-minutes'] = '10'
    rows[5]['data-minutes'] = '30'
    short_break = copy.deepcopy(rows[4])
    short_break['data-minutes'] = '5'
    for node in short_break.find_all(string=True):
        if 'Break: step away' in str(node):
            node.replace_with(str(node).replace('Break: step away', 'Short break: reset'))
    rows[5].insert_after(short_break)
    elapsed = 0
    for row in lab.select('.agenda-row'):
        minutes = int(row['data-minutes'])
        def clock(x):
            return f'{x // 60:02d}:{x % 60:02d}'
        settext(row, '.clock', f'{clock(495 + elapsed)}-{clock(495 + elapsed + minutes)}')
        settext(row, '.elapsed', f'{elapsed}-{elapsed + minutes} min')
        elapsed += minutes
    assert elapsed == 105
    agenda = rows[0].parent
    for node in lab.find_all(string=True):
        text = str(node)
        if 'includes one 15-minute break' in text:
            node.replace_with('Today\'s timetable · two breaks: 09:00-09:10 and 09:40-09:45 (morning), 15:00-15:10 and 15:40-15:45 (afternoon)')
        elif 'The scheduled break is at' in text:
            node.replace_with('Take it. Your progress stays here when storage is available. Scheduled breaks: 09:00-09:10 and 09:40-09:45 (morning), or 15:00-15:10 and 15:40-15:45 (afternoon).')
        elif 'unlock Save & reflect' in text:
            node.replace_with(text.replace('unlock Save & reflect', 'record your progress'))
        elif 'to unlock the last step' in text:
            node.replace_with(text.replace('to unlock the last step', 'to record your progress. All steps remain open'))

lab3, lab4, lab5 = labs[2:]
settext(lab3, 'h2', 'Construct 1: first contact')
settext(lab4, 'h2', 'Construct 2: rules and rooms')
settext(lab5, 'h2', 'Test lab: user testing and publishing')
settext(lab3, '.lab-title .lead', 'What can a map reveal about a place when someone taps it?')
settext(lab4, '.lab-title .lead', 'How does a room remember a choice, and how does the player find a way back?')
settext(lab4, '.outcome > p:first-child', 'Leave with: your saved Construct project, one tested rule and a working route between rooms.')
settext(lab4, '.outcome > p:last-child', 'Connect to the course: a condition makes a consequence possible. A layout and its navigation shape how a story can be explored.')

replace_node(lab3, '#lab-3-sec-1', '''<div class="section-band sb-prepare" id="lab-3-sec-1"><p class="sb-meta"><span class="sb-no">01</span><span class="sb-badge">PREPARE</span></p><h3 class="sb-title">Start here</h3><p class="sb-desc">New to Construct? A Layout is your scene. Properties change a selected object. An Event sheet connects a condition to an action. No AI required.</p><ol><li>Activate Pro using the instructions below.</li><li>Open Alinta's <a href="construct-templates.html?lab=3#tpl-map">Mapping template</a>.</li><li>Select a text object and move it on the map.</li><li>Choose <strong>Preview layout</strong> for the map you are editing. See what moved.</li></ol></div>''')
settext(lab3, '#lab-3-sec-2 .sb-title', 'Make your map respond')
map_task = fragment('''<section class="course-panel" id="mapping-first-contact"><p class="eyebrow">CONSTRUCT 1 / YOUR CAMPUS, YOUR STORY</p><h3>Three places. One hidden thought.</h3><ol><li>Choose one of the four map layouts in the Mapping template.</li><li>Add at least three Text objects about real or fictional places on campus. Use your own memories, rumours or imagined scenes.</li><li>Connect your text boxes with arrows or paths. A reader can start anywhere.</li><li>Add the <strong>Touch</strong> object. Create another Text object and set its initial visibility to invisible.</li><li>In the map's Event sheet, add <strong>Touch &gt; On tap object</strong> for a visible object. Add the action <strong>Text &gt; Set visible</strong> for your hidden text. Make sure this Event sheet is assigned to the map layout.</li><li>Use <strong>Preview layout</strong>, tap your object and check that the hidden text appears. Save the editable project as a <strong>.c3p</strong>.</li></ol><p class="small">A workshop, not a speedrun. Continue your own project if you already have one. Choose a small reveal that fits it.</p><details><summary>Nothing happened? Check these four things.</summary><ul><li><strong>No tap response:</strong> add Touch, then check the tapped object and the layout's Event sheet.</li><li><strong>Wrong map in Preview:</strong> use Preview layout. The project starts on its first layout by default.</li><li><strong>Missing object:</strong> move it inside the layout, rather than outside its edges.</li><li><strong>Work disappeared:</strong> save your .c3p somewhere you can find again.</li></ul></details><details><summary>Ready for another experiment? NPC_Text</summary><p>Open <a href="construct-templates.html?lab=3#tpl-npc">NPC_Text</a>. Tap the green MainCharacter square. In the Project Bar's Files folder, open <strong>NewArray.json</strong> and replace the word choices with your own. Preview and tap again: which sentences does your list make possible?</p></details></section>''')
lab3.select_one('#lab-3-sec-2').insert_after(map_task)
settext(lab3, '.arrival-prompt', 'Think of a place on campus that feels different to you than to someone else. What would you reveal about it? Today you turn that place into a map in Construct, one text box and one tap at a time.')
settext(lab3, '.checkin-example', 'Example: "The stairs behind the library feel like a secret entrance. Today a tap on my map will reveal an imagined story there."')
settext(lab3, '#checkin-title-3', 'A familiar place can hide another story.')
replace_node(lab3, '.arrival-rec', '<span class="arrival-rec"><span class="rec-dot" aria-hidden="true"></span>A PLACE ONLY YOU KNOW</span>')
for li, value in zip(lab3.select('.arrival-feed li'), ['MapOption1', 'three places', 'tap to reveal', 'project saved']):
    li.string = value

# Replace library practice in Lab 4, preserving its interactive quest in the optional guide.
old = lab4.select_one('[data-mission-kind="stacks"]')
old.replace_with(gate)
settext(gate, '.fm-eyebrow', 'TECHNIQUE 04 / CONDITIONS AND ACTIONS')
for link in gate.select('a[href]'):
    link['href'] = link['href'].replace('?lab=3', '?lab=4')
    if link['href'].startswith('library-lab.html'):
        link['href'] = 'library-lab.html'
settext(lab4, '#lab-4-sec-1 .sb-title', 'Practice: Gate Engine')
scene_task = fragment('''<section class="course-panel" id="construct-rooms"><p class="eyebrow">CONSTRUCT 2 / CONTINUE YOUR PROJECT</p><h3>A room remembers what you did.</h3><p>Reopen your Construct 1 .c3p. Give one choice a consequence, or connect your map to another layout. Keep the work you already made.</p><p>For a Rusty Lake style room experiment, open Alinta's <a href="construct-templates.html?lab=4#tpl-students">SceneSetUpForStudents</a>, compare <a href="construct-templates.html?lab=4#tpl-full">SceneSetUpFullExample</a>, then inspect <a href="construct-templates.html?lab=4#tpl-move">SceneSetUpHowToMakeMovementExample</a>.</p><ol><li>Test the cupboard or curtain in the full example. Find its condition, action and state variable.</li><li>Open the movement example and tap a North arrow. Only North has arrows inside the room. Other walls leave the player stuck.</li><li>Move or add navigation arrows inside East, South and West. Give each arrow the correct target layout. Shared events must not send every arrow to East.</li><li>Preview and test a complete route out and back. Check each room, then save the .c3p.</li><li>Use one rule or room connection in your own project. A room can be a memory, a mood or a place on your map.</li></ol><p>No AI required. Test one condition that fails and one that passes. What changes for the person playing?</p></section>''')
gate.insert_after(scene_task)
settext(lab4, '#checkin-title-4', 'You entered a room and knew something had changed.')
settext(lab4, '.arrival-prompt', 'Think of a room you remember: a game room, a classroom, a kitchen after everyone left. What detail told you what had happened there? Today your Construct project remembers a choice, and its rooms need a way back.')
settext(lab4, '.checkin-example', 'Example: "An open cupboard tells me someone was here. Today a tap changes my room, and the arrows let the player return."')
settext(lab4, '.attendance-strip > span', 'ARRIVAL 04 / ROOMS WITH MEMORY')
replace_node(lab4, '.arrival-rec', '<span class="arrival-rec"><span class="rec-dot" aria-hidden="true"></span>A WAY IN, A WAY BACK</span>')
settext(lab4, '.colour-note', 'Pick a colour for a room you remember.')
for li, value in zip(lab4.select('.arrival-feed li'), ['door: open', 'cupboard: closed', 'north > east', 'find the way back']):
    li.string = value
for button, starter in zip(lab4.select('[data-starter]'), ['A room I remember is ', 'One detail told me that ', 'In my project a choice should change ']):
    button['data-starter'] = starter
    button.string = starter + '...'
settext(lab4, '.pass-label', 'DIKULT105 / LAB PASS / ROOMS WITH MEMORY')

def mission(lab, n, title, intro, prompt, checks, note):
    settext(lab, '.mission-brief h3', title)
    brief = lab.select_one('.mission-brief')
    brief.find('p', class_=False).string = intro
    settext(lab, '.mission-prompt', prompt)
    for el, value in zip(lab.select('.mission-check span'), checks):
        el.string = value
    settext(lab, '.own-mind h4', prompt)
    settext(lab, '.own-mind > p:not(.eyebrow):not(.own-mind-note)', intro)
    lab.select_one('.own-mind-actions').decompose()
    settext(lab, '.own-mind-note', note)
    link = brief.select_one('a.primary')
    link['href'] = 'construct-templates.html?lab=' + str(n) + ('#tpl-map' if n == 3 else '#tpl-move')
    link.string = 'Open the Mapping template guide' if n == 3 else 'Open the room template guide'
    settext(lab, '.lab-finish > div:nth-of-type(2) > p:last-child', note)
    lab.select_one('.mission-actions textarea')['placeholder'] = note

mission(lab3, 3, 'Map three places', 'Compose a campus story in Construct. Keep your own voice in the text.', 'What does a tap reveal about your place?', ['Choose one map and add at least three text boxes about real or fictional campus places.', 'Connect them with arrows or paths and add one tap that reveals hidden text.', 'Use Preview layout to test the reveal, then save your .c3p.'], 'I chose these places because ____. Tapping ____ reveals ____. My test showed ____. I saved my .c3p at ____.')
mission(lab4, 4, 'Make rules and rooms work', 'Continue the Construct project you began last time.', 'What does your project remember after a choice?', ['Reopen your project and choose a rule or room connection to develop.', 'Connect a condition to an action and repair the navigation between your rooms.', 'Test the rule and a route out and back. Save your .c3p.'], 'My condition is ____. My action changes ____. The route out and back is ____. Testing showed ____. I changed ____.')
settext(lab4, '.lab-finish > div:nth-of-type(2) > p:first-of-type', 'Keep a note of the rule you tested, the room route you repaired and the next change your project needs.')
replace_node(lab4, '.lab-finish > div:first-of-type ul', '<ul><li>A saved Construct project with a rule or connected rooms.</li><li>A tested path out and back, with one observation about what changed.</li></ul>')
for n, lab in [(3, lab3), (4, lab4)]:
    replace_node(lab, '.resources', f'''<details class="resources"><summary>Open the Construct guides</summary><ul><li><a href="construct-guide.html?lab={n}">Construct basics and common mistakes</a></li><li><a href="construct-templates.html?lab={n}">Alinta's six templates</a></li><li><a href="https://editor.construct.net/" target="_blank" rel="noopener">Open Construct 3</a></li><li><a href="https://www.freecodecamp.org/learn/" target="_blank" rel="noopener">Want more JavaScript? Explore freeCodeCamp separately.</a></li></ul></details>''')
    replace_node(lab, '.step-map', f'''<nav class="step-map" aria-label="Experiment sections"><p class="sm-label">ON THIS STEP</p><ol><li><a href="#lab-{n}-sec-1">01 {'Start here' if n == 3 else 'Gate Engine'}</a></li><li><a href="#{'mapping-first-contact' if n == 3 else 'construct-rooms'}">02 {'Your map' if n == 3 else 'Rules and rooms'}</a></li><li><a href="#lab-{n}-sec-{'3' if n == 3 else '2'}">03 Your project</a></li><li><a href="#lab-{n}-sec-{'4' if n == 3 else '3'}">04 Guides</a></li></ol></nav>''')
    settext(lab, '.time-unlock h4', 'Relay detective + sound machine' if n == 3 else 'Connected world')
    settext(lab, '.time-unlock > p:not(.eyebrow):not(.small)', 'Inspect a failed response, then test your repair. Connect it to the tap on your map.' if n == 3 else 'Connect two ideas, then connect your rooms. Which route lets the player return?')
    settext(lab, '.time-unlock .small', 'Optional experiment, 3-5 minutes within project time. All machines are open.')

publish = fragment('''<section class="course-panel" id="publish-your-project"><p class="eyebrow">TEST LAB / LET SOMEONE PLAY</p><h3>Export a playable version.</h3><p><strong>Construct route:</strong> save your editable <strong>.c3p</strong>, then use <strong>Export &gt; Web (HTML5)</strong>. The .c3p is your source project, not a game other people can play. Keep it separately from the web export.</p><p>Share the exported web build using a web host, such as <a href="https://itch.io/docs/creators/html5" rel="noopener" target="_blank">itch.io's HTML5 upload route</a>. Open the playable link on another device and ask your tester to try it.</p><p><strong>HTML project alternative:</strong> use <a href="github-guide.html?lab=5">GitHub Pages</a> to publish your HTML, CSS and JavaScript. Test the published URL.</p><p>Write what the tester tried, where they hesitated and one change you made. Retest the same task.</p></section>''')
lab5.select_one('.test-lab').insert_after(publish)
publish.append(fragment('<p class="small"><a href="https://www.construct.net/en/make-games/manuals/construct-3/overview/publishing-projects" target="_blank" rel="noopener">Official Construct publishing instructions</a>. Use Menu &gt; Project &gt; Export. Test the hosted URL, rather than opening the export from disk.</p>'))
link = lab5.select_one('.mission-brief a.primary')
link['href'] = '#publish-your-project'
link.string = 'Export and share your playable project'
settext(lab5, '.time-unlock > p:not(.eyebrow):not(.small)', 'Watch how a person finds a control. Connect the observation to your user test and retest.')
settext(lab5, '.time-unlock .small', 'Optional experiment, 3-5 minutes within project time. All machines are open.')

# Splice only the lab articles and the controls/map, keeping unrelated Lab 1 and 2 markup.
result = original
for n, lab in enumerate(labs, 1):
    opening = re.search(rf'<article\b[^>]*\bid="lab-{n}"[^>]*>', result)
    assert opening
    depth = 0
    for tag in re.finditer(r'<(/?)article\b[^>]*>', result[opening.start():]):
        depth += -1 if tag.group(1) else 1
        if depth == 0:
            end = opening.start() + tag.end()
            result = result[:opening.start()] + str(lab) + result[end:]
            break
    else:
        raise ValueError('Unclosed lab article')
map_node = page.select_one('.lab-nav')
titles = ['HTML & CSS', 'JavaScript', 'Construct 1', 'Construct 2', 'Test lab']
for n, a in enumerate(map_node.select('a.lv'), 1):
    settext(a, '.lv-date', f'Lab {n:02d} · {DAYS[n-1]} October')
    settext(a, 'strong', titles[n-1])
    settext(a, '.mission-nav-status', 'Open · choose this lab')
    if n == 4:
        settext(a, '.lv-orb i', 'C3')
result = re.sub(r'<nav\b[^>]*class="lab-nav sl-levels"[^>]*>.*?</nav>', lambda _: str(map_node), result, count=1, flags=re.S)
result = re.sub(r'<select id="duration">.*?</select>', '<select id="duration"><option value="105" selected>105 minutes · two breaks</option></select>', result, count=1, flags=re.S)
result = result.replace('120 minutes', '105 minutes').replace('08:15–10:15', '08:15-10:00').replace('14:15–16:15', '14:15-16:00')
result = result.replace('Labs 1 and 2 are open together; later machines open with their lab.', 'All machines are open.')
write('lab-programme.html', result)

# Optional library guide keeps the old interactive practice, without being a numbered lab.
library = soup(fix_quotes(read('library-lab.html')))
library.title.string = 'Optional essay research guide: Chicago author-date | DIKULT105'
library.select_one('meta[name="description"]')['content'] = 'Optional help for your course essay: find sources, read in context and use Chicago author-date.'
settext(library, '.intro .eyebrow', 'OPTIONAL GUIDE / COURSE ESSAY')
settext(library, '.intro .lead', 'Bring your essay question. Find a useful source. Record what it helps you understand.')
for node in library.select('.guide-return'):
    node['href'] = 'tools.html'
    node.string = 'Back to Guides'
    node['class'] = ['essay-guide-return']
settext(library, '.guide-location > span', 'OPTIONAL GUIDE / ESSAY RESEARCH')
visit = library.select_one('.visit-details')
visit.select_one('summary').string = 'Using the library: location and access'
visit.select_one('h2').string = 'Use the shelves or an accessible ebook.'
visit.find('p').clear()
visit.find('p').append('The Arts and Humanities Library is at Haakon Sheteligs plass 7. Check the linked library pages for current opening hours and access. This guide does not schedule a group visit.')
for node in list(visit.select('p.small')):
    node.clear()
    node.append(fragment('<a href="https://www4.uib.no/en/university-library/about-the-library/opening-hours-and-contact">Check current opening hours</a>'))
for own in library.select('.own-mind'):
    own.decompose()
library.select_one('#steps').insert_before(old_library)
old_library.select_one('.fm-eyebrow').string = 'OPTIONAL PRACTICE / RESEARCH IN CONTEXT'
for node in old_library.select('[data-defend-add]'):
    node.string = 'Copy my research note'
old_library.select_one('[data-defend]').parent.insert_after(fragment('<p class="small">Keep this note with your essay draft. You can copy it without completing a lab.</p>'))
for node in library.find_all(string=True):
    text = str(node)
    text = text.replace('if this is accepted by the assigned task', '')
    text = text.replace('Do not photograph other library users or substitute this for a different compulsory submission.', '')
    if text != str(node):
        node.replace_with(text)
settext(library, '.finish > p', 'Keep two source leads, one passage note and one checked Chicago author-date reference. Your research card is a working note for the essay.')
link = library.select_one('.finish a.primary')
link['href'] = 'tools.html'
link.string = 'Return to Guides'
for script in ['code-missions.js', 'field-missions.js']:
    if not library.select_one(f'script[src^="{script}"]'):
        library.head.append(fragment(f'<script defer src="{script}?v=october-plan-1"></script>'))
for css in ['code-missions.css', 'field-missions.css']:
    if not library.select_one(f'link[href^="{css}"]'):
        library.head.append(fragment(f'<link rel="stylesheet" href="{css}"/>'))
write('library-lab.html', str(library))

with zipfile.ZipFile(args.templates) as archive:
    prefix = next(n[:-len('templates.json')] for n in archive.namelist() if n.endswith('templates.json'))
    data = json.loads(archive.read(prefix + 'templates.json'))
    npc = next(t for t in data['templates'] if t['template'] == 'NPC_Text')
    evidence = ROOT / 'source-material' / 'construct-templates'
    evidence.mkdir(parents=True, exist_ok=True)
    for name in ['README.md', 'templates.json']:
        (evidence / name).write_bytes(archive.read(prefix + name))
    for img in npc['images']:
        image_name = Path(img).name
        (OUT / 'construct-templates' / image_name).write_bytes(archive.read(prefix + img))
        changed.add('labs/construct-templates/' + image_name)

templates = soup(read('construct-templates.html'))
for node in templates.find_all(string=True):
    if 'five' in str(node) or 'Five' in str(node):
        node.replace_with(str(node).replace('five', 'six').replace('Five', 'Six'))
templates.select_one('meta[name="description"]')['content'] = 'Six Construct 3 templates by Alinta: scene setup, room navigation, redaction, nonlinear maps and NPC text.'
npc_section = fragment('''<section class="tp-section" id="tpl-npc"><p class="eyebrow">TEMPLATE 6 / NPC_Text (2).c3p</p><h2>Your words, shuffled into another voice.</h2><p class="lead">Tap the coloured squares to display text. The green MainCharacter builds a sentence from five sets of word choices.</p><div class="tp-task"><p class="tp-label">YOUR TASK</p><ol><li>Open NPC_Text and Preview.</li><li>Tap the green MainCharacter square.</li><li>Open <strong>NewArray.json</strong> in the Project Bar's Files folder. Replace the words, keeping five sentence slots and four choices in each.</li><li>Preview and tap again. Save your .c3p.</li></ol></div><details class="tp-notice"><summary>What works in this template?</summary><p>NPC1 chooses a line from an Array. MainCharacter uses NewArray.json for a five-part sentence. NPC2 currently displays an array dimension, a number, rather than dialogue.</p><p>The separate array.json uses a plain nested list. The supplied documentation marks its loading as uncertain. Use NPC1 or MainCharacter for this exercise.</p></details></section>''')
gallery = fragment('<div class="tp-gallery"></div>')
for img in npc['images']:
    name = Path(img).name
    gallery.append(fragment(f'<figure class="tp-fig"><a href="construct-templates/{name}" target="_blank" rel="noopener"><img src="construct-templates/{name}" loading="lazy" alt="NPC_Text project reference: {name}"/></a><figcaption>NPC_Text reference from the supplied template documentation.</figcaption></figure>'))
npc_section.select_one('.lead').insert_after(gallery)
templates.select_one('#lab-ideas').insert_before(npc_section)
templates.select_one('.tp-routes').append(fragment('<a href="#tpl-npc"><b>ROUTE D</b><strong>NPC text</strong><span>Template 6: replace the word choices and tap for a sentence.</span></a>'))
settext(templates, '#tpl-map .tp-task > p:last-child', 'Choose one of the four maps. Add at least three text boxes about real or fictional campus places and connect them with arrows or paths. In Construct 1, add a tap interaction that reveals hidden text.')
write('construct-templates.html', str(templates))
tools = fix_quotes(read('tools.html')).replace('five Construct templates', 'six Construct templates').replace('Find books for your project', 'Optional essay research · Chicago author-date')
write('tools.html', tools)

guide = soup(read('construct-guide.html'))
guide.select_one('#mistakes .ct-intro').insert_after(fragment('''<div class="tp-notice"><h3>First contact: four quick checks</h3><ul><li><strong>Tap does nothing:</strong> add the Touch object and use On tap object.</li><li><strong>Preview shows the wrong scene:</strong> use Preview layout for the map you are editing.</li><li><strong>An object is missing:</strong> place it inside the layout.</li><li><strong>Keep your work:</strong> download a .c3p copy. It is your editable project, not a playable web export.</li></ul></div>'''))
write('construct-guide.html', str(guide))
credits = read('credits.html').replace('2, 16 and 30 October; 6 and 13 November', '2, 9, 16, 23 and 30 October')
write('credits.html', credits)
teacher = soup(read('plan-for-alinta.html'))
for node in teacher.find_all(string=True):
    text = str(node).replace('Your five templates', 'Your six templates').replace('Your five Construct templates', 'Your six Construct templates')
    text = text.replace('I will lock them by date again after your review.', 'Access stays open so students can return from another computer or after missing a session.')
    text = text.replace('with one 15-minute break', 'with a 10-minute break and a 5-minute break')
    text = text.replace('Confirm one 15-minute break at 09:00 and 15:00.', 'Two breaks: 09:00-09:10 and 09:40-09:45 in the morning, 15:00-15:10 and 15:40-15:45 in the afternoon.')
    if text != str(node):
        node.replace_with(text)
for table in teacher.select('table'):
    heading = table.select_one('tr').get_text(' ', strip=True)
    if heading == 'Morning Afternoon Min What happens':
        rows = table.select('tr')[1:]
        entries = [('08:15-08:20','14:15-14:20','5','Check in and choose a small goal'), ('08:20-08:30','14:20-14:30','10','One useful example'), ('08:30-08:40','14:30-14:40','10','Practice, plan and settle in'), ('08:40-09:00','14:40-15:00','20','Own-project time'), ('09:00-09:10','15:00-15:10','10','Break'), ('09:10-09:40','15:10-15:40','30','Own-project time: continue and test'), ('09:40-09:45','15:40-15:45','5','Short break'), ('09:45-09:55','15:45-15:55','10','Save and reflect'), ('09:55-10:00','15:55-16:00','5','One next step')]
        parent = rows[0].parent
        for row in rows:
            row.decompose()
        for entry in entries:
            parent.append(fragment('<tr>' + ''.join('<td>' + value + '</td>' for value in entry) + '</tr>'))
    if heading.startswith('Lab Date Question'):
        values = [
            ('1. HTML and CSS', 'Fri 2 Oct', 'How can a detail from your life shape a digital work?', 'Existing CSS and colour studio', 'Make, preview and save your page'),
            ('2. JavaScript', 'Fri 9 Oct', 'What does an audience action change?', 'Existing Signal Control Room and optional AI route', 'Build one response and test it twice'),
            ('3. Construct 1: first contact', 'Fri 16 Oct', 'What can a map reveal about a place?', 'Activate Pro, open Mapping, move text and Preview layout', 'Three text boxes, arrows or paths, one tap reveal and a saved .c3p'),
            ('4. Construct 2: rules and rooms', 'Fri 23 Oct', 'How does a room remember a choice?', 'Gate Engine and the Rusty Lake style scene templates', 'Continue the same project, repair room navigation and test a route out and back'),
            ('5. Test lab', 'Fri 30 Oct', 'Can someone use your project?', 'Keep the Test Lab practice', 'Observe, revise and retest. Construct web export first; GitHub Pages for HTML projects'),
        ]
        for row, values_row in zip(table.select('tr')[1:], values):
            for cell, value in zip(row.select('td'), values_row):
                cell.clear(); cell.append(value)
    if heading == 'Machine Guide Used in':
        for row in table.select('tr')[1:]:
            cells = row.select('td')
            if cells and cells[0].get_text(strip=True) in ['Pipeline', 'Control panel', 'Blueprint table']:
                cells[-1].string = 'Labs 3 and 4' if cells[0].get_text(strip=True) != 'Pipeline' else 'Optional JavaScript resource'
            if cells and cells[0].get_text(strip=True) == 'The archive':
                cells[-1].string = 'Optional essay guide'
write('plan-for-alinta.html', str(teacher))

# Source-level JS changes, including old saved duration values.
navigation = read('lab-navigation.js')
start = navigation.index('  // Every lab')
end = navigation.index('  function ready', start)
navigation = navigation[:start] + '''  // Access never depends on earlier completion, a date, or browser storage.
  const OPEN_ALL = true;
  function available(lab) { return true; }
''' + navigation[end:]
navigation = navigation.replace("const lockedText=`Complete Lab ${String(previous).padStart(2,'0')} to unlock this experiment.`;", "const lockedText='Every lab is open. Choose your experiment.';")
write('lab-navigation.js', navigation)
schedule = '''(() => {
  const group = document.getElementById('group');
  const duration = document.getElementById('duration');
  if (!group || !duration) return;
  try {
    const saved = JSON.parse((localStorage.getItem('dik105-session-options') ?? sessionStorage.getItem('dik105-session-options')) || 'null');
    if (saved && ['495', '855'].includes(saved.group)) group.value = saved.group;
  } catch {}
  // Old 120-minute preferences must not extend the actual teaching slot.
  duration.value = '105';
  const CLOCK_KEY = 'dik105-clock-group';
  let clockGroup = group.value;
  try { const saved = localStorage.getItem(CLOCK_KEY); if (['495', '855'].includes(saved)) clockGroup = saved; } catch {}
  const clock = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  function update() {
    const start = Number(clockGroup), length = 105;
    const groupName = start === 495 ? 'Morning' : 'Afternoon';
    document.querySelectorAll('.lab').forEach(lab => {
      let elapsed = 0;
      lab.querySelectorAll('.agenda-row').forEach(row => {
        row.hidden = row.dataset.extension === 'true';
        if (row.hidden) return;
        const minutes = Number(row.dataset.minutes);
        row.querySelector('.clock').textContent = `${clock(start + elapsed)}-${clock(start + elapsed + minutes)}`;
        row.querySelector('.elapsed').textContent = `${elapsed}-${elapsed + minutes} min`;
        elapsed += minutes;
      });
      lab.querySelector('.session-window').textContent = `${groupName} · ${clock(start)}-${clock(start + length)} · 105 minutes`;
    });
    document.querySelectorAll('.time-chip[data-from]').forEach(chip => {
      const from = Number(chip.dataset.from), to = Math.min(Number(chip.dataset.to), length);
      const overlap = (a, b) => Math.max(0, Math.min(to, b) - Math.max(from, a));
      const breaks = overlap(45, 55) + overlap(85, 90);
      chip.textContent = `⏱ ${clock(start + from)}-${clock(start + to)} · ${to - from - breaks} min${breaks ? ' + breaks' : ''}`;
    });
    document.querySelectorAll('[data-clock-group]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.clockGroup === clockGroup)));
    document.body.classList.add('student-view');
    document.getElementById('schedule-status').textContent = `${groupName}: ${clock(start)}-${clock(start + length)}. Two breaks: ${clock(start + 45)}-${clock(start + 55)} and ${clock(start + 85)}-${clock(start + 90)}.`;
  }
  group.addEventListener('change', () => {
    clockGroup = group.value;
    try { localStorage.setItem(CLOCK_KEY, clockGroup); localStorage.setItem('dik105-session-options', JSON.stringify({group: group.value, duration: '105'})); } catch {}
    update();
  });
  duration.addEventListener('change', () => { duration.value = '105'; update(); });
  document.querySelectorAll('[data-clock-group]').forEach(b => b.addEventListener('click', () => {
    clockGroup = b.dataset.clockGroup;
    try { localStorage.setItem(CLOCK_KEY, clockGroup); } catch {}
    update();
  }));
  document.getElementById('print-programme')?.addEventListener('click', () => window.print());
  update();
})();
'''
write('lab-programme.js', schedule)
field = read('field-missions.js').replace('// ---------- Lab 3: Gate Engine', '// ---------- Lab 4: Gate Engine').replace("defendTo(gate, 'lab-3');", "defendTo(gate, 'lab-4');")
field = field.replace('// ---------- Lab 4: The Stacks', '// ---------- Optional essay guide: The Stacks').replace('[\u2013-]', r'[\u2013-]')
field = field.replace("defendTo(stacks, 'lab-4');", '''// The library is an optional essay guide, not Lab 4 progress.
    stacks.querySelector('[data-defend-add]').addEventListener('click', async () => {
      const text = stacks.querySelector('[data-defend]').value.trim();
      const status = stacks.querySelector('[data-defend-status]');
      if (!text) { status.textContent = 'Write your research note first.'; return; }
      try { await navigator.clipboard.writeText(text); status.textContent = 'Copied. Paste it into your essay notes.'; }
      catch (_) { status.textContent = 'Select and copy your note above.'; }
    });''')
write('field-missions.js', field)
history = read('computing-history.js')
history = re.sub(r'  let unlocked=2;try\{.*?\}catch\(_\)\{\}', '  const unlocked = 5; // Optional machines are available without saved course progress.', history, count=1)
write('computing-history.js', history)
victory = read('lab-victory.js')
victory = re.sub(r"    3: \{rank:.*?legend:", "    3: {rank: 'Game Mechanic', title: 'Your campus became a story', skills: ['Composed three text boxes on a map', 'Connected places with arrows or paths', 'Made a tap reveal hidden text', 'Tested the right layout', 'Saved the editable .c3p'], legend:", victory, count=1)
victory = re.sub(r"    4: \{rank:.*?legend:", "    4: {rank: 'Room Builder', title: 'Your rooms remember a choice', skills: ['Continued your Construct project', 'Connected a condition to an action', 'Repaired room navigation', 'Tested a route out and back', 'Saved the .c3p'], legend:", victory, count=1)
write('lab-victory.js', victory)
write('start-lab.js', read('start-lab.js').replace("'Archive Hacker'", "'Room Builder'"))
write('machine-transmission.js', read('machine-transmission.js').replace('Follow a link. Find the evidence behind an idea.', 'Connect your rooms. Test the route out and back.').replace('Inspect, repair, test. Then hear instructions become sound.', 'Inspect a tap response, repair it and test. Then hear instructions become sound.'))
write('equipment-lab2.js', read('equipment-lab2.js').replace('EXPERIMENT VERIFIED ?', 'EXPERIMENT VERIFIED:').replace('VERIFIED ?', 'VERIFIED'))

# Reframe the old worksheet, preserving the completed HTML and JavaScript exercises.
worksheet = read('lab-process-worksheet.txt')
for old, new in [('16 October', '9 October'), ('30 October', '16 October'), ('6 November', '23 October'), ('13 November', '30 October')]:
    worksheet = worksheet.replace(old, new)
sections = re.split(r'(?=LAB [1-5] /)', worksheet)
head = sections[0]
first_two = ''.join(sections[1:3])
first_two = re.sub(r'Screenshot to capture:.*', 'Attendance: sign the paper attendance sheet. Keep your process notes with your own work.', first_two)
worksheet = head + first_two + '''LAB 3 / 16 October / Construct 1: first contact
Activate Pro using the course announcement. Keep the code private.
Open Mapping, move a text and use Preview layout.
Choose a map. Add three text boxes about real or fictional campus places.
Connect them with arrows or paths. Add Touch and a tap that reveals hidden text.
Save your .c3p. Optional: replace the word choices in NPC_Text's NewArray.json.
My places are ____. My tap reveals ____. My test showed ____.

LAB 4 / 23 October / Construct 2: rules and rooms
Continue your Construct 1 project. Test Gate Engine, then build your own rule.
Inspect Alinta's scene templates. Repair arrows outside North.
Test a route out and back. Save your .c3p.
My condition is ____. My action is ____. My route is ____.

LAB 5 / 30 October / Test lab: user testing and publishing
Ask someone to try one task. Watch before helping. Revise and retest.
Construct: keep your .c3p, export Web (HTML5), host and test the playable link.
HTML projects: GitHub Pages is the alternative publishing route.
The tester tried ____. I observed ____. I changed ____.

OPTIONAL ESSAY GUIDE
Use Guides > Library for source research and Chicago author-date.
Attendance: sign the paper sheet. Write your reflection on paper and hand it to Ingrid.
'''
write('lab-process-worksheet.txt', worksheet)
write('library-research-card.txt', read('library-research-card.txt').replace('DIKULT105 / 6 November 2026', 'DIKULT105 / OPTIONAL ESSAY RESEARCH GUIDE'))

# Bust caches for the changed scripts on every referencing page.
script_names = [Path(f).name for f in changed if f.endswith('.js')]
for path in OUT.glob('*.html'):
    text = path.read_text(encoding='utf-8')
    for name in script_names:
        text = re.sub(r'(?<=src=")' + re.escape(name) + r'(?:\?[^"\s]*)?', name + '?v=october-plan-1', text)
    if text != path.read_text(encoding='utf-8'):
        write(path.name, text)

# Compare with the baseline so repeated builds retain a complete manifest.
from improve_javascript import improve
improve(BASE, OUT)
changed = {str(f.relative_to(ROOT)).replace('\\', '/') for f in OUT.rglob('*') if f.is_file() and ((not (BASE / f.relative_to(OUT)).exists()) or f.read_bytes() != (BASE / f.relative_to(OUT)).read_bytes())}
(ROOT / 'changed-files.json').write_text(json.dumps(sorted(changed), indent=2), encoding='utf-8')
print('\n'.join(sorted(changed)))
