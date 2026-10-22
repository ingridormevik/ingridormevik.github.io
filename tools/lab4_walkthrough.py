"""Lab 4: continue the Lab 3 map in real Construct. Part 1 rules that remember, Part 2 rooms and the way back,
Part 3 ready to hand in (Obligatory Task 5). Safe to rerun: replaces its own blocks."""
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
    return (f'<details class="c3w-help"><summary>Stuck? Open this first</summary><ul>{li}</ul>'
            '<p class="c3w-help-ask">Still stuck after 3 minutes? Ask your neighbour or Ingrid.</p></details>')


# id, tab, minutes, title, new, so_far, now, steps[(text, shot|None)], see, extra, next(title, why)
P1 = [
 ('l4-open', 'Open', 3, 'Open last week\'s map', '',
  'Your Lab 3 map: places, a hidden thought and a tap rule.',
  'Everything today builds on that file. Open it, and check that the rule still works.',
  [('<b>Menu</b> › <b>Project</b> › <b>Open local file</b> and choose your Lab 3 <b>.c3p</b>.', None),
   ('Open the <b>Event sheet 1</b> tab. Your tap rule from last week is there.', shot(L4 + 'd01-lab3-rule.webp', 'Event sheet with the Lab 3 rule: Touch on tap Library, HiddenThought set visible.'))],
  'Your map, and one event row: <b>On tap gesture on Library</b> › <b>Set visibility Visible</b>.',
  stuck(f'<b>No file from last week?</b> Download the Mapping template from <a href="{FILES}" target="_blank" rel="noopener">Mitt UiB › Files</a> and do <a href="lab3-alinta-map.html#c3w-open">Lab 3, Part 2</a> first (about 25 minutes).',
        '<b>Your place has another name than Library?</b> Perfect. Use your own names in every step below.'),
  ('A variable is memory', 'Your map shows a secret, but it forgets everything. Give it a memory.')),
 ('l4-var', 'Memory', 3, 'A variable is memory', 'Global variable',
  'A map with a tap rule that does not remember anything.',
  'A variable is a named box that holds a number. A global one keeps its value in every room.',
  [('Right-click empty space in the event sheet and choose <b>Add global variable</b> ①.', shot(L4 + 'd02-add-global.webp', 'Right-click menu in the event sheet with Add global variable highlighted.')),
   ('Name it <b>visits</b> ①, keep Type <b>Number</b> and Initial value <b>0</b>, then <b>OK</b> ②.', shot(L4 + 'd03-name-visits.webp', 'Add global variable dialog with the name visits.'))],
  'A green line at the top of the sheet: <b>Global number visits = 0</b>.',
  shot(L4 + 'd04-global-row.webp', 'Event sheet with the line Global number visits = 0.') +
  stuck('<b>Add global variable is greyed out?</b> Right-click empty sheet space, not an event row.',
        '<b>Name refused?</b> No spaces. Use letters, for example <b>visits</b> or <b>keysFound</b>.'),
  ('Count each visit', 'The box exists, but nothing puts anything in it yet.')),
 ('l4-add', 'Count', 3, 'Count each visit', 'Add to',
  'A variable <b>visits</b> that stays 0.',
  'Every tap on your place should add 1. The same event can do more than one thing.',
  [('On your tap row, click <b>Add action</b> › <b>System</b> › Next. Type <b>add to</b> in Search ①, choose <b>Add to</b> ②, Next ③.', shot(L4 + 'd05-search-addto.webp', 'System actions filtered by add to.')),
   ('Variable: <b>visits</b> ①. Value: <b>1</b> ②. <b>Done</b> ③.', shot(L4 + 'd06-addto-params.webp', 'Add to parameters: variable visits, value 1.'))],
  'Your tap row now has two actions: <b>Set visibility Visible</b> and <b>Add 1 to visits</b>.', '',
  ('Show the number', 'The map counts, but the visitor cannot see it.')),
 ('l4-show', 'Show', 5, 'Show the number', 'Expressions',
  'A map that counts taps in secret.',
  'A Text object can show a variable. You join words and a number with <b>&amp;</b>.',
  [('Insert a <b>Text</b> object, name it <b>Counter</b> ①. In Properties set Text <b>Visits: 0</b> ② and tick <b>Bold</b> ③. Drag its corner wider.', shot(L4 + 'd07-counter.webp', 'Counter text object on the map with Text Visits: 0 and Bold ticked.')),
   ('On the tap row, <b>Add action</b> › <b>Counter</b> › <b>Set text</b>. Type <code>"Visits: " &amp; visits</code> ①. Construct suggests <b>visits</b> while you type ②.', shot(L4 + 'd08-expression.webp', 'Set text parameter with "Visits: " & visits and the autocomplete list.'))],
  'One event, three actions: show the thought, add 1, write the number.',
  shot(L4 + 'd09-three-actions.webp', 'Event row with three actions.') +
  '<p class="c3w-tip"><b>Words in quotes, names without.</b> <code>"Visits: "</code> is text. <code>visits</code> is the variable. <code>&amp;</code> glues them together.</p>' +
  stuck('<b>Red text in the box?</b> Check that every quote mark has a partner: <code>"Visits: "</code>.',
        '<b>Shows the word visits instead of a number?</b> You put visits inside the quotes. Move it outside.'),
  ('A rule that waits', 'Counting is only useful if something happens at a certain number.')),
 ('l4-if', 'Wait', 5, 'A rule that waits for a number', 'Compare variable',
  'A counter the visitor can see.',
  'A condition can check a variable. Here: when the visitor has been here three times, the place answers.',
  [('<b>Add event</b> › <b>System</b> › Next. Search <b>compare variable</b> ①, choose it ②, Next ③.', shot(L4 + 'd10-search-compare.webp', 'System conditions filtered by compare variable.')),
   ('Comparison <b>≥ Greater or equal</b> ①, Value <b>3</b> ②, <b>Done</b> ③.', shot(L4 + 'd11-compare-params.webp', 'Compare variable: visits greater or equal 3.')),
   ('On that new row, <b>Add action</b> › <b>Counter</b> › <b>Set text</b> › <code>"You know this place now."</code>', shot(L4 + 'd12-two-events.webp', 'Two events: the tap rule and visits ≥ 3.'))],
  'Event 2: <b>visits ≥ 3</b> › <b>Set text to "You know this place now."</b>', '',
  ('Play it', 'Test that the memory and the rule work together.')),
 ('l4-test1', 'Play', 3, 'Play it', '',
  'A counter and a rule that waits for 3.',
  'Be your own visitor. Count out loud.',
  [('▶ menu › <b>Preview layout</b>. Tap your place once.', shot(L4 + 'd13-pv-one.webp', 'Preview: Visits: 1.', 'One tap: Visits: 1.')),
   ('Tap two more times.', shot(L4 + 'd14-pv-three.webp', 'Preview: You know this place now.', 'Third tap: the place answers.'))],
  '1, 2, then the message. The thought appears on the first tap.',
  stuck('<b>Number never changes?</b> The Set text action must be on the same row as Add 1 to visits.',
        '<b>Message never comes?</b> Check the comparison: ≥ and 3, not = 3 on a row that runs before the add.'),
  ('Part 2: a second room', 'Your place remembers. Now give the visitor somewhere to go.')),
]

