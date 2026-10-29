"""Check routes, accounts, source images, catalogue queries and build stability."""
from pathlib import Path
from collections import Counter
from urllib.parse import urlsplit,parse_qs,unquote
from hashlib import sha256
from bs4 import BeautifulSoup
from PIL import Image
from research_guide import build
from lab_links import apply,oria

root=Path(__file__).resolve().parents[1]
guide=root/'labs/research-guide.html';s=BeautifulSoup(guide.read_text(encoding='utf-8'),'html.parser')
assert len(s.select('h1'))==1 and len(s.select('.rp-station'))==5
assert len(s.select('.rp-shot img'))==7
for img in s.select('.rp-shot img'):
    p=guide.parent/img['src'];im=Image.open(p);im.verify()
    assert Image.open(p).format==('JPEG' if p.suffix=='.jpg' else 'PNG'),p
    assert Image.open(p).size==(int(img['width']),int(img['height']))
    assert img.get('alt') and img.find_parent('figure').find('figcaption').find('a',href=True)
assert 'do not log in through MittUiB or Feide' in s.find(id='internet-archive').get_text(' ',strip=True)
assert 'borrower number and PIN' in s.find(id='tibi').get_text(' ',strip=True)
assert 'who can borrow' in s.find(id='tibi').get_text(' ',strip=True)
assert 'no login needed' in s.find(id='nva').get_text(' ',strip=True)
assert s.select_one('.access-console') and 'DIKULT106 / DIGITAL ETHICS' in s.get_text(' ',strip=True)
assert not s.select('.studio-header a[href*="meet-ingrid"]')
assert '\u2014' not in s.main.get_text()
url=urlsplit(oria('identity & belonging'))
assert parse_qs(url.query)['vid']==['47BIBSYS_UBB:UBB']
assert parse_qs(url.query)['query']==['any,contains,identity & belonging']
pages={p:BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser') for p in (root/'labs').glob('*.html')}
broken=[]
aliases={'cards','tape','bug','sound','pointer','web'}
for p,page in pages.items():
    counts=Counter(n['id'] for n in page.select('[id]'))
    assert not [i for i,count in counts.items() if count>1],p.name
    for a in page.select('a[href]'):
        u=urlsplit(a['href'])
        assert u.hostname not in ['oria.no','www.oria.no'],(p,a['href'])
        if u.scheme or u.netloc or not (u.path or u.fragment):continue
        dest=(root/u.path.lstrip('/')) if u.path.startswith('/') else ((p.parent/unquote(u.path)) if u.path else p)
        if not dest.is_file():broken.append((p.name,a['href'],'file'));continue
        if u.fragment and dest.suffix=='.html':
            target=pages.get(dest) or BeautifulSoup(dest.read_text(encoding='utf-8'),'html.parser')
            if not target.find(id=unquote(u.fragment)) and not (dest.name=='computing-history.html' and u.fragment in aliases):broken.append((p.name,a['href'],'fragment'))
assert not broken,broken
before=sha256(guide.read_bytes()).hexdigest();build(root);apply(root,[guide])
assert before==sha256(guide.read_bytes()).hexdigest(),'Guide build must be stable'
print('PASS: 5 beginner routes, 7 genuine guide screenshots, account distinctions, accessibility, all lab-page internal links, UiB catalogue queries and repeatable guide build.')
