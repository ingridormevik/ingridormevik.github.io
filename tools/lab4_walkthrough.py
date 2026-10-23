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


# Project types the student can pick in the host card. 'any' is shown until they pick one (and without JS).
TYPES = [('story', 'Story'), ('game', 'Game'), ('place', 'Place or tour'), ('poem', 'Poem or art'), ('sound', 'Sound piece'), ('any', 'Not sure yet')]

# "Your project": the same power, used in the student's own work. One line per project type.
YOURS = {
 'l4-open': {'any': 'Own Construct project? Open that instead. Every scene works on any layout: use your object where it says Library.'},
 'l4-var': {
  'any': 'Name the box after what your work should remember.',
  'story': '<b>trust</b>: how much a character trusts the reader. Or <b>choice</b>: 1 = left, 2 = right.',
  'game': '<b>score</b>, <b>lives</b> or <b>keysFound</b>.',
  'place': '<b>roomsSeen</b> or <b>objectsFound</b> in your tour.',
  'poem': '<b>linesRead</b>: the poem changes the more it is read.',
  'sound': '<b>layers</b>: how many sounds are playing. Or <b>calm</b>, which grows with stillness.'},
 'l4-add': {
  'any': 'Every tap, choice or step can add something.',
  'story': 'A kind answer adds 1 to <b>trust</b>.',
  'game': 'A coin adds 1 to <b>score</b>. A hit adds -1 to <b>lives</b>.',
  'place': 'Each new object tapped adds 1 to <b>objectsFound</b>.',
  'poem': 'Each tap shows a line and adds 1 to <b>linesRead</b>.',
  'sound': 'Each tap adds a sound: 1 more in <b>layers</b>.'},
 'l4-show': {
  'any': 'Should the visitor see the number? Sometimes a hidden memory is stronger.',
  'story': 'Show words, not numbers: a mood, a diary line.',
  'game': 'A classic HUD: <b>Score: 3</b>, <b>Lives: 2</b>.',
  'place': 'Show progress: <b>3 of 7 found</b>.',
  'poem': 'Or show nothing. Let the reader feel the change.',
  'sound': 'Show it as sound, not a number: louder, fuller, stranger.'},
 'l4-if': {
  'any': 'What happens when the number reaches something? That is your rule.',
  'story': '<b>trust ≥ 3</b>: the character tells the secret.',
  'game': '<b>keysFound ≥ 3</b>: the gate opens. <b>lives ≤ 0</b>: game over.',
  'place': '<b>objectsFound ≥ 7</b>: the last room unlocks.',
  'poem': '<b>linesRead ≥ 5</b>: the last line rewrites the first.',
  'sound': '<b>layers ≥ 3</b>: the full chord plays.'},
 'l4-arrow': {
  'any': 'A layout can be a chapter, a level, a page or an ending.',
  'story': 'Room 2 is the next chapter.',
  'game': 'Room 2 is level 2.',
  'place': 'Room 2 is the next hall, floor or street.',
  'poem': 'Room 2 is the next page or stanza.',
  'sound': 'Room 2 is a new soundscape.'},
 'l4-back': {
  'any': 'Is the way back open, locked, or changed? Leaving it out is a choice too.',
  'story': 'Can the reader go back, or is the choice final?',
  'game': 'A way back to a hub, a shop or a map.',
  'place': 'Visitors expect a way back to the main hall.',
  'poem': 'Return to page 1, and find it changed.',
  'sound': 'Come back, and room 1 sounds different.'},
 'l4-test2': {
  'any': 'Ask: what does your world remember when you leave a room?',
  'story': 'Does chapter 2 remember chapter 1?',
  'game': 'Does the score survive the level change?',
  'place': 'Does the tour remember what was already seen?',
  'poem': 'Does the poem remember its reader?',
  'sound': 'Does the sound remember what was played before?'},
 'l4-save': {'any': 'Working in your own project? Save that one too, with today\'s powers in it.'},
}


def yours(sid):
    lines = YOURS.get(sid)
    if not lines:
        return ''
    spans = ''.join(f'<span data-pt="{k}"{"" if k == "any" else " hidden"}>{v}</span>' for k, v in lines.items())
    return f'<p class="l4-yours" data-l4-yours=""><b class="l4-yours-k">YOUR PROJECT</b> {spans}</p>'


