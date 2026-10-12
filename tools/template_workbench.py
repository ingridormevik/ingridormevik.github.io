"""Connect template experiments to the existing Construct labs."""
from bs4 import BeautifulSoup

def templates(root):
    labs = root / 'labs'
    path = labs / 'construct-templates.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    for old in s.select('[data-template-workbench]'): old.decompose()
    s.select_one('.intro h1').clear()
    s.select_one('.intro h1').append(BeautifulSoup('Six templates.<br/><em>Choose what you want to build.</em>', 'html.parser'))
    s.select_one('.tp-routes').insert_before(BeautifulSoup('''<section class="tp-workbench" data-template-workbench><p class="tp-label">YOUR NEXT BUILD / CHOOSE A ROUTE</p><h2>Open it. Try it. Change one thing.</h2><p>These are the projects you use in the Construct labs. Start with the map in Lab 3, then explore rooms and rules in Lab 4. The other routes are optional experiments inside your project time.</p><div class="tp-build-path"><a href="lab-programme.html#mapping-first-contact"><b>LAB 3 / FIRST BUILD</b><strong>Make a place reveal a thought</strong><span>Mapping template → text, tap and a hidden response</span></a><a href="lab-programme.html#construct-rooms"><b>LAB 4 / ROOM REPAIR</b><strong>Get out and find your way back</strong><span>Movement template → arrows, rules and destinations</span></a><a href="library-lab.html#construct-build"><b>CONTINUE YOUR PROJECT</b><strong>Give it a second response</strong><span>Your saved map → two discoveries that work together</span></a></div></section>''', 'html.parser').find())
    tasks = [
        ('tpl-students','SCENE BUILDER','Move a prop inside North. Preview. Move it outside again and compare.','The layout decides what the visitor can see.','lab-programme.html#construct-rooms'),
        ('tpl-full','RULE DETECTIVE','Preview and tap the cupboard twice. Open its event sheet and find the tap condition and the cupboardOpen variable.','The variable remembers which cupboard state is showing.','lab-programme.html#construct-rooms'),
        ('tpl-move','EXIT REPAIR','Travel from North to East. Repair the return arrow, then test the round trip.','A visible arrow needs a rule and the right destination.','lab-programme.html#construct-rooms'),
        ('tpl-redaction','HIDDEN WORDS','Preview the collision that reveals the text. Change the hidden words and test again.','You can change the meaning while keeping the interaction.','lab-programme.html#lab-4-sec-3'),
        ('tpl-map','PLACE MAKER','Choose a map and add one sentence about a place you know. Preview, then build the tap reveal.','Text placement and interaction can tell a nonlinear story.','lab-programme.html#mapping-first-contact'),
        ('tpl-npc','VOICE REMIX','Tap MainCharacter. Change one word choice in NewArray.json. Preview and tap several times.','Different word choices change the sentences your project can produce.','lab-programme.html#lab-3-sec-3')]
    for ident,tag,task,learn,href in tasks:
        section = s.select_one('#'+ident)
        section.select_one('h2,h3').insert_after(BeautifulSoup(f'<aside class="tp-workbench tp-experiment" data-template-workbench><p class="tp-label">{tag}</p><h4>Your first experiment</h4><p>{task}</p><p><strong>Notice:</strong> {learn}</p><a href="{href}">Use this in the lab →</a></aside>', 'html.parser').find())
    for old in s.select('link[href^="template-workbench.css"]'): old.decompose()
    s.head.append(BeautifulSoup('<link rel="stylesheet" href="template-workbench.css?v=1"/>','html.parser').find())
    path.write_text(str(s), encoding='utf-8', newline='\n')
