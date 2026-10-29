"""Validate the Halloween entrance without rebuilding unrelated lessons."""
from collections import Counter
from hashlib import sha256
from pathlib import Path
from urllib.parse import urlsplit,unquote
import subprocess
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from halloween_library import apply

root=Path(__file__).resolve().parents[1]
files=['lab-programme.html','academic-library.html','final-assessment.html','tools.html']
for name in files:
    path=root/'labs'/name;page=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    ids=[node['id'] for node in page.select('[id]')]
    assert not [key for key,count in Counter(ids).items() if count>1],name
    assert len(page.select('h1'))==1,name
    assert page.select_one('.studio-header .hl-final-tab[href="final-assessment.html#brief"]'),name
    if name in ['lab-programme.html','academic-library.html']:
        assert len(page.select('[data-hl-calm]'))==1
        assert page.select_one('svg.hh-drawing .hh-ghost .hh-eyes')
        assert len(page.select('svg.hh-drawing .hh-gear'))==2
        assert page.select_one('svg.hh-drawing .hh-book') and page.select_one('[data-hh-wake]')
    styles=page.select('link[rel=stylesheet]')
    assert next(i for i,n in enumerate(styles) if n['href'].startswith('halloween-library'))<next(i for i,n in enumerate(styles) if n['href'].startswith('accessibility.css'))
    for node in page.select('.hl-entrance a,.hl-route-picker a,.hl-final-invitation a,link[href^="halloween"],script[src^="halloween"],img[src^="turing-halloween"]'):
        url=urlsplit(node.get('href') or node.get('src'))
        if url.scheme or url.netloc:continue
        target=path.parent/unquote(url.path) if url.path else path
        assert target.is_file(),str(target)
        if url.fragment:
            destination=page if target==path else BeautifulSoup(target.read_text(encoding='utf-8'),'html.parser')
            assert destination.find(id=unquote(url.fragment)),node
    if name=='lab-programme.html':
        assert page.main.find(recursive=False).get('id')=='all-labs'
        assert page.find(id='all-labs').name=='section','The original map must be visible, not in a drawer'
        assert page.find(id='programme').find_parent(id='lab-5'),'Halloween belongs to the dated fifth lab'
        assert page.select_one('.lv-5 .hl-date-logo[src="halloween-lab-badge.svg"]')
        assert len(page.select('#all-labs .sl-map a.lv'))==8
        assert len(page.select('[data-hl-plan]'))==3
        assert not page.select('[data-hl-plan][hidden]'),'All routes must remain visible without JS'
        assert not page.select('#lab-5 .resources img[src*=github]')
        assert len(page.select('article.lab'))==8
    if name=='academic-library.html':
        assert len(page.select('.ge-card'))==44 and len(page.select('.lq-station'))==9
        assert page.find(id='writing-desk') and page.find(id='chicago-author-date')
    if name in ['final-assessment.html','tools.html']:
        original=BeautifulSoup(subprocess.check_output(['git','show',f'HEAD:labs/{name}'],cwd=root),'html.parser')
        assert original.main.get_text(' ',strip=True)==page.main.get_text(' ',strip=True),f'Unrelated content changed: {name}'
ET.parse(root/'labs/turing-halloween-library.svg')
paths=[root/'labs'/name for name in files]+[root/'labs/turing-halloween-library.svg']
before=[sha256(p.read_bytes()).hexdigest() for p in paths]
apply(root)
assert before==[sha256(p.read_bytes()).hexdigest() for p in paths],'Build must be repeatable'
print('PASS: Halloween entrances, 3 open routes, archive progress, 9 library stations, final-assignment tabs, local links, SVG and unchanged assessment content.')