# Small looping animations that show what each new power does. Decorative: the steps say the same in words.
def _box(x, y, digits, label='visits'):
    cls = lambda i: f'l4c-d l4c-d{i}' if len(digits) > 1 else 'l4c-d'
    d = ''.join(f'<text class="{cls(i)}" x="{x + 30}" y="{y + 31}">{v}</text>' for i, v in enumerate(digits))
    return (f'<rect class="l4c-box" x="{x}" y="{y}" width="60" height="42" rx="6"/>{d}'
            f'<text class="l4c-tag" x="{x + 30}" y="{y - 6}">{label}</text>')


ROOMS = ('<rect class="l4c-room" x="10" y="12" width="90" height="56" rx="6"/><rect class="l4c-room l4c-room2" x="120" y="12" width="90" height="56" rx="6"/>'
         '<text class="l4c-small" x="55" y="62">room 1</text><text class="l4c-small" x="165" y="62">room 2</text>'
         '<text class="l4c-arrow" x="86" y="38">→</text><text class="l4c-arrow" x="134" y="38">←</text>')


CONCEPT = {
 'l4-var': ('A named box that holds a number',
            _box(80, 24, ['0']).replace('class="l4c-tag"', 'class="l4c-tag l4c-swing"') + '<circle class="l4c-glint" cx="134" cy="30" r="3"/>'),
 'l4-add': ('Each tap drops +1 into the box',
            _box(80, 30, ['0', '1', '2', '3']) + '<text class="l4c-plus" x="110" y="20">+1</text>'),
 'l4-show': ('Text &amp; variable = what you see',
             '<g class="l4c-left"><rect class="l4c-chip" x="6" y="22" width="78" height="30" rx="5"/><text class="l4c-mono" x="45" y="42">"Visits: "</text></g>'
             '<text class="l4c-amp" x="110" y="43">&amp;</text>'
             '<g class="l4c-right"><rect class="l4c-box" x="136" y="22" width="78" height="30" rx="5"/><text class="l4c-mono" x="175" y="42">visits</text></g>'
             '<g class="l4c-result"><rect class="l4c-screen" x="40" y="18" width="140" height="38" rx="6"/><text class="l4c-big" x="110" y="43">Visits: 3</text></g>'),
 'l4-if': ('When visits ≥ 3, the rule fires',
           _box(20, 30, ['0', '1', '2', '3']) + '<text class="l4c-mono l4c-cmp" x="114" y="50">≥ 3</text>'
           '<rect class="l4c-gate-frame" x="146" y="14" width="64" height="58" rx="4"/>'
           '<rect class="l4c-door l4c-door-l" x="148" y="16" width="30" height="54"/><rect class="l4c-door l4c-door-r" x="178" y="16" width="30" height="54"/>'
           '<text class="l4c-msg" x="178" y="47">!</text>'),
 'l4-arrow': ('Tap the arrow: go to another layout', ROOMS + '<circle class="l4c-dot l4c-go" cx="40" cy="38" r="7"/>'),
 'l4-back': ('Back home, the room starts fresh: repaint it',
             ROOMS + '<circle class="l4c-dot l4c-return" cx="180" cy="44" r="7"/>'
             '<text class="l4c-small l4c-reset" x="55" y="28">Visits: 0</text><text class="l4c-small l4c-repaint" x="55" y="28">Visits: 3</text>'),
}


def concept(sid):
    c = CONCEPT.get(sid)
    if not c:
        return ''
    cap, art = c
    return (f'<figure class="l4-concept" aria-hidden="true"><svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">{art}</svg>'
            f'<figcaption>{cap}</figcaption></figure>')


def scene(sc, label):
    sid, tab, mins, title, new, mission, steps, see, extra, ntitle = sc
    lis = ''.join(f'<li>{t}{s or ""}</li>' for t, s in steps)
    newb = f'<span class="c3w-new">+ {new}</span>' if new else ''
    lab = f'{label} · {mins} min'
    return (f'<section class="c3w-scene" id="c3w-{sid}" data-c3w-scene="{sid}" data-c3w-label="{escape(lab)}" aria-labelledby="c3w-{sid}-t">'
            f'<p class="c3w-count">{lab}{newb}</p><h4 id="c3w-{sid}-t">{title}</h4>'
            f'<div class="l4-brief"><p class="l4-mission">{mission}</p>{concept(sid)}</div>'
            f'<div class="c3w-grid is-paired"><div class="c3w-do"><ol>{lis}</ol>'
            f'<p class="c3w-see l4-see"><span>✓ CHECK</span> {see}</p>{yours(sid)}{extra}</div></div>'
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
 '</div><div class="hud-talk"><svg class="hud-host" viewBox="0 0 148 150" aria-hidden="true"><use href="#l4h-head"/></svg>'
 '<p class="hud-msg" role="status">Finish a scene to build your map here.</p></div></div>')


