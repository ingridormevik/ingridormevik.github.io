"""Check regressions found during final publication review."""
from pathlib import Path
from bs4 import BeautifulSoup
import hashlib
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
labs = root / 'labs'
def hashes():
    return {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in labs.rglob('*') if p.is_file()}
before = hashes()
subprocess.run([sys.executable, str(root / 'tools/simplify_lab2.py')], check=True)
after = hashes()
assert before == after, 'Regeneration changed the output: repeated builds must be stable'
s = BeautifulSoup((labs / 'lab-programme.html').read_text(encoding='utf-8'), 'html.parser')
for lab in s.select('.lab'):
    actions = lab.select_one('.mission-console .mission-actions')
    assert 'hidden' not in actions.attrs
    for checkbox in actions.select('[data-check]'):
        assert not any('hidden' in ancestor.attrs for ancestor in checkbox.parents if hasattr(ancestor, 'attrs'))
    assert 'hidden' in actions.select_one('textarea').attrs
assert s.select_one('#mapping-first-contact').get_text().count('A layout is a scene') == 1
assert not s.select('script[src^="paper-progress"]')
guide = BeautifulSoup((labs / 'javascript-construct.html').read_text(encoding='utf-8'), 'html.parser')
assert len(guide.select('#first-click-help')) == 1
assert len(guide.select('#first-click-help summary')) == 1
for path in labs.glob('*.html'):
    page = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    ids = [x['id'] for x in page.select('[id]')]
    assert len(ids) == len(set(ids)), f'Duplicate IDs in {path.name}'
t = BeautifulSoup((labs / 'tools.html').read_text(encoding='utf-8'), 'html.parser')
card = t.select_one('.lab-machine[href="library-lab.html"]')
assert card.select_one('img[src="setup-assets/construct-logo.svg"]')
assert card.select_one('strong') and card.select_one('.lm-no')
print('PASS: stable regeneration, visible practical checklists, hidden note fields, no duplicate map instructions and intact Construct logo card.')