P2 = [
 ('l4-arrow', 'Arrow', 4, 'An arrow to another room', 'Go to layout',
  'One room that remembers visits.',
  'In Construct a room is a layout. An arrow with a tap rule moves the visitor there.',
  [('Drag <b>ExampleArrow</b> from the Project Bar onto your map ①.', shot(L4 + 'd15-arrow-map1.webp', 'ExampleArrow placed on the map.')),
   ('<b>Add event</b> › Touch › <b>On tap object</b> › ExampleArrow. <b>Add action</b> › System › search <b>layout</b> › <b>Go to layout</b> › <b>Layout MapOption2</b>.', shot(L3 + '31-go-to-layout.webp', 'System actions filtered by layout with Go to layout.'))],
  'A row: <b>On tap gesture on ExampleArrow</b> › <b>Go to Layout MapOption2</b>.', '',
  ('A way back', 'A door with no way back is a trap.')),
 ('l4-clone', 'Clone', 3, 'Make a separate back arrow', 'Clone',
  'An arrow that goes to room 2.',
  'One tap rule belongs to one object type. If room 2 used ExampleArrow too, it would send the visitor to room 2 again. So make a copy with its own name.',
  [('In the Project Bar, right-click <b>ExampleArrow</b> › <b>Clone</b> ①.', shot(L4 + 'd16-clone.webp', 'Object type menu with Clone and Rename.')),
   ('Right-click the copy › <b>Rename</b> ② › <b>BackArrow</b>.', None)],
  '<b>BackArrow</b> in the Project Bar, with the same picture.', '',
  ('Set up room 2', 'The new room needs the same rules.')),
 ('l4-room2', 'Room 2', 4, 'Set up room 2', 'Event sheet per layout',
  'Two arrow types: ExampleArrow and BackArrow.',
  'Every layout chooses which event sheet runs. Let both rooms share Event sheet 1, so one sheet holds the whole story.',
  [('Open <b>Layout MapOption2</b>. Right-click the map › Lock › Lock selection.', None),
   ('Click the map. In Properties set <b>Event sheet</b> to <b>Event sheet 1</b> ①.', shot(L4 + 'd17-eventsheet-map2.webp', 'Layout MapOption2 properties with Event sheet set to Event sheet 1.')),
   ('Drag <b>BackArrow</b> onto the room ①. Set <b>Angle</b> to <b>180</b> ② so it points back.', shot(L4 + 'd18-backarrow.webp', 'BackArrow placed in room 2 with Angle 180.'))],
  'Room 2 with an arrow pointing back, and Event sheet 1 in its Properties.',
  stuck('<b>Event sheet says (none)?</b> Then no rules run in this room. This is the most common Lab 4 mistake.'),
  ('Close the loop', 'Connect the back arrow, and keep the counter correct in every room.')),
 ('l4-back', 'Back', 5, 'Close the loop', 'On start of layout',
  'Room 2 that shares the rules.',
  'Two more events: one for the way back, and one that writes the counter each time a room starts.',
  [('<b>Add event</b> › Touch › On tap object › <b>BackArrow</b>. Action › System › <b>Go to layout</b> › <b>Layout MapOption1</b> ①, Done ②.', shot(L4 + 'd19-goto-back.webp', 'Go to layout parameters with Layout MapOption1.')),
   ('<b>Add event</b> › System › <b>On start of layout</b>. Action › Counter › Set text › <code>"Visits: " &amp; visits</code>.', shot(L4 + 'd20-five-events.webp', 'Five events: tap, compare, two arrows and on start of layout.'))],
  'Five events: ① the two arrows, ② <b>On start of layout</b> writes the counter.',
  '<p class="c3w-tip"><b>Why On start of layout?</b> When a room starts, every object is reset to how it looks in the editor. The counter would say Visits: 0 again, even though <b>visits</b> remembers 2.</p>',
  ('Play the round trip', 'Now see what a room forgets, and what a variable remembers.')),
 ('l4-test2', 'Trip', 4, 'Play the round trip', '',
  'Two rooms, five events.',
  'This test teaches the most important idea today.',
  [('Preview layout from <b>MapOption1</b>. Tap your place twice, then the arrow ①.', shot(L4 + 'd21-pv-room2.webp', 'Preview of room 2 with the back arrow.', 'Room 2.')),
   ('Tap the back arrow.', shot(L4 + 'd22-pv-back.webp', 'Preview back in room 1: Visits: 2 and the thought hidden again.', 'Back in room 1: Visits: 2. The thought is hidden again.')),
   ('Tap your place once more.', shot(L4 + 'd23-pv-know.webp', 'Preview: You know this place now, and the thought shows.', 'Third visit: the place answers.'))],
  '<b>The variable remembered 2. The room forgot the thought.</b> Global variables survive a room change; objects start fresh.',
  stuck('<b>Visits: 0 when you come back?</b> Add the On start of layout event, or check that room 1 uses Event sheet 1.',
        '<b>Preview starts in room 2?</b> Preview layout runs the tab you are looking at. Click the MapOption1 tab first.',
        '<b>Guest limit?</b> You now use 5 of 25 events. Activate Pro for more.'),
  ('Keep it', 'Save before anything else.')),
 ('l4-save', 'Save', 2, 'Keep it', '',
  'A two-room map with memory.',
  'Download a copy. This file is what you build on in Lab 5.',
  [('<b>Menu</b> › <b>Project</b> › <b>Save as</b> › <b>Download a copy</b>.', shot(L3 + '24-save-copy.webp', 'Menu › Project › Save as › Download a copy.'))],
  'A .c3p in Downloads. Rename it so you can find it: <b>yourname-lab4.c3p</b>.', '',
  ('Part 3: ready to hand in', 'Check your project against the task, then post Obligatory Task 5.')),
]


