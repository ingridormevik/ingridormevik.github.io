"""Keep workshop navigation and the student route consistent."""
from bs4 import BeautifulSoup

def connect(root):
    labs = root / 'labs'
    routes = {
        'javascript-construct.html': (['step-1','step-2','step-3','step-4'],'lab-programme.html#javascript-first-contact','lab-programme.html#lab-2-sec-3'),
        'vibecoding.html': (['vw-start','vw-create','vw-test','vw-remix'],'lab-programme.html#lab-2-sec-1','lab-programme.html#lab-2-sec-3'),
        'construct-guide.html': (['step-1','step-2','step-3','step-4','step-5'],'lab-programme.html#mapping-first-contact','library-lab.html#construct-open'),
        'library-lab.html': (['construct-open','construct-plan','construct-build','construct-choice','construct-test'],'lab-programme.html#mapping-first-contact','lab-programme.html#construct-rooms'),
        'publish-guide.html': (['export','choose-host'],'lab-programme.html#lab-5','publish-guide.html#choose-host')}
    for name, (ids,start,finish) in routes.items():
        path = labs / name
        s = BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
        for old in s.select('[data-step-links]'): old.decompose()
        for i,ident in enumerate(ids):
            prev = '#'+ids[i-1] if i else start
            nxt = '#'+ids[i+1] if i+1<len(ids) else finish
            if name == 'publish-guide.html' and ident == 'choose-host':
                nxt = '#itch'
                label = 'Choose itch.io or GitHub above; itch.io instructions ↓'
            else: label = 'Next step →' if i+1<len(ids) else 'Continue in my project →'
            node = s.select_one('#'+ident)
            node.append(BeautifulSoup(f'<nav class="workshop-step-links" aria-label="Step navigation" data-step-links><a href="{prev}">← Previous step</a><a href="{nxt}">{label}</a></nav>','html.parser').find())
        if name == 'publish-guide.html':
            for ident,prev,nxt in [('itch','#choose-host','#screenshots'),('github','#choose-host','#screenshots'),('screenshots','#choose-host','#final-test'),('final-test','#screenshots','lab-programme.html#lab-5-finish')]:
                s.select_one('#'+ident).append(BeautifulSoup(f'<nav class="workshop-step-links" aria-label="Step navigation" data-step-links><a href="{prev}">← Previous step</a><a href="{nxt}">Next step →</a></nav>','html.parser').find())
        if name == 'construct-guide.html':
            for a in s.select('a[href="javascript-construct.html"]'):
                a['href']='library-lab.html#construct-open'
                a.string='Continue: build a second response →'
        for text in s.find_all(string=True):
            if 'Return to my Lab 2 project and note' in str(text):
                text.replace_with('Return to my Lab 2 project')
        for old in s.select('link[href^="workshop-step-links.css"]'): old.decompose()
        s.head.append(BeautifulSoup('<link rel="stylesheet" href="workshop-step-links.css?v=1"/>','html.parser').find())
        path.write_text(str(s),encoding='utf-8',newline='\n')
    path = labs / 'lab-programme.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    replacements = {'Confirm your arrival note':'Open your project','Save, reflect and finish':'Save and finish','Save and make a note':'Save and test your work','Save your work and make a short note about what you tried and what you want to do next.':'Save your project files. Try the main interaction once more and check that the saved version works.','Do: Save your work and make a short note about what you tried and what you want to do next. Note any blocker accurately.':'Do: Save your project files and test the main interaction. Ask for help if it still does not work.'}
    for text in s.find_all(string=True):
        if str(text).strip() in replacements: text.replace_with(replacements[str(text).strip()])
    for old in s.select('link[href^="workshop-step-links.css"]'): old.decompose()
    s.head.append(BeautifulSoup('<link rel="stylesheet" href="workshop-step-links.css?v=1"/>','html.parser').find())
    path.write_text(str(s),encoding='utf-8',newline='\n')
