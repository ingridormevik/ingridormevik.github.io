"""Protect the mixed lab's timing, existing exercises and connections to later weeks."""
from collections import Counter
from hashlib import sha256
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import subprocess
from bs4 import BeautifulSoup
from october30_library_visit import update

root=Path(__file__).resolve().parents[1]
path=root/'labs/lab-programme.html'
page=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
lab=page.find(id='lab-5')
assert len(page.select('article.lab'))==8
assert lab['data-unlock-date']=='2026-10-30'
ids=[node['id'] for node in page.select('[id]')]
assert not [key for key,count in Counter(ids).items() if count>1]
elapsed=0;breaks=[]
for row in lab.select('.agenda-row'):
    minutes=int(row['data-minutes'])
    if 'break-row' in row.get('class',[]):breaks.append((elapsed,elapsed+minutes))
    elapsed+=minutes
assert elapsed==105 and breaks==[(45,55),(85,90)]
assert len(lab.select('#project-research-lab .pv-stations > article'))==3
assert lab.select_one('#library-shelf-route summary')
assert lab.select_one('[data-pv-optional="test-lab"] #test-lab')
assert lab.select_one('[data-pv-optional="publish-your-project"] #publish-your-project')
assert len(lab.select('[data-mission="5"] [data-check]'))==3
assert lab.select_one('[data-mission="5"] .mission-note-label')  # Legacy hooks remain intact.
assert lab.select_one('#lab-5-finish a[href="#lab-6"]')
for a in lab.select('.pv-lab a,.resources a,.mission-brief a,#lab-5-finish a.primary'):
    url=urlsplit(a['href'])
    if url.scheme or url.netloc:continue
    target=(path.parent/unquote(url.path)) if url.path else path
    assert target.is_file(),str(target)
    if url.fragment:
        destination=page if target==path else BeautifulSoup(target.read_text(encoding='utf-8'),'html.parser')
        assert destination.find(id=unquote(url.fragment)),a['href']
# Apart from the shared route labels, no other lab content should change.
original=BeautifulSoup(subprocess.check_output(['git','show','HEAD:labs/lab-programme.html'],cwd=root),'html.parser')
for i in [1,2,3,4,6,7,8]:
    a=original.find(id=f'lab-{i}');b=BeautifulSoup(str(page.find(id=f'lab-{i}')),'html.parser').find()
    for section in [a,b]:
        for route in section.select('.br-path'):route.decompose()
        for link in section.select('a[href="#lab-5"]'):link.string='Lab 5 link'
    assert str(a)==str(b),f'Unexpected change in Lab {i}'
outputs=[path,root/'labs/final-assessment.html']
before=[sha256(p.read_bytes()).hexdigest() for p in outputs]
update(root)
assert before==[sha256(p.read_bytes()).hexdigest() for p in outputs],'Repeated update changes output'
# The schedule runtime test consumes actual programme rows, including all eight labs.
fixture={'rows':[[int(row['data-minutes']) for row in item.select('.agenda-row')] for item in page.select('.lab')],
         'chips':[dict(node.attrs) for node in page.select('.time-chip[data-from]')]}
(root/'schedule-test-fixture.json').write_text(json.dumps(fixture),encoding='utf-8')
print('PASS: eight labs preserved, 105 minutes and both breaks, mixed project/library route, existing tools, links and repeatable update.')
