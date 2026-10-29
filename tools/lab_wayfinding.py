"""Keep the original course map one tab away, including during the Halloween session."""
from pathlib import Path
from bs4 import BeautifulSoup
import re

def navigation(page, name=None):
    header=page.select_one('.studio-header')
    if not header:return
    nav=header.find('nav')
    if not nav:return
    old=nav.select_one('[aria-current="page"]')
    current=name or (old.get('href','').split('#')[0] if old else '')
    nav.clear()
    nav['aria-label']='Main navigation'
    items=[('lab-programme.html#all-labs','Original lab map','wf-map-tab'),
           ('lab-programme.html#programme','30 Oct / Halloween','wf-friday-tab'),
           ('academic-library.html#library-session','Library lab','wf-library-tab'),
           ('final-assessment.html#brief','Final Assignment','hl-final-tab'),
           ('tools.html','Guides',''),('join.html','Join / QR','')]
    for href,label,cls in items:
        link=page.new_tag('a',href=href)
        if cls:link['class']=[cls]
        if cls=='wf-friday-tab':
            link.append(page.new_tag('img',src='halloween-lab-badge.svg',width='26',height='26',alt='',**{'aria-hidden':'true'}))
        link.append(label)
        destination=href.split('#')[0]
        if destination==current and cls!='wf-friday-tab':link['aria-current']='page'
        if current=='research-guide.html' and cls=='wf-library-tab':link['aria-current']='location'
        nav.append(link)
    brand=header.select_one('.studio-brand')
    if brand:brand['href']='lab-programme.html#all-labs'

def apply(root, paths=None):
    for path in paths or sorted((root/'labs').glob('*.html')):
        raw=path.read_text(encoding='utf-8')
        if 'studio-header' not in raw:continue
        page=BeautifulSoup(raw,'html.parser');navigation(page,path.name)
        header=page.select_one('.studio-header')
        if not header:continue
        raw=re.sub(r'<header\b[^>]*class="[^\"]*\bstudio-header\b[^\"]*"[^>]*>.*?</header>',lambda _:str(header),raw,count=1,flags=re.S)
        def return_to_map(match):
            label=BeautifulSoup(match[4],'html.parser').get_text(' ',strip=True).lower()
            destination=match[2]
            if 'lab map' in label:
                destination='#all-labs' if destination.startswith('#') else 'lab-programme.html#all-labs'
            return match[1]+destination+match[3]+match[4]+match[5]
        raw=re.sub(r'(<a\b[^>]*href=")(#programme|lab-programme\.html#programme)("[^>]*>)(.*?)(</a>)',return_to_map,raw,flags=re.S)
        raw=re.sub(r'<link\b[^>]*href="lab-wayfinding\.css[^\"]*"[^>]*>\s*','',raw)
        style='<link href="lab-wayfinding.css?v=1" rel="stylesheet"/>'
        # Accessibility styles remain last.
        access=re.search(r'<link\b[^>]*href="accessibility\.css[^\"]*"[^>]*>',raw)
        if access:raw=raw[:access.start()]+style+raw[access.start():]
        else:raw=raw.replace('</head>',style+'</head>',1)
        raw=re.sub(r'<script\b[^>]*src="lab-wayfinding\.js[^\"]*"[^>]*>\s*</script>\s*','',raw)
        script='<script defer="" src="lab-wayfinding.js?v=1"></script>'
        last=re.search(r'<script\b[^>]*src="lab-links\.js[^\"]*"[^>]*>\s*</script>\s*',raw)
        links=last[0].rstrip() if last else ''
        if last:raw=raw[:last.start()]+raw[last.end():]
        raw=raw.replace('</head>',script+links+'</head>',1)
        path.write_text(raw,encoding='utf-8',newline='\n')

if __name__=='__main__':apply(Path(__file__).resolve().parents[1])