def scene(sc, label):
    sid, tab, mins, title, new, sofar, now, steps, see, extra, (ntitle, nwhy) = sc
    lis = ''.join(f'<li>{t}{s or ""}</li>' for t, s in steps)
    newb = f'<span class="c3w-new">New: {new}</span>' if new else ''
    lab = f'{label} · about {mins} min'
    return (f'<section class="c3w-scene" id="c3w-{sid}" data-c3w-scene="{sid}" data-c3w-label="{escape(lab)}" aria-labelledby="c3w-{sid}-t">'
            f'<p class="c3w-count">{lab}{newb}</p><h4 id="c3w-{sid}-t">{title}</h4>'
            f'<p class="c3w-from"><span>SO FAR</span>{sofar}</p>'
            f'<p class="c3w-story"><span class="c3w-now">NOW</span>{now}</p>'
            f'<div class="c3w-grid is-paired"><div class="c3w-do"><p class="c3w-label">DO THIS</p><ol>{lis}</ol>'
            f'<p class="c3w-label">YOU SHOULD SEE</p><p class="c3w-see">{see}</p>{extra}</div></div>'
            f'<div class="c3w-nextup"><p class="c3w-nextup-label">NEXT UP</p><p class="c3w-nextup-text"><b>{ntitle}.</b> {nwhy}</p></div></section>')


