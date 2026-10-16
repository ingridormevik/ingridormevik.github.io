"""Isolate the library from unrelated guide-page styles and compile one theme."""
from bs4 import BeautifulSoup

FIXES = '''
/* Library surfaces: every foreground is paired with a background. */
body.studio.page-academic-library{margin:0;background:#15313e;background-image:radial-gradient(#91b7bf22 1px,transparent 1px);background-size:24px 24px;color:#f2f5ed;font-family:'Segoe UI',Arial,sans-serif}
.studio.page-academic-library .al-library{--library-ink:#172c34;--library-paper:#f4f1fc}
.studio.page-academic-library .al-hero{background:#1e3b49;box-shadow:6px 6px 0 #081b26;border-color:#081b26;display:block}
.studio.page-academic-library .al-hero h1{font-weight:900;max-width:20ch}
.studio.page-academic-library .al-hero nav{border-top:1px solid #76939f;padding-top:20px}
.studio.page-academic-library :is(.al-reading,.al-atlas){background:#1e3b49;border:3px solid #081b26;box-shadow:5px 5px 0 #081b26;padding:clamp(20px,4vw,36px);margin:32px 0;color:#f2f5ed}
.studio.page-academic-library :is(.al-reading,.al-atlas)>:is(p,h2,h3,label,ol,ul),.studio.page-academic-library .al-reading>ol>li{color:#f2f5ed}
.studio.page-academic-library :is(.al-reading,.al-atlas)>p.al-tag{display:inline-block;background:#d4f47d;color:#172c34;padding:6px 10px;margin:0 0 14px;border:2px solid #081b26}
.studio.page-academic-library :is(.al-reading,.al-atlas)>p :is(a,strong,code),.studio.page-academic-library .al-reading>ol :is(strong,code),.studio.page-academic-library .al-reading>a{color:#ffdf48}
.studio.page-academic-library .al-reading>ol{padding-left:26px}
.studio.page-academic-library :is(.ge-card,.al-book,.al-pride,.ae-try,.pa-routes>section){background:#f4f1fc;border-color:#081b26;color:#172c34}
.studio.page-academic-library :is(.ge-card,.al-book,.al-pride,.ae-try,.pa-routes>section) :is(p,h2,h3,h4,label,summary,strong,span,small,code,blockquote){color:#172c34}
.studio.page-academic-library :is(.ge-card,.al-book,.al-pride,.ae-try,.pa-routes>section) a{color:#47287a}
.studio.page-academic-library .al-book details{background:#fff;border:1px solid #9b95ab;border-radius:0;padding:0;margin-top:22px;color:#172c34}
.studio.page-academic-library .al-book details summary{background:#e8e0f4;color:#172c34;padding:16px;min-height:48px}
.studio.page-academic-library .al-book details[open]>summary{color:#47287a;border-bottom:1px solid #9b95ab}
.studio.page-academic-library .al-book details>:is(p,a){margin:16px;display:block}
.studio.page-academic-library .ge-card{border-radius:0;box-shadow:4px 4px 0 #081b26}
.studio.page-academic-library .ge-card summary{padding:20px;margin:0;background:#f4f1fc;color:#172c34}
.studio.page-academic-library .ge-card[open]>summary{background:#e8e0f4;color:#172c34}
.studio.page-academic-library .ge-card-body{margin:0;background:#fff;color:#172c34}
.studio.page-academic-library .ge-filters button{border-radius:0;box-shadow:3px 3px 0 #081b26;background:#f4f1fc;color:#172c34}
.studio.page-academic-library .ge-filters button[aria-pressed=true]{background:#d4f47d;color:#172c34}
.studio.page-academic-library :is(#ge-count,#al-genre-count){color:#eef5ed;font:700 15px/1.6 monospace}
.studio.page-academic-library .ge-mix{background:#edf3df;color:#172c34;margin:30px 0}
.studio.page-academic-library .ge-mix :is(h3,p,code,strong){color:#172c34}
.studio.page-academic-library .ge-explorer>section:not(.ge-mix)>:is(p,h3){color:#eef5ed}
.studio.page-academic-library .ge-explorer>section:not(.ge-mix) a{color:#ffdf48}
.studio.page-academic-library .ge-full-table{background:#1e3b49;border-radius:0}
.studio.page-academic-library .ge-full-table>summary{background:#1e3b49;color:#ffdf48;padding:20px}
.studio.page-academic-library .ge-full-table .al-atlas{margin:0}
.studio.page-academic-library .al-table-scroll{background:#fff;color:#172c34;min-width:0}
.studio.page-academic-library .al-table-scroll :is(td,th,code,p,strong,small){color:#172c34}
.studio.page-academic-library .al-table-scroll thead th{background:#203d49;color:#fff}
.studio.page-academic-library .al-table-scroll a{color:#47287a}
.studio.page-academic-library .rf-workshop fieldset{background:#f4f1fc;border:2px solid #081b26;margin-top:26px}
.studio.page-academic-library .rf-workshop legend{background:#d4f47d;padding:8px 14px;border:2px solid #081b26;color:#172c34;font:800 20px/1.4 'Segoe UI',Arial,sans-serif}
.studio.page-academic-library .rf-workshop fieldset :is(p,span,label){color:#172c34}
.studio.page-academic-library .rf-workshop .rf-step-bar{background:#102936;border:1px solid #76939f}
.studio.page-academic-library #rf-result{background:#edf3df;color:#172c34}
.studio.page-academic-library #rf-result :is(p,h3,h4,strong){color:#172c34}
.studio.page-academic-library #rf-result a{color:#47287a}
.studio.page-academic-library .rf-workshop button:disabled{opacity:.6;box-shadow:none}
.studio.page-academic-library .ae-demo[data-ae-preview=arcade] :is(p,h4){color:#fff}
.studio.page-academic-library .ae-demo[data-ae-preview=arcade] a{background:#ffdf48;color:#172c34}
.studio.page-academic-library .al-library :is(input,select){color-scheme:light}
.studio.page-academic-library .al-library :focus-visible{outline:3px solid #ff83bd;outline-offset:4px}
.studio.page-academic-library .al-library>section{scroll-margin-top:24px}
@media(max-width:600px){.studio.page-academic-library main{padding:0 12px}.studio.page-academic-library :is(.al-hero,.al-reading,.al-atlas,.al-book,.ge-card){box-shadow:none}.studio.page-academic-library .al-hero nav{display:grid;grid-template-columns:1fr 1fr}.studio.page-academic-library .al-hero nav a{font-size:14px}.studio.page-academic-library .al-library h1{font-size:36px}.studio.page-academic-library .ge-cards{grid-template-columns:1fr}}
.access-calm .studio.page-academic-library :is(.al-hero,.al-reading,.al-atlas,.al-book,.ge-card){box-shadow:none}
'''

def theme(root):
    labs=root/'labs'
    sources=['academic-library.css','genre-atlas.css','genre-explorer.css','library-workshop.css']
    text='/* Generated by tools/library_theme.py. Edit the source styles, then rebuild. */\n'
    text+='\n'.join((labs/name).read_text(encoding='utf-8') for name in sources)+FIXES
    (labs/'academic-library-theme.css').write_text(text,encoding='utf-8',newline='\n')
    path=labs/'academic-library.html'
    s=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    # The standalone reading page needs the shared header, not lesson/arena layouts.
    for link in s.select('link[rel="stylesheet"]'):
        if link.get('href','').split('?')[0] not in ['studio.css','accessibility.css']:link.decompose()
    access=s.select_one('link[href^="accessibility.css"]')
    link=s.new_tag('link',rel='stylesheet',href='academic-library-theme.css?v=readable-6')
    if access: access.insert_before(link)
    else: s.head.append(link)
    path.write_text(str(s),encoding='utf-8',newline='\n')