# Dr. Turing's head, drawn like the host in Turing's laboratory (computing-history.html). Reused in the HUD.
TURING_HEAD = (
 '<symbol id="l4h-head" viewBox="196 86 148 150">'
 '<ellipse cx="212" cy="174" fill="#efc39b" rx="11" ry="17" stroke="#000" stroke-width="3"/>'
 '<ellipse cx="328" cy="174" fill="#efc39b" rx="11" ry="17" stroke="#000" stroke-width="3"/>'
 '<ellipse cx="270" cy="166" fill="#f2c9a2" rx="58" ry="70" stroke="#000" stroke-width="4"/>'
 '<path d="M212 168q-10-74 56-78 66-4 64 62-10-34-44-40-30-4-52 10-18 14-24 46Z" fill="#3a2416" stroke="#000" stroke-width="3.5"/>'
 '<path d="M238 104q46-20 80 14M232 116q20-14 46-12" fill="none" stroke="#6b4428" stroke-linecap="round" stroke-width="3"/>'
 '<path d="M228 146q16-9 32-1M281 145q16-8 32 2" fill="none" stroke="#24150b" stroke-linecap="round" stroke-width="6"/>'
 '<rect fill="#eef8ff" height="30" rx="11" stroke="#000" stroke-width="5" width="40" x="224" y="152"/>'
 '<rect fill="#eef8ff" height="30" rx="11" stroke="#000" stroke-width="5" width="40" x="277" y="152"/>'
 '<path d="M264 165h13M224 162l-12-4M317 162l12-4" stroke="#000" stroke-width="4"/>'
 '<path d="M233 160l8-4M286 160l8-4" stroke="#fff" stroke-linecap="round" stroke-width="3"/>'
 '<path d="M271 184q-5 16 4 18" fill="none" stroke="#000" stroke-linecap="round" stroke-width="2.5"/>'
 '<path d="M252 212q18 12 38-2" fill="none" stroke="#000" stroke-linecap="round" stroke-width="3.5"/>'
 '<circle cx="238" cy="198" fill="#ff7a59" fill-opacity=".28" r="8"/><circle cx="304" cy="198" fill="#ff7a59" fill-opacity=".28" r="8"/>'
 '</symbol>')

