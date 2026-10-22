"""Lab 4: continue the Lab 3 map in real Construct, as a game. Part 1 rules that remember, Part 2 rooms and the
way back, then the hand-in gate (Obligatory Task 5). A live map (lab4-hud.js) grows with every finished scene and
can be played. Gate Engine, room repair and the project console become side quests. Safe to rerun."""
from pathlib import Path
from html import escape
import re

L3, L4 = 'construct-lab3/', 'construct-lab4/'
FILES = 'https://mitt.uib.no/courses/59620/files'
DISCUSS = 'https://mitt.uib.no/courses/59620/discussion_topics'


def shot(src, alt, cap=''):
    c = f'<figcaption>{cap}</figcaption>' if cap else ''
    return (f'<figure class="c3w-shot c3w-step-shot"><a href="{src}" target="_blank" rel="noopener">'
            f'<img src="{src}" alt="{escape(alt)}" loading="lazy"/></a>{c}</figure>')


def stuck(*items):
    li = ''.join(f'<li>{i}</li>' for i in items)
    return (f'<details class="c3w-help"><summary>Stuck?</summary><ul>{li}</ul>'
            '<p class="c3w-help-ask">Still stuck after 3 minutes? Ask your neighbour or Ingrid.</p></details>')


def why(title, text):
    return f'<details class="c3w-help c3w-why"><summary>{title}</summary><p>{text}</p></details>'


# id, tab, minutes, title, new skill, mission (one line), steps[(text, shot|None)], check, extra, next title
P1 = [
 ('l4-open', 'Open', 3, 'Load your save', '',
  'Last week\'s map. Everything today builds on it.',
  [('<b>Menu</b> › <b>Project</b> › <b>Open local file</b> › your Lab 3 <b>.c3p</b>.', None),
   ('Open the <b>Event sheet 1</b> tab.', shot(L4 + 'd01-lab3-rule.webp', 'Event sheet with the Lab 3 rule: Touch on tap Library, HiddenThought set visible.'))],
  '<b>On tap gesture on Library</b> › <b>Set visibility Visible</b>.',
  stuck(f'<b>No file from last week?</b> Get the Mapping template in <a href="{FILES}" target="_blank" rel="noopener">Mitt UiB › Files</a> and play <a href="lab3-alinta-map.html#c3w-open">Lab 3, Part 2</a> first (25 min).',
        '<b>Your place is not called Library?</b> Perfect. Use your own names.'),
  'Give it a memory'),
 ('l4-var', 'Memory', 3, 'Give it a memory', 'Global variable',
  'A variable is a named box with a number in it. Global: every room can read it.',
  [('Right-click empty sheet space › <b>Add global variable</b> ①.', shot(L4 + 'd02-add-global.webp', 'Right-click menu in the event sheet with Add global variable highlighted.')),
   ('Name <b>visits</b> ①, Number, 0, <b>OK</b> ②.', shot(L4 + 'd03-name-visits.webp', 'Add global variable dialog with the name visits.'))],
  '<b>Global number visits = 0</b> at the top.',
  shot(L4 + 'd04-global-row.webp', 'Event sheet with the line Global number visits = 0.') +
  stuck('<b>Greyed out?</b> Right-click empty sheet space, not an event row.',
        '<b>Name refused?</b> No spaces: <b>visits</b>, <b>keysFound</b>.'),
  'Count each visit'),
 ('l4-add', 'Count', 3, 'Count each visit', 'Add to',
  'Every tap adds 1. One event can do several things.',
  [('Tap row › <b>Add action</b> › System › search <b>add to</b> ① › <b>Add to</b> ② › Next ③.', shot(L4 + 'd05-search-addto.webp', 'System actions filtered by add to.')),
   ('<b>visits</b> ① · <b>1</b> ② · <b>Done</b> ③.', shot(L4 + 'd06-addto-params.webp', 'Add to parameters: variable visits, value 1.'))],
  'Two actions: <b>Set visible</b> + <b>Add 1 to visits</b>.', '',
  'Show the number'),
 ('l4-show', 'Show', 5, 'Show the number', 'Expressions',
  'Your map counts in secret. Put the number on screen.',
  [('Insert <b>Text</b>, name it <b>Counter</b> ①. Text <b>Visits: 0</b> ②, <b>Bold</b> ③. Drag it wider.', shot(L4 + 'd07-counter.webp', 'Counter text object on the map with Text Visits: 0 and Bold ticked.')),
   ('Tap row › <b>Add action</b> › Counter › <b>Set text</b> › <code>"Visits: " &amp; visits</code> ①②.', shot(L4 + 'd08-expression.webp', 'Set text parameter with "Visits: " & visits and the autocomplete list.'))],
  'One event, three actions.',
  shot(L4 + 'd09-three-actions.webp', 'Event row with three actions.') +
  why('What does &amp; do?', '<code>"Visits: "</code> in quotes is text. <code>visits</code> without quotes is the variable. <code>&amp;</code> glues them.') +
  stuck('<b>Red text?</b> Every quote mark needs a partner.',
        '<b>It shows the word visits?</b> Move visits outside the quotes.'),
  'A rule that waits'),
 ('l4-if', 'Wait', 5, 'A rule that waits', 'Compare variable',
  'On the third visit, the place answers.',
  [('<b>Add event</b> › System › search <b>compare variable</b> ①②, Next ③.', shot(L4 + 'd10-search-compare.webp', 'System conditions filtered by compare variable.')),
   ('<b>≥</b> ① · <b>3</b> ② · <b>Done</b> ③.', shot(L4 + 'd11-compare-params.webp', 'Compare variable: visits greater or equal 3.')),
   ('Add action › Counter › Set text › <code>"You know this place now."</code>', shot(L4 + 'd12-two-events.webp', 'Two events: the tap rule and visits ≥ 3.'))],
  'Event 2: <b>visits ≥ 3</b> › <b>Set text</b>.', '',
  'Play it'),
 ('l4-test1', 'Play', 3, 'Play it', '',
  'Be your own visitor. Count out loud.',
  [('▶ › <b>Preview layout</b>. Tap your place.', shot(L4 + 'd13-pv-one.webp', 'Preview: Visits: 1.', 'Tap 1.')),
   ('Tap twice more.', shot(L4 + 'd14-pv-three.webp', 'Preview: You know this place now.', 'Tap 3.'))],
  '1, 2, then the message.',
  stuck('<b>Number stuck?</b> Set text must be on the same row as Add 1.',
        '<b>No message?</b> Use ≥ 3, not = 3.',
        '<b>Not sure what visits is?</b> ▶ menu › <b>Debug layout</b> shows it live under Global variables.'),
  'Part 2: a second room'),
]

