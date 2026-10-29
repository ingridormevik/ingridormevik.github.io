"""Halloween entrance, route picker and shared final-assignment navigation.

Run after the lesson generators. Existing IDs, learning activities and progress stay intact.
"""
from pathlib import Path
import re
from bs4 import BeautifulSoup
from lab4_walkthrough import TURING_HEAD


def illustration(root):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 620">
<defs>{TURING_HEAD}<pattern id="floor" width="100" height="50" patternUnits="userSpaceOnUse"><rect width="100" height="50" fill="#30413e"/><path d="M0 0h50v25H0zm50 25h50v25H50z" fill="#46554c"/></pattern><pattern id="wall" width="80" height="50" patternUnits="userSpaceOnUse"><path d="M0 50h80M40 0v50" fill="none" stroke="#36404d" stroke-width="2"/></pattern></defs>
<rect width="1200" height="620" fill="#161e2b"/><rect width="1200" height="500" fill="url(#wall)"/>
<path d="M0 72Q600-80 1200 72M26 72v408m1148-408v408" fill="none" stroke="#090e17" stroke-width="26"/>
<path d="M0 72Q600-80 1200 72M26 72v408m1148-408v408" fill="none" stroke="#65736b" stroke-width="10"/>
<path d="M0 486h1200v134H0z" fill="url(#floor)"/><path d="M0 486h1200" stroke="#090e17" stroke-width="12"/>
<g stroke="#090e17" stroke-width="6" stroke-linejoin="round">
<path d="M475 366V190a125 125 0 0 1 250 0v176Z" fill="#709a9b"/><path d="M493 350V190a107 107 0 0 1 214 0v160Z" fill="#22334b"/>
<g class="hh-moon"><circle cx="653" cy="164" r="49" fill="#f1deb1"/><path d="M670 116a50 50 0 0 0 20 87 48 48 0 0 1-20-87Z" fill="#22334b" stroke="none"/></g>
<path d="M600 88v262m-106-95h213" fill="none" stroke="#709a9b" stroke-width="9"/>
<path d="m508 168 12-10 10 10 10-10 13 10m73 54 12-10 10 10 10-10 13 10" fill="none" stroke="#090e17" stroke-width="5"/>
<rect x="75" y="150" width="304" height="325" rx="3" fill="#76568d"/><rect x="821" y="150" width="304" height="325" rx="3" fill="#76568d"/>
<path d="M90 256h274M90 354h274M90 454h274M836 256h274M836 354h274M836 454h274" stroke="#c79f67" stroke-width="12"/>
<rect x="505" y="35" width="190" height="74" rx="3" fill="#e3c18a"/>
<rect x="547" y="39" width="77" height="67" fill="#eee3c9"/>
</g><use href="#l4h-head" x="553" y="41" width="65" height="64"/>
<g fill="#0c1820" font-family="monospace" font-weight="800"><text x="631" y="64" font-size="17">A.T.</text><text x="631" y="87" font-size="12">LIBRARY</text></g>'''
    palette=['#c6ef77','#f1c75a','#74c5d5','#ea8fba','#a99bd9','#e8daa9']
    for side in [0,746]:
        for row,y in enumerate([171,271,369]):
            for i in range(8):
                x=92+side+i*33
                h=62+(i*7+row*9)%19
                colour=palette[(i+row)%len(palette)]
                svg+=f'<g stroke="#090e17" stroke-width="4"><rect x="{x}" y="{y+80-h}" width="26" height="{h}" rx="2" fill="{colour}"/><path d="M{x+5} {y+90-h}h16m-16 8h16" stroke="#0c1820" stroke-width="2"/></g>'
    svg+='''<g stroke="#090e17" stroke-width="6" stroke-linejoin="round">