# The opening scene: a visitor taps a place three times (the global variable counts), walks through the arrow to
# room 2 and back. The number travels with them; the thought in room 1 does not. Turing points at the board.
DIG = lambda cls, x, y: ''.join(f'<text class="l4h-n l4h-n{i} {cls}" x="{x}" y="{y}">{i}</text>' for i in range(4))
HOST_SVG = (
 '<svg class="l4h-scene" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="l4h-title">'
 '<title id="l4h-title">Cartoon: Dr. Turing points at a map on a screen. A small visitor taps a place three times and the number visits '
 'counts 1, 2, 3. The visitor walks through an arrow to room 2 and back. visits is still 3, but the thought bubble in room 1 is gone.</title>'
 '<defs><linearGradient id="l4h-wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#16124a"/><stop offset="1" stop-color="#2b1b6b"/></linearGradient>'
 '<pattern id="l4h-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#4fd1c5" stroke-opacity=".13"/></pattern>'
 f'{TURING_HEAD}</defs>'
 '<rect width="600" height="380" fill="url(#l4h-wall)"/><rect width="600" height="300" fill="url(#l4h-grid)"/>'
 '<g><path d="M330 0v12M520 0v12" stroke="#000" stroke-width="3"/><rect x="314" y="10" width="222" height="32" rx="6" fill="#0b0b1e" stroke="#000" stroke-width="4"/>'
 '<text x="425" y="32" fill="#ff5fd2" font-family="Consolas,monospace" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">TURING’S MAP ROOM</text></g>'
 '<polygon points="0,300 600,300 600,380 0,380" fill="#140a2b"/>'
 '<path d="M300 300L-300 380M300 300L-60 380M300 300L120 380M300 300L300 380M300 300L480 380M300 300L660 380M300 300L900 380M0 316H600M0 338H600M0 366H600" stroke="#ff5fd2" stroke-opacity=".45" stroke-width="1.5"/>'
 # The board
 '<rect x="12" y="58" width="370" height="246" rx="8" fill="#2d3a8c" stroke="#000" stroke-width="4"/>'
 '<rect x="24" y="70" width="346" height="196" rx="5" fill="#06231f" stroke="#000" stroke-width="3"/>'
 '<text class="l4h-mono" x="36" y="90" fill="#4fd1c5">GLOBAL visits =</text>' + DIG('l4h-glob', 156, 90) +
 '<rect x="36" y="100" width="150" height="156" fill="#2b1b6b" stroke="#000" stroke-width="2.5"/>'
 '<rect x="208" y="100" width="150" height="156" fill="#12403a" stroke="#000" stroke-width="2.5"/>'
 '<text class="l4h-mono l4h-small" x="44" y="116" fill="#b9a8ff">MapOption1</text><text class="l4h-mono l4h-small" x="216" y="116" fill="#8cdec5">MapOption2</text>'
 '<path d="M64 196l28-22 28 22Z" fill="#ff7a59" stroke="#000" stroke-width="3"/><rect x="70" y="196" width="44" height="34" fill="#ffd23f" stroke="#000" stroke-width="3"/>'
 '<rect x="86" y="210" width="12" height="20" fill="#2d3a8c" stroke="#000" stroke-width="2"/>'
 '<text class="l4h-mono" x="54" y="248" fill="#c6f15b">Visits:</text>' + DIG('l4h-cnt', 118, 248) +
 '<g class="l4h-thought"><ellipse cx="146" cy="160" rx="30" ry="18" fill="#eef8ff" stroke="#000" stroke-width="2.5"/>'
 '<circle cx="124" cy="182" r="4" fill="#eef8ff" stroke="#000" stroke-width="2"/><text class="l4h-mono l4h-small" x="146" y="164" fill="#16124a" text-anchor="middle">hello</text></g>'
 '<text class="l4h-plus" x="96" y="168">+1</text>'
 '<path class="l4h-arrow" d="M150 130h18v-9l16 15-16 15v-9h-18Z" fill="#ff7a59" stroke="#000" stroke-width="2.5"/>'
 '<path class="l4h-arrow" d="M244 130h-18v-9l-16 15 16 15v-9h18Z" fill="#ff7a59" stroke="#000" stroke-width="2.5"/>'
 '<rect x="282" y="186" width="50" height="44" rx="4" fill="#4fd1c5" stroke="#000" stroke-width="3"/><circle cx="307" cy="208" r="10" fill="#ffd23f" stroke="#000" stroke-width="2.5"/>'
 '<text class="l4h-mono l4h-still" x="282" y="248" fill="#ffd23f" text-anchor="middle">visits is still 3</text>'
 '<g class="l4h-visitor"><circle cx="78" cy="168" r="8" fill="#ff5fd2" stroke="#000" stroke-width="2.5"/>'
 '<path d="M70 192q0-14 8-14t8 14Z" fill="#ff5fd2" stroke="#000" stroke-width="2.5"/></g>'
 '<g stroke="#000" stroke-width="2"><circle class="l4h-blink" cx="40" cy="284" r="6" fill="#c6f15b"/><circle class="l4h-blink l4h-b2" cx="62" cy="284" r="6" fill="#ff5fd2"/>'
 '<circle class="l4h-blink l4h-b3" cx="84" cy="284" r="6" fill="#6fb7ff"/></g>'
 '<rect x="270" y="276" width="96" height="16" rx="3" fill="#0b0b1e" stroke="#000" stroke-width="2"/>'
 '<text class="l4h-mono l4h-small" x="318" y="288" fill="#c6f15b" text-anchor="middle">EVENTS 5/25</text>'
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
 '<ellipse cx="156" cy="204" rx="15" ry="13" fill="#8e44ad" stroke="#000" stroke-width="3"/>'
 '<path d="M146 196l-14-12" stroke="#8e44ad" stroke-width="8" stroke-linecap="round"/><path d="M146 196l-14-12" stroke="#000" stroke-width="2" stroke-linecap="round" fill="none"/></g>'
 '<rect x="255" y="226" width="30" height="40" fill="#efc39b" stroke="#000" stroke-width="3"/>'
 '<use class="l4h-head" href="#l4h-head" x="196" y="86" width="148" height="150"/></g>'
 '</svg>')