def tabs(items):
    return ''.join(f'<li><a href="#c3w-{s[0]}" data-c3w-tab="{s[0]}"><span>{i}</span>{s[1]}</a></li>' for i, s in enumerate(items, 1))


CHECK = [
 ('file', 'My project opens', 'My .c3p opens in Construct with Menu › Project › Open local file, and I have a copy with my name in the file name.'),
 ('rule', 'A rule that responds', 'At least one event: a condition on the left (for example On tap object) and an action on the right.'),
 ('memory', 'Something it remembers', 'A variable that changes, and that the visitor can notice (a number, a message, a changed place).'),
 ('room', 'Somewhere to go', 'At least two layouts, with a way there and a way back, and every layout uses an event sheet.'),
 ('test', 'Someone else tested it', 'Another person used it without my help. I noted one thing they did that I did not expect.'),
 ('words', 'I can say what it is', 'One or two sentences: what the visitor does, and what genre it is closest to (see the <a href="academic-library.html#genre-explorer">Genre explorer</a> and <a href="academic-library.html#bergen-research">Research made in Bergen</a>).'),
 ('post', 'Posted Obligatory Task 5', 'A screenshot of my project running, posted on Mitt UiB under Discussions › Obligatory Task 5, with one sentence about it.'),
]


def checklist():
    items = ''.join(f'<li><label><input type="checkbox" data-l4-check="{k}"/><span><b>{t}</b>{d}</span></label></li>' for k, t, d in CHECK)
    return (
     '<section class="l4-ready" id="l4-ready" aria-labelledby="l4-ready-t">'
     '<p class="l4-ready-kicker">PART 3 · READY TO HAND IN · ABOUT 10 MIN</p>'
     '<h4 id="l4-ready-t">Check your project before you post it</h4>'
     '<p>Go through the list with your project open. Tick only what you can show on your screen.</p>'
     '<div class="l4-official" data-l4-official=""><p><b>Official requirements</b> · The exact wording of the obligatory task is on Mitt UiB. '
     'This checklist covers everything the labs teach; always read the task text itself as well.</p></div>'
     f'<ol class="l4-checks">{items}</ol>'
     '<div class="l4-meter" aria-hidden="true"><span></span></div><p class="l4-status" role="status"></p>'
     f'<div class="l4-done" hidden=""><p><b>Ready.</b> Post your screenshot and sentence under Obligatory Task 5.</p>'
     f'<a class="primary" href="{DISCUSS}" target="_blank" rel="noopener">Open Discussions on Mitt UiB ↗</a></div>'
     '<p class="c3w-tip">Not everything ticked? That is fine. Post what you have today, and keep the .c3p for Lab 5.</p>'
     '</section>')


