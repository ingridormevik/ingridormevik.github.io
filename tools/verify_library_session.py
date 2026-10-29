"""Check the guided route, actual source metadata and the preserved reference library."""
from pathlib import Path
from collections import Counter
from hashlib import sha256
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
from library_session import build

root=Path(__file__).resolve().parents[1]
path=root/'labs/academic-library.html'
page=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
session=page.find(id='library-session')
assert session and len(session.select('[data-ls-panel]'))==4
assert not session.select('[data-ls-panel][hidden]'),'Keep all rooms readable without JS'
assert page.find(id='library-entrance').find_next_sibling().get('id')=='library-session'
collection=page.find(id='library-shelves')
assert collection and len(collection.select('.lq-station'))==9 and not collection.has_attr('open')
assert len(collection.select('.ge-card'))==44 and len(collection.select('.al-book'))==14
assert len(collection.select('.ls-return'))==9
assert len(session.select('[data-ls-lens]'))==9
for button in session.select('[data-ls-lens]'):
    book=page.find(id=button['data-ls-href'][1:])
    assert book and book.h2.get_text(' ',strip=True)==button['data-ls-title']
    assert book.select_one('.al-author').get_text(' ',strip=True)==button['data-ls-author']
assert session.select_one('[data-ls-book-tab="index"]')['aria-pressed']=='true'
assert 'read it before citing' in session.select_one('[data-ls-book-page="references"]').get_text()
assert 'page numbers' in session.select_one('[data-ls-book-page="index"]').get_text()
assert session.select_one('form[action="https://scholar.google.com/scholar"] input[name=q]')
ids=[node['id'] for node in page.select('[id]')]
assert not [key for key,n in Counter(ids).items() if n>1]
for a in session.select('a[href]'):
    url=urlsplit(a['href'])
    if url.scheme or url.netloc:continue
    target=path.parent/unquote(url.path) if url.path else path
    assert target.is_file(),a['href']
    if url.fragment:
        destination=page if target==path else BeautifulSoup(target.read_text(encoding='utf-8'),'html.parser')
        assert destination.find(id=url.fragment),a['href']
before=sha256(path.read_bytes()).hexdigest();build(root)
assert before==sha256(path.read_bytes()).hexdigest(),'Session build changes output on repeat'
print('PASS: make-first route, index/bibliography help, 9 genuine book leads, physical/online research, all 44 forms and 14 books preserved.')
