"""Remove the retired Lab assistant navigation entry without rewriting lesson content."""
from pathlib import Path
import re
from bs4 import BeautifulSoup


def remove(root):
    changed=[]
    for path in (root/'labs').glob('*.html'):
        raw=path.read_text(encoding='utf-8')
        if 'meet-ingrid' not in raw and 'Lab assistant' not in raw:continue
        header=re.search(r'<header\b[^>]*class="[^"]*\bstudio-header\b[^"]*"[^>]*>.*?</header>',raw,re.S)
        if not header:continue
        parsed=BeautifulSoup(header[0],'html.parser')
        links=[a for a in parsed.select('nav a') if a.get('href','').split('#')[0].split('/')[-1]=='meet-ingrid.html' or a.get_text(' ',strip=True).lower()=='lab assistant']
        if not links:continue
        for link in links:link.decompose()
        raw=raw[:header.start()]+str(parsed.header)+raw[header.end():]
        path.write_text(raw,encoding='utf-8',newline='\n');changed.append(path.name)
    return changed


if __name__=='__main__':
    changed=remove(Path(__file__).resolve().parents[1])
    print(f'Removed Lab assistant navigation from {len(changed)} pages.')
