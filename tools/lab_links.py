"""Keep institutional search links and deferred fragment navigation consistent."""
from pathlib import Path
from urllib.parse import urlsplit, parse_qs, urlencode
from html import escape, unescape
import re

ORIA = 'https://bibsys-d.primo.exlibrisgroup.com/discovery/search?vid=47BIBSYS_UBB%3AUBB&lang=en&tab=default_slot&search_scope=MyInst_and_CI'

def oria(query=''):
    return ORIA + ('&' + urlencode({'query': 'any,contains,' + query}) if query else '')

def apply(root, paths=None):
    for path in paths or sorted((root/'labs').glob('*.html')):
        raw = path.read_text(encoding='utf-8')
        if 'studio.js' not in raw and 'class="studio' not in raw: continue
        def link(match):
            url = unescape(match[1]); parts = urlsplit(url)
            if parts.hostname not in ['oria.no','www.oria.no']: return match[0]
            query = parse_qs(parts.query).get('query',[''])[0]
            words = query.split(',',2)[-1] if query else ''
            return 'href="' + escape(oria(words),quote=True) + '"'
        raw = re.sub(r'href="([^"]+)"', link, raw)
        raw = re.sub(r'<script\b[^>]*src="lab-links\.js[^\"]*"[^>]*>\s*</script>\s*','',raw)
        raw = re.sub(r'src="studio\.js(?:\?[^\"]*)?"','src="studio.js?v=20261029-links"',raw)
        raw = re.sub(r'src="research-finder\.js(?:\?[^\"]*)?"','src="research-finder.js?v=3"',raw)
        raw = raw.replace('</head>','<script defer="" src="lab-links.js?v=1"></script></head>',1)
        path.write_text(raw,encoding='utf-8',newline='\n')

if __name__ == '__main__': apply(Path(__file__).resolve().parents[1])