P2 = [
 ('l4-arrow', 'Door', 4, 'A door to room 2', 'Go to layout',
  'A room is a layout. An arrow with a tap rule is a door.',
  [('Drag <b>ExampleArrow</b> onto your map ①.', shot(L4 + 'd15-arrow-map1.webp', 'ExampleArrow placed on the map.')),
   ('<b>Add event</b> › Touch › <b>On tap object</b> › ExampleArrow. Action › System › <b>Go to layout</b> › <b>MapOption2</b>.', shot(L3 + '31-go-to-layout.webp', 'System actions filtered by layout with Go to layout.'))],
  '<b>On tap ExampleArrow</b> › <b>Go to MapOption2</b>.', '',
  'A way back'),
 ('l4-clone', 'Clone', 3, 'A way back needs its own arrow', 'Clone',
  'One tap rule per object type. A renamed copy can do the opposite.',
  [('Project Bar: right-click <b>ExampleArrow</b> › <b>Clone</b> ①.', shot(L4 + 'd16-clone.webp', 'Object type menu with Clone and Rename.')),
   ('Right-click the copy › <b>Rename</b> ② › <b>BackArrow</b>.', None)],
  '<b>BackArrow</b> in the Project Bar.', '',
  'Set up room 2'),
 ('l4-room2', 'Room 2', 4, 'Set up room 2', 'Event sheet per layout',
  'A room without an event sheet has no rules. Share Event sheet 1.',
  [('Open <b>MapOption2</b>. Right-click the map › Lock › Lock selection.', None),
   ('Click the map › Properties › <b>Event sheet</b>: <b>Event sheet 1</b> ①.', shot(L4 + 'd17-eventsheet-map2.webp', 'Layout MapOption2 properties with Event sheet set to Event sheet 1.')),
   ('Drag in <b>BackArrow</b> ①, <b>Angle 180</b> ②.', shot(L4 + 'd18-backarrow.webp', 'BackArrow placed in room 2 with Angle 180.'))],
  'An arrow pointing back. Event sheet 1 in Properties.',
  stuck('<b>Event sheet (none)?</b> No rules run there. The most common Lab 4 mistake.'),
  'Close the loop'),
 ('l4-back', 'Back', 5, 'Close the loop', 'On start of layout',
  'Wire the way back, and repaint the counter when a room starts.',
  [('<b>Add event</b> › Touch › On tap object › <b>BackArrow</b> › <b>Go to layout</b> › <b>MapOption1</b> ①②.', shot(L4 + 'd19-goto-back.webp', 'Go to layout parameters with Layout MapOption1.')),
   ('<b>Add event</b> › System › <b>On start of layout</b> › Counter › Set text › <code>"Visits: " &amp; visits</code>.', shot(L4 + 'd20-five-events.webp', 'Five events: tap, compare, two arrows and on start of layout.'))],
  'Five events.',
  why('Why On start of layout?', 'A room resets every object when it starts. The text would say Visits: 0, even though <b>visits</b> still holds 2.'),
  'The round trip'),
 ('l4-test2', 'Trip', 4, 'The round trip', '',
  'The big idea of today. Watch what is remembered.',
  [('Preview <b>MapOption1</b>. Tap your place twice, then the arrow ①.', shot(L4 + 'd21-pv-room2.webp', 'Preview of room 2 with the back arrow.', 'Room 2.')),
   ('Tap the back arrow.', shot(L4 + 'd22-pv-back.webp', 'Preview back in room 1: Visits: 2 and the thought hidden again.', 'Visits: 2. Thought hidden again.')),
   ('Tap your place once more.', shot(L4 + 'd23-pv-know.webp', 'Preview: You know this place now, and the thought shows.', 'Visit 3: it answers.'))],
  '<b>The variable remembered. The room forgot.</b>',
  stuck('<b>Visits: 0 when you return?</b> Add On start of layout, or check room 1 uses Event sheet 1.',
        '<b>Preview starts in room 2?</b> Click the MapOption1 tab first.',
        '<b>Guest limit?</b> 5 of 25 events used. Pro gives more.'),
  'Save your game'),
 ('l4-save', 'Save', 2, 'Save your game', '',
  'This file is your Lab 5 starting point.',
  [('<b>Menu</b> › Project › Save as › <b>Download a copy</b>.', shot(L3 + '24-save-copy.webp', 'Menu › Project › Save as › Download a copy.'))],
  'Rename it <b>yourname-lab4.c3p</b>.', '',
  'The hand-in gate'),
]