def host():
    picks = ''.join(f'<button type="button" data-l4-pt="{k}" aria-pressed="false">{t}</button>' for k, t in TYPES)
    return (
     '<section class="l4-host" id="l4-host" aria-labelledby="l4-host-t">'
     '<div class="l4-host-copy"><p class="l4-host-k">TURING’S MAP ROOM · LAB 4</p>'
     '<h3 id="l4-host-t">Make a world<br/>that remembers.</h3>'
     '<p>Four new powers: <b>memory</b>, <b>a rule that waits</b>, <b>doors</b> and <b>a way back</b>. Learn them on Alinta’s map, then use them in your own project.</p>'
     '<p class="l4-goal"><b>Your final work:</b> an interactive piece about <b>speculative digital futures</b>, on itch.io by week 50. <a href="final-assessment.html">Final quest →</a></p>'
     '<div class="l4-pick" data-l4-pick="" hidden=""><p class="l4-pick-q">What are you building?</p><div class="l4-pick-row">' + picks + '</div>'
     '<label class="l4-pname">My project is called <input type="text" maxlength="40" data-l4-pname="" placeholder="working title"/></label></div>'
     '<button type="button" class="l4-ask" data-l4-ask="" hidden="">Ask Dr. Turing</button>'
     '<p class="l4-host-msg" role="status" data-l4-hostmsg="">Watch the visitor: the number goes with them. The thought stays behind.</p></div>'
     f'<div class="l4-host-art">{HOST_SVG}</div></section>')


# A three-line plan for the student's own project. Saved in this browser; copy it into the Discussions post.
PLAN = [
 ('var', 'It remembers', 'visits, trust, score, linesRead'),
 ('rule', 'When it reaches', 'when trust ≥ 3, the secret is told'),
 ('room', 'Room 2 is', 'the next chapter, level 2, an ending'),
 ('future', 'Its future', 'a world where AI has taken all the fresh water'),
]


def plan():
    rows = ''.join(f'<label><span>{t}</span><input type="text" maxlength="80" data-l4-plan="{k}" placeholder="{escape(p)}"/></label>' for k, t, p in PLAN)
    return (
     '<div class="l4-plan" id="l4-plan"><p class="l4-plan-k">YOUR PROJECT · 4 LINES</p>'
     '<p class="l4-plan-h">Today’s powers in <b data-l4-pshow="">your project</b></p>'
     f'<div class="l4-plan-rows">{rows}</div>'
     '<p class="l4-plan-foot"><button type="button" data-l4-copy="" hidden="">Copy for my post</button>'
     '<span role="status" data-l4-copied=""></span></p></div>')


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
 ('task', 'Your final work starts here', 'An interactive piece about <b>speculative digital futures</b>, on itch.io by week 50. Today\'s powers can build it. <a href="final-assessment.html">Final quest →</a>', ''),
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
     '<div class="l4-meter" aria-hidden="true"><span></span></div><p class="l4-status" role="status"></p>' + plan() +
     f'<div class="l4-done" hidden=""><p><b>Gate open.</b> Post your screenshot and one sentence.</p>'
     f'<a class="primary" href="{DISCUSS}" target="_blank" rel="noopener">Open Discussions on Mitt UiB ↗</a></div>'
     '<p class="l4-official">Read the task text on Mitt UiB too. Not all seals lit? Post what you have and keep the .c3p.</p>'
     '</section>')


# Check in: three lamps before the map room. Construct open, last week's map open, two windows side by side.
BOOT = [
 ('c3', 'Construct is open', 'Log in or play as a guest.', '<a href="https://editor.construct.net" target="_blank" rel="noopener">editor.construct.net ↗</a>'),
 ('map', 'Your Lab 3 map is open', 'Menu › Project › Open local file › your .c3p.', '<a href="construct-project-files.html">No file? Get Alinta’s files →</a>'),
 ('split', 'Side by side', 'Construct on one half, this page on the other. Windows key + ← or →. Mac: hold the green window button.', ''),
]
SPLIT_SVG = (
 '<svg class="l4b-art" viewBox="0 0 240 120" aria-hidden="true">'
 '<rect x="4" y="6" width="232" height="108" rx="8" fill="#0b0d14" stroke="#f5f5ef" stroke-width="3"/>'
 '<g class="l4b-win l4b-left"><rect x="12" y="14" width="104" height="92" rx="4" fill="#2b2f3a" stroke="#000" stroke-width="2"/>'
 '<rect x="12" y="14" width="104" height="12" fill="#ffd23f"/><rect x="20" y="34" width="40" height="8" fill="#5bc0eb"/>'
 '<rect x="20" y="48" width="88" height="8" fill="#555c6b"/><rect x="20" y="62" width="70" height="8" fill="#555c6b"/>'
 '<rect x="20" y="76" width="80" height="8" fill="#555c6b"/><text x="20" y="23" font-size="8" font-family="Consolas,monospace" fill="#000">Construct</text></g>'
 '<g class="l4b-win l4b-right"><rect x="124" y="14" width="104" height="92" rx="4" fill="#163038" stroke="#000" stroke-width="2"/>'
 '<rect x="124" y="14" width="104" height="12" fill="#8cdec5"/><circle cx="148" cy="56" r="14" fill="#efc39b" stroke="#000" stroke-width="2"/>'
 '<rect x="168" y="44" width="50" height="7" fill="#f5f5ef"/><rect x="168" y="58" width="40" height="7" fill="#f5f5ef"/>'
 '<rect x="134" y="80" width="84" height="16" rx="3" fill="#ffd23f"/><text x="132" y="23" font-size="8" font-family="Consolas,monospace" fill="#000">this page</text></g>'
 '</svg>')


