"""Check that every making route has a usable research and learning connection."""
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit
from bs4 import BeautifulSoup
from academic_library import BOOKS
from genre_atlas import ROWS
from genre_explorer import FAMILIES
from project_routes import PRACTICE

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'labs/academic-library.html'
page = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
ids = [node['id'] for node in page.select('[id]')]
assert not [key for key, count in Counter(ids).items() if count > 1], 'Duplicate IDs'
assert sorted(index for _, _, group in FAMILIES for index in group) == list(range(len(ROWS)))
assert len(PRACTICE) == len(ROWS) == len(page.select('.ge-card')) == len(page.select('[data-genre-row]'))
for index, route in enumerate(ROWS):
    card = page.find(id=f'genre-route-{index}')
    assert card.select_one('summary strong').get_text() == route[1]
    assert len(card.select('.ge-prototype p')) == 2
    assert all(text in card.get_text() for text in PRACTICE[index])
    assert card.select_one('a[href="#course-workbench"]')
    assert card.select_one('a[href^="https://scholar.google.com/scholar?q="]')
assert len(page.select('.al-book')) == len(BOOKS)
assert len(page.select('.cw-stations > li')) == 6
assert page.select_one('#course-workbench a[href="https://www4.uib.no/en/studies/courses/dikult105"]')
assert page.select_one('#rf-result a[href="#find-articles"]')
search = page.select_one('form.ar-search')
assert search['action'] == 'https://scholar.google.com/scholar' and search['method'] == 'get'
assert search.select_one('input[name=q][required]')
assert search.select_one('button[formaction="https://www.google.com/search"]')
assert page.select_one('#find-articles a[href="https://nva.sikt.no/"]')
assert page.select_one('#chicago-author-date .ar-reference cite').get_text() == 'Games and Culture'
assert page.select_one('#chicago-author-date a[href="https://doi.org/10.1177/1555412012440315"]')
errors = []
for element in page.select('a[href], link[href], script[src], img[src]'):
    url = urlsplit(element.get('href') or element.get('src'))
    if url.scheme or url.netloc:
        continue
    destination = path.parent / unquote(url.path) if url.path else path
    if not destination.is_file():
        errors.append(str(destination))
    elif url.fragment and destination.suffix == '.html':
        target = page if destination == path else BeautifulSoup(destination.read_text(encoding='utf-8'), 'html.parser')
        if not target.find(id=unquote(url.fragment)):
            errors.append(f'{destination.name}#{url.fragment}')
assert not errors, errors
assert len(page.select('body > a.access-skip')) == 1 and not page.select('body > a.skip')
assert page.select('link[rel=stylesheet]')[-1]['href'].startswith('accessibility.css')
print(f'PASS: {len(ROWS)} making/research routes, {len(FAMILIES)} shelves, {len(BOOKS)} books, course links, article searches, citation example and all local links.')