def scene(sc, label):
    sid, tab, mins, title, new, mission, steps, see, extra, ntitle = sc
    lis = ''.join(f'<li>{t}{s or ""}</li>' for t, s in steps)
    newb = f'<span class="c3w-new">+ {new}</span>' if new else ''
    lab = f'{label} · {mins} min'
    return (f'<section class="c3w-scene" id="c3w-{sid}" data-c3w-scene="{sid}" data-c3w-label="{escape(lab)}" aria-labelledby="c3w-{sid}-t">'
            f'<p class="c3w-count">{lab}{newb}</p><h4 id="c3w-{sid}-t">{title}</h4>'
            f'<p class="l4-mission">{mission}</p>'
            f'<div class="c3w-grid is-paired"><div class="c3w-do"><ol>{lis}</ol>'
            f'<p class="c3w-see l4-see"><span>✓ CHECK</span> {see}</p>{extra}</div></div>'
            f'<div class="c3w-nextup"><p class="c3w-nextup-label">NEXT</p><p class="c3w-nextup-text"><b>{ntitle}</b></p></div></section>')


def tabs(items):
    return ''.join(f'<li><a href="#c3w-{s[0]}" data-c3w-tab="{s[0]}"><span>{i}</span>{s[1]}</a></li>' for i, s in enumerate(items, 1))


