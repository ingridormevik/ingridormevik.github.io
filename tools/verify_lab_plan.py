"""Verify the October lab plan, local links and encoding before publication."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import subprocess
import zipfile
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
LABS = ROOT / 'labs'
parsed = {}
for path in LABS.glob('*.html'):
    text = path.read_text(encoding='utf-8', errors='strict')
    assert '\ufffd' not in text, f'Replacement character in {path.name}'
    parsed[path] = BeautifulSoup(text, 'html.parser')

page = parsed[LABS / 'lab-programme.html']
ids = [node['id'] for node in page.select('[id]')]
assert len(ids) == len(set(ids)), 'Duplicate programme IDs'
labs = page.select('.lab')
assert len(labs) == 5
for n, lab in enumerate(labs, 1):
    assert lab['data-unlock-date'] == f'2026-10-{[2,9,16,23,30][n-1]:02d}'
    assert sum(int(row['data-minutes']) for row in lab.select('.agenda-row')) == 105
    assert not lab.select('[data-extension="true"]')
    breaks = [row for row in lab.select('.agenda-row') if 'break' in row.select_one('h4').get_text().lower()]
    assert [int(row['data-minutes']) for row in breaks] == [10,5]
    assert lab.select('.agenda-row')[-1].select_one('.clock').get_text() == '09:55-10:00'
    assert len(lab.select('.mission-console [data-check]')) == 3
    assert 'hidden' not in lab.select_one('.quest-content').attrs
assert page.select_one('#lab-4 #gate-engine')
assert not page.select_one('#lab-3 #gate-engine')
assert not page.select_one('#lab-4 #the-stacks')
assert page.select_one('#lab-5 .test-lab')
assert page.select_one('#lab-5 #publish-your-project')
assert len(page.select('#duration option')) == 1
assert page.select_one('#duration option')['value'] == '105'
assert page.select_one('.lv-4 strong').get_text() == 'Construct 2'
assert page.select_one('#lab-3 #construct-pro a[href*="mitt.uib.no"]')
assert parsed[LABS / 'library-lab.html'].select_one('#the-stacks')
assert not parsed[LABS / 'library-lab.html'].select_one('.own-mind')
assert parsed[LABS / 'construct-templates.html'].select_one('#tpl-npc')
assert len(parsed[LABS / 'construct-templates.html'].select('[id^="tpl-"]')) == 6
guide = parsed[LABS / 'javascript-construct.html']
assert [x['id'] for x in guide.select('[data-reader-step]')] == ['step-1','step-2','step-3','step-4']
assert guide.select_one('#construct-extra #step-5')
assert guide.select_one('#step-3 #web-code')
assert page.select_one('#lab-2 #signal-practice #signal-room')
assert page.select_one('#lab-2 #javascript-first-contact a[href*="javascript-construct.html"]')
with zipfile.ZipFile(LABS / 'javascript-beginner-starter.zip') as starter:
    starting_code = starter.read('my-first-interaction/story.js').decode('utf-8')
    assert starting_code.strip().startswith('//') and 'addEventListener' not in starting_code
    assert starter.read('solution/story.js') == (LABS / 'javascript-first-example/story.js').read_bytes()
    assert starter.read('solution/index.html') == (LABS / 'javascript-first-example/index.html').read_bytes()
    html = BeautifulSoup(starter.read('my-first-interaction/index.html').decode('utf-8'), 'html.parser')
    assert html.select_one('script[src="story.js"][defer]')

missing = []
for path, tree in parsed.items():
    text = path.read_text(encoding='utf-8')
    assert not re.search(r'\?I chose|\?the element|\?no\?|paragraph\?s|Microsoft\?s|OPEN EXPERIMENT \?', text), path.name
    assert not re.search(r'6 November|13 November|6 NOVEMBER|13 NOVEMBER|one 15-minute break|120.minutes', tree.get_text(' ', strip=True)), path.name
    for node in tree.select('[href],[src]'):
        raw = node.get('href', node.get('src', ''))
        url = urlsplit(raw)
        if url.scheme or url.netloc or raw.startswith('javascript:'):
            continue
        target = path.parent / unquote(url.path) if url.path else path
        if url.path and not target.exists():
            missing.append(f'{path.name}: {raw}')
        if url.fragment and path.name in ['lab-programme.html','construct-templates.html','library-lab.html'] and target in parsed:
            if target.name == 'computing-history.html' and url.fragment in ['cards','tape','bug','sound','pointer','web']:
                assert f"link:'{url.fragment}'" in (LABS / 'computing-history.js').read_text(encoding='utf-8')
                continue
            if not parsed[target].find(id=unquote(url.fragment)):
                missing.append(f'{path.name}: {raw}')
assert not missing, '\n'.join(missing)
for path in LABS.rglob('*.js'):
    subprocess.run(['node', '--check', str(path)], check=True, capture_output=True)

fixture = {'rows': [[int(row['data-minutes']) for row in lab.select('.agenda-row')] for lab in labs], 'chips': [{'from': node['data-from'], 'to': node['data-to']} for node in page.select('.time-chip[data-from]')]}
(ROOT / 'schedule-test-fixture.json').write_text(json.dumps(fixture), encoding='utf-8')
print(f'PASS: five lab dates, 105-minute schedules, two breaks, six templates, moved Gate Engine, preserved Test Lab, optional library, four beginner steps, local links, UTF-8 and {len(list(LABS.rglob("*.js")))} JavaScript syntax checks.')