<path d="m352 220-55 285m89-273-55 285m-18-262 34 7m-46 43 34 7m-44 44 34 7m-44 42 34 7m-43 43 34 7" fill="none" stroke="#cba270"/>
<path d="M433 404h334v35H433zM461 439v106m278-106v106" fill="#b58b61"/>
<rect x="486" y="300" width="210" height="106" rx="9" fill="#849c9b"/><rect x="500" y="312" width="182" height="76" fill="#10272b"/>
<g class="hh-code"><path d="m516 328 12 9-12 9m26 2h55m-82 16h123m-124 12h76" stroke="#c6ef77" stroke-width="5" fill="none"/></g>
<circle class="hh-led" cx="666" cy="399" r="5" fill="#c6ef77" stroke-width="2"/>
<path d="m458 389 39 8-7 15-42-9Zm244-25 42-7 10 37-40 6Z" fill="#e1d9bc"/>
<path d="M726 329v-41m-10 2h20" stroke="#c6b88f"/><path d="M723 282q-9-13 3-26 13 17 3 27" fill="#f2c369" stroke-width="3"/>
<path d="M72 425q0-42 48-42 52 0 52 42 0 43-50 43-50 0-50-43Z" fill="#d98b4b"/><path d="m117 383 4-18 16-5" fill="none" stroke="#88a474" stroke-width="9"/><path d="m90 412 16-13 7 17m15 0 8-17 18 13m-59 23 16 10 20-2 19-12" fill="#17222d" stroke-width="3"/>
<path d="M1037 425q0-39 44-39 48 0 48 39 0 39-46 39-46 0-46-39Z" fill="#d98b4b"/><path d="m1080 386 3-15 13-4" fill="none" stroke="#88a474" stroke-width="8"/><path d="m1051 414 15-10 6 14m11 0 7-14 16 10m-49 20 13 9 16-1 14-11" fill="#17222d" stroke-width="3"/>
<g class="hh-ghost"><path d="M853 460v-54q0-38 35-38 35 0 35 38v54l-17-10-17 10-18-10Z" fill="#e5e5cf"/><g class="hh-eyes"><ellipse cx="876" cy="410" rx="4" ry="8" fill="#14232d"/><ellipse cx="901" cy="410" rx="4" ry="8" fill="#14232d"/></g></g>
<g transform="translate(0 -58)"><path d="m191 507 12-35 19 13 20-13 11 35v30q-30 18-62 0Z" fill="#182634"/><path d="m206 510 7 1m17-1 7 1" stroke="#d9dc88" stroke-width="4"/><path d="M249 531q54-39 56-5 1 24-37 22" fill="none"/></g>
<g transform="translate(0 -58)"><path d="m950 522 45-25 60 19-47 28Z" fill="#e9d9ab"/><path d="m950 522 1 13 55 21 49-27v-13m-49 28v12" fill="#9e829f"/></g>
<g class="hh-book"><path d="m390 164 32-10 20 45-35 11Z" fill="#e6cb8f"/><path d="m399 173 16-6m-12 15 18-6" stroke-width="3"/></g>
<g transform="translate(410 342)"><g class="hh-gear"><circle r="27" fill="#d8ac60" stroke-dasharray="9 5" stroke-width="9"/><circle r="16" fill="#543f68"/><path d="M-21 0h42M0-21v42" stroke-width="4"/><circle r="5" fill="#101d25"/></g></g>
<g transform="translate(784 317)"><g class="hh-gear hh-reverse"><circle r="23" fill="#c6ef77" stroke-dasharray="8 5" stroke-width="8"/><circle r="13" fill="#543f68"/><path d="M-18 0h36M0-18v36" stroke-width="4"/></g></g>
<g class="hh-bat"><path d="m751 137 22 8 11-25 11 25 24-8-13 25-22-7-22 7Z" fill="#101722" stroke="#a999c1" stroke-width="2"/></g>
<g class="hh-bat hh-bat-two"><path d="m349 93 18 7 9-19 9 19 18-7-10 21-17-6-17 6Z" fill="#101722" stroke="#a999c1" stroke-width="2"/></g>
<path d="M33 82 146 152M33 82l15 135M33 82l116 19M46 107q16-5 23-2m-18 28q35-14 47-9m-43 39q48-25 67-25" fill="none" stroke="#a999c1" stroke-width="2"/>
<g class="hh-spider"><path d="M1099 81v57" fill="none" stroke="#b7b4c5" stroke-width="2"/><ellipse cx="1099" cy="147" rx="12" ry="14" fill="#101722"/><path d="m1089 139-14-9m13 18-17-1m18 10-14 11m34-29 14-9m-13 18 17-1m-18 10 14 11" fill="none" stroke-width="3"/><circle cx="1095" cy="144" r="2" fill="#c6ef77" stroke="none"/><circle cx="1103" cy="144" r="2" fill="#c6ef77" stroke="none"/></g>
</g>
<g font-family="monospace" font-weight="800" font-size="14" fill="#f1dfb8"><text x="93" y="137">STORIES / GAMES / ART / CODE</text><text x="838" y="137">SOUND / DATA / PEOPLE / POWER</text></g>
<g fill="#f4db9e"><circle cx="428" cy="124" r="3"/><circle cx="762" cy="169" r="3"/><path d="M775 252v14m-7-7h14M425 308v12m-6-6h12" stroke="#f4db9e" stroke-width="3"/></g>
</svg>'''
    # Flat SVG primitives also render correctly in readers without pattern/symbol support.
    portrait=TURING_HEAD.split('>',1)[1].rsplit('</symbol>',1)[0]
    svg=svg.replace('<use href="#l4h-head" x="553" y="41" width="65" height="64"/>','<g transform="translate(553 41) scale(.43) translate(-196 -86)">'+portrait+'</g>')
    svg=svg.replace('fill="url(#wall)"','fill="#1c2935"').replace('fill="url(#floor)"','fill="#30413e"')
    wall=''.join(f'<path d="M0 {y}h1200" stroke="#36404d" stroke-width="2"/>' for y in range(50,486,50))
    wall+=''.join(f'<path d="M{x} 0v486" stroke="#36404d" stroke-width="1"/>' for x in range(40,1200,80))
    svg=svg.replace('<rect width="1200" height="500" fill="#1c2935"/>','<rect width="1200" height="500" fill="#1c2935"/>'+wall)
    floor=''.join(f'<rect x="{x}" y="{y}" width="50" height="25" fill="#46554c"/>' for row,y in enumerate(range(486,620,25)) for col,x in enumerate(range(0,1200,50)) if (row+col)%2==0)
    svg=svg.replace('<path d="M0 486h1200v134H0z" fill="#30413e"/>','<path d="M0 486h1200v134H0z" fill="#30413e"/>'+floor)
    (root/'labs/turing-halloween-library.svg').write_text(svg,encoding='utf-8',newline='\n')


PLANS = '''<section class="hl-route-picker" aria-labelledby="hl-route-title" data-hl-picker>
<div class="hl-picker-heading"><div><p class="hl-kicker">WHAT WOULD FEEL USEFUL TODAY?</p><h2 id="hl-route-title">Pick a door. Change your mind whenever you like.</h2></div></div>
<div class="hl-route-buttons" role="group" aria-label="Choose today's route" data-hl-controls hidden><button type="button" data-hl-route="build" aria-pressed="true">Build in the lab</button><button type="button" data-hl-route="browse" aria-pressed="false">Browse the library</button><button type="button" data-hl-route="mix" aria-pressed="false">A bit of both</button></div>
<article class="hl-plan" data-hl-plan="build"><span class="hl-plan-icon" aria-hidden="true">01 / THE WORKBENCH</span><h3>Make one small thing work.</h3><p>Stay in our usual lab room. Open your project, choose a change and help each other try it. Bring the unfinished version.</p><ol><li>Open the work you already have.</li><li>Build or repair one manageable part.</li><li>Let a neighbour try it, then save.</li></ol><a class="hl-launch" href="#lab-5-workbench" data-hl-launch>Open my Friday workbench →</a></article>
<article class="hl-plan" data-hl-plan="browse"><span class="hl-plan-icon" aria-hidden="true">02 / THE RESEARCH SHELVES</span><h3>Take something you made into the library.</h3><p>You can create first and find research afterwards. Start with one scene, sound, screen or interaction, then investigate what it does and what it might mean.</p><ol><li>Bring one part of your creation, or an interest to explore.</li><li>Notice something, then find a useful book or article.</li><li>Bring an idea back to your work and keep its reference.</li></ol><a class="hl-launch" href="academic-library.html#library-session" data-hl-launch>Enter library lab mode →</a><a class="hl-small-link" href="#library-shelf-route">Help me find a physical book</a></article>
<article class="hl-plan" data-hl-plan="mix"><span class="hl-plan-icon" aria-hidden="true">03 / THE CONNECTING PASSAGE</span><h3>Let an idea travel between the two.</h3><p>Build a little, find something to read, then use it to see your project differently. You choose how to split the session.</p><ol><li>Choose a question from your project.</li><li>Find a source that helps you investigate it.</li><li>Try one change or question one design choice.</li></ol><a class="hl-launch" href="#lab-5-workbench" data-hl-launch>Open the project + research route →</a><a class="hl-small-link" href="academic-library.html#research-finder">Find research words for my idea</a></article>
<p class="hl-route-status" data-hl-route-status role="status">All three routes are open. The library visit is optional.</p>
</section>'''


def entrance(library=False):
    title="Alan Turing's haunted library." if library else "Turing's haunted library."
    lead=('Games, stories, art, sound, code, data and power. Bring something you want to understand. Start with one shelf and follow your curiosity.' if library else 'Stay and build, explore research, or mix the two. Bring what you have. We will work things out together.')
    return f'''<section class="hl-entrance" id="{'library-entrance' if library else 'programme'}" aria-labelledby="{'hl-library-title' if library else 'hl-title'}">