# The live map: each part lights up when its scene is done (data-need), and the student can play it.
HUD = (
 '<div class="l4-hud" data-l4-hud="">'
 '<div class="hud-top"><p class="hud-rank"><span>RANK</span> <b data-hud-rank="">Visitor</b></p>'
 '<p class="hud-xp"><b data-hud-xp="">0</b> / 120 XP</p></div>'
 '<div class="hud-xpbar" aria-hidden="true"><span></span></div>'
 '<div class="hud-world" aria-label="Your map so far">'
 '<button type="button" class="hud-room is-here" data-hud-room="1"><span class="hud-label">ROOM 1</span>'
 '<span class="hud-place">your place</span>'
 '<span class="hud-item" data-need="l4-var">visits = <b data-hud-v="">0</b></span>'
 '<span class="hud-item hud-counter" data-need="l4-show" data-hud-text="">Visits: 0</span>'
 '<span class="hud-item hud-thought" data-hud-thought="" hidden="">a hidden thought</span></button>'
 '<div class="hud-doors"><button type="button" class="hud-door" data-need="l4-arrow" data-hud-go="2" aria-label="Go to room 2">→</button>'
 '<button type="button" class="hud-door" data-need="l4-back" data-hud-go="1" aria-label="Back to room 1">←</button></div>'
 '<div class="hud-room" data-hud-room="2" data-need="l4-room2"><span class="hud-label">ROOM 2</span><span class="hud-place">locked</span></div>'
 '</div><p class="hud-msg" role="status">Finish a scene to build your map here.</p></div>')


# Power-up cards: one tip each. Construct cards are checked in the real editor (r506.3).
POWER = [
 ('c3', 'See your variable live', '▶ menu › <b>Debug layout</b>. Tap your place: <b>Global variables › visits</b> counts up.',
  shot(L4 + 't02-debug-menu.webp', 'The Preview menu with Debug layout highlighted.') + shot(L4 + 't01-debug-visits.webp', 'The debugger Inspector with Global variables: visits.')),
 ('c3', 'Double-click = Add event', 'Double-click empty space in the event sheet. The Add condition dialog opens.',
  shot(L4 + 't03-dbl-add.webp', 'Add condition dialog opened by a double-click in the event sheet.')),
 ('c3', 'Type, don\'t scroll', 'Every dialog has a Search box. Type two or three letters: <b>add</b>, <b>comp</b>, <b>lay</b>.', ''),
 ('c3', 'Copy a whole event', 'Click an event row, <b>Ctrl + C</b>, <b>Ctrl + V</b>. Then change one thing. Mac: Cmd.', ''),
 ('c3', 'Watch the event counter', 'Guests get 25 events. Construct shows how many are left. Lab 4 uses 5.', ''),
 ('c3', 'Text cut off?', 'The Text box is too small. Drag a corner handle wider.', ''),
 ('c3', 'Save every 20 minutes', 'Menu › Project › Save as › <b>Download a copy</b>. Name it <b>yourname-lab4.c3p</b>.', ''),
 ('c3', 'Construct wants you to rest', 'After two hours it tells you to take a break. Listen to it.', ''),
 ('task', 'Your variable, your story', 'What should your place remember? <b>keysFound</b>, <b>roomsSeen</b>, <b>trust</b>, or <b>choice</b> (1 = left, 2 = right).', ''),
 ('task', 'Room 2 can be anything', 'Not only another map: a memory, a closer look, a locked door, an ending.', ''),
 ('task', 'Small and working', 'One room, one variable, one rule that works beats a big world that does not.', ''),
 ('task', 'Your own project counts', 'Not using the map? Add the same three things: a variable, a rule that waits for it, a second layout.', ''),
 ('task', 'A screenshot that shows it', 'Take it in Preview, at the moment something changes. Add one of the event sheet if you like.', ''),
 ('task', 'The tester rule', 'Say nothing. Watch their hands. Write down one thing you did not expect.', ''),
 ('task', 'One sentence', '<i>The visitor ___. It remembers ___. It is closest to ___ (genre).</i> See the <a href="academic-library.html#genre-explorer">Genre explorer</a>.', ''),
]


