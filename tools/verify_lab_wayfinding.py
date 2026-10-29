"""Protect the familiar map, its progress and the dated seasonal room."""
from pathlib import Path
from hashlib import sha256
from datetime import date
from bs4 import BeautifulSoup
from lab_wayfinding import apply
import xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
assert date(2026,10,30).strftime('%A')=='Friday'
pages=[]
for p in (root/'labs').glob('*.html'):
    s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
    if not s.select_one('.studio-header'):continue
    pages.append(p)
    nav=s.select_one('.studio-header nav')
    assert len(nav.select('.wf-map-tab[href="lab-programme.html#all-labs"]'))==1,p
    assert len(nav.select('.wf-friday-tab[href="lab-programme.html#programme"] img[src="halloween-lab-badge.svg"]'))==1,p
    assert len(nav.select('a'))==6 and len(nav.select('[aria-current]'))<=1,p
    assert not nav.select('a[href*="meet-ingrid"]'),p
    for a in s.select('a[href]'):
        if 'lab map' in a.get_text(' ',strip=True).lower():
            assert a['href'] not in ['#programme','lab-programme.html#programme'],(p,a)
    assert s.select_one('link[href^="lab-wayfinding.css"]'),p
    assert s.select_one('script[src^="lab-wayfinding.js"]'),p
    styles=s.select('link[rel=stylesheet]')
    assert next(i for i,n in enumerate(styles) if n['href'].startswith('lab-wayfinding'))<next(i for i,n in enumerate(styles) if n['href'].startswith('accessibility.css')),p
s=BeautifulSoup((root/'labs/lab-programme.html').read_text(encoding='utf-8'),'html.parser')
assert s.main.find(recursive=False).get('id')=='all-labs'
assert s.select_one('#all-labs').name=='section'
assert s.select_one('#all-labs h1').get_text()=='Enter the lab'
assert len(s.select('#all-labs .sl-levels > a.lv'))==8
assert [a['href'] for a in s.select('.sl-levels > a.lv')]==[f'#lab-{i}' for i in range(1,9)]
assert len(s.select('.lv-date .hl-date-logo'))==1
assert s.find(id='programme').find_parent(id='lab-5')
assert s.find(id='friday-routes').find_parent(id='lab-5')
assert s.find(id='lab-5')['data-unlock-date']=='2026-10-30'
assert len(s.select('[data-check]'))>10 and len(s.select('[data-final]'))>10
assert len(s.select('h1'))==1
assert len(s.select('body > a.access-skip'))==1 and not s.select('body > a.skip')
assert not s.select('.hl-map-doors'),'Avoid competing room menus above the actual route chooser'
library=BeautifulSoup((root/'labs/academic-library.html').read_text(encoding='utf-8'),'html.parser')
assert library.select_one('.hl-start-session[href="#library-session"]')
assert not library.select('.hl-map-doors')
assert library.select_one('.ls-room-map a[href="#ls-find"]').get_text(' ',strip=True).endswith('Find a source')
ET.parse(root/'labs/halloween-lab-badge.svg')
before={p:sha256(p.read_bytes()).hexdigest() for p in pages};apply(root)
assert all(sha256(p.read_bytes()).hexdigest()==before[p] for p in pages),'Navigation build must be stable'
print(f'PASS: original map visible, 8 unchanged lab destinations, 30 October pumpkin, scoped Halloween session, single library entry and consistent navigation on {len(pages)} pages.')