<div class="hh-slime" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
<div class="hl-topline"><p class="hl-kicker">DIKULT105 / HALLOWEEN EDITION · FRIDAY 30 OCTOBER</p><span class="hl-open-sign">ALL DOORS OPEN</span><button type="button" data-hl-calm aria-pressed="false" hidden>Quiet the room</button></div>
<h1 id="{'hl-library-title' if library else 'hl-title'}">{title}</h1><p class="hl-lead">{lead}</p>
<div class="hl-scene"><img src="turing-halloween-library.svg" width="1200" height="620" alt="A Halloween library with research shelves, Turing's illustrated portrait, a code machine, pumpkin lanterns, a book ghost and a black cat."/>
<nav class="hl-map-doors" aria-label="Explore the Halloween library"><a href="{'lab-programme.html#lab-5-workbench' if library else '#lab-5-workbench'}"><span aria-hidden="true">01</span><strong>The workbench</strong><small>Your project, your next step</small></a><a href="{'#library-session' if library else 'academic-library.html#library-session'}"><span aria-hidden="true">02</span><strong>Library lab mode</strong><small>Make, notice, research, connect</small></a><a href="final-assessment.html#brief"><span aria-hidden="true">03</span><strong>Final Assignment</strong><small>Take a look at where this goes</small></a></nav></div>
<div class="hl-familiar"><div class="hh-machine-controls"><button type="button" data-hh-wake aria-pressed="false" hidden>Wake the machine</button><button type="button" data-hl-familiar aria-label="Ask the library familiar for a little guidance" hidden><span aria-hidden="true">✦</span> Ask the book ghost</button></div><p data-hl-hint role="status">{'You can combine subjects. A genre is a useful starting point, not a box.' if library else 'One useful next step is plenty. Choose a route below and take your time.'}</p></div>
{'<p class="hl-library-return"><a href="lab-programme.html#programme">Back to today’s Halloween map</a> · <a href="final-assessment.html#brief">Look at the Final Assignment</a></p>' if library else ''}
</section>'''


def navigation(page):
    nav=page.select_one('.studio-header nav')
    if not nav:return
    for link in list(nav.select('a')):
        if link.get('href','').split('#')[0].split('/')[-1]=='meet-ingrid.html' or link.get_text(' ',strip=True).lower()=='lab assistant':link.decompose()
    final=nav.select_one('a[href^="final-assessment.html"]')
    if not final:
        final=page.new_tag('a');nav.insert(1,final)
    final['href']='final-assessment.html#brief'
    final.clear();final.append('Final Assignment ')
    badge=page.new_tag('span',attrs={'class':'hl-new'});badge.string='NEW';final.append(badge)
    final['class']=['hl-final-tab']
    library=nav.select_one('a[href^="academic-library.html"]')
    if not library:
        library=page.new_tag('a');nav.insert(2,library)
    library['href']='academic-library.html#library-session'
    library.string="Turing's Library"


def assets(page):
    classes=page.body.get('class',[])
    if 'hl-season' not in classes:classes.append('hl-season')
    page.body['class']=classes
    for old in page.select('link[href^="halloween-library.css"],script[src^="halloween-library.js"]'):old.decompose()
    style=page.new_tag('link',rel='stylesheet',href='halloween-library.css?v=2')
    access=page.select_one('link[href^="accessibility.css"]')
    if access:access.insert_before(style)
    else:page.head.append(style)
    page.head.append(page.new_tag('script',src='halloween-library.js?v=2',defer=''))


def living_scene(page,root):
    image=page.select_one('.hl-scene>img')
    if not image:return
    drawing=BeautifulSoup((root/'labs/turing-halloween-library.svg').read_text(encoding='utf-8'),'html.parser').svg
    for defs in drawing.select('defs'):defs.decompose()  # All geometry is flattened; avoid shared symbol IDs.
    drawing.attrs.update({'class':['hh-drawing'],'role':'img','aria-label':image['alt'],'focusable':'false','width':'1200','height':'620'})
    image.replace_with(drawing)


def apply(root):
    illustration(root)
    p=root/'labs/lab-programme.html';s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
    s.title.string="Halloween lab | Alan Turing's library | DIKULT105"
    if not s.find(id='all-labs'):
        old=s.find(id='programme');old['id']='lab-archive'
        if old.h1:old.h1.name='h2'
        drawer=s.new_tag('details',attrs={'class':'hl-archive','id':'all-labs'})
        summary=s.new_tag('summary');summary.string='All eight Fridays + your saved lab progress';drawer.append(summary)
        old.replace_with(drawer);drawer.append(old)
        for node in list(s.select('#road-to-50,.lab-legends-ticker')):drawer.append(node.extract())
        drawer.insert_before(BeautifulSoup(entrance()+PLANS,'html.parser'))
    else:
        s.find(id='programme').replace_with(BeautifulSoup(entrance(),'html.parser').find())
        s.select_one('.hl-route-picker').replace_with(BeautifulSoup(PLANS,'html.parser').find())
    # The publishing screenshot belongs with optional publishing, rather than the Friday research route.
    resource=s.select_one('#lab-5 .resources')
    for figure in list(resource.select('figure')):
        if 'GitHub' in figure.get_text():figure.decompose()
    for li in list(resource.select('li')):
        if li.select_one('a[href^="github-guide"]'):li.decompose()
    pv=s.find(id='project-research-lab')
    pv.select_one('.pv-tag').string="TURING'S LIBRARY / THREE WAYS TO SPEND FRIDAY"
    pv.select_one('#pv-title').string='Pick a room. Make yourself at home.'
    if not s.find(id='hl-final-invitation'):
        pv.append(BeautifulSoup('<aside class="hl-final-invitation" id="hl-final-invitation"><p class="hl-kicker">THE NEXT CHAPTER</p><h4>You can peek at the Final Assignment today.</h4><p>Open the brief to see the direction your project could take. Then return to your own next step. The Final Assignment tab stays in the navigation.</p><a href="final-assessment.html#brief">Open the Final Assignment →</a></aside>','html.parser').find())
    navigation(s);assets(s);living_scene(s,root);p.write_text(str(s),encoding='utf-8',newline='\n')
    p=root/'labs/academic-library.html';s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
    if not s.select_one('.lq-on'):
        from library_quest import build
        build(root);s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
    s.title.string="Alan Turing's library | Digital culture research"
    hero=s.select_one('.al-hero') or s.find(id='library-entrance')
    history=hero.select_one('.lc-history')
    if history:
        for paragraph in list(history.select('p')):
            if 'nechvatal' in paragraph.get_text().lower():paragraph.decompose()
        history.extract()
    replacement=BeautifulSoup(entrance(True),'html.parser').find();replacement['class'].append('al-hero')
    replacement.name='header'
    if history:replacement.append(history)
    hero.replace_with(replacement)
    navigation(s);assets(s);living_scene(s,root);p.write_text(str(s),encoding='utf-8',newline='\n')
    for name in ['final-assessment.html','tools.html']:
        p=root/'labs'/name;raw=p.read_text(encoding='utf-8');s=BeautifulSoup(raw,'html.parser')
        if name=='final-assessment.html':s.title.string='Final Assignment | DIKULT105'
        navigation(s);assets(s)
        # Keep the assessment and equipment content byte-for-byte; replace only their chrome.
        raw=re.sub(r'<head\b[^>]*>.*?</head>',lambda _:str(s.head),raw,count=1,flags=re.S)
        raw=re.sub(r'<header\b[^>]*class="[^"]*\bstudio-header\b[^"]*"[^>]*>.*?</header>',lambda _:str(s.select_one('.studio-header')),raw,count=1,flags=re.S)
        raw=re.sub(r'<body\b[^>]*>',lambda m:re.sub(r'class="[^"]*"','class="'+' '.join(s.body['class'])+'"',m[0]),raw,count=1)
        p.write_text(raw,encoding='utf-8',newline='\n')
    from library_session import build
    build(root)
    from remove_lab_assistant import remove
    remove(root)
    from research_guide import build as research_guide
    research_guide(root)
    from lab_links import apply as lab_links
    lab_links(root)


if __name__=='__main__':
    apply(Path(__file__).resolve().parents[1])
