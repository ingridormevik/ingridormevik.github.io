"""Verify course-file routing and the project-opening guide."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
from template_files import update, FILES

root=Path(__file__).resolve().parents[1]
names=['lab-programme.html','lab3-alinta-map.html','construct-guide.html','construct-templates.html','tools.html','construct-project-files.html']
before={n:(root/'labs'/n).read_bytes() for n in names}
update(root)
assert all((root/'labs'/n).read_bytes()==before[n] for n in names), 'Repeated generation changed output'
count=0
for name in names:
    s=BeautifulSoup((root/'labs'/name).read_text(encoding='utf-8'),'html.parser')
    ids=[x['id'] for x in s.select('[id]')]
    assert len(ids)==len(set(ids)),name
    for a in s.select('[data-template-files]'):
        assert a['href']==FILES
        count+=1
    for a in s.select('a[href]'):
        u=urlsplit(a['href'])
        if u.scheme or not u.path: continue
        path=root/'labs'/unquote(u.path)
        assert path.exists(),(name,a['href'])
        # History-machine fragments are created at runtime by computing-history.js.
        if u.fragment and path.suffix=='.html' and path.name!='computing-history.html':
            target=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
            assert target.find(id=unquote(u.fragment)),(name,a['href'])
s=BeautifulSoup((root/'labs/construct-templates.html').read_text(encoding='utf-8'),'html.parser')
assert len(s.select('[data-template-download]'))==6
guide=BeautifulSoup((root/'labs/construct-project-files.html').read_text(encoding='utf-8'),'html.parser')
assert guide.select_one('#cannot-see')
assert 'Open local file' in guide.get_text()
assert '.c3proj' in guide.get_text()
print(f'PASS: stable generation, {count} MittUiB entry points, six file instructions and local opening-guide links.')