def power():
    n = {d: sum(1 for p in POWER if p[0] == d) for d in ('c3', 'task')}
    seen = {'c3': 0, 'task': 0}
    cards = ''
    for d, t, txt, fig in POWER:
        seen[d] += 1
        lab = 'CONSTRUCT' if d == 'c3' else 'YOUR TASK'
        cards += (f'<li class="pw-card" data-deck="{d}"><p class="pw-no">{lab} · {seen[d]}/{n[d]}</p>'
                  f'<p class="pw-title">{t}</p><p class="pw-txt">{txt}</p>{fig}</li>')
    return (
     '<section class="l4-power" id="l4-power" aria-labelledby="l4-power-t" data-l4-power="">'
     '<p class="pw-kicker">POWER-UPS</p><h4 id="l4-power-t">Pro tips. Collect them all.</h4>'
     f'<div class="pw-decks" hidden=""><button type="button" data-pw-deck="c3" aria-pressed="true">Construct · {n["c3"]}</button>'
     f'<button type="button" data-pw-deck="task" aria-pressed="false">Your task · {n["task"]}</button></div>'
     f'<ol class="pw-cards">{cards}</ol>'
     '<div class="pw-nav" hidden=""><button type="button" data-pw-prev="" aria-label="Previous card">←</button>'
     '<p class="pw-count" aria-live="polite"></p><button type="button" class="primary" data-pw-next="">Next card →</button></div>'
     '</section>')


CHECK = [
 ('file', 'Opens', 'My .c3p opens. Saved as yourname-lab4.c3p.'),
 ('rule', 'Responds', 'A condition › an action.'),
 ('memory', 'Remembers', 'A variable the visitor can notice.'),
 ('room', 'Two rooms', 'A way there and a way back.'),
 ('test', 'Tested', 'Someone else played it without help.'),
 ('words', 'Named', 'One sentence: what you do, which <a href="academic-library.html#genre-explorer">genre</a>.'),
 ('post', 'Posted', 'Screenshot in Discussions › Obligatory Task 5.'),
]


def checklist():
    items = ''.join(f'<li><label><input type="checkbox" data-l4-check="{k}"/><span class="l4-seal" aria-hidden="true">{i:02d}</span>'
                    f'<span class="l4-txt"><b>{t}</b>{d}</span></label></li>' for i, (k, t, d) in enumerate(CHECK, 1))
    return (
     '<section class="l4-ready" id="l4-ready" aria-labelledby="l4-ready-t">'
     '<p class="l4-ready-kicker">FINAL GATE · OBLIGATORY TASK 5 · 10 MIN</p>'
     '<h4 id="l4-ready-t">Light all seven seals</h4>'
     f'<ol class="l4-checks">{items}</ol>'
     '<div class="l4-meter" aria-hidden="true"><span></span></div><p class="l4-status" role="status"></p>'
     f'<div class="l4-done" hidden=""><p><b>Gate open.</b> Post your screenshot and one sentence.</p>'
     f'<a class="primary" href="{DISCUSS}" target="_blank" rel="noopener">Open Discussions on Mitt UiB ↗</a></div>'
     '<p class="l4-official">Read the task text on Mitt UiB too. Not all seals lit? Post what you have and keep the .c3p.</p>'
     '</section>')


def side_quests(span):
    """Gate Engine, room repair and the project console, each behind one game tile."""
    def cut(start_marker, end_marker):
        a = span.index(start_marker); b = span.index(end_marker, a)
        return span[a:b]
    gate = cut('<section aria-labelledby="gate-title"', '<section class="course-panel')
    rooms = cut('<section class="course-panel', '<div class="section-band sb-required" id="lab-4-sec-2">')
    console = span[span.index('<section aria-labelledby="mission-title-4"'):]
    tile = lambda i, t, d, m, body: (f'<details class="sq" id="{i}"><summary><span class="sq-time">{m}</span>'
                                    f'<b>{t}</b><span class="sq-desc">{d}</span><span class="sq-go">Play</span></summary>'
                                    f'<div class="sq-body">{body}</div></details>')
    return (
     '<!-- l4-side --><section class="side-quests" id="lab-4-sec-1" aria-labelledby="sq-title">'
     '<p class="sq-kicker">SIDE QUESTS · OPTIONAL</p><h3 id="sq-title">Done early? Pick one.</h3><div class="sq-grid">'
     + tile('sq-gate', 'Gate Engine', 'Wire an event sheet in the browser. Open the gate.', '5-10 min', gate)
     + tile('sq-rooms', 'Room Repair', 'Fix a broken exit in Alinta\'s movement template.', '15 min', rooms)
     + tile('sq-own', 'Your own project', 'Milestones and a note for your own idea.', 'any time', console)
     + '</div></section><!-- /l4-side -->')


