"""A presentation-only update must preserve the actual lesson and its controls."""
from pathlib import Path
from collections import Counter
from hashlib import sha256
import subprocess
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from today_lab_presentation import build, scene


root = Path(__file__).resolve().parents[1]


def lesson(page):
    # Decorative SVG is not student copy. Ignore its whitespace, not lesson text.
    for svg in page.select('svg'):
        svg.decompose()
    return ' '.join(page.body.get_text(' ', strip=True).split())


for name in ['lab-programme.html', 'academic-library.html']:
    path = root / 'labs' / name
    previous = BeautifulSoup(subprocess.check_output(['git', 'show', f'HEAD:labs/{name}'], cwd=root), 'html.parser')
    current = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    # Existing text, links, forms, saved-state hooks, and accessible names stay intact.
    assert [(a.get('href'), a.get_text(' ', strip=True)) for a in previous.select('a[href]')] == [(a.get('href'), a.get_text(' ', strip=True)) for a in current.select('a[href]')], name + ': links changed'
    for selector in ['input', 'textarea', 'button', 'form', '[data-mission]', '[data-final]']:
        assert [n.attrs for n in previous.select(selector)] == [n.attrs for n in current.select(selector)], name + ': controls changed'
    assert lesson(previous) == lesson(BeautifulSoup(str(current), 'html.parser')), name + ': lesson copy changed'
    ids = [n['id'] for n in current.select('[id]')]
    assert not [key for key, count in Counter(ids).items() if count > 1]
    assert len(current.select('link[href^="today-lab.css"]')) == 1
    assert current.head.select('link[rel=stylesheet]')[-1]['href'].startswith('accessibility.css')
    assert all(n.get('aria-hidden') == 'true' for n in current.select('.tl-art'))
    assert all(n.get('focusable') == 'false' for n in current.select('.tl-mini-scene'))
    if name == 'lab-programme.html':
        assert len(current.select('[data-hl-route] .tl-mini-scene')) == 3
        assert len(current.select('[data-hl-plan] .tl-mini-scene')) == 3
        assert not current.select('[data-hl-plan][hidden]')
        assert len(current.select('#lab-5 .pv-stations .tl-mini-scene')) == 3
    else:
        assert len(current.select('.ls-room-map .tl-mini-scene')) == 4
        assert len(current.select('[data-ls-panel] .tl-mini-scene')) == 4
        assert not current.select('[data-ls-panel][hidden]')

for kind in ['build', 'browse', 'mix', 'notice', 'meaning']:
    ET.fromstring(scene(kind))

paths = [root / 'labs' / name for name in ['lab-programme.html', 'academic-library.html']]
before = [sha256(path.read_bytes()).hexdigest() for path in paths]
build(root)
assert before == [sha256(path.read_bytes()).hexdigest() for path in paths], 'Presentation build is not repeatable'
print('PASS: unchanged lesson text, links, forms, saved-state hooks; 17 decorative room illustrations; accessible controls and repeatable output.')
