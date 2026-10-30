"""Check the DIKULT105 boundary, citation mechanics, stable drafts and source routes."""
from pathlib import Path
from collections import Counter
from hashlib import sha256
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
import subprocess
from final_assessment_guide import build

root=Path(__file__).resolve().parents[1];path=root/'labs/final-assessment.html'
page=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser');text=page.main.get_text(' ',strip=True)
assert 'speculative digital futures' in text
assert '2000' in text and '1800' in text and '2200' in text
assert '1500' not in text and 'DIKULT203' not in text and 'large-scale' not in text
assert 'Software choice is open' in text and 'English or Norwegian' in text
assert 'itch.io is recommended' in text and 'GitHub Pages' in text
assert 'One grade covers the assessment portfolio' in text
assert page.select_one('#assessment-criteria a[href$="/grading-scale"]')
assert 'LAB GUIDANCE / NOT AN ADDITIONAL MARKING RUBRIC' in text
assert 'Three passed obligatory tasks' not in text and '1 in the box means passed' not in text
seal=page.select_one('[data-fq-seal="ai"]').parent.get_text(' ',strip=True)
assert 'Your own writing' in seal and 'unless' not in seal
assert 'only light editing in English' in seal
assert [n['data-fq-part'] for n in page.select('[data-fq-part]')]==['link','theme','genre','process','frame']
assert page.select_one('script[src="final-quest.js?v=5"]')
cite=page.find(id='chicago-author-date')
assert 'Chicago 18' in cite.get_text() and len(cite.select('.fag-citation-card'))==9
assert cite.select_one('#cite-book cite').get_text()=='Gameworld Interfaces'
assert cite.select_one('#cite-article cite').get_text()=='Games and Culture'
assert cite.select_one('#cite-article a[href="https://doi.org/10.1177/1555412012440315"]')
assert len(cite.select('.fag-article-map dt'))==7
examples=cite.select('.fag-example-list .fag-reference')
assert len(examples)==3 and '2012' in examples[0].get_text() and '2013' in examples[1].get_text()
assert examples[2].get_text().startswith('University of Bergen.')
assert '(Jørgensen 2013)' in cite.get_text() and '(Jørgensen, 2013)' not in cite.get_text()
assert 'Replace every [bracketed field]' in cite.get_text()
assert 'n.d.' in cite.select_one('#cite-web').get_text()
assert 'No date:' not in cite.select_one('#cite-book').get_text()
assert 'et al.' in cite.get_text() and 'more than six' in cite.get_text()
assert 'no fixed source count' in cite.get_text()
assert '\u2014' not in page.select_one('.fag-guide').get_text()
assert len(page.select('h1'))==1
ids=Counter(n['id'] for n in page.select('[id]'));assert not [key for key,count in ids.items() if count>1]
for a in page.select('a[href],link[href],script[src],img[src]'):
    url=urlsplit(a.get('href') or a.get('src'))
    if url.scheme or url.netloc:continue
    target=path.parent/unquote(url.path) if url.path else path
    assert target.is_file(),(path.name,url.path)
    if url.fragment and target.suffix=='.html':
        dest=page if target==path else BeautifulSoup(target.read_text(encoding='utf-8'),'html.parser')
        assert dest.find(id=unquote(url.fragment)),url.fragment
original=BeautifulSoup(subprocess.check_output(['git','show','HEAD:labs/final-assessment.html'],cwd=root),'html.parser')
for ident in ['forge','machine','senses','studio']:
    assert str(page.find(id=ident))==str(original.find(id=ident)),ident
    assert page.find(id=ident).find_parent(id='optional-workshops')
styles=page.select('link[rel=stylesheet]');assert styles[-1]['href'].startswith('accessibility.css')
before=sha256(path.read_bytes()).hexdigest();build(root)
assert before==sha256(path.read_bytes()).hexdigest(),'Assessment guide build must be repeatable'
print('PASS: DIKULT105 requirements, 9 Chicago source types, real article metadata, separated AI rules, unchanged draft keys and idea rooms, accessible links and repeatable build.')