def build(root):
    path = root / 'labs/lab-programme.html'
    s = path.read_text(encoding='utf-8')
    s = re.sub(r'<div class="section-band sb-practice" id="lab-4-walk">.*?<!-- /l4w -->', '', s, flags=re.S)

    # Side quests: wrap once, from the old Gate Engine band up to the guides band.
    if '<!-- l4-side -->' not in s:
        a = s.index('<div class="section-band sb-practice" id="lab-4-sec-1">')
        b = s.index('<div class="section-band sb-reference" id="lab-4-sec-3">')
        s = s[:a] + side_quests(s[a:b]) + s[b:]

    controls = ('<div class="c3w-controls" hidden=""><button type="button" data-c3w-prev="">← Back</button>'
                '<p class="c3w-progress" aria-live="polite"></p><button type="button" class="primary" data-c3w-next="">Next scene →</button></div>')
    body = ''.join(scene(sc, f'Part 1 · {i}/{len(P1)}') for i, sc in enumerate(P1, 1))
    body += ''.join(scene(sc, f'Part 2 · {i}/{len(P2)}') for i, sc in enumerate(P2, 1))
    block = (
     '<div class="section-band sb-practice" id="lab-4-walk"><p class="sb-meta"><span class="sb-no">01</span><span class="sb-badge">BUILD</span></p>'
     '<p class="time-chip" data-from="5" data-to="90"></p><h3 class="sb-title">Your map, level 2</h3>'
     '<p class="sb-desc">12 scenes. Each one adds a piece to your map and 10 XP.</p></div>'
     '<div class="c3w l4w" data-c3w="" data-c3w-part="Lab 4" data-c3w-licence-title="Your map remembers, and it has rooms." '
     'data-c3w-licence-href="#l4-ready" data-c3w-licence-label="To the final gate →" data-c3w-next-page="#l4-ready" data-c3w-next-label="To the final gate →">'
     f'<div class="c3w-head"><p class="eyebrow">LAB 4 · CONSTRUCT BESIDE THIS PAGE · YOUR OWN MAP</p>{HUD}</div>'
     '<nav class="c3w-tabs" aria-label="Lab 4 scenes">'
     f'<p class="c3w-tabs-label">Part 1 · Memory · 22 min</p><ol>{tabs(P1)}</ol>'
     f'<p class="c3w-tabs-label">Part 2 · Rooms · 22 min</p><ol>{tabs(P2)}</ol></nav>'
     f'<div class="c3w-stage">{body}</div>{controls}</div>' + power() + checklist() + '<!-- /l4w -->')

    anchor = '<!-- l4-side -->'
    assert s.count(anchor) == 1
    s = s.replace(anchor, block + anchor, 1)

    # Step map and the bridge from Lab 3.
    s = re.sub(r'(<nav aria-label="Experiment sections" class="step-map"><p class="sm-label">ON THIS STEP</p><ol>)'
               r'<li><a href="#lab-4-walk">.*?</ol>(?=</nav><aside class="route-card route-from">)',
               r'\1<li><a href="#lab-4-walk">01 Build: 12 scenes</a></li><li><a href="#l4-power">02 Power-ups</a></li><li><a href="#l4-ready">03 Final gate</a></li>'
               r'<li><a href="#lab-4-sec-1">04 Side quests</a></li><li><a href="#lab-4-sec-3">05 Guides</a></li></ol>', s, flags=re.S)
    s = s.replace('<h4>Finish your map first, if you need to.</h4><p>Map finished and posted under Obligatory Task 4? Start the Gate Engine below. It uses the same condition and action you built last week.</p>',
                  '<h4>Bring your Lab 3 map.</h4><p>No map yet? Play Lab 3 first, then come back.</p>')

    # Timetable that matches the walkthrough (105 minutes, two breaks).
    a = s.index('id="lab-4"'); b = s.index('id="lab-5"'); L = s[a:b]
    ROWS = [
     (5, 'Arrive: open your Lab 3 map', 'Open Construct and your .c3p from last week.', 'No file? Start from Alinta\'s Mapping template and Lab 3, Part 2. Open your own project if you have one.'),
     (10, 'Together: what is a variable?', 'Watch on the big screen and copy: Part 1, scenes 1 and 2.', 'Ingrid opens a Lab 3 map and adds the global variable visits. You do the same.'),
     (30, 'Part 1: rules that remember', 'Scenes 3 to 6: count, show the number, a rule that waits for 3.', 'Each scene says how long it takes. Stuck? Open "Stuck?" under the scene, then ask. Save before the break.'),
     (10, 'Break: step away', 'Save your .c3p first. Then take a real break.', 'Stretch, get water or leave the screen.'),
     (30, 'Part 2: rooms and the way back', 'A second room, a back arrow and the round-trip test.', 'Or add a second room and a variable to your own project. Not finished? Continue in Lab 5.'),
     (5, 'Short break: reset', 'Save your .c3p and take a real break.', 'Stretch, get water or leave the screen.'),
     (10, 'Final gate: Obligatory Task 5', 'Light the seven seals, take a screenshot and post it under Obligatory Task 5.', 'Windows: Windows key + Shift + S. Mac: Cmd + Shift + 4. Save your .c3p one more time.'),
     (5, 'One next step', 'Write one thing you learned and one thing to try in Lab 5.', 'Keep your .c3p file. Bring it next Friday.'),
    ]
    assert sum(r[0] for r in ROWS) == 105
    items, t = [], 0
    for m, title, prompt, detail in ROWS:
        brk = ' break-row' if title.startswith(('Break', 'Short break')) else ''
        items.append(f'<li class="agenda-row{brk}" data-extension="false" data-minutes="{m}"><div class="time"><span class="clock"></span><span class="elapsed">{t}-{t+m} min</span></div>'
                     f'<div class="activity"><h4>{title}</h4><p class="row-prompt">{prompt}</p><details class="row-detail" open=""><summary>Details &amp; help</summary><p><strong>Do:</strong> {prompt} {detail}</p></details></div></li>')
        t += m
    oa = L.index('<ol class="agenda">'); ob = L.index('</ol>', oa) + 5
    L = L[:oa] + '<ol class="agenda">' + ''.join(items) + '</ol>' + L[ob:]
    s = s[:a] + L + s[b:]

    # Static morning clocks (08:15 start) for rows that only had elapsed minutes; the page script still adjusts them.
    def clocks(m):
        lab = m.group(0); t = 8 * 60 + 15
        def row(r):
            nonlocal t
            mins = int(r.group(1)); a, t = t, t + mins
            return f'{r.group(0)[:-len("</span>")]}{a // 60:02d}:{a % 60:02d}-{t // 60:02d}:{t % 60:02d}</span>'
        return re.sub(r'data-minutes="(\d+)"><div class="time"><span class="clock"></span>', row, lab)
    s = re.sub(r'<article class="lab"[^>]*id="lab-[34]".*?</article>', clocks, s, flags=re.S)

    for asset in ['lab4-ready.js?v=1', 'lab4-hud.js?v=2']:
        if asset.split('?')[0] not in s:
            s = s.replace('<script defer="" src="c3-play.js', f'<script defer="" src="{asset}"></script><script defer="" src="c3-play.js', 1)
    s = re.sub(r'lab4-ready\.js\?v=\d+', 'lab4-ready.js?v=2', s)
    s = re.sub(r'c3-walk\.js\?v=\d+', 'c3-walk.js?v=5', s)
    s = re.sub(r'c3-play\.js\?v=\d+', 'c3-play.js?v=6', s)
    s = re.sub(r'c3-walk\.css\?v=\d+', 'c3-walk.css?v=24', s)
    path.write_text(s, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    build(Path(__file__).resolve().parent.parent)
    print('ok')