def build(root):
    path = root / 'labs/lab-programme.html'
    s = path.read_text(encoding='utf-8')
    s = re.sub(r'<div class="section-band sb-practice" id="lab-4-walk">.*?<!-- /l4w -->', '', s, flags=re.S)

    controls = ('<div class="c3w-controls" hidden=""><button type="button" data-c3w-prev="">← Back</button>'
                '<p class="c3w-progress" aria-live="polite"></p><button type="button" class="primary" data-c3w-next="">Next scene →</button></div>')
    body = ''.join(scene(sc, f'Part 1 · Rules that remember · {i} of {len(P1)}') for i, sc in enumerate(P1, 1))
    body += ''.join(scene(sc, f'Part 2 · Rooms and the way back · {i} of {len(P2)}') for i, sc in enumerate(P2, 1))
    block = (
     '<div class="section-band sb-practice" id="lab-4-walk"><p class="sb-meta"><span class="sb-no">01</span><span class="sb-badge">BUILD</span></p>'
     '<p class="time-chip" data-from="5" data-to="90"></p><h3 class="sb-title">Continue your map: memory and rooms</h3>'
     '<p class="sb-desc">Part 1 gives your place a memory. Part 2 adds a second room and a way back. Part 3 checks everything you need for Obligatory Task 5.</p></div>'
     '<div class="c3w l4w" data-c3w="" data-c3w-part="Lab 4" data-c3w-licence-title="Your map remembers, and it has rooms." '
     'data-c3w-licence-href="#l4-ready" data-c3w-licence-label="Part 3: ready to hand in →" data-c3w-next-page="#l4-ready" data-c3w-next-label="Part 3: ready to hand in →">'
     '<div class="c3w-head"><p class="eyebrow">LAB 4 · YOUR LAB 3 MAP, ONE STEP FURTHER</p>'
     '<p class="c3w-intro">Keep Construct open beside this page and use your own map from last week. Every scene starts where the last one ended. The yellow numbers in the pictures match the steps.</p>'
     '<p class="c3w-own"><b>Your own project counts most.</b> Building something else? Add the same three things to it: a variable, a rule that waits for it, and a second room.</p></div>'
     '<nav class="c3w-tabs" aria-label="Lab 4 scenes">'
     f'<p class="c3w-tabs-label">Part 1 · Rules that remember · about 22 min</p><ol>{tabs(P1)}</ol>'
     f'<p class="c3w-tabs-label">Part 2 · Rooms and the way back · about 22 min</p><ol>{tabs(P2)}</ol></nav>'
     f'<div class="c3w-stage">{body}</div>{controls}</div>' + checklist() + '<!-- /l4w -->')

    anchor = '<div class="section-band sb-practice" id="lab-4-sec-1">'
    assert s.count(anchor) == 1
    s = s.replace(anchor, block + anchor, 1)

    # Gate Engine and the movement-template workshop become optional extras.
    s = s.replace('<h3 class="sb-title">Practice: Gate Engine</h3><p class="sb-desc">Learn the technique hands-on, with instant feedback. Optional, but the fastest way in.</p>',
                  '<h3 class="sb-title">Extra: Gate Engine in the browser</h3><p class="sb-desc">Optional. The same idea as Part 1 (conditions, actions and a counter), as a quick game. Good for repetition.</p>')
    a = s.index('id="lab-4-sec-1"'); b = s.index('</div>', a)
    s = s[:a] + re.sub(r'<p class="time-chip" data-from="15" data-to="85"></p>', '<p class="time-chip is-any">⏱ Whenever you need it</p>', s[a:b + 6], count=1) + s[b + 6:]

    # Step map and start list point to the new walkthrough first.
    s = s.replace('<li><a href="#lab-4-sec-1">01 Gate Engine</a></li><li><a href="#construct-rooms">02 Rules and rooms</a></li>',
                  '<li><a href="#lab-4-walk">01 Memory and rooms</a></li><li><a href="#l4-ready">02 Ready to hand in</a></li><li><a href="#lab-4-sec-1">03 Extra: Gate Engine</a></li>')

    # Timetable that matches the walkthrough (105 minutes, two breaks).
    a = s.index('id="lab-4"'); b = s.index('id="lab-5"'); L = s[a:b]
    ROWS = [
     (5, 'Arrive: open your Lab 3 map', 'Open Construct and your .c3p from last week.', 'No file? Start from Alinta\'s Mapping template and Lab 3, Part 2. Open your own project if you have one.'),
     (10, 'Together: what is a variable?', 'Watch on the big screen and copy: Part 1, scenes 1 and 2.', 'Ingrid opens a Lab 3 map and adds the global variable visits. You do the same.'),
     (30, 'Part 1: rules that remember', 'Scenes 3 to 6: count, show the number, a rule that waits for 3.', 'Each scene says how long it takes. Stuck? Open "Stuck?" under the scene, then ask. Save before the break.'),
     (10, 'Break: step away', 'Save your .c3p first. Then take a real break.', 'Stretch, get water or leave the screen.'),
     (30, 'Part 2: rooms and the way back', 'A second room, a back arrow and the round-trip test.', 'Or add a second room and a variable to your own project. Not finished? Continue in Lab 5.'),
     (5, 'Short break: reset', 'Save your .c3p and take a real break.', 'Stretch, get water or leave the screen.'),
     (10, 'Part 3: ready? Obligatory Task 5', 'Go through the checklist, take a screenshot and post it under Obligatory Task 5.', 'Windows: Windows key + Shift + S. Mac: Cmd + Shift + 4. Save your .c3p one more time.'),
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

    for asset in ['lab4-ready.js?v=1']:
        if asset.split('?')[0] not in s:
            s = s.replace('<script defer="" src="c3-play.js', f'<script defer="" src="{asset}"></script><script defer="" src="c3-play.js', 1)
    s = re.sub(r'c3-walk\.js\?v=\d+', 'c3-walk.js?v=5', s)
    s = re.sub(r'c3-play\.js\?v=\d+', 'c3-play.js?v=5', s)
    s = re.sub(r'c3-walk\.css\?v=\d+', 'c3-walk.css?v=22', s)
    path.write_text(s, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    build(Path(__file__).resolve().parent.parent)
    print('ok')