def boot():
    more = lambda link: f'<p class="l4b-link">{link}</p>' if link else ''
    items = ''.join(
     f'<li><label><input type="checkbox" data-l4-boot="{k}"/><span class="l4b-lamp" aria-hidden="true"></span>'
     f'<span class="l4b-txt"><b>{t}</b>{d}</span></label>{more(link)}</li>'
     for k, t, d, link in BOOT)
    return (
     '<!-- l4-boot --><section class="l4-boot" aria-labelledby="l4-boot-t">'
     f'<div class="l4b-head"><div><p class="l4b-k">BOOT UP · 5 MIN</p><h3 id="l4-boot-t">Three lights on. Then we play.</h3></div>{SPLIT_SVG}</div>'
     f'<ol class="l4b-list">{items}</ol><p class="l4b-msg" role="status" data-l4-bootmsg="">0 of 3 lights on.</p>'
     '</section><!-- /l4-boot -->')


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
     '<p class="sb-desc">12 scenes. Each one adds a piece to your map and 10 XP.</p></div>' + host() +
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

    # Check in: the boot lamps replace the old pass line (the pass itself was removed from the student flow).
    s = re.sub(r'<!-- l4-boot -->.*?<!-- /l4-boot -->', '', s, flags=re.S)
    s = s.replace('<div class="journey-next"><p>Your pass is saved in this browser, so it is still here when you come back.</p>',
                  '<div class="journey-next"><p>Open your project, then step into today’s experiment.</p>')
    old_next = '<div class="journey-next"><p>Open your project, then step into today’s experiment.</p><a class="primary mission-launch" href="#lab-4-workbench">Enter the project laboratory →</a></div>'
    new_next = '<div class="journey-next"><p>Lights on? Today your world learns to remember.</p><a class="primary mission-launch" href="#lab-4-workbench">Enter Turing’s map room →</a></div>'
    s = s.replace(old_next, new_next)
    assert s.count(new_next) == 1
    s = s.replace(new_next, boot() + new_next, 1)

    # Last stop: no pass and no notes any more, so say exactly what to keep.
    s = s.replace('<p>Need your pass? <a href="#lab-4-arrival">Go back to check-in.</a></p><p>Your experiment checklist and notes are saved in this browser when storage is available.</p>', '')
    s = s.replace('<p class="eyebrow">LAST STOP / LAB 04</p><h3>Keep your work. Make a note.</h3><ol><li><strong>Save your project files.</strong> Keep a copy somewhere you can find again.</li></ol>',
                  '<p class="eyebrow">LAST STOP / LAB 04</p><h3>Save it. Post it. Bring it back.</h3><ol>'
                  '<li><strong>Save:</strong> Menu › Project › Save as › Download a copy. Name it <b>yourname-lab4.c3p</b>.</li>'
                  '<li><strong>Post:</strong> your screenshot under <b>Discussions › Obligatory Task 5</b>.</li>'
                  '<li><strong>Bring it back:</strong> the same .c3p next Friday. Lab 5 tests it on another person.</li></ol>')
    for n in range(1, 9):
        s = s.replace(f'<p>Need your pass? <a href="#lab-{n}-arrival">Go back to check-in.</a></p>', '')

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
    s = re.sub(r'c3-walk\.css\?v=\d+', 'c3-walk.css?v=26', s)
    s = re.sub(r'lab4-hud\.js\?v=\d+', 'lab4-hud.js?v=5', s)
    path.write_text(s, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    build(Path(__file__).resolve().parent.parent)
    print('ok')
